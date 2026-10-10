'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { filterCommands, CommandContext } from '@/lib/commands';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  context: CommandContext;
}

export function CommandPalette({ isOpen, onClose, context }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(
    () => filterCommands(query, context),
    [query, context]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action(context);
          onClose();
        }
        break;
    }
  }, [filteredCommands, selectedIndex, onClose, context]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass border hairline rounded-xl shadow-2xl glow-accent overflow-hidden animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b hairline flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-[13.5px] placeholder-[var(--fg-faint)]"
            placeholder="Type a command or search files..."
            autoFocus
          />
          <span className="kbd">esc</span>
        </div>

        <div ref={listRef} className="max-h-[340px] overflow-y-auto scrollbar-thin py-1.5">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="text-[var(--fg-faint)] text-[12px] mb-1">No results for</div>
              <div className="text-[var(--fg)] text-[13px] font-mono">&quot;{query}&quot;</div>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(context); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={'w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ' +
                    (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
                  style={isSelected ? { borderLeft: '2px solid var(--accent)' } : { borderLeft: '2px solid transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={'text-[12.5px] font-medium truncate ' + (isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]')}>
                        {cmd.title}
                      </span>
                      {cmd.description && (
                        <span className="text-[11px] text-[var(--fg-faint)] truncate hidden sm:inline">
                          {cmd.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--elevated)] border hairline uppercase tracking-wider text-[var(--fg-faint)] flex-shrink-0">
                    {cmd.category}
                  </span>
                  {cmd.shortcut && (
                    <span className="kbd flex-shrink-0">{cmd.shortcut}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t hairline bg-[var(--elevated)]/50 flex items-center justify-between text-[10px] text-[var(--fg-faint)]">
          <span>{filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑↓</span>
            <span className="mx-0.5">navigate</span>
            <span className="kbd">↵</span>
            <span className="mx-0.5">run</span>
            <span className="kbd">esc</span>
            <span className="mx-0.5">close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
