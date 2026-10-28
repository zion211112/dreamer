import { useState } from 'preact/hooks';
import { useLocation, Link } from 'wouter';
import { BrandMark } from './BrandMark';

const CONTEXTS = [
  { id: 'people', label: 'People', subtitle: 'Skill in motion' },
  { id: 'institutions', label: 'Institutions', subtitle: 'Purposeful backing' },
  { id: 'commons', label: 'Commons', subtitle: 'Work that stands' },
  { id: 'field-desk', label: 'Field Desk', subtitle: 'Atlas in hand' },
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
  const [, navigate] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const currentContext = getContext();
  const user = getUser();
  const initials = user?.email?.split('@')[0]?.slice(0, 2).toUpperCase() || '??';

  const handleContextChange = (contextId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspaceContext', contextId);
    }
    navigate(`/workspace/${contextId}`);
  };

  return (
    <header className="ws-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      height: '40px',
      padding: '0 var(--space-3)',
      background: 'color-mix(in srgb, var(--bg-elev) 90%, transparent)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Brand */}
      <Link href="/workspace/people" style={{ flex: 'none', textDecoration: 'none' }}>
        <BrandMark size="sm" />
      </Link>

      {/* Contexts - inline segmented */}
      <nav className="ws-contexts" style={{
        display: 'flex',
        gap: 'var(--space-1)',
        fontSize: 'var(--step--1)',
        fontFamily: 'var(--mono)',
        fontWeight: 500,
      }} aria-label="Workspace contexts">
        {CONTEXTS.map((ctx) => (
          <button
            key={ctx.id}
            onClick={() => handleContextChange(ctx.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1px',
              padding: 'var(--space-1) var(--space-2)',
              border: 'none',
              background: 'transparent',
              color: currentContext === ctx.id ? 'var(--terrain)' : 'var(--text-muted)',
              borderBottom: currentContext === ctx.id ? '2px solid var(--terrain)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color var(--fast), border-color var(--fast)',
              lineHeight: '1.2',
            }}
            aria-current={currentContext === ctx.id ? 'page' : undefined}
          >
            <span style={{ fontWeight: 600 }}>{ctx.label}</span>
            <span style={{
              fontSize: 'var(--step--2)',
              color: currentContext === ctx.id ? 'var(--terrain)' : 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {ctx.subtitle}
            </span>
          </button>
        ))}
      </nav>

      {/* User menu */}
      <div className="ws-user-menu" style={{ position: 'relative', flex: 'none' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--terrain-pale)',
            color: 'var(--terrain)',
            font: '600 var(--step--2) var(--mono)',
            cursor: 'pointer',
            transition: 'background var(--fast), border-color var(--fast)',
          }}
        >
          {initials}
        </button>

        {userMenuOpen && (
          <>
            <div
              className="ws-user-menu-backdrop"
              onClick={() => setUserMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99,
              }}
            />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 100,
              minWidth: '180px',
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-3)',
              boxShadow: 'var(--shadow-3)',
              overflow: 'hidden',
              animation: 'slideDown var(--fast) ease',
            }}>
              <div style={{
                padding: 'var(--space-3)',
                borderBottom: '1px solid var(--border)',
                fontSize: 'var(--step--1)',
              }}>
                <div style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'Guest'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--step--2)', marginTop: '2px' }}>
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
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  textAlign: 'left',
                  color: 'var(--err)',
                  fontSize: 'var(--step--1)',
                  fontFamily: 'var(--sans)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--fast)',
                }}
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
