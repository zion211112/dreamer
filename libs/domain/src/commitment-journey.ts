/**
 * APT-LABS — Coordination Journey (Gate 1 → Gate 3 bridge)
 *
 * Composes a prototype coordination flow in an injected in-memory store. It is not a
 * persistent, multi-user, authorized, or independently verified workflow:
 *
 *   1. postNeed          — an actor registers a Need (INTENTION record).
 *   2. acceptCommitment  — a provider actor accepts the need, creating a
 *                          COMMITMENT record + an ANSWERS relationship, and the
 *                          need moves to "committed".
 *   3. fulfilCommitment  — the provider delivers an OUTPUT_OUTCOME record with
 *                          evidence; the commitment and need both move to
 *                          "fulfilled".
 *
 * The helper appends events to the in-memory store and assigns versions, but it does not
 * enforce server authorization, durable audit guarantees, or evidence verification.
 *
 * The former Vue/localStorage persistence modules are not part of the active Angular
 * application. The current Angular CoordinationService supplies browser-memory storage;
 * callers must provide persistence and authorization before using this as a shared workflow.
 */

import type { Family } from '@apt-labs/ontology';

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

// ---------------------------------------------------------------------------
// Minimal envelope / relationship / audit shapes (pure domain contracts)
// ---------------------------------------------------------------------------

/** Subset of the record envelope used by the coordination journey. */
export interface JourneyRecord {
  id: string;
  family: Family;
  type: string;
  data: Record<string, unknown>;
  status: string;
  version: number;
  supersedesId: string | null;
  actorId: string | null;
  evidenceIds: string[];
  auditEventIds: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Subset of the persisted relationship used by the coordination journey. */
export interface JourneyRelationship {
  id: string;
  kind: string;
  sourceId: string;
  targetId: string;
  sourceRole?: string;
  targetRole?: string;
  actorId: string | null;
  status: string;
  version: number;
  supersedesId: string | null;
  evidenceIds: string[];
  auditEventIds: string[];
  recordedAt: string;
  createdBy: string;
  updatedBy: string;
  endedAt?: string;
}

/** Subset of the audit event used by the coordination journey. */
export interface JourneyAuditEvent {
  id: string;
  accountId: string | null;
  actorId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  timestamp: string;
  details: Record<string, unknown>;
  supersedesId: string | null;
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
}

export interface AcceptCommitmentInput {
  needId: string;
  providerActorId: string;
  acceptedBy: string;
}

export interface FulfilCommitmentInput {
  commitmentId: string;
  outcome: string;
  evidenceIds?: string[];
  fulfilledBy: string;
}

export interface Journey {
  need: JourneyRecord | undefined;
  commitments: JourneyRecord[];
  outcomes: JourneyRecord[];
  relationships: JourneyRelationship[];
  /** Audit trail across the need, its commitments, and its outcomes. */
  auditEvents: JourneyAuditEvent[];
}

// ---------------------------------------------------------------------------
// In-memory store contract (caller provides the implementation)
// ---------------------------------------------------------------------------

export interface JourneyStore {
  records: JourneyRecord[];
  relationships: JourneyRelationship[];
  auditEvents: JourneyAuditEvent[];
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function needData(rec: JourneyRecord): NeedData {
  return rec.data as unknown as NeedData;
}
function commitmentData(rec: JourneyRecord): CommitmentData {
  return rec.data as unknown as CommitmentData;
}
function outcomeData(rec: JourneyRecord): OutcomeData {
  return rec.data as unknown as OutcomeData;
}

function logEvent(
  store: JourneyStore,
  input: {
    accountId: string | null;
    actorId: string | null;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    details?: Record<string, unknown>;
  },
): JourneyAuditEvent {
  const event: JourneyAuditEvent = {
    id: createId('audit'),
    accountId: input.accountId,
    actorId: input.actorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    timestamp: nowIso(),
    details: input.details ?? {},
    supersedesId: null,
  };
  store.auditEvents.push(event);
  return event;
}

/** Typed readers for the record payload (payload is stored as Record<string, unknown>). */
export function getNeedRecord(store: JourneyStore, needId: string): JourneyRecord | undefined {
  return store.records.find((r) => r.id === needId && r.type === 'Need' && r.family === 'INTENTION');
}

export function getCommitmentRecord(store: JourneyStore, commitmentId: string): JourneyRecord | undefined {
  return store.records.find((r) => r.id === commitmentId && r.type === 'Agreement' && r.family === 'COMMITMENT');
}

export function getOutcomeRecord(store: JourneyStore, outcomeId: string): JourneyRecord | undefined {
  return store.records.find((r) => r.id === outcomeId && r.type === 'Outcome' && r.family === 'OUTPUT_OUTCOME');
}

// ---------------------------------------------------------------------------
// 1 — Post a need
// ---------------------------------------------------------------------------

/**
 * Register a Need as an INTENTION record. Pure aside from appending to the
 * injected store (no browser storage, no reactivity).
 */
export function postNeed(store: JourneyStore, input: PostNeedInput): JourneyRecord {
  const record: JourneyRecord = {
    id: createId('rec'),
    family: 'INTENTION',
    type: 'Need',
    data: {
      need: input.need,
      status: 'open' as NeedStatus,
      ...(input.requires ? { requires: input.requires } : {}),
    },
    status: 'active',
    version: 1,
    supersedesId: null,
    actorId: input.actorId,
    evidenceIds: [],
    auditEventIds: [],
    createdBy: input.postedBy,
    updatedBy: input.postedBy,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.records.push(record);

  logEvent(store, {
    accountId: input.postedBy,
    actorId: input.actorId,
    action: 'intention.create',
    resourceType: 'need',
    resourceId: record.id,
    details: { requires: input.requires },
  });

  return record;
}

// ---------------------------------------------------------------------------
// 2 — A provider accepts the need (creates a commitment + link)
// ---------------------------------------------------------------------------

/**
 * Accept a need: creates a COMMITMENT record, an ANSWERS relationship from the
 * provider actor to the need, and advances the need status to "committed".
 * Throws if the need is missing or not open.
 */
export function acceptCommitment(store: JourneyStore, input: AcceptCommitmentInput): JourneyRecord {
  const need = getNeedRecord(store, input.needId);
  if (!need) throw new Error(`Need not found: ${input.needId}`);
  if (needData(need).status !== 'open') {
    throw new Error(`Need ${input.needId} is not open (status: ${needData(need).status})`);
  }

  const commitment: JourneyRecord = {
    id: createId('rec'),
    family: 'COMMITMENT',
    type: 'Agreement',
    data: {
      needId: need.id,
      providerActorId: input.providerActorId,
      status: 'accepted' as CommitmentStatus,
    },
    status: 'active',
    version: 1,
    supersedesId: null,
    actorId: need.actorId,
    evidenceIds: [],
    auditEventIds: [],
    createdBy: input.acceptedBy,
    updatedBy: input.acceptedBy,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.records.push(commitment);

  // First-class link: the provider ANSWERS this need (never a bare FK).
  const relationship: JourneyRelationship = {
    id: createId('rel'),
    kind: 'ANSWERS',
    sourceId: input.providerActorId,
    targetId: need.id,
    sourceRole: 'provider',
    targetRole: 'need',
    actorId: need.actorId,
    status: 'active',
    version: 1,
    supersedesId: null,
    evidenceIds: [],
    auditEventIds: [],
    recordedAt: nowIso(),
    createdBy: input.acceptedBy,
    updatedBy: input.acceptedBy,
  };
  store.relationships.push(relationship);

  logEvent(store, {
    accountId: input.acceptedBy,
    actorId: input.providerActorId,
    action: 'commitment.accept',
    resourceType: 'commitment',
    resourceId: commitment.id,
    details: { needId: need.id, providerActorId: input.providerActorId },
  });

  // Advance the need's status through the same record.
  const updated: JourneyRecord = {
    ...need,
    data: { ...need.data, status: 'committed' },
    version: need.version + 1,
    updatedBy: input.acceptedBy,
    updatedAt: nowIso(),
    auditEventIds: [...need.auditEventIds],
  };
  const idx = store.records.findIndex((r) => r.id === need.id);
  store.records[idx] = updated;

  logEvent(store, {
    accountId: input.acceptedBy,
    actorId: need.actorId,
    action: 'intention.update',
    resourceType: 'need',
    resourceId: need.id,
    details: { status: 'committed', version: updated.version },
  });

  return commitment;
}

// ---------------------------------------------------------------------------
// 3 — The provider delivers the outcome, backed by evidence
// ---------------------------------------------------------------------------

/**
 * Fulfil a commitment: creates an OUTPUT_OUTCOME record, advances the
 * commitment to "fulfilled", and advances the need to "fulfilled".
 * Throws if the commitment is missing or not accepted.
 */
export function fulfilCommitment(store: JourneyStore, input: FulfilCommitmentInput): JourneyRecord {
  const commitment = getCommitmentRecord(store, input.commitmentId);
  if (!commitment) throw new Error(`Commitment not found: ${input.commitmentId}`);
  if (commitmentData(commitment).status !== 'accepted') {
    throw new Error(
      `Commitment ${input.commitmentId} is not accepted (status: ${commitmentData(commitment).status})`,
    );
  }

  const data = commitmentData(commitment);

  const outcome: JourneyRecord = {
    id: createId('rec'),
    family: 'OUTPUT_OUTCOME',
    type: 'Outcome',
    data: {
      needId: data.needId,
      commitmentId: commitment.id,
      providerActorId: data.providerActorId,
      outcome: input.outcome,
    },
    status: 'active',
    version: 1,
    supersedesId: null,
    actorId: commitment.actorId,
    evidenceIds: input.evidenceIds ? [...input.evidenceIds] : [],
    auditEventIds: [],
    createdBy: input.fulfilledBy,
    updatedBy: input.fulfilledBy,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.records.push(outcome);

  const updatedCommitment: JourneyRecord = {
    ...commitment,
    data: { ...commitment.data, status: 'fulfilled' },
    version: commitment.version + 1,
    updatedBy: input.fulfilledBy,
    updatedAt: nowIso(),
    auditEventIds: [...commitment.auditEventIds],
  };
  const cIdx = store.records.findIndex((r) => r.id === commitment.id);
  store.records[cIdx] = updatedCommitment;

  logEvent(store, {
    accountId: input.fulfilledBy,
    actorId: data.providerActorId,
    action: 'commitment.fulfil',
    resourceType: 'commitment',
    resourceId: commitment.id,
    details: { outcome: input.outcome },
  });

  const need = getNeedRecord(store, data.needId);
  if (need) {
    const updatedNeed: JourneyRecord = {
      ...need,
      data: { ...need.data, status: 'fulfilled' },
      version: need.version + 1,
      updatedBy: input.fulfilledBy,
      updatedAt: nowIso(),
      auditEventIds: [...need.auditEventIds],
    };
    const nIdx = store.records.findIndex((r) => r.id === need.id);
    store.records[nIdx] = updatedNeed;

    logEvent(store, {
      accountId: input.fulfilledBy,
      actorId: need.actorId,
      action: 'intention.update',
      resourceType: 'need',
      resourceId: need.id,
      details: { status: 'fulfilled', version: updatedNeed.version },
    });
  }

  return outcome;
}

// ---------------------------------------------------------------------------
// Composed read
// ---------------------------------------------------------------------------

/**
 * Return a composed local projection of a coordination journey:
 * need, its commitments, its outcomes, the ANSWERS relationships, and the
 * audit trail across all of them. Pure read — no storage writes.
 */
export function getJourney(store: JourneyStore, needId: string): Journey {
  const need = getNeedRecord(store, needId);
  const commitments = store.records.filter(
    (c) => c.family === 'COMMITMENT' && commitmentData(c).needId === needId,
  );
  const commitmentIds = new Set(commitments.map((c) => c.id));

  const outcomes = store.records.filter((o) => o.family === 'OUTPUT_OUTCOME' && commitmentIds.has(outcomeData(o).commitmentId));

  const relationships = store.relationships.filter(
    (r) => r.status === 'active' && (r.sourceId === needId || r.targetId === needId),
  );

  // Gather the audit trail across the need, its commitments, and outcomes.
  const resourceIds = new Set<string>([needId, ...commitments.map((c) => c.id), ...outcomes.map((o) => o.id)]);
  const auditEvents = store.auditEvents
    .filter((e) => e.resourceId && resourceIds.has(e.resourceId))
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

  return { need, commitments, outcomes, relationships, auditEvents };
}

/**
 * Clear all in-memory journey state (demo/test reset only).
 */
export function clearJourneyStore(store: JourneyStore): void {
  store.records = [];
  store.relationships = [];
  store.auditEvents = [];
}
