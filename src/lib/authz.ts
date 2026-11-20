/**
 * APT-LABS — Authorization layer (Gate 1 — Foundations)
 *
 * Separates authentication (Supabase identifies the user) from authorization
 * (what they may do). Roles are never trusted from the client; all checks are
 * server-side in production, demo-mode in the browser.
 *
 * Platform roles apply across the whole platform. Actor roles apply within a
 * specific Actor (organisation, crew, institution, etc.).
 */

import type { ActorRole } from './actors';

// ---------------------------------------------------------------------------
// Platform roles
// ---------------------------------------------------------------------------

export type PlatformRole =
  | 'public'
  | 'authenticated'
  | 'admin'
  | 'moderator'
  | 'trustAdmin'
  | 'credentialIssuerAdmin';

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  public: 'Public visitor',
  authenticated: 'Authenticated user',
  admin: 'Platform administrator',
  moderator: 'Platform moderator',
  trustAdmin: 'Trust administrator',
  credentialIssuerAdmin: 'Credential issuer administrator',
};

// ---------------------------------------------------------------------------
// Permissions (granular, not just labels)
// ---------------------------------------------------------------------------

export type Permission =
  // Platform-wide
  | 'platform:read:public'
  | 'platform:read:all'
  | 'platform:write:public'
  | 'platform:admin'
  | 'platform:moderate'
  // Actor membership
  | 'actor:read'
  | 'actor:write'
  | 'actor:admin'
  | 'actor:manageMembers'
  | 'actor:manageRoles'
  // Resources / assets
  | 'resource:read'
  | 'resource:write'
  | 'resource:admin'
  // Intentions / opportunities
  | 'intention:read'
  | 'intention:write'
  | 'intention:admin'
  // Commitments
  | 'commitment:read'
  | 'commitment:write'
  | 'commitment:admin'
  // Work / activities
  | 'work:read'
  | 'work:write'
  | 'work:admin'
  | 'work:execute'
  // Records / evidence / knowledge
  | 'record:read'
  | 'record:write'
  | 'record:admin'
  | 'evidence:read'
  | 'evidence:write'
  | 'evidence:admin'
  | 'knowledge:read'
  | 'knowledge:write'
  | 'knowledge:admin'
  // Credentials
  | 'credential:read'
  | 'credential:issue'
  | 'credential:revoke'
  | 'credential:verify'
  // Intelligence / matching
  | 'intelligence:read'
  | 'intelligence:admin'
  // Economic
  | 'economic:read'
  | 'economic:write'
  | 'economic:admin';

// ---------------------------------------------------------------------------
// Role → permission map
// ---------------------------------------------------------------------------

const PLATFORM_PERMISSIONS: Record<PlatformRole, (Permission | '*')[]> = {
  public: ['platform:read:public'],
  // Platform-level defaults only. Actor-scoped access (resource:write, work:*,
  // …) is granted by the account's role inside a selected actor, not by the
  // platform role, so a signed-in user cannot act cross-actor without context.
  authenticated: [
    'platform:read:public',
    'platform:write:public',
  ],
  admin: [
    '*', // all permissions
  ],
  moderator: [
    'platform:read:all',
    'platform:moderate',
    'actor:read',
    'actor:write',
    'resource:read',
    'resource:write',
    'intention:read',
    'intention:write',
    'commitment:read',
    'commitment:write',
    'work:read',
    'work:write',
    'record:read',
    'record:write',
    'evidence:read',
    'evidence:write',
    'knowledge:read',
    'knowledge:write',
    'credential:read',
    'credential:verify',
    'intelligence:read',
    'economic:read',
    'economic:write',
  ],
  trustAdmin: [
    'platform:read:all',
    'actor:read',
    'actor:write',
    'actor:admin',
    'resource:read',
    'resource:write',
    'intention:read',
    'intention:write',
    'commitment:read',
    'commitment:write',
    'record:read',
    'record:write',
    'evidence:read',
    'evidence:write',
    'evidence:admin',
    'knowledge:read',
    'knowledge:write',
    'credential:read',
    'credential:issue',
    'credential:revoke',
    'credential:verify',
    'intelligence:read',
    'economic:read',
    'economic:write',
  ],
  credentialIssuerAdmin: [
    'platform:read:public',
    'actor:read',
    'resource:read',
    'intention:read',
    'commitment:read',
    'work:read',
    'record:read',
    'evidence:read',
    'knowledge:read',
    'credential:read',
    'credential:issue',
    'credential:revoke',
    'credential:verify',
    'intelligence:read',
  ],
};

const ACTOR_ROLE_PERMISSIONS: Record<ActorRole, Permission[]> = {
  owner: [
    'actor:read', 'actor:write', 'actor:admin', 'actor:manageMembers', 'actor:manageRoles',
    'resource:read', 'resource:write', 'resource:admin',
    'intention:read', 'intention:write', 'intention:admin',
    'commitment:read', 'commitment:write', 'commitment:admin',
    'work:read', 'work:write', 'work:admin', 'work:execute',
    'record:read', 'record:write', 'record:admin',
    'evidence:read', 'evidence:write', 'evidence:admin',
    'knowledge:read', 'knowledge:write', 'knowledge:admin',
    'credential:read', 'credential:issue', 'credential:revoke', 'credential:verify',
    'economic:read', 'economic:write', 'economic:admin',
  ],
  administrator: [
    'actor:read', 'actor:write', 'actor:admin', 'actor:manageMembers',
    'resource:read', 'resource:write', 'resource:admin',
    'intention:read', 'intention:write',
    'commitment:read', 'commitment:write',
    'work:read', 'work:write', 'work:execute',
    'record:read', 'record:write',
    'evidence:read', 'evidence:write',
    'knowledge:read', 'knowledge:write',
    'credential:read', 'credential:verify',
    'economic:read', 'economic:write',
  ],
  manager: [
    'actor:read', 'actor:write',
    'resource:read', 'resource:write',
    'intention:read', 'intention:write',
    'commitment:read', 'commitment:write',
    'work:read', 'work:write', 'work:execute',
    'record:read', 'record:write',
    'evidence:read', 'evidence:write',
    'knowledge:read', 'knowledge:write',
    'credential:read', 'credential:verify',
    'economic:read', 'economic:write',
  ],
  member: [
    'actor:read',
    'resource:read', 'resource:write',
    'intention:read', 'intention:write',
    'commitment:read', 'commitment:write',
    'work:read', 'work:write', 'work:execute',
    'record:read', 'record:write',
    'evidence:read', 'evidence:write',
    'knowledge:read', 'knowledge:write',
    'credential:read',
    'economic:read',
  ],
  contributor: [
    'actor:read',
    'resource:read',
    'intention:read',
    'commitment:read',
    'work:read', 'work:write', 'work:execute',
    'record:read', 'record:write',
    'evidence:read', 'evidence:write',
    'knowledge:read',
    'credential:read',
    'economic:read',
  ],
  viewer: [
    'actor:read',
    'resource:read',
    'intention:read',
    'commitment:read',
    'work:read',
    'record:read',
    'evidence:read',
    'knowledge:read',
    'credential:read',
    'economic:read',
  ],
  authorizedRepresentative: [
    'actor:read', 'actor:write',
    'resource:read', 'resource:write',
    'intention:read', 'intention:write',
    'commitment:read', 'commitment:write',
    'work:read', 'work:write', 'work:execute',
    'record:read', 'record:write',
    'evidence:read', 'evidence:write',
    'knowledge:read', 'knowledge:write',
    'credential:read', 'credential:verify',
    'economic:read', 'economic:write',
  ],
};

// ---------------------------------------------------------------------------
// Authorization context
// ---------------------------------------------------------------------------

export interface AuthzContext {
  /** Platform role of the current account. */
  platformRole: PlatformRole;
  /** Account id (email in demo mode, Supabase user id in production). */
  accountId: string | null;
  /** Currently selected Actor id (if any). */
  actorId: string | null;
  /** Role within the currently selected Actor (if any). */
  actorRole: ActorRole | null;
  /** Whether the account is authenticated. */
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// Permission checks
// ---------------------------------------------------------------------------

function platformHasPermission(platformRole: PlatformRole, permission: Permission): boolean {
  const perms = PLATFORM_PERMISSIONS[platformRole];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

function actorRoleHasPermission(actorRole: ActorRole | null, permission: Permission): boolean {
  if (!actorRole) return false;
  const perms = ACTOR_ROLE_PERMISSIONS[actorRole];
  return perms.includes(permission);
}

/**
 * Check whether the authz context permits a given permission.
 *
 * Platform-level permissions (platform:*) are checked against the platform role.
 * Actor-scoped permissions (actor:*, resource:*, etc.) require an actor context
 * and are checked against the actor role.
 */
export function canPerform(ctx: AuthzContext, permission: Permission): boolean {
  if (!ctx.isAuthenticated && permission !== 'platform:read:public') return false;

  // Platform-prefixed permissions are decided by the platform role alone.
  if (permission.startsWith('platform:')) {
    return platformHasPermission(ctx.platformRole, permission);
  }

  // Trusted platform roles act cross-actor: their platform permissions
  // (including the admin '*' wildcard) apply even without a selected actor.
  if (platformHasPermission(ctx.platformRole, permission)) return true;

  // Actor-scoped permissions for everyone else require being inside an actor.
  if (!ctx.actorId || !ctx.actorRole) return false;

  return actorRoleHasPermission(ctx.actorRole, permission);
}

/**
 * Check whether the context has access to a specific Actor.
 */
export function canAccessActor(ctx: AuthzContext, actorId: string): boolean {
  if (!ctx.isAuthenticated || !ctx.accountId) return false;
  if (ctx.platformRole === 'admin') return true;
  // In demo mode, check memberships
  return ctx.actorId === actorId || ctx.platformRole === 'moderator' || ctx.platformRole === 'trustAdmin';
}

/**
 * Throw if the context does not permit a permission. Use in route guards
 * and mutation handlers.
 */
export function requirePermission(ctx: AuthzContext, permission: Permission): void {
  if (!canPerform(ctx, permission)) {
    const err = new Error(
      `Authorization failed: account ${ctx.accountId ?? '(unauthenticated)'} ` +
        `lacks permission "${permission}"`
    );
    (err as Error & { code?: string }).code = 'AUTHZ_DENIED';
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Demo-mode helpers (browser)
// ---------------------------------------------------------------------------

/** Build an AuthzContext from demo-mode state. */
export function buildDemoContext(accountId: string | null): AuthzContext {
  const isAuthenticated = Boolean(accountId);
  const platformRole: PlatformRole = isAuthenticated ? 'authenticated' : 'public';
  return {
    platformRole,
    accountId,
    actorId: null,
    actorRole: null,
    isAuthenticated,
  };
}

/** Build an AuthzContext with actor context from demo memberships. */
export function buildDemoContextWithActor(
  accountId: string | null,
  actorId: string | null,
  actorRole: ActorRole | null
): AuthzContext {
  const isAuthenticated = Boolean(accountId);
  const platformRole: PlatformRole = isAuthenticated ? 'authenticated' : 'public';
  return {
    platformRole,
    accountId,
    actorId,
    actorRole,
    isAuthenticated,
  };
}
