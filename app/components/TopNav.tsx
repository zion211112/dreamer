'use client';

import { useState, useEffect, useRef } from 'react';
import { DEPARTMENTS, DEPARTMENT_COLORS } from '@/lib/ontology';

export type NavItemId = 'workspace' | 'kernel' | 'network' | 'builds' | 'operations' | 'laboratory';

const NAV_ITEMS: Array<{ id: NavItemId; label: string; hint: string }> = [
  { id: 'workspace', label: 'Workspace', hint: 'control dashboard' },
  { id: 'kernel', label: 'Kernel', hint: 'SBT primitives' },
  { id: 'network', label: 'Network', hint: 'institutions · people' },
  { id: 'builds', label: 'Builds', hint: 'consoles · wallet · engine' },
  { id: 'operations', label: 'Operations', hint: 'infra & delivery' },
  { id: 'laboratory', label: 'Laboratory', hint: 'R&D prototypes' },
];

// Masterpiece Minimal User Profile Dropdown
function UserProfileDropdown({ active, onNav }: { active: NavItemId; onNav: (id: NavItemId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const key = 'z6MkhaXgBZDvp...K7R2P'; // mock DID key fingerprint

  return (
    <div className="relative flex-shrink-0 ml-auto" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-[var(--border)] transition-colors group"
        title="aptlabs / control"
        aria-expanded={open}
        aria-haspopup="true"
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
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-1 transition-transform duration-150" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-72 glass border hairline rounded-xl shadow-2xl overflow-hidden animate-slide-in z-50">
          {/* Identity Card */}
          <div className="px-4 py-3 border-b hairline">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold font-display"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #7c6cff 55%, #56c8dc 100%)',
                  boxShadow: '0 0 0 1.5px rgba(255,255,255,0.14), 0 2px 8px rgba(59,130,246,0.4)',
                }}
              >
                A
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--fg)]">aptlabs</div>
                <div className="text-[10px] text-[var(--fg-faint)] font-mono">operator · control</div>
              </div>
            </div>
            <div className="text-[10px] text-[var(--fg-faint)] font-mono">
              <span className="text-[var(--fg-muted)]">DID:</span>{' '}
              <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded text-[9px] font-mono select-all cursor-pointer hover:text-[var(--accent)] transition-colors" title="Click to copy">{key}</code>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-4 py-3 border-b hairline grid grid-cols-2 gap-3">
            <div className="panel px-3 py-2 rounded-lg">
              <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-0.5">Reputation</div>
              <div className="text-[13px] font-semibold text-[var(--fg)] flex items-center gap-1">
                <span className="text-[var(--warn)]">⭐</span> 1,247
              </div>
            </div>
            <div className="panel px-3 py-2 rounded-lg">
              <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-0.5">Builds</div>
              <div className="text-[13px] font-semibold text-[var(--fg)] flex items-center gap-1">
                <span className="text-[var(--accent-hi)]">📦</span> 8
              </div>
            </div>
            <div className="panel px-3 py-2 rounded-lg">
              <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-0.5">Forks</div>
              <div className="text-[13px] font-semibold text-[var(--fg)] flex items-center gap-1">
                <span className="text-[var(--cyan)]">⌘</span> 3
              </div>
            </div>
            <div className="panel px-3 py-2 rounded-lg">
              <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-0.5">SBTs</div>
              <div className="text-[13px] font-semibold text-[var(--fg)] flex items-center gap-1">
                <span className="text-[var(--success)]">🎓</span> 7
              </div>
            </div>
          </div>

          {/* Quick Module Switch */}
          <div className="px-4 py-3 border-b hairline">
            <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-2 px-1">Modules</div>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.filter(d => d.id !== 'workspace').map(d => {
                const color = DEPARTMENT_COLORS[d.id] || 'var(--accent)';
                const isActive = active === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => { onNav(d.id as NavItemId); setOpen(false); }}
                    className={'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ' +
                      (isActive
                        ? 'text-white shadow-sm'
                        : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]')}
                    style={isActive ? { background: color } : undefined}
                  >
                    <span style={{ color: isActive ? 'white' : color }}>{d.icon}</span>
                    <span>{d.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Shortcuts */}
          <div className="px-4 py-2 border-b hairline">
            <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--fg-faint)] mb-2 px-1">Shortcuts</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[var(--border)] transition-colors text-[11px]">
                <kbd className="kbd text-[9px] w-14 text-center">⌘K</kbd>
                <span className="text-[var(--fg-muted)]">Search</span>
              </div>
              <div className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[var(--border)] transition-colors text-[11px]">
                <kbd className="kbd text-[9px] w-14 text-center">⌘P</kbd>
                <span className="text-[var(--fg-muted)]">Commands</span>
              </div>
              <div className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[var(--border)] transition-colors text-[11px]">
                <kbd className="kbd text-[9px] w-14 text-center">⌘B</kbd>
                <span className="text-[var(--fg-muted)]">Sidebar</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--fg-faint)] font-mono">v1.4 · stable</span>
            <span className="flex items-center gap-1 text-[9.5px] text-[var(--success)]">
              <span className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse-subtle" />
              live
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

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

      {/* masterpiece minimal user profile */}
      <UserProfileDropdown active={active} onNav={onNav} />
    </header>
  );
}
