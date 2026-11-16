import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { StudioContext } from '../lib/studio-navigation';
import { getStudioContextLabel } from '../lib/studio-navigation';
import { StudioNavigation } from './StudioNavigation';
import { RecordInspector, type RecordSelection, type EvidenceGap, type ContextAction, type GateStatus } from './RecordInspector';
import { ChangeSetDock, type PendingCommit, type EvidenceGapDock, type ReconciliationItem } from './ChangeSetDock';
import { isDemoMode } from '../lib/supabase/client';

type SkinMode = 'light' | 'observatory';

function readSkinPreference(): SkinMode {
  try {
    return (localStorage.getItem('studioSkin') as SkinMode) || 'light';
  } catch {
    return 'light';
  }
}

function applySkin(skin: SkinMode) {
  const root = document.documentElement;
  if (skin === 'light') {
    root.removeAttribute('data-skin');
  } else {
    root.setAttribute('data-skin', skin);
  }
}

interface WorkspaceShellProps {
  children: ComponentChildren;
  currentContext: StudioContext;
  moduleTheme?: string;
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
  moduleTheme,
  recordSelection = null,
  inspectorData = {},
  changeSetData = {},
}: WorkspaceShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const [inspectorOpen, setInspectorOpen] = useState(Boolean(recordSelection));
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [skin, setSkin] = useState<SkinMode>(readSkinPreference);
  const moduleLabel = getStudioContextLabel(currentContext);
  const subView = currentContext.includes(':')
    ? currentContext.split(':')[1]
    : null;
  const subViewLabel = subView ? subView.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;
  const environmentLabel = isDemoMode ? 'Local demo' : 'Configured';

  useEffect(() => {
    applySkin(skin);
    try {
      localStorage.setItem('studioSkin', skin);
    } catch (error) {
      console.error('Could not save the Studio skin preference.', error);
    }
  }, [skin]);

  useEffect(() => {
    setInspectorOpen(Boolean(recordSelection));
  }, [recordSelection?.id]);

  function toggleSkin() {
    setSkin(current => (current === 'light' ? 'observatory' : 'light'));
  }

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
    <div className={`field-studio-shell${currentContext === 'overview' ? ' is-home' : ''}${sidebarCollapsed ? ' has-collapsed-sidebar' : ''}${hasInspectorContent ? ' has-record-inspector' : ''}${hasChangeSetContent ? ' has-change-set-dock' : ''}${hasChangeSetContent && dockCollapsed ? ' has-collapsed-dock' : ''}${moduleTheme ? ` ${moduleTheme}` : ''}`}>
      <StudioNavigation
        currentContext={currentContext}
        environmentLabel={environmentLabel}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen(current => !current)}
        onResetSidebar={resetSidebar}
        onToggleSidebar={toggleSidebar}
        recordSelected={Boolean(recordSelection)}
        sidebarCollapsed={sidebarCollapsed}
        skin={skin}
        onToggleSkin={toggleSkin}
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
      <footer className="field-studio-statusbar" aria-label="Workspace status">
        <span className="field-studio-statusbar-module">
          <strong>{moduleLabel}</strong>
          {subViewLabel && <span className="field-studio-statusbar-subview">{subViewLabel}</span>}
          <span className="field-studio-statusbar-module-context">APT-LABS</span>
        </span>
        <span className="field-studio-statusbar-notice">
          <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /><path d="M10 7v4m0 3v.5" /></svg>
          {environmentLabel}
        </span>
      </footer>
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