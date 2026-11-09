import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { StudioContext } from '../lib/studio-navigation';
import { getStudioContextLabel, getStudioModuleForContext } from '../lib/studio-navigation';
import { StudioNavigation } from './StudioNavigation';
import { RecordInspector, type RecordSelection, type EvidenceGap, type ContextAction, type GateStatus } from './RecordInspector';
import { ChangeSetDock, type PendingCommit, type EvidenceGapDock, type ReconciliationItem } from './ChangeSetDock';
import { queryRollEntries } from '../lib/db/roll';
import { isDemoMode } from '../lib/supabase/client';
import { EngineActivityStrip } from './EngineActivityStrip';

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
  try {
    return localStorage.getItem('studioSidebarCollapsed') === 'true';
  } catch (error) {
    console.error('Could not read the Studio sidebar preference.', error);
    return false;
  }
}

export function WorkspaceShell({
  children,
  currentContext,
  recordSelection = null,
  inspectorData = {},
  changeSetData = {},
}: WorkspaceShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const [ledgerHeadHash, setLedgerHeadHash] = useState<string | null>(null);
  const moduleLabel = getStudioContextLabel(currentContext);
  const moduleId = getStudioModuleForContext(currentContext);
  const runtimeLabel = isDemoMode ? 'Local demo' : 'Configured environment';
  const storageLabel = currentContext === 'overview'
    ? 'Workspace overview · no module data queried'
    : moduleId === 'records'
      ? isDemoMode ? 'Demo fixtures + local Roll' : 'Configured Records API'
      : currentContext === 'workbench:school-console'
        ? 'School Console · IndexedDB'
        : moduleId === 'commons' || moduleId === 'workbench'
          ? `${moduleLabel} · browser-local`
          : `${moduleLabel} · module-specific data`;

  function toggleSidebar() {
    setSidebarCollapsed(current => {
      const next = !current;
      try {
        localStorage.setItem('studioSidebarCollapsed', String(next));
      } catch (error) {
        console.error('Could not save the Studio sidebar preference.', error);
      }
      return next;
    });
  }

  // Fetch ledger head hash for Records module (Roll lens)
  useEffect(() => {
    if (moduleId === 'records') {
      queryRollEntries({ limit: 1 }).then(entries => {
        if (entries.length > 0 && entries[0].hash_anchor) {
          // Show first 16 chars of hash anchor as ledger head indicator
          setLedgerHeadHash(entries[0].hash_anchor.slice(0, 16));
        } else {
          setLedgerHeadHash(null);
        }
      }).catch(() => {
        setLedgerHeadHash('—');
      });
    } else {
      setLedgerHeadHash(null);
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

  return (
    <div className={`field-studio-shell${sidebarCollapsed ? ' has-collapsed-sidebar' : ''}${hasInspectorContent ? ' has-record-inspector' : ''}${hasChangeSetContent ? ' has-change-set-dock' : ''}`}>
      <StudioNavigation
        currentContext={currentContext}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main className="field-studio-main">
        <div className="studio-content">{children}</div>
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
      <EngineActivityStrip
        agentAvailable={false}
        ledgerHeadHash={ledgerHeadHash}
        runs={[]}
        runtimeLabel={runtimeLabel}
        storageLabel={storageLabel}
      />
    </div>
  );
}