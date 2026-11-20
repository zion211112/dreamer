/**
 * APT-LABS — Knowledge Store (Gate 4 — Memory & Intelligence)
 *
 * Knowledge is how APT-LABS *preserves what becomes known*. A knowledge
 * record (a method, protocol, standard, finding, lesson) is a
 * KNOWLEDGE-family record in its own right: versioned, attributable, and
 * corrected by supersession like every other record.
 *
 * A piece of knowledge is created `proposed`. `markKnowledgeConfirmed` is
 * the trust transition (`knowledge.update`), gated to a trusted principal
 * (`knowledge:admin`) — mirroring how evidence earns `verified`.
 *
 * `distillKnowledge` is the bridge from the Roll (accepted outcomes) into
 * the envelope store: an accepted outcome becomes a first-class, searchable
 * Lesson record instead of being re-derived on the fly. Distilling is
 * idempotent — a second distillation of the same outcome returns the
 * existing record, never a duplicate.
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
import { queryRollEntries } from './db/roll';
import type { KnowledgeType } from './ontology/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KnowledgeStatus = 'proposed' | 'confirmed';

export interface RegisterKnowledgeInput {
  /** KNOWLEDGE type discriminator (Method, Protocol, Finding, Lesson, …). */
  type: KnowledgeType;
  title: string;
  summary: string;
  /** Id of the record/roll outcome this knowledge was distilled from. */
  derivedFrom?: string;
  actorId?: string | null;
  createdBy: string;
  /** When provided, gated by `knowledge:write`. */
  authz?: AuthzContext;
}

function knowledgeData(rec: RecordEnvelope): {
  title?: string;
  summary?: string;
  status?: KnowledgeStatus;
  derivedFrom?: string;
} {
  return rec.data as unknown as {
    title?: string;
    summary?: string;
    status?: KnowledgeStatus;
    derivedFrom?: string;
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Register a knowledge record. Gated by `knowledge:write` when an
 * `AuthzContext` is supplied. Logs `knowledge.create`.
 */
export function registerKnowledge(input: RegisterKnowledgeInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'knowledge:write');
  }

  const record = createRecord({
    family: 'KNOWLEDGE',
    type: input.type,
    data: {
      title: input.title,
      summary: input.summary,
      status: 'proposed' as KnowledgeStatus,
      ...(input.derivedFrom !== undefined ? { derivedFrom: input.derivedFrom } : {}),
    },
    actorId: input.actorId ?? null,
    createdBy: input.createdBy,
  });

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId ?? null,
    action: 'knowledge.create',
    resourceType: 'knowledge',
    resourceId: record.id,
    details: {
      type: input.type,
      ...(input.derivedFrom !== undefined ? { derivedFrom: input.derivedFrom } : {}),
    },
  });

  return record;
}

// ---------------------------------------------------------------------------
// Distillation (accepted Roll outcomes → first-class Lesson records)
// ---------------------------------------------------------------------------

/**
 * Distill the knowledge an accepted outcome produced, persisting it as a
 * `Lesson` knowledge record with a `derivedFrom` pointer back to the Roll
 * entry. Only outcomes with a recorded acceptance are distillable — an
 * unaccepted or unknown entry yields nothing. Idempotent: the existing
 * record is returned for an outcome that is already distilled.
 *
 * Gated by `knowledge:write` when an `AuthzContext` is supplied.
 *
 * @returns the knowledge record (new or existing), or undefined.
 */
export async function distillKnowledge(
  entryId: string,
  by: string,
  authz?: AuthzContext,
): Promise<RecordEnvelope | undefined> {
  const entries = await queryRollEntries();
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return undefined;
  if (!entry.acceptance.accepted_by) return undefined;

  const existing = knowledgeForOutcome(entryId);
  if (existing) return existing;

  return registerKnowledge({
    type: 'Lesson',
    title: `Lesson · ${entry.title}`,
    summary: `Accepted outcome for ${entry.title}: scope delivered; acceptance recorded by ${entry.acceptance.accepted_by}.`,
    derivedFrom: entry.id,
    createdBy: by,
    authz,
  });
}

// ---------------------------------------------------------------------------
// Confirmation (the trust transition)
// ---------------------------------------------------------------------------

/**
 * Record that knowledge has been confirmed — an attributable transition
 * from `proposed` to `confirmed`. Only a trusted principal
 * (`knowledge:admin`) may confirm. Logs `knowledge.update`.
 */
export function markKnowledgeConfirmed(
  knowledgeId: string,
  confirmedBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'knowledge:admin');
  }

  const record = getRecord(knowledgeId);
  if (!record || record.family !== 'KNOWLEDGE') return undefined;
  if (knowledgeData(record).status === 'confirmed') return record;

  const updated = updateRecord(knowledgeId, {
    data: { ...record.data, status: 'confirmed' as KnowledgeStatus },
    updatedBy: confirmedBy,
  });

  logAuditEvent({
    accountId: confirmedBy,
    actorId: record.actorId,
    action: 'knowledge.update',
    resourceType: 'knowledge',
    resourceId: knowledgeId,
    details: { type: record.type, transition: 'confirmed' },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The knowledge envelope, if the id is a KNOWLEDGE record. */
export function getKnowledge(id: string): RecordEnvelope | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'KNOWLEDGE') return undefined;
  return record;
}

/** List knowledge records, filtered by actor / type / trust status. */
export function listKnowledge(filter?: {
  actorId?: string;
  type?: string;
  status?: KnowledgeStatus;
}): RecordEnvelope[] {
  const explicitStatus = filter?.status !== undefined;
  return listRecords({ family: 'KNOWLEDGE' }).filter((r) => {
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.type && r.type !== filter.type) return false;
    if (explicitStatus && knowledgeData(r).status !== filter.status) return false;
    return true;
  });
}

/** The knowledge record distilled from a given outcome id, if any. */
export function knowledgeForOutcome(derivedFrom: string): RecordEnvelope | undefined {
  return listRecords({ family: 'KNOWLEDGE' }).find(
    (r) => knowledgeData(r).derivedFrom === derivedFrom,
  );
}
