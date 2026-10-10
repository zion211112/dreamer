'use client';

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';

interface Command {
  id: string;
  title: string;
  description?: string;
  shortcut?: string;
  category: string;
  action: () => void;
  keywords: string[];
}

const COMMANDS: Command[] = [
  // File operations
  { id: 'new-file', title: 'New File', description: 'Create a new file', shortcut: 'Ctrl+N', category: 'File', action: () => {}, keywords: ['new', 'create', 'file'] },
  { id: 'open-file', title: 'Open File...', description: 'Open file from workspace', shortcut: 'Ctrl+P', category: 'File', action: () => {}, keywords: ['open', 'file', 'find'] },
  { id: 'save-file', title: 'Save File', description: 'Save current file', shortcut: 'Ctrl+S', category: 'File', action: () => {}, keywords: ['save', 'write'] },
  { id: 'save-all', title: 'Save All', description: 'Save all open files', shortcut: 'Ctrl+K S', category: 'File', action: () => {}, keywords: ['save', 'all'] },
  { id: 'close-file', title: 'Close File', description: 'Close current tab', shortcut: 'Ctrl+W', category: 'File', action: () => {}, keywords: ['close', 'tab'] },

  // Edit operations
  { id: 'undo', title: 'Undo', description: 'Undo last action', shortcut: 'Ctrl+Z', category: 'Edit', action: () => {}, keywords: ['undo', 'back'] },
  { id: 'redo', title: 'Redo', description: 'Redo last undone action', shortcut: 'Ctrl+Shift+Z', category: 'Edit', action: () => {}, keywords: ['redo', 'forward'] },
  { id: 'find', title: 'Find in File', description: 'Search in current file', shortcut: 'Ctrl+F', category: 'Edit', action: () => {}, keywords: ['find', 'search', 'replace'] },
  { id: 'find-replace', title: 'Replace in File', description: 'Find and replace in current file', shortcut: 'Ctrl+H', category: 'Edit', action: () => {}, keywords: ['replace', 'find'] },
  { id: 'find-in-files', title: 'Search in Workspace', description: 'Search across all files', shortcut: 'Ctrl+Shift+F', category: 'Edit', action: () => {}, keywords: ['search', 'workspace', 'grep'] },

  // Navigation
  { id: 'go-to-line', title: 'Go to Line...', description: 'Jump to specific line', shortcut: 'Ctrl+G', category: 'Navigation', action: () => {}, keywords: ['goto', 'line', 'jump'] },
  { id: 'go-to-symbol', title: 'Go to Symbol...', description: 'Jump to symbol in file', shortcut: 'Ctrl+Shift+O', category: 'Navigation', action: () => {}, keywords: ['symbol', 'function', 'class'] },
  { id: 'go-to-definition', title: 'Go to Definition', description: 'Jump to definition', shortcut: 'F12', category: 'Navigation', action: () => {}, keywords: ['definition', 'jump', 'go'] },
  { id: 'quick-open', title: 'Quick Open', description: 'Quick open file by name', shortcut: 'Ctrl+P', category: 'Navigation', action: () => {}, keywords: ['quick', 'open', 'file'] },

  // Terminal
  { id: 'new-terminal', title: 'New Terminal', description: 'Open new integrated terminal', shortcut: 'Ctrl+`', category: 'Terminal', action: () => {}, keywords: ['terminal', 'shell', 'command'] },
  { id: 'run-task', title: 'Run Task...', description: 'Run a configured task', shortcut: 'Ctrl+Shift+P', category: 'Terminal', action: () => {}, keywords: ['task', 'run', 'build'] },

  // View
  { id: 'toggle-sidebar', title: 'Toggle Sidebar', description: 'Show/hide file explorer', shortcut: 'Ctrl+B', category: 'View', action: () => {}, keywords: ['sidebar', 'explorer', 'toggle'] },
  { id: 'toggle-panel', title: 'Toggle Panel', description: 'Show/hide bottom panel', shortcut: 'Ctrl+J', category: 'View', action: () => {}, keywords: ['panel', 'terminal', 'output'] },
  { id: 'zen-mode', title: 'Toggle Zen Mode', description: 'Distraction-free editing', shortcut: 'Ctrl+K Z', category: 'View', action: () => {}, keywords: ['zen', 'focus', 'distraction'] },

  // Proto.shell specific
  { id: 'spawn-agent', title: 'Spawn Agent', description: 'Launch a new AI agent', shortcut: 'Ctrl+Shift+A', category: 'Proto', action: () => {}, keywords: ['agent', 'spawn', 'ai', 'launch'] },
  { id: 'run-workflow', title: 'Run Workflow', description: 'Execute a workflow', shortcut: 'Ctrl+Shift+W', category: 'Proto', action: () => {}, keywords: ['workflow', 'run', 'execute'] },
  { id: 'view-memory', title: 'View Memory', description: 'Inspect agent memory', shortcut: 'Ctrl+Shift+M', category: 'Proto', action: () => {}, keywords: ['memory', 'inspect', 'view'] },
  { id: 'sync-design', title: 'Sync Design System', description: 'Sync with design system', shortcut: 'Ctrl+Shift+D', category: 'Proto', action: () => {}, keywords: ['design', 'sync', 'system'] },
];

function matchCommand(query: string, cmd: Command): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const title = cmd.title.toLowerCase();
  const desc = cmd.description?.toLowerCase() || '';

  // Exact prefix match on title
  if (title.startsWith(q)) score += 100;
  // Title contains query
  else if (title.includes(q)) score += 50;
  // Description contains query
  else if (desc.includes(q)) score += 25;
  // Keywords match
  else if (cmd.keywords.some(k => k.includes(q) || q.includes(k))) score += 30;
  // Fuzzy match on title
  else {
    let ti = 0;
    for (const c of q) {
      const idx = title.indexOf(c, ti);
      if (idx === -1) { score = 0; break; }
      score += idx === ti ? 10 : 1;
      ti = idx + 1;
    }
  }

  return score;
}

export function CommandPalette({
  isOpen,
  onClose,
  onCommand
}: {
  isOpen: boolean;
  onClose: () => void;
  onCommand?: (cmd: Command) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS
    .map(cmd => ({ cmd, score: matchCommand(query, cmd) }))
    .filter(x => x.score > 0 || !query)
    .sort((a, b) => b.score - a.score)
    .map(x => x.cmd);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
          onCommand?.(filteredCommands[selectedIndex]);
          onClose();
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onCommand?.(filteredCommands[selectedIndex]);
        }
        break;
    }
  }, [filteredCommands, selectedIndex, onClose, onCommand]);

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl glow-accent overflow-hidden terminal-font"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-[14px]">⌘</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--fg)] text-[14px] placeholder-[var(--fg-muted)]"
              placeholder="Type a command or search..."
              autoFocus
            />
            <kbd className="px-2 py-0.5 text-[10px] bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--fg-muted)]">
              Esc
            </kbd>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-[400px] overflow-y-auto scrollbar-thin"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--fg-muted)]">
              <div className="text-[var(--accent)] text-2xl mb-2">🔍</div>
              <p>{'No commands match "' + query + '"'}</p>
              <p className="text-[11px] mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => { onCommand?.(cmd); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'hover:bg-[var(--fg)]/5 text-[var(--fg)]'
                  }`}
                  style={{ borderLeft: index === selectedIndex ? '2px solid var(--accent)' : '2px solid transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{cmd.title}</span>
                      {cmd.description && (
                        <span className="text-[var(--fg-muted)] text-[11px] truncate">{cmd.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 text-[9px] bg-[var(--bg)] border border-[var(--border)] rounded uppercase tracking-wider text-[var(--fg-muted)]">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-2 py-0.5 text-[10px] bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--fg-muted)] font-mono whitespace-nowrap shrink-0">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-[10px] text-[var(--fg-muted)]">
          <span>{filteredCommands.length} commands</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">↓</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">Enter</kbd>
            <span className="mx-1">select</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">Esc</kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </div>
  );
}