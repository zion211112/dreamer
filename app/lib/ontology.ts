'use client';

/* ══════════════════════════════════════════════════════════════
   ONTOLOGY — the full APT-LABS data model
   Modules hold sub-departments; sub-departments hold pages.
   A sub-department is a FAMILY — two or more pages that
   belong together. A singleton is a page at the module root.
   Major artifacts are never buried in folders: the consoles
   are the builds desktop, not a drawer inside it.
   ══════════════════════════════════════════════════════════════ */

export type EvidenceState = 'built' | 'proto' | 'planned' | 'unknown';

export type NavItemId = 'kernel' | 'network' | 'builds' | 'operations' | 'research';

export interface OntoPage {
  id: string;
  name: string;
  size: string;
  lines: number;
  state: EvidenceState;
  lang: string;
  content: string;
}

export interface OntoModule {
  label: string;
  color: string;
  icon: string;
  title: string;
  desc: string;
}

export interface OntoPerson {
  av: string;
  name: string;
  role: string;
  tag: 'operator' | 'anchor' | 'builder' | 'learner';
  meta: string;
  color: string;
}

export interface OntoActivity {
  p: string;
  state: EvidenceState;
  time: string;
}

export const MODULES: Record<string, OntoModule> = {
  kernel: { label: 'Kernel', color: 'var(--cyan)', icon: '⌘',
    title: 'Kernel', desc: 'truth layer — issuance, evidence, identity SBT, the roll' },
  network: { label: 'Network', color: 'var(--green)', icon: '◉',
    title: 'Network', desc: 'mesh layer — commons, tally, people, anchors' },
  builds: { label: 'Builds', color: 'var(--amber)', icon: '▤',
    title: 'Builds', desc: 'the yard — projects seeking funds, hands, and anchors' },
  operations: { label: 'Operations', color: 'var(--red)', icon: '●',
    title: 'Operations', desc: 'execution layer — audits, deployments, governance' },
  research: { label: 'Research', color: 'var(--pink)', icon: '◎',
    title: 'Research', desc: 'research and dev — spatial optics, acoustics, animation' },
};

export const MODULE_ORDER = Object.keys(MODULES);

export const TREE: Record<string, { dirs: string[]; pages: OntoPage[] }> = {
  kernel: {
    dirs: ['identity', 'evidence'],
    pages: [
      { id: 'kernel/core', name: 'core', size: '4.9K', lines: 104,
        state: 'built', lang: 'typescript',
        content: '// /kernel/core\n// Mints capability records to The Roll.\n\nexport type EvidenceState = "BUILT" | "PROTOTYPE" | "PLANNED" | "UNKNOWN";\n\nexport interface CapabilityRecord {\n  maker: string;        // anchor wallet\n  blueprint: string;    // hash of CAD + BOM\n  evidence: EvidenceState;\n  import_quote: number; // KES\n  local_cost: number;   // KES\n  signed_at: string;    // ISO\n}\n\nexport function mint(record: CapabilityRecord): string {\n  // Anchor signature is required — no build mints without one.\n  // Returns the roll hash.\n  return hash(record);\n}' },
      { id: 'kernel/ledger', name: 'ledger', size: '6.7K', lines: 148,
        state: 'proto', lang: 'typescript',
        content: '// The Roll — unforgeable public ledger.\n\n// Append-only. Every record is signed by its maker.\n// Every blueprint is published for county fork.\n// No record can be edited — only superseded.\n\nexport interface RollEntry {\n  seq: number;\n  hash: string;\n  prev: string;\n  payload: CapabilityRecord;\n}\n\nexport function append(entry: RollEntry): RollEntry {\n  // persists to disk + mesh sync\n}' },
      { id: 'kernel/identity/claim', name: 'claim', size: '1.9K', lines: 30,
        state: 'built', lang: 'markdown',
        content: '# Claim — the walk\n\nThree moves. Two minutes. One soulbound token.\n\n## 1 · Register\nOpen the kernel. Name yourself — no papers, no gatekeeper.\n\n## 2 · Sign\nSign the claim with your wallet. An anchor countersigns.\n\n## 3 · Receive\nYour SBT lands in your wallet. Soulbound: yours, unsellable.\n\nThe walk is live — ⌘1 kernel, register, sign, receive.' },
      { id: 'kernel/identity/register', name: 'register', size: '2.6K', lines: 44,
        state: 'built', lang: 'markdown',
        content: '# The SBT Register\n\nThe final state of identity: who holds a soulbound token, and what it lets them do.\n\n## The roll of holders\n- SBT-0001 · aptlabs — build, vote, sign, audit\n- SBT-0042 · wanjiru.m — build, vote, sign\n- SBT-0057 · joseph.k — build, vote, sign\n- SBT-0063 · grace.n — build, vote\n- SBT-0118 · kofi a. — build, vote\n- SBT-0204 · amina.h — vote\n\n## Rule\nOne SBT, one vote. Rights are earned by signing work, never bought.' },
      { id: 'kernel/evidence/states', name: 'states', size: '3.2K', lines: 62,
        state: 'built', lang: 'typescript',
        content: '// Evidence states — the four honest states.\n\n// BUILT     — deployed, functioning, verified on-site\nexport const BUILT = "BUILT";\n\n// PROTOTYPE — exists in physical form, unverified at scale\nexport const PROTOTYPE = "PROTOTYPE";\n\n// PLANNED   — design exists, no physical proof yet\nexport const PLANNED = "PLANNED";\n\n// UNKNOWN   — claim exists, no evidence either way\nexport const UNKNOWN = "UNKNOWN";' },
      { id: 'kernel/evidence/null-results', name: 'null-results', size: '2.4K', lines: 38,
        state: 'built', lang: 'markdown',
        content: '# Null Results — published\n\nFailure is data. Every null result lands here, on the roll, in public.\n\n## Published\n- corridor-mirrors · day 9 — no measurable delta in cognitive load between classrooms. Pre-registered, measured, published.\n- hostel-audio · pilot — directional cones bleed at 15° in concrete corridors. Redesign before scale.\n\n## Rule\nA null result on a public ledger is worth $60,000 to the next county.' },
    ]
  },
  network: {
    dirs: ['commons', 'tally'],
    pages: [
      { id: 'network/roster', name: 'roster', size: '3.6K', lines: 52,
        state: 'proto', lang: 'markdown',
        content: '# On the Roll\n\n## Operators\n- aptlabs — genesis node\n\n## Anchors (verified)\n- wanjiru.m — Kagio welding · 14 builds signed\n- joseph.k — Mwea carpentry · 9 builds signed\n- grace.n — Nyamindi acoustics · 4 builds signed\n\n## Builders\n- kofi.a — firmware & CAD · 3 blueprints\n- saidi.m — turbine fabrication · 2 blueprints\n\n## Learners\n- amina.h — Mwea studio · first short rendered\n- brian.o — Kagio · apprentice welder' },
      { id: 'network/treaty', name: 'treaty', size: '5.5K', lines: 96,
        state: 'built', lang: 'markdown',
        content: '# Treaty\n\nRatified between Kirinyaga hub and Nyamindi node.\n\n## Terms\n1. Blueprints are open. Always.\n2. Every build requires an anchor signature.\n3. Revenue share: 60% maker crew, 25% cooperative, 15% node upkeep.\n4. Null results are published. Failure is data.\n5. No imported hardware counts as a build.\n\nSigned: aptlabs · 2026-09-14' },
      { id: 'network/commons/town-square', name: 'town-square', size: '2.8K', lines: 46,
        state: 'proto', lang: 'markdown',
        content: '# Town Square\n\nThe commons — where everyone meets, builders and not.\n\n## What it is\nA public square on the mesh. No build required to belong.\nAsk, argue, announce, celebrate. Threads, not transactions.\n\n## Rules\n- No one is a stranger here. Learners, elders, makers, watchers.\n- Questions outrank claims.\n- Every thread is open. Lurking is allowed.' },
      { id: 'network/commons/schools', name: 'schools', size: '2.4K', lines: 38,
        state: 'built', lang: 'markdown',
        content: '# School Nodes · Kirinyaga\n\n## Active (3)\n- Kirinyaga Boys Secondary — Kagio\n- Mwea Primary — Mwea\n- Nyamindi Primary — Nyamindi\n\n## Joining\n- Kirinyaga University — as an institution\n- Two companies — sourcing talent from the roll\n\n## Reach\nEach node runs the free offline School Console.\nZero cost. Zero internet. Report cards in 45 seconds.' },
      { id: 'network/tally/smis', name: 'smis', size: '3.4K', lines: 58,
        state: 'proto', lang: 'markdown',
        content: '# SMIS — live on the tally\n\nThe ongoing SMIS: a voted project, open to invest.\n\n## Ballot\n- 214 for · 38 against · quorum met\n- Closes in 6 days\n\n## Investment\n- KES 1.2M pledged of 2.0M goal\n- 41 backers · smallest stake KES 500\n- Returns flow to The Roll, pro-rata\n\n## Rule\nOnly ledger members vote. One SBT, one vote.\nNon-builders may invest — the square decides.' },
      { id: 'network/tally/ballot', name: 'ballot', size: '2.2K', lines: 34,
        state: 'planned', lang: 'markdown',
        content: '# Ballot\n\nHow a project earns the tally — and how the tally scales.\n\n## Steps\n1. Blueprint minted to The Roll\n2. Anchor seconds the motion\n3. Ledger members vote — one SBT, one vote\n4. Investment opens on quorum\n\n## The scale\nThe same tally that funds a build can elect a president.\nUniversities join as institutions. Companies join to\nsource talent. Community funds build anything —\neven schools. One SBT, one vote, at any scale.\n\n## Guard\nNo whale weights. No anonymous votes.\nThe tally is public, like everything here.' },
    ]
  },
  builds: {
    dirs: [],
    pages: [
      { id: 'builds/school-console', name: 'school-console', size: '7.2K', lines: 122,
        state: 'built', lang: 'markdown',
        content: '# School Console\n\n## What it does\nOffline-first school administration. CBC + KCSE compliant report cards in 45 seconds.\n\n## Cost to school\nZero. Forever.\n\n## Why it exists\nIt is useful on its own. It is also how grade data reaches the evaluation, with each school\'s consent.\n\n## Technical\n- 100% offline. Syncs when internet is available.\n- SQLite local. No cloud dependency.\n- Runs on any Windows laptop from the last decade.' },
      { id: 'builds/teacher-console', name: 'teacher-console', size: '4.1K', lines: 74,
        state: 'built', lang: 'markdown',
        content: '# Teacher Console\n\nDaily admin for teachers. Attendance, marks, parent notes.\n\nThe teacher-console is the primary surface. The school-console aggregates.' },
      { id: 'builds/credential-wallet', name: 'credential-wallet', size: '5.8K', lines: 132,
        state: 'proto', lang: 'typescript',
        content: '// Credential Wallet — the maker-facing side of The Roll.\n\n// Every maker owns their record. No school owns it.\n// No employer owns it. It outlives all of them.\n\nexport interface Wallet {\n  address: string;\n  records: CapabilityRecord[];\n  anchor_of: string[];  // schools where this maker is verified\n}\n\nexport function exportCovenant(w: Wallet): string {\n  // signed offline. QR on print. survives network death.\n}' },
      { id: 'builds/replacement-engine', name: 'replacement-engine', size: '7.2K', lines: 168,
        state: 'proto', lang: 'typescript',
        content: '// Replacement Engine — the import-substitution core.\n\n// Input: a landed import quote (PDF or number)\n// Output: a locally fabricable alternative + BOM + crew\n\nexport interface ImportTarget {\n  name: string;\n  landed_cost: number;   // KES\n  tariff_rate: number;   // %\n  lead_time_days: number;\n}\n\nexport interface LocalBuild {\n  bom: BillOfMaterials;\n  crew: TriNode;\n  estimated_cost: number;\n  estimated_days: number;\n}' },
      { id: 'builds/collab', name: 'collab', size: '2.6K', lines: 44,
        state: 'proto', lang: 'markdown',
        content: '# Workshops — build together\n\nWhere collaborative building and forking happen.\n\n## Fork\nEvery blueprint on The Roll is forkable. One click.\nFork, adapt, mint your evidence back.\n\n## Collab\nCrews form around a blueprint. Roles: maker, anchor, reviewer.\nThe engine splits credit by signature weight.\n\n## Rule\nA fork without evidence is a draft. Publish or perish.' },
    ]
  },
  operations: {
    dirs: [],
    pages: [
      { id: 'operations/kirinyaga-pilot', name: 'kirinyaga-pilot', size: '5.3K', lines: 108,
        state: 'planned', lang: 'markdown',
        content: '# Kirinyaga Pilot — 30 Days\n\n## Scope\n3 schools · 1 studio · $60,000\n\n## Schedule\n- Days 1–7: Procurement\n- Days 8–15: School installs\n- Days 16–22: Studio calibration\n- Days 23–30: Render, audit, seal\n\n## Success metrics\n- Grade delta: pilot vs. control streams\n- Cost delta: local vs. import, per unit\n- Shillings paid to local makers\n- Blueprints minted to The Roll' },
      { id: 'operations/protocol', name: 'protocol', size: '4.4K', lines: 82,
        state: 'built', lang: 'markdown',
        content: '# Audit Protocol\n\nEvery claim is checkable by someone who owes us nothing.\n\n## Verification\n- On-site physical inspection\n- Itemized invoice comparison\n- Independent auditor signature\n- Public ledger publication\n\n## Null Results\nIf a claim fails, we publish the null result.\nA failed claim on a public ledger is still worth $60,000 to the next county.' },
      { id: 'operations/governance', name: 'governance', size: '3.1K', lines: 56,
        state: 'planned', lang: 'markdown',
        content: '# Governance\n\nHow aptlabs decides. Plain rules, public tally.\n\n## The tally\n- Proposals mint to the roll, anchors second them\n- Ledger members vote — one SBT, one vote\n- Quorum: 100 votes. Simple majority passes.\n\n## The purse\n- Investment returns flow to The Roll, pro-rata\n- Revenue share: 60% maker crew · 25% cooperative · 15% node upkeep\n\n## Guard\nNo whale weights. No anonymous votes. No closed doors.' },
    ]
  },
  research: {
    dirs: [],
    pages: [
      { id: 'research/corridor-mirrors', name: 'corridor-mirrors', size: '3.9K', lines: 72,
        state: 'proto', lang: 'markdown',
        content: '# Corridor Optics\n\nParallel mirror arrays in transition spaces.\n\n## Hypothesis\nVisual depth cues reduce cognitive load between classrooms.\n\n## State\nExploratory. Pre-registered. Null result will be published.\n\n## Constraint\nFree-standing. Zero wall drilling.' },
      { id: 'research/hostel-audio', name: 'hostel-audio', size: '3.1K', lines: 58,
        state: 'proto', lang: 'markdown',
        content: '# Hostel Acoustics\n\nDirectional audio nodes for off-hours revision.\n\n## Specification\n- 15-degree directional cones\n- Curriculum summaries + classical loops\n- Zero student testing\n\n## Constraint\nModular. Free-standing. Reversible.' },
      { id: 'research/mwea-box', name: 'mwea-box', size: '6.2K', lines: 114,
        state: 'planned', lang: 'markdown',
        content: '# Mwea Animation Box\n\n## Rigs\n2x GPU workstations. Local animators.\n\n## Output\n3 short films in 30 days, from Kirinyaga stories.\n\n## Pipeline\n1. Story from local elders\n2. Character design, physical sculpture first\n3. LoRA training on African art styles\n4. ControlNet depth anchoring\n5. Local animators keyframe\n6. AI fills background + concept\n7. Render, edit, release\n\n## Cost\n~10% of traditional studio cost per minute.' },
    ]
  }
};

export const PEOPLE: OntoPerson[] = [
  { av: 'A', name: 'aptlabs', role: 'operator · control surface', tag: 'operator', meta: 'genesis node',
    color: 'linear-gradient(135deg,var(--accent),var(--accent-hi))' },
  { av: 'W', name: 'wanjiru m.', role: 'anchor · kagio welding', tag: 'anchor', meta: '14 builds signed',
    color: 'linear-gradient(135deg,var(--cyan),#67e8f9)' },
  { av: 'K', name: 'kofi a.', role: 'builder · firmware & cad', tag: 'builder', meta: '3 blueprints minted',
    color: 'linear-gradient(135deg,var(--green),#86efac)' },
  { av: 'A', name: 'amina.h', role: 'learner · mwea studio', tag: 'learner', meta: 'first short rendered',
    color: 'linear-gradient(135deg,var(--amber),#fde68a)' },
];

export const ACTIVITY: OntoActivity[] = [
  { p: 'kernel/core — minting logic committed', state: 'built', time: '2m' },
  { p: 'builds/teacher-console — forked by wanjiru.m', state: 'proto', time: '18m' },
  { p: 'network/treaty — ratified · kirinyaga ⇄ nyamindi', state: 'built', time: '1h' },
  { p: 'research/corridor-mirrors — day 3 measurement', state: 'proto', time: '3h' },
  { p: 'operations/kirinyaga-pilot — moU drafted', state: 'planned', time: '5h' },
  { p: 'builds/replacement-engine — first BOM emitted', state: 'proto', time: '8h' },
];

export const ANCHORS = [
  { av: 'W', name: 'wanjiru.m', meta: '14 builds signed' },
  { av: 'J', name: 'joseph.k', meta: '9 builds signed' },
  { av: 'G', name: 'grace.n', meta: '4 builds signed' },
];

/* ══════════════════════════════════════════════════════════════
   THE LEDGER — members who can build, vote, sign.
   One SBT, one vote. Ledger over roster: the record is the member.
   ══════════════════════════════════════════════════════════════ */

export interface LedgerEntry {
  av: string;
  name: string;
  role: string;
  rights: string[];
  sbt: string;
  color: string;
}

export const LEDGER: LedgerEntry[] = [
  { av: 'A', name: 'aptlabs', role: 'operator · genesis', rights: ['build', 'vote', 'sign', 'audit'], sbt: 'SBT-0001',
    color: 'linear-gradient(135deg,var(--accent),var(--accent-hi))' },
  { av: 'W', name: 'wanjiru.m', role: 'anchor · kagio welding', rights: ['build', 'vote', 'sign'], sbt: 'SBT-0042',
    color: 'linear-gradient(135deg,var(--cyan),#67e8f9)' },
  { av: 'J', name: 'joseph.k', role: 'anchor · mwea carpentry', rights: ['build', 'vote', 'sign'], sbt: 'SBT-0057',
    color: 'linear-gradient(135deg,var(--green),#86efac)' },
  { av: 'G', name: 'grace.n', role: 'anchor · nyamindi acoustics', rights: ['build', 'vote'], sbt: 'SBT-0063',
    color: 'linear-gradient(135deg,var(--amber),#fde68a)' },
  { av: 'K', name: 'kofi a.', role: 'builder · firmware & cad', rights: ['build', 'vote'], sbt: 'SBT-0118',
    color: 'linear-gradient(135deg,var(--pink),#f9a8d4)' },
  { av: 'A', name: 'amina.h', role: 'learner · mwea studio', rights: ['vote'], sbt: 'SBT-0204',
    color: 'linear-gradient(135deg,var(--red),#fca5a5)' },
];

export const TOTAL_BUILDS = Object.values(TREE).reduce((n, t) => n + t.pages.length, 0);
export const BUILT_COUNT = Object.values(TREE).flatMap(t => t.pages).filter(p => p.state === 'built').length;
export const DIR_COUNT = Object.values(TREE).reduce((n, t) => n + t.dirs.length, 0);

export function findPage(id: string): (OntoPage & { module: string }) | null {
  for (const mod of MODULE_ORDER) {
    for (const p of TREE[mod].pages) {
      if (p.id === id) return { ...p, module: mod };
    }
  }
  return null;
}

export function stateColor(state: string): string {
  return {
    built: 'var(--green)',
    proto: 'var(--amber)',
    prototype: 'var(--amber)',
    planned: 'var(--cyan)',
    unknown: 'var(--fg-muted)',
  }[state.toLowerCase()] || 'var(--fg-muted)';
}

export function firstMeaningfulLine(content: string): string {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#'));
  const first = lines[0] || '';
  return first.slice(0, 120) + (first.length > 120 ? '…' : '');
}

/** Legacy FileNode shape kept for components that still traverse a tree. */
export interface FileNode {
  id: string;
  name: string;
  type: 'page' | 'dept';
  size?: number;
  modified?: Date;
  children?: FileNode[];
  parent?: string;
  path: string;
  state?: EvidenceState;
  lang?: string;
  content?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  root: FileNode;
}

function dir(name: string, path: string, children: FileNode[]): FileNode {
  return {
    id: path.replace(/\//g, '-'),
    name,
    type: 'dept',
    path,
    children: children.map(c => ({ ...c, parent: path })),
  };
}

/** Build a FileNode tree from TREE so legacy components keep working. */
function buildModuleRoot(modId: string): FileNode {
  const mod = MODULES[modId];
  const tree = TREE[modId];
  const children: FileNode[] = [];

  for (const d of tree.dirs) {
    const dirPath = `${modId}/${d}`;
    const dirPages = tree.pages.filter(p => p.id.startsWith(dirPath + '/'));
    const pageNodes: FileNode[] = dirPages.map(p => ({
      id: p.id,
      name: p.name,
      type: 'page',
      path: p.id,
      state: p.state,
      lang: p.lang,
      content: p.content,
    }));
    children.push(dir(d, dirPath, pageNodes));
  }

  for (const p of tree.pages) {
    const isNested = tree.dirs.some(d => p.id.startsWith(`${modId}/${d}/`));
    if (!isNested) {
      children.push({
        id: p.id,
        name: p.name,
        type: 'page',
        path: p.id,
        state: p.state,
        lang: p.lang,
        content: p.content,
      });
    }
  }

  return dir(mod.label, modId, children);
}

export const DEPARTMENT_TOKENS: Record<string, string> = {
  kernel: 'var(--cyan)',
  network: 'var(--green)',
  builds: 'var(--amber)',
  operations: 'var(--red)',
  research: 'var(--pink)',
};

export const DEPARTMENT_COLORS: Record<string, string> = DEPARTMENT_TOKENS;

export const DEPARTMENTS: Department[] = MODULE_ORDER.map(id => ({
  id,
  name: MODULES[id].label,
  description: MODULES[id].desc,
  icon: MODULES[id].icon,
  root: buildModuleRoot(id),
}));

export const WORKSPACE_ROOT: FileNode = {
  id: 'workspace',
  name: 'workspace',
  type: 'dept',
  path: '/',
  children: DEPARTMENTS.map(d => ({ ...d.root, parent: '/' })),
};

export function getAllFiles(node: FileNode): FileNode[] {
  const pages: FileNode[] = [];
  function traverse(n: FileNode) {
    if (n.type === 'page') pages.push(n);
    else n.children?.forEach(traverse);
  }
  traverse(node);
  return pages;
}

export function findNode(path: string, root: FileNode = WORKSPACE_ROOT): FileNode | null {
  if (root.path === path) return root;
  if (root.path === '/' && path === root.id) return root;
  if (root.type === 'dept' && root.children) {
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
