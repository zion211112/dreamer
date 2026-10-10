'use client';

import { DEPARTMENTS, DEPARTMENT_COLORS } from '@/lib/ontology';

export type NavItemId = 'workspace' | 'foundation' | 'products' | 'design' | 'operations' | 'laboratory';

const NAV_ITEMS: Array<{ id: NavItemId; label: string; hint: string }> = [
  { id: 'workspace', label: 'Workspace', hint: 'all departments' },
  { id: 'foundation', label: 'Foundation', hint: 'core primitives' },
  { id: 'products', label: 'Products', hint: 'shipping surfaces' },
  { id: 'design', label: 'Design', hint: 'tokens & system' },
  { id: 'operations', label: 'Operations', hint: 'infra & delivery' },
  { id: 'laboratory', label: 'Laboratory', hint: 'R&D prototypes' },
];

export function TopNav({ active, onNav, onPalette }: {
  active: NavItemId;
  onNav: (id: NavItemId) => void;
  onPalette: () => void;
}) {
  return (
    <header className="glass border-b hairline flex items-center h-12 px-4 gap-4 select-none flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 pr-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)' }}>
          <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>W</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight">workspace</span>
          <span className="text-[9px] text-[var(--fg-faint)] tracking-wider uppercase">file manager</span>
        </div>
      </div>

      <div className="w-px h-5 bg-[var(--border)]" />

      {/* Nav items */}
      <nav className="flex items-center gap-1 flex-1 min-w-0">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          const color = item.id === 'workspace' ? undefined : DEPARTMENT_COLORS[item.id as string];
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={item.hint}
              className={`relative px-3 py-1.5 rounded-md text-[12px] font-medium transition-all
                ${isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]'}`}
              style={isActive ? { background: 'var(--accent-soft)' } : undefined}
            >
              {color && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                  style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
                />
              )}
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border hairline bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-all text-[12px]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span>Search</span>
          <span className="kbd">⌘K</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-subtle" />
          <span className="text-[10px] text-[var(--fg-faint)] uppercase tracking-wider font-medium">ready</span>
        </div>
      </div>
    </header>
  );
}
