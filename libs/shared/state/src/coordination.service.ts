/**
 * @apt-labs/shared/state — CoordinationService
 *
 * The reactivity owner for the coordination chain
 * (INTENTION → COMMITMENT → OUTPUT_OUTCOME). It owns one `JourneyStore`, seeds
 * it from the operational pilot corpus, and exposes live needs and their
 * composed journeys to the UI. All coordination *logic* lives in the
 * framework-free `@apt-labs/domain` layer; this service only wires it to
 * Angular signals and the store.
 */

import { Injectable, signal, computed } from '@angular/core';
import {
  createJourneyStore,
  postNeed,
  acceptCommitment,
  fulfilCommitment,
  getJourney,
  OPERATIONAL_PILOTS,
  type JourneyStore,
  type Journey,
  type JourneyRecord,
  type OperationalPilot,
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
  /** The single system-of-record the coordination logic reads and writes. */
  readonly store: JourneyStore = createJourneyStore();

  /** The acting principal (a stable demo account in demo mode). */
  readonly accountId = signal<string>('demo');

  /** Institutional context joined beside the pure coordination records. */
  private readonly pilotByNeedId = new Map<string, OperationalPilot>();

  /** Institution id → display name, shared with Records / Value projections. */
  readonly institutions = new Map<string, string>();

  /** Read-model: one row per INTENTION/Need record, live from the store. */
  readonly needs = signal<NeedRow[]>([]);
  /** Bumped after every mutation so computed detail views re-read the store. */
  readonly version = signal(0);
  readonly seeded = signal(false);

  constructor() {
    if (this.store.records.length === 0) this.seed();
  }

  // ------------------------------------------------------------------
  // Seeding
  // ------------------------------------------------------------------

  /**
   * Seed the beachhead: each operational pilot becomes a Need; an accepted
   * pilot runs the full chain (accept → fulfil with its evidence) so it renders
   * as delivered with a trustworthy audit trail. Unaccepted pilots stay open.
   */
  private seed(): void {
    for (const pilot of OPERATIONAL_PILOTS) {
      const need = postNeed(this.store, {
        need: pilot.label,
        actorId: pilot.institution.id,
        postedBy: pilot.recordedBy,
        requires: [...new Set(pilot.participants.flatMap((p) => p.capabilityClaims))],
      });
      this.pilotByNeedId.set(need.id, pilot);
      this.institutions.set(pilot.institution.id, pilot.institution.name);

      if (pilot.acceptance.acceptedAt !== null) {
        const commitment = acceptCommitment(this.store, {
          needId: need.id,
          providerActorId: pilot.institution.coordinatorId,
          acceptedBy: pilot.acceptance.acceptedBy,
        });
        fulfilCommitment(this.store, {
          commitmentId: commitment.id,
          outcome: pilot.deliverables.join(' · '),
          evidenceIds: pilot.evidence.map((e) => e.id),
          fulfilledBy: pilot.recordedBy,
        });
      }
    }
    this.refresh();
    this.seeded.set(true);
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

  /** The composed, trustworthy picture of one need (for the detail view). */
  journey(needId: string): Journey {
    this.version(); // establish reactivity for computed consumers
    return getJourney(this.store, needId);
  }

  /** Institutional context beside a need (undefined for ad-hoc needs). */
  pilot(needId: string): OperationalPilot | undefined {
    return this.pilotByNeedId.get(needId);
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
