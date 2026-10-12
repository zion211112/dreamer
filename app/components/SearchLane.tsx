'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { DEPARTMENTS, DEPARTMENT_COLORS, WORKSPACE_ROOT, getAllFiles, findNode, FileNode } from '@/lib/ontology';
import type { NavItemId } from '@/components/TopNav';

interface SearchResult {
  id: string;
  label: string;
  hint: string;
  module: NavItemId | 'workspace';
  kind: 'node' | 'concept';
  path?: string;
}

// Real search across the ontology: nodes (files/dirs) + conceptual anchors.
// Concepts map domain vocabulary (SBT, teacher, issuance...) to modules.
const CONCEPTS: Array<{ terms: string[]; label: string; hint: string; module: NavItemId | 'workspace' }> = [
  { terms: ['sbt', 'soulbound', 'token', 'credential', 'kernel'], label: 'SBT Kernel', hint: 'where soulbound tokens are issued', module: 'kernel' },
  { terms: ['issue', 'issuance', 'mint', 'sign'], label: 'Issuance Flow', hint: 'kernel → issuance', module: 'kernel' },
  { terms: ['verify', 'verification', 'validator', 'attest'], label: 'Verification', hint: 'kernel → verification', module: 'kernel' },
  { terms: ['identity', 'did', 'key'], label: 'Identity', hint: 'kernel → identity', module: 'kernel' },
  { terms: ['school', 'institution', 'accredit', 'university', '◈'], label: 'Institutions', hint: 'schools & accreditation', module: 'network' },
  { terms: ['teacher', 'educator', 'mentor'], label: 'Teachers', hint: 'people → teachers', module: 'network' },
  { terms: ['learner', 'student'], label: 'Learners', hint: 'people → learners', module: 'network' },
  { terms: ['anchor', 'reputation'], label: 'Anchors', hint: 'people → anchors', module: 'network' },
  { terms: ['teacher console', 'console', 'build'], label: 'Teacher Console', hint: 'builds → teacher console', module: 'builds' },
  { terms: ['school console', 'dashboard', 'roster'], label: 'School Console', hint: 'builds → school console', module: 'builds' },
  { terms: ['credential wallet', 'wallet', 'present'], label: 'Credential Wallet', hint: 'builds → wallet', module: 'builds' },
  { terms: ['placement', 'engine', 'matching'], label: 'Placement Engine', hint: 'builds → engine', module: 'builds' },
  { terms: ['deploy', 'ci', 'release', 'infra'], label: 'Deploy', hint: 'operations → delivery', module: 'operations' },
  { terms: ['experiment', 'wasm', 'prototype', 'research'], label: 'Experiments', hint: 'laboratory → R&D', module: 'laboratory' },
];

function nodeToResult(node: FileNode): SearchResult {
  const parts = node.path.split('/').filter(Boolean);
  const moduleId = (parts[0] || 'workspace') as NavItemId;
  return {
    id: 'node-' + node.path,
    label: node.name,
    hint: parts.slice(0, -1).join(' / ') || 'root',
    module: moduleId,
    kind: 'node',
    path: node.path,
  };
}

export function SearchLane() {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const out: SearchResult[] = [];
    // concept matches first (domain-aware)
    for (const c of CONCEPTS) {
      if (c.terms.some(t => q.includes(t) || t.includes(q))) {
        out.push({ id: 'concept-' + c.label, label: c.label, hint: c.hint, module: c.module, kind: 'concept' });
      }
    }
    // then ontology nodes
    for (const node of getAllFiles(WORKSPACE_ROOT)) {
      if (node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q)) {
        out.push(nodeToResult(node));
      }
      if (out.length >= 24) break;
    }
    // directories too
    if (out.length < 24) {
      const seen = new Set(out.map(r => r.path));
      const walk = (n: FileNode) => {
        if (out.length >= 24) return;
        if (n.type === 'dir' && n.path !== '/' && !seen.has(n.path) && n.name.toLowerCase().includes(q)) {
          out.push(nodeToResult(n));
        }
        n.children?.forEach(walk);
      };
      walk(WORKSPACE_ROOT);
    }
    return out;
  }, [query]);

  useEffect(() => { setSelectedIndex(0); }, [results.length]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsActive(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsActive(false);
      setQuery('');
      e.currentTarget.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]?.path) {
      // open the node: notify via custom event the page listens for
      window.dispatchEvent(new CustomEvent('sbt:open-path', { detail: results[selectedIndex].path }));
      setIsActive(false);
      setQuery('');
    }
  };

  const grouped = useMemo(() => {
    const acc = new Map<string, SearchResult[]>();
    for (const r of results) {
      if (!acc.has(r.module)) acc.set(r.module, []);
      acc.get(r.module)!.push(r);
    }
    return Array.from(acc.entries());
  }, [results]);

  return (
    <div className="border-b hairline bg-[var(--surface)] flex-shrink-0 relative z-30">
      {!isActive ? (
        <button
          onClick={() => { setIsActive(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          className="flex h-9 items-center justify-center gap-2 w-full text-[var(--fg-faint)] hover:text-[var(--fg-muted)] transition-colors"
          title="Search APT-LABS (⌘K)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-3.03-3.03" />
          </svg>
          <span className="text-[10px] tracking-[0.18em] uppercase">search aptlabs</span>
          <span className="kbd" style={{ fontSize: '9px' }}>⌘K</span>
        </button>
      ) : (
        <div className="animate-fade-in">
          <div className="flex h-10 items-center gap-2.5 px-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.03-3.03" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the system — SBTs, teachers, schools, issuance, verification…"
              className="flex-1 bg-transparent text-[12.5px] text-[var(--fg)] placeholder-[var(--fg-faint)] outline-none"
            />
            <span className="text-[var(--fg-faint)] text-[10px] font-mono">{results.length} found</span>
            <button
              onClick={() => { setIsActive(false); setQuery(''); }}
              className="text-[var(--fg-faint)] hover:text-[var(--fg)] text-[11px] px-1.5"
            >
              esc
            </button>
          </div>
          {results.length > 0 && (
            <div className="border-t hairline bg-[var(--bg)] max-h-[240px] overflow-y-auto scrollbar-thin">
              <div className="px-4 py-2">
                {grouped.map(([module, moduleResults]) => {
                  const dept = DEPARTMENTS.find(d => d.id === module);
                  const color = DEPARTMENT_COLORS[module] || 'var(--accent)';
                  return (
                    <div key={module} className="mb-2.5 last:mb-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-4 h-4 flex items-center justify-center rounded text-[9px]"
                          style={{ background: color + '1a', color, border: `1px solid ${color}44` }}
                        >
                          {dept?.icon || '⬡'}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                          {dept?.name || module}
                        </span>
                      </div>
                      <div className="space-y-px">
                        {moduleResults.map((r, i) => {
                          const globalIndex = results.indexOf(r);
                          const isSelected = globalIndex === selectedIndex;
                          return (
                            <div
                              key={r.id}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              onClick={() => {
                                if (r.path) {
                                  window.dispatchEvent(new CustomEvent('sbt:open-path', { detail: r.path }));
                                  setIsActive(false);
                                  setQuery('');
                                }
                              }}
                              className={'flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ' +
                                (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
                            >
                              <span className={'text-[9px] font-mono px-1 rounded ' + (r.kind === 'concept' ? 'text-[var(--accent-hi)] bg-[var(--accent-soft)]' : 'text-[var(--fg-faint)]')}>
                                {r.kind === 'concept' ? '◆' : (r.path?.match(/\.(\w+)$/)?.[1] || '·')}
                              </span>
                              <span className="flex-1 text-[12px] text-[var(--fg)] truncate">{r.label}</span>
                              <span className="text-[10px] text-[var(--fg-faint)] truncate max-w-[40%]">{r.hint}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="border-t hairline bg-[var(--bg)] px-4 py-6 text-center">
              <p className="text-[11px] text-[var(--fg-faint)]">Nothing in the system matches <span className="text-[var(--fg)] font-mono">&quot;{query}&quot;</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
