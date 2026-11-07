import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { useWorkbench } from '../../pages/workspace/field-desk/useWorkbench';
import {
  type SimulationAction,
  type SimulationStage,
  type SimulationPackage,
} from '../../lib/workbench-simulation';
import { PageHead } from '../PageHead';
import { ForkGlyph } from '../ForkGlyph';
import { RingedEvidenceMarker } from '../RingedEvidenceMarker';
import { PageAgentPanel } from './PageAgentPanel';

const STAGE_ORDER: SimulationStage[] = [
  'candidate_drafted',
  'tender_review_simulated',
  'assembly_simulated',
  'delivery_simulated',
  'acceptance_simulated',
  'roll_preview',
];

const STAGE_LABELS: Record<SimulationStage, string> = {
  candidate_drafted: 'Tender candidate',
  tender_review_simulated: 'Tender review',
  assembly_simulated: 'Assembly',
  delivery_simulated: 'Delivery evidence',
  acceptance_simulated: 'Acceptance',
  roll_preview: 'Roll preview',
};

const STAGE_GATES: Record<SimulationStage, 'auto' | 'blocked' | 'proceed'> = {
  candidate_drafted: 'auto',
  tender_review_simulated: 'proceed',
  assembly_simulated: 'proceed',
  delivery_simulated: 'proceed',
  acceptance_simulated: 'proceed',
  roll_preview: 'auto',
};

interface BlockFlowProps {
  currentContext?: string;
}

export function WorkbenchBlockFlow(_props: BlockFlowProps) {
  const {
    sourceDrafts,
    source,
    plan,
    startSimulation,
    simulation,
    advance,
    discardSimulation,
    restartSimulation,
    stage,
    status,
    error,
    loading,
  } = useWorkbench();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [gateNote, setGateNote] = useState('');
  const [gateOutcome, setGateOutcome] = useState<'proceed' | 'blocked' | 'accepted' | 'returned' | 'rejected'>('proceed');

  const currentStage = (stage === 'need' ? 'candidate_drafted' : stage) as SimulationStage;
  const stageIndex = STAGE_ORDER.indexOf(currentStage);

  const simVersionBadge = useMemo(() => {
    if (!simulation?.rollPreview) return null;
    return `${simulation.id.slice(-8)} · ${simulation.rollPreview.simulatedAt.slice(0, 12)}`;
  }, [simulation]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }, [zoom, panX, panY]);

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = -event.deltaY * 0.001;
    const nextZoom = Math.min(Math.max(zoom + delta, 0.5), 2);
    setZoom(nextZoom);
  }

  function onMouseDown(event: MouseEvent) {
    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      event.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (!isPanning || !lastMousePos) return;
    setPanX(panX + event.clientX - lastMousePos.x);
    setPanY(panY + event.clientY - lastMousePos.y);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }

  function onMouseUp() {
    setIsPanning(false);
    setLastMousePos(null);
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning, lastMousePos]);

  function handleGateAction() {
    if (status !== 'active') return;
    const note = gateNote.trim();
    if (!note && stage !== 'assembly_simulated') return;

    let action: SimulationAction;
    switch (stage) {
      case 'candidate_drafted':
        action = { type: 'tender-review', outcome: gateOutcome as 'proceed' | 'blocked', note };
        break;
      case 'tender_review_simulated':
        action = { type: 'assembly', outcome: gateOutcome as 'proceed' | 'blocked', note };
        break;
      case 'assembly_simulated':
        action = { type: 'delivery', evidence: gateNote.split('\n').map(l => l.trim()).filter(Boolean) };
        break;
      case 'delivery_simulated':
        action = { type: 'acceptance', outcome: gateOutcome as 'accepted' | 'returned' | 'rejected', note };
        break;
      case 'acceptance_simulated':
        action = { type: 'deployment', note };
        break;
      default:
        return;
    }
    advance(action);
    setGateNote('');
    setActiveBlock(null);
  }

  function runBlockFlow(block: SimulationPackage) {
    setActiveBlock(block.id);
    setGateNote(block.title);
  }

  const pipelineBlocks: SimulationPackage[] = useMemo(() => {
    if (!plan) return [];
    return plan.packages;
  }, [plan]);

  const currentGate = STAGE_GATES[currentStage];

  return (
    <div className="workbench-blockflow-page">
      <PageHead
        eyebrow="Workbench"
        title={simulation ? `Simulate · ${simulation.source.assetName}` : 'Block-flow builder'}
        subtitle={simulation
          ? `6-stage pipeline from need to Roll preview. Source: ${simulation.source.need}`
          : 'Drag blocks onto the canvas, advance through stage gates, and record delivery evidence.'}
        primaryAction={
          !simulation && sourceDrafts.length > 0
            ? {
                label: 'Start simulation',
                onClick: () => {
                  if (!plan) return;
                  startSimulation();
                },
                disabled: !plan || !plan.packages.length,
              }
            : undefined
        }
        quietActions={[
          { label: 'New simulation', onClick: () => restartSimulation(), disabled: !simulation },
          { label: 'Discard run', onClick: () => discardSimulation(), disabled: !simulation || status !== 'active' },
        ]}
        metrics={[
          { label: 'Stage', value: STAGE_LABELS[currentStage], state: status === 'blocked' ? 'risk' : 'canon' },
          { label: 'Gate', value: currentGate === 'proceed' ? 'Proceed' : currentGate === 'blocked' ? 'Blocked' : 'Auto', state: currentGate === 'proceed' ? 'canon' : currentGate === 'blocked' ? 'risk' : 'caution' },
          { label: 'Version', value: simVersionBadge || '—', state: simVersionBadge ? 'canon' : 'caution' },
        ]}
      />

      {error && <p className="workbench-blockflow-error" role="alert">{error}</p>}

      {!simulation && (!sourceDrafts || sourceDrafts.length === 0) && (
        <section className="workbench-blockflow-empty">
          <RingedEvidenceMarker size={48} color="var(--state-caution)" />
          <h2>No source draft available</h2>
          <p>Open a School Console need draft from Field Desk to begin a block-flow simulation.</p>
          <Link href="/workspace/workbench/field-desk" className="workbench-blockflow-link">
            Open Field Desk
          </Link>
        </section>
      )}

      {simulation && (
        <>
          <nav aria-label="Pipeline stages" className="workbench-pipeline-nav">
            <ol className="workbench-pipeline-list">
              {STAGE_ORDER.map((stageId, index) => {
                const done = index < stageIndex;
                const current = index === stageIndex;
                const gate = STAGE_GATES[stageId];
                const blocked = current && status === 'blocked';
                return (
                  <li
                    key={stageId}
                    className={`workbench-pipeline-stage${done ? ' is-done' : ''}${current ? ' is-current' : ''}${blocked ? ' is-blocked' : ''}`}
                  >
                    <span className="workbench-pipeline-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="workbench-pipeline-label">{STAGE_LABELS[stageId]}</span>
                    {current && gate === 'proceed' && (
                      <span className="workbench-pipeline-gate">Gate open</span>
                    )}
                    {current && gate === 'blocked' && (
                      <span className="workbench-pipeline-gate is-blocked">Gate blocked</span>
                    )}
                    {current && blocked && (
                      <span className="workbench-pipeline-gate is-blocked">Stopped</span>
                    )}
                    {index < STAGE_ORDER.length - 1 && (
                      <span className="workbench-pipeline-connector" aria-hidden="true">━</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="workbench-blockflow-body">
            <aside className="workbench-blockflow-blocks">
              <header className="workbench-blockflow-blocks-head">
                <strong>Predefined blocks</strong>
                <span>{pipelineBlocks.length}</span>
              </header>
              <ul className="workbench-blockflow-block-list">
                {pipelineBlocks.map(block => (
                  <li
                    key={block.id}
                    className={`workbench-blockflow-block${activeBlock === block.id ? ' is-active' : ''}`}
                    onClick={() => runBlockFlow(block)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                      if (event.key === 'Enter') runBlockFlow(block);
                    }}
                  >
                    <RingedEvidenceMarker size={12} color="var(--state-canon)" filled={activeBlock === block.id} />
                    <span className="workbench-blockflow-block-role">{block.roleType}</span>
                    <strong className="workbench-blockflow-block-title">{block.title}</strong>
                    <ul className="workbench-blockflow-block-deliverables">
                      {block.deliverables.map(item => (
                        <li key={item} className="workbench-blockflow-block-deliverable">{item}</li>
                      ))}
                    </ul>
                    {block.dependsOn.length > 0 && (
                      <span className="workbench-blockflow-block-deps">Depends: {block.dependsOn.join(', ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </aside>

            <section
              className="workbench-blockflow-canvas"
              ref={canvasRef}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
            >
              <div className="workbench-canvas-grid" />
              <div className="workbench-canvas-content" style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }}>
                {pipelineBlocks.map(block => {
                  const isCurrent = activeBlock === block.id;
                  return (
                    <div
                      key={block.id}
                      className={`workbench-blockflow-canvas-block${isCurrent ? ' is-active' : ''}`}
                      style={{
                        left: `${100 + pipelineBlocks.indexOf(block) * 220}px`,
                        top: `${100}px`,
                      }}
                    >
                      <div className="workbench-canvas-block-card">
                        <div className="workbench-canvas-block-header">
                          <RingedEvidenceMarker size={14} color="var(--state-proposed)" filled={isCurrent} />
                          <strong>{block.roleType}</strong>
                        </div>
                        <h3>{block.title}</h3>
                        <ul className="workbench-canvas-block-deliverables">
                          {block.deliverables.map(item => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        {block.dependsOn.length > 0 && (
                          <div className="workbench-canvas-block-deps">
                            <small>Depends on: {block.dependsOn.join(', ')}</small>
                          </div>
                        )}
                        <button
                          className="workbench-canvas-block-run"
                          onClick={() => runBlockFlow(block)}
                          type="button"
                        >
                          Simulate block
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="workbench-blockflow-gate">
              <header className="workbench-blockflow-gate-head">
                <ForkGlyph size={12} color="var(--state-proposed)" />
                <strong>Stage gate</strong>
                <span className={`workbench-blockflow-gate-state${currentGate === 'proceed' ? ' is-open' : ''}${currentGate === 'blocked' ? ' is-blocked' : ''}`}>
                  {currentGate === 'proceed' ? 'Proceed' : currentGate === 'blocked' ? 'Blocked' : 'Automatic'}
                </span>
              </header>
              {status === 'active' && (
                <>
                  {stage === 'candidate_drafted' || stage === 'tender_review_simulated' ? (
                    <>
                      <label className="workbench-gate-label">Gate outcome</label>
                      <select
                        className="workbench-gate-select"
                        value={gateOutcome}
                        onChange={event => setGateOutcome((event.currentTarget as HTMLSelectElement).value as 'proceed' | 'blocked')}
                      >
                        <option value="proceed">Proceed in scenario</option>
                        <option value="blocked">Block at this gate</option>
                      </select>
                      <label className="workbench-gate-label">Review note</label>
                      <textarea
                        className="workbench-gate-note"
                        value={gateNote}
                        onInput={event => setGateNote(event.currentTarget.value)}
                        rows={3}
                        placeholder="Record the gate decision rationale…"
                      />
                    </>
                  ) : stage === 'assembly_simulated' ? (
                    <>
                      <label className="workbench-gate-label">Scenario evidence (one item per line)</label>
                      <textarea
                        className="workbench-gate-note"
                        value={gateNote}
                        onInput={event => setGateNote(event.currentTarget.value)}
                        rows={4}
                        placeholder="Describe delivery evidence…"
                      />
                    </>
                  ) : stage === 'delivery_simulated' ? (
                    <>
                      <label className="workbench-gate-label">Acceptance outcome</label>
                      <select
                        className="workbench-gate-select"
                        value={gateOutcome}
                        onChange={event => setGateOutcome((event.currentTarget as HTMLSelectElement).value as 'accepted' | 'returned' | 'rejected')}
                      >
                        <option value="accepted">Accept in scenario</option>
                        <option value="returned">Return for changes</option>
                        <option value="rejected">Reject at this gate</option>
                      </select>
                      <label className="workbench-gate-label">Review note</label>
                      <textarea
                        className="workbench-gate-note"
                        value={gateNote}
                        onInput={event => setGateNote(event.currentTarget.value)}
                        rows={3}
                        placeholder="Record acceptance rationale…"
                      />
                    </>
                  ) : stage === 'acceptance_simulated' ? (
                    <>
                      <label className="workbench-gate-label">Deployment note</label>
                      <textarea
                        className="workbench-gate-note"
                        value={gateNote}
                        onInput={event => setGateNote(event.currentTarget.value)}
                        rows={3}
                        placeholder="Record deployment rationale…"
                      />
                    </>
                  ) : null}
                  <div className="workbench-gate-actions">
                    <button
                      className="workbench-gate-run"
                      disabled={
                        status !== 'active'
                        || (stage === 'assembly_simulated' && gateNote.split('\n').filter(Boolean).length === 0)
                        || (stage !== 'assembly_simulated' && !gateNote.trim())
                      }
                      onClick={handleGateAction}
                      type="button"
                    >
                      {stage === 'assembly_simulated' ? 'Record simulated delivery'
                        : stage === 'acceptance_simulated' ? 'Create Roll preview'
                        : 'Record simulated step'}
                    </button>
                    <button className="workbench-gate-pause" onClick={() => {}} type="button">Pause</button>
                  </div>
                </>
              )}
              {simulation?.rollPreview && (
                <section className="workbench-roll-preview">
                  <RingedEvidenceMarker size={16} color="var(--state-canon)" filled />
                  <strong>Roll preview</strong>
                  <p>{simulation.rollPreview.assetName}</p>
                  <code>{simulation.id.slice(-8)} · {simulation.rollPreview.simulatedAt.slice(0, 16)}…</code>
                  <ul className="workbench-roll-preview-roles">
                    {simulation.rollPreview.simulatedRoles.map(role => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>

          <PageAgentPanel sourcePreview={source ?? simulation?.source ?? null} />
        </>
      )}

      {!loading && sourceDrafts.length === 0 && !simulation && (
        <p className="workbench-blockflow-footnote">
          The School Console is the source of need drafts; this workspace does not create one on its behalf.
        </p>
      )}
    </div>
  );
}
