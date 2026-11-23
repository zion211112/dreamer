/**
 * @apt-labs/shared/state — CoordinationService
 *
 * Angular signal-based replacement for the Pinia `useCoordinationStore`.
 * Wraps domain functions with `signal()` + `computed()`, zoneless-friendly.
 *
 * Domain functions come from @apt-labs/domain (framework-free pure functions).
 */

import { Injectable, signal, computed, linkedSignal } from '@angular/core';

// Domain imports (to be wired once libs/domain is populated)
// import { listActors, getDemoAccountId, type ActorType } from '@apt-labs/domain/actors';
// import {
//   onboardActor,
//   getProductiveProfile,
//   type ProductiveProfile,
// } from '@apt-labs/domain/onboarding-journey';
// import {
//   postNeed as postNeedLib,
//   acceptCommitment,
//   fulfilCommitment as fulfilCommitmentLib,
//   type CommitmentStatus,
// } from '@apt-labs/domain/commitment-journey';
// import {
//   matchOpenNeeds,
//   findMissingNeeds,
//   providersFromProfiles,
//   type NeedMatching,
//   type Provider,
// } from '@apt-labs/domain/matching';
// import {
//   registerEvidence,
//   markEvidenceVerified,
//   listEvidence,
//   type EvidenceStatus,
// } from '@apt-labs/domain/evidence-store';
// import { listRecords, getRecord, type RecordEnvelope } from '@apt-labs/domain/record-envelope';
// import { getAuditEvents, type AuditEvent } from '@apt-labs/domain/audit';
// import {
//   listKnowledge,
//   distillKnowledge,
//   markKnowledgeConfirmed,
//   knowledgeForOutcome,
// } from '@apt-labs/domain/knowledge-store';
// import { queryRollEntries } from '@apt-labs/domain/db/roll';
// import { seedCoordinationIfEmpty } from '@apt-labs/domain/coordination-seed';

// ---------------------------------------------------------------------------
// Types (mirror the Pinia store's exported types)
// ---------------------------------------------------------------------------

export interface CommitmentRow {
  id: string;
  needId: string;
  need: string;
  providerActorId: string;
  providerName: string;
  status: string; // CommitmentStatus
}

export interface KnowledgeOutcome {
  id: string;
  title: string;
  acceptedBy: string;
  distilled: boolean;
}

export interface OnboardProviderInput {
  type: string; // ActorType
  name: string;
  capability?: { name: string; type: string };
  asset?: { name: string; type: string };
}

export interface PostNeedInput {
  need: string;
  requires: string[];
}

export interface EvidenceInput {
  summary: string;
  type: string;
  sourceUri?: string;
}

const DEMO_ACCOUNT = 'demo';
const DEMO_DEMAND_ACTOR = 'demand';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class CoordinationService {
  // Acting principal (falls back to stable demo id in demo mode)
  readonly accountId = signal<string>(DEMO_ACCOUNT);

  // Read-model signals (snapshots of the system of record)
  readonly profiles = signal<unknown[]>([]);
  readonly providers = signal<unknown[]>([]);
  readonly openNeeds = signal<unknown[]>([]);
  readonly gaps = computed(() => []); // computed(() => findMissingNeeds(this.openNeeds()))
  readonly commitments = signal<CommitmentRow[]>([]);
  readonly evidence = signal<unknown[]>([]);
  readonly audit = signal<unknown[]>([]);
  readonly knowledge = signal<unknown[]>([]);
  readonly outcomes = signal<KnowledgeOutcome[]>([]);
  readonly seeded = signal(false);

  readonly inFlight = computed(() =>
    this.commitments().filter((c) => c.status === 'accepted'),
  );
  readonly evidenceVerified = computed(() =>
    this.evidence().filter(
      (e: any) => (e?.data?.status as string | undefined) === 'verified',
    ).length,
  );

  // -----------------------------------------------------------------------
  // Refresh
  // -----------------------------------------------------------------------

  refresh(): void {
    // Will be wired when domain functions are available
  }

  // -----------------------------------------------------------------------
  // Actions (stubs until domain libs are populated)
  // -----------------------------------------------------------------------

  onboardProvider(input: OnboardProviderInput): unknown {
    // const profile = onboardActor({
    //   type: input.type,
    //   name: input.name,
    //   ownerId: this.accountId(),
    //   createdBy: this.accountId(),
    //   capabilities: input.capability ? [input.capability] : undefined,
    //   assets: input.asset ? [input.asset] : undefined,
    // });
    // this.refresh();
    // return profile;
    throw new Error('Domain not yet wired');
  }

  postNeed(input: PostNeedInput): unknown {
    // const rec = postNeedLib({
    //   need: input.need,
    //   actorId: DEMO_DEMAND_ACTOR,
    //   postedBy: this.accountId(),
    //   requires: input.requires,
    // });
    // this.refresh();
    // return rec;
    throw new Error('Domain not yet wired');
  }

  assignNeed(needId: string, providerActorId: string): unknown {
    // const rec = acceptCommitment({ needId, providerActorId, acceptedBy: this.accountId() });
    // this.refresh();
    // return rec;
    throw new Error('Domain not yet wired');
  }

  fulfilCommitment(commitmentId: string, outcome: string, evidenceId?: string): unknown {
    // const rec = fulfilCommitmentLib({
    //   commitmentId,
    //   outcome,
    //   evidenceIds: evidenceId ? [evidenceId] : undefined,
    //   fulfilledBy: this.accountId(),
    // });
    // this.refresh();
    // return rec;
    throw new Error('Domain not yet wired');
  }

  addEvidence(input: EvidenceInput): unknown {
    // const rec = registerEvidence({
    //   type: input.type,
    //   summary: input.summary,
    //   sourceUri: input.sourceUri,
    //   actorId: null,
    //   createdBy: this.accountId(),
    // });
    // this.refresh();
    // return rec;
    throw new Error('Domain not yet wired');
  }

  verifyEvidence(evidenceId: string): void {
    // markEvidenceVerified(evidenceId, this.accountId());
    // this.refresh();
    throw new Error('Domain not yet wired');
  }

  // -----------------------------------------------------------------------
  // Knowledge
  // -----------------------------------------------------------------------

  async loadKnowledge(): Promise<void> {
    // const entries = await queryRollEntries();
    // this.outcomes.set(
    //   entries
    //     .filter((entry) => entry.acceptance.accepted_by)
    //     .map((entry) => ({
    //       id: entry.id,
    //       title: entry.title,
    //       acceptedBy: entry.acceptance.accepted_by,
    //       distilled: Boolean(knowledgeForOutcome(entry.id)),
    //     })),
    // );
    // this.knowledge.set(listKnowledge().slice(0, 8));
  }

  async distillOutcome(entryId: string): Promise<void> {
    // await distillKnowledge(entryId, this.accountId());
    // await this.loadKnowledge();
  }

  async confirmKnowledge(knowledgeId: string): Promise<void> {
    // markKnowledgeConfirmed(knowledgeId, this.accountId());
    // await this.loadKnowledge();
  }
}
