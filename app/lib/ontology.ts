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
  marketType?: 'school' | 'accreditation' | 'authority' | 'learner' | 'teacher' | 'anchor';
  metrics?: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'neutral' }>;
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

function builds(): FileNode {
  return dir('builds', '/builds', [
    dir('teacher-console', '/builds/teacher-console', [
      file('console.tsx', '/builds/teacher-console/console.tsx', 8400, 0),
      file('issuance.ts', '/builds/teacher-console/issuance.ts', 5100, 0),
      file('roster.tsx', '/builds/teacher-console/roster.tsx', 4300, 1),
    ]),
    dir('school-console', '/builds/school-console', [
      file('console.tsx', '/builds/school-console/console.tsx', 9100, 0),
      file('verify.ts', '/builds/school-console/verify.ts', 3800, 1),
      file('analytics.tsx', '/builds/school-console/analytics.tsx', 5600, 1),
    ]),
    dir('credential-wallet', '/builds/credential-wallet', [
      file('wallet.tsx', '/builds/credential-wallet/wallet.tsx', 6700, 0),
      file('present.ts', '/builds/credential-wallet/present.ts', 2900, 2),
    ]),
    file('placement-engine.ts', '/builds/placement-engine.ts', 7400, 0),
  ]);
}

/**
 * Network: institutions ◈ + people ◇
 * The dual-sided market of credentialing — schools, accreditation, authorities
 * on one side; teachers, learners, anchors on the other.
 */
function network(): FileNode {
  return dir('network', '/network', [
    dir('institutions', '/network/institutions', [
      dir('schools', '/network/institutions/schools', [
        file('accreditation.yml', '/network/institutions/schools/accreditation.yml', 4100, 0),
        file('roster.json', '/network/institutions/schools/roster.json', 12000, 1),
        file('curriculum-map.ts', '/network/institutions/schools/curriculum-map.ts', 3800, 2),
      ]),
      dir('accreditation', '/network/institutions/accreditation', [
        file('standards.md', '/network/institutions/accreditation/standards.md', 8500, 0),
        file('audit-log.ts', '/network/institutions/accreditation/audit-log.ts', 4200, 1),
        file('appeals.yaml', '/network/institutions/accreditation/appeals.yaml', 1900, 2),
      ]),
      dir('authorities', '/network/institutions/authorities', [
        file('root-certs.pem', '/network/institutions/authorities/root-certs.pem', 1800, 0),
        file('crl.ts', '/network/institutions/authorities/crl.ts', 2600, 1),
        file('ocsp.ts', '/network/institutions/authorities/ocsp.ts', 2200, 2),
      ]),
      file('treaty.md', '/network/institutions/treaty.md', 5600, 0),
    ]),
    dir('people', '/network/people', [
      dir('teachers', '/network/people/teachers', [
        file('profiles.json', '/network/people/teachers/profiles.json', 22000, 0),
        file('reputation.ts', '/network/people/teachers/reputation.ts', 3300, 1),
        file('availability.ics', '/network/people/teachers/availability.ics', 900, 2),
      ]),
      dir('learners', '/network/people/learners', [
        file('wallet.ts', '/network/people/learners/wallet.ts', 4100, 0),
        file('progress.md', '/network/people/learners/progress.md', 6700, 1),
        file('goals.yaml', '/network/people/learners/goals.yaml', 1100, 2),
      ]),
      dir('anchors', '/network/people/anchors', [
        file('anchors.json', '/network/people/anchors/anchors.json', 8900, 0),
        file('attest.ts', '/network/people/anchors/attest.ts', 2700, 1),
        file('challenge.ts', '/network/people/anchors/challenge.ts', 2400, 2),
      ]),
      file('handbook.md', '/network/people/handbook.md', 4800, 1),
      file('code-of-conduct.md', '/network/people/code-of-conduct.md', 3100, 0),
    ]),
    file('manifest.json', '/network/manifest.json', 1400, 1),
    file('charter.md', '/network/charter.md', 5200, 2),
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
  workspace: '#7c6cff',
  kernel: '#7c6cff',
  network: '#56c8dc',
  builds: '#56c8dc',
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
    id: 'kernel',
    name: 'kernel',
    description: 'SBT primitives: identity · issuance · verification',
    icon: '⬡',
    root: kernel(),
  },
  {
    id: 'network',
    name: 'network',
    description: 'institutions ◈ · people ◇',
    icon: '◈',
    root: network(),
  },
  {
    id: 'builds',
    name: 'builds',
    description: 'consoles · wallet · engine — pull, fork, improve',
    icon: '▢',
    root: builds(),
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