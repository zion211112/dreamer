'use client';

import { useMemo } from 'react';
import { WORKSPACE_ROOT, FileNode, getIcon, findNode } from '@/lib/ontology';
import { formatSize, formatDate } from '@/lib/editor';

interface ExplorerTreeProps {
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

function TreeNode({
  node, depth, selectedPath, expandedPaths, onSelect, onToggle,
}: {
  node: FileNode; depth: number; selectedPath: string | null;
  expandedPaths: Set<string>; onSelect: (p: string) => void; onToggle: (p: string) => void;
}) {
  const isDir = node.type === 'dir';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = isDir && node.children && node.children.length > 0;
  const indent = depth * 14;

  return (
    <div>
      <div
        className={`flex items-center gap-1 pr-2 transition-colors cursor-pointer h-[26px] group
          ${isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]'}`}
        style={{ paddingLeft: indent + 6 }}
        onClick={e => {
          e.stopPropagation();
          if (isDir) onToggle(node.path); else onSelect(node.path);
        }}
      >
        {/* chevron */}
        <span className="w-3.5 text-center text-[9px] text-[var(--fg-faint)] select-none flex-shrink-0">
          {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
        </span>
        {/* icon */}
        <span className={`w-4 text-center text-[10px] select-none flex-shrink-0 ${isDir ? 'text-[var(--accent-hi)]' : 'text-[var(--fg-muted)]'}`}>
          {getIcon(node.name, node.type, isExpanded)}
        </span>
        {/* name */}
        <span className={`truncate flex-1 text-[12px] ${isSelected ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)] group-hover:text-[var(--fg)]'}`}>
          {node.name}
        </span>
        {/* meta */}
        {node.size !== undefined && (
          <span className="text-[var(--fg-faint)] text-[10px] font-mono select-none hidden xl:inline">
            {formatSize(node.size)}
          </span>
        )}
      </div>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExplorerTree({ selectedPath, expandedPaths, onSelect, onToggle }: ExplorerTreeProps) {
  const stats = useMemo(() => {
    let files = 0, dirs = 0;
    function walk(n: FileNode) {
      if (n.type === 'dir') { dirs++; n.children?.forEach(walk); } else files++;
    }
    walk(WORKSPACE_ROOT);
    return { files, dirs };
  }, []);

  const rootNode = WORKSPACE_ROOT;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* header */}
      <div className="px-3 py-2.5 border-b hairline flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Explorer</span>
        </div>
        <span className="text-[10px] text-[var(--fg-faint)] font-mono">{stats.files}f · {stats.dirs}d</span>
      </div>

      {/* tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1.5 min-h-0">
        <TreeNode
          node={rootNode}
          depth={0}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      </div>

      {/* footer */}
      <div className="px-3 py-2 border-t hairline flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-[var(--fg-faint)]">main</span>
        <div className="flex items-center gap-1.5 text-[var(--fg-faint)]">
          <span className="text-[var(--success)] text-[10px]">+2</span>
          <span className="text-[var(--warn)] text-[10px]">~1</span>
          <span className="text-[10px] font-mono">main</span>
        </div>
      </div>
    </div>
  );
}
