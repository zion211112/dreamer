/**
 * APT-LABS — Workbench data (Vue 3 edition)
 *
 * Vue-reactive mirror of the Preact workbench data layer. Re-exports types and
 * pure values from `./data`, but manages browser-local work items with Vue's
 * `ref` instead of Preact signals, keeping the Vue runtime isolated from Preact
 * (mandate B9: separate entry points, separate runtimes).
 */

import type { Pilot, WorkItem, GateState, HomeMetrics } from './data';
import { ref } from 'vue';
import { PILOTS, totalCommittedCapital as totalCommittedCapitalPure } from './data';

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

/** Seed work items for each published pilot lane (mirrors ./data seed data). */
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

const workItems = ref<WorkItem[]>(loadWorkItems());

if (workItems.value.length === 0) {
  workItems.value = SEED_WORK_ITEMS;
  saveWorkItems(workItems.value);
}

/** Reactive work items source. */
export { workItems };

/** Work items for a pilot key. */
export function workItemsForPilotVue(pilotKey: string): WorkItem[] {
  return workItems.value.filter((w) => w.pilot === pilotKey);
}

/** Home aggregate metrics. */
export function homeMetricsVue(): HomeMetrics {
  const publishedLanes = PILOTS.filter((p) => p.status === 'published').length;
  const totalCapital = totalCommittedCapitalPure(workItems.value);
  const activeCount = workItems.value.filter((i) => i.gate !== 'accepted').length;
  return { publishedLanes, totalCapital, activeCount };
}

/** Total committed capital for a set of work items. */
export function totalCommittedCapitalVue(items: readonly WorkItem[]): number {
  return items.reduce((total, item) => total + (item.capital.financial ?? 0), 0);
}

export type { Pilot, WorkItem, GateState, HomeMetrics };
export { PILOTS };
