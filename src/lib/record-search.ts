/**
 * APT-LABS — Record Search (Gate 4 — Memory & Intelligence)
 *
 * Search across the envelope store — every ontology family in one query —
 * and across the audit ledger. Case-insensitive substring search; every
 * hit reports *which fields it matched on* (family, type, status, payload),
 * so results stay inspectable and trustworthy rather than opaque.
 *
 * This reads the same persisted envelopes that `record-envelope.ts` writes
 * (records, evidence, knowledge, …), so a search over "records" is a search
 * over everything APT-LABS has preserved — not a separate index that can
 * drift from the source of truth.
 */

import { listRecords, type RecordEnvelope } from './record-envelope';
import {
  getAuditEvents,
  type AuditAction,
  type AuditEvent,
} from './audit';

// ---------------------------------------------------------------------------
// Record search
// ---------------------------------------------------------------------------

export interface RecordSearchHit {
  record: RecordEnvelope;
  /** Which fields the query matched in this record, e.g. `['type', 'data']`. */
  matchedOn: string[];
}

export interface RecordSearchFilter {
  family?: RecordEnvelope['family'];
  actorId?: string;
  status?: RecordEnvelope['status'];
  /** Maximum number of hits to return (default 50). */
  limit?: number;
}

const DEFAULT_LIMIT = 50;

/**
 * Search record envelopes across all families. The query is matched as a
 * case-insensitive substring against each record's id, family, type,
 * status, and JSON payload. Hits rank by how many fields they matched,
 * ties broken by recency (newest first).
 */
export function searchRecords(
  query: string,
  filter?: RecordSearchFilter,
): RecordSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const limit = filter?.limit !== undefined ? filter.limit : DEFAULT_LIMIT;

  const hits: RecordSearchHit[] = [];
  for (const record of listRecords(filter)) {
    const fields: Array<[field: string, value: string]> = [
      ['id', record.id],
      ['family', record.family],
      ['type', record.type],
      ['status', record.status],
      ['data', JSON.stringify(record.data)],
    ];
    const matchedOn = fields
      .filter(([, value]) => value.toLowerCase().includes(q))
      .map(([field]) => field);
    if (matchedOn.length > 0) {
      hits.push({ record, matchedOn });
    }
  }

  hits.sort((a, b) =>
    b.matchedOn.length - a.matchedOn.length ||
    (a.record.updatedAt < b.record.updatedAt ? 1 : -1));
  return hits.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Audit search
// ---------------------------------------------------------------------------

export interface AuditSearchFilter {
  action?: AuditAction;
  accountId?: string | null;
  limit?: number;
}

/**
 * Search the audit ledger. The query is matched as a case-insensitive
 * substring against each event's action, resource type/id, account, and
 * details. Events keep the ledger's newest-first order.
 */
export function searchAuditEvents(
  query: string,
  filter?: AuditSearchFilter,
): AuditEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAuditEvents(filter).filter((event) =>
    [
      event.action,
      event.resourceType ?? '',
      event.resourceId ?? '',
      event.accountId ?? '',
      JSON.stringify(event.details),
    ].some((field) => field.toLowerCase().includes(q)),
  );
}
