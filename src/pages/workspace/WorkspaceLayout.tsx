import { BrandMark } from '../../components/BrandMark';
import { WorkspaceContextSwitcher } from '../../components/WorkspaceContextSwitcher';

interface WorkspaceLayoutProps {
  children: any;
  currentContext: 'people' | 'institutions' | 'commons';
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="workspace-shell" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: `
        radial-gradient(ellipse at 47% 25%, color-mix(in srgb, var(--terrain-pale) 48%, transparent), transparent 42%),
        var(--bg)
      `,
    }}>
      {/* Header */}
      <header className="atlas-header" style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: '0 clamp(14px, 2vw, 28px)',
        height: '54px',
        background: 'color-mix(in srgb, var(--bg-elev) 88%, transparent)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="atlas-header-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <BrandMark size="md" />
        </div>
        
        <div className="atlas-header-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <WorkspaceContextSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="atlas-main" style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        padding: 'clamp(22px, 3.2vw, 48px) clamp(16px, 3vw, 32px)',
      }}>
        <div style={{ width: 'min(100%, 1440px)', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="atlas-footer" style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: '0 clamp(14px, 2vw, 28px)',
        height: '28px',
        background: 'color-mix(in srgb, var(--bg-elev) 88%, transparent)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        font: '9px var(--mono)',
        letterSpacing: '.03em',
      }}>
        <span>APT-LABS — Field Desk</span>
        <span style={{ color: 'var(--text-faint)' }}>PROTOTYPE · 001</span>
      </footer>
    </div>
  );
}
