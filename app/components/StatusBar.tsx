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
}

const MODE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  NORMAL: { bg: 'bg-[var(--accent)]', text: 'text-[var(--bg)]', label: 'NORMAL' },
  INSERT: { bg: 'bg-[var(--success)]', text: 'text-[var(--bg)]', label: 'INSERT' },
  VISUAL: { bg: 'bg-[var(--warn)]', text: 'text-[var(--bg)]', label: 'VISUAL' },
  COMMAND: { bg: 'bg-[var(--danger)]', text: 'text-[var(--bg)]', label: 'COMMAND' },
};

export function StatusBar({
  mode = 'NORMAL',
  position = { line: 1, col: 1 },
  total = { lines: 1, chars: 0 },
  encoding = 'UTF-8',
  language = 'typescript',
  gitBranch = 'main',
  gitStatus = { added: 0, modified: 0, deleted: 0 }
}: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.NORMAL;

  return (
    <div className="flex items-center justify-between h-7 px-3 border-t border-[var(--border)] bg-[var(--card)] terminal-font text-[11px]">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${modeStyle.bg} ${modeStyle.text} font-medium`}>
          {modeStyle.label}
        </div>
        {gitBranch && (
          <div className="flex items-center gap-1 text-[var(--fg-muted)]">
            <span className="text-[var(--accent)]">⎇</span>
            <span>{gitBranch}</span>
            {gitStatus.added > 0 && <span className="text-[var(--success)]">+{gitStatus.added}</span>}
            {gitStatus.modified > 0 && <span className="text-[var(--warn)]">~{gitStatus.modified}</span>}
            {gitStatus.deleted > 0 && <span className="text-[var(--danger)]">-{gitStatus.deleted}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-[var(--fg-muted)]">
        <span className="flex items-center gap-1">
          <span className="text-[var(--accent)]">Ln</span>
          <span className="font-mono">{position.line}</span>
          <span className="text-[var(--accent)]">Col</span>
          <span className="font-mono">{position.col}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="font-mono">{total.lines}</span>
          <span className="text-[var(--fg-muted)]">lines</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="font-mono">{encoding}</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg)] rounded border border-[var(--border)]">
          <span className="text-[var(--accent)]">{language}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
        <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        <span className="w-px h-4 bg-[var(--border)]"></span>
        <span className="flex items-center gap-1 animate-pulse-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          <span className="text-[var(--accent)]">READY</span>
        </span>
      </div>
    </div>
  );
}