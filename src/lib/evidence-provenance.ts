/**
 * APT-LABS — Evidence & Provenance Engine (Stage 1 Foundation)
 *
 * Tracks claim origin, attesters, reviewers, changes, disputes.
 * Corrections = attributable amendments (NEVER silent rewrites).
 *
 * Every claim/record has:
 * - source (who asserted), timestamp, evidence artifacts
 * - verification state: unassessed | reported | supported | verified | disputed | rejected | expired
 * - Provenance chain: original claim → amendments → current state (all traversable)
 * - Dispute tracking: challenger, challenge reason, evidence, resolution, resolution timestamp
 */

import {
  getRecord,
  listRecords,
  updateRecord,
  supersedeRecord,
  type RecordEnvelope,
  type SupersedeRecordInput,
} from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { EVIDENCE_STANDING, type EvidenceStanding } from './ontology/evidence';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProvenanceNode = {
  recordId: string;
  version: number;
  status: EvidenceStanding;
  changedBy: string;
  changedAt: string;
  reason: string;
  evidenceIds: string[];
  supersedesId: string | null;
};

export type ProvenanceChain = {
  recordId: string;
  family: string;
  type: string;
  currentVersion: number;
  currentStatus: EvidenceStanding;
  nodes: ProvenanceNode[];
};

export type DisputeRecord = {
  id: string;
  evidenceId: string;
  challengerId: string;
  challengerActorId: string | null;
  reason: string;
  challengeEvidenceIds: string[];
  status: 'open' | 'resolved' | 'dismissed' | 'escalated';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type VerificationEvent = {
  id: string;
  evidenceId: string;
  verifierId: string;
  verifierActorId: string | null;
  action: 'assessed' | 'supported' | 'verified' | 'disputed' | 'rejected' | 'expired';
  rationale: string;
  supportingEvidenceIds: string[];
  createdAt: string;
};

type VerificationAction = 'assessed' | 'supported' | 'verified' | 'disputed' | 'rejected' | 'expired';

const DISPUTES_KEY = 'aptlabs:disputes';
const VERIFICATION_EVENTS_KEY = 'aptlabs:verification-events';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readDisputes(): DisputeRecord[] {
  return readJson<DisputeRecord[]>(DISPUTES_KEY, []);
}

function writeDisputes(disputes: DisputeRecord[]): void {
  writeJson(DISPUTES_KEY, disputes);
}

function readVerificationEvents(): VerificationEvent[] {
  return readJson<VerificationEvent[]>(VERIFICATION_EVENTS_KEY, []);
}

function writeVerificationEvents(events: VerificationEvent[]): void {
  writeJson(VERIFICATION_EVENTS_KEY, events);
}

function evidenceStanding(rec: RecordEnvelope): EvidenceStanding {
  const data = rec.data as Record<string, unknown>;
  return (data.status as EvidenceStanding) ?? EVIDENCE_STANDING.UNASSESSED;
}

// ---------------------------------------------------------------------------
// Provenance Chain Construction
// ---------------------------------------------------------------------------

/**
 * Build the full provenance chain for a record by following supersedes links.
 * Returns nodes from oldest (original) to newest (current).
 */
export function buildProvenanceChain(recordId: string): ProvenanceChain | undefined {
  const current = getRecord(recordId);
  if (!current) return undefined;

  const chain: ProvenanceNode[] = [];
  let node: RecordEnvelope | undefined = current;

  // Walk backwards through supersedes chain
  while (node) {
    chain.unshift({
      recordId: node.id,
      version: node.version,
      status: evidenceStanding(node),
      changedBy: node.updatedBy,
      changedAt: node.updatedAt,
      reason: (node.data.amendmentReason as string) ?? '',
      evidenceIds: node.evidenceIds,
      supersedesId: node.supersedesId,
    });

    if (node.supersedesId) {
      node = getRecord(node.supersedesId);
    } else {
      break;
    }
  }

  return {
    recordId: current.id,
    family: current.family,
    type: current.type,
    currentVersion: current.version,
    currentStatus: evidenceStanding(current),
    nodes: chain,
  };
}

/**
 * Build provenance chain for ALL records in a family.
 */
export function buildAllProvenanceChains(family?: string): ProvenanceChain[] {
  const records = family ? listRecords({ family: family as any }) : listRecords({});
  return records
    .map((r) => buildProvenanceChain(r.id))
    .filter((c): c is ProvenanceChain => Boolean(c));
}

// ---------------------------------------------------------------------------
// Evidence Verification Workflow
// ---------------------------------------------------------------------------

interface VerificationTransitionInput {
  evidenceId: string;
  action: VerificationAction;
  actorId: string;
  actorActorId: string | null;
  rationale: string;
  supportingEvidenceIds?: string[];
  authz?: AuthzContext;
}

/**
 * Transition evidence through verification states.
 * Each transition creates a VerificationEvent (audit trail) and updates the record.
 */
export function transitionEvidenceVerification(input: VerificationTransitionInput): RecordEnvelope | undefined {
  const { evidenceId, action, actorId, actorActorId, rationale, supportingEvidenceIds = [], authz } = input;

  if (authz) {
    requirePermission(authz, 'evidence:admin');
  }

  const record = getRecord(evidenceId);
  if (!record || record.family !== 'EVIDENCE') return undefined;

  const currentStanding = evidenceStanding(record);
  let newStanding: EvidenceStanding;

  switch (action) {
    case 'assessed':
      newStanding = EVIDENCE_STANDING.REPORTED;
      break;
    case 'supported':
      newStanding = EVIDENCE_STANDING.SUPPORTED;
      break;
    case 'verified':
      newStanding = EVIDENCE_STANDING.VERIFIED;
      break;
    case 'disputed':
      newStanding = EVIDENCE_STANDING.DISPUTED;
      break;
    case 'rejected':
      newStanding = EVIDENCE_STANDING.REJECTED;
      break;
    case 'expired':
      newStanding = EVIDENCE_STANDING.EXPIRED;
      break;
    default:
      return undefined;
  }

  // Record the verification event
  const event: VerificationEvent = {
    id: createId('verify-event'),
    evidenceId,
    verifierId: actorId,
    verifierActorId: actorActorId,
    action,
    rationale,
    supportingEvidenceIds,
    createdAt: nowIso(),
  };
  const events = readVerificationEvents();
  events.push(event);
  writeVerificationEvents(events);

  // Update the evidence record with new status
  const updated = updateRecord(evidenceId, {
    data: { ...record.data, status: newStanding, amendmentReason: `${action}: ${rationale}` },
    evidenceIds: [...new Set([...record.evidenceIds, ...supportingEvidenceIds])],
    updatedBy: actorId,
    authz,
  });

  // Log audit
  logAuditEvent({
    accountId: actorId,
    actorId: actorActorId,
    action: 'evidence.verify',
    resourceType: 'evidence',
    resourceId: evidenceId,
    details: { previousStatus: currentStanding, newStatus: newStanding, rationale },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Dispute Management
// ---------------------------------------------------------------------------

export interface OpenDisputeInput {
  evidenceId: string;
  challengerId: string;
  challengerActorId: string | null;
  reason: string;
  challengeEvidenceIds?: string[];
  authz?: AuthzContext;
}

export interface ResolveDisputeInput {
  disputeId: string;
  resolverId: string;
  resolverActorId: string | null;
  resolution: 'upheld' | 'dismissed' | 'escalated';
  resolutionNotes: string;
  authz?: AuthzContext;
}

/**
 * Open a dispute on a piece of evidence.
 * Evidence status becomes DISPUTED.
 */
export function openDispute(input: OpenDisputeInput): DisputeRecord | undefined {
  const { evidenceId, challengerId, challengerActorId, reason, challengeEvidenceIds = [], authz } = input;

  if (authz) {
    requirePermission(authz, 'evidence:admin');
  }

  const record = getRecord(evidenceId);
  if (!record || record.family !== 'EVIDENCE') return undefined;

  // Create dispute record
  const dispute: DisputeRecord = {
    id: createId('dispute'),
    evidenceId,
    challengerId,
    challengerActorId,
    reason,
    challengeEvidenceIds,
    status: 'open',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const disputes = readDisputes();
  disputes.push(dispute);
  writeDisputes(disputes);

  // Update evidence status to DISPUTED
  updateRecord(evidenceId, {
    data: { ...record.data, status: EVIDENCE_STANDING.DISPUTED, amendmentReason: `disputed: ${reason}` },
    evidenceIds: [...new Set([...record.evidenceIds, ...challengeEvidenceIds])],
    updatedBy: challengerId,
    authz,
  });

  // Log audit
  logAuditEvent({
    accountId: challengerId,
    actorId: challengerActorId,
    action: 'evidence.verify',
    resourceType: 'evidence',
    resourceId: evidenceId,
    details: { disputeId: dispute.id, reason },
  });

  return dispute;
}

/**
 * Resolve a dispute.
 */
export function resolveDispute(input: ResolveDisputeInput): DisputeRecord | undefined {
  const { disputeId, resolverId, resolverActorId, resolution, resolutionNotes, authz } = input;

  if (authz) {
    requirePermission(authz, 'evidence:admin');
  }

  const disputes = readDisputes();
  const dispute = disputes.find((d) => d.id === disputeId);
  if (!dispute) return undefined;

  dispute.status = resolution === 'upheld' ? 'resolved' : resolution === 'dismissed' ? 'dismissed' : 'escalated';
  dispute.resolution = resolution;
  dispute.resolvedBy = resolverId;
  dispute.resolvedAt = nowIso();
  dispute.updatedAt = nowIso();
  dispute.resolution = resolutionNotes;

  writeDisputes(disputes);

  // Update evidence status based on resolution
  const evidence = getRecord(dispute.evidenceId);
  if (evidence) {
    let newStatus: EvidenceStanding;
    if (resolution === 'upheld') newStatus = EVIDENCE_STANDING.REJECTED;
    else if (resolution === 'dismissed') newStatus = EVIDENCE_STANDING.VERIFIED;
    else newStatus = EVIDENCE_STANDING.DISPUTED;

    updateRecord(dispute.evidenceId, {
      data: { ...evidence.data, status: newStatus, amendmentReason: `dispute ${resolution}: ${resolutionNotes}` },
      updatedBy: resolverId,
      authz,
    });
  }

  // Log audit
  logAuditEvent({
    accountId: resolverId,
    actorId: resolverActorId,
    action: 'evidence.verify',
    resourceType: 'evidence',
    resourceId: dispute.evidenceId,
    details: { disputeId, resolution, notes: resolutionNotes },
  });

  return dispute;
}

/**
 * Get all disputes for a piece of evidence.
 */
export function getDisputesForEvidence(evidenceId: string): DisputeRecord[] {
  return readDisputes().filter((d) => d.evidenceId === evidenceId);
}

/**
 * Get all disputes by challenger.
 */
export function getDisputesByChallenger(challengerId: string): DisputeRecord[] {
  return readDisputes().filter((d) => d.challengerId === challengerId);
}

// ---------------------------------------------------------------------------
// Amendment (Correction) — Attributable, Never Silent Rewrite
// ---------------------------------------------------------------------------

export interface AmendRecordInput extends SupersedeRecordInput {
  /** Explicit amendment reason (required for corrections). */
  amendmentReason: string;
}

/**
 * Create an amendment (correction) to a record.
 * This supersedes the current record with a new version, linking to the old one.
 * The old record is marked 'superseded'. NEVER a silent rewrite.
 */
export function amendRecord(
  recordId: string,
  input: AmendRecordInput
): RecordEnvelope | undefined {
  const current = getRecord(recordId);
  if (!current) return undefined;

  const supersedeInput: SupersedeRecordInput = {
    data: input.data,
    reason: input.reason,
    updatedBy: input.updatedBy,
    evidenceIds: input.evidenceIds,
    authz: input.authz,
  };

  const newRecord = supersedeRecord(recordId, supersedeInput);
  if (!newRecord) return undefined;

  // Ensure amendment reason is stored
  const finalRecord = updateRecord(newRecord.id, {
    data: { ...newRecord.data, amendmentReason: input.amendmentReason },
    updatedBy: input.updatedBy,
    authz: input.authz,
  });

  // Log audit
  logAuditEvent({
    accountId: input.updatedBy,
    actorId: null,
    action: 'record.update',
    resourceType: current.family.toLowerCase(),
    resourceId: recordId,
    details: { supersedesId: current.id, newVersion: newRecord.version, reason: input.amendmentReason },
  });

  return finalRecord ?? newRecord;
}

// ---------------------------------------------------------------------------
// Read APIs
// ---------------------------------------------------------------------------

export function getVerificationEventsForEvidence(evidenceId: string): VerificationEvent[] {
  return readVerificationEvents().filter((e) => e.evidenceId === evidenceId);
}

export function getVerificationEventsByVerifier(verifierId: string): VerificationEvent[] {
  return readVerificationEvents().filter((e) => e.verifierId === verifierId);
}

export function getOpenDisputes(): DisputeRecord[] {
  return readDisputes().filter((d) => d.status === 'open');
}

export function getEvidenceStatusSummary(): Record<EvidenceStanding, number> {
  const evidence = listRecords({ family: 'EVIDENCE' });
  const summary = Object.values(EVIDENCE_STANDING).reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<EvidenceStanding, number>
  );
  for (const e of evidence) {
    summary[evidenceStanding(e)]++;
  }
  return summary;
}