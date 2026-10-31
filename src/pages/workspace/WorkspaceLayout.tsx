import { StudioNavigation } from '../../components/StudioNavigation';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: 'people' | 'institutions' | 'commons' | 'field-desk' | 'workbench';
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
          <span>APT-LABS — {currentContext === 'field-desk' ? 'Workbench' : currentContext}</span>
          <span>Studio context</span>
        </footer>
      </div>
    </div>
  );
}
