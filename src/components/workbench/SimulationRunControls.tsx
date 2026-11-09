import { useState } from 'preact/hooks';
import type { WorkbenchSimulation } from '../../lib/workbench-simulation';
import { advanceOption, stageCard } from '../../lib/simulation-machine';

export function SimulationRunControls({
  simulation,
  onAdvance,
  onPause,
  onResume,
  onCancel,
  onRestart,
  onDiscard,
}: {
  simulation: WorkbenchSimulation;
  onAdvance: (action: import('../../lib/workbench-simulation').SimulationAction) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: (note: string) => void;
  onRestart: () => void;
  onDiscard: () => void;
}) {
  const [note, setNote] = useState('');
  const [evidence, setEvidence] = useState('');
  const [outcome, setOutcome] = useState<'proceed' | 'blocked'>('proceed');
  const [acceptance, setAcceptance] = useState<'accepted' | 'returned' | 'rejected'>('accepted');
  const card = stageCard(simulation.stage);
  const isActive = simulation.status === 'active';
  const deliveryEvidence = evidence.split('\n').map(item => item.trim()).filter(Boolean);
  const gateOutcome =
    simulation.stage === 'delivery_simulated' ? acceptance : outcome;
  const advance = advanceOption(
    simulation.stage,
    simulation.status,
    note,
    deliveryEvidence,
    gateOutcome,
  );

  function handleAdvance() {
    if (!advance || advance.disabled) return;
    onAdvance(advance.action);
    setNote('');
    if (simulation.stage === 'delivery_simulated') setAcceptance('accepted');
    else setOutcome('proceed');
  }

  function discard() {
    if (window.confirm('Discard this simulation record? The Console, Commons, and asset records will remain unchanged.')) {
      onDiscard();
    }
  }

  if (simulation.status === 'paused') {
    return (
      <section aria-labelledby="workbench-sim-run-title" className="workbench-sim-run">
        <p className="workbench-sim-kicker">SIMULATION PAUSED</p>
        <h2 id="workbench-sim-run-title">Resume or end this run</h2>
        <div className="workbench-sim-run-actions">
          <button className="workbench-sim-primary" onClick={onResume} type="button">Resume</button>
          <button className="workbench-sim-secondary" onClick={() => onCancel('Simulation cancelled by user.')} type="button">Cancel run</button>
        </div>
      </section>
    );
  }

  if (!isActive) {
    return (
      <section aria-labelledby="workbench-sim-run-title" className="workbench-sim-run">
        <p className="workbench-sim-kicker">RUN STATUS / {simulation.status.toUpperCase()}</p>
        <h2 id="workbench-sim-run-title">
          {simulation.status === 'completed' ? 'Scenario complete' : simulation.status === 'blocked' ? 'Scenario stopped at a gate' : 'Scenario cancelled'}
        </h2>
        {simulation.rollPreview
          ? <p>A Roll preview is available; no asset registry record was created.</p>
          : simulation.status === 'completed'
            ? <p>Accepted-work simulation complete. Roll is not applicable to this work kind.</p>
            : <p>The trace is retained. No later stage was simulated.</p>}
        <div className="workbench-sim-run-actions">
          <button className="workbench-sim-primary" onClick={onRestart} type="button">Start a new run</button>
          <button className="workbench-sim-secondary" onClick={discard} type="button">Discard this run</button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="workbench-sim-run-title" className="workbench-sim-run">
      <p className="workbench-sim-kicker">NEXT OPERATION / SIMULATED</p>
      <h2 id="workbench-sim-run-title">{card.label}</h2>
      {card.advance && (
        card.advance.type === 'tender-review' || card.advance.type === 'assembly' ? (
          <>
            <label>
              Gate outcome
              <select onChange={event => setOutcome((event.currentTarget as HTMLSelectElement).value as typeof outcome)} value={outcome}>
                <option value="proceed">Proceed in scenario</option>
                <option value="blocked">Block at this gate</option>
              </select>
            </label>
            <label>
              Review note
              <textarea onInput={event => setNote((event.currentTarget as HTMLTextAreaElement).value)} value={note} rows={3} />
            </label>
          </>
        ) : card.advance.type === 'delivery' ? (
          <label>
            Scenario evidence Â· one item per line
            <textarea onInput={event => setEvidence((event.currentTarget as HTMLTextAreaElement).value)} value={evidence} rows={3} />
          </label>
        ) : card.advance.type === 'acceptance' ? (
          <>
            <label>
              Acceptance outcome
              <select onChange={event => setAcceptance((event.currentTarget as HTMLSelectElement).value as typeof acceptance)} value={acceptance}>
                <option value="accepted">Accept in scenario</option>
                <option value="returned">Return for changes</option>
                <option value="rejected">Reject at this gate</option>
              </select>
            </label>
            <label>
              Review note
              <textarea onInput={event => setNote((event.currentTarget as HTMLTextAreaElement).value)} value={note} rows={3} />
            </label>
          </>
        ) : card.advance.type === 'deployment' ? (
          <label>
            Deployment note
            <textarea onInput={event => setNote((event.currentTarget as HTMLTextAreaElement).value)} value={note} rows={3} />
          </label>
        ) : null
      )}
      <div className="workbench-sim-run-actions">
        <button
          className="workbench-sim-primary"
          disabled={!advance || advance.disabled}
          onClick={handleAdvance}
          type="button"
        >
          {card.advance ? card.advance.label : 'Record simulated step'}
        </button>
        <button className="workbench-sim-secondary" onClick={onPause} type="button">Pause</button>
        <button className="workbench-sim-text" onClick={() => onCancel(note.trim() || 'Simulation cancelled by user.')} type="button">Cancel run</button>
      </div>
    </section>
  );
}
