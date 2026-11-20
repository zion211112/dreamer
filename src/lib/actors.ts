/**
 * APT-LABS — Multi-Actor model (Gate 1 — Foundations)
 *
 * One authenticated account may participate in multiple Actors. Actors are
 * the organisational containers (Person, Company, Institution, Crew, etc.)
 * through which productive capacity is registered, discovered, and coordinated.
 *
 * Demo mode: browser-localStorage. Production: Supabase (env vars set).
 */


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActorType =
  | 'individual'
  | 'company'
  | 'enterprise'
  | 'startup'
  | 'institution'
  | 'governmentUnit'
  | 'university'
  | 'school'
  | 'researchLab'
  | 'cooperative'
  | 'communityOrganisation'
  | 'ngo'
  | 'crew'
  | 'consortium'
  | 'other';

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  individual: 'Individual',
  company: 'Company',
  enterprise: 'Enterprise',
  startup: 'Startup',
  institution: 'Institution',
  governmentUnit: 'Government Unit',
  university: 'University',
  school: 'School',
  researchLab: 'Research Laboratory',
  cooperative: 'Cooperative',
  communityOrganisation: 'Community Organisation',
  ngo: 'Non-governmental Organisation',
  crew: 'Crew / Collective',
  consortium: 'Project Consortium',
  other: 'Other',
};

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
