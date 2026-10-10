'use client';

import { DEPARTMENTS, DEPARTMENT_COLORS } from '@/lib/ontology';

export type NavItemId = 'workspace' | 'foundation' | 'products' | 'design' | 'operations' | 'laboratory';

const NAV_ITEMS: Array<{ id: NavItemId; label: string; hint: string }> = [
  { id: 'workspace', label: 'Workspace', hint: 'all modules' },
  { id: 'foundation', label: 'Foundation', hint: 'core primitives' },
  { id: 'products', label: 'Products', hint: 'shipping surfaces' },
  { id: 'design', label: 'Design', hint: 'tokens & system' },
  { id: 'operations', label: 'Operations', hint: 'infra & delivery' },
  { id: 'laboratory', label: 'Laboratory', hint: 'R&D prototypes' },
];

function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <div
      className="rounded-md flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
        boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z" />
        <path d="M14 3v6h6" />
        <path d="M9 13h6M9 16.5h4" />
      </svg>
    </div>
  );
}

export function TopNav({ active, onNav, onPalette }: {
  active: NavItemId;
  onNav: (id: NavItemId) => void;
  onPalette: () => void;
}) {
  return (
    <header className="glass border-b hairline flex items-center h-14 px-5 gap-4 select-none flex-shrink-0 relative z-40">
      {/* brand — left */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <BrandMark />
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight font-display">aptlabs</span>
          <span className="text-[9px] text-[var(--fg-faint)] tracking-[0.14em] uppercase">control surface</span>
        </div>
      </div>

      <div className="w-px h-5 bg-[var(--border)] flex-shrink-0" />

      {/* 6 modules — classic centered */}
      <nav className="flex items-center justify-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          const color = item.id === 'workspace' ? undefined : DEPARTMENT_COLORS[item.id as string];
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={item.hint}
              className={'relative px-3 py-1.5 text-[12.5px] font-medium transition-colors rounded-md ' +
                (isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]')}
            >
              {color && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                  style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
                />
              )}
              {item.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* right cluster: search + dashboard/profile */}
      <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto">
        <button
          onClick={onPalette}
          className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-md border hairline bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-all text-[12px] w-56"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="flex-1 text-left">Search anything…</span>
          <span className="kbd">⌘K</span>
        </button>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* dashboard / profile — GitHub-style head, personalized */}
        <button
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-[var(--border)] transition-colors group"
          title="aptlabs / control"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold font-display"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #7c6cff 55%, #56c8dc 100%)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.14), 0 2px 8px rgba(59,130,246,0.4)',
            }}
          >
            A
          </div>
          <div className="flex flex-col items-start leading-none hidden sm:block">
            <span className="text-[12px] font-semibold text-[var(--fg)] group-hover:text-white transition-colors">aptlabs</span>
            <span className="text-[9.5px] text-[var(--fg-faint)] font-mono mt-[3px]">● control · v1.4</span>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-1">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
