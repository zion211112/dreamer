import { describe, expect, it } from 'vitest';
import { isAuthorizedForOrganization, type TenantMembership, type TenantAuthorization } from '@apt-labs/domain';

const request: TenantAuthorization = {
  principal: { personId: 'person-a' as never, accountId: 'account-a' as never },
  organizationId: 'org-a' as never,
  action: 'opportunity:publish',
};

const activeMembership: TenantMembership = {
  id: 'membership-a' as never,
  personId: 'person-a' as never,
  organizationId: 'org-a' as never,
  role: 'manager',
  status: 'active',
  grantedAt: '2026-01-01T00:00:00.000Z',
  revokedAt: null,
};

describe('provider-independent tenant authorization', () => {
  it('allows a member only within their tenant and role scope', () => {
    expect(isAuthorizedForOrganization(request, [activeMembership])).toBe(true);
    expect(isAuthorizedForOrganization({ ...request, organizationId: 'org-b' as never }, [activeMembership])).toBe(false);
    expect(isAuthorizedForOrganization({ ...request, action: 'organization:manage' }, [activeMembership])).toBe(false);
  });

  it('denies revoked membership and mismatched canonical person IDs', () => {
    expect(isAuthorizedForOrganization(request, [{ ...activeMembership, status: 'revoked', revokedAt: '2026-02-01T00:00:00.000Z' }])).toBe(false);
    expect(isAuthorizedForOrganization({ ...request, principal: { ...request.principal, personId: 'person-b' as never } }, [activeMembership])).toBe(false);
  });
});
