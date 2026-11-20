/**
 * APT-LABS — Audit event log (Gate 1 — Foundations)
 *
 * Every sensitive administrative and mutation action is logged with the
 * responsible account, timestamp, scope, and reason. Audit records are
 * append-only and correctable only through attributable supersession.
 *
 * Demo mode: browser-localStorage. Production: Supabase (env vars set).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'actor.create'
  | 'actor.update'
  | 'actor.delete'
  | 'actor.member.add'
  | 'actor.member.remove'
  | 'actor.member.role.change'
  | 'account.login'
  | 'account.logout'
  | 'account.register'
  | 'account.profile.update'
  | 'account.verify'
  | 'account.recovery'
  | 'resource.create'
  | 'resource.update'
  | 'resource.delete'
  | 'intention.create'
  | 'intention.update'
  | 'intention.delete'
  | 'commitment.create'
  | 'commitment.accept'
  | 'commitment.fulfil'
  | 'commitment.revoke'
  | 'relationship.create'
  | 'relationship.terminate'
  | 'work.create'
  | 'work.update'
  | 'work.complete'
  | 'record.create'
  | 'record.update'
  | 'record.delete'
  | 'record.supersede'
  | 'record.retire'
  | 'evidence.create'
  | 'evidence.verify'
  | 'knowledge.create'
  | 'knowledge.update'
  | 'credential.issue'
  | 'credential.suspend'
  | 'credential.revoke'
  | 'credential.supersede'
  | 'permission.grant'
  | 'permission.revoke'
  | 'admin.action';

export interface AuditEvent {
  id: string;
  accountId: string | null;
  actorId: string | null;
  action: AuditAction;
  resourceType: string | null;
  resourceId: string | null;
  timestamp: string;
  details: Record<string, unknown>;
  // Supersession: if this event corrects a previous one, reference it
  supersedesId: string | null;
}

// ---------------------------------------------------------------------------
// Demo mode (browser localStorage, in-memory fallback under tests)
// ---------------------------------------------------------------------------

import { readJson, writeJson, removeItem } from './storage';

const AUDIT_KEY = 'aptlabs:audit-events';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Audit service
// ---------------------------------------------------------------------------

/**
 * Append an audit event. Returns the created event.
 */
export function logAuditEvent(input: {
  accountId: string | null;
  actorId: string | null;
  action: AuditAction;
  resourceType: string | null;
  resourceId: string | null;
  details?: Record<string, unknown>;
  supersedesId?: string | null;
}): AuditEvent {
  const events = readJson<AuditEvent[]>(AUDIT_KEY, []);
  const event: AuditEvent = {
    id: createId('audit'),
    accountId: input.accountId,
    actorId: input.actorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    timestamp: nowIso(),
    details: input.details ?? {},
    supersedesId: input.supersedesId ?? null,
  };
  events.push(event);
  writeJson(AUDIT_KEY, events);
  return event;
}

/**
 * Retrieve audit events, optionally filtered by account, actor, action,
 * or resource. Returns newest first.
 */
export function getAuditEvents(filter?: {
  accountId?: string | null;
  actorId?: string | null;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  from?: string; // ISO timestamp, inclusive
  to?: string; // ISO timestamp, inclusive
  limit?: number;
}): AuditEvent[] {
  const events = readJson<AuditEvent[]>(AUDIT_KEY, []);
  let filtered = events.filter((e) => {
    if (filter?.accountId !== undefined && e.accountId !== filter.accountId) return false;
    if (filter?.actorId !== undefined && e.actorId !== filter.actorId) return false;
    if (filter?.action !== undefined && e.action !== filter.action) return false;
    if (filter?.resourceType !== undefined && e.resourceType !== filter.resourceType) return false;
    if (filter?.resourceId !== undefined && e.resourceId !== filter.resourceId) return false;
    if (filter?.from && e.timestamp < filter.from) return false;
    if (filter?.to && e.timestamp > filter.to) return false;
    return true;
  });
  filtered.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  if (filter?.limit !== undefined) filtered = filtered.slice(0, filter.limit);
  return filtered;
}

/**
 * Clear all audit events (demo mode only — for test reset).
 */
export function clearAuditEvents(): void {
  removeItem(AUDIT_KEY);
}
