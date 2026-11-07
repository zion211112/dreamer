import { useEffect, useRef, useState } from 'preact/hooks';
import { getEngineActivityStatus, type EngineRunSummary } from '../lib/workspace-activity';
import { EngineCommandDock } from './EngineCommandDock';

interface EngineActivityStripProps {
  runs: readonly EngineRunSummary[];
  agentAvailable: boolean;
  runtimeLabel: string;
  storageLabel: string;
  ledgerHeadHash: string | null;
}

export function EngineActivityStrip({
  runs,
  agentAvailable,
  runtimeLabel,
  storageLabel,
  ledgerHeadHash,
}: EngineActivityStripProps) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const trayRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeRunCount = runs.filter(run => run.status === 'queued' || run.status === 'running').length;
  const pendingProposalCount = runs.reduce(
    (total, run) => total + Math.max(0, run.pendingProposalCount),
    0,
  );
  const activityLabel = activeRunCount > 0
    ? `${activeRunCount} active ${activeRunCount === 1 ? 'run' : 'runs'}`
    : getEngineActivityStatus(null);

  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return;

    if (trayOpen && !tray.open) tray.showModal();
    else if (!trayOpen && tray.open) tray.close();
  }, [trayOpen]);

  function closeTray() {
    setTrayOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <footer aria-label="Workspace status and engine activity" className="engine-activity-strip">
        <div className="engine-strip-context">
          <span className="engine-strip-runtime"><i aria-hidden="true" />{runtimeLabel}</span>
          <span className="engine-strip-separator" aria-hidden="true" />
          <span className="engine-strip-storage">{storageLabel}</span>
        </div>
        <div aria-live="polite" className="engine-strip-state" role="status">
          <span className="engine-strip-state-mark" aria-hidden="true" />
          <span>{activityLabel}</span>
          <span className="engine-strip-count">{pendingProposalCount} pending review</span>
        </div>
        <div className="engine-strip-actions">
          {pendingProposalCount > 0 && (
            <button
              className="engine-strip-review"
              onClick={() => setTrayOpen(true)}
              type="button"
            >
              Review {pendingProposalCount}
            </button>
          )}
          <button
            aria-controls="engine-activity-tray"
            aria-expanded={trayOpen}
            className="engine-strip-activity"
            onClick={() => setTrayOpen(true)}
            ref={triggerRef}
            type="button"
          >
            Activity
          </button>
          <button className="engine-strip-ask" onClick={() => setCommandOpen(true)} type="button">
            Ask engine
          </button>
          <span className="engine-strip-ledger" title={`Records ledger head: ${ledgerHeadHash ?? '—'}`}>
            LEDGER <strong>{ledgerHeadHash ?? '—'}</strong>
          </span>
        </div>
      </footer>
      <dialog
        aria-labelledby="engine-activity-title"
        className="engine-activity-tray"
        id="engine-activity-tray"
        onCancel={event => {
          event.preventDefault();
          closeTray();
        }}
        onClose={() => setTrayOpen(false)}
        ref={trayRef}
      >
        <div className="engine-activity-panel">
          <header className="engine-panel-heading">
            <div>
              <span className="engine-panel-eyebrow">RUNS &amp; REVIEW</span>
              <h2 id="engine-activity-title">Engine activity</h2>
            </div>
            <button aria-label="Close activity tray" className="engine-panel-close" onClick={closeTray} type="button">×</button>
          </header>
          {runs.length === 0 ? (
            <p className="engine-activity-empty" role="status">No active runs or proposals awaiting review.</p>
          ) : (
            <ul className="engine-activity-list">
              {runs.map(run => (
                <li key={run.id}>
                  <span className="engine-activity-status">{getEngineActivityStatus(run.status)}</span>
                  <span>{run.summary}</span>
                  {run.pendingProposalCount > 0 && <small>{run.pendingProposalCount} proposals to review</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
      <EngineCommandDock
        agentAvailable={agentAvailable}
        onClose={() => setCommandOpen(false)}
        open={commandOpen}
      />
    </>
  );
}
