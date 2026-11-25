import { and, eq, isNull } from 'drizzle-orm';
import { isAuthorizedForOrganization, type AccountId, type OrganizationId, type PersonId, type ProtectedAction } from '../../libs/domain/src/identity-contracts';
import { db } from './db/client';
import { aptPersons, organizationMemberships } from './db/schema';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Membership = { personId: string; organizationId: string; role: string };

/** Authorizes from current server-resolved account and keeps the protected access in one serializable transaction. */
export async function withOrganizationAuthorization<T>(
  authUserId: string,
  organizationId: string,
  action: ProtectedAction,
  work: (tx: Transaction, membership: Membership) => Promise<T>,
): Promise<{ authorized: false } | { authorized: true; value: T }> {
  return db.transaction(async (tx) => {
    const [membership] = await tx
      .select({ id: organizationMemberships.id, personId: aptPersons.id, organizationId: organizationMemberships.organizationId, role: organizationMemberships.role, grantedAt: organizationMemberships.grantedAt })
      .from(organizationMemberships)
      .innerJoin(aptPersons, eq(aptPersons.id, organizationMemberships.personId))
      .where(and(
        eq(aptPersons.authUserId, authUserId),
        eq(organizationMemberships.organizationId, organizationId),
        isNull(organizationMemberships.revokedAt),
      ))
      .limit(1);

    if (!membership || !isAuthorizedForOrganization({
      principal: { personId: membership.personId as PersonId, accountId: authUserId as AccountId },
      organizationId: membership.organizationId as OrganizationId,
      action,
    }, [{
      id: membership.id as never,
      personId: membership.personId as PersonId,
      organizationId: membership.organizationId as OrganizationId,
      role: membership.role as 'owner' | 'administrator' | 'manager' | 'member' | 'viewer',
      status: 'active',
      grantedAt: membership.grantedAt.toISOString(),
      revokedAt: null,
    }])) return { authorized: false as const };
    const value = await work(tx, membership);
    return { authorized: true as const, value };
  }, { isolationLevel: 'serializable' });
}
