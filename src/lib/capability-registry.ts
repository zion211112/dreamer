/**
 * APT-LABS — Capability Registry (Gate 2 — Productive Entry)
 *
 * A capability — a skill, qualification, operational capacity, or availability
 * — is what an actor can *do*. It complements the asset registry (what an
 * actor *has*) to form a complete picture of an actor's productive capacity.
 *
 * A capability is a CAPABILITY-family record owned by an Actor via a
 * first-class `PROVIDES` relationship. Like assets, capabilities are governed
 * by the `resource:*` permission family (a capability is a productive resource)
 * and logged under the `resource.*` audit actions, distinguished from assets
 * by `resourceType: 'capability'`.
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
import { logAuditEvent } from './audit';
import { requirePermission, canPerform, type AuthzContext } from './authz';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CapabilityStatus = 'active' | 'retired';

export interface RegisterCapabilityInput {
  name: string;
  /** CAPABILITY type discriminator (e.g. 'Skill', 'OperationalCapacity'). */
  type: string;
  actorId: string;
  description?: string;
  /** Availability / when this capability can be offered, e.g. "weekdays". */
  availability?: string;
  evidenceIds?: string[];
  createdBy: string;
  /** When provided, the call is gated by `resource:write`. */
  authz?: AuthzContext;
}

export interface Capability {
  record: RecordEnvelope;
  /** Active `PROVIDES` edges pointing at this capability (its providers). */
  provisions: PersistedRelationship[];
}

// Typed reader for the capability payload (stored as Record<string, unknown>).
function capData(rec: RecordEnvelope): {
  name?: string;
  description?: string;
  availability?: string;
  status?: CapabilityStatus;
} {
  return rec.data as unknown as {
    name?: string;
    description?: string;
    availability?: string;
    status?: CapabilityStatus;
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Register a capability. Gated by `resource:write` when an `AuthzContext` is
 * supplied. Creates the CAPABILITY record, the `PROVIDES` edge, and logs
 * `resource.create` (resourceType 'capability').
 */
export function registerCapability(input: RegisterCapabilityInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const record = createRecord({
    family: 'CAPABILITY',
    type: input.type,
    data: {
      name: input.name,
      description: input.description,
      availability: input.availability,
      status: 'active' as CapabilityStatus,
    },
    actorId: input.actorId,
    evidenceIds: input.evidenceIds,
    createdBy: input.createdBy,
  });

  // First-class edge: the actor PROVIDES this capability.
  createRelationship({
    kind: 'PROVIDES',
    sourceId: input.actorId,
    targetId: record.id,
    sourceRole: 'provider',
    targetRole: 'capability',
    actorId: input.actorId,
    createdBy: input.createdBy,
  });

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'resource.create',
    resourceType: 'capability',
    resourceId: record.id,
    details: { name: input.name, type: input.type },
  });

  return record;
}

/**
 * Update a capability in place (description, availability). Gated by
 * `resource:write`.
 */
export function updateCapability(
  id: string,
  input: {
    name?: string;
    description?: string;
    availability?: string;
    updatedBy: string;
    authz?: AuthzContext;
  },
): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'CAPABILITY') return undefined;

  const current = capData(record);
  const updated = updateRecord(id, {
    data: {
      ...record.data,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      availability: input.availability ?? current.availability,
    },
    updatedBy: input.updatedBy,
  });

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: record.actorId,
    action: 'resource.update',
    resourceType: 'capability',
    resourceId: id,
    details: { name: input.name, availability: input.availability },
  });

  return updated;
}

/**
 * Retire a capability — a terminal, attributable transition. Gated by
 * `resource:admin`.
 */
export function retireCapability(
  id: string,
  reason: string,
  retiredBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'resource:admin');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'CAPABILITY') return undefined;

  if (capData(record).status === 'retired') return record;

  const updated = updateRecord(id, {
    data: { ...record.data, status: 'retired' as CapabilityStatus },
    updatedBy: retiredBy,
  });

  logAuditEvent({
    accountId: retiredBy,
    actorId: record.actorId,
    action: 'resource.delete',
    resourceType: 'capability',
    resourceId: id,
    details: { reason },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Access checks
// ---------------------------------------------------------------------------

/** Whether the context may *use* this capability. Requires `resource:read`
 * and a non-retired capability (retired usable only with `resource:admin`). */
export function canAccessCapability(ctx: AuthzContext, capabilityId: string): boolean {
  if (!canPerform(ctx, 'resource:read')) return false;

  const record = getRecord(capabilityId);
  if (!record || record.family !== 'CAPABILITY') return false;

  if (capData(record).status === 'retired' && !canPerform(ctx, 'resource:admin')) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The capability envelope plus its active `PROVIDES` edges. */
export function getCapability(id: string): Capability | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'CAPABILITY') return undefined;
  const provisions = getRelationshipsForEntity(id).filter((r) => r.kind === 'PROVIDES');
  return { record, provisions };
}

/**
 * List capabilities, filtered by actor / type / status. Retired are excluded
 * unless requested explicitly. Newest first.
 */
export function listCapabilities(filter?: {
  actorId?: string;
  type?: string;
  status?: CapabilityStatus;
}): RecordEnvelope[] {
  const explicitStatus = filter?.status !== undefined;
  return listRecords({ family: 'CAPABILITY' }).filter((r) => {
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.type && r.type !== filter.type) return false;
    if (explicitStatus) {
      return capData(r).status === filter.status;
    }
    return (capData(r).status ?? 'active') !== 'retired';
  });
}
