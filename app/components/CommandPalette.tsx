'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MODULES, MODULE_ORDER, TREE, type NavItemId } from '@/lib/ontology';
import type { ViewId } from '@/components/TopNav';

interface CommandPaletteProps {
  isOpen: boolean;
  view: ViewId;
  onClose: () => void;
  onNav: (id: NavItemId) => void;
  onView: (v: ViewId) => void;
  onSelectFile: (id: string) => void;
  onToggleAgent: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  sub: string;
  kbd: string;
  icon: string;
  act: () => void;
}

export function CommandPalette({ isOpen, view, onClose, onNav, onView, onSelectFile, onToggleAgent }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const commands: PaletteItem[] = useMemo(() => [
    {
      id: 'nav-kemet',
      label: 'Go to Kemet-OS',
      sub: 'the one-page landing',
      kbd: '⌘0',
      icon: '◈',
      act: () => onView('kemet'),
    },
    ...MODULE_ORDER.map((id, i) => ({
      id: `nav-${id}`,
      label: `Go to ${MODULES[id].title}`,
      sub: 'module',
      kbd: `⌘${i + 1}`,
      icon: MODULES[id].icon,
      act: () => onNav(id as NavItemId),
    })),
    {
      id: 'view-workspace',
      label: view === 'workspace' ? 'Show Kemet-OS landing' : 'Show Workspace',
      sub: 'toggle the branch',
      kbd: '⌘B',
      icon: '▤',
      act: () => onView(view === 'workspace' ? 'kemet' : 'workspace'),
    },
    {
      id: 'agent-toggle',
      label: 'Toggle Hermes Agent',
      sub: '⌘⇧A',
      kbd: '',
      icon: '◈',
      act: () => onToggleAgent(),
    },
    {
      id: 'mint',
      label: 'Mint current file to The Roll',
      sub: 'action',
      kbd: '',
      icon: '◈',
      act: () => {},
    },
  ], [onNav, onView, onToggleAgent, view]);

  const files: PaletteItem[] = useMemo(() => {
    const out: PaletteItem[] = [];
    for (const mod of MODULE_ORDER) {
      for (const f of TREE[mod].files) {
        out.push({
          id: f.id,
          label: f.name,
          sub: f.id,
          kbd: '',
          icon: '▤',
          act: () => onSelectFile(f.id),
        });
      }
    }
    return out;
  }, [onSelectFile]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { cmds: commands.slice(0, 7), files: files.slice(0, 5) };
    return {
      cmds: commands.filter(c => c.label.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q)),
      files: files.filter(f => f.label.toLowerCase().includes(q) || f.sub.toLowerCase().includes(q)),
    };
  }, [query, commands, files]);

  const flat = useMemo(() => [...filtered.cmds, ...filtered.files], [filtered]);

  useEffect(() => {
    if (idx >= flat.length) setIdx(Math.max(0, flat.length - 1));
  }, [flat.length, idx]);

  useEffect(() => {
    const active = listRef.current?.querySelector('.palette-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  const runIndex = (i: number) => {
    const item = flat[i];
    if (!item) return;
    onClose();
    item.act();
  };

  if (!isOpen) return null;

  return (
    <div className="palette-overlay open" onClick={onClose}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setIdx(0); }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(flat.length - 1, i + 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
            else if (e.key === 'Enter') { e.preventDefault(); runIndex(idx); }
            else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
          }}
          placeholder="Type a command or search files…"
          autoComplete="off"
        />
        <div className="palette-list" ref={listRef}>
          {filtered.cmds.length > 0 && (
            <>
              <div className="palette-section">commands</div>
              {filtered.cmds.map((c, i) => (
                <PaletteRow key={c.id} item={c} active={idx === i} onHover={() => setIdx(i)} onClick={() => runIndex(i)} />
              ))}
            </>
          )}
          {filtered.files.length > 0 && (
            <>
              <div className="palette-section">files</div>
              {filtered.files.map((c, i) => (
                <PaletteRow key={c.id} item={c} active={idx === filtered.cmds.length + i} onHover={() => setIdx(filtered.cmds.length + i)} onClick={() => runIndex(filtered.cmds.length + i)} />
              ))}
            </>
          )}
          {filtered.cmds.length === 0 && filtered.files.length === 0 && (
            <div className="palette-section" style={{ textAlign: 'center', padding: '32px' }}>No matches</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaletteRow({ item, active, onHover, onClick }: { item: PaletteItem; active: boolean; onHover: () => void; onClick: () => void }) {
  return (
    <div
      className={'palette-item' + (active ? ' active' : '')}
      onMouseEnter={onHover}
      onClick={onClick}
    >
      <div className="ic">{item.icon}</div>
      <div className="label">
        <div>{item.label}</div>
        <div className="sub">{item.sub}</div>
      </div>
      {item.kbd && <span className="kbd">{item.kbd}</span>}
    </div>
  );
}
