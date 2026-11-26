import { Router } from 'express';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { db } from '../db/client';
import { aptPersons, auditEvents, organizationMemberships, organizations, undertakingInterests, undertakingOffers, undertakingParticipants, undertakings, workReports, workReviews, user } from '../db/schema';
import { withOrganizationAuthorization } from '../authorization';
import { isManagingRole, statusAfterClose, workActions, type OrganizationRole, type UndertakingStatus } from '../../../libs/domain/src/undertaking-policy';

type Person = { id: string; name: string };

async function currentPerson(headers: Record<string, string | string[] | undefined>): Promise<Person | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers as never) });
  if (!session) return null;
  const [person] = await db.select({ id: aptPersons.id, name: aptPersons.displayName }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  return person ?? null;
}

/** Undertakings a person may open: everything open, plus what they belong to. */
function visibleWork(personId: string) {
  return sql`(${undertakings.status} = 'open'
    or exists (select 1 from organization_memberships m where m.organization_id = undertakings.organization_id and m.person_id = ${personId} and m.revoked_at is null)
    or exists (select 1 from undertaking_participants p where p.undertaking_id = undertakings.id and p.person_id = ${personId}))`;
}

export function createWorkbenchRouter(): Router {
  const router = Router();

  /**
   * Everything the workbench needs to answer "what should I do next?" in one
   * authorized read, instead of making the browser assemble it from four screens.
   */
  router.get('/workbench', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });

    const memberships = await db.select({ id: organizations.id, name: organizations.name, standing: organizations.standing, role: organizationMemberships.role })
      .from(organizationMemberships)
      .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
      .where(and(eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt)));
    const managedOrganizationIds = memberships.filter((row) => isManagingRole(row.role)).map((row) => row.id);

    const offersToMe = await db.select({
      offerId: undertakingOffers.id,
      undertakingId: undertakingOffers.undertakingId,
      title: undertakings.title,
      organizationName: organizations.name,
      proposal: undertakingOffers.proposal,
      createdAt: undertakingOffers.createdAt,
      issuedByName: aptPersons.displayName,
    }).from(undertakingOffers)
      .innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId))
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.issuedByPersonId))
      .where(and(eq(undertakingOffers.offeredToPersonId, person.id), eq(undertakingOffers.status, 'pending'), sql`${undertakings.status} <> 'closed'`))
      .orderBy(desc(undertakingOffers.createdAt));

    const myWork = await db.select({
      undertakingId: undertakings.id,
      title: undertakings.title,
      scope: undertakings.scope,
      status: undertakings.status,
      organizationId: organizations.id,
      organizationName: organizations.name,
      joinedAt: undertakingParticipants.joinedAt,
    }).from(undertakingParticipants)
      .innerJoin(undertakings, eq(undertakings.id, undertakingParticipants.undertakingId))
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .where(eq(undertakingParticipants.personId, person.id))
      .orderBy(desc(undertakingParticipants.joinedAt));

    const myInterests = await db.select({
      undertakingId: undertakings.id,
      title: undertakings.title,
      status: undertakings.status,
      organizationName: organizations.name,
      message: undertakingInterests.message,
      createdAt: undertakingInterests.createdAt,
    }).from(undertakingInterests)
      .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .where(and(eq(undertakingInterests.personId, person.id), sql`not exists (select 1 from undertaking_participants p where p.undertaking_id = ${undertakingInterests.undertakingId} and p.person_id = ${person.id})`))
      .orderBy(desc(undertakingInterests.createdAt));

    const pendingInterests = managedOrganizationIds.length ? await db.select({
      interestId: undertakingInterests.id,
      undertakingId: undertakings.id,
      title: undertakings.title,
      organizationName: organizations.name,
      personName: aptPersons.displayName,
      message: undertakingInterests.message,
      createdAt: undertakingInterests.createdAt,
    }).from(undertakingInterests)
      .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId))
      .where(and(
        inArray(undertakings.organizationId, managedOrganizationIds),
        sql`${undertakings.status} <> 'closed'`,
        sql`not exists (select 1 from undertaking_offers o where o.interest_id = undertaking_interests.id)`,
        sql`not exists (select 1 from audit_events a where a.subject_id = undertaking_interests.id and a.action = 'undertaking.interest_declined')`,
      ))
      .orderBy(desc(undertakingInterests.createdAt)).limit(50) : [];

    const pendingReports = managedOrganizationIds.length ? await db.select({
      reportId: workReports.id,
      undertakingId: undertakings.id,
      title: undertakings.title,
      organizationName: organizations.name,
      personName: aptPersons.displayName,
      report: workReports.report,
      createdAt: workReports.createdAt,
    }).from(workReports)
      .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId))
      .where(and(
        inArray(undertakings.organizationId, managedOrganizationIds),
        sql`${workReports.authorPersonId} <> ${person.id}`,
        sql`not exists (select 1 from work_reviews r where r.report_id = work_reports.id)`,
      ))
      .orderBy(desc(workReports.createdAt)).limit(50) : [];

    const organizationWork = managedOrganizationIds.length ? await db.select({
      id: undertakings.id,
      title: undertakings.title,
      status: undertakings.status,
      organizationId: undertakings.organizationId,
      organizationName: organizations.name,
      createdAt: undertakings.createdAt,
      interestCount: sql<number>`(select count(*) from undertaking_interests i where i.undertaking_id = undertakings.id)`,
      offerCount: sql<number>`(select count(*) from undertaking_offers o where o.undertaking_id = undertakings.id)`,
      participantCount: sql<number>`(select count(*) from undertaking_participants p where p.undertaking_id = undertakings.id)`,
      reportCount: sql<number>`(select count(*) from work_reports r where r.undertaking_id = undertakings.id)`,
    }).from(undertakings)
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .where(inArray(undertakings.organizationId, managedOrganizationIds))
      .orderBy(desc(undertakings.createdAt)).limit(100) : [];

    const needsYou = [
      ...pendingInterests.map((row) => ({ kind: 'interest' as const, ...row })),
      ...pendingReports.map((row) => ({ kind: 'report' as const, ...row })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);

    return res.json({
      data: {
        person,
        organizations: memberships,
        counts: {
          needsYou: needsYou.length,
          offersToYou: offersToMe.length,
          myWork: myWork.length,
          myInterests: myInterests.length,
        },
        needsYou,
        offersToYou: offersToMe,
        myWork,
        myInterests,
        organizationWork,
      },
    });
  });

  /** Visible work, searchable and filterable, with this person's position on each row. */
  router.get('/undertakings', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });

    const q = typeof req.query['q'] === 'string' ? req.query['q'].trim().slice(0, 120) : '';
    const requestedStatus = typeof req.query['status'] === 'string' ? req.query['status'] : '';
    const status = ['open', 'active', 'closed'].includes(requestedStatus) ? requestedStatus : null;

    const filters = [visibleWork(person.id)];
    if (status) filters.push(eq(undertakings.status, status));
    if (q) {
      const like = `%${q.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
      filters.push(sql`(${undertakings.title} ilike ${like} or ${undertakings.scope} ilike ${like} or ${organizations.name} ilike ${like})`);
    }

    const rows = await db.select({
      id: undertakings.id,
      organizationId: undertakings.organizationId,
      organizationName: organizations.name,
      organizationStanding: organizations.standing,
      title: undertakings.title,
      scope: undertakings.scope,
      status: undertakings.status,
      createdAt: undertakings.createdAt,
    }).from(undertakings)
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .where(and(...filters))
      .orderBy(desc(undertakings.createdAt)).limit(100);

    const ids = rows.map((row) => row.id);
    const [memberships, interests, participations, offers, interestCounts, reportCounts] = ids.length ? await Promise.all([
      db.select({ organizationId: organizationMemberships.organizationId, role: organizationMemberships.role }).from(organizationMemberships).where(and(eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt))),
      db.select({ undertakingId: undertakingInterests.undertakingId }).from(undertakingInterests).where(and(eq(undertakingInterests.personId, person.id), inArray(undertakingInterests.undertakingId, ids))),
      db.select({ undertakingId: undertakingParticipants.undertakingId }).from(undertakingParticipants).where(and(eq(undertakingParticipants.personId, person.id), inArray(undertakingParticipants.undertakingId, ids))),
      db.select({ undertakingId: undertakingOffers.undertakingId, id: undertakingOffers.id }).from(undertakingOffers).where(and(eq(undertakingOffers.offeredToPersonId, person.id), eq(undertakingOffers.status, 'pending'), inArray(undertakingOffers.undertakingId, ids))),
      db.select({ undertakingId: undertakingInterests.undertakingId, count: sql<number>`count(*)` }).from(undertakingInterests).where(inArray(undertakingInterests.undertakingId, ids)).groupBy(undertakingInterests.undertakingId),
      db.select({ undertakingId: workReports.undertakingId, count: sql<number>`count(*)` }).from(workReports).where(inArray(workReports.undertakingId, ids)).groupBy(workReports.undertakingId),
    ]) : [[], [], [], [], [], []];

    const roleByOrganization = new Map(memberships.map((row) => [row.organizationId, row.role]));
    const interestIds = new Set(interests.map((row) => row.undertakingId));
    const participantIds = new Set(participations.map((row) => row.undertakingId));
    const pendingOfferByUndertaking = new Map(offers.map((row) => [row.undertakingId, row.id]));
    const interestCountByUndertaking = new Map(interestCounts.map((row) => [row.undertakingId, Number(row.count)]));
    const reportCountByUndertaking = new Map(reportCounts.map((row) => [row.undertakingId, Number(row.count)]));

    return res.json({
      data: rows.map((row) => {
        const role = (roleByOrganization.get(row.organizationId) ?? null) as OrganizationRole | null;
        const position = {
          role,
          status: row.status as UndertakingStatus,
          isParticipant: participantIds.has(row.id),
          hasInterest: interestIds.has(row.id),
          pendingOfferId: pendingOfferByUndertaking.get(row.id) ?? null,
        };
        return {
          ...row,
          isMember: Boolean(role),
          isParticipant: position.isParticipant,
          hasInterest: position.hasInterest,
          pendingOfferId: position.pendingOfferId,
          interestCount: interestCountByUndertaking.get(row.id) ?? 0,
          reportCount: reportCountByUndertaking.get(row.id) ?? 0,
          actions: workActions(position),
        };
      }),
    });
  });

  /** One undertaking with its full history, filtered to what this person may see. */
  router.get('/undertakings/:undertakingId', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });

    const [record] = await db.select({
      id: undertakings.id,
      organizationId: undertakings.organizationId,
      organizationName: organizations.name,
      organizationStanding: organizations.standing,
      title: undertakings.title,
      scope: undertakings.scope,
      status: undertakings.status,
      createdAt: undertakings.createdAt,
      createdByPersonId: undertakings.createdByPersonId,
      createdByName: aptPersons.displayName,
    }).from(undertakings)
      .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
      .innerJoin(aptPersons, eq(aptPersons.id, undertakings.createdByPersonId))
      .where(eq(undertakings.id, req.params['undertakingId'])).limit(1);
    if (!record) return res.status(404).json({ error: 'not_found' });

    const [membership] = await db.select({ role: organizationMemberships.role }).from(organizationMemberships)
      .where(and(eq(organizationMemberships.organizationId, record.organizationId), eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt))).limit(1);
    const [participation] = await db.select({ id: undertakingParticipants.id }).from(undertakingParticipants)
      .where(and(eq(undertakingParticipants.undertakingId, record.id), eq(undertakingParticipants.personId, person.id))).limit(1);
    const role = (membership?.role ?? null) as OrganizationRole | null;
    const isMember = Boolean(membership);
    const isParticipant = Boolean(participation);
    if (!isMember && !isParticipant && record.status !== 'open') return res.status(403).json({ error: 'forbidden' });

    const [ownInterest] = await db.select({ id: undertakingInterests.id }).from(undertakingInterests)
      .where(and(eq(undertakingInterests.undertakingId, record.id), eq(undertakingInterests.personId, person.id))).limit(1);
    const [pendingOffer] = await db.select({ id: undertakingOffers.id, proposal: undertakingOffers.proposal, issuedByName: aptPersons.displayName })
      .from(undertakingOffers).innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.issuedByPersonId))
      .where(and(eq(undertakingOffers.undertakingId, record.id), eq(undertakingOffers.offeredToPersonId, person.id), eq(undertakingOffers.status, 'pending'))).limit(1);

    const actions = workActions({
      role,
      status: record.status as UndertakingStatus,
      isParticipant,
      hasInterest: Boolean(ownInterest),
      pendingOfferId: pendingOffer?.id ?? null,
    });

    const interests = isMember ? await db.select({
      id: undertakingInterests.id,
      personId: undertakingInterests.personId,
      personName: aptPersons.displayName,
      message: undertakingInterests.message,
      createdAt: undertakingInterests.createdAt,
      declined: sql<boolean>`exists(select 1 from audit_events a where a.subject_id = undertaking_interests.id and a.action = 'undertaking.interest_declined')`,
    })
      .from(undertakingInterests).innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId))
      .where(eq(undertakingInterests.undertakingId, record.id)).orderBy(desc(undertakingInterests.createdAt)) : [];

    const offers = await db.select({
      id: undertakingOffers.id,
      offeredToPersonId: undertakingOffers.offeredToPersonId,
      offeredToPersonName: sql<string>`(select display_name from apt_persons p where p.id = ${undertakingOffers.offeredToPersonId})`,
      issuedByName: aptPersons.displayName,
      proposal: undertakingOffers.proposal,
      status: undertakingOffers.status,
      createdAt: undertakingOffers.createdAt,
      decidedAt: undertakingOffers.decidedAt,
    }).from(undertakingOffers).innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.issuedByPersonId))
      .where(and(eq(undertakingOffers.undertakingId, record.id), isMember ? sql`true` : eq(undertakingOffers.offeredToPersonId, person.id)))
      .orderBy(desc(undertakingOffers.createdAt));

    const participants = isMember || isParticipant ? await db.select({ personId: undertakingParticipants.personId, name: aptPersons.displayName, joinedAt: undertakingParticipants.joinedAt })
      .from(undertakingParticipants).innerJoin(aptPersons, eq(aptPersons.id, undertakingParticipants.personId))
      .where(eq(undertakingParticipants.undertakingId, record.id)).orderBy(undertakingParticipants.joinedAt) : [];

    const reports = isMember || isParticipant ? await db.select({ id: workReports.id, authorPersonId: workReports.authorPersonId, authorName: aptPersons.displayName, report: workReports.report, createdAt: workReports.createdAt })
      .from(workReports).innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId))
      .where(eq(workReports.undertakingId, record.id)).orderBy(desc(workReports.createdAt)) : [];
    const reportIds = reports.map((report) => report.id);
    const reviews = reportIds.length ? await db.select({ id: workReviews.id, reportId: workReviews.reportId, reviewerName: aptPersons.displayName, decision: workReviews.decision, rationale: workReviews.rationale, createdAt: workReviews.createdAt })
      .from(workReviews).innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId))
      .where(inArray(workReviews.reportId, reportIds)) : [];

    const events = isMember || isParticipant ? await db.select({ id: auditEvents.id, actorName: aptPersons.displayName, action: auditEvents.action, subjectType: auditEvents.subjectType, subjectId: auditEvents.subjectId, occurredAt: auditEvents.occurredAt })
      .from(auditEvents).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId))
      .where(and(
        eq(auditEvents.organizationId, record.organizationId),
        sql`(${auditEvents.subjectId} = ${record.id}
          or exists (select 1 from undertaking_interests i where i.id = ${auditEvents.subjectId} and i.undertaking_id = ${record.id})
          or exists (select 1 from undertaking_offers o where o.id = ${auditEvents.subjectId} and o.undertaking_id = ${record.id})
          or exists (select 1 from work_reports r where r.id = ${auditEvents.subjectId} and r.undertaking_id = ${record.id}))`,
      ))
      .orderBy(desc(auditEvents.occurredAt)).limit(100) : [];

    return res.json({
      data: {
        ...record,
        position: {
          role,
          isMember,
          isParticipant,
          hasInterest: Boolean(ownInterest),
          pendingOffer: pendingOffer ? { id: pendingOffer.id, proposal: pendingOffer.proposal, issuedByName: pendingOffer.issuedByName } : null,
          canReview: isManagingRole(role),
        },
        actions,
        interests,
        offers,
        participants,
        reports: reports.map((report) => ({ ...report, review: reviews.find((review) => review.reportId === report.id) ?? null })),
        events,
      },
    });
  });

  /** Closing is a decision by the owning organization, not a participant. */
  router.post('/organizations/:organizationId/undertakings/:undertakingId/close', async (req, res) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ error: 'unauthenticated' });
    const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:decide', async (tx, membership) => {
      const [record] = await tx.select({ id: undertakings.id, status: undertakings.status }).from(undertakings)
        .where(and(eq(undertakings.id, req.params['undertakingId']), eq(undertakings.organizationId, membership.organizationId))).limit(1);
      if (!record) return { kind: 'not_found' as const };
      const next = statusAfterClose(record.status as UndertakingStatus);
      if (!next) return { kind: 'already_closed' as const };
      await tx.update(undertakings).set({ status: next }).where(eq(undertakings.id, record.id));
      await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: 'undertaking.closed', subjectType: 'undertaking', subjectId: record.id });
      return { kind: 'closed' as const };
    });
    if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
    if (result.value.kind === 'not_found') return res.status(404).json({ error: 'undertaking_not_found' });
    if (result.value.kind === 'already_closed') return res.status(409).json({ error: 'undertaking_already_closed' });
    return res.json({ data: { status: 'closed' } });
  });

  /**
   * Declining an interest is recorded, not erased: the audit trail is the
   * source of truth, and the message stays readable for the organization.
   */
  router.post('/organizations/:organizationId/undertakings/:undertakingId/interests/:interestId/decline', async (req, res) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ error: 'unauthenticated' });
    const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:decide', async (tx, membership) => {
      const [interest] = await tx.select({ id: undertakingInterests.id, personId: undertakingInterests.personId }).from(undertakingInterests)
        .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
        .where(and(
          eq(undertakingInterests.id, req.params['interestId']),
          eq(undertakingInterests.undertakingId, req.params['undertakingId']),
          eq(undertakings.organizationId, membership.organizationId),
        )).limit(1);
      if (!interest) return { kind: 'not_found' as const };
      const [offer] = await tx.select({ id: undertakingOffers.id }).from(undertakingOffers).where(eq(undertakingOffers.interestId, interest.id)).limit(1);
      if (offer) return { kind: 'offer_exists' as const };
      const [already] = await tx.select({ id: auditEvents.id }).from(auditEvents).where(and(eq(auditEvents.action, 'undertaking.interest_declined'), eq(auditEvents.subjectId, interest.id))).limit(1);
      if (already) return { kind: 'already_declined' as const };
      await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: 'undertaking.interest_declined', subjectType: 'interest', subjectId: interest.id });
      return { kind: 'declined' as const };
    });
    if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
    if (result.value.kind === 'not_found') return res.status(404).json({ error: 'interest_not_found' });
    if (result.value.kind === 'offer_exists') return res.status(409).json({ error: 'interest_has_offer' });
    if (result.value.kind === 'already_declined') return res.status(409).json({ error: 'interest_already_declined' });
    return res.json({ data: { declined: true } });
  });

  /**
   * Organization membership is how several people share one commissioning
   * authority. Only owners and administrators may add a colleague, and the
   * role is recorded rather than implied.
   */
  router.post('/organizations/:organizationId/members', async (req, res) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ error: 'unauthenticated' });
    const { email, role } = req.body as { email?: unknown; role?: unknown };
    const roles = ['administrator', 'manager', 'member', 'viewer'];
    if (typeof email !== 'string' || !email.includes('@') || email.length > 254 || !roles.includes(String(role))) {
      return res.status(400).json({ error: 'invalid_membership' });
    }
    const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:decide', async (tx, membership) => {
      if (!['owner', 'administrator'].includes(membership.role)) return { kind: 'not_admin' as const };
      const [person] = await tx.select({ id: aptPersons.id, name: aptPersons.displayName }).from(aptPersons)
        .innerJoin(user, eq(user.id, aptPersons.authUserId))
        .where(sql`lower(${user.email}) = lower(${email.trim()})`).limit(1);
      if (!person) return { kind: 'no_account' as const };
      if (person.id === membership.personId) return { kind: 'self' as const };
      const [created] = await tx.insert(organizationMemberships).values({
        organizationId: membership.organizationId,
        personId: person.id,
        role: role as 'administrator' | 'manager' | 'member' | 'viewer',
        grantedByPersonId: membership.personId,
      }).onConflictDoNothing().returning();
      if (!created) return { kind: 'exists' as const };
      await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: 'organization.member_added', subjectType: 'person', subjectId: person.id });
      return { kind: 'created' as const, data: { personId: person.id, name: person.name, role: created.role } };
    });
    if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
    if (result.value.kind === 'not_admin') return res.status(403).json({ error: 'administrator_required' });
    if (result.value.kind === 'no_account') return res.status(404).json({ error: 'no_account_for_email' });
    if (result.value.kind === 'self') return res.status(400).json({ error: 'already_a_member' });
    if (result.value.kind === 'exists') return res.status(409).json({ error: 'member_exists' });
    return res.status(201).json({ data: result.value.data });
  });

  return router;
}
