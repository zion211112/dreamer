import { Router } from 'express';
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { db } from '../db/client';
import { aptPersons, auditEvents, organizationMemberships, organizations, undertakingInterests, undertakingOffers, undertakingParticipants, undertakings, workReports, workReviews } from '../db/schema';
import { parseStudioGraphQuery, parseStudioQuery, type StudioQuery } from '../../../libs/domain/src/studio-query';
import { STUDIO_OBJECT_TYPES, studioObjectType, type StudioObjectTypeId } from '../../../libs/domain/src/studio-ontology';

type Person = { id: string };

export interface StudioObject {
  type: StudioObjectTypeId;
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
  href: string | null;
  properties: Record<string, string>;
  undertakingId?: string | null;
}

export interface StudioGraphNode {
  type: StudioObjectTypeId;
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
}

export interface StudioGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  linkType: string;
}

const NOW = sql`now()`;

async function currentPerson(headers: Record<string, string | string[] | undefined>): Promise<Person | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers as never) });
  if (!session) return null;
  const [person] = await db.select({ id: aptPersons.id }).from(aptPersons).where(eq(aptPersons.authUserId, session.user.id)).limit(1);
  return person ?? null;
}

/** Undertakings a person may open: everything open, plus what they belong to. */
function visibleWork(personId: string): SQL {
  return sql`(${undertakings.status} = 'open'
    or exists (select 1 from organization_memberships m where m.organization_id = undertakings.organization_id and m.person_id = ${personId} and m.revoked_at is null)
    or exists (select 1 from undertaking_participants p where p.undertaking_id = undertakings.id and p.person_id = ${personId}))`;
}

function viewerOrganizationIds(personId: string) {
  return db.select({ id: organizationMemberships.organizationId }).from(organizationMemberships)
    .where(and(eq(organizationMemberships.personId, personId), isNull(organizationMemberships.revokedAt)));
}

function viewerOrganizationIdList(personId: string): Promise<Array<{ id: string }>> {
  return viewerOrganizationIds(personId);
}

function search(term: string | undefined, ...columns: SQL[]): SQL | undefined {
  if (!term) return undefined;
  const pattern = `%${term}%`;
  return or(...columns.map((column) => ilike(column, pattern)));
}

function textFilter(values: unknown, column: SQL): SQL | undefined {
  if (values === undefined) return undefined;
  const list = (Array.isArray(values) ? values : [values]).filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (!list.length) return undefined;
  return or(...list.map((value) => ilike(column, `%${value.trim()}%`)));
}

function statusFilter(values: string[] | undefined, column: SQL): SQL | undefined {
  return values?.length ? inArray(column, values) : undefined;
}

function facet(rows: Array<{ value: string | null; count: number }>) {
  return rows.filter((row) => row.value !== null).map((row) => ({ value: row.value as string, count: row.count }));
}

function paged(query: StudioQuery) {
  return { limit: query.limit, offset: query.offset };
}

type ObjectSet = { type: StudioObjectTypeId; total: number; facets: Array<{ value: string; count: number }>; objects: StudioObject[] };

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

async function organizationSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const conditions: Array<SQL | undefined> = [
    eq(organizationMemberships.personId, personId),
    isNull(organizationMemberships.revokedAt),
    search(query.search, sql`${organizations.name}`, sql`${organizations.standing}`),
    statusFilter(query.status, organizations.standing),
    textFilter(filters['role'], organizationMemberships.role),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: organizations.id, name: organizations.name, standing: organizations.standing,
    role: organizationMemberships.role, createdAt: organizations.createdAt,
  }).from(organizations)
    .innerJoin(organizationMemberships, eq(organizations.id, organizationMemberships.organizationId))
    .where(where).orderBy(desc(organizations.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(organizations)
    .innerJoin(organizationMemberships, eq(organizations.id, organizationMemberships.organizationId)).where(where);
  const facets = await db.select({ value: organizations.standing, count: sql<number>`count(*)::int` }).from(organizations)
    .innerJoin(organizationMemberships, eq(organizations.id, organizationMemberships.organizationId)).where(where).groupBy(organizations.standing);
  return {
    type: 'organization', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'organization', id: row.id, title: row.name, subtitle: `${row.role} · ${row.standing.replaceAll('_', ' ')}`,
      status: row.standing, href: null,
      properties: { standing: row.standing.replaceAll('_', ' '), role: row.role, createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function undertakingSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const conditions: Array<SQL | undefined> = [
    visibleWork(personId),
    search(query.search, sql`${undertakings.title}`, sql`${undertakings.scope}`, sql`${organizations.name}`),
    statusFilter(query.status, undertakings.status),
    textFilter(filters['organizationName'], organizations.name),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: undertakings.id, title: undertakings.title, scope: undertakings.scope, status: undertakings.status,
    createdAt: undertakings.createdAt, organizationId: organizations.id, organizationName: organizations.name,
  }).from(undertakings)
    .innerJoin(organizations, eq(organizations.id, undertakings.organizationId))
    .where(where).orderBy(desc(undertakings.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(undertakings)
    .innerJoin(organizations, eq(organizations.id, undertakings.organizationId)).where(where);
  const facets = await db.select({ value: undertakings.status, count: sql<number>`count(*)::int` }).from(undertakings)
    .innerJoin(organizations, eq(organizations.id, undertakings.organizationId)).where(where).groupBy(undertakings.status);
  return {
    type: 'undertaking', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'undertaking', id: row.id, title: row.title, subtitle: `${row.organizationName} · ${row.status}`,
      status: row.status, href: `/workspace/workbench/${row.id}`,
      properties: { status: row.status, organizationName: row.organizationName, scope: row.scope, createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function personSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const myOrganizations = await viewerOrganizationIdList(personId);
  const organizationIds = myOrganizations.map((row) => row.id);
  const scope = organizationIds.length
    ? sql`(exists (select 1 from organization_memberships mine join organization_memberships theirs on theirs.organization_id = mine.organization_id where mine.person_id = ${personId} and mine.revoked_at is null and theirs.person_id = apt_persons.id and theirs.revoked_at is null) or ${aptPersons.id} = ${personId})`
    : sql`${aptPersons.id} = ${personId}`;
  const conditions: Array<SQL | undefined> = [
    scope,
    search(query.search, sql`${aptPersons.displayName}`, sql`(select coalesce(string_agg(o.name, ', '), '') from organization_memberships m2 join organizations o on o.id = m2.organization_id where m2.person_id = apt_persons.id and m2.revoked_at is null and m2.organization_id in (${organizationIds.length ? sql.join(organizationIds.map((id) => sql`${id}`), sql`, `) : sql`${EMPTY_UUID}`}))`),
    ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: aptPersons.id, name: aptPersons.displayName, createdAt: aptPersons.createdAt,
    organizations: sql<string>`coalesce((select string_agg(o.name, ', ') from organization_memberships m2 join organizations o on o.id = m2.organization_id where m2.person_id = apt_persons.id and m2.revoked_at is null and m2.organization_id in (${organizationIds.length ? sql.join(organizationIds.map((id) => sql`${id}`), sql`, `) : sql`${EMPTY_UUID}`})), '')`,
  }).from(aptPersons).where(where).orderBy(asc(aptPersons.displayName)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(aptPersons).where(where);
  return {
    type: 'person', total: counted?.count ?? 0, facets: [],
    objects: rows.map((row) => ({
      type: 'person', id: row.id, title: row.name, subtitle: row.organizations || 'No shared organization',
      status: null, href: null,
      properties: { organizations: row.organizations || 'No shared organization', createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function interestSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const declined = sql<boolean>`exists (select 1 from audit_events a where a.subject_id = undertaking_interests.id and a.action = 'undertaking.interest_declined')`;
  const conditions: Array<SQL | undefined> = [
    visibleWork(personId),
    search(query.search, sql`${undertakingInterests.message}`, sql`${aptPersons.displayName}`, sql`${undertakings.title}`),
    statusFilter(query.status, sql`case when ${declined} then 'declined' else 'pending' end`),
    textFilter(filters['personName'], aptPersons.displayName),
    textFilter(filters['undertakingTitle'], undertakings.title),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: undertakingInterests.id, message: undertakingInterests.message, createdAt: undertakingInterests.createdAt,
    personName: aptPersons.displayName, undertakingId: undertakings.id, undertakingTitle: undertakings.title,
    declined,
  }).from(undertakingInterests)
    .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId))
    .where(where).orderBy(desc(undertakingInterests.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(undertakingInterests)
    .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId)).where(where);
  const facets = await db.select({ value: sql<string>`case when ${declined} then 'declined' else 'pending' end`, count: sql<number>`count(*)::int` })
    .from(undertakingInterests)
    .innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId))
    .where(where).groupBy(declined);
  return {
    type: 'interest', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'interest', id: row.id, title: row.personName, subtitle: `${row.undertakingTitle} · ${row.declined ? 'declined' : 'pending'}`,
      status: row.declined ? 'declined' : 'pending', href: `/workspace/workbench/${row.undertakingId}`, undertakingId: row.undertakingId,
      properties: { personName: row.personName, undertakingTitle: row.undertakingTitle, message: row.message, declined: row.declined ? 'declined' : 'pending', createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function offerSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const conditions: Array<SQL | undefined> = [
    visibleWork(personId),
    search(query.search, sql`${undertakingOffers.proposal}`, sql`${aptPersons.displayName}`, sql`${undertakings.title}`),
    statusFilter(query.status, undertakingOffers.status),
    textFilter(filters['offeredToName'], aptPersons.displayName),
    textFilter(filters['undertakingTitle'], undertakings.title),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: undertakingOffers.id, proposal: undertakingOffers.proposal, status: undertakingOffers.status,
    createdAt: undertakingOffers.createdAt, undertakingId: undertakings.id, undertakingTitle: undertakings.title,
    offeredToName: aptPersons.displayName,
  }).from(undertakingOffers)
    .innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId))
    .where(where).orderBy(desc(undertakingOffers.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(undertakingOffers)
    .innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId)).where(where);
  const facets = await db.select({ value: undertakingOffers.status, count: sql<number>`count(*)::int` }).from(undertakingOffers)
    .innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId)).where(where).groupBy(undertakingOffers.status);
  return {
    type: 'offer', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'offer', id: row.id, title: `Offer to ${row.offeredToName}`, subtitle: `${row.undertakingTitle} · ${row.status}`,
      status: row.status, href: `/workspace/workbench/${row.undertakingId}`, undertakingId: row.undertakingId,
      properties: { status: row.status, offeredToName: row.offeredToName, proposal: row.proposal, undertakingTitle: row.undertakingTitle, createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function reportSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const reviewDecision = sql<string | null>`(select r.decision from work_reviews r where r.report_id = work_reports.id limit 1)`;
  const conditions: Array<SQL | undefined> = [
    visibleWork(personId),
    search(query.search, sql`${workReports.report}`, sql`${aptPersons.displayName}`, sql`${undertakings.title}`),
    statusFilter(query.status, sql`coalesce(${reviewDecision}, 'unreviewed')`),
    textFilter(filters['authorName'], aptPersons.displayName),
    textFilter(filters['undertakingTitle'], undertakings.title),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: workReports.id, report: workReports.report, createdAt: workReports.createdAt,
    authorName: aptPersons.displayName, undertakingId: undertakings.id, undertakingTitle: undertakings.title, reviewDecision,
  }).from(workReports)
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId))
    .where(where).orderBy(desc(workReports.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(workReports)
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId)).where(where);
  const facets = await db.select({ value: sql<string>`coalesce(${reviewDecision}, 'unreviewed')`, count: sql<number>`count(*)::int` })
    .from(workReports)
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId))
    .where(where).groupBy(sql`coalesce(${reviewDecision}, 'unreviewed')`);
  return {
    type: 'report', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'report', id: row.id, title: `Report by ${row.authorName}`, subtitle: `${row.undertakingTitle} · ${row.reviewDecision ?? 'unreviewed'}`,
      status: row.reviewDecision ?? 'unreviewed', href: `/workspace/workbench/${row.undertakingId}`, undertakingId: row.undertakingId,
      properties: { authorName: row.authorName, undertakingTitle: row.undertakingTitle, reviewDecision: row.reviewDecision ?? 'unreviewed', createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function reviewSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const conditions: Array<SQL | undefined> = [
    visibleWork(personId),
    search(query.search, sql`${workReviews.rationale}`, sql`${aptPersons.displayName}`, sql`${undertakings.title}`),
    statusFilter(query.status, workReviews.decision),
    textFilter(filters['reviewerName'], aptPersons.displayName),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: workReviews.id, decision: workReviews.decision, rationale: workReviews.rationale, createdAt: workReviews.createdAt,
    reviewerName: aptPersons.displayName, undertakingId: undertakings.id, undertakingTitle: undertakings.title,
    reportAuthorName: sql<string>`(select p.display_name from apt_persons p where p.id = (select r.author_person_id from work_reports r where r.id = work_reviews.report_id))`,
  }).from(workReviews)
    .innerJoin(workReports, eq(workReports.id, workReviews.reportId))
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId))
    .where(where).orderBy(desc(workReviews.createdAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(workReviews)
    .innerJoin(workReports, eq(workReports.id, workReviews.reportId))
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(where);
  const facets = await db.select({ value: workReviews.decision, count: sql<number>`count(*)::int` }).from(workReviews)
    .innerJoin(workReports, eq(workReports.id, workReviews.reportId))
    .innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId))
    .innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(where).groupBy(workReviews.decision);
  return {
    type: 'review', total: counted?.count ?? 0, facets: facet(facets),
    objects: rows.map((row) => ({
      type: 'review', id: row.id, title: `${row.decision.replaceAll('_', ' ')} · ${row.reviewerName}`, subtitle: row.undertakingTitle,
      status: row.decision, href: `/workspace/workbench/${row.undertakingId}`, undertakingId: row.undertakingId,
      properties: { decision: row.decision, reviewerName: row.reviewerName, reportAuthorName: row.reportAuthorName, rationale: row.rationale, createdAt: row.createdAt.toISOString() },
    })),
  };
}

async function eventSet(personId: string, query: StudioQuery): Promise<ObjectSet> {
  const filters = query.filters ?? {};
  const seenByOrganization = sql`${auditEvents.organizationId} in (select organization_id from organization_memberships where person_id = ${personId} and revoked_at is null)`;
  const seenOnVisibleWork = sql`${auditEvents.subjectId} in (select ${undertakings.id} from ${undertakings} where ${visibleWork(personId)})`;
  const conditions: Array<SQL | undefined> = [
    or(eq(auditEvents.actorPersonId, personId), seenByOrganization, seenOnVisibleWork),
    search(query.search, sql`${auditEvents.action}`, sql`${aptPersons.displayName}`, sql`${auditEvents.subjectType}`),
    textFilter(filters['action'], auditEvents.action),
    textFilter(filters['actorName'], aptPersons.displayName),
  ];
  const where = and(...conditions.filter((value): value is SQL => Boolean(value)));
  const rows = await db.select({
    id: auditEvents.id, action: auditEvents.action, subjectType: auditEvents.subjectType, subjectId: auditEvents.subjectId,
    occurredAt: auditEvents.occurredAt, actorName: aptPersons.displayName,
  }).from(auditEvents).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId))
    .where(where).orderBy(desc(auditEvents.occurredAt)).limit(query.limit).offset(query.offset);
  const [counted] = await db.select({ count: sql<number>`count(*)::int` }).from(auditEvents)
    .innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId)).where(where);
  return {
    type: 'event', total: counted?.count ?? 0, facets: [],
    objects: rows.map((row) => ({
      type: 'event', id: row.id, title: row.action.replaceAll('.', ' ').replaceAll('_', ' '),
      subtitle: `${row.actorName} · ${row.subjectType}`, status: null, href: null,
      properties: { action: row.action, actorName: row.actorName, subjectType: row.subjectType, occurredAt: row.occurredAt.toISOString() },
    })),
  };
}

const SETS: Record<StudioObjectTypeId, (personId: string, query: StudioQuery) => Promise<ObjectSet>> = {
  organization: organizationSet,
  undertaking: undertakingSet,
  person: personSet,
  interest: interestSet,
  offer: offerSet,
  report: reportSet,
  review: reviewSet,
  event: eventSet,
};

// ---------------------------------------------------------------------------
// Graph: one authorized neighborhood per object, rendered by Cytoscape.
// ---------------------------------------------------------------------------

const key = (type: StudioObjectTypeId, id: string) => `${type}:${id}`;

async function canSee(personId: string, type: StudioObjectTypeId, id: string): Promise<boolean> {
  if (type === 'organization') {
    const [row] = await db.select({ id: organizationMemberships.id }).from(organizationMemberships)
      .where(and(eq(organizationMemberships.organizationId, id), eq(organizationMemberships.personId, personId), isNull(organizationMemberships.revokedAt))).limit(1);
    return Boolean(row);
  }
  if (type === 'undertaking') {
    const [row] = await db.select({ id: undertakings.id }).from(undertakings).where(and(eq(undertakings.id, id), visibleWork(personId))).limit(1);
    return Boolean(row);
  }
  if (type === 'person') {
    if (id === personId) return true;
    const [row] = await db.select({ id: aptPersons.id }).from(aptPersons)
      .where(and(eq(aptPersons.id, id), sql`exists (select 1 from organization_memberships mine join organization_memberships theirs on theirs.organization_id = mine.organization_id where mine.person_id = ${personId} and mine.revoked_at is null and theirs.person_id = apt_persons.id and theirs.revoked_at is null)`)).limit(1);
    return Boolean(row);
  }
  if (type === 'event') {
    const [row] = await db.select({ id: auditEvents.id }).from(auditEvents)
      .where(and(eq(auditEvents.id, id), or(
        eq(auditEvents.actorPersonId, personId),
        sql`${auditEvents.organizationId} in (select organization_id from organization_memberships where person_id = ${personId} and revoked_at is null)`,
        sql`${auditEvents.subjectId} in (select ${undertakings.id} from ${undertakings} where ${visibleWork(personId)})`,
      ))).limit(1);
    return Boolean(row);
  }
  const table = type === 'interest' ? undertakingInterests : type === 'offer' ? undertakingOffers : type === 'report' ? workReports : workReviews;
  const join = type === 'review'
    ? and(eq(workReviews.id, id), eq(workReports.id, workReviews.reportId), eq(undertakings.id, workReports.undertakingId))
    : and(eq(table.id, id), eq(undertakings.id, table.undertakingId));
  const [row] = type === 'review'
    ? await db.select({ id: workReviews.id }).from(workReviews).innerJoin(workReports, eq(workReports.id, workReviews.reportId)).innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId)).where(and(eq(workReviews.id, id), visibleWork(personId))).limit(1)
    : await db.select({ id: table.id }).from(table).innerJoin(undertakings, eq(undertakings.id, table.undertakingId)).where(and(eq(table.id, id), visibleWork(personId))).limit(1);
  return Boolean(row);
}

async function nodeFor(personId: string, type: StudioObjectTypeId, id: string): Promise<StudioGraphNode | null> {
  if (!(await canSee(personId, type, id))) return null;
  if (type === 'organization') {
    const [row] = await db.select({ name: organizations.name, standing: organizations.standing }).from(organizations).where(eq(organizations.id, id)).limit(1);
    return row ? { type, id, title: row.name, subtitle: 'organization', status: row.standing } : null;
  }
  if (type === 'undertaking') {
    const [row] = await db.select({ title: undertakings.title, status: undertakings.status, organizationName: organizations.name }).from(undertakings).innerJoin(organizations, eq(organizations.id, undertakings.organizationId)).where(eq(undertakings.id, id)).limit(1);
    return row ? { type, id, title: row.title, subtitle: row.organizationName, status: row.status } : null;
  }
  if (type === 'person') {
    const [row] = await db.select({ name: aptPersons.displayName }).from(aptPersons).where(eq(aptPersons.id, id)).limit(1);
    return row ? { type, id, title: row.name, subtitle: 'person', status: null } : null;
  }
  if (type === 'interest') {
    const [row] = await db.select({ personName: aptPersons.displayName, message: undertakingInterests.message }).from(undertakingInterests).innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId)).where(eq(undertakingInterests.id, id)).limit(1);
    return row ? { type, id, title: `Interest · ${row.personName}`, subtitle: row.message.slice(0, 90), status: 'pending' } : null;
  }
  if (type === 'offer') {
    const [row] = await db.select({ personName: aptPersons.displayName, status: undertakingOffers.status }).from(undertakingOffers).innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId)).where(eq(undertakingOffers.id, id)).limit(1);
    return row ? { type, id, title: `Offer · ${row.personName}`, subtitle: 'offer', status: row.status } : null;
  }
  if (type === 'report') {
    const [row] = await db.select({ authorName: aptPersons.displayName }).from(workReports).innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId)).where(eq(workReports.id, id)).limit(1);
    return row ? { type, id, title: `Report · ${row.authorName}`, subtitle: 'report', status: null } : null;
  }
  if (type === 'review') {
    const [row] = await db.select({ decision: workReviews.decision, reviewerName: aptPersons.displayName }).from(workReviews).innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(eq(workReviews.id, id)).limit(1);
    return row ? { type, id, title: `Review · ${row.reviewerName}`, subtitle: 'review', status: row.decision } : null;
  }
  const [row] = await db.select({ action: auditEvents.action, actorName: aptPersons.displayName }).from(auditEvents).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId)).where(eq(auditEvents.id, id)).limit(1);
  return row ? { type, id, title: row.action.replaceAll('.', ' ').replaceAll('_', ' '), subtitle: row.actorName, status: null } : null;
}

async function neighborsOf(personId: string, type: StudioObjectTypeId, id: string): Promise<{ nodes: StudioGraphNode[]; edges: StudioGraphEdge[] }> {
  const nodes: StudioGraphNode[] = [];
  const edges: StudioGraphEdge[] = [];
  const pushNode = (node: StudioGraphNode | null) => { if (node) nodes.push(node); };
  const edge = (source: string, target: string, label: string, linkType: string) => {
    edges.push({ id: `${linkType}:${source}->${target}`, source, target, label, linkType });
  };
  const self = key(type, id);

  if (type === 'undertaking') {
    const [organization] = await db.select({ id: organizations.id, name: organizations.name, standing: organizations.standing })
      .from(undertakings).innerJoin(organizations, eq(organizations.id, undertakings.organizationId)).where(eq(undertakings.id, id)).limit(1);
    if (organization) { pushNode({ type: 'organization', id: organization.id, title: organization.name, subtitle: 'organization', status: organization.standing }); edge(key('organization', organization.id), self, 'owns', 'owns'); }
    const people = await db.select({ id: aptPersons.id, name: aptPersons.displayName })
      .from(undertakingParticipants).innerJoin(aptPersons, eq(aptPersons.id, undertakingParticipants.personId))
      .where(eq(undertakingParticipants.undertakingId, id));
    for (const person of people) { pushNode({ type: 'person', id: person.id, title: person.name, subtitle: 'participant', status: null }); edge(self, key('person', person.id), 'delivered by', 'delivered_by'); }
    const interests = await db.select({ id: undertakingInterests.id, message: undertakingInterests.message, personName: aptPersons.displayName })
      .from(undertakingInterests).innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId)).where(eq(undertakingInterests.undertakingId, id));
    for (const interest of interests) { pushNode({ type: 'interest', id: interest.id, title: `Interest · ${interest.personName}`, subtitle: interest.message.slice(0, 90), status: 'pending' }); edge(self, key('interest', interest.id), 'received interest', 'received'); }
    const offers = await db.select({ id: undertakingOffers.id, status: undertakingOffers.status, personName: aptPersons.displayName })
      .from(undertakingOffers).innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId)).where(eq(undertakingOffers.undertakingId, id));
    for (const offer of offers) { pushNode({ type: 'offer', id: offer.id, title: `Offer · ${offer.personName}`, subtitle: 'offer', status: offer.status }); edge(self, key('offer', offer.id), 'issued offer', 'issued'); }
    const reports = await db.select({ id: workReports.id, authorName: aptPersons.displayName })
      .from(workReports).innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId)).where(eq(workReports.undertakingId, id));
    for (const report of reports) {
      pushNode({ type: 'report', id: report.id, title: `Report · ${report.authorName}`, subtitle: 'report', status: null });
      edge(self, key('report', report.id), 'reported', 'reported');
      const [review] = await db.select({ id: workReviews.id, decision: workReviews.decision, reviewerName: aptPersons.displayName })
        .from(workReviews).innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(eq(workReviews.reportId, report.id)).limit(1);
      if (review) { pushNode({ type: 'review', id: review.id, title: `Review · ${review.reviewerName}`, subtitle: 'review', status: review.decision }); edge(key('review', review.id), key('report', report.id), 'judges', 'judges'); }
    }
    const events = await db.select({ id: auditEvents.id, action: auditEvents.action, actorName: aptPersons.displayName })
      .from(auditEvents).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId)).where(eq(auditEvents.subjectId, id)).limit(20);
    for (const event of events) { pushNode({ type: 'event', id: event.id, title: event.action.replaceAll('.', ' ').replaceAll('_', ' '), subtitle: event.actorName, status: null }); edge(key('event', event.id), self, 'recorded', 'recorded'); }
  }

  if (type === 'organization') {
    const members = await db.select({ id: aptPersons.id, name: aptPersons.displayName, role: organizationMemberships.role })
      .from(organizationMemberships).innerJoin(aptPersons, eq(aptPersons.id, organizationMemberships.personId))
      .where(and(eq(organizationMemberships.organizationId, id), isNull(organizationMemberships.revokedAt)));
    for (const member of members) { pushNode({ type: 'person', id: member.id, title: member.name, subtitle: member.role, status: null }); edge(key('person', member.id), self, 'member of', 'member_of'); }
    const work = await db.select({ id: undertakings.id, title: undertakings.title, status: undertakings.status })
      .from(undertakings).where(and(eq(undertakings.organizationId, id), visibleWork(personId))).limit(25);
    for (const undertaking of work) { pushNode({ type: 'undertaking', id: undertaking.id, title: undertaking.title, subtitle: 'undertaking', status: undertaking.status }); edge(self, key('undertaking', undertaking.id), 'owns', 'owns'); }
  }

  if (type === 'person') {
    const memberships = await db.select({ id: organizations.id, name: organizations.name, standing: organizations.standing })
      .from(organizationMemberships).innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
      .where(and(eq(organizationMemberships.personId, id), isNull(organizationMemberships.revokedAt)));
    for (const organization of memberships) { pushNode({ type: 'organization', id: organization.id, title: organization.name, subtitle: 'organization', status: organization.standing }); edge(self, key('organization', organization.id), 'member of', 'member_of'); }
    const work = await db.select({ id: undertakings.id, title: undertakings.title, status: undertakings.status })
      .from(undertakingParticipants).innerJoin(undertakings, eq(undertakings.id, undertakingParticipants.undertakingId))
      .where(and(eq(undertakingParticipants.personId, id), visibleWork(personId))).limit(25);
    for (const undertaking of work) { pushNode({ type: 'undertaking', id: undertaking.id, title: undertaking.title, subtitle: 'undertaking', status: undertaking.status }); edge(key('undertaking', undertaking.id), self, 'delivered by', 'delivered_by'); }
  }

  if (type === 'interest') {
    const [row] = await db.select({ undertakingId: undertakings.id, title: undertakings.title, personId: aptPersons.id, personName: aptPersons.displayName })
      .from(undertakingInterests).innerJoin(undertakings, eq(undertakings.id, undertakingInterests.undertakingId)).innerJoin(aptPersons, eq(aptPersons.id, undertakingInterests.personId))
      .where(eq(undertakingInterests.id, id)).limit(1);
    if (row) {
      pushNode({ type: 'undertaking', id: row.undertakingId, title: row.title, subtitle: 'undertaking', status: null });
      pushNode({ type: 'person', id: row.personId, title: row.personName, subtitle: 'person', status: null });
      edge(key('undertaking', row.undertakingId), self, 'received interest', 'received');
      edge(self, key('person', row.personId), 'from', 'from_person');
    }
  }

  if (type === 'offer') {
    const [row] = await db.select({ undertakingId: undertakings.id, title: undertakings.title, personId: aptPersons.id, personName: aptPersons.displayName })
      .from(undertakingOffers).innerJoin(undertakings, eq(undertakings.id, undertakingOffers.undertakingId)).innerJoin(aptPersons, eq(aptPersons.id, undertakingOffers.offeredToPersonId))
      .where(eq(undertakingOffers.id, id)).limit(1);
    if (row) {
      pushNode({ type: 'undertaking', id: row.undertakingId, title: row.title, subtitle: 'undertaking', status: null });
      pushNode({ type: 'person', id: row.personId, title: row.personName, subtitle: 'person', status: null });
      edge(key('undertaking', row.undertakingId), self, 'issued offer', 'issued');
      edge(self, key('person', row.personId), 'from', 'from_person');
    }
  }

  if (type === 'report') {
    const [row] = await db.select({ undertakingId: undertakings.id, title: undertakings.title, personId: aptPersons.id, personName: aptPersons.displayName })
      .from(workReports).innerJoin(undertakings, eq(undertakings.id, workReports.undertakingId)).innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId))
      .where(eq(workReports.id, id)).limit(1);
    if (row) {
      pushNode({ type: 'undertaking', id: row.undertakingId, title: row.title, subtitle: 'undertaking', status: null });
      pushNode({ type: 'person', id: row.personId, title: row.personName, subtitle: 'person', status: null });
      edge(key('undertaking', row.undertakingId), self, 'reported', 'reported');
      edge(self, key('person', row.personId), 'from', 'from_person');
    }
    const [review] = await db.select({ id: workReviews.id, decision: workReviews.decision, reviewerName: aptPersons.displayName })
      .from(workReviews).innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(eq(workReviews.reportId, id)).limit(1);
    if (review) { pushNode({ type: 'review', id: review.id, title: `Review · ${review.reviewerName}`, subtitle: 'review', status: review.decision }); edge(key('review', review.id), self, 'judges', 'judges'); }
  }

  if (type === 'review') {
    const [row] = await db.select({ reportId: workReviews.reportId, personId: aptPersons.id, personName: aptPersons.displayName })
      .from(workReviews).innerJoin(aptPersons, eq(aptPersons.id, workReviews.reviewerPersonId)).where(eq(workReviews.id, id)).limit(1);
    if (row) {
      const [report] = await db.select({ authorName: aptPersons.displayName }).from(workReports).innerJoin(aptPersons, eq(aptPersons.id, workReports.authorPersonId)).where(eq(workReports.id, row.reportId)).limit(1);
      pushNode({ type: 'report', id: row.reportId, title: `Report · ${report?.authorName ?? 'author'}`, subtitle: 'report', status: null });
      pushNode({ type: 'person', id: row.personId, title: row.personName, subtitle: 'reviewer', status: null });
      edge(self, key('report', row.reportId), 'judges', 'judges');
      edge(self, key('person', row.personId), 'from', 'from_person');
    }
  }

  if (type === 'event') {
    const [row] = await db.select({ subjectId: auditEvents.subjectId, subjectType: auditEvents.subjectType, actorId: aptPersons.id, actorName: aptPersons.displayName })
      .from(auditEvents).innerJoin(aptPersons, eq(aptPersons.id, auditEvents.actorPersonId)).where(eq(auditEvents.id, id)).limit(1);
    if (row) {
      pushNode({ type: 'person', id: row.actorId, title: row.actorName, subtitle: 'actor', status: null });
      edge(self, key('person', row.actorId), 'from', 'from_person');
      if (row.subjectType === 'undertaking') {
        const [undertaking] = await db.select({ title: undertakings.title, status: undertakings.status }).from(undertakings).where(and(eq(undertakings.id, row.subjectId), visibleWork(personId))).limit(1);
        if (undertaking) { pushNode({ type: 'undertaking', id: row.subjectId, title: undertaking.title, subtitle: 'undertaking', status: undertaking.status }); edge(self, key('undertaking', row.subjectId), 'recorded', 'recorded'); }
      }
    }
  }

  const seen = new Set<string>([self]);
  return { nodes: nodes.filter((node) => { const nodeKey = key(node.type, node.id); if (seen.has(nodeKey)) return false; seen.add(nodeKey); return true; }), edges };
}

async function buildGraph(personId: string, type: StudioObjectTypeId, id: string, depth: number) {
  const root = await nodeFor(personId, type, id);
  if (!root) return null;
  const nodes = new Map<string, StudioGraphNode>([[key(root.type, root.id), root]]);
  const edges = new Map<string, StudioGraphEdge>();
  const queue: Array<{ type: StudioObjectTypeId; id: string; remaining: number }> = [{ type, id, remaining: depth }];
  while (queue.length && nodes.size < 80) {
    const current = queue.shift()!;
    if (current.remaining <= 0) continue;
    const found = await neighborsOf(personId, current.type, current.id);
    for (const node of found.nodes) {
      const nodeKey = key(node.type, node.id);
      if (!nodes.has(nodeKey) && nodes.size < 80) {
        nodes.set(nodeKey, node);
        queue.push({ type: node.type, id: node.id, remaining: current.remaining - 1 });
      }
    }
    for (const edge of found.edges) {
      if (nodes.has(edge.source) && nodes.has(edge.target)) edges.set(edge.id, edge);
    }
  }
  return { root: key(root.type, root.id), nodes: [...nodes.values()], edges: [...edges.values()] };
}

function csvCell(value: string | null | undefined): string {
  const text = (value ?? '').replaceAll('"', '""');
  // Spreadsheet formula injection is a real export risk; neutralise the leading character.
  const guarded = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
  return '"' + guarded + '"';
}

export function createStudioRouter(): Router {
  const router = Router();

  router.get('/studio', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });
    const counts: Record<string, number> = {};
    for (const type of STUDIO_OBJECT_TYPES) {
      const set = await SETS[type.id](person.id, { type: type.id, sort: 'recent', limit: 1, offset: 0 });
      counts[type.id] = set.total;
    }
    const organizationRows = await db.select({ id: organizations.id, name: organizations.name, role: organizationMemberships.role })
      .from(organizationMemberships).innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
      .where(and(eq(organizationMemberships.personId, person.id), isNull(organizationMemberships.revokedAt)));
    return res.json({
      data: {
        person: { id: person.id },
        counts,
        organizations: organizationRows,
        types: STUDIO_OBJECT_TYPES,
        serverTime: new Date().toISOString(),
      },
    });
  });

  router.post('/studio/query', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });
    const parsed = parseStudioQuery(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_query', issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })) });
    }
    if (!studioObjectType(parsed.data.type)) return res.status(400).json({ error: 'unknown_object_type' });
    const set = await SETS[parsed.data.type](person.id, parsed.data);
    return res.json({ data: set });
  });

  router.get('/studio/export', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });
    const rawStatus = req.query['status'];
    const parsed = parseStudioQuery({
      type: req.query['type'],
      search: req.query['search'],
      sort: req.query['sort'],
      status: Array.isArray(rawStatus) ? rawStatus : typeof rawStatus === 'string' ? [rawStatus] : undefined,
      limit: 100,
      offset: 0,
    });
    if (!parsed.success || !studioObjectType(parsed.data.type)) return res.status(400).json({ error: 'invalid_query' });
    const query = parsed.data;
    const type = studioObjectType(query.type)!;
    const set = await SETS[query.type](person.id, { ...query, limit: 5000, offset: 0 });
    const propertyKeys = type.properties.map((property) => property.key);
    const header = ['type', 'id', 'title', 'subtitle', 'status', ...propertyKeys];
    const lines = [header.map(csvCell).join(',')];
    for (const object of set.objects) {
      lines.push([
        object.type, object.id, object.title, object.subtitle, object.status ?? '',
        ...propertyKeys.map((key) => object.properties[key] ?? ''),
      ].map(csvCell).join(','));
    }
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', `attachment; filename="studio-${query.type}-${stamp}.csv"`);
    res.setHeader('cache-control', 'no-store');
    if (set.total > set.objects.length) res.setHeader('x-studio-truncated', 'true');
    return res.send('\uFEFF' + lines.join('\r\n') + '\r\n');
  });

  router.get('/studio/graph', async (req, res) => {
    const person = await currentPerson(req.headers);
    if (!person) return res.status(401).json({ error: 'unauthenticated' });
    const parsed = parseStudioGraphQuery({ type: req.query['type'], id: req.query['id'], depth: req.query['depth'] });
    if (!parsed.success) return res.status(400).json({ error: 'invalid_graph_query' });
    const graph = await buildGraph(person.id, parsed.data.type, parsed.data.id, parsed.data.depth);
    if (!graph) return res.status(404).json({ error: 'not_found' });
    return res.json({ data: graph });
  });

  return router;
}
