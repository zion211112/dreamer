/**
 * @apt-labs/shared/state — ValueService
 *
 * The Value surface reads explicit value records only. Work status is not
 * financial value or settlement, so this read model stays empty until
 * authoritative value records exist.
 *
 * The deeper economic layer — per-undertaking `EconomicUndertakingRecord`
 * (rates, contributions, funding, amounts owed) and `computeReconciliation`
 * from `@apt-labs/domain` — is deliberately not wired here yet; this is the
 * connected read-model first.
 */

import { Injectable, computed, inject } from '@angular/core';
import { CoordinationService, type NeedStatus } from './coordination.service';

/** One value row, shaped for the ValueComponent table. */
export interface ValueRow {
  key: string;
  label: string;
  institution: string;
  location: string;
  amount: number | null;
  currency: string;
  settled: boolean;
  acceptedAt: string | null;
  status: NeedStatus;
}

/** Circulation tallies for the Value header. */
export interface ValueMetrics {
  outcomes: number;
  totalKes: number;
  funding: number;
  settled: number;
  open: number;
}

export type ValueFilter = 'all' | 'disclosed' | 'settled' | 'open';

@Injectable({ providedIn: 'root' })
export class ValueService {
  private readonly coordination = inject(CoordinationService);

  /** No value rows are inferred from work records. */
  readonly rows = computed<ValueRow[]>(() => {
    this.coordination.version();
    return [];
  });

  /** Circulation tallies derived from the live rows. */
  readonly metrics = computed<ValueMetrics>(() => {
    const rows = this.rows();
    const disclosed = rows.filter((r) => r.amount != null);
    const total = disclosed.reduce((sum, r) => sum + (r.amount ?? 0), 0);
    const settledCount = rows.filter((r) => r.settled).length;
    return {
      outcomes: 0,
      totalKes: total,
      funding: rows.length,
      settled: settledCount,
      open: rows.length - settledCount,
    };
  });

  /** Apply a filter over value rows. */
  filterRows(rows: ValueRow[], filter: ValueFilter): ValueRow[] {
    switch (filter) {
      case 'disclosed':
        return rows.filter((r) => r.amount != null);
      case 'settled':
        return rows.filter((r) => r.settled);
      case 'open':
        return rows.filter((r) => r.amount != null && !r.settled);
      default:
        return rows;
    }
  }
}
