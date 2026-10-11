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

/**
 * Kernel sub-foundations: identity, issuance, verification
 */
function kernel(): FileNode {
  return dir('kernel', '/kernel', [
    dir('identity', '/kernel/identity', [
      file('did-method.ts', '/kernel/identity/did-method.ts', 3200, 2),
      file('key-registry.ts', '/kernel/identity/key-registry.ts', 2800, 3),
      file('identity-utils.ts', '/kernel/identity/identity-utils.ts', 1500, 4),
    ]),
    dir('issuance', '/kernel/issuance', [
      dir('teacher', '/kernel/issuance/teacher', [
        file('schema.ts', '/kernel/issuance/teacher/schema.ts', 2400, 1),
        file('mint.ts', '/kernel/issuance/teacher/mint.ts', 4100, 0),
        file('revoke.ts', '/kernel/issuance/teacher/revoke.ts', 1800, 2),
      ]),
      dir('learner', '/kernel/issuance/learner', [
        file('schema.ts', '/kernel/issuance/learner/schema.ts', 2200, 1),
        file('accept.ts', '/kernel/issuance/learner/accept.ts', 3900, 0),
        file('showcase.ts', '/kernel/issuance/learner/showcase.ts', 3300, 2),
      ]),
      file('core.ts', '/kernel/issuance/core.ts', 5000, 0),
    ]),
    dir('verification', '/kernel/verification', [
      file('validator.ts', '/kernel/verification/validator.ts', 3500, 1),
      file('challenger.ts', '/kernel/verification/challenger.ts', 2900, 2),
      file('gatekeeper.ts', '/kernel/verification/gatekeeper.ts', 3100, 0),
    ]),
    file('tsconfig.json', '/kernel/tsconfig.json', 600, 5),
    file('eslint.config.mjs', '/kernel/eslint.config.mjs', 950, 5),
  ]);
}

/**
 * Institutions: schools, accreditation, verification authorities
 */
function institutions(): FileNode {
  return dir('institutions', '/institutions', [
    dir('schools', '/institutions/schools', [
      file('accreditation.yml', '/institutions/schools/accreditation.yml', 4100, 0),
      file('roster.json', '/institutions/schools/roster.json', 12000, 1),
      file('circulum-map.ts', '/institutions/schools/circulum-map.ts', 3800, 2),
    ]),
    dir('accreditation', '/institutions/accreditation', [
      file('standards.md', '/institutions/accreditation/standards.md', 8500, 0),
      file('audit-log.ts', '/institutions/accreditation/audit-log.ts', 4200, 1),
      file('appeals.yaml', '/institutions/accreditation/appeals.yaml', 1900, 2),
    ]),
    dir('authorities', '/institutions/authorities', [
      file('root-certs.pem', '/institutions/authorities/root-certs.pem', 1800, 0),
      file('crl.ts', '/institutions/authorities/crl.ts', 2600, 1),
      file('ocsp.ts', '/institutions/authorities/ocsp.ts', 2200, 2),
    ]),
    file('treaty.md', '/institutions/treaty.md', 5600, 0),
  ]);
}

/**
 * People: teachers, learners, anchors
 */
function people(): FileNode {
  return dir('people', '/people', [
    dir('teachers', '/people/teachers', [
      file('profiles.json', '/people/teachers/profiles.json', 22000, 0),
      file('reputation.ts', '/people/teachers/reputation.ts', 3300, 1),
      file('availability.ics', '/people/teachers/availability.ics', 900, 2),
    ]),
    dir('learners', '/people/learners', [
      file('wallet.ts', '/people/learners/wallet.ts', 4100, 0),
      file('progress.md', '/people/learners/progress.md', 6700, 1),
      file('goals.yaml', '/people/learners/goals.yaml', 1100, 2),
    ]),
    dir('anchors', '/people/anchors', [
      file('anchors.json', '/people/anchors/anchors.json', 8900, 0),
      file('attest.ts', '/people/anchors/attest.ts', 2700, 1),
      file('challenge.ts', '/people/anchors/challenge.ts', 2400, 2),
    ]),
    file('handbook.md', '/people/handbook.md', 4800, 1),
    file('code-of-conduct.md', '/people/code-of-conduct.md', 3100, 0),
  ]);
}

/**
 * Foundation: the root of the system. Its children ARE the 3 true
 * sub-foundations — kernel (where SBTs are issued), institutions
 * (schools, accreditation, verification authorities), and people
 * (teachers, learners, anchors). Foundations live inside foundations.
 */
function foundation(): FileNode {
  return dir('foundation', '/foundation', [
    kernel(),
    institutions(),
    people(),
    file('manifest.json', '/foundation/manifest.json', 1400, 1),
    file('charter.md', '/foundation/charter.md', 5200, 2),
  ]);
}

function products(): FileNode {
  return dir('products', '/products', [
    dir('builds', '/products/builds', [
      dir('teacher-console', '/products/builds/teacher-console', [
        file('console.tsx', '/products/builds/teacher-console/console.tsx', 8400, 0),
        file('issuance.ts', '/products/builds/teacher-console/issuance.ts', 5100, 0),
        file('roster.tsx', '/products/builds/teacher-console/roster.tsx', 4300, 1),
      ]),
      dir('school-console', '/products/builds/school-console', [
        file('console.tsx', '/products/builds/school-console/console.tsx', 9100, 0),
        file('verify.ts', '/products/builds/school-console/verify.ts', 3800, 1),
        file('analytics.tsx', '/products/builds/school-console/analytics.tsx', 5600, 1),
      ]),
      dir('credential-wallet', '/products/builds/credential-wallet', [
        file('wallet.tsx', '/products/builds/credential-wallet/wallet.tsx', 6700, 0),
        file('present.ts', '/products/builds/credential-wallet/present.ts', 2900, 2),
      ]),
      file('placement-engine.ts', '/products/builds/placement-engine.ts', 7400, 0),
    ]),
  ]);
}

function design(): FileNode {
  return dir('design', '/design', [
    dir('tokens', '/design/tokens', [
      file('colors.ts', '/design/tokens/colors.ts', 3400, 1),
      file('typography.ts', '/design/tokens/typography.ts', 2100, 1),
      file('motion.ts', '/design/tokens/motion.ts', 1600, 2),
    ]),
    dir('components', '/design/components', [
      file('node-card.tsx', '/design/components/node-card.tsx', 3900, 0),
      file('edge-bezier.tsx', '/design/components/edge-bezier.tsx', 2800, 0),
    ]),
  ]);
}

function operations(): FileNode {
  return dir('operations', '/operations', [
    dir('infrastructure', '/operations/infrastructure', [
      file('deploy.yml', '/operations/infrastructure/deploy.yml', 2600, 1),
      file('docker-compose.yml', '/operations/infrastructure/docker-compose.yml', 3100, 2),
    ]),
    dir('monitoring', '/operations/monitoring', [
      file('alerts.yml', '/operations/monitoring/alerts.yml', 1900, 1),
    ]),
  ]);
}

function laboratory(): FileNode {
  return dir('laboratory', '/laboratory', [
    dir('experiments', '/laboratory/experiments', [
      file('wasm-runtime.ts', '/laboratory/experiments/wasm-runtime.ts', 8700, 0),
      file('crdt-sync.ts', '/laboratory/experiments/crdt-sync.ts', 7200, 1),
    ]),
    dir('research', '/laboratory/research', [
      file('local-first.md', '/laboratory/research/local-first.md', 9800, 2),
    ]),
  ]);
}

export const DEPARTMENT_COLORS: Record<string, string> = {
  foundation: '#7c6cff',
  kernel: '#9d8fff',
  institutions: '#56c8dc',
  people: '#f0b45a',
  products: '#56c8dc',
  design: '#f0b45a',
  operations: '#4ade80',
  laboratory: '#f26d6d',
};

export const DEPARTMENTS: Department[] = [
  {
    id: 'workspace',
    name: 'workspace',
    description: 'control dashboard',
    icon: '◎',
    root: dir('workspace', '/workspace', []),
  },
  {
    id: 'foundation',
    name: 'foundation',
    description: 'kernel · institutions · people',
    icon: '⬡',
    root: foundation(),
  },
  {
    id: 'products',
    name: 'products',
    description: 'builds: consoles & engines',
    icon: '▢',
    root: products(),
  },
  {
    id: 'design',
    name: 'design',
    description: 'tokens & system',
    icon: '◇',
    root: design(),
  },
  {
    id: 'operations',
    name: 'operations',
    description: 'infra & delivery',
    icon: '⬢',
    root: operations(),
  },
  {
    id: 'laboratory',
    name: 'laboratory',
    description: 'R&D prototypes',
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