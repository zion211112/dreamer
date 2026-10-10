'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  parent?: string;
  path: string;
}

const ICONS = {
  dir: '▸',
  dirOpen: '▾',
  file: '○',
  js: '⟨js⟩',
  ts: '⟨ts⟩',
  json: '⟨json⟩',
  css: '⟨css⟩',
  html: '⟨html⟩',
  md: '⟨md⟩',
  py: '⟨py⟩',
  rs: '⟨rs⟩',
  go: '⟨go⟩',
  img: '⟨img⟩',
  default: '⟨⟩',
};

function getIcon(name: string, type: 'file' | 'dir', expanded: boolean): string {
  if (type === 'dir') return expanded ? ICONS.dirOpen : ICONS.dir;
  const ext = name.split('.').pop()?.toLowerCase();
  return ICONS[ext as keyof typeof ICONS] || ICONS.default;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const mockTree: FileNode = {
  id: 'root',
  name: 'proto.shell',
  type: 'dir',
  path: '/',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'dir',
      path: '/src',
      children: [
        { id: 'app', name: 'app', type: 'dir', path: '/src/app', children: [
          { id: 'page', name: 'page.tsx', type: 'file', size: 40744, modified: new Date('2026-10-10'), path: '/src/app/page.tsx' },
          { id: 'layout', name: 'layout.tsx', type: 'file', size: 469, modified: new Date('2026-10-10'), path: '/src/app/layout.tsx' },
          { id: 'globals', name: 'globals.css', type: 'file', size: 466, modified: new Date('2026-10-10'), path: '/src/app/globals.css' },
        ]},
        { id: 'components', name: 'components', type: 'dir', path: '/src/components', children: [
          { id: 'tree', name: 'FileTree.tsx', type: 'file', size: 3241, modified: new Date('2026-10-10'), path: '/src/components/FileTree.tsx' },
          { id: 'pane', name: 'Pane.tsx', type: 'file', size: 2156, modified: new Date('2026-10-10'), path: '/src/components/Pane.tsx' },
          { id: 'status', name: 'StatusBar.tsx', type: 'file', size: 1823, modified: new Date('2026-10-10'), path: '/src/components/StatusBar.tsx' },
        ]},
        { id: 'lib', name: 'lib', type: 'dir', path: '/src/lib', children: [
          { id: 'fs', name: 'fs.ts', type: 'file', size: 5432, modified: new Date('2026-10-10'), path: '/src/lib/fs.ts' },
          { id: 'cmd', name: 'commands.ts', type: 'file', size: 4128, modified: new Date('2026-10-10'), path: '/src/lib/commands.ts' },
        ]},
      ]
    },
    {
      id: 'config',
      name: 'config',
      type: 'dir',
      path: '/config',
      children: [
        { id: 'pkg', name: 'package.json', type: 'file', size: 523, modified: new Date('2026-10-10'), path: '/config/package.json' },
        { id: 'tsconfig', name: 'tsconfig.json', type: 'file', size: 562, modified: new Date('2026-10-10'), path: '/config/tsconfig.json' },
        { id: 'tailwind', name: 'tailwind.config.ts', type: 'file', size: 177, modified: new Date('2026-10-10'), path: '/config/tailwind.config.ts' },
      ]
    },
    {
      id: 'readme',
      name: 'README.md',
      type: 'file',
      size: 700,
      modified: new Date('2026-10-10'),
      path: '/README.md'
    },
    {
      id: 'gitignore',
      name: '.gitignore',
      type: 'file',
      size: 828,
      modified: new Date('2026-10-04'),
      path: '/.gitignore'
    },
  ]
};

function FileTreeNode({
  node,
  depth = 0,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  const isDir = node.type === 'dir';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = isDir && node.children && node.children.length > 0;
  const indent = depth * 16;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${
          isSelected ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--fg)]/5'
        }`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (isDir && hasChildren) onToggle(node.path);
          else onSelect(node.path);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isDir && hasChildren) onToggle(node.path);
        }}
      >
        {hasChildren && (
          <span className="text-[var(--fg-muted)] select-none w-4 text-center" style={{ fontSize: '10px' }}>
            {isExpanded ? ICONS.dirOpen : ICONS.dir}
          </span>
        )}
        {!hasChildren && <span className="w-4 text-center" style={{ fontSize: '10px' }}>&nbsp;</span>}
        <span className="text-[var(--accent)] select-none w-5 text-center" style={{ fontSize: '11px' }}>
          {getIcon(node.name, node.type, isExpanded)}
        </span>
        <span className={`${isSelected ? 'font-medium' : ''} truncate flex-1`}>
          {node.name}
        </span>
        {node.size !== undefined && (
          <span className="text-[var(--fg-muted)] text-right w-20 text-[11px] font-mono select-none">
            {formatSize(node.size)}
          </span>
        )}
        {node.modified && (
          <span className="text-[var(--fg-muted)] text-right w-36 text-[11px] font-mono select-none">
            {formatDate(node.modified)}
          </span>
        )}
      </div>
      {isDir && isExpanded && node.children && (
        <div className="border-l border-[var(--border)] ml-4">
          {node.children.map(child => (
            <FileTreeNode
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

export function FileTree({
  selectedPath,
  onSelect,
  onToggle
}: {
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/src', '/src/app', '/config']));

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
    onToggle(path);
  }, [onToggle]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-2 terminal-font" style={{ fontSize: '12px' }}>
      <FileTreeNode
        node={mockTree}
        depth={0}
        selectedPath={selectedPath}
        expandedPaths={expandedPaths}
        onSelect={onSelect}
        onToggle={handleToggle}
      />
    </div>
  );
}

export function FileTreeWrapper({ selectedPath, onSelect, onToggle }: {
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] min-w-[280px] max-w-[400px]">
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-[var(--accent)] font-medium text-[11px] uppercase tracking-wider">workspace</span>
        <span className="text-[var(--fg-muted)] text-[11px] flex-1 truncate">proto.shell</span>
        <span className="text-[var(--fg-muted)] text-[10px]">37 items</span>
      </div>
      <FileTree selectedPath={selectedPath} onSelect={onSelect} onToggle={onToggle} />
    </div>
  );
}