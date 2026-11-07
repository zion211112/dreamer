import { describe, expect, it } from 'vitest';
import {
  filterCapacityCandidates,
  KIRINYAGA_CAPACITY_SCENARIO,
  type CapacityCandidate,
  type CapacityFilters,
} from './workbench-capacity';

const noFilters: CapacityFilters = {
  query: '',
  hasEvidence: false,
  withinKm: null,
  sortBy: 'distance',
};

function filter(query: string, overrides: Partial<CapacityFilters> = {}) {
  return filterCapacityCandidates(KIRINYAGA_CAPACITY_SCENARIO.candidates, {
    ...noFilters,
    query,
    ...overrides,
  });
}

describe('filterCapacityCandidates', () => {
  it('searchesCandidateNameLocationAndCapability', () => {
    expect(filter('ridge')).toHaveLength(1);
    expect(filter('kirinyaga')).toHaveLength(5);
    expect(filter('irrigation pump')).toHaveLength(3);
    expect(filter('COOPERATIVE')[0].entityType).toBe('cooperative');
  });

  it('requiresEvidenceOnlyWhenRequested', () => {
    const withEvidence = filter('', { hasEvidence: true });

    expect(filter('')).toHaveLength(KIRINYAGA_CAPACITY_SCENARIO.candidates.length);
    expect(withEvidence.length).toBeGreaterThan(0);
    expect(withEvidence.every(candidate => candidate.evidence.length > 0)).toBe(true);
    expect(withEvidence.length).toBeLessThan(KIRINYAGA_CAPACITY_SCENARIO.candidates.length);
  });

  it('filtersByMaximumDistance', () => {
    expect(filter('', { withinKm: 20, hasEvidence: true }).map(candidate => candidate.id)).toEqual([
      'riverbend-irrigation-team',
      'ridge-water-cooperative',
    ]);
  });

  it('sortsByDistanceOrReportedCapacity', () => {
    expect(filter('', { sortBy: 'distance' }).map(candidate => candidate.id)).toEqual([
      'riverbend-irrigation-team',
      'ridge-water-cooperative',
      'mwea-pump-service',
      'greenline-farm-collective',
      'central-repair-crew',
    ]);
    expect(filter('', { sortBy: 'capacity' }).map(candidate => candidate.id)).toEqual([
      'greenline-farm-collective',
      'ridge-water-cooperative',
      'riverbend-irrigation-team',
      'mwea-pump-service',
      'central-repair-crew',
    ]);
  });

  it('returnsSourceOrderForSortTies', () => {
    const tiedCandidates: CapacityCandidate[] = [
      { ...KIRINYAGA_CAPACITY_SCENARIO.candidates[2], id: 'tie-first', distanceKm: 10 },
      { ...KIRINYAGA_CAPACITY_SCENARIO.candidates[0], id: 'tie-second', distanceKm: 10 },
    ];

    expect(filterCapacityCandidates(tiedCandidates, noFilters).map(candidate => candidate.id)).toEqual([
      'tie-first',
      'tie-second',
    ]);
  });

  it('returnsNoMatchesForUnknownQuery', () => {
    expect(filter('unlisted capability')).toEqual([]);
  });

  it('doesNotMutateScenarioRecords', () => {
    const candidates = KIRINYAGA_CAPACITY_SCENARIO.candidates;
    const originalOrder = candidates.map(candidate => candidate.id);
    const originalCapacities = candidates.map(candidate => candidate.reportedCapacity);

    filter('', { sortBy: 'capacity' });

    expect(candidates.map(candidate => candidate.id)).toEqual(originalOrder);
    expect(candidates.map(candidate => candidate.reportedCapacity)).toEqual(originalCapacities);
    expect(KIRINYAGA_CAPACITY_SCENARIO.need.recordBasis).toBe('illustrative');
    expect(candidates.every(candidate => candidate.recordBasis === 'illustrative')).toBe(true);
    expect(candidates.every(candidate => candidate.availability === 'unknown')).toBe(true);
    expect(candidates.flatMap(candidate => candidate.evidence).every(item => item.recordBasis === 'illustrative')).toBe(true);
  });
});
