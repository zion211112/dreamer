/**
 * APT-LABS — Relationship Store (Gate 1 — Foundations)
 *
 * Relationships are first-class, versioned persisted records — never bare
 * foreign keys. They link actors to one another and to the records that
 * constitute productive capacity, and are the relational backbone of
 * coordination: a Crew linked to a Project, a Person linked to an Institution,
 * a Commitment linked to the Intention it answers.
 *
 * Terminating a relationship is a terminal, attributable transition — the
 * record is kept and marked, never deleted. Every mutation logs a Gate-1
 * audit event and is gated by the permission layer when an `AuthzContext` is
 * supplied.
 *
 * Persisted shape mirrors `AptRelationshipBase` (ontology/types).
 * Demo mode: browser-localStorage (via `storage.ts`). Production: Supabase.
 */

import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RelationshipStatus = 'active' | 'terminated';

export interface PersistedRelationship {
  id: string;
  /** Canonical relationship kind (e.g. 'HOLDS_CAPABILITY', 'MEMBER_OF'). */
  kind: string;
  /** Source entity id. */
  sourceId: string;
  /** Target entity id. */
  targetId: string;
  /** Semantic role the source plays (optional). */
  sourceRole?: string;
  /** Semantic role the target plays (optional). */
  targetRole?: string;
  /** Actor (organization) context the relationship belongs to. */
  actorId: string | null;
  status: RelationshipStatus;
  /** Version for correction tracking. */
  version: number;
  /** Id of the relationship this one supersedes (corrections, never rewrites). */
  supersedesId: string | null;
  /** Evidence ids supporting this relationship (optional). */
  evidenceIds: string[];
  /** Ids of the audit events that recorded mutations of this relationship. */
  auditEventIds: string[];
  recordedAt: string;
  createdBy: string;
  updatedBy: string;
  endedAt?: string;
}

export interface CreateRelationshipInput {
  kind: string;
  sourceId: string;
  targetId: string;
  sourceRole?: string;
  targetRole?: string;
  actorId?: string | null;
  evidenceIds?: string[];
  createdBy: string;
  authz?: AuthzContext;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const RELATIONSHIPS_KEY = 'aptlabs:relationships';

function readRelationships(): PersistedRelationship[] {
  return readJson<PersistedRelationship[]>(RELATIONSHIPS_KEY, []);
}

function writeRelationships(rels: PersistedRelationship[]): void {
  writeJson(RELATIONSHIPS_KEY, rels);
}

function nowIso(): string {
  return new Date().toISOString();
}

function createRelationshipId(): string {
  return `rel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a relationship. Gated by `record:write` when an `AuthzContext` is
 * passed. Prevents creating a duplicate active edge between the same pair
 * and kind.
 */
export function createRelationship(input: CreateRelationshipInput): PersistedRelationship {
  if (input.authz) {
    requirePermission(input.authz, 'record:write');
  }

  const rels = readRelationships();
  const duplicate = rels.find(
    (r) =>
      r.status === 'active'
      && r.kind === input.kind
      && r.sourceId === input.sourceId
      && r.targetId === input.targetId,
  );
  if (duplicate) return duplicate;

  const now = nowIso();
  const relationshipId = createRelationshipId();
  const event = logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId ?? null,
    action: 'relationship.create',
    resourceType: 'relationship',
    resourceId: relationshipId,
    details: {
      kind: input.kind,
      sourceId: input.sourceId,
      targetId: input.targetId,
    },
  });

  const relationship: PersistedRelationship = {
    id: relationshipId,
    kind: input.kind,
    sourceId: input.sourceId,
    targetId: input.targetId,
    sourceRole: input.sourceRole,
    targetRole: input.targetRole,
    actorId: input.actorId ?? null,
    status: 'active',
    version: 1,
    supersedesId: null,
    evidenceIds: input.evidenceIds ? [...input.evidenceIds] : [],
    auditEventIds: [event.id],
    recordedAt: now,
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
  };

  rels.push(relationship);
  writeRelationships(rels);
  return relationship;
}

/**
 * Terminate a relationship — a terminal, attributable transition. Gated by
 * `record:admin`.
 */
export function terminateRelationship(
  id: string,
  reason: string,
  terminatedBy: string,
  authz?: AuthzContext,
): PersistedRelationship | undefined {
  if (authz) {
    requirePermission(authz, 'record:admin');
  }

  const rels = readRelationships();
  const idx = rels.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const rel = rels[idx];
  if (rel.status === 'terminated') return rel;

  const now = nowIso();
  const event = logAuditEvent({
    accountId: terminatedBy,
    actorId: rel.actorId,
    action: 'relationship.terminate',
    resourceType: 'relationship',
    resourceId: rel.id,
    details: { kind: rel.kind, reason },
  });

  rel.status = 'terminated';
  rel.endedAt = now;
  rel.updatedBy = terminatedBy;
  rel.auditEventIds.push(event.id);

  writeRelationships(rels);
  return rel;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Retrieve a single relationship by id. */
export function getRelationship(id: string): PersistedRelationship | undefined {
  return readRelationships().find((r) => r.id === id);
}

/**
 * List relationships, optionally filtered. Terminated edges are excluded
 * unless `status` is requested explicitly.
 */
export function listRelationships(filter?: {
  kind?: string;
  status?: RelationshipStatus;
  actorId?: string;
  sourceId?: string;
  targetId?: string;
}): PersistedRelationship[] {
  const explicitStatus = filter?.status !== undefined;
  return readRelationships().filter((r) => {
    if (filter?.kind && r.kind !== filter.kind) return false;
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.sourceId && r.sourceId !== filter.sourceId) return false;
    if (filter?.targetId && r.targetId !== filter.targetId) return false;
    if (explicitStatus && r.status !== filter.status) return false;
    if (!explicitStatus && r.status !== 'active') return false;
    return true;
  });
}

/** All active relationships where the entity is either endpoint. */
export function getRelationshipsForEntity(entityId: string): PersistedRelationship[] {
  return readRelationships().filter(
    (r) => r.status === 'active' && (r.sourceId === entityId || r.targetId === entityId),
  );
}

/** Test-only: remove all persisted relationships. */
export function clearRelationships(): void {
  writeRelationships([]);
}
