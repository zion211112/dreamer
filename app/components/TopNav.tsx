'use client';

import { MODULES, MODULE_ORDER, type NavItemId } from '@/lib/ontology';

export type { NavItemId };
export type ViewId = 'kemet' | 'workspace';

interface TopNavProps {
  view: ViewId;
  active: NavItemId | null;
  onNav: (id: NavItemId) => void;
  onView: (v: ViewId) => void;
  onPalette: () => void;
}

export function TopNav({ view, active, onNav, onView, onPalette }: TopNavProps) {
  return (
    <header className="header">
      <div className="brand" onClick={() => onView('kemet')} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onView('kemet'); }}>
        <span className="dot" />
        <span>aptlabs</span>
        <span className="sub">Kemet-OS · v1.4</span>
      </div>

      <nav className="nav">
        {MODULE_ORDER.map(id => {
          const m = MODULES[id];
          return (
            <button
              key={id}
              data-mod={id}
              className={view === 'workspace' && active === id ? 'active' : ''}
              onClick={() => onNav(id as NavItemId)}
            >
              <span className="pip" style={{ background: m.color, color: m.color }} />
              {m.label}
            </button>
          );
        })}
      </nav>

      <div className="view-toggle" role="tablist" aria-label="view">
        <button
          className={view === 'kemet' ? 'active' : ''}
          onClick={() => onView('kemet')}
          role="tab"
          aria-selected={view === 'kemet'}
          title="Kemet-OS — the one-page landing (⌘0)"
        >
          ◈ Kemet-OS
        </button>
        <button
          className={view === 'workspace' ? 'active' : ''}
          onClick={() => onView('workspace')}
          role="tab"
          aria-selected={view === 'workspace'}
          title="Workspace — the control surface (⌘B)"
        >
          ▤ Workspace
        </button>
      </div>

      <div className="search" onClick={onPalette} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onPalette(); }}>
        <span>⌕</span>
        <span>search aptlabs</span>
        <kbd>⌘K</kbd>
      </div>

      <div className="who">
        <span className="av">A</span>
        <span>aptlabs · control · v1.4</span>
      </div>
    </header>
  );
}
