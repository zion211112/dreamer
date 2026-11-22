/**
 * APT-LABS — Record Envelope (Gate 1 — Foundations).
 *
 * The canonical persisted form for any record, evidence, or outcome. A record
 * is never stored as bare data: it is an envelope carrying versioning,
 * provenance, lifecycle status, and correction semantics.
 *
 * Corrections are append-only. Superseding a record creates a new version that
 * references the old one; the old version is marked `superseded`, never
 * rewritten. Retiring a record is a terminal, attributable transition.
 *
 * Every mutation logs a Gate-1 audit event (see `audit.ts`) and, when an
 * `AuthzContext` is supplied, the mutation is gated by the permission layer
 * (`authz.ts`) — so the envelope is where "the permissions hold."
 *
 * Persistence: browser localStorage demo mode via `storage.ts`. The Supabase
 * production backend contract lives in `src/lib/supabase/storage.ts` and
 * `supabase/schema.sql`; switching storage there requires no domain change.
 */

import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson, clearAllStore } from './storage';
import { FAMILY, type Family } from './ontology/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecordStatus = 'draft' | 'active' | 'superseded' | 'retired';

export interface RecordEnvelope {
  id: string;
  /** Ontology family the record belongs to. */
  family: Family;
  /** Family-specific type discriminator (e.g. 'Measurement', 'Document'). */
  type: string;
  /** The record's payload. */
  data: Record<string, unknown>;
  status: RecordStatus;
  /** Version for optimistic concurrency / correction tracking. */
  version: number;
  /** Id of the envelope this one supersedes (corrections, never rewrites). */
  supersedesId: string | null;
  /** Actor (organization) context the record belongs to. */
  actorId: string | null;
  /** Evidence ids supporting this record. */
  evidenceIds: string[];
  /** Ids of the audit events that recorded mutations of this record. */
  auditEventIds: string[];
  /** Acting principal that created the record (account id in demo mode). */
  createdBy: string;
  /** Acting principal that last modified the record. */
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordInput {
  family: Family;
  type: string;
  data: Record<string, unknown>;
  createdBy: string;
  actorId?: string | null;
  evidenceIds?: string[];
  /** Lifecycle status on creation (default: 'active'). */
  status?: RecordStatus;
  /** When provided, the create is gated by the permission layer. */
  authz?: AuthzContext;
}

export interface UpdateRecordInput {
  /** Payload patch (replaces `data`). */
  data?: Record<string, unknown>;
  status?: RecordStatus;
  actorId?: string | null;
  /** Replaces the evidence set. Omit to leave evidence unchanged. */
  evidenceIds?: string[];
  updatedBy: string;
  authz?: AuthzContext;
}

export interface SupersedeRecordInput {
  data: Record<string, unknown>;
  reason: string;
  updatedBy: string;
  evidenceIds?: string[];
  authz?: AuthzContext;
}

// ---------------------------------------------------------------------------
// Persistence (browser localStorage demo mode)
// ---------------------------------------------------------------------------

const RECORDS_KEY = 'aptlabs:records';

function readRecords(): RecordEnvelope[] {
  return readJson<RecordEnvelope[]>(RECORDS_KEY, []);
}

function writeRecords(records: RecordEnvelope[]): void {
  writeJson(RECORDS_KEY, records);
}

function nowIso(): string {
  return new Date().toISOString();
}

function createRecordId(): string {
  return `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a record. Gated by `record:write` when an `AuthzContext` is passed.
 */
export function createRecord(input: CreateRecordInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'record:write');
  }

  const records = readRecords();
  const now = nowIso();
  const recordId = createRecordId();
  const event = logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId ?? null,
    action: 'record.create',
    resourceType: 'record',
    resourceId: recordId,
    details: {
      family: input.family,
      type: input.type,
      status: input.status ?? 'active',
    },
  });

  const record: RecordEnvelope = {
    id: recordId,
    family: input.family,
    type: input.type,
    data: input.data,
    status: input.status ?? 'active',
    version: 1,
    supersedesId: null,
    actorId: input.actorId ?? null,
    evidenceIds: input.evidenceIds ? [...input.evidenceIds] : [],
    auditEventIds: [event.id],
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  records.push(record);
  writeRecords(records);
  return record;
}

/**
 * Update a record in place (draft → active, field edits, status changes that
 * do not require a new version lineage). Gated by `record:write`.
 */
export function updateRecord(
  id: string,
  input: UpdateRecordInput,
): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'record:write');
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const record = records[idx];
  const now = nowIso();
  const event = logAuditEvent({
    accountId: input.updatedBy,
    actorId: record.actorId,
    action: 'record.update',
    resourceType: 'record',
    resourceId: record.id,
    details: {
      version: record.version + 1,
      status: input.status ?? record.status,
    },
  });

  if (input.data !== undefined) record.data = input.data;
  if (input.status !== undefined) record.status = input.status;
  if (input.actorId !== undefined) record.actorId = input.actorId;
  if (input.evidenceIds !== undefined) record.evidenceIds = [...input.evidenceIds];

  record.version += 1;
  record.updatedBy = input.updatedBy;
  record.updatedAt = now;
  record.auditEventIds.push(event.id);

  writeRecords(records);
  return record;
}

/**
 * Supersede a record: create the next version carrying the correction, mark the
 * current version `superseded`, and link the two. Never rewrites the old
 * version. Gated by `record:write`.
 */
export function supersedeRecord(
  id: string,
  input: SupersedeRecordInput,
): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'record:write');
  }

  const records = readRecords();
  const oldIdx = records.findIndex((r) => r.id === id);
  if (oldIdx === -1) return undefined;

  const oldRecord = records[oldIdx];
  const now = nowIso();
  const event = logAuditEvent({
    accountId: input.updatedBy,
    actorId: oldRecord.actorId,
    action: 'record.supersede',
    resourceType: 'record',
    resourceId: oldRecord.id,
    details: {
      reason: input.reason,
      fromVersion: oldRecord.version,
      toVersion: oldRecord.version + 1,
    },
  });

  // Old version is now superseded (kept for the audit trail).
  oldRecord.status = 'superseded';
  oldRecord.updatedAt = now;
  oldRecord.updatedBy = input.updatedBy;
  oldRecord.auditEventIds.push(event.id);

  const next: RecordEnvelope = {
    ...oldRecord,
    id: createRecordId(),
    data: input.data,
    status: 'active',
    version: oldRecord.version + 1,
    supersedesId: oldRecord.id,
    evidenceIds: input.evidenceIds ? [...input.evidenceIds] : oldRecord.evidenceIds,
    auditEventIds: [event.id],
    createdBy: oldRecord.createdBy,
    updatedBy: input.updatedBy,
    createdAt: now,
    updatedAt: now,
  };

  records.splice(oldIdx + 1, 0, next);
  writeRecords(records);
  return next;
}

/**
 * Retire a record — a terminal, attributable transition. The record remains
 * readable but no longer active. Gated by `record:admin`.
 */
export function retireRecord(
  id: string,
  reason: string,
  retiredBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'record:admin');
  }

  const records = readRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const record = records[idx];
  const now = nowIso();
  const event = logAuditEvent({
    accountId: retiredBy,
    actorId: record.actorId,
    action: 'record.retire',
    resourceType: 'record',
    resourceId: record.id,
    details: { reason },
  });

  record.status = 'retired';
  record.updatedBy = retiredBy;
  record.updatedAt = now;
  record.auditEventIds.push(event.id);

  writeRecords(records);
  return record;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Retrieve a single record by id. */
export function getRecord(id: string): RecordEnvelope | undefined {
  return readRecords().find((r) => r.id === id);
}

/**
 * List records, optionally filtered by family, actor, status, or type.
 * Newest (by `updatedAt`) first.
 */
export function listRecords(filter?: {
  family?: Family;
  actorId?: string;
  status?: RecordStatus;
  type?: string;
}): RecordEnvelope[] {
  return readRecords()
    .filter((r) => {
      if (filter?.family && r.family !== filter.family) return false;
      if (filter?.actorId && r.actorId !== filter.actorId) return false;
      if (filter?.status && r.status !== filter.status) return false;
      if (filter?.type && r.type !== filter.type) return false;
      return true;
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** Test-only: remove all persisted records. */
export function clearRecords(): void {
  clearAllStore();
}

// Re-export the family constant so callers can reference it alongside the envelope.
export { FAMILY };
