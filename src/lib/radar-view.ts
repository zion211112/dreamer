import type { FieldSignal, SignalStatus } from './local-workflows';

export interface RadarSignalSummary {
  total: number;
  new: number;
  triaged: number;
  brief: number;
  resolved: number;
}

export function getRadarSignalSummary(signals: readonly FieldSignal[]): RadarSignalSummary {
  const counts: Record<SignalStatus, number> = {
    new: 0,
    triaged: 0,
    brief: 0,
    resolved: 0,
  };

  for (const signal of signals) {
    counts[signal.status] += 1;
  }

  return { total: signals.length, ...counts };
}

export interface RadarSignalFilters {
  institutionId?: string;
  status?: SignalStatus | 'all';
  query?: string;
}

export function filterRadarSignals(
  signals: readonly FieldSignal[],
  filters: RadarSignalFilters,
): FieldSignal[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';

  return signals.filter(signal => {
    if (filters.institutionId && signal.institutionId !== filters.institutionId) return false;
    if (filters.status && filters.status !== 'all' && signal.status !== filters.status) return false;
    if (!query) return true;

    return `${signal.title} ${signal.institutionName} ${signal.institutionId} ${signal.assetId ?? ''} ${signal.assetName ?? ''} ${signal.location}`
      .toLocaleLowerCase()
      .includes(query);
  });
}

export function getSelectedRadarSignal(
  signals: readonly FieldSignal[],
  selectedId: string,
): FieldSignal | null {
  return signals.find(signal => signal.id === selectedId) ?? signals[0] ?? null;
}

export function resolveRadarSignalLink(
  signals: readonly FieldSignal[],
  requestedSignalId: string | null,
  requestedInstitutionId: string | null,
): { signal: FieldSignal | null; error: string | null } {
  if (requestedSignalId !== null) {
    const signal = signals.find(item => item.id === requestedSignalId);
    if (!signal) {
      return {
        signal: null,
        error: 'The linked field signal is no longer available. Choose a signal in Commons to continue.',
      };
    }
    if (requestedInstitutionId !== null && signal.institutionId !== requestedInstitutionId) {
      return {
        signal: null,
        error: 'The linked signal does not match the requested institution. Choose a signal in Commons to continue.',
      };
    }
    return { signal, error: null };
  }

  if (requestedInstitutionId !== null) {
    const signal = signals.find(item => item.institutionId === requestedInstitutionId);
    if (!signal) {
      return { signal: null, error: 'The linked institution has no saved field signals in this browser.' };
    }
    return { signal, error: null };
  }

  return { signal: signals[0] ?? null, error: null };
}

export interface RadarSignalPage<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

export type RadarSpatialState = 'empty-scope' | 'locations-unavailable';

export function getRadarSpatialState(signals: readonly FieldSignal[]): RadarSpatialState {
  return signals.length === 0 ? 'empty-scope' : 'locations-unavailable';
}

export function paginateRadarSignals<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): RadarSignalPage<T> {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0
    ? Math.max(1, Math.floor(pageSize))
    : 1;
  const pageCount = Math.ceil(items.length / safePageSize);
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 0;
  const safePage = pageCount === 0
    ? 0
    : Math.max(0, Math.min(requestedPage, pageCount - 1));
  const start = safePage * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageCount,
    total: items.length,
  };
}
