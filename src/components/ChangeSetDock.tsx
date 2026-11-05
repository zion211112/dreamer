import type { ComponentChildren } from 'preact';

export interface PendingCommit {
  id: string;
  label: string;
  state: 'draft' | 'proposed' | 'in_review' | 'pending_authorization' | 'authorized' | 'in_execution' | 'pending_acceptance' | 'accepted' | 'amended' | 'rejected' | 'cancelled';
  timestamp: string;
  author?: string;
}

export interface EvidenceGapDock {
  id: string;
  label: string;
  severity: 'caution' | 'risk';
  description: string;
  recordId: string;
}

export interface ReconciliationItem {
  id: string;
  label: string;
  type: 'conflict' | 'missing_evidence' | 'authority_gap' | 'duplicate';
  state: 'open' | 'in_progress' | 'resolved';
  description: string;
}

export interface ChangeSetDockProps {
  module: string;
  pendingCommits: PendingCommit[];
  evidenceGaps: EvidenceGapDock[];
  reconciliationQueue: ReconciliationItem[];
  renderPendingCommits?: (commits: PendingCommit[]) => ComponentChildren;
  renderEvidenceGaps?: (gaps: EvidenceGapDock[]) => ComponentChildren;
  renderReconciliationQueue?: (items: ReconciliationItem[]) => ComponentChildren;
  onCommitAction?: (commit: PendingCommit, action: 'view' | 'edit' | 'submit' | 'cancel') => void;
  onGapAction?: (gap: EvidenceGapDock, action: 'view' | 'resolve') => void;
  onReconcileAction?: (item: ReconciliationItem, action: 'view' | 'resolve') => void;
}

export function ChangeSetDock({
  module,
  pendingCommits,
  evidenceGaps,
  reconciliationQueue,
  renderPendingCommits,
  renderEvidenceGaps,
  renderReconciliationQueue,
  onCommitAction,
  onGapAction,
  onReconcileAction,
}: ChangeSetDockProps) {
  const hasContent = pendingCommits.length > 0 || evidenceGaps.length > 0 || reconciliationQueue.length > 0;

  if (!hasContent) return null;

  return (
    <section className="field-studio-dock" aria-label={`Change set dock: ${module}`}>
      <header className="field-studio-dock-header">
        <span className="field-studio-dock-title">CHANGE SET</span>
        <span className="field-studio-dock-module">{module.toUpperCase()}</span>
        <div className="field-studio-dock-tabs" role="tablist" aria-label="Change set views">
          {pendingCommits.length > 0 && (
            <button
              aria-controls="field-studio-dock-commits"
              aria-selected={true}
              className="field-studio-dock-tab"
              id="field-studio-tab-commits"
              role="tab"
              tabIndex={0}
              type="button"
            >
              Commits ({pendingCommits.length})
            </button>
          )}
          {evidenceGaps.length > 0 && (
            <button
              aria-controls="field-studio-dock-gaps"
              aria-selected={false}
              className="field-studio-dock-tab"
              id="field-studio-tab-gaps"
              role="tab"
              tabIndex={-1}
              type="button"
            >
              Evidence Gaps ({evidenceGaps.length})
            </button>
          )}
          {reconciliationQueue.length > 0 && (
            <button
              aria-controls="field-studio-dock-reconcile"
              aria-selected={false}
              className="field-studio-dock-tab"
              id="field-studio-tab-reconcile"
              role="tab"
              tabIndex={-1}
              type="button"
            >
              Reconciliation ({reconciliationQueue.length})
            </button>
          )}
        </div>
      </header>
      <div className="field-studio-dock-panel" id="field-studio-dock-panel" role="tabpanel">
        {pendingCommits.length > 0 && (
          <section className="field-dock-section">
            <span className="field-studio-section-label">PENDING COMMITS</span>
            {renderPendingCommits
              ? renderPendingCommits(pendingCommits)
              : (
                <ul className="field-dock-commits">
                  {pendingCommits.map((commit, i) => (
                    <li key={i} className={`field-dock-commit ${commit.state}`}>
                      <span className="field-dock-commit-state">{commit.state}</span>
                      <span className="field-dock-commit-label">{commit.label}</span>
                      <span className="field-dock-commit-meta">
                        {commit.timestamp}
                        {commit.author && ` · ${commit.author}`}
                      </span>
                      <div className="field-dock-commit-actions">
                        {onCommitAction && (
                          <>
                            <button type="button" className="field-dock-action quiet" onClick={() => onCommitAction(commit, 'view')}>View</button>
                            {commit.state === 'draft' && <button type="button" className="field-dock-action quiet" onClick={() => onCommitAction(commit, 'edit')}>Edit</button>}
                            {commit.state === 'draft' && <button type="button" className="field-dock-action primary" onClick={() => onCommitAction(commit, 'submit')}>Submit</button>}
                            {commit.state === 'proposed' && <button type="button" className="field-dock-action quiet" onClick={() => onCommitAction(commit, 'cancel')}>Cancel</button>}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        )}

        {evidenceGaps.length > 0 && (
          <section className="field-dock-section">
            <span className="field-studio-section-label">EVIDENCE GAPS</span>
            {renderEvidenceGaps
              ? renderEvidenceGaps(evidenceGaps)
              : (
                <ul className="field-dock-gaps">
                  {evidenceGaps.map((gap, i) => (
                    <li key={i} className={`field-dock-gap ${gap.severity}`}>
                      <span className="field-dock-gap-badge">{gap.severity.toUpperCase()}</span>
                      <span className="field-dock-gap-label">{gap.label}</span>
                      <span className="field-dock-gap-desc">{gap.description}</span>
                      <span className="field-dock-gap-record">{gap.recordId}</span>
                      <div className="field-dock-gap-actions">
                        {onGapAction && (
                          <>
                            <button type="button" className="field-dock-action quiet" onClick={() => onGapAction(gap, 'view')}>View</button>
                            <button type="button" className="field-dock-action primary" onClick={() => onGapAction(gap, 'resolve')}>Resolve</button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        )}

        {reconciliationQueue.length > 0 && (
          <section className="field-dock-section">
            <span className="field-studio-section-label">RECONCILIATION QUEUE</span>
            {renderReconciliationQueue
              ? renderReconciliationQueue(reconciliationQueue)
              : (
                <ul className="field-dock-reconcile">
                  {reconciliationQueue.map((item, i) => (
                    <li key={i} className={`field-dock-reconcile-item ${item.type} ${item.state}`}>
                      <span className="field-dock-reconcile-type">{item.type}</span>
                      <span className="field-dock-reconcile-label">{item.label}</span>
                      <span className="field-dock-reconcile-state">{item.state}</span>
                      <span className="field-dock-reconcile-desc">{item.description}</span>
                      <div className="field-dock-reconcile-actions">
                        {onReconcileAction && (
                          <>
                            <button type="button" className="field-dock-action quiet" onClick={() => onReconcileAction(item, 'view')}>View</button>
                            {item.state === 'open' && <button type="button" className="field-dock-action primary" onClick={() => onReconcileAction(item, 'resolve')}>Resolve</button>}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        )}
      </div>
    </section>
  );
}