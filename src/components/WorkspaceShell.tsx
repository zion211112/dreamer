import { useState, useEffect, useCallback } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { StudioContext } from '../lib/studio-navigation';
import { getStudioModuleLabel, getStudioModuleForContext } from '../lib/studio-navigation';
import { StudioNavigation } from './StudioNavigation';
import { RecordInspector, type RecordSelection, type EvidenceGap, type ContextAction, type GateStatus } from './RecordInspector';
import { ChangeSetDock, type PendingCommit, type EvidenceGapDock, type ReconciliationItem } from './ChangeSetDock';
import { queryRollEntries } from '../lib/db/roll';
import { useClock } from '../hooks/useClock';

interface WorkspaceShellProps {
  children: ComponentChildren;
  currentContext: StudioContext;
  recordSelection?: RecordSelection | null;
  inspectorData?: {
    relationships?: Array<{ label: string; target: string; type: string }>;
    evidenceGaps?: EvidenceGap[];
    contextActions?: ContextAction[];
    gateStatus?: GateStatus[];
    renderRelationships?: (relationships: Array<{ label: string; target: string; type: string }>) => ComponentChildren;
    renderEvidenceGaps?: (gaps: EvidenceGap[]) => ComponentChildren;
    renderContextActions?: (actions: ContextAction[]) => ComponentChildren;
    renderGateStatus?: (gates: GateStatus[]) => ComponentChildren;
  };
  changeSetData?: {
    pendingCommits?: PendingCommit[];
    evidenceGaps?: EvidenceGapDock[];
    reconciliationQueue?: ReconciliationItem[];
    renderPendingCommits?: (commits: PendingCommit[]) => ComponentChildren;
    renderEvidenceGaps?: (gaps: EvidenceGapDock[]) => ComponentChildren;
    renderReconciliationQueue?: (items: ReconciliationItem[]) => ComponentChildren;
    onCommitAction?: (commit: PendingCommit, action: 'view' | 'edit' | 'submit' | 'cancel') => void;
    onGapAction?: (gap: EvidenceGapDock, action: 'view' | 'resolve') => void;
    onReconcileAction?: (item: ReconciliationItem, action: 'view' | 'resolve') => void;
  };
}

function readSidebarPreference(): boolean {
  try { return localStorage.getItem('studioSidebarCollapsed') === 'true'; }
  catch { return false; }
}

function readCrosshairPreference(): boolean {
  try { return localStorage.getItem('studioCrosshairEnabled') !== 'false'; }
  catch { return true; }
}

export function WorkspaceShell({
  children,
  currentContext,
  recordSelection = null,
  inspectorData = {},
  changeSetData = {},
}: WorkspaceShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const [crosshairEnabled, setCrosshairEnabled] = useState(readCrosshairPreference);
  const [ledgerHeadHash, setLedgerHeadHash] = useState<string | null>(null);
  const clock = useClock();
  const moduleLabel = getStudioModuleLabel(currentContext);
  const moduleId = getStudioModuleForContext(currentContext);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(current => {
      const next = !current;
      try { localStorage.setItem('studioSidebarCollapsed', String(next)); }
      catch { console.error('Could not save sidebar preference.'); }
      return next;
    });
  }, []);

  const toggleCrosshair = useCallback(() => {
    setCrosshairEnabled(current => {
      const next = !current;
      try { localStorage.setItem('studioCrosshairEnabled', String(next)); }
      catch { console.error('Could not save crosshair preference.'); }
      return next;
    });
  }, []);

  useEffect(() => {
    if (moduleId === 'records') {
      queryRollEntries({ limit: 1 }).then(entries => {
        if (entries.length > 0 && entries[0].hash_anchor) {
          setLedgerHeadHash(entries[0].hash_anchor.slice(0, 16));
        } else {
          setLedgerHeadHash('—');
        }
      }).catch(() => setLedgerHeadHash('—'));
    } else {
      setLedgerHeadHash('—');
    }
  }, [moduleId]);

  const hasInspectorContent = recordSelection && (
    (inspectorData.relationships?.length ?? 0) > 0 ||
    (inspectorData.evidenceGaps?.length ?? 0) > 0 ||
    (inspectorData.gateStatus?.length ?? 0) > 0 ||
    (inspectorData.contextActions?.length ?? 0) > 0
  );

  const hasChangeSetContent = changeSetData && (
    (changeSetData.pendingCommits?.length ?? 0) > 0 ||
    (changeSetData.evidenceGaps?.length ?? 0) > 0 ||
    (changeSetData.reconciliationQueue?.length ?? 0) > 0
  );

  const activeModule = moduleId || 'commons';
  const showIdentity = activeModule !== 'workbench';

  return (
    <div className={`sublime-shell${sidebarCollapsed ? ' has-collapsed-sidebar' : ''}${hasInspectorContent ? ' has-record-inspector' : ''}${hasChangeSetContent ? ' has-change-set-dock' : ''}${crosshairEnabled ? ' has-crosshair' : ''}`}>
      <StudioNavigation
        currentContext={currentContext}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCrosshair={toggleCrosshair}
        crosshairEnabled={crosshairEnabled}
        showIdentity={showIdentity}
      />
      <main className="sublime-main">
        <div className="sublime-content">{children}</div>
      </main>
      {hasInspectorContent && recordSelection && (
        <RecordInspector
          selection={recordSelection}
          relationships={inspectorData.relationships ?? []}
          evidenceGaps={inspectorData.evidenceGaps ?? []}
          contextActions={inspectorData.contextActions ?? []}
          gateStatus={inspectorData.gateStatus ?? []}
          renderRelationships={inspectorData.renderRelationships}
          renderEvidenceGaps={inspectorData.renderEvidenceGaps}
          renderContextActions={inspectorData.renderContextActions}
          renderGateStatus={inspectorData.renderGateStatus}
        />
      )}
      {hasChangeSetContent && (
        <ChangeSetDock
          module={moduleLabel}
          pendingCommits={changeSetData.pendingCommits ?? []}
          evidenceGaps={changeSetData.evidenceGaps ?? []}
          reconciliationQueue={changeSetData.reconciliationQueue ?? []}
          renderPendingCommits={changeSetData.renderPendingCommits}
          renderEvidenceGaps={changeSetData.renderEvidenceGaps}
          renderReconciliationQueue={changeSetData.renderReconciliationQueue}
          onCommitAction={changeSetData.onCommitAction}
          onGapAction={changeSetData.onGapAction}
          onReconcileAction={changeSetData.onReconcileAction}
        />
      )}
      <footer className="sublime-statusbar">
        <span className="sublime-ledger">
          <span className="sublime-ledger-label">Ledger</span>
          <span className="sublime-ledger-hash">{ledgerHeadHash ?? '—'}</span>
        </span>
        <div className="sublime-status-chips">
          <span className="sublime-chip canon">VERIFIED</span>
          <span className="sublime-chip proposed">PROPOSED</span>
          <span className="sublime-chip caution">GAPS</span>
          <span className="sublime-chip risk">RECONCILE</span>
        </div>
        <div className="sublime-status-tail">
          <span className="sublime-clock" id="sublimeClock">{clock}</span>
          <button
            className="sublime-theme-toggle"
            aria-label="Toggle theme"
            title="Toggle theme (T)"
            onClick={() => {
              const isLight = document.documentElement.getAttribute('data-skin') === 'light';
              document.documentElement.setAttribute('data-skin', isLight ? 'dark' : 'light');
            }}
          >
            <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="6"/>
              <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.5 4.5l2.8 2.8M12.7 12.7l2.8 2.8M4.5 15.5l2.8-2.8M12.7 7.3l2.8-2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
