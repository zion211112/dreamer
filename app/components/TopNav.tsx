'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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

      {/* 6 modules — dead-centered in remaining space */}
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id;
            const color = item.id === 'workspace' ? undefined : DEPARTMENT_COLORS[item.id as string];
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                title={item.hint}
                className={'relative px-3 py-1.5 text-[12.5px] font-medium transition-colors rounded-md ' +
                  (isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]')}>
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
      </div>

      {/* dashboard / profile — GitHub-style head with minimal dropdown */}
      <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto" ref={dropdownRef}>
        <button
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-[var(--border)] transition-colors group"
          title="aptlabs / control"
          onClick={() => setProfileOpen(v => !v)}
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

        {profileOpen && (
          <div className="absolute top-12 right-5 w-64 glass border hairline rounded-xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-4 py-3 border-b hairline">
              <div className="text-[12px] font-semibold text-[var(--fg)]">aptlabs</div>
              <div className="text-[10px] text-[var(--fg-faint)] font-mono mt-0.5">operator · control</div>
            </div>
            <div className="py-1.5">
              <div className="px-4 py-1 text-[9px] uppercase tracking-[0.14em] text-[var(--fg-faint)]">Modules</div>
              {DEPARTMENTS.map(d => {
                const color = DEPARTMENT_COLORS[d.id] || 'var(--accent)';
                const isActive = active === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => { onNav(d.id as NavItemId); setProfileOpen(false); }}
                    className={'w-full flex items-center gap-2.5 px-4 py-1.5 text-left transition-colors ' +
                      (isActive ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
                  >
                    <span
                      className="w-4 h-4 flex items-center justify-center rounded text-[9px]"
                      style={{ background: color + '1a', color, border: `1px solid ${color}44` }}
                    >
                      {d.icon}
                    </span>
                    <span className={'text-[12px] ' + (isActive ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)]')}>
                      {d.name}
                    </span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t hairline flex items-center justify-between">
              <span className="text-[9.5px] text-[var(--fg-faint)] font-mono">v1.4 · stable</span>
              <span className="flex items-center gap-1 text-[9.5px] text-[var(--success)]">
                <span className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse-subtle" />
                live
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
