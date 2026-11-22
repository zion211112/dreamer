/**
 * APT-LABS — Workspace module registry (lean masterpiece).
 *
 * Five modules on the rail — the spine of the operating infrastructure.
 * Each entry is load-bearing: removing one stops the chain. The registry is
 * the single source of truth for module identity, navigation, accent and the
 * ontology primitive a module stands for — the shell, rail, dock and per-module
 * pages all read from here so nothing is invented per-view.
 *
 * The five pillars (docs/design/superior-fusion-design-system.md) colour each
 * module via the [data-module="…"] accent overrides in apt-tokens.css.
 */

export type Pillar = 'knowledge' | 'capacity' | 'production' | 'exchange' | 'stewardship'

export type ModuleId =
  | 'overview'
  | 'commons-network'
  | 'workbench'
  | 'records-intelligence'
  | 'value'

export type IconId =
  | 'overview'
  | 'commons-network'
  | 'workbench'
  | 'records-intelligence'
  | 'value'

export interface CtxNavItem {
  label: string
  /** Router target. Omitted for in-page filters/placeholders. */
  to?: string
  /** Optional count badge (mono, dim). */
  count?: number
}

export interface CtxNavSection {
  heading: string
  items: CtxNavItem[]
}

export interface WorkspaceModule {
  id: ModuleId
  /** Absolute route path. */
  path: string
  /** Short label for the 64px rail. */
  railLabel: string
  /** Page-head title. */
  title: string
  /** Pillar the module stands for. */
  pillar: Pillar
  /** The ontology primitive(s) this module is the home of. */
  primitive: string
  /** One-line doctrine. Kept terse on purpose. */
  subtitle: string
  icon: IconId
  /** Secondary (232px) column nav. */
  ctxNav: CtxNavSection[]
}

/** Rail order = the chain: reality → legibility → agency → coordination → execution → proof → value. */
export const WORKSPACE_MODULES: WorkspaceModule[] = [
  {
    id: 'overview',
    path: '/workspace',
    railLabel: 'Home',
    title: 'Operational Overview',
    pillar: 'stewardship',
    primitive: 'the chain, not the type',
    subtitle: 'What reality enters the model, and where it is not refused.',
    icon: 'overview',
    ctxNav: [
      { heading: 'Structure', items: [{ label: 'Operational core' }, { label: 'Continuity & learning' }, { label: 'Value & legitimacy' }] },
      { heading: 'Evidence standing', items: [{ label: 'Unassessed' }, { label: 'Reported' }, { label: 'Supported' }, { label: 'Verified' }, { label: 'Disputed' }] },
    ],
  },
  {
    id: 'commons-network',
    path: '/workspace/commons',
    railLabel: 'Commons',
    title: 'Commons / Network',
    pillar: 'knowledge',
    primitive: 'INTENTION · ACTOR · CAPABILITY · RESOURCE',
    subtitle: 'What is wanted, asked, and examined before it becomes work. Who acts, what they can do, what they hold.',
    icon: 'commons-network',
    ctxNav: [
      { heading: 'Commons', items: [{ label: 'Explore', to: '/workspace/commons' }, { label: 'Inquiries', to: '/workspace/commons', count: 38 }, { label: 'Knowledge', to: '/workspace/commons', count: 142 }, { label: 'Briefs', to: '/workspace/commons', count: 12 }, { label: 'Contribute' }] },
      { heading: 'Actors', items: [{ label: 'People', to: '/workspace/network/people' }, { label: 'Institutions', to: '/workspace/network/institutions' }, { label: 'Capabilities', to: '/workspace/network/capabilities' }] },
      { heading: 'Relations', items: [{ label: 'Holds capability' }, { label: 'Custodies' }, { label: 'Acts on behalf of' }, { label: 'Located at' }] },
    ],
  },
  {
    id: 'workbench',
    path: '/workspace/workbench',
    railLabel: 'Work',
    title: 'Workbench',
    pillar: 'production',
    primitive: 'WORK',
    subtitle: 'The Proof-Carrying Work Unit — a defined, testable undertaking.',
    icon: 'workbench',
    ctxNav: [
      { heading: 'Pilots', items: [{ label: 'All pilots', to: '/workspace/workbench' }, { label: 'Active' }, { label: 'In review' }, { label: 'Complete' }] },
      { heading: 'Roll', items: [{ label: 'Participants', to: '/workspace/workbench' }, { label: 'Hand-offs' }] },
    ],
  },
  {
    id: 'records-intelligence',
    path: '/workspace/records',
    railLabel: 'Records',
    title: 'Records / Intelligence',
    pillar: 'stewardship',
    primitive: 'KNOWLEDGE · MEMORY · matching · forecasting · agents',
    subtitle: 'Civilizational memory — canon, annals, and the immutable roll. The model working — matching, forecasting, and running agents.',
    icon: 'records-intelligence',
    ctxNav: [
      { heading: 'Stores', items: [{ label: 'Canon', to: '/workspace/records/canon' }, { label: 'Annals', to: '/workspace/records/annals' }, { label: 'Roll', to: '/workspace/records/roll' }] },
      { heading: 'Search', items: [{ label: 'Records' }, { label: 'Knowledge' }] },
      { heading: 'Agents', items: [{ label: 'Matching' }, { label: 'Forecasting' }, { label: 'Agents', to: '/workspace/intelligence' }] },
      { heading: 'Kemetos', items: [{ label: 'Coordinator', to: '/workspace/kemetos1' }] },
    ],
  },
  {
    id: 'value',
    path: '/workspace/value',
    railLabel: 'Value',
    title: 'Value',
    pillar: 'exchange',
    primitive: 'OUTCOME · VALUE',
    subtitle: 'What circulates, and that it was allocated in the open.',
    icon: 'value',
    ctxNav: [
      { heading: 'Circulation', items: [{ label: 'Outcomes' }, { label: 'Allocation' }, { label: 'Settlements' }] },
      { heading: 'Instrument', items: [{ label: 'Apt-coin', to: '/workspace/value' }] },
    ],
  },
]

export const MODULE_BY_ID = Object.fromEntries(WORKSPACE_MODULES.map((m) => [m.id, m])) as Record<ModuleId, WorkspaceModule>

/** Match a route path to its owning module. `/workspace` itself → overview. */
export function moduleForPath(path: string): WorkspaceModule {
  if (path === '/workspace') return MODULE_BY_ID.overview
  const seg = path.replace(/^\/workspace\//, '').split('/')[0]
  const known: Record<string, ModuleId> = {
    commons: 'commons-network',
    network: 'commons-network',
    workbench: 'workbench',
    records: 'records-intelligence',
    value: 'value',
    intelligence: 'records-intelligence',
    kemetos1: 'records-intelligence',
    canon: 'records-intelligence',
    annals: 'records-intelligence',
    roll: 'records-intelligence',
  }
  const id = known[seg] ?? 'overview'
  return MODULE_BY_ID[id]
}
