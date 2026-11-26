/**
 * @apt-labs/shared/state — CoordinationService
 *
 * The reactivity owner for a local prototype coordination chain
 * (INTENTION → COMMITMENT → OUTPUT_OUTCOME). It owns one browser-memory
 * `JourneyStore` and exposes local needs and their composed journeys to the UI.
 * State is neither persistent nor shared across accounts; domain helpers do not
 * enforce server authorization.
 */

import { Injectable, signal, computed } from '@angular/core';
import {
  createJourneyStore,
  postNeed,
  acceptCommitment,
  fulfilCommitment,
  getJourney,
  type JourneyStore,
  type Journey,
  type JourneyRecord,
} from '@apt-labs/domain';

export type NeedStatus = 'open' | 'committed' | 'fulfilled';

/** A need and its live coordination state, as surfaced to the Workbench. */
export interface NeedRow {
  needId: string;
  label: string;
  status: NeedStatus;
  /** Capability requirements the need is answered by (INTENTION data). */
  requires: string[];
  providerActorId: string | null;
  outcome: string | null;
  evidenceIds: string[];
}

@Injectable({ providedIn: 'root' })
export class CoordinationService {
  /** In-memory prototype store; not an authoritative or durable system of record. */
  readonly store: JourneyStore = createJourneyStore();

  /** Prototype actor label; the server must resolve a real principal for shared actions. */
  readonly accountId = signal<string>('demo');

  /** Institution id → display name, shared with Records / Value projections. */
  readonly institutions = new Map<string, string>();

  /** Read-model: one row per INTENTION/Need record, live from the store. */
  readonly needs = signal<NeedRow[]>([]);
  /** Bumped after every mutation so computed detail views re-read the store. */
  readonly version = signal(0);

  constructor() {
    this.refresh();
  }

  // ------------------------------------------------------------------
  // Read-model refresh
  // ------------------------------------------------------------------

  /** Re-read the store into the read-model signals (call after any action). */
  refresh(): void {
    this.needs.set(
      this.store.records
        .filter((r) => r.family === 'INTENTION' && r.type === 'Need')
        .map((r) => {
          const data = r.data as { need?: string; status?: NeedStatus; requires?: string[] };
          const journey = getJourney(this.store, r.id);
          const commitment = journey.commitments[0];
          const outcome = journey.outcomes[0];
          const commitmentData = commitment?.data as { providerActorId?: string } | undefined;
          const outcomeData = outcome?.data as { outcome?: string } | undefined;
          return {
            needId: r.id,
            label: data.need ?? 'Untitled need',
            status: data.status ?? 'open',
            requires: data.requires ?? [],
            providerActorId: commitmentData?.providerActorId ?? null,
            outcome: outcomeData?.outcome ?? null,
            evidenceIds: outcome ? [...outcome.evidenceIds] : [],
          } satisfies NeedRow;
        }),
    );
    this.version.update((v) => v + 1);
  }

  // ------------------------------------------------------------------
  // Actions (the live coordination chain)
  // ------------------------------------------------------------------

  /** Register a new open Need (INTENTION record). */
  createNeed(input: { need: string; requires?: string[] }): JourneyRecord {
    const rec = postNeed(this.store, {
      need: input.need,
      actorId: this.accountId(),
      postedBy: this.accountId(),
      requires: input.requires,
    });
    this.refresh();
    return rec;
  }

  /** A provider accepts the need → COMMITMENT + ANSWERS link; need → committed. */
  acceptNeed(needId: string, providerActorId: string): JourneyRecord {
    const rec = acceptCommitment(this.store, { needId, providerActorId, acceptedBy: this.accountId() });
    this.refresh();
    return rec;
  }

  /** The provider delivers → OUTPUT_OUTCOME with evidence; need → fulfilled. */
  fulfilNeed(commitmentId: string, outcome: string, evidenceIds?: string[]): JourneyRecord {
    const rec = fulfilCommitment(this.store, { commitmentId, outcome, evidenceIds, fulfilledBy: this.accountId() });
    this.refresh();
    return rec;
  }

  // ------------------------------------------------------------------
  // Composed reads
  // ------------------------------------------------------------------

  /** A composed local projection of one need (not an authoritative record). */
  journey(needId: string): Journey {
    this.version(); // establish reactivity for computed consumers
    return getJourney(this.store, needId);
  }

  /** Live status tallies for the Workbench header. */
  readonly counts = computed(() => {
    this.version();
    const rows = this.needs();
    return {
      total: rows.length,
      open: rows.filter((r) => r.status === 'open').length,
      inProgress: rows.filter((r) => r.status === 'committed').length,
      delivered: rows.filter((r) => r.status === 'fulfilled').length,
    };
  });
}
