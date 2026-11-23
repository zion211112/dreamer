/**
 * @apt-labs/shared/state — ValueService
 *
 * The Value surface is not its own data island: it projects the shared
 * coordination spine (the same `JourneyStore` the Workbench and Records read)
 * into value rows, joining each need to the institutional context of its
 * operational pilot (disclosed cost, location, acceptance). Because it reads
 * the same store the Workbench mutates, a fulfilment there appears here: a
 * new delivered need lands as a value row, and its disclosed cost (when the
 * pilot carries one) folds into the circulation totals.
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

  /** Live value rows — one per need on the shared spine, joined to its pilot. */
  readonly rows = computed<ValueRow[]>(() => {
    this.coordination.version();
    return this.coordination.needs().map((n) => {
      const pilot = this.coordination.pilot(n.needId);
      const cost = pilot?.acceptance.costDisclosed ?? null;
      return {
        key: n.needId,
        label: n.label,
        institution: pilot?.institution.name ?? 'Ad-hoc need',
        location: pilot?.location ?? '—',
        amount: cost?.amount ?? null,
        currency: cost?.currency ?? 'KES',
        settled: n.status === 'fulfilled' && cost != null,
        acceptedAt: pilot?.acceptance.acceptedAt ?? null,
        status: n.status,
      } satisfies ValueRow;
    });
  });

  /** Circulation tallies derived from the live rows. */
  readonly metrics = computed<ValueMetrics>(() => {
    const rows = this.rows();
    const disclosed = rows.filter((r) => r.amount != null);
    const total = disclosed.reduce((sum, r) => sum + (r.amount ?? 0), 0);
    const settledCount = rows.filter((r) => r.settled).length;
    return {
      outcomes: rows.filter((r) => r.status === 'fulfilled').length,
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
