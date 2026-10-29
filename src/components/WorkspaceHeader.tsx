import { useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { BrandMark } from './BrandMark';
import { createPortablePeopleRecord } from '../lib/people-network';

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
  const [accountStatus, setAccountStatus] = useState('');

  const routePath = location.split('?')[0];
  const currentContext = CONTEXTS.find((context) => routePath === `/workspace/${context.id}`)?.id
    ?? getContext();
  const user = getUser();
  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Contributor';
  const initials = (userName || '??').split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase() || '??';
  const role = user?.role || 'Personal account';
  const activeWork = user?.context || 'No assigned work';

  const exportRecord = () => {
    try {
      const blob = new Blob([createPortablePeopleRecord()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'aptlabs-people-network.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setAccountStatus('Portable record exported.');
    } catch (error) {
      setAccountStatus(error instanceof Error ? error.message : 'Record could not be exported.');
    }
  };

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
          <span className="ws-user-text">
            <span className="ws-user-name">{userName}</span>
            <span className="ws-user-caption">Access</span>
          </span>
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
              <div className="ws-user-header">
                <div className="ws-user-badge">Local profile</div>
                <div className="ws-user-summary">
                  <span className="ws-user-avatar ws-user-avatar--large">{initials}</span>
                  <div>
                    <div className="ws-user-email">{userName}</div>
                    <div className="ws-user-context">{role}</div>
                  </div>
                </div>
              </div>

              <div className="ws-user-meta">
                <div>
                  <span>Active work</span>
                  <strong>{activeWork}</strong>
                </div>
                <div>
                  <span>Record state</span>
                  <strong>Browser-local</strong>
                </div>
              </div>

              <div className="ws-user-actions">
                <button
                  className="ws-user-action"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/workspace/people');
                  }}
                  type="button"
                >
                  Open profile
                </button>
                <button className="ws-user-action" onClick={exportRecord} type="button">
                  Export record
                </button>
              </div>
              {accountStatus && <p className="ws-user-status" role="status">{accountStatus}</p>}

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
