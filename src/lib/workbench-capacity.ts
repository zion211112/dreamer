export interface CapacityNeed {
  id: string;
  title: string;
  institution: string;
  quantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  location: string;
  recordBasis: 'illustrative';
}

export interface CapacityEvidence {
  id: string;
  source: string;
  date: string;
  recordBasis: 'illustrative';
}

export type CapacityEntityType =
  | 'cooperative'
  | 'community group'
  | 'service team'
  | 'farm collective'
  | 'repair crew';

export interface CapacityCandidate {
  id: string;
  entityType: CapacityEntityType;
  name: string;
  location: string;
  capabilities: string[];
  reportedCapacity: number;
  capacityUnit: string;
  capacityPeriod: string;
  distanceKm: number;
  availability: 'unknown' | 'available' | 'unavailable';
  evidence: CapacityEvidence[];
  recordBasis: 'illustrative';
}

export interface CapacityFilters {
  query: string;
  hasEvidence: boolean;
  withinKm: number | null;
  sortBy: 'distance' | 'capacity';
}

export interface CapacityScenario {
  id: string;
  title: string;
  description: string;
  need: CapacityNeed;
  candidates: CapacityCandidate[];
}

export const KIRINYAGA_CAPACITY_SCENARIO: CapacityScenario = {
  id: 'kirinyaga-irrigation-repair',
  title: 'Irrigation pump repair and servicing',
  description: 'Illustrative matching scenario; all entities, distances, capacity, and evidence are synthetic.',
  need: {
    id: 'kirinyaga-pump-service-need',
    title: 'Repair and service irrigation pumps',
    institution: 'Illustrative Mwea Water Cooperative',
    quantity: 24,
    unit: 'pumps',
    startDate: '2026-11-16',
    endDate: '2026-12-15',
    location: 'Mwea, Kirinyaga',
    recordBasis: 'illustrative',
  },
  candidates: [
    {
      id: 'riverbend-irrigation-team',
      entityType: 'cooperative',
      name: 'Riverbend Irrigation Team',
      location: 'Mwea, Kirinyaga',
      capabilities: ['irrigation pump repair', 'field servicing'],
      reportedCapacity: 80,
      capacityUnit: 'pumps',
      capacityPeriod: 'month',
      distanceKm: 11,
      availability: 'unknown',
      evidence: [{
        id: 'riverbend-capacity-note',
        source: 'Illustrative capacity card',
        date: '2026-10-08',
        recordBasis: 'illustrative',
      }],
      recordBasis: 'illustrative',
    },
    {
      id: 'ridge-water-cooperative',
      entityType: 'cooperative',
      name: 'Ridge Water Cooperative',
      location: 'Kagio, Kirinyaga',
      capabilities: ['irrigation pump repair', 'parts coordination'],
      reportedCapacity: 100,
      capacityUnit: 'pumps',
      capacityPeriod: 'month',
      distanceKm: 18,
      availability: 'unknown',
      evidence: [{
        id: 'ridge-capacity-note',
        source: 'Illustrative capacity card',
        date: '2026-10-11',
        recordBasis: 'illustrative',
      }],
      recordBasis: 'illustrative',
    },
    {
      id: 'mwea-pump-service',
      entityType: 'service team',
      name: 'Mwea Pump Service',
      location: 'Wanguru, Kirinyaga',
      capabilities: ['pump diagnostics', 'irrigation equipment maintenance'],
      reportedCapacity: 60,
      capacityUnit: 'pumps',
      capacityPeriod: 'month',
      distanceKm: 23,
      availability: 'unknown',
      evidence: [{
        id: 'mwea-capacity-note',
        source: 'Illustrative capacity card',
        date: '2026-10-13',
        recordBasis: 'illustrative',
      }],
      recordBasis: 'illustrative',
    },
    {
      id: 'greenline-farm-collective',
      entityType: 'farm collective',
      name: 'Greenline Farm Collective',
      location: 'Kutus, Kirinyaga',
      capabilities: ['irrigation pump repair', 'equipment sharing'],
      reportedCapacity: 120,
      capacityUnit: 'pumps',
      capacityPeriod: 'month',
      distanceKm: 27,
      availability: 'unknown',
      evidence: [{
        id: 'greenline-capacity-note',
        source: 'Illustrative capacity card',
        date: '2026-10-16',
        recordBasis: 'illustrative',
      }],
      recordBasis: 'illustrative',
    },
    {
      id: 'central-repair-crew',
      entityType: 'repair crew',
      name: 'Central Repair Crew',
      location: 'Kerugoya, Kirinyaga',
      capabilities: ['general equipment repair', 'workshop servicing'],
      reportedCapacity: 40,
      capacityUnit: 'pumps',
      capacityPeriod: 'month',
      distanceKm: 35,
      availability: 'unknown',
      evidence: [],
      recordBasis: 'illustrative',
    },
  ],
};

export function filterCapacityCandidates(
  candidates: readonly CapacityCandidate[],
  filters: CapacityFilters,
): CapacityCandidate[] {
  const query = filters.query.trim().toLocaleLowerCase();
  const matches = candidates
    .map((candidate, sourceIndex) => ({ candidate, sourceIndex }))
    .filter(({ candidate }) => {
      const searchableText = [
        candidate.name,
        candidate.entityType,
        candidate.location,
        ...candidate.capabilities,
      ].join(' ').toLocaleLowerCase();

      return (!query || searchableText.includes(query))
        && (!filters.hasEvidence || candidate.evidence.length > 0)
        && (filters.withinKm === null || candidate.distanceKm <= filters.withinKm);
    });

  matches.sort((left, right) => {
    const difference = filters.sortBy === 'capacity'
      ? right.candidate.reportedCapacity - left.candidate.reportedCapacity
      : left.candidate.distanceKm - right.candidate.distanceKm;
    return difference || left.sourceIndex - right.sourceIndex;
  });

  return matches.map(({ candidate }) => candidate);
}
