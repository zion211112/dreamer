/**
 * APT-LABS — Workspace module registry (lean masterpiece).
 *
 * Six modules on the rail — Home plus the five productive modules:
 * Commons, Network, Workbench, Records, Intelligence.
 *
 * Per charter B1: Home is the personal shell context (/workspace) where a
 * user chooses quick acts and selects a productive module. Home is not a
 * seventh constraint; it is the context in which the five productive modules
 * are entered.
 *
 * Each entry is load-bearing: removing one stops the chain. The registry is
 * the single source of truth for module identity, navigation, accent and the
 * ontology primitive a module stands for — the shell, rail, dock and per-module
 * pages all read from here so nothing is invented per-view.
 */

export type ModuleId =
  | 'home'
  | 'commons'
  | 'network'
  | 'workbench'
  | 'records'
  | 'intelligence'

export type IconId =
  | 'home'
  | 'commons'
  | 'network'
  | 'workbench'
  | 'records'
  | 'intelligence'

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
    id: 'home',
    path: '/workspace',
    railLabel: 'Home',
    title: 'Operational Overview',
    primitive: 'the chain, not the type',
    subtitle: 'What reality enters the model, and where it is not refused.',
    icon: 'home',
    ctxNav: [
      { heading: 'Structure', items: [{ label: 'Operational core' }, { label: 'Continuity & learning' }, { label: 'Value & legitimacy' }] },
      { heading: 'Evidence standing', items: [{ label: 'Unassessed' }, { label: 'Reported' }, { label: 'Supported' }, { label: 'Verified' }, { label: 'Disputed' }] },
    ],
  },
  {
    id: 'commons',
    path: '/workspace/commons',
    railLabel: 'Commons',
    title: 'Commons',
    primitive: 'INTENTION',
    subtitle: 'What is wanted, asked, and examined before it becomes work.',
    icon: 'commons',
    ctxNav: [
      { heading: 'Commons', items: [{ label: 'Explore', to: '/workspace/commons' }, { label: 'Inquiries', to: '/workspace/commons', count: 38 }, { label: 'Knowledge', to: '/workspace/commons', count: 142 }, { label: 'Briefs', to: '/workspace/commons', count: 12 }, { label: 'Contribute' }] },
      { heading: 'Relations', items: [{ label: 'Responds to' }, { label: 'Derived from' }] },
    ],
  },
  {
    id: 'network',
    path: '/workspace/network',
    railLabel: 'Network',
    title: 'Network',
    primitive: 'ACTOR · CAPABILITY · RESOURCE',
    subtitle: 'Who acts, what they can do, what they hold.',
    icon: 'network',
    ctxNav: [
      { heading: 'Actors', items: [{ label: 'People', to: '/workspace/network/people' }, { label: 'Institutions', to: '/workspace/network/institutions' }, { label: 'Capabilities', to: '/workspace/network/capabilities' }] },
      { heading: 'Relations', items: [{ label: 'Holds capability' }, { label: 'Custodies' }, { label: 'Acts on behalf of' }, { label: 'Located at' }] },
    ],
  },
  {
    id: 'workbench',
    path: '/workspace/workbench',
    railLabel: 'Work',
    title: 'Workbench',
    primitive: 'WORK',
    subtitle: 'The Proof-Carrying Work Unit — a defined, testable undertaking.',
    icon: 'workbench',
    ctxNav: [
      { heading: 'Pilots', items: [{ label: 'All pilots', to: '/workspace/workbench' }, { label: 'Active' }, { label: 'In review' }, { label: 'Complete' }] },
      { heading: 'Roll', items: [{ label: 'Participants', to: '/workspace/workbench' }, { label: 'Hand-offs' }] },
    ],
  },
  {
    id: 'records',
    path: '/workspace/records',
    railLabel: 'Records',
    title: 'Records',
    primitive: 'CANON · ANNALS · ROLL',
    subtitle: 'Civilizational memory — canon, annals, and the immutable roll.',
    icon: 'records',
    ctxNav: [
      { heading: 'Lenses', items: [{ label: 'Canon', to: '/workspace/records/canon' }, { label: 'Annals', to: '/workspace/records/annals' }, { label: 'Roll', to: '/workspace/records/roll' }] },
      { heading: 'Search', items: [{ label: 'Records' }, { label: 'Knowledge' }] },
    ],
  },
  {
    id: 'intelligence',
    path: '/workspace/intelligence',
    railLabel: 'Intelligence',
    title: 'Intelligence',
    primitive: 'matching · forecasting · agents',
    subtitle: 'The model working — matching, forecasting, and running agents.',
    icon: 'intelligence',
    ctxNav: [
      { heading: 'Agents', items: [{ label: 'Matching' }, { label: 'Forecasting' }, { label: 'Agents', to: '/workspace/intelligence' }] },
      { heading: 'Kemetos', items: [{ label: 'Coordinator', to: '/workspace/intelligence' }] },
    ],
  },
]

export const MODULE_BY_ID = Object.fromEntries(WORKSPACE_MODULES.map((m) => [m.id, m])) as Record<ModuleId, WorkspaceModule>

/** Match a route path to its owning module. `/workspace` itself → home. */
export function moduleForPath(path: string): WorkspaceModule {
  if (path === '/workspace') return MODULE_BY_ID.home
  const seg = path.replace(/^\/workspace\//, '').split('/')[0]
  const known: Record<string, ModuleId> = {
    commons: 'commons',
    network: 'network',
    people: 'network',
    institutions: 'network',
    capabilities: 'network',
    workbench: 'workbench',
    records: 'records',
    canon: 'records',
    annals: 'records',
    roll: 'records',
    intelligence: 'intelligence',
    kemetos1: 'intelligence',
  }
  const id = known[seg] ?? 'home'
  return MODULE_BY_ID[id]
}