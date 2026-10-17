'use client';

import { MODULES, MODULE_ORDER, type NavItemId } from '@/lib/ontology';
import { useSession } from '@/lib/session';

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
  const { me } = useSession();
  return (
    <header className="header">
      <div className="brand" onClick={() => onView('kemet')} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onView('kemet'); }}>
        <span className="dot" />
        <span>aptlabs</span>
        <span className="sub">the record · v1.4</span>
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
          title="the record — the one-page landing (⌘0)"
        >
          ◈ the record
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

      <div
        className="who"
        title={me ? `${me.name} · ${me.sbt} · rights: ${me.rights.join(' · ')}` : 'unclaimed — claim your identity SBT (⌘1 kernel)'}
      >
        <span className={'av' + (me ? ' claimed' : ' unclaimed')} style={me ? { background: me.color } : undefined}>
          {me ? me.av : 'A'}
        </span>
        <span className="who-meta">
          {me ? (
            <>
              <span className="who-name">{me.name}</span>
              <span className="who-sbt">{me.sbt} · on the roll</span>
            </>
          ) : (
            <>
              <span className="who-name dim">unclaimed</span>
              <span className="who-sbt">claim your SBT · ⌘1</span>
            </>
          )}
        </span>
      </div>
    </header>
  );
}
