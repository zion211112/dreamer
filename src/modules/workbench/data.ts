/**
 * Workbench — APT-LABS
 *
 * Five pilot lanes that stewards can work through today, plus an open slot
 * for the next pilot. The registry is intentionally open: register a pilot
 * here and it appears across the workbench without touching any page or the
 * router.
 *
 * Position: sovereign work coordination. Published, fair rates in KES; work
 * that stays in the community; local stewardship, not extractive labor. Built
 * to out-remotask Remotasks and the closed city workbenches by keeping terms
 * transparent, local, and owned by the people doing the work.
 *
 * Browser-local, illustrative data — one source per pilot.
 */

import { createLocalId, type CommonsProposal } from '@/lib/local-workflows';
import { signal } from '@preact/signals';

export type PilotKey =
  | 'benbenos'
  | 'kemetos'
  | 'minihydro'
  | 'mwea-animation-box'
  | 'open';

const WORK_ITEMS_STORAGE_KEY = 'aptlabs:workbench-items:v1';

function loadWorkItems(): WorkItem[] {
  try {
    const raw = localStorage.getItem(WORK_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v: unknown): v is WorkItem => isWorkItem(v));
  } catch {
    return [];
  }
}

function saveWorkItems(items: WorkItem[]): void {
  try {
    localStorage.setItem(WORK_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    throw new Error('Workbench items could not be saved to local storage.');
  }
}

function isWorkItem(value: unknown): value is WorkItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<WorkItem>;
  const capital = item.capital;

  return (
    typeof item.id === 'string'
    && typeof item.pilot === 'string'
    && typeof item.title === 'string'
    && typeof item.discipline === 'string'
    && typeof item.location === 'string'
    && typeof item.gate === 'string'
    && Array.isArray(item.evidence)
    && typeof capital === 'object' && capital !== null
    && (capital.financial === null
      || (typeof capital.financial === 'number' && Number.isFinite(capital.financial)))
  );
}

export const WORK_ITEMS = signal<WorkItem[]>(loadWorkItems());

saveWorkItems(WORK_ITEMS.value);

/**
 * Tender gate state machine. Each work item sits at exactly one gate. Gates
 * are thresholds, not status badges: each shows what blocks it, who holds the
 * key, and what evidence is required to cross.
 */
export type GateState =
  | 'draft'
  | 'proposed'
  | 'in_review'
  | 'pending_authorization'
  | 'authorized'
  | 'in_execution'
  | 'pending_acceptance'
  | 'accepted';

export type EvidenceLayer = 'public' | 'participant' | 'restricted';

export interface Capital {
  /** KES committed to the undertaking, or null when no amount is set. */
  financial: number | null;
  /** Materials and equipment provided. */
  materials: string[];
  /** Conditions that must be met before release. */
  conditions: string[];
  /** Whether committed resources have actually been deployed. */
  deployed: boolean;
  /** Whether capital is locked in programmatic escrow (Step 3). */
  escrowed: boolean;
}

export interface Crew {
  /** Anchor: holds authority, signs off, accepts delivery. */
  anchor?: string;
  /** Network person id linked to the anchor. */
  anchorPersonId?: string;
  /** Builder: accepts obligations, executes the work. */
  builder?: string;
  /** Network person id linked to the builder. */
  builderPersonId?: string;
  /** Apprentice: learns under supervision, optional. */
  apprentice?: string;
  /** Network person id linked to the apprentice. */
  apprenticePersonId?: string;
  /** Coordinator: stewards the undertaking across modules. */
  coordinator?: string;
  /** Network person id linked to the coordinator. */
  coordinatorPersonId?: string;
}

export interface Pilot {
  key: PilotKey;
  label: string;
  href: string;
  character: string;
  location: string;
  terms: string;
  /** 'illustrative' = not yet live; 'published' = rates and terms are real. */
  status: 'illustrative' | 'published';
  steward: string;
}

/**
 * The five pilot lanes that ship inside the Workbench module. The registry is
 * intentionally open: additional pilots can be registered here without
 * changing any page or the router. No lane is a simulation — each is an
 * action surface where a steward can work through real undertakings.
 */
export const PILOTS: readonly Pilot[] = [
  {
    key: 'benbenos',
    label: 'Benbenos',
    href: '/workspace/workbench/benbenos',
    character: 'Learning operations',
    location: 'Nairobi',
    terms: 'Published rates in KES. Steward-owned; work stays with the local school.',
    status: 'published',
    steward: 'School Console steward',
  },
  {
    key: 'kemetos',
    label: 'Kemetos',
    href: '/workspace/workbench/kemetos',
    character: 'Electrical and solar',
    location: 'Nairobi',
    terms: 'Published rates in KES. Certified electricians set their own day rate.',
    status: 'published',
    steward: 'Kemetos steward',
  },
  {
    key: 'minihydro',
    label: 'Mini Hydro',
    href: '/workspace/workbench/minihydro',
    character: 'Micro-hydro power',
    location: 'Thiba',
    terms: 'Published rates in KES. Community-owned power; crews are paid per trip and per task.',
    status: 'published',
    steward: 'Thiba community steward',
  },
  {
    key: 'mwea-animation-box',
    label: 'Mwea Animation Box',
    href: '/workspace/workbench/mwea-animation-box',
    character: 'Irrigation and animation',
    location: 'Mwea',
    terms: 'Published rates in KES. Local operators run the box; animation value stays in Mwea.',
    status: 'published',
    steward: 'Mwea operators steward',
  },
  {
    key: 'open',
    label: 'Open pilot',
    href: '/workspace/workbench/open',
    character: 'Open',
    location: '—',
    terms: 'Terms set when the pilot is registered.',
    status: 'illustrative',
    steward: '—',
  },
];

export function pilotByKey(key: string): Pilot | undefined {
  return PILOTS.find((p) => p.key === key);
}

export function pilotByHref(href: string): Pilot | undefined {
  return PILOTS.find((p) => p.href === href);
}

/* ------------------------------------------------------------------ */
/* Work items — browser-local, illustrative, one source per pilot     */
/* ------------------------------------------------------------------ */

export interface WorkItem {
  id: string;
  pilot: PilotKey;
  title: string;
  discipline: string;
  location: string;
  gate: GateState;
  evidence: EvidenceLayer[];
  capital: Capital;
  crew: Crew;
  /** Only shown when the pilot is published; illustrative lanes show gate instead. */
  publishedValue?: string;
  /** Step 1 (caveman): structured work brief — scope, BOM, acceptance criteria. No human padding. */
  callSheet?: { scope: string; bom: string[]; acceptance: string[] };
  /** Step 2 (impeccable): APT Passport SBT credential required to claim this job. */
  credential?: string;
  /** Step 4 (ponytail): telemetry verification state. */
  verification?: { telemetrySource?: string; verifiedAt?: string; attestationId?: string };
  /** Traceable lifecycle events across all gate transitions, settlement, and learning. */
  events?: LifecycleEvent[];
  /** Settlement events: payment, materials reconciliation, cost adjustment, expense settlement. Separate from acceptance. */
  settlement?: SettlementEvent[];
  /** Learning events: lessons, reusable designs, updated acceptance criteria. Feeds Commons and Workbench scoping. */
  learning?: LearningEvent[];

  /** Traceability back to the Commons proposal/signal that originated this undertaking. */
  sourceProposalId?: string;
  sourceSignalId?: string;
}

export type LifecycleEvent = {
  id: string;
  type: 'gate_advance' | 'settlement' | 'learning' | 'evidence_added' | 'correction';
  fromGate?: GateState;
  toGate?: GateState;
  actor: string;
  note: string;
  createdAt: string;
}

/** Settlement event — resolving obligations after acceptance. Acceptance is not settlement. */
export interface SettlementEvent {
  id: string;
  type: 'payment' | 'materials_reconciliation' | 'cost_adjustment' | 'expense_settlement';
  amount?: number;
  currency?: string;
  actor: string;
  note: string;
  createdAt: string;
}

/** Learning event — carrying capability into the next undertaking. Settlement is not learning. */
export interface LearningEvent {
  id: string;
  type: 'lesson' | 'reusable_design' | 'updated_criteria' | 'dispute_resolution';
  title: string;
  description: string;
  reusableDesignId?: string;
  actor: string;
  createdAt: string;
}

/** Create a Workbench undertaking from an approved Commons proposal.
 *  Bidirectional traceability: the WorkItem carries sourceProposalId/sourceSignalId,
 *  and a lifecycle event records the proposal→undertaking transition. */
export function createUndertakingFromProposal(
  proposal: CommonsProposal,
  actor: string,
  location: string,
): WorkItem | undefined {
  if (proposal.status !== 'approved') return undefined;

  const id = createLocalId('undertaking');
  const workItem: WorkItem = {
    id,
    pilot: 'open',
    title: proposal.title,
    discipline: 'General',
    location,
    gate: 'proposed',
    evidence: ['public'],
    capital: {
      financial: null,
      materials: [],
      conditions: ['Steward sign-off'],
      deployed: false,
      escrowed: false,
    },
    crew: { anchor: '', builder: '', apprentice: '' },
    callSheet: {
      scope: proposal.rationale,
      bom: [],
      acceptance: [],
    },
    sourceProposalId: proposal.id,
    sourceSignalId: proposal.sourceSignalId ?? undefined,
    events: [{
      id: createLocalId('lifecycle-event'),
      type: 'gate_advance',
      fromGate: undefined,
      toGate: 'proposed',
      actor,
      note: `Created from Commons proposal ${proposal.id} (signal ${proposal.sourceSignalId ?? '—'}).`,
      createdAt: new Date().toISOString(),
    }],
  };

  return workItem;
}

/** Add an undertaking created from Commons to the work item registry. */
export function registerUndertaking(workItem: WorkItem): void {
  WORK_ITEMS.value = [...WORK_ITEMS.value, workItem];
  saveWorkItems(WORK_ITEMS.value);
}

/** Seed undertakings for each published pilot lane. */
const SEED_WORK_ITEMS: WorkItem[] = [
  // Benbenos — published
  {
    id: 'wi-01',
    pilot: 'benbenos',
    title: 'Benbenos console upkeep',
    discipline: 'Learning operations',
    location: 'Nairobi',
    gate: 'proposed',
    evidence: ['public'],
    capital: {
      financial: 6000,
      materials: ['Console parts', 'Learner record forms'],
      conditions: ['Steward sign-off', 'Learner privacy check'],
      deployed: false,
      escrowed: true,
    },
    crew: { anchor: 'School Console steward', builder: '—', apprentice: '—' },
    callSheet: {
      scope: 'Console upkeep for learner operations',
      bom: ['Console parts', 'Learner record forms'],
      acceptance: ['Steward sign-off', 'Learner privacy check'],
    },
    credential: 'Learning Operations Steward',
    publishedValue: 'KES 6,000',
  },
  {
    id: 'wi-02',
    pilot: 'benbenos',
    title: 'Learner record audit',
    discipline: 'Records',
    location: 'Nairobi',
    gate: 'in_execution',
    evidence: ['public', 'participant'],
    capital: {
      financial: 4000,
      materials: ['Record ledger', 'Hash anchor'],
      conditions: ['Anchor authorization'],
      deployed: true,
      escrowed: true,
    },
    crew: { anchor: 'School Console steward', builder: 'Records clerk', apprentice: '—' },
    callSheet: {
      scope: 'Audit learner records for accuracy',
      bom: ['Record ledger', 'Hash anchor'],
      acceptance: ['Anchor authorization'],
    },
    verification: { telemetrySource: 'Record ledger hash', attestationId: 'att-2026-10-17-01' },
    publishedValue: 'KES 4,000',
  },
  // Kemetos — published
  {
    id: 'wi-03',
    pilot: 'kemetos',
    title: 'Kemetos AGI1 wiring',
    discipline: 'Electrical',
    location: 'Nairobi',
    gate: 'draft',
    evidence: ['public'],
    capital: {
      financial: 12000,
      materials: ['Cable', 'Conduit', 'Breaker panel'],
      conditions: ['Certified electrician sign-off'],
      deployed: false,
      escrowed: false,
    },
    crew: { anchor: 'Kemetos steward', builder: '—', apprentice: '—' },
    callSheet: {
      scope: 'Kemetos AGI1 wiring installation',
      bom: ['Cable', 'Conduit', 'Breaker panel'],
      acceptance: ['Certified electrician sign-off'],
    },
    publishedValue: 'KES 12,000',
  },
  {
    id: 'wi-04',
    pilot: 'kemetos',
    title: 'Solar basic installation',
    discipline: 'Solar',
    location: 'Nairobi',
    gate: 'pending_authorization',
    evidence: ['public'],
    capital: {
      financial: 18000,
      materials: ['Solar panels', 'Inverter', 'Mounting rails'],
      conditions: ['Anchor authorization', 'Electrical inspection'],
      deployed: false,
      escrowed: true,
    },
    crew: { anchor: 'Kemetos steward', builder: '—', apprentice: '—' },
    callSheet: {
      scope: 'Solar basic installation',
      bom: ['Solar panels', 'Inverter', 'Mounting rails'],
      acceptance: ['Anchor authorization', 'Electrical inspection'],
    },
    credential: 'Certified Electrician',
    publishedValue: 'KES 18,000',
  },
  // Mini Hydro — published
  {
    id: 'wi-05',
    pilot: 'minihydro',
    title: 'Thiba canal lining',
    discipline: 'Masonry',
    location: 'Thiba',
    gate: 'in_execution',
    evidence: ['public', 'participant'],
    capital: {
      financial: 48000,
      materials: ['Portland cement', 'Stone', 'Reinforcement'],
      conditions: ['Community sign-off', 'Water flow check'],
      deployed: true,
      escrowed: true,
    },
    crew: { anchor: 'Thiba community steward', builder: 'Masonry crew lead', apprentice: '—' },
    callSheet: {
      scope: 'Thiba canal lining',
      bom: ['Portland cement', 'Stone', 'Reinforcement'],
      acceptance: ['Community sign-off', 'Water flow check'],
    },
    verification: { telemetrySource: 'Water flow sensor', attestationId: 'att-2026-10-17-02' },
    publishedValue: 'KES 48,000',
  },
  {
    id: 'wi-06',
    pilot: 'minihydro',
    title: 'Turbine tending',
    discipline: 'Hydro operations',
    location: 'Thiba',
    gate: 'proposed',
    evidence: ['public'],
    capital: {
      financial: 22000,
      materials: ['Turbine parts', 'Lubricant'],
      conditions: ['Crew assembly'],
      deployed: false,
      escrowed: false,
    },
    crew: { anchor: 'Thiba community steward', builder: '—', apprentice: '—' },
    callSheet: {
      scope: 'Turbine tending',
      bom: ['Turbine parts', 'Lubricant'],
      acceptance: ['Crew assembly'],
    },
    publishedValue: 'KES 22,000',
  },
  // Mwea Animation Box — published
  {
    id: 'wi-07',
    pilot: 'mwea-animation-box',
    title: 'Mwea irrigation box operation',
    discipline: 'Irrigation',
    location: 'Mwea',
    gate: 'authorized',
    evidence: ['public', 'participant'],
    capital: {
      financial: 9500,
      materials: ['Irrigation box', 'Pump'],
      conditions: ['Local operator sign-off'],
      deployed: true,
      escrowed: true,
    },
    crew: { anchor: 'Mwea operators steward', builder: 'Box operator', apprentice: '—' },
    callSheet: {
      scope: 'Mwea irrigation box operation',
      bom: ['Irrigation box', 'Pump'],
      acceptance: ['Local operator sign-off'],
    },
    credential: 'Local Box Operator',
    publishedValue: 'KES 9,500',
  },
  {
    id: 'wi-08',
    pilot: 'mwea-animation-box',
    title: 'Local animation content',
    discipline: 'Animation',
    location: 'Mwea',
    gate: 'pending_acceptance',
    evidence: ['participant', 'restricted'],
    capital: {
      financial: 15000,
      materials: ['Animation rig', 'Storage'],
      conditions: ['Content review'],
      deployed: true,
      escrowed: true,
    },
    crew: { anchor: 'Mwea operators steward', builder: 'Animator', apprentice: '—' },
    callSheet: {
      scope: 'Local animation content production',
      bom: ['Animation rig', 'Storage'],
      acceptance: ['Content review'],
    },
    verification: { telemetrySource: 'Content review log', attestationId: 'att-2026-10-17-03' },
    publishedValue: 'KES 15,000',
  },
];

if (WORK_ITEMS.value.length === 0) {
  WORK_ITEMS.value = SEED_WORK_ITEMS;
  saveWorkItems(WORK_ITEMS.value);
}

export function workItemsForPilot(pilot: PilotKey): readonly WorkItem[] {
  return WORK_ITEMS.value.filter((w) => w.pilot === pilot);
}

/** Assign a Network person/crew entity to a crew role on a work item.
 *  Returns the updated work item, or undefined when the item does not exist
 *  or the role is unknown. personId resolves to a Network entity id. */
export function assignCrewMember(
  workItemId: string,
  role: 'anchor' | 'builder' | 'apprentice' | 'coordinator',
  personName: string,
  personId: string,
): WorkItem | undefined {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  if (!item) return undefined;
  item.crew = {
    ...item.crew,
    [role]: personName,
    [`${role}PersonId`]: personId,
  };
  recordLifecycleEvent(workItemId, {
    type: 'gate_advance',
    fromGate: item.gate,
    toGate: item.gate,
    actor: personId,
    note: `Crew assigned: ${role} = ${personName} (${personId}).`,
    createdAt: new Date().toISOString(),
  });
  return item;
}

/** Human-readable label for each gate state. */
export const GATE_LABELS: Record<GateState, string> = {
  draft: 'Draft',
  proposed: 'Proposed',
  in_review: 'In review',
  pending_authorization: 'Awaiting authorization',
  authorized: 'Authorized',
  in_execution: 'In execution',
  pending_acceptance: 'Pending acceptance',
  accepted: 'Accepted',
};

/** Semantic color token for each gate state. */
export const GATE_COLORS: Record<GateState, 'canon' | 'proposed' | 'risk' | 'caution'> = {
  draft: 'caution',
  proposed: 'proposed',
  in_review: 'caution',
  pending_authorization: 'risk',
  authorized: 'canon',
  in_execution: 'canon',
  pending_acceptance: 'caution',
  accepted: 'canon',
};

/** Whether the fork glyph (└─) appears at this gate — only at 'proposed'. */
export const GATE_FORK: Record<GateState, boolean> = {
  draft: false,
  proposed: true,
  in_review: false,
  pending_authorization: false,
  authorized: false,
  in_execution: false,
  pending_acceptance: false,
  accepted: false,
};

/** Maps each tender gate to one of the 4 Workbench execution steps.
   Step 1 (caveman): Signal → Call Sheet   Step 2 (impeccable): Credential → Claim
   Step 3 (impeccable): Escrow lock        Step 4 (ponytail): Verify → Settle */
export const CALL_SHEET_STEP: Record<GateState, { step: number; label: string }> = {
  draft: { step: 1, label: 'Signal' },
  proposed: { step: 1, label: 'Call Sheet' },
  in_review: { step: 2, label: 'Discovery' },
  pending_authorization: { step: 2, label: 'Claim' },
  authorized: { step: 3, label: 'Escrow' },
  in_execution: { step: 3, label: 'Execution' },
  pending_acceptance: { step: 4, label: 'Verification' },
  accepted: { step: 4, label: 'Settled' },
};

/* ------------------------------------------------------------------ */
/* Gate transitions & aggregate metrics                                 */
/* ------------------------------------------------------------------ */

export const ALL_GATE_STATES: readonly GateState[] = [
  'draft', 'proposed', 'in_review', 'pending_authorization',
  'authorized', 'in_execution', 'pending_acceptance', 'accepted',
];

/** Next gate state; `null` when the undertaking is settled (terminal). */
export const NEXT_GATE: Record<GateState, GateState | null> = {
  draft: 'proposed',
  proposed: 'in_review',
  in_review: 'pending_authorization',
  pending_authorization: 'authorized',
  authorized: 'in_execution',
  in_execution: 'pending_acceptance',
  pending_acceptance: 'accepted',
  accepted: null,
};

export interface HomeMetrics {
  publishedLanes: number;
  totalCapital: number;
  activeCount: number;
}

export function totalCommittedCapital(items: readonly WorkItem[]): number {
  return items.reduce((total, item) => total + (item.capital.financial ?? 0), 0);
}

export function homeMetrics(): HomeMetrics {
  const publishedLanes = PILOTS.filter((p) => p.status === 'published').length;
  const totalCapital = totalCommittedCapital(WORK_ITEMS.value);
  const activeCount = WORK_ITEMS.value.filter((i) => i.gate !== 'accepted').length;
  return { publishedLanes, totalCapital, activeCount };
}

/* ------------------------------------------------------------------ */
/* Lifecycle event recording — single source of truth                 */
/* ------------------------------------------------------------------ */

export function recordLifecycleEvent(
  workItemId: string,
  event: Omit<LifecycleEvent, 'id'>,
): WorkItem | undefined {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  if (!item) return undefined;
  const next: LifecycleEvent = { ...event, id: createLocalId('lifecycle-event') };
  item.events = item.events ? [...item.events, next] : [next];
  return item;
}

export function recordSettlementEvent(
  workItemId: string,
  settlement: Omit<SettlementEvent, 'id'>,
): WorkItem | undefined {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  if (!item) return undefined;
  const next: SettlementEvent = { ...settlement, id: createLocalId('settlement-event') };
  item.settlement = item.settlement ? [...item.settlement, next] : [next];
  return item;
}

export function recordLearningEvent(
  workItemId: string,
  learning: Omit<LearningEvent, 'id'>,
): WorkItem | undefined {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  if (!item) return undefined;
  const next: LearningEvent = { ...learning, id: createLocalId('learning-event') };
  item.learning = item.learning ? [...item.learning, next] : [next];
  return item;
}

/** Advance a work item's gate and record the transition as a traceable lifecycle event. */
export function advanceGate(
  workItemId: string,
  actor: string,
  note: string,
): WorkItem | undefined {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  if (!item) return undefined;
  const nextGate = NEXT_GATE[item.gate];
  if (!nextGate) return undefined;
  const previous = item.gate;
  item.gate = nextGate;
  recordLifecycleEvent(workItemId, {
    type: 'gate_advance',
    fromGate: previous,
    toGate: nextGate,
    actor,
    note,
    createdAt: new Date().toISOString(),
  });
  return item;
}

/** Get all lifecycle events for a work item, newest first. */
export function lifecycleEventsFor(workItemId: string): LifecycleEvent[] {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  return item?.events?.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ) ?? [];
}

/** Get all settlement events for a work item, newest first. */
export function settlementEventsFor(workItemId: string): SettlementEvent[] {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  return item?.settlement?.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ) ?? [];
}

/** Get all learning events for a work item, newest first. */
export function learningEventsFor(workItemId: string): LearningEvent[] {
  const item = WORK_ITEMS.value.find((w) => w.id === workItemId);
  return item?.learning?.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ) ?? [];
}
