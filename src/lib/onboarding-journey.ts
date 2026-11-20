/**
 * APT-LABS — Productive Entry / Onboarding Journey (Gate 2)
 *
 * A real person entering the platform accomplishes one thing: they register
 * their productive capacity. That is an Actor (who), plus what they *have*
 * (assets), plus what they can *do* (capabilities). This journey composes the
 * Gate 1 actor model with the Gate 2 asset and capability registries into a
 * single, trustworthy, auditable onboarding flow.
 *
 * The result is a `ProductiveProfile` — a discoverable "who can do what, with
 * what" record. That is the productive entry that later gates (coordination,
 * matching) build on: a provider is only matchable to a need once it exists as
 * a profile.
 *
 * No fake integrations: every step persists a real record/relationship and is
 * logged. The whole flow is gated when an `AuthzContext` is supplied.
 */

import {
  createActor,
  getActor,
  type Actor,
  type ActorType,
} from './actors';
import { registerAsset } from './asset-registry';
import { registerCapability } from './capability-registry';
import { getRecord, type RecordEnvelope } from './record-envelope';
import { getRelationshipsForEntity, type PersistedRelationship } from './relationship-store';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface OnboardAssetInput {
  name: string;
  /** RESOURCE type (e.g. 'Facility', 'Equipment'). */
  type: string;
  description?: string;
  capacity?: string;
  evidenceIds?: string[];
}

export interface OnboardCapabilityInput {
  name: string;
  /** CAPABILITY type (e.g. 'Skill', 'OperationalCapacity'). */
  type: string;
  description?: string;
  availability?: string;
  evidenceIds?: string[];
}

export interface OnboardActorInput {
  type: ActorType;
  name: string;
  description?: string;
  /** The account that owns this Actor. */
  ownerId: string;
  /** Principal acting on the onboarding (logged to the audit trail). */
  createdBy: string;
  assets?: OnboardAssetInput[];
  capabilities?: OnboardCapabilityInput[];
  /** When provided, the whole flow is gated. */
  authz?: AuthzContext;
}

// ---------------------------------------------------------------------------
// Composed result
// ---------------------------------------------------------------------------

export interface ProductiveProfile {
  actor: Actor;
  /** What the actor has. */
  assets: RecordEnvelope[];
  /** What the actor can do. */
  capabilities: RecordEnvelope[];
  /** The first-class edges tying the actor to its capacity. */
  relationships: PersistedRelationship[];
}

// ---------------------------------------------------------------------------
// 1 — Onboard: create the actor and register its capacity
// ---------------------------------------------------------------------------

/**
 * Onboard an actor with its productive capacity. Gated by `actor:write` (to
 * create the actor) and `resource:write` (to register assets/capabilities)
 * when an `AuthzContext` is supplied. Logs `actor.create` for the new actor.
 */
export function onboardActor(input: OnboardActorInput): ProductiveProfile {
  // Creating the actor requires actor:write; registering capacity requires
  // resource:write. Both are decided up front when a context is supplied.
  if (input.authz) {
    requirePermission(input.authz, 'actor:write');
    if (input.assets?.length || input.capabilities?.length) {
      requirePermission(input.authz, 'resource:write');
    }
  }

  const actor = createActor(
    {
      type: input.type,
      name: input.name,
      description: input.description,
    },
    input.ownerId,
  );

  // createActor does not audit; record the actor's creation here so the
  // onboarding flow is fully attributable.
  logAuditEvent({
    accountId: input.createdBy,
    actorId: actor.id,
    action: 'actor.create',
    resourceType: 'actor',
    resourceId: actor.id,
    details: { type: input.type, name: input.name },
  });

  const assets = (input.assets ?? []).map((a) =>
    registerAsset({
      name: a.name,
      type: a.type,
      actorId: actor.id,
      description: a.description,
      capacity: a.capacity,
      evidenceIds: a.evidenceIds,
      createdBy: input.createdBy,
      authz: input.authz,
    }),
  );

  const capabilities = (input.capabilities ?? []).map((c) =>
    registerCapability({
      name: c.name,
      type: c.type,
      actorId: actor.id,
      description: c.description,
      availability: c.availability,
      evidenceIds: c.evidenceIds,
      createdBy: input.createdBy,
      authz: input.authz,
    }),
  );

  const relationships = getRelationshipsForEntity(actor.id);

  return { actor, assets, capabilities, relationships };
}

// ---------------------------------------------------------------------------
// 2 — Read a composed profile for an existing actor
// ---------------------------------------------------------------------------

/**
 * The composed, discoverable profile for an actor: who they are, what they
 * have, what they can do. This is the unit that coordination matches against.
 */
export function getProductiveProfile(actorId: string): ProductiveProfile | undefined {
  const actor = getActor(actorId);
  if (!actor) return undefined;

  const relationships = getRelationshipsForEntity(actorId);
  const assetIds = new Set(
    relationships.filter((r) => r.kind === 'HOLDS' && r.sourceId === actorId).map((r) => r.targetId),
  );
  const capabilityIds = new Set(
    relationships.filter((r) => r.kind === 'PROVIDES' && r.sourceId === actorId).map((r) => r.targetId),
  );

  const assets = ids(assetIds)
    .map((id) => getRecord(id))
    .filter((r): r is RecordEnvelope => Boolean(r && r.family === 'RESOURCE'));
  const capabilities = ids(capabilityIds)
    .map((id) => getRecord(id))
    .filter((r): r is RecordEnvelope => Boolean(r && r.family === 'CAPABILITY'));

  return { actor, assets, capabilities, relationships };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ids(set: Set<string>): string[] {
  return [...set];
}
