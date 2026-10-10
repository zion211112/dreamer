'use client';

import { useMemo } from 'react';
import { FileNode, findNode, DEPARTMENT_COLORS, getAllFiles } from '@/lib/ontology';
import { formatSize, formatDate, countLines } from '@/lib/editor';
import { getMockContent } from '@/lib/editor';

interface InspectorProps {
  node: FileNode | null;
  onOpenFile: (path: string) => void;
  onToggle: (path: string) => void;
  expandedPaths: Set<string>;
}

/** Extract top-level declarations from source text */
function extractSymbols(content: string, language: string): Array<{ kind: string; name: string; line: number }> {
  const symbols: Array<{ kind: string; name: string; line: number }> = [];
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const ln = i + 1;
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Za-z_$][\w$]*)/))) {
      symbols.push({ kind: 'fn', name: m[1], line: ln });
    } else if ((m = line.match(/^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::|\=)/))) {
      const isType = /:\s*(interface|type|Record|Array|Promise)/.test(line) || /\s*=\s*\{/.test(line) === false && /:\s*[A-Z]/.test(line);
      symbols.push({ kind: line.includes('=>') || line.includes('{') ? 'const' : 'const', name: m[1], line: ln });
    } else if ((m = line.match(/^\s*(?:export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)/))) {
      symbols.push({ kind: 'type', name: m[1], line: ln });
    } else if ((m = line.match(/^\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/))) {
      symbols.push({ kind: 'class', name: m[1], line: ln });
    } else if ((m = line.match(/^\s*(?:export\s+)?async\s+function\s+([A-Za-z_$][\w$]*)/))) {
      symbols.push({ kind: 'fn', name: m[1], line: ln });
    }
  });
  return symbols.slice(0, 14);
}

function KindBadge({ kind }: { kind: string }) {
  const styles: Record<string, { bg: string; fg: string; label: string }> = {
    fn: { bg: 'rgba(86, 200, 220, 0.12)', fg: 'var(--cyan)', label: 'fn' },
    const: { bg: 'rgba(124, 108, 255, 0.12)', fg: 'var(--accent-hi)', label: 'const' },
    type: { bg: 'rgba(240, 180, 90, 0.12)', fg: 'var(--warn)', label: 'type' },
    class: { bg: 'rgba(74, 222, 128, 0.12)', fg: 'var(--success)', label: 'class' },
  };
  const s = styles[kind] || styles.const;
  return (
    <span
      className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

export function Inspector({ node, onOpenFile, onToggle, expandedPaths }: InspectorProps) {
  const breadcrumbs = useMemo(() => {
    if (!node) return [];
    const parts = node.path.split('/').filter(Boolean);
    const crumbs: Array<{ name: string; path: string }> = [];
    let acc = '';
    for (const p of parts) {
      acc += '/' + p;
      crumbs.push({ name: p, path: acc });
    }
    return crumbs;
  }, [node]);

  const children = node?.type === 'dir' ? node.children : null;
  const symbols = useMemo(() => {
    if (!node || node.type !== 'file') return [];
    return extractSymbols(getMockContent(node.path), node.name.split('.').pop() || '');
  }, [node]);

  const isDir = node?.type === 'dir';
  const descendantFiles = useMemo(() => (isDir && node ? getAllFiles(node).length : 0), [node, isDir]);

  if (!node) {
    return (
      <aside className="w-72 border-l hairline glass hidden lg:flex flex-col flex-shrink-0">
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-[11px] text-[var(--fg-faint)] text-center leading-relaxed">
            Select anything in the explorer to inspect it.<br />
            Every node is a page.
          </p>
        </div>
      </aside>
    );
  }

  const deptId = node.path.split('/')[1];
  const deptColor = DEPARTMENT_COLORS[deptId] || 'var(--accent)';

  return (
    <aside className="w-72 border-l hairline glass hidden lg:flex flex-col flex-shrink-0 overflow-hidden">
      {/* breadcrumb */}
      <div className="px-3 py-2 border-b hairline flex items-center gap-1 flex-shrink-0 overflow-x-auto scrollbar-thin">
        {breadcrumbs.map((c, i) => (
          <span key={c.path} className="flex items-center gap-1 flex-shrink-0">
            {i > 0 && <span className="text-[var(--fg-faint)] text-[10px]">/</span>}
            <button
              onClick={() => onOpenFile(c.path)}
              className={`text-[10px] px-1 py-0.5 rounded hover:bg-[var(--border)] transition-colors ${
                i === breadcrumbs.length - 1 ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)]'
              }`}
            >
              {c.name}
            </button>
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {/* identity card */}
        <div className="p-4 border-b hairline">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-mono"
              style={{ background: `${deptColor}14`, color: deptColor, border: `1px solid ${deptColor}33` }}
            >
              {isDir ? '▸' : (node.name.split('.').pop() || '·')}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate">{node.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--fg-faint)]">
                {isDir ? 'directory' : node.name.split('.').pop() + ' file'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="panel px-2.5 py-2">
              <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] mb-0.5">
                {isDir ? 'children' : 'size'}
              </div>
              <div className="text-[13px] font-mono font-medium">
                {isDir ? (node.children?.length ?? 0) : formatSize(node.size || 0)}
              </div>
            </div>
            <div className="panel px-2.5 py-2">
              <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] mb-0.5">
                {isDir ? 'files inside' : 'lines'}
              </div>
              <div className="text-[13px] font-mono font-medium">
                {isDir ? descendantFiles : countLines(getMockContent(node.path))}
              </div>
            </div>
            {node.modified && (
              <div className="panel px-2.5 py-2 col-span-2">
                <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] mb-0.5">modified</div>
                <div className="text-[11px] font-mono text-[var(--fg-muted)]">{formatDate(node.modified)}</div>
              </div>
            )}
          </div>
        </div>

        {/* directory: children list */}
        {isDir && children && (
          <div className="p-3">
            <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] px-1 mb-2 font-semibold">
              Contents — {children.length}
            </div>
            <div className="space-y-0.5">
              {children.map(child => {
                const expanded = expandedPaths.has(child.path);
                const cIsDir = child.type === 'dir';
                return (
                  <button
                    key={child.id}
                    onClick={() => cIsDir ? onToggle(child.path) : onOpenFile(child.path)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--border)] transition-colors group"
                  >
                    <span className="w-3 text-center text-[9px] text-[var(--fg-faint)]">
                      {cIsDir ? (expanded ? '▾' : '▸') : ''}
                    </span>
                    <span className={`text-[10px] w-4 text-center ${cIsDir ? 'text-[var(--accent-hi)]' : 'text-[var(--fg-faint)]'}`}>
                      {cIsDir ? '▸' : '·'}
                    </span>
                    <span className="flex-1 text-left text-[12px] text-[var(--fg-muted)] group-hover:text-[var(--fg)] truncate">
                      {child.name}
                    </span>
                    {child.size !== undefined && (
                      <span className="text-[9px] font-mono text-[var(--fg-faint)]">{formatSize(child.size)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* file: symbols / functions */}
        {!isDir && symbols.length > 0 && (
          <div className="p-3">
            <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] px-1 mb-2 font-semibold">
              Exports — {symbols.length}
            </div>
            <div className="space-y-0.5">
              {symbols.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--border)] transition-colors"
                >
                  <KindBadge kind={s.kind} />
                  <span className="flex-1 text-[12px] font-mono text-[var(--fg-muted)] truncate">{s.name}</span>
                  <span className="text-[9px] font-mono text-[var(--fg-faint)]">L{s.line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* file: raw preview */}
        {!isDir && (
          <div className="p-3">
            <div className="text-[9px] uppercase tracking-wider text-[var(--fg-faint)] px-1 mb-2 font-semibold">
              Preview
            </div>
            <div className="panel p-3 terminal-font text-[10px] leading-relaxed text-[var(--fg-muted)] overflow-hidden max-h-56 scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getMockContent(node.path).slice(0, 400)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* footer action */}
      <div className="p-3 border-t hairline flex-shrink-0">
        <button
          onClick={() => onOpenFile(node.path)}
          className="w-full py-2 rounded-md text-[12px] font-medium transition-all
            text-white hover:brightness-110 active:brightness-95"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #6355e8 100%)', boxShadow: '0 2px 12px rgba(124,108,255,0.35)' }}
        >
          {isDir ? 'Open first child' : 'Open in editor'}
        </button>
      </div>
    </aside>
  );
}
