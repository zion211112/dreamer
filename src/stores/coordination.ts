/**
 * APT-LABS — Coordination store (the real-integration layer for UI surfaces)
 *
 * This is where the "transcendent" coordination view gets its data. It wraps
 * the Gate 1–4 modules (`onboarding-journey`, `commitment-journey`, `matching`,
 * `evidence-store`, …) so a surface drives the *actual* system of record —
 * demo mode persists to localStorage, production would use Supabase. No mock
 * arrays: every read comes from a real record/relationship and every action
 * mints a real, audited record.
 *
 * Read-models are refreshed after each mutation (the lib functions read
 * localStorage synchronously, so a re-read is the whole of "reactivity").
 *
 * Note on permissions: demo-mode actions run ungated so the live loop works
 * for any visitor; in production each action would pass the acting
 * `AuthzContext` and the same lib functions enforce it (proven in the unit
 * tests). That is a deployment concern, not a fake here.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { listActors, getDemoAccountId, type ActorType } from '@/lib/actors';
import {
  onboardActor,
  getProductiveProfile,
  type ProductiveProfile,
} from '@/lib/onboarding-journey';
import {
  postNeed as postNeedLib,
  acceptCommitment,
  fulfilCommitment as fulfilCommitmentLib,
  type CommitmentStatus,
} from '@/lib/commitment-journey';
import {
  matchOpenNeeds,
  findMissingNeeds,
  providersFromProfiles,
  type NeedMatching,
  type Provider,
} from '@/lib/matching';
import {
  registerEvidence,
  markEvidenceVerified,
  listEvidence,
  type EvidenceStatus,
} from '@/lib/evidence-store';
import { listRecords, getRecord, type RecordEnvelope } from '@/lib/record-envelope';
import { getAuditEvents, type AuditEvent } from '@/lib/audit';
import {
  listKnowledge,
  distillKnowledge,
  markKnowledgeConfirmed,
  knowledgeForOutcome,
} from '@/lib/knowledge-store';
import { queryRollEntries } from '@/lib/db/roll';

// A commitment as the workbench shows it: the live row a person acts on.
export interface CommitmentRow {
  id: string;
  needId: string;
  need: string;
  providerActorId: string;
  providerName: string;
  status: CommitmentStatus;
}

// A Roll outcome the workbench can distill: accepted, and whether a
// knowledge record already carries it.
export interface KnowledgeOutcome {
  id: string;
  title: string;
  acceptedBy: string;
  distilled: boolean;
}

export interface OnboardProviderInput {
  type: ActorType;
  name: string;
  /** A capability they can do (feeds matching). */
  capability?: { name: string; type: string };
  /** An asset they hold (what they have). */
  asset?: { name: string; type: string };
}

export interface PostNeedInput {
  need: string;
  /** Capability categories this need is asking for (matching keys). */
  requires: string[];
}

export interface EvidenceInput {
  summary: string;
  type: string;
  sourceUri?: string;
}

const DEMO_ACCOUNT = 'demo';
const DEMO_DEMAND_ACTOR = 'demand';

export const useCoordinationStore = defineStore('coordination', () => {
  // The acting principal. Falls back to a stable demo id so the loop runs
  // out of the box in demo mode.
  const accountId = ref<string>(getDemoAccountId() ?? DEMO_ACCOUNT);

  // -----------------------------------------------------------------------
  // Read models (snapshots of the system of record)
  // -----------------------------------------------------------------------
  const profiles = ref<ProductiveProfile[]>([]);
  const providers = ref<Provider[]>([]);
  const openNeeds = ref<NeedMatching[]>([]);
  const gaps = computed(() => findMissingNeeds(openNeeds.value));
  const commitments = ref<CommitmentRow[]>([]);
  const evidence = ref<RecordEnvelope[]>([]);
  const audit = ref<AuditEvent[]>([]);
  const knowledge = ref<RecordEnvelope[]>([]);
  const outcomes = ref<KnowledgeOutcome[]>([]);

  const inFlight = computed(() => commitments.value.filter((c) => c.status === 'accepted'));
  const evidenceVerified = computed(() =>
    evidence.value.filter((e) => (e.data.status as EvidenceStatus | undefined) === 'verified').length,
  );

  // -----------------------------------------------------------------------
  // Refresh
  // -----------------------------------------------------------------------
  function refresh(): void {
    profiles.value = listActors()
      .map((a) => getProductiveProfile(a.id))
      .filter((p): p is ProductiveProfile => Boolean(p));
    providers.value = providersFromProfiles(profiles.value);
    openNeeds.value = matchOpenNeeds(providers.value);

    // Live commitments, with resolved names, newest first (listRecords order).
    commitments.value = listRecords({ family: 'COMMITMENT' })
      .map((rec) => {
        const data = rec.data as unknown as {
          needId: string;
          providerActorId: string;
          status: CommitmentStatus;
        };
        return {
          id: rec.id,
          needId: data.needId,
          need: ((getRecord(data.needId)?.data as { need?: string } | undefined)?.need ?? 'Need'),
          providerActorId: data.providerActorId,
          providerName:
            profiles.value.find((p) => p.actor.id === data.providerActorId)?.actor.name ??
            'Provider',
          status: data.status,
        };
      })
      .slice(0, 20);

    evidence.value = listEvidence().slice(0, 8);
    audit.value = getAuditEvents({ limit: 12 });
  }

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  /** Enable what can be built: register a provider with its capacity. */
  function onboardProvider(input: OnboardProviderInput): ProductiveProfile {
    const profile = onboardActor({
      type: input.type,
      name: input.name,
      ownerId: accountId.value,
      createdBy: accountId.value,
      capabilities: input.capability ? [input.capability] : undefined,
      assets: input.asset ? [input.asset] : undefined,
    });
    refresh();
    return profile;
  }

  /** Reveal what is missing: register a need with the capacity it asks for. */
  function postNeed(input: PostNeedInput): RecordEnvelope {
    const rec = postNeedLib({
      need: input.need,
      actorId: DEMO_DEMAND_ACTOR,
      postedBy: accountId.value,
      requires: input.requires,
    });
    refresh();
    return rec;
  }

  /** Assign an open need to a matching provider (creates the commitment). */
  function assignNeed(needId: string, providerActorId: string): RecordEnvelope {
    const rec = acceptCommitment({ needId, providerActorId, acceptedBy: accountId.value });
    refresh();
    return rec;
  }

  /** Deliver an outcome for a commitment, optionally backed by evidence. */
  function fulfilCommitment(commitmentId: string, outcome: string, evidenceId?: string): RecordEnvelope {
    const rec = fulfilCommitmentLib({
      commitmentId,
      outcome,
      evidenceIds: evidenceId ? [evidenceId] : undefined,
      fulfilledBy: accountId.value,
    });
    refresh();
    return rec;
  }

  /** Preserve what becomes known: register a piece of evidence. */
  function addEvidence(input: EvidenceInput): RecordEnvelope {
    const rec = registerEvidence({
      type: input.type,
      summary: input.summary,
      sourceUri: input.sourceUri,
      actorId: null,
      createdBy: accountId.value,
    });
    refresh();
    return rec;
  }

  /** The trust transition: mark a piece of evidence verified. */
  function verifyEvidence(evidenceId: string): void {
    markEvidenceVerified(evidenceId, accountId.value);
    refresh();
  }

  // -----------------------------------------------------------------------
  // Knowledge (the Roll → envelope bridge; async because it reads the Roll)
  // -----------------------------------------------------------------------

  /**
   * Read the knowledge read-model: distillable accepted outcomes (with their
   * distilled flag) and the knowledge records themselves.
   */
  async function loadKnowledge(): Promise<void> {
    const entries = await queryRollEntries();
    outcomes.value = entries
      .filter((entry) => entry.acceptance.accepted_by)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        acceptedBy: entry.acceptance.accepted_by,
        distilled: Boolean(knowledgeForOutcome(entry.id)),
      }));
    knowledge.value = listKnowledge().slice(0, 8);
  }

  /** Distill an accepted outcome into a searchable Lesson record. */
  async function distillOutcome(entryId: string): Promise<void> {
    await distillKnowledge(entryId, accountId.value);
    await loadKnowledge();
  }

  /** The trust transition: confirm a proposed knowledge record. */
  async function confirmKnowledge(knowledgeId: string): Promise<void> {
    markKnowledgeConfirmed(knowledgeId, accountId.value);
    await loadKnowledge();
  }

  refresh();

  return {
    accountId,
    profiles,
    providers,
    openNeeds,
    gaps,
    commitments,
    inFlight,
    evidence,
    evidenceVerified,
    audit,
    knowledge,
    outcomes,
    refresh,
    onboardProvider,
    postNeed,
    assignNeed,
    fulfilCommitment,
    addEvidence,
    verifyEvidence,
    loadKnowledge,
    distillOutcome,
    confirmKnowledge,
  };
});
