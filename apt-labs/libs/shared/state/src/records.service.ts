/**
 * @apt-labs/shared/state — RecordsService
 *
 * The Records surface is not its own data island: it projects the L0 system of
 * record (the shared `JourneyStore` owned by `CoordinationService`) into its
 * three registers — canon (sealed deliverables), annals (the log of
 * undertakings), and the immutable roll (append-only audit). Because it reads
 * the same store the Workbench mutates, a fulfilment in the Workbench ripples
 * here: a new outcome lands in the canon and the audit trail grows in the roll.
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
  status: 'sealed' | 'active' | 'disputed';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private readonly coordination = inject(CoordinationService);

  /** Canon — sealed, delivered outcomes (OUTPUT_OUTCOME records). */
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

  /** Roll — the immutable, append-only audit trail. */
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
      title: data.outcome?.trim() ? `Delivered — ${data.outcome}` : 'Sealed outcome',
      kind: 'canon',
      institution: this.institutionName(r.actorId),
      status: 'sealed',
      createdAt: r.updatedAt,
    };
  }

  private commitmentRow(r: JourneyRecord): RecordsRow {
    const data = r.data as { status?: string; providerActorId?: string };
    const sealed = data.status === 'fulfilled';
    return {
      id: r.id,
      title: `Undertaking — ${this.actorLabel(data.providerActorId ?? r.actorId)}`,
      kind: 'annals',
      institution: this.institutionName(r.actorId),
      status: sealed ? 'sealed' : 'active',
      createdAt: r.updatedAt,
    };
  }

  private rollRow(e: JourneyAuditEvent): RecordsRow {
    return {
      id: e.id,
      title: e.action,
      kind: 'roll',
      institution: this.institutionName(e.actorId),
      status: 'sealed',
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
