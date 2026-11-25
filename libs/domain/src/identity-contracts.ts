/** Provider-independent identity and tenancy contracts. No database or auth SDK types. */
export type PersonId = string & { readonly __brand: 'PersonId' };
export type AccountId = string & { readonly __brand: 'AccountId' };
export type OrganizationId = string & { readonly __brand: 'OrganizationId' };
export type MembershipId = string & { readonly __brand: 'MembershipId' };

export type MembershipRole = 'owner' | 'administrator' | 'manager' | 'member' | 'viewer';
export type MembershipStatus = 'active' | 'revoked';
export type ProtectedAction = 'organization:read' | 'organization:manage' | 'opportunity:publish';

export interface AuthenticatedPrincipal {
  /** Stable APT person identifier resolved from a trusted authenticated account. */
  personId: PersonId;
  /** Provider account ID is for identity mapping, never tenant authorization. */
  accountId: AccountId;
}

export interface TenantMembership {
  id: MembershipId;
  personId: PersonId;
  organizationId: OrganizationId;
  role: MembershipRole;
  status: MembershipStatus;
  grantedAt: string;
  revokedAt: string | null;
}

export interface TenantAuthorization {
  principal: AuthenticatedPrincipal;
  organizationId: OrganizationId;
  action: ProtectedAction;
}

const ACTION_ROLES: Record<ProtectedAction, readonly MembershipRole[]> = {
  'organization:read': ['owner', 'administrator', 'manager', 'member', 'viewer'],
  'organization:manage': ['owner', 'administrator'],
  'opportunity:publish': ['owner', 'administrator', 'manager'],
};

/** Check a trusted principal against current membership data; caller must fetch current rows. */
export function isAuthorizedForOrganization(
  request: TenantAuthorization,
  memberships: readonly TenantMembership[],
): boolean {
  return memberships.some((membership) =>
    membership.personId === request.principal.personId &&
    membership.organizationId === request.organizationId &&
    membership.status === 'active' &&
    membership.revokedAt === null &&
    ACTION_ROLES[request.action].includes(membership.role),
  );
}
