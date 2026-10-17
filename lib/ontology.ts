export type EvidenceState = 'built' | 'proto' | 'planned' | 'unknown'
export type NavItemId = 'kernel' | 'network' | 'builds' | 'operations' | 'research'

export interface OntoPage { id: string; name: string; size: string; lines: number; state: EvidenceState; lang: string; content: string }
export interface OntoModule { label: string; color: string; icon: string; title: string; desc: string }
export interface OntoPerson { av: string; name: string; role: string; tag: 'operator' | 'anchor' | 'builder' | 'learner'; meta: string; color: string }
export interface OntoActivity { p: string; state: EvidenceState; time: string }

export const MODULES: Record<string, OntoModule> = {
  kernel: { label: 'Kernel', color: 'var(--cyan)', icon: '⌘', title: 'Kernel', desc: 'truth layer — issuance, evidence, identity SBT, the roll' },
  network: { label: 'Network', color: 'var(--green)', icon: '◉', title: 'Network', desc: 'mesh layer — commons, tally, people, anchors' },
  builds: { label: 'Builds', color: 'var(--amber)', icon: '▤', title: 'Builds', desc: 'the yard — projects seeking funds, hands, anchors' },
  operations: { label: 'Operations', color: 'var(--red)', icon: '●', title: 'Operations', desc: 'execution layer — audits, deployments, governance' },
  research: { label: 'Research', color: 'var(--pink)', icon: '◎', title: 'Research', desc: 'research and dev — spatial optics, acoustics, animation' },
}
export const MODULE_ORDER: NavItemId[] = Object.keys(MODULES) as NavItemId[]
export const MODULE_COLORS: Record<string, string> = { kernel: 'var(--cyan)', network: 'var(--green)', builds: 'var(--amber)', operations: 'var(--red)', research: 'var(--pink)' }
export const TOTAL_BUILDS = 12
export const BUILT_COUNT = 7
export const ANCHORS = 14

export const TREE: Record<string, { dirs: string[]; pages: OntoPage[] }> = {
  kernel: {
    dirs: ['identity', 'evidence'],
    pages: [
      { id: 'kernel/core', name: 'core', size: '4.9K', lines: 104, state: 'built', lang: 'typescript', content: '// /kernel/core — Mints capability records to The Roll.' },
      { id: 'kernel/ledger', name: 'ledger', size: '6.7K', lines: 148, state: 'proto', lang: 'typescript', content: '// The Roll — unforgeable public ledger.' },
      { id: 'kernel/identity/claim', name: 'claim', size: '1.9K', lines: 30, state: 'built', lang: 'markdown', content: '# Claim — the walk — Three moves. Two minutes. One soulbound token.' },
      { id: 'kernel/identity/register', name: 'register', size: '2.6K', lines: 42, state: 'built', lang: 'typescript', content: '// Identity registration — anchor-countersigned claim.' },
      { id: 'kernel/evidence/roll', name: 'roll', size: '3.1K', lines: 56, state: 'built', lang: 'typescript', content: '// The Roll — canonical record of all minted capability records.' },
    ],
  },
  network: {
    dirs: ['tally', 'people', 'commons'],
    pages: [
      { id: 'network/tally/smis', name: 'smis', size: '2.1K', lines: 38, state: 'built', lang: 'typescript', content: '// SMIS — live ballot tally.' },
      { id: 'network/tally/active', name: 'active', size: '1.8K', lines: 31, state: 'proto', lang: 'typescript', content: '// Active votes on the network.' },
      { id: 'network/people/ledger', name: 'ledger', size: '3.4K', lines: 62, state: 'built', lang: 'markdown', content: '# People Ledger — Person / Role / Anchors' },
      { id: 'network/commons/mesh', name: 'mesh', size: '2.8K', lines: 51, state: 'planned', lang: 'typescript', content: '// Mesh network — peer-to-peer commons.' },
    ],
  },
  builds: {
    dirs: ['yard', 'tenders'],
    pages: [
      { id: 'builds/yard/smis', name: 'smis', size: '5.3K', lines: 98, state: 'proto', lang: 'typescript', content: '// SMIS build — Solar Micro-Information System.' },
      { id: 'builds/yard/lattice', name: 'lattice', size: '4.1K', lines: 77, state: 'planned', lang: 'typescript', content: '// Lattice — structural framing system.' },
      { id: 'builds/tenders/open', name: 'open', size: '1.9K', lines: 34, state: 'built', lang: 'markdown', content: '# Open Tenders — Build / Seeking / Deadline' },
    ],
  },
  operations: {
    dirs: ['audit', 'deploy', 'govern'],
    pages: [
      { id: 'operations/audit/q3', name: 'q3', size: '2.9K', lines: 53, state: 'built', lang: 'typescript', content: '// Q3 Audit — compliance and evidence review.' },
      { id: 'operations/deploy/rollout', name: 'rollout', size: '3.2K', lines: 61, state: 'proto', lang: 'typescript', content: '// Deployment rollout — staged release.' },
      { id: 'operations/govern/seal', name: 'seal', size: '1.7K', lines: 30, state: 'planned', lang: 'markdown', content: '# Governance Seal — Proposals awaiting anchor countersignature.' },
    ],
  },
  research: {
    dirs: ['bench', 'specimens'],
    pages: [
      { id: 'research/bench/specimens', name: 'specimens', size: '3.8K', lines: 69, state: 'proto', lang: 'typescript', content: '// Research bench — pre-registered specimens.' },
      { id: 'research/specimens/acoustics', name: 'acoustics', size: '2.4K', lines: 44, state: 'planned', lang: 'typescript', content: '// Spatial acoustics research specimen.' },
      { id: 'research/specimens/animation', name: 'animation', size: '2.1K', lines: 38, state: 'unknown', lang: 'typescript', content: '// Animation research — motion studies.' },
    ],
  },
}

export const PEOPLE: OntoPerson[] = [
  { av: 'W', name: 'wanjiru.m', role: 'Anchor · master mason', tag: 'anchor', meta: '14 anchors signed', color: 'var(--cyan)' },
  { av: 'K', name: 'kofi.o', role: 'Builder · steel + timber', tag: 'builder', meta: '9 builds credited', color: 'var(--amber)' },
  { av: 'A', name: 'ama.s', role: 'Operator · node steward', tag: 'operator', meta: '6 nodes stewarded', color: 'var(--green)' },
  { av: 'L', name: 'learner.one', role: 'Learner · apprentice', tag: 'learner', meta: 'path to builder', color: 'var(--pink)' },
]

export const LEDGER: OntoActivity[] = [
  { p: 'wanjiru.m claimed identity SBT-0207', state: 'built', time: 'now' },
  { p: 'SMIS posted to tally — open for funds', state: 'planned', time: '2h ago' },
  { p: 'wanjiru.m anchored kernel/core — verified', state: 'built', time: '4h ago' },
  { p: 'kofi.o submitted research: spatial acoustics', state: 'proto', time: '6h ago' },
]

export function findPage(id: string): (OntoPage & { module: string }) | null {
  for (const mod of MODULE_ORDER) {
    for (const p of TREE[mod].pages) {
      if (p.id === id) return { ...p, module: mod }
    }
  }
  return null
}

export function stateColor(state: string): string {
  return ({ built: 'var(--green)', proto: 'var(--amber)', planned: 'var(--cyan)', unknown: 'var(--fg-muted)' } as Record<string,string>)[state.toLowerCase()] || 'var(--fg-muted)'
}
