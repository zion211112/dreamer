import { StudioNavigation } from '../../components/StudioNavigation';
import {
  getStudioEnvironmentForContext,
  getStudioModuleLabel,
  type StudioContext,
} from '../../lib/studio-navigation';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: StudioContext;
}

export function WorkspaceLayout({ children, currentContext }: WorkspaceLayoutProps) {
  const environment = getStudioEnvironmentForContext(currentContext);
  return (
    <div className="studio-shell">
      <StudioNavigation currentContext={currentContext} />
      <div className="studio-main-column">
        <main className="atlas-main">
          <div className="studio-content">
            {children}
          </div>
        </main>
        <footer className="atlas-footer">
          <span>APT-LABS — {getStudioModuleLabel(currentContext)}</span>
          <span>{environment === 'branch' ? 'BRANCH · BROWSER-LOCAL PROTOTYPE' : 'MAIN · CANON VIEW'}</span>
        </footer>
      </div>
    </div>
  );
}
