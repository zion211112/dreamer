import { Router, type ErrorRequestHandler } from 'express';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { CBC_SUBJECTS } from '../../../libs/benbenos/src/cbc';
import { BB_CAPABILITIES, can, type BBCapability } from '../../../libs/benbenos/src/permissions';
import { adminRouter } from './admin';
import { academicsRouter } from './academics';
import {
  authenticate, context, fail, HttpError, readArray, readDate, readInt, readOptionalText, readText,
  type BenbenosDatabase, type Identify,
} from './context';
import { financeRouter } from './finance';
import { peopleRouter } from './people';
import {
  bbAcademicYears, bbAssessments, bbAttendance, bbAuditEvents, bbClasses, bbInvoices, bbLearners,
  bbMarks, bbMembers, bbPayments, bbSchools, bbSubjects, bbTerms,
} from './schema';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function currentTerm(db: BenbenosDatabase, schoolId: string) {
  const day = today();
  const [term] = await db.select().from(bbTerms)
    .where(and(eq(bbTerms.schoolId, schoolId), sql`${bbTerms.startsOn} <= ${day}`, sql`${bbTerms.endsOn} >= ${day}`))
    .orderBy(desc(bbTerms.startsOn)).limit(1);
  if (term) return term;
  // Outside every term: prefer the most recent one that has started, and only
  // fall forward to the first upcoming term when the year has not begun yet.
  const [started] = await db.select().from(bbTerms)
    .where(and(eq(bbTerms.schoolId, schoolId), sql`${bbTerms.startsOn} <= ${day}`))
    .orderBy(desc(bbTerms.startsOn)).limit(1);
  if (started) return started;
  const [upcoming] = await db.select().from(bbTerms)
    .where(eq(bbTerms.schoolId, schoolId)).orderBy(asc(bbTerms.startsOn)).limit(1);
  return upcoming ?? null;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.code });
  }
  const pgCode = (() => {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && typeof current === 'object' && current !== null; depth += 1) {
      const code = (current as { code?: unknown }).code;
      if (typeof code === 'string') return code;
      current = (current as { cause?: unknown }).cause;
    }
    return null;
  })();
  if (pgCode === '23505') return res.status(409).json({ error: 'duplicate' });
  if (pgCode === '23503') return res.status(409).json({ error: 'still_in_use' });
  console.error('Benben-OS request failed', error instanceof Error ? error.message : 'unknown error');
  return res.status(500).json({ error: 'internal_error' });
};

export function createBenbenosRouter(options: { db: BenbenosDatabase; identify: Identify }): Router {
  const { db, identify } = options;
  const router = Router();

  /**
   * Onboarding. Registered before the membership guard on purpose: the caller
   * has no school yet, and becomes its foundation principal. The school starts
   * with the published CBC subject catalogue rather than an empty list.
   */
  router.post('/schools', async (req, res) => {
    const user = await identify(req);
    if (!user) fail(401, 'unauthenticated');
    const body = req.body as Record<string, unknown>;
    const name = readText(body['name'], 'school_name', 2, 200);
    const code = readText(body['code'], 'school_code', 3, 30).toUpperCase();
    const county = readOptionalText(body['county'], 'county', 80);
    const [existing] = await db.select({ id: bbMembers.id }).from(bbMembers)
      .where(eq(bbMembers.authUserId, user.authUserId)).limit(1);
    if (existing) fail(409, 'already_belongs_to_school');

    const yearInput = body['year'] as Record<string, unknown> | undefined;
    const termsInput = body['terms'] === undefined ? [] : readArray(body['terms'], 'terms', 3);

    const created = await db.transaction(async (tx) => {
      const [school] = await tx.insert(bbSchools).values({ name, code, county }).returning();
      const [member] = await tx.insert(bbMembers).values({
        schoolId: school.id, authUserId: user.authUserId, email: user.email.toLowerCase(),
        displayName: user.name, role: 'principal', status: 'active',
      }).returning();
      await tx.insert(bbSubjects).values(CBC_SUBJECTS.map((subject) => ({
        schoolId: school.id, code: subject.code, name: subject.name,
      })));
      let year: typeof bbAcademicYears.$inferSelect | null = null;
      if (yearInput) {
        const startsOn = readDate(yearInput['startsOn'], 'starts_on');
        const endsOn = readDate(yearInput['endsOn'], 'ends_on');
        if (endsOn <= startsOn) fail(400, 'invalid_year_dates');
        const [row] = await tx.insert(bbAcademicYears).values({
          schoolId: school.id, name: readText(yearInput['name'], 'year_name', 4, 40), startsOn, endsOn,
        }).returning();
        year = row;
        if (termsInput.length > 0) {
          const terms = termsInput.map((raw, index) => {
            const entry = raw as Record<string, unknown>;
            const ordinal = readInt(entry['ordinal'] ?? index + 1, 'ordinal', 1, 3);
            const termStarts = readDate(entry['startsOn'], 'starts_on');
            const termEnds = readDate(entry['endsOn'], 'ends_on');
            if (termEnds < termStarts) fail(400, 'invalid_term_dates');
            return {
              schoolId: school.id, yearId: row.id, name: readText(entry['name'], 'term_name', 3, 40),
              ordinal, startsOn: termStarts, endsOn: termEnds,
            };
          });
          await tx.insert(bbTerms).values(terms);
        }
      }
      await tx.insert(bbAuditEvents).values({
        schoolId: school.id, memberId: member.id, action: 'school.created',
        subjectType: 'school', subjectId: school.id, details: { code },
      });
      return { school, member, year };
    });
    res.status(201).json({ data: created });
  });

  router.use(authenticate(db, identify));

  router.get('/me', async (_req, res) => {
    const ctx = context(res);
    res.json({ data: {
      member: ctx.member,
      school: ctx.school,
      memberships: ctx.memberships,
      capabilities: BB_CAPABILITIES.filter((capability: BBCapability) => can(ctx.member.role, capability)),
    } });
  });

  router.get('/overview', async (_req, res) => {
    const ctx = context(res);
    const schoolId = ctx.school.id;
    const term = await currentTerm(db, schoolId);
    const day = today();
    const [learners] = await db.select({ count: sql<number>`count(*)::int` }).from(bbLearners)
      .where(and(eq(bbLearners.schoolId, schoolId), eq(bbLearners.status, 'active')));
    const [classes] = await db.select({ count: sql<number>`count(*)::int` }).from(bbClasses)
      .where(eq(bbClasses.schoolId, schoolId));
    const [staff] = await db.select({ count: sql<number>`count(*)::int` }).from(bbMembers)
      .where(and(eq(bbMembers.schoolId, schoolId), eq(bbMembers.status, 'active')));
    const attendance = await db.select({ status: bbAttendance.status, count: sql<number>`count(*)::int` })
      .from(bbAttendance)
      .where(and(eq(bbAttendance.schoolId, schoolId), eq(bbAttendance.day, day)))
      .groupBy(bbAttendance.status);
    const [pending] = await db.select({ count: sql<number>`count(*)::int` }).from(bbMarks)
      .where(and(eq(bbMarks.schoolId, schoolId), eq(bbMarks.status, 'draft')));
    const [assessments] = await db.select({ count: sql<number>`count(*)::int` }).from(bbAssessments)
      .where(eq(bbAssessments.schoolId, schoolId));
    const [fees] = await db.select({
      invoiced: sql<number>`coalesce((select sum(amount_cents)::int from ${bbInvoices} i where i.school_id = ${schoolId}${term ? sql` and i.term_id = ${term.id}` : sql``}), 0)`,
      paid: sql<number>`coalesce((select sum(amount_cents)::int from ${bbPayments} p where p.school_id = ${schoolId}), 0)`,
    }).from(bbSchools).where(eq(bbSchools.id, schoolId));
    const recentAudit = await db.select({
      id: bbAuditEvents.id, action: bbAuditEvents.action, occurredAt: bbAuditEvents.occurredAt,
      memberName: bbMembers.displayName,
    }).from(bbAuditEvents)
      .leftJoin(bbMembers, eq(bbMembers.id, bbAuditEvents.memberId))
      .where(eq(bbAuditEvents.schoolId, schoolId))
      .orderBy(desc(bbAuditEvents.occurredAt)).limit(6);
    const attendanceCounts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const row of attendance) attendanceCounts[row.status as keyof typeof attendanceCounts] = Number(row.count);
    res.json({ data: {
      school: ctx.school,
      term,
      counts: {
        learners: Number(learners?.count ?? 0),
        classes: Number(classes?.count ?? 0),
        staff: Number(staff?.count ?? 0),
        assessments: Number(assessments?.count ?? 0),
        draftMarks: Number(pending?.count ?? 0),
      },
      attendance: { day, ...attendanceCounts },
      fees: { invoicedCents: Number(fees?.invoiced ?? 0), paidCents: Number(fees?.paid ?? 0) },
      recentAudit,
    } });
  });

  router.get('/school', async (_req, res) => {
    const ctx = context(res);
    const years = await db.select().from(bbAcademicYears)
      .where(eq(bbAcademicYears.schoolId, ctx.school.id)).orderBy(desc(bbAcademicYears.startsOn));
    const terms = await db.select().from(bbTerms)
      .where(eq(bbTerms.schoolId, ctx.school.id)).orderBy(desc(bbTerms.startsOn));
    res.json({ data: { school: ctx.school, years, terms } });
  });

  router.use(peopleRouter(db));
  router.use(academicsRouter(db));
  router.use(financeRouter(db));
  router.use(adminRouter(db));
  router.use(errorHandler);

  return router;
}
