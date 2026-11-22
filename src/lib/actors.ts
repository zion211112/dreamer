/**
 * APT-LABS — Multi-Actor model (Gate 1 — Foundations)
 *
 * One authenticated account may participate in multiple Actors. Actors are
 * the organisational containers (Person, Company, Institution, Crew, etc.)
 * through which productive capacity is registered, discovered, and coordinated.
 *
 * Demo mode: browser-localStorage. Production: Supabase (env vars set).
 */

import type { ActorType } from './ontology';
import { ACTOR_ROLE_PERMISSIONS } from './authz';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { ActorType } from './ontology';
export { ACTOR_TYPE_LABELS } from './ontology';

export type ActorRole =
  | 'owner'
  | 'administrator'
  | 'manager'
  | 'member'
  | 'contributor'
  | 'viewer'
  | 'authorizedRepresentative';

export const ACTOR_ROLE_LABELS: Record<ActorRole, string> = {
  owner: 'Owner / Founder',
  administrator: 'Administrator',
  manager: 'Manager',
  member: 'Member',
  contributor: 'Contributor',
  viewer: 'Viewer',
  authorizedRepresentative: 'Authorised Representative',
};

export interface Actor {
  id: string;
  type: ActorType;
  name: string;
  description?: string;
  ownerId: string; // account id that created the Actor
  visibility: 'public' | 'shared' | 'restricted';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ActorMembership {
  id: string;
  accountId: string;
  actorId: string;
  role: ActorRole;
  joinedAt: string;
  invitedBy: string | null;
  isPrimary: boolean;
}

export interface CreateActorInput {
  type: ActorType;
  name: string;
  description?: string;
  visibility?: 'public' | 'shared' | 'restricted';
}

export interface AddMemberInput {
  actorId: string;
  accountId: string;
  role: ActorRole;
  invitedBy: string | null;
}

// ---------------------------------------------------------------------------
// Organization entity (multi-tenant workspace context)
// ---------------------------------------------------------------------------

export type OrganizationType =
  | 'cooperative'
  | 'institution'
  | 'enterprise'
  | 'government'
  | 'consortium'
  | 'other';

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  cooperative: 'Cooperative',
  institution: 'Institution',
  enterprise: 'Enterprise',
  government: 'Government',
  consortium: 'Consortium',
  other: 'Other',
};

export interface Organization {
  id: string;
  type: OrganizationType;
  name: string;
  description?: string;
  /** Parent organization (for hierarchies). */
  parentId?: string;
  /** Legal jurisdiction. */
  jurisdiction?: string;
  /** Registration number / identifier. */
  registrationId?: string;
  ownerId: string; // account id that created the Organization
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CreateOrganizationInput {
  type: OrganizationType;
  name: string;
  description?: string;
  parentId?: string;
  jurisdiction?: string;
  registrationId?: string;
}

// ---------------------------------------------------------------------------
// Multi-tenant Workspace Context
// ---------------------------------------------------------------------------

export interface WorkspaceContext {
  /** The organization this workspace belongs to. */
  organizationId: string;
  /** The actor operating within this workspace. */
  actorId: string;
  /** Effective permissions in this workspace (derived from membership + mandates). */
  effectivePermissions: string[];
  /** Active mandates for the actor in this workspace. */
  activeMandates: Mandate[];
}

// ---------------------------------------------------------------------------
// Mandate Delegation — authority to act within scope + period
// ---------------------------------------------------------------------------

export type MandateScope =
  | 'full'              // Full organizational authority
  | 'resource:manage'   // Manage assets/resources
  | 'commitment:sign'   // Sign commitments on behalf of org
  | 'work:authorize'    // Authorize work execution
  | 'evidence:verify'   // Verify evidence
  | 'financial:approve' // Approve financial settlements
  | 'member:invite'     // Invite new members
  | 'custom';           // Custom scope defined in properties

export const MANDATE_SCOPE_LABELS: Record<MandateScope, string> = {
  full: 'Full Authority',
  'resource:manage': 'Resource Management',
  'commitment:sign': 'Commitment Signing',
  'work:authorize': 'Work Authorization',
  'evidence:verify': 'Evidence Verification',
  'financial:approve': 'Financial Approval',
  'member:invite': 'Member Invitation',
  custom: 'Custom Scope',
};

export interface Mandate {
  id: string;
  /** The organization granting the mandate. */
  organizationId: string;
  /** The actor receiving the mandate (must be a member). */
  actorId: string;
  /** The account acting under this mandate. */
  accountId: string;
  /** Scope of authority granted. */
  scope: MandateScope | string;
  /** Custom scope properties when scope is 'custom'. */
  customScope?: Record<string, unknown>;
  /** When the mandate takes effect. */
  effectiveAt: string;
  /** When the mandate expires (optional). */
  expiresAt?: string;
  /** Who granted the mandate. */
  grantedBy: string;
  /** Whether the mandate is currently active. */
  active: boolean;
  /** Reason / description for the mandate. */
  reason?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface CreateMandateInput {
  organizationId: string;
  actorId: string;
  accountId: string;
  scope: MandateScope | string;
  customScope?: Record<string, unknown>;
  effectiveAt: string;
  expiresAt?: string;
  grantedBy: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Extended Membership with Organization Context
// ---------------------------------------------------------------------------

export interface ActorMembership {
  id: string;
  accountId: string;
  actorId: string;
  role: ActorRole;
  joinedAt: string;
  invitedBy: string | null;
  isPrimary: boolean;
  /** Organization context for this membership. */
  organizationId?: string;
}

export interface AddMemberInput {
  actorId: string;
  accountId: string;
  role: ActorRole;
  invitedBy: string | null;
  organizationId?: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  actorId: string;
  /** Role within the organization (owner, administrator, manager, member, viewer). */
  role: ActorRole;
  joinedAt: string;
  invitedBy: string | null;
  /** Active mandates for this actor in this organization. */
  mandateIds?: string[];
}

// ---------------------------------------------------------------------------
// Demo mode (browser localStorage, in-memory fallback under tests)
// ---------------------------------------------------------------------------

import { readJson, writeJson, getItem } from './storage';

const ACTORS_KEY = 'aptlabs:actors';
const MEMBERSHIPS_KEY = 'aptlabs:actor-memberships';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Actor service
// ---------------------------------------------------------------------------

export function listActors(): Actor[] {
  return readJson<Actor[]>(ACTORS_KEY, []);
}

export function getActor(actorId: string): Actor | undefined {
  return listActors().find((a) => a.id === actorId);
}

export function createActor(input: CreateActorInput, ownerId: string): Actor {
  const actors = listActors();
  const actor: Actor = {
    id: createId('actor'),
    type: input.type,
    name: input.name,
    description: input.description,
    ownerId,
    visibility: input.visibility ?? 'shared',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  };
  actors.push(actor);
  writeJson(ACTORS_KEY, actors);

  // Auto-create owner membership
  addMember({
    actorId: actor.id,
    accountId: ownerId,
    role: 'owner',
    invitedBy: null,
  });

  return actor;
}

export function listMembershipsForAccount(accountId: string): ActorMembership[] {
  return readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []).filter(
    (m) => m.accountId === accountId
  );
}

export function listMembershipsForActor(actorId: string): ActorMembership[] {
  return readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []).filter(
    (m) => m.actorId === actorId
  );
}

export function getMembership(accountId: string, actorId: string): ActorMembership | undefined {
  return listMembershipsForAccount(accountId).find((m) => m.actorId === actorId);
}

export function addMember(input: AddMemberInput): ActorMembership {
  const memberships = readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []);

  // Prevent duplicate membership
  const existing = memberships.find(
    (m) => m.accountId === input.accountId && m.actorId === input.actorId
  );
  if (existing) return existing;

  // If this is the first membership for the account, make it primary
  const accountMemberships = memberships.filter((m) => m.accountId === input.accountId);
  const isPrimary = accountMemberships.length === 0;

  const membership: ActorMembership = {
    id: createId('member'),
    accountId: input.accountId,
    actorId: input.actorId,
    role: input.role,
    joinedAt: nowIso(),
    invitedBy: input.invitedBy,
    isPrimary,
  };
  memberships.push(membership);
  writeJson(MEMBERSHIPS_KEY, memberships);
  return membership;
}

export function removeMember(accountId: string, actorId: string): boolean {
  const memberships = readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []);
  const idx = memberships.findIndex(
    (m) => m.accountId === accountId && m.actorId === actorId
  );
  if (idx === -1) return false;

  const removed = memberships.splice(idx, 1)[0];
  writeJson(MEMBERSHIPS_KEY, memberships);

  // If removed membership was primary, promote another to primary
  if (removed.isPrimary) {
    const remaining = memberships.filter((m) => m.accountId === accountId);
    if (remaining.length > 0) {
      remaining[0].isPrimary = true;
      writeJson(MEMBERSHIPS_KEY, memberships);
    }
  }
  return true;
}

export function updateMemberRole(
  accountId: string,
  actorId: string,
  role: ActorRole
): ActorMembership | undefined {
  const memberships = readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []);
  const membership = memberships.find(
    (m) => m.accountId === accountId && m.actorId === actorId
  );
  if (!membership) return undefined;

  membership.role = role;
  writeJson(MEMBERSHIPS_KEY, memberships);
  return membership;
}

export function getActorsForAccount(accountId: string): Actor[] {
  const memberships = listMembershipsForAccount(accountId);
  const actors = listActors();
  return memberships
    .map((m) => actors.find((a) => a.id === m.actorId))
    .filter((a): a is Actor => Boolean(a))
    .sort((a, b) => {
      const ma = listMembershipsForAccount(accountId).find((m) => m.actorId === a.id);
      const mb = listMembershipsForAccount(accountId).find((m) => m.actorId === b.id);
      return (mb?.isPrimary ? 1 : 0) - (ma?.isPrimary ? 1 : 0);
    });
}

export function getPrimaryActorForAccount(accountId: string): Actor | undefined {
  const memberships = listMembershipsForAccount(accountId);
  const primary = memberships.find((m) => m.isPrimary);
  if (!primary) return undefined;
  return getActor(primary.actorId);
}

export function setPrimaryActor(accountId: string, actorId: string): boolean {
  const memberships = readJson<ActorMembership[]>(MEMBERSHIPS_KEY, []);
  const accountMemberships = memberships.filter((m) => m.accountId === accountId);
  if (!accountMemberships.some((m) => m.actorId === actorId)) return false;

  for (const m of accountMemberships) {
    m.isPrimary = m.actorId === actorId;
  }
  writeJson(MEMBERSHIPS_KEY, memberships);
  return true;
}

// ---------------------------------------------------------------------------
// Convenience: current account id from demo auth
// ---------------------------------------------------------------------------

export function getDemoAccountId(): string | null {
  const raw = getItem('authUser');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.email ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Organization service
// ---------------------------------------------------------------------------

const ORGANIZATIONS_KEY = 'aptlabs:organizations';

export function listOrganizations(): Organization[] {
  return readJson<Organization[]>(ORGANIZATIONS_KEY, []);
}

export function getOrganization(orgId: string): Organization | undefined {
  return listOrganizations().find((o) => o.id === orgId);
}

export function createOrganization(input: CreateOrganizationInput, ownerId: string): Organization {
  const organizations = listOrganizations();
  const now = nowIso();
  const org: Organization = {
    id: createId('org'),
    type: input.type,
    name: input.name,
    description: input.description,
    parentId: input.parentId,
    jurisdiction: input.jurisdiction,
    registrationId: input.registrationId,
    ownerId,
    createdAt: now,
    updatedAt: now,
    updatedBy: ownerId,
    version: 1,
  };
  organizations.push(org);
  writeJson(ORGANIZATIONS_KEY, organizations);
  return org;
}

export function updateOrganization(
  orgId: string,
  input: Partial<CreateOrganizationInput> & { updatedBy: string }
): Organization | undefined {
  const organizations = listOrganizations();
  const idx = organizations.findIndex((o) => o.id === orgId);
  if (idx === -1) return undefined;

  const org = organizations[idx];
  org.type = input.type ?? org.type;
  org.name = input.name ?? org.name;
  org.description = input.description ?? org.description;
  org.parentId = input.parentId ?? org.parentId;
  org.jurisdiction = input.jurisdiction ?? org.jurisdiction;
  org.registrationId = input.registrationId ?? org.registrationId;
  org.updatedAt = nowIso();
  org.updatedBy = input.updatedBy;
  org.version += 1;
  writeJson(ORGANIZATIONS_KEY, organizations);
  return org;
}

// ---------------------------------------------------------------------------
// Organization Membership service
// ---------------------------------------------------------------------------

const ORG_MEMBERSHIPS_KEY = 'aptlabs:org-memberships';

export function listOrganizationMemberships(organizationId: string): OrganizationMembership[] {
  return readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []).filter(
    (m) => m.organizationId === organizationId
  );
}

export function getOrganizationMembership(organizationId: string, actorId: string): OrganizationMembership | undefined {
  return listOrganizationMemberships(organizationId).find((m) => m.actorId === actorId);
}

export function addOrganizationMember(
  organizationId: string,
  actorId: string,
  role: ActorRole,
  invitedBy: string | null
): OrganizationMembership {
  const memberships = readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []);

  const existing = memberships.find(
    (m) => m.organizationId === organizationId && m.actorId === actorId
  );
  if (existing) return existing;

  const membership: OrganizationMembership = {
    id: createId('org-member'),
    organizationId,
    actorId,
    role,
    joinedAt: nowIso(),
    invitedBy,
    mandateIds: [],
  };
  memberships.push(membership);
  writeJson(ORG_MEMBERSHIPS_KEY, memberships);
  return membership;
}

export function removeOrganizationMember(organizationId: string, actorId: string): boolean {
  const memberships = readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []);
  const idx = memberships.findIndex(
    (m) => m.organizationId === organizationId && m.actorId === actorId
  );
  if (idx === -1) return false;
  memberships.splice(idx, 1);
  writeJson(ORG_MEMBERSHIPS_KEY, memberships);
  return true;
}

export function updateOrganizationMemberRole(
  organizationId: string,
  actorId: string,
  role: ActorRole
): OrganizationMembership | undefined {
  const memberships = readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []);
  const membership = memberships.find(
    (m) => m.organizationId === organizationId && m.actorId === actorId
  );
  if (!membership) return undefined;
  membership.role = role;
  writeJson(ORG_MEMBERSHIPS_KEY, memberships);
  return membership;
}

// ---------------------------------------------------------------------------
// Mandate service
// ---------------------------------------------------------------------------

const MANDATES_KEY = 'aptlabs:mandates';

export function listMandates(organizationId?: string): Mandate[] {
  const mandates = readJson<Mandate[]>(MANDATES_KEY, []);
  if (organizationId) {
    return mandates.filter((m) => m.organizationId === organizationId);
  }
  return mandates;
}

export function getMandate(mandateId: string): Mandate | undefined {
  return listMandates().find((m) => m.id === mandateId);
}

export function getActiveMandatesForActor(organizationId: string, actorId: string): Mandate[] {
  const now = new Date().toISOString();
  return listMandates(organizationId).filter((m) =>
    m.actorId === actorId &&
    m.active &&
    m.effectiveAt <= now &&
    (!m.expiresAt || m.expiresAt >= now)
  );
}

export function createMandate(input: CreateMandateInput): Mandate {
  const mandates = readJson<Mandate[]>(MANDATES_KEY, []);
  const now = nowIso();
  const mandate: Mandate = {
    id: createId('mandate'),
    organizationId: input.organizationId,
    actorId: input.actorId,
    accountId: input.accountId,
    scope: input.scope,
    customScope: input.customScope,
    effectiveAt: input.effectiveAt,
    expiresAt: input.expiresAt,
    grantedBy: input.grantedBy,
    active: true,
    reason: input.reason,
    createdAt: now,
    updatedAt: now,
    updatedBy: input.grantedBy,
    version: 1,
  };
  mandates.push(mandate);
  writeJson(MANDATES_KEY, mandates);

  // Add mandate to organization membership
  const orgMemberships = readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []);
  const orgMem = orgMemberships.find(
    (m) => m.organizationId === input.organizationId && m.actorId === input.actorId
  );
  if (orgMem) {
    orgMem.mandateIds = orgMem.mandateIds ?? [];
    orgMem.mandateIds.push(mandate.id);
    writeJson(ORG_MEMBERSHIPS_KEY, orgMemberships);
  }

  return mandate;
}

export function revokeMandate(mandateId: string, revokedBy: string): Mandate | undefined {
  const mandates = readJson<Mandate[]>(MANDATES_KEY, []);
  const idx = mandates.findIndex((m) => m.id === mandateId);
  if (idx === -1) return undefined;

  const mandate = mandates[idx];
  mandate.active = false;
  mandate.updatedAt = nowIso();
  mandate.updatedBy = revokedBy;
  mandate.version += 1;
  writeJson(MANDATES_KEY, mandates);

  // Remove from organization membership
  const orgMemberships = readJson<OrganizationMembership[]>(ORG_MEMBERSHIPS_KEY, []);
  const orgMem = orgMemberships.find(
    (m) => m.organizationId === mandate.organizationId && m.actorId === mandate.actorId
  );
  if (orgMem && orgMem.mandateIds) {
    orgMem.mandateIds = orgMem.mandateIds.filter((id) => id !== mandateId);
    writeJson(ORG_MEMBERSHIPS_KEY, orgMemberships);
  }

  return mandate;
}

// ---------------------------------------------------------------------------
// Workspace Context resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the workspace context for an account in an organization.
 * Combines membership role, active mandates, and derived permissions.
 */
export function resolveWorkspaceContext(
  accountId: string,
  organizationId: string
): WorkspaceContext | null {
  const actor = getPrimaryActorForAccount(accountId);
  if (!actor) return null;

  // Check organization membership
  const orgMembership = getOrganizationMembership(organizationId, actor.id);
  if (!orgMembership) return null;

  // Get active mandates
  const activeMandates = getActiveMandatesForActor(organizationId, actor.id);

  // Derive effective permissions from role + mandates
  const effectivePermissions = deriveEffectivePermissions(orgMembership.role, activeMandates);

  return {
    organizationId,
    actorId: actor.id,
    effectivePermissions,
    activeMandates,
  };
}

function deriveEffectivePermissions(role: ActorRole, mandates: Mandate[]): string[] {
  const basePermissions = ACTOR_ROLE_PERMISSIONS[role] ?? [];
  const mandatePermissions = mandates.flatMap((m) => {
    const scope = m.scope;
    if (typeof scope === 'string' && scope !== 'custom') {
      return [scope];
    }
    if (scope === 'custom' && m.customScope) {
      return Object.keys(m.customScope);
    }
    return [];
  });
  return [...new Set([...basePermissions, ...mandatePermissions])];
}


