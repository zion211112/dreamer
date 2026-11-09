import { useState } from 'preact/hooks';
import { Link } from 'wouter';

interface LayoutProps {
  children: any;
}

const NAV = [
  { label: 'Dashboard', path: '/benben-os', icon: '●' },
  { label: 'Students', path: '/benben-os/students', icon: '◆' },
  { label: 'Teachers', path: '/benben-os/teachers', icon: '◆' },
  { label: 'Courses', path: '/benben-os/courses', icon: '◆' },
  { label: 'Attendance', path: '/benben-os/attendance', icon: '◆' },
  { label: 'Fees', path: '/benben-os/fees', icon: '◆' },
  { label: 'Library', path: '/benben-os/library', icon: '◆' },
];

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activePath = typeof window !== 'undefined' ? window.location.pathname : '/benben-os';

  return (
    <div className="benben-app" data-collapsed={collapsed}>
      <aside className="benben-sidebar">
        <button
          className="benben-collapse-toggle"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span aria-hidden="true">{collapsed ? '›' : '‹'}</span>
        </button>
        <div className="benben-brand">
          <span className="benben-mark">B</span>
          <span className="benben-name">Benben-OS</span>
        </div>
        <nav className="benben-nav">
          {NAV.map((item) => {
            const active = activePath === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`benben-nav-item ${active ? 'active' : ''}`}
              >
                <span className="benben-nav-icon">{item.icon}</span>
                <span className="benben-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <header className="benben-topbar">
        <div className="benben-topbar-left">
          <span className="benben-topbar-title">Benben-OS</span>
          <span className="benben-topbar-divider">·</span>
          <span className="benben-topbar-context">School operations console</span>
        </div>
        <div className="benben-topbar-right">
          <span className="benben-user">Coordinator · Kenya</span>
        </div>
      </header>
      <main className="benben-main">
        <div className="benben-wrap">{children}</div>
      </main>
    </div>
  );
}
