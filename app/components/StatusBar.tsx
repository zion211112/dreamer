'use client';

import { useState, useEffect } from 'react';

interface StatusBarProps {
  mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND';
  position: { line: number; col: number };
  total: { lines: number; chars: number };
  encoding?: string;
  language?: string;
  gitBranch?: string;
  gitStatus?: { added: number; modified: number; deleted: number };
  modified?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const MODE_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  NORMAL: { bg: 'var(--accent)', fg: '#fff', label: 'NORMAL' },
  INSERT: { bg: 'var(--success)', fg: '#0a0c10', label: 'INSERT' },
  VISUAL: { bg: 'var(--warn)', fg: '#0a0c10', label: 'VISUAL' },
  COMMAND: { bg: 'var(--danger)', fg: '#fff', label: 'COMMAND' },
};

export function StatusBar({
  mode = 'NORMAL',
  position = { line: 1, col: 1 },
  total = { lines: 1, chars: 0 },
  encoding = 'UTF-8',
  language = 'typescript',
  gitBranch = 'main',
  gitStatus = { added: 0, modified: 0, deleted: 0 },
  modified = false,
  sidebarOpen = true,
  onToggleSidebar,
}: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.NORMAL;

  return (
    <footer className="flex items-center justify-between h-7 px-3 border-t hairline bg-[var(--surface)] flex-shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2 py-[3px] rounded font-semibold"
          style={{ background: modeStyle.bg, color: modeStyle.fg, fontSize: '9.5px', letterSpacing: '0.05em' }}
        >
          {modeStyle.label}
        </div>
        {modified && (
          <span className="text-[var(--warn)] text-[10px] flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[var(--warn)]" />
            unsaved
          </span>
        )}
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          title="Toggle sidebar (Ctrl+B)"
        >
          <span className="text-[var(--accent-hi)]">⎇</span>
          <span className="text-[11px] font-mono">{gitBranch}</span>
          {gitStatus.added > 0 && <span className="text-[var(--success)] text-[10px]">+{gitStatus.added}</span>}
          {gitStatus.modified > 0 && <span className="text-[var(--warn)] text-[10px]">~{gitStatus.modified}</span>}
          {gitStatus.deleted > 0 && <span className="text-[var(--danger)] text-[10px]">-{gitStatus.deleted}</span>}
        </button>
      </div>

      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
        <span className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-[var(--accent-hi)]">Ln</span>
          <span className="tabular-nums">{position.line}</span>
          <span className="text-[var(--fg-faint)]">·</span>
          <span className="text-[var(--accent-hi)]">Col</span>
          <span className="tabular-nums">{position.col}</span>
        </span>
        <span className="w-px h-3 bg-[var(--border)]" />
        <span className="text-[10px] font-mono tabular-nums">{total.lines} lines</span>
        <span className="w-px h-3 bg-[var(--border)]" />
        <span className="text-[10px] font-mono">{encoding}</span>
        <span className="text-[10px] font-mono px-1.5 py-[2px] rounded bg-[var(--elevated)] border hairline text-[var(--accent-hi)] capitalize">
          {language}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono tabular-nums text-[var(--fg-muted)]">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="w-px h-3 bg-[var(--border)]" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-subtle" />
          <span className="text-[9px] text-[var(--fg-muted)] uppercase tracking-wider font-semibold">ready</span>
        </span>
      </div>
    </footer>
  );
}
