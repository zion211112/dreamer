import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { StudioContext } from '../lib/studio-navigation';
import { getStudioContextLabel } from '../lib/studio-navigation';
import { StudioNavigation } from './StudioNavigation';
import { RecordInspector, type RecordSelection, type EvidenceGap, type ContextAction, type GateStatus } from './RecordInspector';
import { ChangeSetDock, type PendingCommit, type EvidenceGapDock, type ReconciliationItem } from './ChangeSetDock';
import { isDemoMode } from '../lib/supabase/client';

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
  const [inspectorOpen, setInspectorOpen] = useState(Boolean(recordSelection));
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const moduleLabel = getStudioContextLabel(currentContext);
  const environmentLabel = isDemoMode ? 'Local demo' : 'Configured';

  useEffect(() => {
    setInspectorOpen(Boolean(recordSelection));
  }, [recordSelection?.id]);

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

  function resetSidebar() {
    setSidebarCollapsed(false);
    try {
      localStorage.setItem('studioSidebarCollapsed', 'false');
    } catch (error) {
      console.error('Could not reset the Studio sidebar preference.', error);
    }
  }

  const hasInspectorContent = Boolean(recordSelection && inspectorOpen);

  const hasChangeSetContent = changeSetData && (
    (changeSetData.pendingCommits?.length ?? 0) > 0 ||
    (changeSetData.evidenceGaps?.length ?? 0) > 0 ||
    (changeSetData.reconciliationQueue?.length ?? 0) > 0
  );

  return (
    <div className={`field-studio-shell${sidebarCollapsed ? ' has-collapsed-sidebar' : ''}${hasInspectorContent ? ' has-record-inspector' : ''}${hasChangeSetContent ? ' has-change-set-dock' : ''}${hasChangeSetContent && dockCollapsed ? ' has-collapsed-dock' : ''}`}>
      <StudioNavigation
        currentContext={currentContext}
        environmentLabel={environmentLabel}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen(current => !current)}
        onResetSidebar={resetSidebar}
        onToggleSidebar={toggleSidebar}
        recordSelected={Boolean(recordSelection)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main className="field-studio-main">
        <div className="studio-content">{children}</div>
      </main>
      {hasInspectorContent && recordSelection && (
        <RecordInspector
          selection={recordSelection}
          relationships={inspectorData.relationships}
          evidenceGaps={inspectorData.evidenceGaps}
          contextActions={inspectorData.contextActions}
          gateStatus={inspectorData.gateStatus}
          renderRelationships={inspectorData.renderRelationships}
          renderEvidenceGaps={inspectorData.renderEvidenceGaps}
          renderContextActions={inspectorData.renderContextActions}
          renderGateStatus={inspectorData.renderGateStatus}
          onDismiss={() => setInspectorOpen(false)}
        />
      )}
      {hasChangeSetContent && (
        <ChangeSetDock
          collapsed={dockCollapsed}
          module={moduleLabel}
          onToggleCollapsed={() => setDockCollapsed(current => !current)}
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
    </div>
  );
}