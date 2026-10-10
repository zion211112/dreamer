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
  ts: '⟨ts⟩',
  tsx: '⟨tsx⟩',
  js: '⟨js⟩',
  jsx: '⟨jsx⟩',
  json: '⟨json⟩',
  css: '⟨css⟩',
  html: '⟨html⟩',
  md: '⟨md⟩',
  py: '⟨py⟩',
  rs: '⟨rs⟩',
  go: '⟨go⟩',
  yaml: '⟨yaml⟩',
  yml: '⟨yml⟩',
  toml: '⟨toml⟩',
  sh: '⟨sh⟩',
  dockerfile: '⟨docker⟩',
  default: '⟨⟩',
};

function getIcon(name: string, type: 'file' | 'dir', expanded: boolean): string {
  if (type === 'dir') return expanded ? ICONS.dirOpen : ICONS.dir;
  const ext = name.split('.').pop()?.toLowerCase();
  if (name.toLowerCase() === 'dockerfile') return ICONS.dockerfile;
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

const companyTree: FileNode = {
  id: 'root',
  name: 'workspace',
  type: 'dir',
  path: '/',
  children: [
    {
      id: 'foundation',
      name: 'foundation',
      type: 'dir',
      path: '/foundation',
      children: [
        {
          id: 'core',
          name: 'core',
          type: 'dir',
          path: '/foundation/core',
          children: [
            { id: 'config', name: 'config.ts', type: 'file', size: 3421, modified: new Date('2026-10-08'), path: '/foundation/core/config.ts' },
            { id: 'constants', name: 'constants.ts', type: 'file', size: 1876, modified: new Date('2026-10-08'), path: '/foundation/core/constants.ts' },
            { id: 'types', name: 'types.ts', type: 'file', size: 4210, modified: new Date('2026-10-07'), path: '/foundation/core/types.ts' },
            { id: 'utils', name: 'utils.ts', type: 'file', size: 5632, modified: new Date('2026-10-09'), path: '/foundation/core/utils.ts' },
            { id: 'errors', name: 'errors.ts', type: 'file', size: 2145, modified: new Date('2026-10-06'), path: '/foundation/core/errors.ts' },
          ]
        },
        {
          id: 'shared',
          name: 'shared',
          type: 'dir',
          path: '/foundation/shared',
          children: [
            { id: 'hooks', name: 'hooks.ts', type: 'file', size: 6721, modified: new Date('2026-10-09'), path: '/foundation/shared/hooks.ts' },
            { id: 'context', name: 'context.tsx', type: 'file', size: 3892, modified: new Date('2026-10-08'), path: '/foundation/shared/context.tsx' },
            { id: 'api', name: 'api.ts', type: 'file', size: 4567, modified: new Date('2026-10-10'), path: '/foundation/shared/api.ts' },
            { id: 'storage', name: 'storage.ts', type: 'file', size: 2981, modified: new Date('2026-10-07'), path: '/foundation/shared/storage.ts' },
          ]
        },
        {
          id: 'foundation-config',
          name: 'tsconfig.json',
          type: 'file',
          size: 573,
          modified: new Date('2026-10-05'),
          path: '/foundation/tsconfig.json'
        },
        {
          id: 'eslint',
          name: 'eslint.config.mjs',
          type: 'file',
          size: 892,
          modified: new Date('2026-10-05'),
          path: '/foundation/eslint.config.mjs'
        },
      ]
    },
    {
      id: 'products',
      name: 'products',
      type: 'dir',
      path: '/products',
      children: [
        {
          id: 'web',
          name: 'web',
          type: 'dir',
          path: '/products/web',
          children: [
            { id: 'app-layout', name: 'layout.tsx', type: 'file', size: 2156, modified: new Date('2026-10-10'), path: '/products/web/layout.tsx' },
            { id: 'app-page', name: 'page.tsx', type: 'file', size: 8432, modified: new Date('2026-10-10'), path: '/products/web/page.tsx' },
            { id: 'app-globals', name: 'globals.css', type: 'file', size: 3210, modified: new Date('2026-10-09'), path: '/products/web/globals.css' },
            {
              id: 'components',
              name: 'components',
              type: 'dir',
              path: '/products/web/components',
              children: [
                { id: 'header', name: 'Header.tsx', type: 'file', size: 4123, modified: new Date('2026-10-09'), path: '/products/web/components/Header.tsx' },
                { id: 'sidebar', name: 'Sidebar.tsx', type: 'file', size: 3876, modified: new Date('2026-10-09'), path: '/products/web/components/Sidebar.tsx' },
                { id: 'footer', name: 'Footer.tsx', type: 'file', size: 1234, modified: new Date('2026-10-08'), path: '/products/web/components/Footer.tsx' },
                { id: 'navigation', name: 'Navigation.tsx', type: 'file', size: 5210, modified: new Date('2026-10-10'), path: '/products/web/components/Navigation.tsx' },
              ]
            },
            {
              id: 'features',
              name: 'features',
              type: 'dir',
              path: '/products/web/features',
              children: [
                { id: 'dashboard', name: 'Dashboard.tsx', type: 'file', size: 7821, modified: new Date('2026-10-10'), path: '/products/web/features/Dashboard.tsx' },
                { id: 'settings', name: 'Settings.tsx', type: 'file', size: 4532, modified: new Date('2026-10-09'), path: '/products/web/features/Settings.tsx' },
                { id: 'profile', name: 'Profile.tsx', type: 'file', size: 3210, modified: new Date('2026-10-08'), path: '/products/web/features/Profile.tsx' },
              ]
            },
          ]
        },
        {
          id: 'mobile',
          name: 'mobile',
          type: 'dir',
          path: '/products/mobile',
          children: [
            { id: 'app-entry', name: 'App.tsx', type: 'file', size: 2341, modified: new Date('2026-10-08'), path: '/products/mobile/App.tsx' },
            { id: 'navigation', name: 'navigation.tsx', type: 'file', size: 4123, modified: new Date('2026-10-09'), path: '/products/mobile/navigation.tsx' },
            { id: 'screens', name: 'screens', type: 'dir', path: '/products/mobile/screens', children: [
              { id: 'home', name: 'HomeScreen.tsx', type: 'file', size: 3876, modified: new Date('2026-10-09'), path: '/products/mobile/screens/HomeScreen.tsx' },
              { id: 'detail', name: 'DetailScreen.tsx', type: 'file', size: 4210, modified: new Date('2026-10-08'), path: '/products/mobile/screens/DetailScreen.tsx' },
            ]},
          ]
        },
      ]
    },
    {
      id: 'design',
      name: 'design',
      type: 'dir',
      path: '/design',
      children: [
        {
          id: 'tokens',
          name: 'tokens',
          type: 'dir',
          path: '/design/tokens',
          children: [
            { id: 'colors', name: 'colors.ts', type: 'file', size: 3421, modified: new Date('2026-10-07'), path: '/design/tokens/colors.ts' },
            { id: 'spacing', name: 'spacing.ts', type: 'file', size: 1234, modified: new Date('2026-10-07'), path: '/design/tokens/spacing.ts' },
            { id: 'typography', name: 'typography.ts', type: 'file', size: 2876, modified: new Date('2026-10-06'), path: '/design/tokens/typography.ts' },
            { id: 'shadows', name: 'shadows.ts', type: 'file', size: 1567, modified: new Date('2026-10-06'), path: '/design/tokens/shadows.ts' },
            { id: 'motion', name: 'motion.ts', type: 'file', size: 2134, modified: new Date('2026-10-08'), path: '/design/tokens/motion.ts' },
            { id: 'breakpoints', name: 'breakpoints.ts', type: 'file', size: 892, modified: new Date('2026-10-06'), path: '/design/tokens/breakpoints.ts' },
          ]
        },
        {
          id: 'components',
          name: 'components',
          type: 'dir',
          path: '/design/components',
          children: [
            { id: 'button', name: 'Button.tsx', type: 'file', size: 4532, modified: new Date('2026-10-09'), path: '/design/components/Button.tsx' },
            { id: 'input', name: 'Input.tsx', type: 'file', size: 3876, modified: new Date('2026-10-09'), path: '/design/components/Input.tsx' },
            { id: 'card', name: 'Card.tsx', type: 'file', size: 3210, modified: new Date('2026-10-08'), path: '/design/components/Card.tsx' },
            { id: 'modal', name: 'Modal.tsx', type: 'file', size: 5421, modified: new Date('2026-10-10'), path: '/design/components/Modal.tsx' },
            { id: 'dropdown', name: 'Dropdown.tsx', type: 'file', size: 3876, modified: new Date('2026-10-09'), path: '/design/components/Dropdown.tsx' },
            { id: 'tooltip', name: 'Tooltip.tsx', type: 'file', size: 2134, modified: new Date('2026-10-08'), path: '/design/components/Tooltip.tsx' },
            { id: 'avatar', name: 'Avatar.tsx', type: 'file', size: 1876, modified: new Date('2026-10-07'), path: '/design/components/Avatar.tsx' },
            { id: 'badge', name: 'Badge.tsx', type: 'file', size: 1543, modified: new Date('2026-10-07'), path: '/design/components/Badge.tsx' },
          ]
        },
        {
          id: 'patterns',
          name: 'patterns',
          type: 'dir',
          path: '/design/patterns',
          children: [
            { id: 'forms', name: 'forms.tsx', type: 'file', size: 6721, modified: new Date('2026-10-09'), path: '/design/patterns/forms.tsx' },
            { id: 'tables', name: 'tables.tsx', type: 'file', size: 5432, modified: new Date('2026-10-08'), path: '/design/patterns/tables.tsx' },
            { id: 'navigation', name: 'navigation.tsx', type: 'file', size: 4321, modified: new Date('2026-10-08'), path: '/design/patterns/navigation.tsx' },
            { id: 'feedback', name: 'feedback.tsx', type: 'file', size: 3876, modified: new Date('2026-10-09'), path: '/design/patterns/feedback.tsx' },
          ]
        },
        {
          id: 'design-config',
          name: 'tokens.json',
          type: 'file',
          size: 4210,
          modified: new Date('2026-10-07'),
          path: '/design/tokens.json'
        },
      ]
    },
    {
      id: 'operations',
      name: 'operations',
      type: 'dir',
      path: '/operations',
      children: [
        {
          id: 'ci',
          name: 'ci',
          type: 'dir',
          path: '/operations/ci',
          children: [
            { id: 'github-workflows', name: 'github', type: 'dir', path: '/operations/ci/github', children: [
              { id: 'ci-yml', name: 'ci.yml', type: 'file', size: 3421, modified: new Date('2026-10-09'), path: '/operations/ci/github/ci.yml' },
              { id: 'deploy-yml', name: 'deploy.yml', type: 'file', size: 2876, modified: new Date('2026-10-08'), path: '/operations/ci/github/deploy.yml' },
              { id: 'release-yml', name: 'release.yml', type: 'file', size: 2134, modified: new Date('2026-10-07'), path: '/operations/ci/github/release.yml' },
            ]},
            { id: 'scripts', name: 'scripts', type: 'dir', path: '/operations/ci/scripts', children: [
              { id: 'build-sh', name: 'build.sh', type: 'file', size: 1876, modified: new Date('2026-10-08'), path: '/operations/ci/scripts/build.sh' },
              { id: 'test-sh', name: 'test.sh', type: 'file', size: 1543, modified: new Date('2026-10-07'), path: '/operations/ci/scripts/test.sh' },
              { id: 'lint-sh', name: 'lint.sh', type: 'file', size: 1234, modified: new Date('2026-10-07'), path: '/operations/ci/scripts/lint.sh' },
            ]},
          ]
        },
        {
          id: 'infra',
          name: 'infrastructure',
          type: 'dir',
          path: '/operations/infrastructure',
          children: [
            { id: 'dockerfile', name: 'Dockerfile', type: 'file', size: 2341, modified: new Date('2026-10-08'), path: '/operations/infrastructure/Dockerfile' },
            { id: 'docker-compose', name: 'docker-compose.yml', type: 'file', size: 3210, modified: new Date('2026-10-07'), path: '/operations/infrastructure/docker-compose.yml' },
            { id: 'k8s', name: 'kubernetes', type: 'dir', path: '/operations/infrastructure/kubernetes', children: [
              { id: 'deployment', name: 'deployment.yaml', type: 'file', size: 2876, modified: new Date('2026-10-08'), path: '/operations/infrastructure/kubernetes/deployment.yaml' },
              { id: 'service', name: 'service.yaml', type: 'file', size: 1543, modified: new Date('2026-10-07'), path: '/operations/infrastructure/kubernetes/service.yaml' },
              { id: 'ingress', name: 'ingress.yaml', type: 'file', size: 2134, modified: new Date('2026-10-07'), path: '/operations/infrastructure/kubernetes/ingress.yaml' },
            ]},
            { id: 'terraform', name: 'terraform', type: 'dir', path: '/operations/infrastructure/terraform', children: [
              { id: 'main-tf', name: 'main.tf', type: 'file', size: 4532, modified: new Date('2026-10-09'), path: '/operations/infrastructure/terraform/main.tf' },
              { id: 'variables-tf', name: 'variables.tf', type: 'file', size: 2134, modified: new Date('2026-10-08'), path: '/operations/infrastructure/terraform/variables.tf' },
              { id: 'outputs-tf', name: 'outputs.tf', type: 'file', size: 1543, modified: new Date('2026-10-08'), path: '/operations/infrastructure/terraform/outputs.tf' },
            ]},
          ]
        },
        {
          id: 'monitoring',
          name: 'monitoring',
          type: 'dir',
          path: '/operations/monitoring',
          children: [
            { id: 'prometheus', name: 'prometheus.yml', type: 'file', size: 2876, modified: new Date('2026-10-07'), path: '/operations/monitoring/prometheus.yml' },
            { id: 'grafana', name: 'grafana-dashboard.json', type: 'file', size: 5432, modified: new Date('2026-10-09'), path: '/operations/monitoring/grafana-dashboard.json' },
            { id: 'alerts', name: 'alerts.yml', type: 'file', size: 3210, modified: new Date('2026-10-08'), path: '/operations/monitoring/alerts.yml' },
          ]
        },
      ]
    },
    {
      id: 'laboratory',
      name: 'laboratory',
      type: 'dir',
      path: '/laboratory',
      children: [
        {
          id: 'experiments',
          name: 'experiments',
          type: 'dir',
          path: '/laboratory/experiments',
          children: [
            { id: 'wasm', name: 'wasm-runtime.ts', type: 'file', size: 8721, modified: new Date('2026-10-10'), path: '/laboratory/experiments/wasm-runtime.ts' },
            { id: 'ai-embed', name: 'ai-embedding.ts', type: 'file', size: 6543, modified: new Date('2026-10-09'), path: '/laboratory/experiments/ai-embedding.ts' },
            { id: 'crdt', name: 'crdt-sync.ts', type: 'file', size: 7210, modified: new Date('2026-10-08'), path: '/laboratory/experiments/crdt-sync.ts' },
            { id: 'webgpu', name: 'webgpu-compute.ts', type: 'file', size: 5432, modified: new Date('2026-10-10'), path: '/laboratory/experiments/webgpu-compute.ts' },
          ]
        },
        {
          id: 'research',
          name: 'research',
          type: 'dir',
          path: '/laboratory/research',
          children: [
            { id: 'papers', name: 'papers', type: 'dir', path: '/laboratory/research/papers', children: [
              { id: 'paper1', name: 'distributed-consensus.md', type: 'file', size: 12432, modified: new Date('2026-10-06'), path: '/laboratory/research/papers/distributed-consensus.md' },
              { id: 'paper2', name: 'local-first-architecture.md', type: 'file', size: 9876, modified: new Date('2026-10-07'), path: '/laboratory/research/papers/local-first-architecture.md' },
              { id: 'paper3', name: 'end-to-end-encryption.md', type: 'file', size: 11234, modified: new Date('2026-10-05'), path: '/laboratory/research/papers/end-to-end-encryption.md' },
            ]},
            { id: 'notes', name: 'notes', type: 'dir', path: '/laboratory/research/notes', children: [
              { id: 'note1', name: 'architecture-decisions.md', type: 'file', size: 4532, modified: new Date('2026-10-10'), path: '/laboratory/research/notes/architecture-decisions.md' },
              { id: 'note2', name: 'performance-baselines.md', type: 'file', size: 3210, modified: new Date('2026-10-09'), path: '/laboratory/research/notes/performance-baselines.md' },
              { id: 'note3', name: 'security-model.md', type: 'file', size: 5432, modified: new Date('2026-10-08'), path: '/laboratory/research/notes/security-model.md' },
            ]},
          ]
        },
        {
          id: 'prototypes',
          name: 'prototypes',
          type: 'dir',
          path: '/laboratory/prototypes',
          children: [
            { id: 'proto1', name: 'realtime-editor', type: 'dir', path: '/laboratory/prototypes/realtime-editor', children: [
              { id: 'p1-main', name: 'index.ts', type: 'file', size: 4321, modified: new Date('2026-10-09'), path: '/laboratory/prototypes/realtime-editor/index.ts' },
              { id: 'p1-sync', name: 'sync-engine.ts', type: 'file', size: 6721, modified: new Date('2026-10-08'), path: '/laboratory/prototypes/realtime-editor/sync-engine.ts' },
            ]},
            { id: 'proto2', name: 'visual-programming', type: 'dir', path: '/laboratory/prototypes/visual-programming', children: [
              { id: 'p2-main', name: 'editor.tsx', type: 'file', size: 8210, modified: new Date('2026-10-10'), path: '/laboratory/prototypes/visual-programming/editor.tsx' },
              { id: 'p2-nodes', name: 'node-registry.ts', type: 'file', size: 5432, modified: new Date('2026-10-09'), path: '/laboratory/prototypes/visual-programming/node-registry.ts' },
            ]},
            { id: 'proto3', name: 'local-first-db', type: 'dir', path: '/laboratory/prototypes/local-first-db', children: [
              { id: 'p3-main', name: 'database.ts', type: 'file', size: 7621, modified: new Date('2026-10-10'), path: '/laboratory/prototypes/local-first-db/database.ts' },
              { id: 'p3-sync', name: 'sync-protocol.ts', type: 'file', size: 5876, modified: new Date('2026-10-09'), path: '/laboratory/prototypes/local-first-db/sync-protocol.ts' },
            ]},
          ]
        },
      ]
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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([
    '/foundation',
    '/foundation/core',
    '/products',
    '/products/web',
    '/design',
    '/design/tokens',
    '/design/components',
    '/operations',
    '/operations/infrastructure',
    '/laboratory',
    '/laboratory/experiments',
  ]));

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
        node={companyTree}
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
        <span className="text-[var(--fg-muted)] text-[11px] flex-1 truncate">company</span>
        <span className="text-[var(--fg-muted)] text-[10px]">142 items</span>
      </div>
      <FileTree selectedPath={selectedPath} onSelect={onSelect} onToggle={onToggle} />
    </div>
  );
}