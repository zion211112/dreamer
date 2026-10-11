'use client';

import { useState } from 'react';
import { DEPARTMENTS, DEPARTMENT_COLORS, FileNode, getIcon, WORKSPACE_ROOT } from '@/lib/ontology';
import { formatSize } from '@/lib/editor';

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
  const indent = depth * 13;

  return (
    <div>
      <div
        className={'flex items-center gap-1 pr-2 transition-colors cursor-pointer h-[25px] group relative ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
        style={{ paddingLeft: indent + 4 }}
        onClick={e => {
          e.stopPropagation();
          if (isDir) onToggle(node.path); else onSelect(node.path);
        }}
      >
        {isSelected && (
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />
        )}
        <span className="w-3.5 text-center text-[9px] text-[var(--fg-faint)] select-none flex-shrink-0">
          {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
        </span>
        <span className={'w-4 text-center text-[10px] select-none flex-shrink-0 ' + (isDir ? 'text-[var(--accent-hi)]' : 'text-[var(--fg-muted)]')}>
          {getIcon(node.name, node.type, isExpanded)}
        </span>
        <span className={'truncate flex-1 text-[12px] ' + (isSelected ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)] group-hover:text-[var(--fg)]')}>
          {node.name}
        </span>
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

function ModuleHead({
  dept, expandedPaths, onToggle, onSelect, selectedPath,
}: {
  dept: typeof DEPARTMENTS[number];
  expandedPaths: Set<string>;
  onToggle: (p: string) => void;
  onSelect: (p: string) => void;
  selectedPath: string | null;
}) {
  const isExpanded = expandedPaths.has(dept.root.path);
  const isSelected = selectedPath === dept.root.path;
  const color = DEPARTMENT_COLORS[dept.id] || 'var(--accent)';
  const fileCount = dept.root.children?.filter(c => c.type === 'file').length ?? 0;
  const dirCount = (dept.root.children?.length ?? 0) - fileCount;

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(dept.root.path)}
        onDoubleClick={() => onSelect(dept.root.path)}
        className={'w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ' +
          (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
      >
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] flex-shrink-0"
          style={{ background: color + '1a', color, border: `1px solid ${color}44` }}
        >
          {dept.icon}
        </span>
        <span className={'flex-1 truncate text-[12px] font-semibold tracking-wide ' + (isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg)]')}>
          {dept.name}
        </span>
        <span className="text-[9px] font-mono text-[var(--fg-faint)] flex-shrink-0">
          {fileCount}f · {dirCount}d
        </span>
        <svg
          width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={'transition-transform flex-shrink-0 ' + (isExpanded ? '' : '-rotate-90')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-0.5 border-l hairline ml-5 pl-1">
          {dept.root.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={0}
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
  const [activeHead, setActiveHead] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* header */}
      <div className="px-3 py-2.5 border-b hairline flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">Explorer</span>
        </div>
        <span className="text-[10px] text-[var(--fg-faint)] font-mono">6 modules</span>
      </div>

      {/* 6 module heads — one per module, expand each */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-1.5 min-h-0">
        {DEPARTMENTS.map(dept => (
          <div key={dept.id} onClick={() => setActiveHead(dept.id)}>
            <ModuleHead
              dept={dept}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="px-3 py-2 border-t hairline flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-[var(--fg-faint)] font-mono">main</span>
        <div className="flex items-center gap-1.5 text-[var(--fg-faint)]">
          <span className="text-[var(--success)] text-[10px]">+2</span>
          <span className="text-[var(--warn)] text-[10px]">~1</span>
        </div>
      </div>
    </div>
  );
}
