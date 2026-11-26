import { sql } from 'drizzle-orm';
import { boolean, check, date, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Benben-OS (school management) tables. Every row belongs to one school via
 * `school_id`; nothing here references APT-LABS organisations, persons or
 * opportunities. Learner data stays inside this schema.
 */

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const id = () => uuid('id').primaryKey().defaultRandom();
const schoolId = () => uuid('school_id').notNull().references(() => bbSchools.id, { onDelete: 'cascade' });

export const bbSchools = pgTable('bb_schools', {
  id: id(),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 30 }).notNull().unique(),
  county: varchar('county', { length: 80 }),
  createdAt: createdAt(),
});

export const bbMembers = pgTable('bb_members', {
  id: id(),
  schoolId: schoolId(),
  /** Better Auth user id. Null until an invited person signs in with a verified matching email. */
  authUserId: text('auth_user_id'),
  email: varchar('email', { length: 254 }).notNull(),
  displayName: varchar('display_name', { length: 120 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  status: varchar('status', { length: 12 }).notNull().default('invited'),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('bb_members_school_email_uq').on(table.schoolId, table.email),
  uniqueIndex('bb_members_auth_user_uq').on(table.schoolId, table.authUserId),
  check('bb_members_role_ck', sql`${table.role} in ('principal','registrar','teacher','bursar')`),
  check('bb_members_status_ck', sql`${table.status} in ('invited','active','disabled')`),
]);

export const bbAcademicYears = pgTable('bb_academic_years', {
  id: id(),
  schoolId: schoolId(),
  name: varchar('name', { length: 40 }).notNull(),
  startsOn: date('starts_on').notNull(),
  endsOn: date('ends_on').notNull(),
}, (table) => [
  uniqueIndex('bb_years_school_name_uq').on(table.schoolId, table.name),
  check('bb_years_dates_ck', sql`${table.endsOn} > ${table.startsOn}`),
]);

export const bbTerms = pgTable('bb_terms', {
  id: id(),
  schoolId: schoolId(),
  yearId: uuid('year_id').notNull().references(() => bbAcademicYears.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 40 }).notNull(),
  ordinal: integer('ordinal').notNull(),
  startsOn: date('starts_on').notNull(),
  endsOn: date('ends_on').notNull(),
}, (table) => [
  uniqueIndex('bb_terms_year_ordinal_uq').on(table.yearId, table.ordinal),
  check('bb_terms_dates_ck', sql`${table.endsOn} >= ${table.startsOn}`),
]);

export const bbSubjects = pgTable('bb_subjects', {
  id: id(),
  schoolId: schoolId(),
  code: varchar('code', { length: 12 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
}, (table) => [uniqueIndex('bb_subjects_school_code_uq').on(table.schoolId, table.code)]);

export const bbClasses = pgTable('bb_classes', {
  id: id(),
  schoolId: schoolId(),
  yearId: uuid('year_id').notNull().references(() => bbAcademicYears.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 60 }).notNull(),
  gradeLevel: integer('grade_level').notNull(),
}, (table) => [
  uniqueIndex('bb_classes_year_name_uq').on(table.yearId, table.name),
  check('bb_classes_grade_ck', sql`${table.gradeLevel} between 4 and 9`),
]);

export const bbTeachingAssignments = pgTable('bb_teaching_assignments', {
  id: id(),
  schoolId: schoolId(),
  memberId: uuid('member_id').notNull().references(() => bbMembers.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => bbClasses.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => bbSubjects.id, { onDelete: 'cascade' }),
}, (table) => [uniqueIndex('bb_assignments_uq').on(table.memberId, table.classId, table.subjectId)]);

export const bbLearners = pgTable('bb_learners', {
  id: id(),
  schoolId: schoolId(),
  admissionNo: varchar('admission_no', { length: 40 }).notNull(),
  firstName: varchar('first_name', { length: 80 }).notNull(),
  lastName: varchar('last_name', { length: 80 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  status: varchar('status', { length: 12 }).notNull().default('active'),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('bb_learners_school_admission_uq').on(table.schoolId, table.admissionNo),
  check('bb_learners_status_ck', sql`${table.status} in ('active','transferred','withdrawn','graduated')`),
]);

export const bbGuardians = pgTable('bb_guardians', {
  id: id(),
  schoolId: schoolId(),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  relationship: varchar('relationship', { length: 40 }),
  isPrimary: boolean('is_primary').notNull().default(false),
}, (table) => [index('bb_guardians_learner_idx').on(table.learnerId)]);

export const bbEnrolments = pgTable('bb_enrolments', {
  id: id(),
  schoolId: schoolId(),
  yearId: uuid('year_id').notNull().references(() => bbAcademicYears.id, { onDelete: 'cascade' }),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => bbClasses.id, { onDelete: 'cascade' }),
}, (table) => [uniqueIndex('bb_enrolments_year_learner_uq').on(table.yearId, table.learnerId)]);

export const bbAttendance = pgTable('bb_attendance', {
  id: id(),
  schoolId: schoolId(),
  classId: uuid('class_id').notNull().references(() => bbClasses.id, { onDelete: 'cascade' }),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  status: varchar('status', { length: 10 }).notNull(),
  markedByMemberId: uuid('marked_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  markedAt: timestamp('marked_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('bb_attendance_uq').on(table.classId, table.learnerId, table.day),
  check('bb_attendance_status_ck', sql`${table.status} in ('present','absent','late','excused')`),
]);

export const bbAssessments = pgTable('bb_assessments', {
  id: id(),
  schoolId: schoolId(),
  yearId: uuid('year_id').notNull().references(() => bbAcademicYears.id, { onDelete: 'cascade' }),
  termId: uuid('term_id').notNull().references(() => bbTerms.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => bbClasses.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => bbSubjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 160 }).notNull(),
  kind: varchar('kind', { length: 12 }).notNull(),
  maxScore: integer('max_score').notNull(),
  /** Optional answer scheme used by auto-marking. Stored as the validated JSON form. */
  scheme: jsonb('scheme'),
  createdByMemberId: uuid('created_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
}, (table) => [
  check('bb_assessments_kind_ck', sql`${table.kind} in ('formative','summative')`),
  check('bb_assessments_max_ck', sql`${table.maxScore} > 0`),
  index('bb_assessments_class_idx').on(table.classId, table.termId),
]);

export const bbMarks = pgTable('bb_marks', {
  id: id(),
  schoolId: schoolId(),
  assessmentId: uuid('assessment_id').notNull().references(() => bbAssessments.id, { onDelete: 'cascade' }),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  source: varchar('source', { length: 10 }).notNull(),
  status: varchar('status', { length: 10 }).notNull().default('draft'),
  /** Raw answers, kept so an auto-mark can be audited or re-run. */
  answers: jsonb('answers'),
  comment: varchar('comment', { length: 300 }),
  enteredByMemberId: uuid('entered_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  confirmedByMemberId: uuid('confirmed_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('bb_marks_assessment_learner_uq').on(table.assessmentId, table.learnerId),
  check('bb_marks_source_ck', sql`${table.source} in ('manual','auto')`),
  check('bb_marks_status_ck', sql`${table.status} in ('draft','confirmed')`),
  check('bb_marks_score_ck', sql`${table.score} >= 0`),
]);

export const bbFeeStructures = pgTable('bb_fee_structures', {
  id: id(),
  schoolId: schoolId(),
  yearId: uuid('year_id').notNull().references(() => bbAcademicYears.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  gradeLevel: integer('grade_level'),
  amountCents: integer('amount_cents').notNull(),
}, (table) => [check('bb_fees_amount_ck', sql`${table.amountCents} > 0`)]);

export const bbInvoices = pgTable('bb_invoices', {
  id: id(),
  schoolId: schoolId(),
  termId: uuid('term_id').notNull().references(() => bbTerms.id, { onDelete: 'cascade' }),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  feeStructureId: uuid('fee_structure_id').notNull().references(() => bbFeeStructures.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  createdAt: createdAt(),
}, (table) => [uniqueIndex('bb_invoices_term_fee_learner_uq').on(table.termId, table.feeStructureId, table.learnerId)]);

export const bbPayments = pgTable('bb_payments', {
  id: id(),
  schoolId: schoolId(),
  learnerId: uuid('learner_id').notNull().references(() => bbLearners.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  reference: varchar('reference', { length: 80 }),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  recordedByMemberId: uuid('recorded_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
}, (table) => [
  uniqueIndex('bb_payments_reference_uq').on(table.schoolId, table.reference).where(sql`${table.reference} is not null`),
  check('bb_payments_method_ck', sql`${table.method} in ('cash','mpesa','bank','other')`),
  check('bb_payments_amount_ck', sql`${table.amountCents} > 0`),
]);

/** Principal's procurement drafts. Draft-only: there is no publish path in this module. */
export const bbTenderDrafts = pgTable('bb_tender_drafts', {
  id: id(),
  schoolId: schoolId(),
  title: varchar('title', { length: 160 }).notNull(),
  scope: text('scope').notNull(),
  estimatedCents: integer('estimated_cents'),
  createdByMemberId: uuid('created_by_member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
});

export const bbAuditEvents = pgTable('bb_audit_events', {
  id: id(),
  schoolId: schoolId(),
  memberId: uuid('member_id').references(() => bbMembers.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 60 }).notNull(),
  subjectType: varchar('subject_type', { length: 40 }).notNull(),
  subjectId: uuid('subject_id'),
  details: jsonb('details'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('bb_audit_school_time_idx').on(table.schoolId, table.occurredAt)]);
