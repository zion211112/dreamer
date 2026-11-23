/**
 * APT-LABS — Identity & Account Flows (Gate 1 — Foundations)
 *
 * An account's identity is a versioned, provenance-carrying record in its own
 * store (not the generic record envelope, because account operations have
 * distinct, meaningful audit actions: register, verify, profile.update,
 * recovery).
 *
 * Pure domain types only. The Vue monolith's localStorage-backed identity,
 * recovery-token, and organization-identity services were stripped; this
 * module keeps the record contracts so the Angular domain layer can model the
 * same entities without any browser-storage, audit, or permission dependency.
 */

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
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Whether a recovery token is still usable: unconsumed and not past its
 * expiry. Pure — no storage access.
 */
export function isRecoveryTokenUsable(
  token: RecoveryToken,
  nowMs: number = Date.now(),
): boolean {
  return !token.consumed && Date.parse(token.expiresAt) > nowMs;
}
