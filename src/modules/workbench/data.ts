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

export type PilotKey =
  | 'benbenos'
  | 'kemetos'
  | 'minihydro'
  | 'mwea-animation-box'
  | 'open';

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
  /** KES committed to the undertaking. */
  financial: number;
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
  /** Builder: accepts obligations, executes the work. */
  builder?: string;
  /** Apprentice: learns under supervision, optional. */
  apprentice?: string;
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
}

export const WORK_ITEMS: readonly WorkItem[] = [
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

export function workItemsForPilot(pilot: PilotKey): readonly WorkItem[] {
  return WORK_ITEMS.filter((w) => w.pilot === pilot);
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
