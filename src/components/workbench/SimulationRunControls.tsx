import { useState } from 'preact/hooks';
import type { SimulationAction, WorkbenchSimulation } from '../../lib/workbench-simulation';

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
  onAdvance: (action: SimulationAction) => void;
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
  const isActive = simulation.status === 'active';
  const noteRequired = simulation.stage !== 'assembly_simulated';
  const deliveryEvidence = evidence.split('\n').map(item => item.trim()).filter(Boolean);

  function advance() {
    if (!isActive) return;
    switch (simulation.stage) {
      case 'candidate_drafted':
        onAdvance({ type: 'tender-review', outcome, note: note.trim() });
        break;
      case 'tender_review_simulated':
        onAdvance({ type: 'assembly', outcome, note: note.trim() });
        break;
      case 'assembly_simulated':
        onAdvance({ type: 'delivery', evidence: deliveryEvidence });
        break;
      case 'delivery_simulated':
        onAdvance({ type: 'acceptance', outcome: acceptance, note: note.trim() });
        break;
      case 'acceptance_simulated':
        onAdvance({ type: 'deployment', note: note.trim() });
        break;
      case 'roll_preview':
        return;
    }
    setNote('');
    setEvidence('');
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

  const stageLabel = simulation.stage === 'candidate_drafted'
    ? 'Tender review'
    : simulation.stage === 'tender_review_simulated'
      ? 'Assembly'
      : simulation.stage === 'assembly_simulated'
        ? 'Delivery evidence'
        : simulation.stage === 'delivery_simulated'
          ? 'Acceptance'
          : 'Deployment preview';

  return (
    <section aria-labelledby="workbench-sim-run-title" className="workbench-sim-run">
      <p className="workbench-sim-kicker">NEXT OPERATION / SIMULATED</p>
      <h2 id="workbench-sim-run-title">{stageLabel}</h2>
      {simulation.stage === 'candidate_drafted' || simulation.stage === 'tender_review_simulated' ? (
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
      ) : simulation.stage === 'assembly_simulated' ? (
        <label>
          Scenario evidence · one item per line
          <textarea onInput={event => setEvidence((event.currentTarget as HTMLTextAreaElement).value)} value={evidence} rows={3} />
        </label>
      ) : simulation.stage === 'delivery_simulated' ? (
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
      ) : simulation.stage === 'acceptance_simulated' ? (
        <label>
          Deployment note
          <textarea onInput={event => setNote((event.currentTarget as HTMLTextAreaElement).value)} value={note} rows={3} />
        </label>
      ) : null}
      <div className="workbench-sim-run-actions">
        <button
          className="workbench-sim-primary"
          disabled={simulation.stage === 'assembly_simulated'
            ? deliveryEvidence.length === 0
            : noteRequired && !note.trim()}
          onClick={advance}
          type="button"
        >
          {simulation.stage === 'assembly_simulated'
            ? 'Record simulated delivery'
            : simulation.stage === 'acceptance_simulated'
              ? 'Create Roll preview'
              : 'Record simulated step'}
        </button>
        <button className="workbench-sim-secondary" onClick={onPause} type="button">Pause</button>
        <button className="workbench-sim-text" onClick={() => onCancel(note.trim() || 'Simulation cancelled by user.')} type="button">Cancel run</button>
      </div>
    </section>
  );
}
