/**
 * APT-LABS — Evidence Store (Gate 4 — Memory & Intelligence)
 *
 * Evidence is how a claim, outcome, or capability is *backed*. An evidence
 * record (a document, observation, measurement, attestation) is an
 * EVIDENCE-family record in its own right, and it attaches to the records it
 * supports through the envelope's `evidenceIds` — never a bare link.
 *
 * This is the "file" half of Gate 1's asset/file permissions, delivered here
 * where it belongs: a file is governed by the `evidence:*` family, actor-
 * scoped, and every attach/verify is attributable. `markEvidenceVerified` is
 * the trust transition (`evidence.verify`), gated to a trusted principal.
 *
 * A file's *bytes* live elsewhere (object storage / Supabase Storage); this
 * record is the authoritative, audited pointer to them plus their status.
 */

import {
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  type RecordEnvelope,
} from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EvidenceStatus = 'unverified' | 'verified' | 'rejected';

export interface RegisterEvidenceInput {
  /** EVIDENCE type discriminator (e.g. 'Document', 'Observation'). */
  type: string;
  summary: string;
  /** Where the underlying file/document bytes live. */
  sourceUri?: string;
  actorId?: string | null;
  createdBy: string;
  /** When provided, gated by `evidence:write`. */
  authz?: AuthzContext;
}

function evidenceData(rec: RecordEnvelope): {
  summary?: string;
  sourceUri?: string;
  status?: EvidenceStatus;
} {
  return rec.data as unknown as {
    summary?: string;
    sourceUri?: string;
    status?: EvidenceStatus;
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Register an evidence record. Gated by `evidence:write` when an
 * `AuthzContext` is supplied. Logs `evidence.create`.
 */
export function registerEvidence(input: RegisterEvidenceInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'evidence:write');
  }

  const record = createRecord({
    family: 'EVIDENCE',
    type: input.type,
    data: {
      summary: input.summary,
      sourceUri: input.sourceUri,
      status: 'unverified' as EvidenceStatus,
    },
    actorId: input.actorId ?? null,
    createdBy: input.createdBy,
  });

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId ?? null,
    action: 'evidence.create',
    resourceType: 'evidence',
    resourceId: record.id,
    details: { type: input.type },
  });

  return record;
}

// ---------------------------------------------------------------------------
// Attachment (evidence → the record it supports)
// ---------------------------------------------------------------------------

/**
 * Attach a piece of evidence to a record it supports. Both must exist. The
 * record's `evidenceIds` is the authoritative link; the mutation is audited
 * through the record envelope's `record.update`. Gated by `evidence:write`.
 *
 * @returns the updated record, or undefined if either id is unknown.
 */
export function attachEvidence(
  recordId: string,
  evidenceId: string,
  by: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'evidence:write');
  }

  const record = getRecord(recordId);
  if (!record) return undefined;
  const evidence = getRecord(evidenceId);
  if (!evidence || evidence.family !== 'EVIDENCE') return undefined;

  if (record.evidenceIds.includes(evidenceId)) return record;

  return updateRecord(recordId, {
    evidenceIds: [...record.evidenceIds, evidenceId],
    updatedBy: by,
  });
}

// ---------------------------------------------------------------------------
// Verification (the trust transition)
// ---------------------------------------------------------------------------

/**
 * Record that a piece of evidence has been verified — a trustworthy,
 * attributable transition to `verified`. Only a trusted principal
 * (`evidence:admin`) may verify. Logs `evidence.verify`.
 */
export function markEvidenceVerified(
  evidenceId: string,
  verifiedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'evidence:admin');
  }

  const record = getRecord(evidenceId);
  if (!record || record.family !== 'EVIDENCE') return undefined;
  if (evidenceData(record).status === 'verified') return record;

  const updated = updateRecord(evidenceId, {
    data: { ...record.data, status: 'verified' as EvidenceStatus },
    updatedBy: verifiedBy,
  });

  logAuditEvent({
    accountId: verifiedBy,
    actorId: record.actorId,
    action: 'evidence.verify',
    resourceType: 'evidence',
    resourceId: evidenceId,
    details: { type: record.type },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The evidence envelope, if the id is an EVIDENCE record. */
export function getEvidence(id: string): RecordEnvelope | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'EVIDENCE') return undefined;
  return record;
}

/** List evidence records, filtered by actor / type / status. */
export function listEvidence(filter?: {
  actorId?: string;
  type?: string;
  status?: EvidenceStatus;
}): RecordEnvelope[] {
  const explicitStatus = filter?.status !== undefined;
  return listRecords({ family: 'EVIDENCE' }).filter((r) => {
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.type && r.type !== filter.type) return false;
    if (explicitStatus && evidenceData(r).status !== filter.status) return false;
    return true;
  });
}

/** The resolved evidence records attached to a record. */
export function getEvidenceForRecord(recordId: string): RecordEnvelope[] {
  const record = getRecord(recordId);
  if (!record) return [];
  return record.evidenceIds
    .map((id) => getEvidence(id))
    .filter((e): e is RecordEnvelope => Boolean(e));
}
