import { describe, expect, it } from 'vitest';
import type { FieldSignal } from './local-workflows';
import {
  filterRadarSignals,
  getSelectedRadarSignal,
  getRadarSignalSummary,
  getRadarSpatialState,
  paginateRadarSignals,
} from './radar-view';

function signal(
  id: string,
  status: FieldSignal['status'],
  overrides: Partial<FieldSignal> = {},
): FieldSignal {
  return {
    id,
    institutionId: 'institution-1',
    institutionName: 'Sample Institution',
    location: 'Area name only',
    title: `Signal ${id}`,
    details: 'Illustrative signal for a view-helper test.',
    urgency: 'routine',
    status,
    createdAt: '2026-11-04T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    updates: [],
    scenario: true,
    ...overrides,
  };
}

describe('getRadarSignalSummary', () => {
  it('returns zero counts for an empty scope', () => {
    expect(getRadarSignalSummary([])).toEqual({
      total: 0,
      new: 0,
      triaged: 0,
      brief: 0,
      resolved: 0,
    });
  });

  it('counts each existing signal lifecycle state', () => {
    const signals = [
      signal('1', 'new'),
      signal('2', 'new'),
      signal('3', 'triaged'),
      signal('4', 'brief'),
      signal('5', 'resolved'),
    ];

    expect(getRadarSignalSummary(signals)).toEqual({
      total: 5,
      new: 2,
      triaged: 1,
      brief: 1,
      resolved: 1,
    });
  });
});

describe('getRadarSpatialState', () => {
  it('distinguishes an empty scope from records without approximate locations', () => {
    expect(getRadarSpatialState([])).toBe('empty-scope');
    expect(getRadarSpatialState([signal('1', 'new')])).toBe('locations-unavailable');
  });
});

describe('filterRadarSignals', () => {
  const signals = [
    signal('1', 'new', { title: 'Water access', location: 'Mwea' }),
    signal('2', 'new', { institutionId: 'institution-2', title: 'Power access' }),
    signal('3', 'triaged', { title: 'Water quality' }),
  ];

  it('applies institution scope and lifecycle status together', () => {
    expect(filterRadarSignals(signals, {
      institutionId: 'institution-1',
      status: 'new',
    }).map(item => item.id)).toEqual(['1']);
  });

  it('searches case-insensitively across signal text and location', () => {
    expect(filterRadarSignals(signals, { query: '  MWEA  ' }).map(item => item.id)).toEqual(['1']);
    expect(filterRadarSignals(signals, { query: 'WATER' }).map(item => item.id)).toEqual(['1', '3']);
  });

  it('preserves order and includes all records when no filters are selected', () => {
    expect(filterRadarSignals(signals, {}).map(item => item.id)).toEqual(['1', '2', '3']);
  });
});

describe('getSelectedRadarSignal', () => {
  const signals = [
    signal('1', 'new'),
    signal('2', 'triaged'),
  ];

  it('retains the selected record across page changes while it remains in the filtered scope', () => {
    expect(getSelectedRadarSignal(signals, '2')?.id).toBe('2');
  });

  it('selects the first match when the current record is filtered out', () => {
    expect(getSelectedRadarSignal(signals, 'not-visible')?.id).toBe('1');
  });

  it('returns no selection when the filtered scope is empty', () => {
    expect(getSelectedRadarSignal([], '1')).toBeNull();
  });
});

describe('paginateRadarSignals', () => {
  it('returns a stable first page and total page count', () => {
    expect(paginateRadarSignals(['a', 'b', 'c', 'd', 'e'], 0, 2)).toEqual({
      items: ['a', 'b'],
      page: 0,
      pageCount: 3,
      total: 5,
    });
  });

  it('returns the last page and clamps an out-of-range page', () => {
    expect(paginateRadarSignals(['a', 'b', 'c', 'd', 'e'], 99, 2)).toEqual({
      items: ['e'],
      page: 2,
      pageCount: 3,
      total: 5,
    });
  });

  it('clamps a negative page to the first page', () => {
    expect(paginateRadarSignals(['a', 'b', 'c'], -1, 2)).toEqual({
      items: ['a', 'b'],
      page: 0,
      pageCount: 2,
      total: 3,
    });
  });

  it('returns an empty first page for an empty list', () => {
    expect(paginateRadarSignals([], 3, 10)).toEqual({
      items: [],
      page: 0,
      pageCount: 0,
      total: 0,
    });
  });
});
