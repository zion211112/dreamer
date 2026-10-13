'use client';

import { MODULES, MODULE_ORDER, type NavItemId } from '@/lib/ontology';

export type { NavItemId };

interface TopNavProps {
  active: NavItemId;
  onNav: (id: NavItemId) => void;
  onPalette: () => void;
}

export function TopNav({ active, onNav, onPalette }: TopNavProps) {
  return (
    <header className="header">
      <div className="brand">
        <span className="dot" />
        <span>aptlabs</span>
        <span className="sub">control surface</span>
      </div>
      <nav className="nav">
        {MODULE_ORDER.map(id => {
          const m = MODULES[id];
          return (
            <button
              key={id}
              data-mod={id}
              className={active === id ? 'active' : ''}
              onClick={() => onNav(id as NavItemId)}
            >
              <span className="pip" style={{ background: m.color, color: m.color }} />
              {m.label}
            </button>
          );
        })}
      </nav>
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
