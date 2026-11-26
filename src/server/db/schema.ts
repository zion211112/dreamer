import { relations, sql } from 'drizzle-orm';
import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_user_id_idx').on(table.userId)]);

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('account_user_id_idx').on(table.userId)]);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

export const aptPersons = pgTable('apt_persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  authUserId: text('auth_user_id').notNull().unique().references(() => user.id, { onDelete: 'restrict' }),
  displayName: varchar('display_name', { length: 160 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  standing: varchar('standing', { length: 24 }).notNull().default('provisional'),
  createdByPersonId: uuid('created_by_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [check('organizations_standing_check', sql`${table.standing} in ('provisional', 'community_validated', 'formally_verified')`)]);

export const organizationMemberships = pgTable('organization_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  personId: uuid('person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  role: varchar('role', { length: 24 }).notNull(),
  grantedByPersonId: uuid('granted_by_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (table) => [
  index('organization_memberships_person_org_idx').on(table.personId, table.organizationId),
  uniqueIndex('organization_memberships_active_unique').on(table.personId, table.organizationId).where(sql`${table.revokedAt} is null`),
  check('organization_memberships_role_check', sql`${table.role} in ('owner', 'administrator', 'manager', 'member', 'viewer')`),
]);

export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'restrict' }),
  createdByPersonId: uuid('created_by_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 200 }).notNull(),
  scope: text('scope').notNull(),
  status: varchar('status', { length: 24 }).notNull().default('draft'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('opportunities_tenant_idx').on(table.organizationId, table.status),
  check('opportunities_status_check', sql`${table.status} in ('draft', 'published', 'closed')`),
]);

export const undertakings = pgTable('undertakings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'restrict' }),
  createdByPersonId: uuid('created_by_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 200 }).notNull(),
  scope: text('scope').notNull(),
  status: varchar('status', { length: 24 }).notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('undertakings_org_status_idx').on(table.organizationId, table.status),
  check('undertakings_status_check', sql`${table.status} in ('open', 'active', 'closed')`),
]);

export const undertakingInterests = pgTable('undertaking_interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  undertakingId: uuid('undertaking_id').notNull().references(() => undertakings.id, { onDelete: 'restrict' }),
  personId: uuid('person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('undertaking_interests_undertaking_idx').on(table.undertakingId, table.createdAt),
  uniqueIndex('undertaking_interests_person_unique').on(table.undertakingId, table.personId),
]);

export const undertakingOffers = pgTable('undertaking_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  undertakingId: uuid('undertaking_id').notNull().references(() => undertakings.id, { onDelete: 'restrict' }),
  interestId: uuid('interest_id').notNull().references(() => undertakingInterests.id, { onDelete: 'restrict' }),
  issuedByPersonId: uuid('issued_by_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  offeredToPersonId: uuid('offered_to_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  proposal: text('proposal').notNull(),
  status: varchar('status', { length: 24 }).notNull().default('pending'),
  decidedByPersonId: uuid('decided_by_person_id').references(() => aptPersons.id, { onDelete: 'restrict' }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('undertaking_offers_undertaking_idx').on(table.undertakingId, table.status),
  uniqueIndex('undertaking_offers_recipient_unique').on(table.undertakingId, table.offeredToPersonId),
  check('undertaking_offers_status_check', sql`${table.status} in ('pending', 'accepted', 'declined')`),
  check('undertaking_offers_no_self_offer_check', sql`${table.issuedByPersonId} <> ${table.offeredToPersonId}`),
]);

export const undertakingParticipants = pgTable('undertaking_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  undertakingId: uuid('undertaking_id').notNull().references(() => undertakings.id, { onDelete: 'restrict' }),
  personId: uuid('person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  offerId: uuid('offer_id').notNull().references(() => undertakingOffers.id, { onDelete: 'restrict' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('undertaking_participants_unique').on(table.undertakingId, table.personId)]);

export const workReports = pgTable('work_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  undertakingId: uuid('undertaking_id').notNull().references(() => undertakings.id, { onDelete: 'restrict' }),
  authorPersonId: uuid('author_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  report: text('report').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('work_reports_undertaking_idx').on(table.undertakingId, table.createdAt)]);

export const workReviews = pgTable('work_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => workReports.id, { onDelete: 'restrict' }),
  reviewerPersonId: uuid('reviewer_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  decision: varchar('decision', { length: 24 }).notNull(),
  rationale: text('rationale').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('work_reviews_report_unique').on(table.reportId),
  check('work_reviews_decision_check', sql`${table.decision} in ('accepted', 'disputed', 'needs_revision')`),
]);

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'restrict' }),
  actorPersonId: uuid('actor_person_id').notNull().references(() => aptPersons.id, { onDelete: 'restrict' }),
  action: varchar('action', { length: 80 }).notNull(),
  subjectType: varchar('subject_type', { length: 40 }).notNull(),
  subjectId: uuid('subject_id').notNull(),
  details: jsonb('details').notNull().default({}),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('audit_events_org_time_idx').on(table.organizationId, table.occurredAt)]);

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), accounts: many(account), aptPersons: many(aptPersons) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
export const accountRelations = relations(account, ({ one }) => ({ user: one(user, { fields: [account.userId], references: [user.id] }) }));
export const aptPersonRelations = relations(aptPersons, ({ one, many }) => ({
  authUser: one(user, { fields: [aptPersons.authUserId], references: [user.id] }),
  memberships: many(organizationMemberships),
}));
export const organizationRelations = relations(organizations, ({ many }) => ({ memberships: many(organizationMemberships), opportunities: many(opportunities) }));
export const organizationMembershipRelations = relations(organizationMemberships, ({ one }) => ({
  organization: one(organizations, { fields: [organizationMemberships.organizationId], references: [organizations.id] }),
  person: one(aptPersons, { fields: [organizationMemberships.personId], references: [aptPersons.id] }),
}));
export const opportunityRelations = relations(opportunities, ({ one }) => ({
  organization: one(organizations, { fields: [opportunities.organizationId], references: [organizations.id] }),
  creator: one(aptPersons, { fields: [opportunities.createdByPersonId], references: [aptPersons.id] }),
}));
