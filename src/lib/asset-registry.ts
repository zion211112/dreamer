/**
 * APT-LABS — Asset Registry (Gate 1 → Gate 2 bridge)
 *
 * A productive asset — a workshop, a machine, a facility, a tool, a capacity —
 * is a RESOURCE-family record persisted through the record envelope and owned
 * by an Actor via a first-class `HOLDS` relationship.
 *
 * This module is the *permission boundary* for assets. It does not pass
 * `AuthzContext` down to the envelope/relationship stores (which would
 * re-gate on `record:write`); instead it gates itself on the `resource:*`
 * family. That is what separates an asset from a generic record: assets are
 * governed by resource permissions, scoped to the owning actor.
 *
 * Every mutation is logged to the append-only audit trail under the
 * `resource.*` actions, so the asset lifecycle is queryable and trustworthy.
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

export type AssetStatus = 'active' | 'retired';

export interface RegisterAssetInput {
  name: string;
  /** RESOURCE type discriminator (e.g. 'Asset', 'Facility', 'Equipment'). */
  type: string;
  actorId: string;
  description?: string;
  /** Operational capacity, e.g. "50 units/day", "3 bays". */
  capacity?: string;
  evidenceIds?: string[];
  createdBy: string;
  /** When provided, the call is gated by `resource:write`. */
  authz?: AuthzContext;
}

export interface Asset {
  record: RecordEnvelope;
  /** Active `HOLDS` edges pointing at this asset (its owners/stewards). */
  holdings: PersistedRelationship[];
}

// Typed reader for the asset payload (stored as Record<string, unknown>).
function assetData(rec: RecordEnvelope): {
  name?: string;
  description?: string;
  capacity?: string;
  status?: AssetStatus;
} {
  return rec.data as unknown as {
    name?: string;
    description?: string;
    capacity?: string;
    status?: AssetStatus;
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Register a productive asset. Gated by `resource:write` when an
 * `AuthzContext` is supplied. Creates the RESOURCE record and the `HOLDS`
 * ownership edge in one attributable step, and logs `resource.create`.
 */
export function registerAsset(input: RegisterAssetInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const record = createRecord({
    family: 'RESOURCE',
    type: input.type,
    data: {
      name: input.name,
      description: input.description,
      capacity: input.capacity,
      status: 'active' as AssetStatus,
    },
    actorId: input.actorId,
    evidenceIds: input.evidenceIds,
    createdBy: input.createdBy,
  });

  // First-class ownership: the actor HOLDS this asset (never a bare FK).
  createRelationship({
    kind: 'HOLDS',
    sourceId: input.actorId,
    targetId: record.id,
    sourceRole: 'owner',
    targetRole: 'asset',
    actorId: input.actorId,
    createdBy: input.createdBy,
  });

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'resource.create',
    resourceType: 'asset',
    resourceId: record.id,
    details: { name: input.name, type: input.type },
  });

  return record;
}

/**
 * Update an asset in place (capacity, description). Gated by `resource:write`.
 * Ownership is not mutated here.
 */
export function updateAsset(
  id: string,
  input: { name?: string; description?: string; capacity?: string; updatedBy: string; authz?: AuthzContext },
): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'resource:write');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;

  const current = assetData(record);
  const updated = updateRecord(id, {
    data: {
      ...record.data,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      capacity: input.capacity ?? current.capacity,
    },
    updatedBy: input.updatedBy,
  });

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: record.actorId,
    action: 'resource.update',
    resourceType: 'asset',
    resourceId: id,
    details: { name: input.name, capacity: input.capacity },
  });

  return updated;
}

/**
 * Retire an asset — a terminal, attributable transition. The record is kept
 * and marked `retired`; ownership is preserved (you can own a retired asset).
 * Gated by `resource:admin`.
 */
export function retireAsset(
  id: string,
  reason: string,
  retiredBy: string,
  authz?: AuthzContext,
): RecordEnvelope | undefined {
  if (authz) {
    requirePermission(authz, 'resource:admin');
  }

  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;

  if (assetData(record).status === 'retired') return record;

  const updated = updateRecord(id, {
    data: { ...record.data, status: 'retired' as AssetStatus },
    updatedBy: retiredBy,
  });

  logAuditEvent({
    accountId: retiredBy,
    actorId: record.actorId,
    action: 'resource.delete',
    resourceType: 'asset',
    resourceId: id,
    details: { reason },
  });

  return updated;
}

// ---------------------------------------------------------------------------
// Access checks
// ---------------------------------------------------------------------------

/**
 * Whether the context may *use* this asset. Requires `resource:read`, that the
 * record is a RESOURCE, and that it is not retired (a retired asset is usable
 * only by someone with `resource:admin`, e.g. to inspect or reactivate).
 */
export function canAccessAsset(ctx: AuthzContext, assetId: string): boolean {
  if (!canPerform(ctx, 'resource:read')) return false;

  const record = getRecord(assetId);
  if (!record || record.family !== 'RESOURCE') return false;

  if (assetData(record).status === 'retired' && !canPerform(ctx, 'resource:admin')) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The asset envelope plus its active `HOLDS` ownership edges. */
export function getAsset(id: string): Asset | undefined {
  const record = getRecord(id);
  if (!record || record.family !== 'RESOURCE') return undefined;
  const holdings = getRelationshipsForEntity(id).filter((r) => r.kind === 'HOLDS');
  return { record, holdings };
}

/**
 * List assets, filtered by actor / type / status. Retired assets are excluded
 * unless requested explicitly. Newest first.
 */
export function listAssets(filter?: {
  actorId?: string;
  type?: string;
  status?: AssetStatus;
}): RecordEnvelope[] {
  const explicitStatus = filter?.status !== undefined;
  return listRecords({ family: 'RESOURCE' }).filter((r) => {
    if (filter?.actorId && r.actorId !== filter.actorId) return false;
    if (filter?.type && r.type !== filter.type) return false;
    if (explicitStatus) {
      return assetData(r).status === filter.status;
    }
    // Default: active only (the envelope default for an unmarked asset is active).
    return (assetData(r).status ?? 'active') !== 'retired';
  });
}
