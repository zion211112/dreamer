import express, { type ErrorRequestHandler } from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { auth } from './auth';
import { db } from './db/client';
import { aptPersons, auditEvents, opportunities, organizationMemberships, organizations, undertakingInterests, undertakingOffers, undertakingParticipants, undertakings, workReports, workReviews } from './db/schema';
import { withOrganizationAuthorization } from './authorization';
import { createBenbenosRouter } from './benbenos/router';

const app = express();
app.disable('x-powered-by');
app.all('/api/auth/*splat', toNodeHandler(auth));
// Benben-OS accepts marked answer sheets, so its body limit is larger than the identity API's.
app.use('/api/benbenos', express.json({ limit: '256kb' }));
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  const configuredOrigin = process.env['BETTER_AUTH_URL'];
  if (!origin || !configuredOrigin || new URL(origin).origin !== new URL(configuredOrigin).origin) {
    return res.status(403).json({ error: 'origin_forbidden' });
  }
  return next();
});

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    return res.json({ status: 'ok', database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'unavailable', database: 'unavailable' });
  }
});

app.get('/api/me/network', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const [person] = await db.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  if (!person) return res.status(403).json({ error: 'person_identity_missing' });
  const organizationsForPerson = await db.select({ id: organizations.id, name: organizations.name, standing: organizations.standing, role: organizationMemberships.role })
    .from(organizationMemberships).innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt)));
  const organizationIds = organizationsForPerson.map((organization) => organization.id);
  const members = organizationIds.length ? await db.select({ id: aptPersons.id, name: aptPersons.displayName, organizationId: organizations.id, organizationName: organizations.name, role: organizationMemberships.role })
    .from(organizationMemberships).innerJoin(aptPersons, eq(aptPersons.id, organizationMemberships.personId)).innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(sql`${organizationMemberships.organizationId} in (${sql.join(organizationIds.map((id) => sql`${id}`), sql`, `)})`, isNull(organizationMemberships.revokedAt))) : [];
  return res.json({ data: { organizations: organizationsForPerson, members: members.filter((member) => member.id !== person.id) } });
});

app.get('/api/me/organizations', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const rows = await db.select({
    id: organizations.id,
    name: organizations.name,
    standing: organizations.standing,
    role: organizationMemberships.role,
  }).from(organizationMemberships)
    .innerJoin(aptPersons, eq(aptPersons.id, organizationMemberships.personId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(aptPersons.authUserId, session.user.id), isNull(organizationMemberships.revokedAt)));
  return res.json({ data: rows });
});

app.post('/api/organizations', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { name } = req.body as { name?: unknown };
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 200) {
    return res.status(400).json({ error: 'invalid_organization_name' });
  }

  const created = await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: aptPersons.id }).from(aptPersons)
      .where(eq(aptPersons.authUserId, session.user.id)).limit(1);
    if (!person) return null;
    const [organization] = await tx.insert(organizations).values({
      name: name.trim(),
      createdByPersonId: person.id,
    }).returning();
    await tx.insert(organizationMemberships).values({
      organizationId: organization.id,
      personId: person.id,
      role: 'owner',
      grantedByPersonId: person.id,
    });
    return organization;
  });
  if (!created) return res.status(403).json({ error: 'person_identity_missing' });
  return res.status(201).json({ data: created });
});

app.get('/api/organizations/:organizationId/opportunities', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'organization:read', async (tx, membership) =>
    tx.select().from(opportunities)
      .where(eq(opportunities.organizationId, membership.organizationId))
      .orderBy(desc(opportunities.createdAt)),
  );
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  return res.json({ data: result.value });
});

app.post('/api/organizations/:organizationId/opportunities', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { title, scope } = req.body as { title?: unknown; scope?: unknown };
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 200 || typeof scope !== 'string' || !scope.trim() || scope.length > 10_000) {
    return res.status(400).json({ error: 'invalid_opportunity' });
  }

  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'opportunity:publish', async (tx, membership) => {
    const [created] = await tx.insert(opportunities).values({
      organizationId: membership.organizationId,
      createdByPersonId: membership.personId,
      title: title.trim(),
      scope: scope.trim(),
    }).returning();
    return created;
  });
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  return res.status(201).json({ data: result.value });
});

app.get('/api/undertakings', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const [person] = await db.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  if (!person) return res.status(403).json({ error: 'person_identity_missing' });
  const rows = await db.select({
    id: undertakings.id,
    organizationId: undertakings.organizationId,
    organizationName: organizations.name,
    organizationStanding: organizations.standing,
    title: undertakings.title,
    scope: undertakings.scope,
    status: undertakings.status,
    createdAt: undertakings.createdAt,
  }).from(undertakings).innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
    .where(sql`${undertakings.status} = 'open' or exists (select 1 from organization_memberships m where m.organization_id = ${undertakings.organizationId} and m.person_id = ${person.id} and m.revoked_at is null) or exists (select 1 from undertaking_participants p where p.undertaking_id = ${undertakings.id} and p.person_id = ${person.id})`)
    .orderBy(desc(undertakings.createdAt));
  return res.json({ data: rows });
});

app.get('/api/records', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const [person] = await db.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  if (!person) return res.status(403).json({ error: 'person_identity_missing' });
  const visibleUndertakings = await db.select({ id: undertakings.id, organizationId: undertakings.organizationId, organizationName: organizations.name, organizationStanding: organizations.standing, title: undertakings.title, scope: undertakings.scope, status: undertakings.status, createdAt: undertakings.createdAt })
    .from(undertakings).innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
    .where(sql`${undertakings.status} = 'open' or exists (select 1 from organization_memberships m where m.organization_id = ${undertakings.organizationId} and m.person_id = ${person.id} and m.revoked_at is null) or exists (select 1 from undertaking_participants p where p.undertaking_id = ${undertakings.id} and p.person_id = ${person.id})`)
    .orderBy(desc(undertakings.createdAt)).limit(100);
  const events = await db.select({ id: auditEvents.id, organizationId: auditEvents.organizationId, organizationName: organizations.name, actorName: aptPersons.displayName, action: auditEvents.action, subjectType: auditEvents.subjectType, subjectId: auditEvents.subjectId, occurredAt: auditEvents.occurredAt })
    .from(auditEvents).leftJoin(organizations, eq(organizations.id, auditEvents.organizationId)).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId))
    .where(sql`exists (select 1 from organization_memberships m where m.organization_id = ${auditEvents.organizationId} and m.person_id = ${person.id} and m.revoked_at is null) or (${auditEvents.actorPersonId} = ${person.id} and exists (select 1 from undertaking_participants p where p.person_id = ${person.id} and ((p.undertaking_id = ${auditEvents.subjectId} and ${auditEvents.subjectType} = 'undertaking') or exists (select 1 from undertaking_offers o where o.id = ${auditEvents.subjectId} and o.undertaking_id = p.undertaking_id and ${auditEvents.subjectType} = 'offer') or exists (select 1 from work_reports r where r.id = ${auditEvents.subjectId} and r.undertaking_id = p.undertaking_id and ${auditEvents.subjectType} = 'report'))))`)
    .orderBy(desc(auditEvents.occurredAt)).limit(150);
  return res.json({ data: { undertakings: visibleUndertakings, events } });
});

app.post('/api/organizations/:organizationId/undertakings', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { title, scope } = req.body as { title?: unknown; scope?: unknown };
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 200 || typeof scope !== 'string' || !scope.trim() || scope.length > 10_000) {
    return res.status(400).json({ error: 'invalid_undertaking' });
  }
  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:create', async (tx, membership) => {
    const [created] = await tx.insert(undertakings).values({
      organizationId: membership.organizationId,
      createdByPersonId: membership.personId,
      title: title.trim(),
      scope: scope.trim(),
    }).returning();
    await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: 'undertaking.created', subjectType: 'undertaking', subjectId: created.id });
    return created;
  });
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  return res.status(201).json({ data: result.value });
});

app.post('/api/undertakings/:undertakingId/interests', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { message } = req.body as { message?: unknown };
  if (typeof message !== 'string' || !message.trim() || message.length > 4_000) return res.status(400).json({ error: 'invalid_interest' });
  const result = await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
    const [undertaking] = await tx.select().from(undertakings).where(and(eq(undertakings.id, req.params['undertakingId']), eq(undertakings.status, 'open'))).limit(1);
    if (!person || !undertaking) return { kind: 'unavailable' as const };
    const [membership] = await tx.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.personId, person.id), eq(organizationMemberships.organizationId, undertaking.organizationId), isNull(organizationMemberships.revokedAt))).limit(1);
    if (membership) return { kind: 'member' as const };
    const [created] = await tx.insert(undertakingInterests).values({ undertakingId: undertaking.id, personId: person.id, message: message.trim() }).onConflictDoNothing().returning();
    if (!created) return { kind: 'duplicate' as const };
    await tx.insert(auditEvents).values({ organizationId: undertaking.organizationId, actorPersonId: person.id, action: 'undertaking.interest_submitted', subjectType: 'undertaking', subjectId: undertaking.id });
    return { kind: 'created' as const, data: created };
  }, { isolationLevel: 'serializable' });
  if (result.kind === 'unavailable') return res.status(404).json({ error: 'undertaking_unavailable' });
  if (result.kind === 'member') return res.status(403).json({ error: 'organization_members_do_not_submit_interest' });
  if (result.kind === 'duplicate') return res.status(409).json({ error: 'interest_already_submitted' });
  return res.status(201).json({ data: result.data });
});

app.post('/api/organizations/:organizationId/undertakings/:undertakingId/offers', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { interestId, proposal } = req.body as { interestId?: unknown; proposal?: unknown };
  if (typeof interestId !== 'string' || typeof proposal !== 'string' || !proposal.trim() || proposal.length > 4_000) return res.status(400).json({ error: 'invalid_offer' });
  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:decide', async (tx, membership) => {
    const [parent] = await tx.select({ id: undertakings.id, organizationId: undertakings.organizationId }).from(undertakings)
      .where(and(eq(undertakings.id, req.params['undertakingId']), eq(undertakings.organizationId, membership.organizationId))).limit(1);
    const [interest] = await tx.select().from(undertakingInterests).where(and(eq(undertakingInterests.id, interestId), eq(undertakingInterests.undertakingId, req.params['undertakingId']))).limit(1);
    if (!parent || !interest) return { kind: 'not_found' as const };
    const [offer] = await tx.insert(undertakingOffers).values({ undertakingId: parent.id, interestId: interest.id, issuedByPersonId: membership.personId, offeredToPersonId: interest.personId, proposal: proposal.trim() }).onConflictDoNothing().returning();
    if (!offer) return { kind: 'conflict' as const };
    await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: 'undertaking.offer_issued', subjectType: 'offer', subjectId: offer.id });
    return { kind: 'created' as const, data: offer };
  });
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  if (result.value.kind === 'not_found') return res.status(404).json({ error: 'interest_not_found' });
  if (result.value.kind === 'conflict') return res.status(409).json({ error: 'offer_already_exists' });
  return res.status(201).json({ data: result.value.data });
});

app.post('/api/undertaking-offers/:offerId/decision', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { decision } = req.body as { decision?: unknown };
  if (decision !== 'accepted' && decision !== 'declined') return res.status(400).json({ error: 'invalid_decision' });
  const result = await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
    if (!person) return { kind: 'forbidden' as const };
    const [offer] = await tx.select({ offer: undertakingOffers, organizationId: undertakings.organizationId }).from(undertakingOffers)
      .innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId)).where(eq(undertakingOffers.id, req.params['offerId'])).limit(1);
    if (!offer || offer.offer.offeredToPersonId !== person.id || offer.offer.status !== 'pending') return { kind: 'unavailable' as const };
    const [changed] = await tx.update(undertakingOffers).set({ status: decision, decidedByPersonId: person.id, decidedAt: new Date() })
      .where(and(eq(undertakingOffers.id, offer.offer.id), eq(undertakingOffers.status, 'pending'))).returning();
    if (!changed) return { kind: 'conflict' as const };
    if (decision === 'accepted') {
      await tx.insert(undertakingParticipants).values({ undertakingId: offer.offer.undertakingId, personId: person.id, offerId: offer.offer.id }).onConflictDoNothing();
      await tx.update(undertakings).set({ status: 'active' }).where(eq(undertakings.id, offer.offer.undertakingId));
    }
    await tx.insert(auditEvents).values({ organizationId: offer.organizationId, actorPersonId: person.id, action: `undertaking.offer_${decision}`, subjectType: 'offer', subjectId: offer.offer.id });
    return { kind: 'decided' as const, data: changed };
  }, { isolationLevel: 'serializable' });
  if (result.kind === 'forbidden') return res.status(403).json({ error: 'forbidden' });
  if (result.kind === 'unavailable') return res.status(404).json({ error: 'offer_unavailable' });
  if (result.kind === 'conflict') return res.status(409).json({ error: 'offer_already_decided' });
  return res.json({ data: result.data });
});

app.get('/api/undertakings/:undertakingId', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const [person] = await db.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  if (!person) return res.status(403).json({ error: 'person_identity_missing' });
  const [undertaking] = await db.select().from(undertakings).where(eq(undertakings.id, req.params['undertakingId'])).limit(1);
  if (!undertaking) return res.status(404).json({ error: 'not_found' });
  const [membership] = await db.select({ id: organizationMemberships.id, role: organizationMemberships.role }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, undertaking.organizationId), eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt))).limit(1);
  const [participant] = await db.select({ id: undertakingParticipants.id }).from(undertakingParticipants).where(and(eq(undertakingParticipants.undertakingId, undertaking.id), eq(undertakingParticipants.personId, person.id))).limit(1);
  const member = membership ? { id: membership.id } : undefined;
  if (!member && !participant && undertaking.status !== 'open') return res.status(403).json({ error: 'forbidden' });
  const canReview = !!membership && ['owner', 'administrator', 'manager'].includes(membership.role);
  const interests = canReview ? await db.select({ id: undertakingInterests.id, personId: undertakingInterests.personId, message: undertakingInterests.message, createdAt: undertakingInterests.createdAt }).from(undertakingInterests).where(eq(undertakingInterests.undertakingId, undertaking.id)) : [];
  const offers = await db.select({ id: undertakingOffers.id, offeredToPersonId: undertakingOffers.offeredToPersonId, proposal: undertakingOffers.proposal, status: undertakingOffers.status, createdAt: undertakingOffers.createdAt }).from(undertakingOffers).where(and(eq(undertakingOffers.undertakingId, undertaking.id), canReview ? sql`true` : eq(undertakingOffers.offeredToPersonId, person.id)));
  const reports = member || participant ? await db.select({ id: workReports.id, authorPersonId: workReports.authorPersonId, report: workReports.report, createdAt: workReports.createdAt }).from(workReports).where(eq(workReports.undertakingId, undertaking.id)) : [];
  const reportIds = reports.map((report) => report.id);
  const reviews = reportIds.length ? await db.select({ id: workReviews.id, reportId: workReviews.reportId, decision: workReviews.decision, rationale: workReviews.rationale, createdAt: workReviews.createdAt }).from(workReviews).where(sql`${workReviews.reportId} in (${sql.join(reportIds.map((reportId) => sql`${reportId}`), sql`, `)})`) : [];
  const ownInterest = member ? false : !!(await db.select({ id: undertakingInterests.id }).from(undertakingInterests).where(and(eq(undertakingInterests.undertakingId, undertaking.id), eq(undertakingInterests.personId, person.id))).limit(1))[0];
  return res.json({ data: { ...undertaking, isMember: !!member, isParticipant: !!participant, canReview, ownInterest, interests, offers, reports, reviews } });
});

app.post('/api/undertakings/:undertakingId/reports', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { report } = req.body as { report?: unknown };
  if (typeof report !== 'string' || !report.trim() || report.length > 10_000) return res.status(400).json({ error: 'invalid_report' });
  const result = await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
    const [participation] = person ? await tx.select({ organizationId: undertakings.organizationId }).from(undertakingParticipants).innerJoin(undertakings, eq(undertakings.id, undertakingParticipants.undertakingId)).where(and(eq(undertakingParticipants.undertakingId, req.params['undertakingId']), eq(undertakingParticipants.personId, person.id))).limit(1) : [];
    if (!person || !participation) return { kind: 'forbidden' as const };
    const [created] = await tx.insert(workReports).values({ undertakingId: req.params['undertakingId'], authorPersonId: person.id, report: report.trim() }).returning();
    await tx.insert(auditEvents).values({ organizationId: participation.organizationId, actorPersonId: person.id, action: 'undertaking.report_submitted', subjectType: 'report', subjectId: created.id });
    return { kind: 'created' as const, data: created };
  });
  if (result.kind === 'forbidden') return res.status(403).json({ error: 'participant_required' });
  return res.status(201).json({ data: result.data });
});

app.post('/api/organizations/:organizationId/reports/:reportId/reviews', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'unauthenticated' });
  const { decision, rationale } = req.body as { decision?: unknown; rationale?: unknown };
  if (!['accepted', 'disputed', 'needs_revision'].includes(String(decision)) || typeof rationale !== 'string' || !rationale.trim() || rationale.length > 4_000) return res.status(400).json({ error: 'invalid_review' });
  const result = await withOrganizationAuthorization(session.user.id, req.params['organizationId'], 'undertaking:decide', async (tx, membership) => {
    const [report] = await tx.select({ report: workReports, undertakingOrganizationId: undertakings.organizationId }).from(workReports).innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId)).where(eq(workReports.id, req.params['reportId'])).limit(1);
    if (!report || report.undertakingOrganizationId !== membership.organizationId) return { kind: 'not_found' as const };
    if (report.report.authorPersonId === membership.personId) return { kind: 'self_review' as const };
    const [review] = await tx.insert(workReviews).values({ reportId: report.report.id, reviewerPersonId: membership.personId, decision: decision as 'accepted' | 'disputed' | 'needs_revision', rationale: rationale.trim() }).onConflictDoNothing().returning();
    if (!review) return { kind: 'already_reviewed' as const };
    await tx.insert(auditEvents).values({ organizationId: membership.organizationId, actorPersonId: membership.personId, action: `undertaking.review_${decision}`, subjectType: 'report', subjectId: report.report.id });
    return { kind: 'created' as const, data: review };
  });
  if (!result.authorized) return res.status(403).json({ error: 'forbidden' });
  if (result.value.kind === 'not_found') return res.status(404).json({ error: 'report_not_found' });
  if (result.value.kind === 'self_review') return res.status(403).json({ error: 'author_cannot_review_own_report' });
  if (result.value.kind === 'already_reviewed') return res.status(409).json({ error: 'report_already_reviewed' });
  return res.status(201).json({ data: result.value.data });
});

app.use('/api/benbenos', createBenbenosRouter({
  db,
  identify: async (req) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return null;
    return { authUserId: session.user.id, email: session.user.email, name: session.user.name };
  },
}));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Request failed', error instanceof Error ? error.message : 'unknown error');
  return res.status(500).json({ error: 'internal_error' });
};
app.use(errorHandler);

const port = Number(process.env['PORT'] ?? 3000);
app.listen(port, '127.0.0.1', () => console.log(`APT-LABS workspace server listening on 127.0.0.1:${port}`));
