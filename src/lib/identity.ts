/**
 * APT-LABS — Identity & Account Flows (Gate 1 — Foundations)
 *
 * An account's identity is a versioned, provenance-carrying record in its own
 * store (not the generic record envelope, because account operations have
 * distinct, meaningful audit actions: register, verify, profile.update,
 * recovery). The store is the platform's source of truth for *verification
 * state* and *account settings* — things the platform owns and displays,
 * regardless of which credential backend actually holds the password.
 *
 * Demo ⇄ production duality:
 * - Verification is *recorded* here. Who flips the flag differs per mode —
 *   Supabase's email-confirmation callback in production, an explicit
 *   `markIdentityVerified` (trusted principal) in demo. The record is the same.
 * - Recovery is a real, one-time, expiring token lifecycle, owned here. The
 *   token is validated and consumed by `completeRecovery`; the credential
 *   backend the caller uses applies the new secret. No fake email is sent in
 *   demo mode — the token is returned so the caller (or a test) can complete
 *   the flow.
 */

import { logAuditEvent } from './audit';
import { canPerform, requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IdentitySettings {
  displayName: string;
  organizationName?: string | null;
  location?: string | null;
  serviceArea?: string[];
}

export interface IdentityRecord {
  id: string;
  accountId: string;
  email: string;
  /** Whether the account's contact has been verified. */
  verified: boolean;
  settings: IdentitySettings;
  version: number;
  /** Id of the identity version this one supersedes (corrections, never rewrites). */
  supersedesId: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Organization-scoped Identity
// ---------------------------------------------------------------------------

export interface OrganizationIdentitySettings {
  /** Display name within this organization. */
  displayName: string;
  /** Role-specific title (e.g., "Lead Engineer", "Project Coordinator"). */
  title?: string;
  /** Department or unit within the organization. */
  department?: string;
  /** Cost center or budget code. */
  costCenter?: string;
  /** Location within the organization (site, office, region). */
  location?: string;
  /** Skills or capabilities relevant in this org context. */
  skills?: string[];
  /** Preferred contact method within org. */
  contactPreference?: 'email' | 'internal' | 'phone';
}

export interface OrganizationIdentityRecord {
  id: string;
  /** The platform-level identity this is scoped from. */
  identityId: string;
  /** The organization this identity is scoped to. */
  organizationId: string;
  /** The actor (person/crew) within the organization. */
  actorId: string;
  /** Organization-specific settings. */
  settings: OrganizationIdentitySettings;
  /** Whether this organization identity is active. */
  active: boolean;
  version: number;
  supersedesId: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationIdentityInput {
  identityId: string;
  organizationId: string;
  actorId: string;
  settings: OrganizationIdentitySettings;
  createdBy: string;
}

export interface UpdateOrganizationIdentityInput {
  settings?: Partial<OrganizationIdentitySettings>;
  active?: boolean;
  updatedBy: string;
}

export interface RegisterIdentityInput {
  accountId: string;
  email: string;
  settings: IdentitySettings;
  createdBy: string;
}

export interface RecoveryToken {
  id: string;
  accountId: string;
  /** Opaque one-time value the holder presents to complete recovery. */
  token: string;
  expiresAt: string;
  consumed: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const IDENTITIES_KEY = 'aptlabs:identities';
const RECOVERY_KEY = 'aptlabs:recovery-tokens';
const ORG_IDENTITIES_KEY = 'aptlabs:org-identities';

function readIdentities(): IdentityRecord[] {
  return readJson<IdentityRecord[]>(IDENTITIES_KEY, []);
}
function writeIdentities(records: IdentityRecord[]): void {
  writeJson(IDENTITIES_KEY, records);
}

function readRecovery(): RecoveryToken[] {
  return readJson<RecoveryToken[]>(RECOVERY_KEY, []);
}
function writeRecovery(tokens: RecoveryToken[]): void {
  writeJson(RECOVERY_KEY, tokens);
}

function readOrgIdentities(): OrganizationIdentityRecord[] {
  return readJson<OrganizationIdentityRecord[]>(ORG_IDENTITIES_KEY, []);
}
function writeOrgIdentities(records: OrganizationIdentityRecord[]): void {
  writeJson(ORG_IDENTITIES_KEY, records);
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function createRecoveryTokenValue(): string {
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `recovery-${Date.now().toString(36)}-${rand()}-${rand()}`;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Create the identity record for a newly-registered account. Gated by
 * `actor:write` when an `AuthzContext` is supplied (registration is normally
 * driven by the auth layer, which passes no context). Logs `account.register`.
 */
export function registerIdentity(
  input: RegisterIdentityInput & { authz?: AuthzContext },
): IdentityRecord {
  if (input.authz) {
    requirePermission(input.authz, 'actor:write');
  }

  const identities = readIdentities();
  const now = nowIso();
  const record: IdentityRecord = {
    id: createId('ident'),
    accountId: input.accountId,
    email: input.email,
    verified: false,
    settings: { ...input.settings },
    version: 1,
    supersedesId: null,
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  identities.push(record);
  writeIdentities(identities);

  logAuditEvent({
    accountId: input.accountId,
    actorId: null,
    action: 'account.register',
    resourceType: 'identity',
    resourceId: record.id,
    details: { email: input.email },
  });

  return record;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

/**
 * Mark an identity verified — an attributable, version-bumping transition.
 * Only a trusted principal (`record:admin`, e.g. the platform or Supabase's
 * confirmation callback) may do this. Logs `account.verify`.
 */
export function markIdentityVerified(
  id: string,
  verifiedBy: string,
  authz?: AuthzContext,
): IdentityRecord | undefined {
  if (authz) {
    requirePermission(authz, 'record:admin');
  }

  const identities = readIdentities();
  const idx = identities.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const record = identities[idx];
  if (record.verified) return record;

  const now = nowIso();
  record.verified = true;
  record.version += 1;
  record.updatedBy = verifiedBy;
  record.updatedAt = now;
  writeIdentities(identities);

  logAuditEvent({
    accountId: record.accountId,
    actorId: null,
    action: 'account.verify',
    resourceType: 'identity',
    resourceId: record.id,
    details: { version: record.version },
  });

  return record;
}

// ---------------------------------------------------------------------------
// Settings (account self-service or admin)
// ---------------------------------------------------------------------------

/**
 * Update account settings. Self-service rule: the caller may edit *their own*
 * identity (`updatedBy === identity.accountId`), or hold `record:admin` to edit
 * any. Version-bumping and auditable. Logs `account.profile.update`.
 */
export function updateIdentitySettings(
  id: string,
  updates: Partial<IdentitySettings>,
  updatedBy: string,
  authz?: AuthzContext,
): IdentityRecord | undefined {
  const identities = readIdentities();
  const idx = identities.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const record = identities[idx];

  if (authz) {
    const isAdmin = canPerform(authz, 'record:admin');
    const isSelf = authz.accountId === record.accountId;
    if (!isAdmin && !isSelf) {
      requirePermission(authz, 'record:admin'); // throws AUTHZ_DENIED
    }
  } else {
    if (updatedBy !== record.accountId) {
      const err = new Error(
        `Authorization failed: account ${updatedBy} may not edit identity ${record.accountId}`,
      );
      (err as Error & { code?: string }).code = 'AUTHZ_DENIED';
      throw err;
    }
  }

  const now = nowIso();
  record.settings = { ...record.settings, ...updates };
  record.version += 1;
  record.updatedBy = updatedBy;
  record.updatedAt = now;
  writeIdentities(identities);

  logAuditEvent({
    accountId: record.accountId,
    actorId: null,
    action: 'account.profile.update',
    resourceType: 'identity',
    resourceId: record.id,
    details: { version: record.version, fields: Object.keys(updates) },
  });

  return record;
}

// ---------------------------------------------------------------------------
// Recovery (one-time, expiring tokens)
// ---------------------------------------------------------------------------

/**
 * Request a recovery token for an account. Self-service: anyone who can reach
 * their own account may request one (the credential backend gates the actual
 * reset). Returns the token so the caller can deliver it however the mode
 * requires (in demo it is read directly; in production Supabase emails it).
 * Logs `account.recovery` {phase:'request'}.
 */
export function requestRecovery(
  input: { accountId: string; requestedBy: string; ttlMs?: number },
): RecoveryToken {
  const tokens = readRecovery();
  const now = nowIso();
  const ttl = input.ttlMs ?? 30 * 60 * 1000; // 30 minutes default

  const token: RecoveryToken = {
    id: createId('recovery'),
    accountId: input.accountId,
    token: createRecoveryTokenValue(),
    expiresAt: new Date(Date.parse(now) + ttl).toISOString(),
    consumed: false,
    createdAt: now,
  };

  tokens.push(token);
  writeRecovery(tokens);

  logAuditEvent({
    accountId: input.accountId,
    actorId: null,
    action: 'account.recovery',
    resourceType: 'identity',
    resourceId: input.accountId,
    details: { phase: 'request', tokenId: token.id },
  });

  return token;
}

/**
 * Validate and consume a recovery token. Succeeds only if the token exists, is
 * not yet consumed, and has not expired. On success the token is marked
 * consumed (one-time) and the flow is auditable. Returns the account the token
 * belongs to; the credential backend applies the new secret. Logs
 * `account.recovery` {phase:'complete'}.
 */
export function completeRecovery(
  tokenValue: string,
): { accountId: string; token: RecoveryToken } {
  const tokens = readRecovery();
  const idx = tokens.findIndex((t) => t.token === tokenValue);
  if (idx === -1) throw new Error('Recovery token not found');

  const token = tokens[idx];
  if (token.consumed) throw new Error('Recovery token already used');
  if (Date.parse(token.expiresAt) < Date.now()) {
    throw new Error('Recovery token expired');
  }

  token.consumed = true;
  writeRecovery(tokens);

  logAuditEvent({
    accountId: token.accountId,
    actorId: null,
    action: 'account.recovery',
    resourceType: 'identity',
    resourceId: token.accountId,
    details: { phase: 'complete', tokenId: token.id },
  });

  return { accountId: token.accountId, token };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function getIdentity(id: string): IdentityRecord | undefined {
  return readIdentities().find((r) => r.id === id);
}

export function getIdentityByAccount(accountId: string): IdentityRecord | undefined {
  return readIdentities().find((r) => r.accountId === accountId);
}

export function listIdentities(filter?: { verified?: boolean; accountId?: string }): IdentityRecord[] {
  return readIdentities().filter((r) => {
    if (filter?.verified !== undefined && r.verified !== filter.verified) return false;
    if (filter?.accountId && r.accountId !== filter.accountId) return false;
    return true;
  });
}

/** Test-only: clear identities and recovery tokens. */
export function clearIdentities(): void {
  writeIdentities([]);
  writeRecovery([]);
  writeOrgIdentities([]);
}

// ---------------------------------------------------------------------------
// Organization Identity service
// ---------------------------------------------------------------------------

/**
 * Create an organization-scoped identity for an actor within an organization.
 * This extends the platform identity with org-specific context.
 */
export function createOrganizationIdentity(
  input: CreateOrganizationIdentityInput,
  authz?: AuthzContext
): OrganizationIdentityRecord {
  if (authz) {
    requirePermission(authz, 'actor:write');
  }

  const orgIdentities = readOrgIdentities();
  const now = nowIso();
  const record: OrganizationIdentityRecord = {
    id: createId('org-ident'),
    identityId: input.identityId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    settings: { ...input.settings },
    active: true,
    version: 1,
    supersedesId: null,
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  orgIdentities.push(record);
  writeOrgIdentities(orgIdentities);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.actorId,
    action: 'organization.identity.create',
    resourceType: 'organizationIdentity',
    resourceId: record.id,
    details: { organizationId: input.organizationId, actorId: input.actorId },
  });

  return record;
}

/**
 * Get an organization identity by ID.
 */
export function getOrganizationIdentity(id: string): OrganizationIdentityRecord | undefined {
  return readOrgIdentities().find((r) => r.id === id);
}

/**
 * Get the organization identity for a specific actor in an organization.
 */
export function getOrganizationIdentityByActor(organizationId: string, actorId: string): OrganizationIdentityRecord | undefined {
  return readOrgIdentities().find(
    (r) => r.organizationId === organizationId && r.actorId === actorId && r.active
  );
}

/**
 * Get all organization identities for an organization.
 */
export function listOrganizationIdentities(organizationId: string, activeOnly = true): OrganizationIdentityRecord[] {
  return readOrgIdentities().filter((r) => {
    if (r.organizationId !== organizationId) return false;
    if (activeOnly && !r.active) return false;
    return true;
  });
}

/**
 * Update an organization identity.
 */
export function updateOrganizationIdentity(
  id: string,
  input: UpdateOrganizationIdentityInput,
  authz?: AuthzContext
): OrganizationIdentityRecord | undefined {
  if (authz) {
    requirePermission(authz, 'actor:write');
  }

  const orgIdentities = readOrgIdentities();
  const idx = orgIdentities.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const record = orgIdentities[idx];
  const now = nowIso();

  if (input.settings) {
    record.settings = { ...record.settings, ...input.settings };
  }
  if (input.active !== undefined) {
    record.active = input.active;
  }

  record.version += 1;
  record.updatedBy = input.updatedBy;
  record.updatedAt = now;
  writeOrgIdentities(orgIdentities);

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: record.actorId,
    action: 'organization.identity.update',
    resourceType: 'organizationIdentity',
    resourceId: record.id,
    details: { version: record.version, active: record.active },
  });

  return record;
}

/**
 * Deactivate (soft delete) an organization identity.
 */
export function deactivateOrganizationIdentity(
  id: string,
  deactivatedBy: string,
  authz?: AuthzContext
): OrganizationIdentityRecord | undefined {
  return updateOrganizationIdentity(id, { active: false, updatedBy: deactivatedBy }, authz);
}

/**
 * Get the platform identity linked to an organization identity.
 */
export function getPlatformIdentityForOrgIdentity(orgIdentityId: string): IdentityRecord | undefined {
  const orgIdentity = getOrganizationIdentity(orgIdentityId);
  if (!orgIdentity) return undefined;
  return getIdentity(orgIdentity.identityId);
}

/**
 * Get all organization identities linked to a platform identity.
 */
export function getOrganizationIdentitiesForPlatformIdentity(identityId: string): OrganizationIdentityRecord[] {
  return readOrgIdentities().filter((r) => r.identityId === identityId && r.active);
}
