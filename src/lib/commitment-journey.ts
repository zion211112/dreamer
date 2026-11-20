/**
 * APT-LABS — Coordination Journey (Gate 1 → Gate 3 bridge)
 *
 * Composes the Gate 1 foundations into one real, end-to-end coordination flow:
 *
 *   1. postNeed          — an actor registers a Need (INTENTION record).
 *   2. acceptCommitment  — a provider actor accepts the need, creating a
 *                          COMMITMENT record + an ANSWERS relationship, and the
 *                          need moves to "committed".
 *   3. fulfilCommitment  — the provider delivers an OUTPUT_OUTCOME record with
 *                          evidence; the commitment and need both move to
 *                          "fulfilled".
 *
 * Every step is a versioned record, every link is a first-class relationship,
 * every step is gated by the permission layer and logged to the append-only
 * audit trail. `getJourney` returns the composed, trustworthy picture.
 *
 * No fake integrations: each function returns real records you can read back.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  type RecordEnvelope,
} from './record-envelope';
import {
  createRelationship,
  getRelationshipsForEntity,
  type PersistedRelationship,
} from './relationship-store';
import { getAuditEvents, type AuditEvent } from './audit';
import type { AuthzContext } from './authz';

// ---------------------------------------------------------------------------
// Domain data shapes (stored inside record envelopes)
// ---------------------------------------------------------------------------

export type NeedStatus = 'open' | 'committed' | 'fulfilled';
export type CommitmentStatus = 'accepted' | 'fulfilled' | 'revoked';

interface NeedData {
  need: string;
  status: NeedStatus;
  /** Capability categories (CAPABILITY types) the need is asking for. */
  requires?: string[];
}

interface CommitmentData {
  needId: string;
  providerActorId: string;
  status: CommitmentStatus;
}

interface OutcomeData {
  needId: string;
  commitmentId: string;
  providerActorId: string;
  outcome: string;
}

// Typed readers for the record payload (payload is stored as
// Record<string, unknown>; these safely recover the domain shape).
function needData(rec: RecordEnvelope): NeedData {
  return rec.data as unknown as NeedData;
}
function commitmentData(rec: RecordEnvelope): CommitmentData {
  return rec.data as unknown as CommitmentData;
}
function outcomeData(rec: RecordEnvelope): OutcomeData {
  return rec.data as unknown as OutcomeData;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface PostNeedInput {
  need: string;
  actorId: string;
  postedBy: string;
  /** Capability categories (CAPABILITY types) this need is asking for. */
  requires?: string[];
  authz?: AuthzContext;
}

export interface AcceptCommitmentInput {
  needId: string;
  providerActorId: string;
  acceptedBy: string;
  authz?: AuthzContext;
}

export interface FulfilCommitmentInput {
  commitmentId: string;
  outcome: string;
  evidenceIds?: string[];
  fulfilledBy: string;
  authz?: AuthzContext;
}

export interface Journey {
  need: RecordEnvelope | undefined;
  commitments: RecordEnvelope[];
  outcomes: RecordEnvelope[];
  relationships: PersistedRelationship[];
  /** Audit trail across the need, its commitments, and its outcomes. */
  auditEvents: AuditEvent[];
}

// ---------------------------------------------------------------------------
// 1 — Post a need
// ---------------------------------------------------------------------------

export function postNeed(input: PostNeedInput): RecordEnvelope {
  return createRecord({
    family: 'INTENTION',
    type: 'Need',
    data: {
      need: input.need,
      status: 'open' as NeedStatus,
      ...(input.requires ? { requires: input.requires } : {}),
    },
    actorId: input.actorId,
    createdBy: input.postedBy,
    authz: input.authz,
  });
}

// ---------------------------------------------------------------------------
// 2 — A provider accepts the need (creates a commitment + link)
// ---------------------------------------------------------------------------

export function acceptCommitment(input: AcceptCommitmentInput): RecordEnvelope {
  const need = getRecord(input.needId);
  if (!need) throw new Error(`Need not found: ${input.needId}`);
  if (needData(need).status !== 'open') {
    throw new Error(`Need ${input.needId} is not open (status: ${needData(need).status})`);
  }

  const commitment = createRecord({
    family: 'COMMITMENT',
    type: 'Agreement',
    data: {
      needId: need.id,
      providerActorId: input.providerActorId,
      status: 'accepted' as CommitmentStatus,
    },
    actorId: need.actorId,
    createdBy: input.acceptedBy,
    authz: input.authz,
  });

  // First-class link: the provider ANSWERS this need (never a bare FK).
  createRelationship({
    kind: 'ANSWERS',
    sourceId: input.providerActorId,
    targetId: need.id,
    sourceRole: 'provider',
    targetRole: 'need',
    actorId: need.actorId,
    createdBy: input.acceptedBy,
    authz: input.authz,
  });

  // Advance the need's status through the same envelope.
  updateRecord(need.id, {
    data: { ...need.data, status: 'committed' },
    updatedBy: input.acceptedBy,
    authz: input.authz,
  });

  return commitment;
}

// ---------------------------------------------------------------------------
// 3 — The provider delivers the outcome, backed by evidence
// ---------------------------------------------------------------------------

export function fulfilCommitment(input: FulfilCommitmentInput): RecordEnvelope {
  const commitment = getRecord(input.commitmentId);
  if (!commitment) throw new Error(`Commitment not found: ${input.commitmentId}`);
  if (commitmentData(commitment).status !== 'accepted') {
    throw new Error(
      `Commitment ${input.commitmentId} is not accepted (status: ${commitmentData(commitment).status})`,
    );
  }

  const data = commitmentData(commitment);

  const outcome = createRecord({
    family: 'OUTPUT_OUTCOME',
    type: 'Outcome',
    data: {
      needId: data.needId,
      commitmentId: commitment.id,
      providerActorId: data.providerActorId,
      outcome: input.outcome,
    },
    actorId: commitment.actorId,
    evidenceIds: input.evidenceIds,
    createdBy: input.fulfilledBy,
    authz: input.authz,
  });

  updateRecord(commitment.id, {
    data: { ...commitment.data, status: 'fulfilled' },
    updatedBy: input.fulfilledBy,
    authz: input.authz,
  });

  const need = getRecord(data.needId);
  if (need) {
    updateRecord(need.id, {
      data: { ...need.data, status: 'fulfilled' },
      updatedBy: input.fulfilledBy,
      authz: input.authz,
    });
  }

  return outcome;
}

// ---------------------------------------------------------------------------
// Composed read
// ---------------------------------------------------------------------------

export function getJourney(needId: string): Journey {
  const need = getRecord(needId);
  const allCommitments = listRecords({ family: 'COMMITMENT' });
  const commitments = allCommitments.filter((c) => commitmentData(c).needId === needId);
  const commitmentIds = new Set(commitments.map((c) => c.id));

  const outcomes = listRecords({ family: 'OUTPUT_OUTCOME' }).filter(
    (o) => commitmentIds.has(outcomeData(o).commitmentId),
  );

  const relationships = getRelationshipsForEntity(needId);

  // Gather the audit trail across the need, its commitments, and outcomes.
  const resourceIds = new Set<string>([
    needId,
    ...commitments.map((c) => c.id),
    ...outcomes.map((o) => o.id),
  ]);
  const auditEvents = [...resourceIds]
    .map((id) => getAuditEvents({ resourceId: id }))
    .flat()
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

  return { need, commitments, outcomes, relationships, auditEvents };
}
