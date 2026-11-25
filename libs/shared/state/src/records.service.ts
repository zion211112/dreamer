/**
 * @apt-labs/shared/state — RecordsService
 *
 * The Records surface is not its own data island: it projects the L0 system of
 * record (the shared `JourneyStore` owned by `CoordinationService`) into its
 * three registers — canon (recorded outcomes), annals (commitments), and the
 * roll (local append-only audit). Because it reads the same store the Workbench
 * mutates, a reported outcome appears here with its audit history.
 */

import { Injectable, computed, inject } from '@angular/core';
import type { JourneyRecord, JourneyAuditEvent } from '@apt-labs/domain';
import { CoordinationService } from './coordination.service';

export type RecordsView = 'all' | 'canon' | 'annals' | 'roll';

/** One row in a Records register, shaped for the RecordsComponent list. */
export interface RecordsRow {
  id: string;
  title: string;
  kind: Exclude<RecordsView, 'all'>;
  institution: string;
  status: 'sealed' | 'reported' | 'active' | 'disputed' | 'recorded';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private readonly coordination = inject(CoordinationService);

  /** Canon — recorded outcomes (OUTPUT_OUTCOME records); standing is reported. */
  readonly canon = computed<RecordsRow[]>(() => {
    this.coordination.version();
    return this.coordination.store.records
      .filter((r) => r.family === 'OUTPUT_OUTCOME')
      .map((r) => this.outcomeRow(r));
  });

  /** Annals — the running log of undertakings (COMMITMENT records). */
  readonly annals = computed<RecordsRow[]>(() => {
    this.coordination.version();
    return this.coordination.store.records
      .filter((r) => r.family === 'COMMITMENT')
      .map((r) => this.commitmentRow(r));
  });

  /** Roll — the append-only audit trail for this in-memory session. */
  readonly roll = computed<RecordsRow[]>(() => {
    this.coordination.version();
    return [...this.coordination.store.auditEvents]
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .map((e) => this.rollRow(e));
  });

  /** All — the full system of record: every register, in one list. */
  readonly all = computed<RecordsRow[]>(() => [
    ...this.annals(),
    ...this.canon(),
    ...this.roll(),
  ]);

  /** Resolve a view to its rows. */
  view(view: RecordsView): RecordsRow[] {
    switch (view) {
      case 'canon':
        return this.canon();
      case 'annals':
        return this.annals();
      case 'roll':
        return this.roll();
      default:
        return this.all();
    }
  }

  // ------------------------------------------------------------------
  // Row builders
  // ------------------------------------------------------------------

  private outcomeRow(r: JourneyRecord): RecordsRow {
    const data = r.data as { outcome?: string; providerActorId?: string };
    return {
      id: r.id,
      title: data.outcome?.trim() ? `Reported — ${data.outcome}` : 'Reported outcome',
      kind: 'canon',
      institution: this.institutionName(r.actorId),
      status: 'reported',
      createdAt: r.updatedAt,
    };
  }

  private commitmentRow(r: JourneyRecord): RecordsRow {
    const data = r.data as { status?: string; providerActorId?: string };
    const sealed = data.status === 'fulfilled';
    return {
      id: r.id,
      title: `Commitment — ${this.actorLabel(data.providerActorId ?? r.actorId)}`,
      kind: 'annals',
      institution: this.institutionName(r.actorId),
      status: sealed ? 'reported' : 'active',
      createdAt: r.updatedAt,
    };
  }

  private rollRow(e: JourneyAuditEvent): RecordsRow {
    return {
      id: e.id,
      title: e.action,
      kind: 'roll',
      institution: this.institutionName(e.actorId),
      status: 'recorded',
      createdAt: e.timestamp,
    };
  }

  // ------------------------------------------------------------------
  // Resolvers
  // ------------------------------------------------------------------

  /** Institution/actor id → display name (falls back to the id itself). */
  institutionName(actorId: string | null): string {
    if (!actorId) return '—';
    return this.coordination.institutions.get(actorId) ?? actorId;
  }

  /** Label for an actor id: institution name when known, else the raw id. */
  actorLabel(actorId: string | null): string {
    if (!actorId) return '—';
    return this.coordination.institutions.get(actorId) ?? actorId;
  }
}
