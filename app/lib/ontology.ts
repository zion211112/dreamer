'use client';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  parent?: string;
  path: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  root: FileNode;
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
} as const;

function getIcon(name: string, type: 'file' | 'dir', expanded: boolean): string {
  if (type === 'dir') return expanded ? ICONS.dirOpen : ICONS.dir;
  const ext = name.split('.').pop()?.toLowerCase();
  if (name.toLowerCase() === 'dockerfile') return ICONS.dockerfile;
  return ICONS[ext as keyof typeof ICONS] || ICONS.default;
}

function file(name: string, path: string, size: number, daysAgo: number): FileNode {
  return {
    id: path.replace(/[/\.]/g, '-'),
    name,
    type: 'file',
    size,
    modified: new Date(Date.now() - daysAgo * 86400000),
    path,
  };
}

function dir(name: string, path: string, children: FileNode[]): FileNode {
  return {
    id: path.replace(/\//g, '-'),
    name,
    type: 'dir',
    path,
    children: children.map(c => ({ ...c, parent: path })),
  };
}

function foundation(): FileNode {
  return dir('foundation', '/foundation', [
    dir('core', '/foundation/core', [
      file('config.ts', '/foundation/core/config.ts', 3421, 2),
      file('constants.ts', '/foundation/core/constants.ts', 1876, 2),
      file('types.ts', '/foundation/core/types.ts', 4210, 3),
      file('utils.ts', '/foundation/core/utils.ts', 5632, 1),
      file('errors.ts', '/foundation/core/errors.ts', 2145, 4),
    ]),
    dir('shared', '/foundation/shared', [
      file('hooks.ts', '/foundation/shared/hooks.ts', 6721, 1),
      file('context.tsx', '/foundation/shared/context.tsx', 3892, 2),
      file('api.ts', '/foundation/shared/api.ts', 4567, 0),
      file('storage.ts', '/foundation/shared/storage.ts', 2981, 3),
    ]),
    file('tsconfig.json', '/foundation/tsconfig.json', 573, 5),
    file('eslint.config.mjs', '/foundation/eslint.config.mjs', 892, 5),
  ]);
}

function products(): FileNode {
  return dir('products', '/products', [
    dir('web', '/products/web', [
      file('layout.tsx', '/products/web/layout.tsx', 2156, 0),
      file('page.tsx', '/products/web/page.tsx', 8432, 0),
      file('globals.css', '/products/web/globals.css', 3210, 1),
      dir('components', '/products/web/components', [
        file('Header.tsx', '/products/web/components/Header.tsx', 4123, 1),
        file('Sidebar.tsx', '/products/web/components/Sidebar.tsx', 3876, 1),
        file('Footer.tsx', '/products/web/components/Footer.tsx', 1234, 2),
        file('Navigation.tsx', '/products/web/components/Navigation.tsx', 5210, 0),
      ]),
      dir('features', '/products/web/features', [
        file('Dashboard.tsx', '/products/web/features/Dashboard.tsx', 7821, 0),
        file('Settings.tsx', '/products/web/features/Settings.tsx', 4532, 1),
        file('Profile.tsx', '/products/web/features/Profile.tsx', 3210, 2),
      ]),
    ]),
    dir('mobile', '/products/mobile', [
      file('App.tsx', '/products/mobile/App.tsx', 2341, 2),
      file('navigation.tsx', '/products/mobile/navigation.tsx', 4123, 1),
      dir('screens', '/products/mobile/screens', [
        file('HomeScreen.tsx', '/products/mobile/screens/HomeScreen.tsx', 3876, 1),
        file('DetailScreen.tsx', '/products/mobile/screens/DetailScreen.tsx', 4210, 2),
      ]),
    ]),
  ]);
}

function design(): FileNode {
  return dir('design', '/design', [
    dir('tokens', '/design/tokens', [
      file('colors.ts', '/design/tokens/colors.ts', 3421, 3),
      file('spacing.ts', '/design/tokens/spacing.ts', 1234, 3),
      file('typography.ts', '/design/tokens/typography.ts', 2876, 4),
      file('shadows.ts', '/design/tokens/shadows.ts', 1567, 4),
      file('motion.ts', '/design/tokens/motion.ts', 2134, 2),
      file('breakpoints.ts', '/design/tokens/breakpoints.ts', 892, 4),
    ]),
    dir('components', '/design/components', [
      file('Button.tsx', '/design/components/Button.tsx', 4532, 1),
      file('Input.tsx', '/design/components/Input.tsx', 3876, 1),
      file('Card.tsx', '/design/components/Card.tsx', 3210, 2),
      file('Modal.tsx', '/design/components/Modal.tsx', 5421, 0),
      file('Dropdown.tsx', '/design/components/Dropdown.tsx', 3876, 1),
      file('Tooltip.tsx', '/design/components/Tooltip.tsx', 2134, 2),
      file('Avatar.tsx', '/design/components/Avatar.tsx', 1876, 3),
      file('Badge.tsx', '/design/components/Badge.tsx', 1543, 3),
    ]),
    dir('patterns', '/design/patterns', [
      file('forms.tsx', '/design/patterns/forms.tsx', 6721, 1),
      file('tables.tsx', '/design/patterns/tables.tsx', 5432, 2),
      file('navigation.tsx', '/design/patterns/navigation.tsx', 4321, 2),
      file('feedback.tsx', '/design/patterns/feedback.tsx', 3876, 1),
    ]),
    file('tokens.json', '/design/tokens.json', 4210, 3),
  ]);
}

function operations(): FileNode {
  return dir('operations', '/operations', [
    dir('ci', '/operations/ci', [
      dir('github', '/operations/ci/github', [
        file('ci.yml', '/operations/ci/github/ci.yml', 3421, 1),
        file('deploy.yml', '/operations/ci/github/deploy.yml', 2876, 2),
        file('release.yml', '/operations/ci/github/release.yml', 2134, 3),
      ]),
      dir('scripts', '/operations/ci/scripts', [
        file('build.sh', '/operations/ci/scripts/build.sh', 1876, 2),
        file('test.sh', '/operations/ci/scripts/test.sh', 1543, 3),
        file('lint.sh', '/operations/ci/scripts/lint.sh', 1234, 3),
      ]),
    ]),
    dir('infrastructure', '/operations/infrastructure', [
      file('Dockerfile', '/operations/infrastructure/Dockerfile', 2341, 2),
      file('docker-compose.yml', '/operations/infrastructure/docker-compose.yml', 3210, 3),
      dir('kubernetes', '/operations/infrastructure/kubernetes', [
        file('deployment.yaml', '/operations/infrastructure/kubernetes/deployment.yaml', 2876, 2),
        file('service.yaml', '/operations/infrastructure/kubernetes/service.yaml', 1543, 3),
        file('ingress.yaml', '/operations/infrastructure/kubernetes/ingress.yaml', 2134, 3),
      ]),
      dir('terraform', '/operations/infrastructure/terraform', [
        file('main.tf', '/operations/infrastructure/terraform/main.tf', 4532, 1),
        file('variables.tf', '/operations/infrastructure/terraform/variables.tf', 2134, 2),
        file('outputs.tf', '/operations/infrastructure/terraform/outputs.tf', 1543, 2),
      ]),
    ]),
    dir('monitoring', '/operations/monitoring', [
      file('prometheus.yml', '/operations/monitoring/prometheus.yml', 2876, 3),
      file('grafana-dashboard.json', '/operations/monitoring/grafana-dashboard.json', 5432, 1),
      file('alerts.yml', '/operations/monitoring/alerts.yml', 3210, 2),
    ]),
  ]);
}

function laboratory(): FileNode {
  return dir('laboratory', '/laboratory', [
    dir('experiments', '/laboratory/experiments', [
      file('wasm-runtime.ts', '/laboratory/experiments/wasm-runtime.ts', 8721, 0),
      file('ai-embedding.ts', '/laboratory/experiments/ai-embedding.ts', 6543, 1),
      file('crdt-sync.ts', '/laboratory/experiments/crdt-sync.ts', 7210, 2),
      file('webgpu-compute.ts', '/laboratory/experiments/webgpu-compute.ts', 5432, 0),
    ]),
    dir('research', '/laboratory/research', [
      dir('papers', '/laboratory/research/papers', [
        file('distributed-consensus.md', '/laboratory/research/papers/distributed-consensus.md', 12432, 4),
        file('local-first-architecture.md', '/laboratory/research/papers/local-first-architecture.md', 9876, 3),
        file('end-to-end-encryption.md', '/laboratory/research/papers/end-to-end-encryption.md', 11234, 5),
      ]),
      dir('notes', '/laboratory/research/notes', [
        file('architecture-decisions.md', '/laboratory/research/notes/architecture-decisions.md', 4532, 0),
        file('performance-baselines.md', '/laboratory/research/notes/performance-baselines.md', 3210, 1),
        file('security-model.md', '/laboratory/research/notes/security-model.md', 5432, 2),
      ]),
    ]),
    dir('prototypes', '/laboratory/prototypes', [
      dir('realtime-editor', '/laboratory/prototypes/realtime-editor', [
        file('index.ts', '/laboratory/prototypes/realtime-editor/index.ts', 4321, 1),
        file('sync-engine.ts', '/laboratory/prototypes/realtime-editor/sync-engine.ts', 6721, 2),
      ]),
      dir('visual-programming', '/laboratory/prototypes/visual-programming', [
        file('editor.tsx', '/laboratory/prototypes/visual-programming/editor.tsx', 8210, 0),
        file('node-registry.ts', '/laboratory/prototypes/visual-programming/node-registry.ts', 5432, 1),
      ]),
      dir('local-first-db', '/laboratory/prototypes/local-first-db', [
        file('database.ts', '/laboratory/prototypes/local-first-db/database.ts', 7621, 0),
        file('sync-protocol.ts', '/laboratory/prototypes/local-first-db/sync-protocol.ts', 5876, 1),
      ]),
    ]),
  ]);
}

export const DEPARTMENT_COLORS: Record<string, string> = {
  foundation: '#7c6cff',
  products: '#56c8dc',
  design: '#f0b45a',
  operations: '#4ade80',
  laboratory: '#f26d6d',
};

export const DEPARTMENTS: Department[] = [
  {
    id: 'foundation',
    name: 'foundation',
    description: 'Core platform primitives',
    icon: '⬡',
    root: foundation(),
  },
  {
    id: 'products',
    name: 'products',
    description: 'Shipping surfaces',
    icon: '▢',
    root: products(),
  },
  {
    id: 'design',
    name: 'design',
    description: 'Design system',
    icon: '◇',
    root: design(),
  },
  {
    id: 'operations',
    name: 'operations',
    description: 'Infrastructure & delivery',
    icon: '⬢',
    root: operations(),
  },
  {
    id: 'laboratory',
    name: 'laboratory',
    description: 'R&D and prototypes',
    icon: '⬠',
    root: laboratory(),
  },
];

export const WORKSPACE_ROOT: FileNode = {
  id: 'workspace',
  name: 'workspace',
  type: 'dir',
  path: '/',
  children: DEPARTMENTS.map(d => ({ ...d.root, parent: '/' })),
};

export function getAllFiles(node: FileNode): FileNode[] {
  const files: FileNode[] = [];
  function traverse(n: FileNode) {
    if (n.type === 'file') files.push(n);
    else n.children?.forEach(traverse);
  }
  traverse(node);
  return files;
}

export function findNode(path: string, root: FileNode = WORKSPACE_ROOT): FileNode | null {
  if (root.path === path) return root;
  if (root.type === 'dir' && root.children) {
    for (const child of root.children) {
      const found = findNode(path, child);
      if (found) return found;
    }
  }
  return null;
}

export function getParentPath(path: string): string {
  if (path === '/') return '/';
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.length === 0 ? '/' : '/' + parts.join('/');
}

export function getPathParts(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export { getIcon };
export type { FileNode as Node };