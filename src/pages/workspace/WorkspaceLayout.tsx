import { StudioNavigation } from '../../components/StudioNavigation';
import { getStudioModuleLabel, type StudioContext } from '../../lib/studio-navigation';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: StudioContext;
}

export function WorkspaceLayout({ children, currentContext }: WorkspaceLayoutProps) {
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
          <span>BROWSER-LOCAL WORKSPACE DEMO</span>
        </footer>
      </div>
    </div>
  );
}
