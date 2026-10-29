import { useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { BrandMark } from './BrandMark';

const CONTEXTS = [
  { id: 'people', label: 'People' },
  { id: 'institutions', label: 'Institutions' },
  { id: 'commons', label: 'Commons' },
  { id: 'workbench', label: 'Workbench' },
] as const;

function getContext() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('workspaceContext') || 'people';
  }
  return 'people';
}

function getUser() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }
  return null;
}

export function WorkspaceHeader() {
  const [location, navigate] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const routePath = location.split('?')[0];
  const currentContext = CONTEXTS.find((context) => routePath === `/workspace/${context.id}`)?.id
    ?? getContext();
  const user = getUser();
  const initials = user?.email?.split('@')[0]?.slice(0, 2).toUpperCase() || '??';

  const handleContextChange = (contextId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspaceContext', contextId);
    }
    navigate(`/workspace/${contextId}`);
  };

  return (
    <header className="ws-header">
      <div className="ws-brand">
        <BrandMark size="sm" />
        <span className="ws-brand-divider" aria-hidden="true" />
        <span className="ws-brand-label">STUDIO</span>
      </div>

      <nav className="ws-contexts" aria-label="Workspace contexts">
        {CONTEXTS.map((ctx) => (
          <button
            key={ctx.id}
            onClick={() => handleContextChange(ctx.id)}
            className={`ws-context${currentContext === ctx.id ? ' is-active' : ''}`}
            aria-current={currentContext === ctx.id ? 'page' : undefined}
          >
            <span className="ws-context-dot" aria-hidden="true" />
            <span>{ctx.label}</span>
          </button>
        ))}
      </nav>

      <div className="ws-user-menu">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="ws-user-trigger"
          aria-label="Open account menu"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          <span className="ws-user-avatar">{initials}</span>
          <span className="ws-user-caption">Account</span>
          <svg className="ws-user-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {userMenuOpen && (
          <>
            <div
              className="ws-user-menu-backdrop"
              onClick={() => setUserMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="ws-user-popover">
              <div className="ws-user-details">
                <div className="ws-user-email">
                  {user?.email || 'Guest'}
                </div>
                <div className="ws-user-context">
                  {user?.context ? `Workspace: ${user.context}` : 'Demo mode'}
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('workspaceContext');
                  }
                  navigate('/sign-in');
                }}
                className="ws-sign-out"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
