import { Router } from 'express';
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { attendanceRate } from '../../../libs/benbenos/src/report';
import {
  context, fail, readArray, readDate, readInt, readOptionalText, readText, readUuid,
  recordAudit, requireCapability, teachesClass, type BenbenosDatabase, type BenbenosContext, type Transaction,
} from './context';
import {
  bbAcademicYears, bbAttendance, bbClasses, bbEnrolments, bbGuardians, bbInvoices, bbLearners,
  bbPayments, bbSubjects, bbTerms,
} from './schema';

const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'] as const;
type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

async function requireClass(db: BenbenosDatabase | Transaction, ctx: BenbenosContext, classId: string) {
  const [row] = await db.select().from(bbClasses)
    .where(and(eq(bbClasses.id, classId), eq(bbClasses.schoolId, ctx.school.id))).limit(1);
  if (!row) fail(404, 'class_not_found');
  return row;
}

async function requireLearner(db: BenbenosDatabase | Transaction, ctx: BenbenosContext, learnerId: string) {
  const [row] = await db.select().from(bbLearners)
    .where(and(eq(bbLearners.id, learnerId), eq(bbLearners.schoolId, ctx.school.id))).limit(1);
  if (!row) fail(404, 'learner_not_found');
  return row;
}

async function currentYearId(db: BenbenosDatabase | Transaction, ctx: BenbenosContext): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10);
  const [row] = await db.select({ id: bbAcademicYears.id }).from(bbAcademicYears)
    .where(and(eq(bbAcademicYears.schoolId, ctx.school.id), sql`${bbAcademicYears.startsOn} <= ${today}`, sql`${bbAcademicYears.endsOn} >= ${today}`))
    .orderBy(desc(bbAcademicYears.startsOn)).limit(1);
  if (row) return row.id;
  const [started] = await db.select({ id: bbAcademicYears.id }).from(bbAcademicYears)
    .where(and(eq(bbAcademicYears.schoolId, ctx.school.id), sql`${bbAcademicYears.startsOn} <= ${today}`))
    .orderBy(desc(bbAcademicYears.startsOn)).limit(1);
  if (started) return started.id;
  const [upcoming] = await db.select({ id: bbAcademicYears.id }).from(bbAcademicYears)
    .where(eq(bbAcademicYears.schoolId, ctx.school.id)).orderBy(asc(bbAcademicYears.startsOn)).limit(1);
  return upcoming?.id ?? null;
}

export function peopleRouter(db: BenbenosDatabase): Router {
  const router = Router();

  router.get('/subjects', async (_req, res) => {
    const ctx = context(res);
    const rows = await db.select().from(bbSubjects)
      .where(eq(bbSubjects.schoolId, ctx.school.id)).orderBy(asc(bbSubjects.name));
    res.json({ data: rows });
  });

  router.get('/years', async (_req, res) => {
    const ctx = context(res);
    const years = await db.select().from(bbAcademicYears)
      .where(eq(bbAcademicYears.schoolId, ctx.school.id)).orderBy(desc(bbAcademicYears.startsOn));
    const terms = years.length === 0 ? [] : await db.select().from(bbTerms)
      .where(and(eq(bbTerms.schoolId, ctx.school.id), inArray(bbTerms.yearId, years.map((year) => year.id))))
      .orderBy(asc(bbTerms.ordinal));
    const today = new Date().toISOString().slice(0, 10);
    const currentTerm = terms.find((term) => term.startsOn <= today && term.endsOn >= today) ?? null;
    res.json({ data: { years, terms, currentYearId: await currentYearId(db, ctx), currentTermId: currentTerm?.id ?? terms[terms.length - 1]?.id ?? null } });
  });

  router.post('/years', async (req, res) => {
    const ctx = requireCapability(res, 'classes.write');
    const body = req.body as Record<string, unknown>;
    const name = readText(body['name'], 'year_name', 4, 40);
    const startsOn = readDate(body['startsOn'], 'starts_on');
    const endsOn = readDate(body['endsOn'], 'ends_on');
    if (endsOn <= startsOn) fail(400, 'invalid_year_dates');
    const created = await db.transaction(async (tx) => {
      const [year] = await tx.insert(bbAcademicYears).values({ schoolId: ctx.school.id, name, startsOn, endsOn }).returning();
      await recordAudit(tx, ctx, 'year.created', 'year', year.id, { name });
      return year;
    });
    res.status(201).json({ data: created });
  });

  router.post('/terms', async (req, res) => {
    const ctx = requireCapability(res, 'classes.write');
    const body = req.body as Record<string, unknown>;
    const yearId = readUuid(body['yearId'], 'year_id');
    const name = readText(body['name'], 'term_name', 3, 40);
    const ordinal = readInt(body['ordinal'], 'ordinal', 1, 3);
    const startsOn = readDate(body['startsOn'], 'starts_on');
    const endsOn = readDate(body['endsOn'], 'ends_on');
    if (endsOn < startsOn) fail(400, 'invalid_term_dates');
    const [year] = await db.select().from(bbAcademicYears)
      .where(and(eq(bbAcademicYears.id, yearId), eq(bbAcademicYears.schoolId, ctx.school.id))).limit(1);
    if (!year) fail(404, 'year_not_found');
    const [created] = await db.insert(bbTerms).values({ schoolId: ctx.school.id, yearId, name, ordinal, startsOn, endsOn }).returning();
    res.status(201).json({ data: created });
  });

  router.get('/classes', async (_req, res) => {
    const ctx = context(res);
    const rows = await db.select({
      id: bbClasses.id,
      name: bbClasses.name,
      gradeLevel: bbClasses.gradeLevel,
      yearId: bbClasses.yearId,
      learners: sql<number>`count(${bbEnrolments.id})::int`,
    }).from(bbClasses)
      .leftJoin(bbEnrolments, and(
        eq(bbEnrolments.classId, bbClasses.id),
        eq(bbEnrolments.schoolId, ctx.school.id),
      ))
      .where(eq(bbClasses.schoolId, ctx.school.id))
      .groupBy(bbClasses.id)
      .orderBy(asc(bbClasses.gradeLevel), asc(bbClasses.name));
    res.json({ data: rows });
  });

  router.post('/classes', async (req, res) => {
    const ctx = requireCapability(res, 'classes.write');
    const body = req.body as Record<string, unknown>;
    const name = readText(body['name'], 'class_name', 2, 60);
    const gradeLevel = readInt(body['gradeLevel'], 'grade_level', 4, 9);
    const yearId = readUuid(body['yearId'], 'year_id');
    const [year] = await db.select({ id: bbAcademicYears.id }).from(bbAcademicYears)
      .where(and(eq(bbAcademicYears.id, yearId), eq(bbAcademicYears.schoolId, ctx.school.id))).limit(1);
    if (!year) fail(404, 'year_not_found');
    const [created] = await db.insert(bbClasses).values({ schoolId: ctx.school.id, yearId, name, gradeLevel }).returning();
    await recordAudit(db, ctx, 'class.created', 'class', created.id, { name, gradeLevel });
    res.status(201).json({ data: created });
  });

  router.get('/learners', async (req, res) => {
    const ctx = context(res);
    const search = typeof req.query['q'] === 'string' ? req.query['q'].trim() : '';
    const classId = typeof req.query['classId'] === 'string' ? readUuid(req.query['classId'], 'class_id') : null;
    const filters = [eq(bbLearners.schoolId, ctx.school.id)];
    if (search) {
      const like = `%${search}%`;
      const match = or(ilike(bbLearners.firstName, like), ilike(bbLearners.lastName, like), ilike(bbLearners.admissionNo, like));
      if (match) filters.push(match);
    }
    if (classId) {
      filters.push(sql`exists (select 1 from ${bbEnrolments} e where e.learner_id = ${bbLearners.id} and e.class_id = ${classId})`);
    }
    const rows = await db.select({
      id: bbLearners.id,
      admissionNo: bbLearners.admissionNo,
      firstName: bbLearners.firstName,
      lastName: bbLearners.lastName,
      status: bbLearners.status,
      dateOfBirth: bbLearners.dateOfBirth,
      className: sql<string | null>`(select c.name from ${bbClasses} c join ${bbEnrolments} e on e.class_id = c.id where e.learner_id = ${bbLearners}.id order by c.name limit 1)`,
    }).from(bbLearners).where(and(...filters))
      .orderBy(asc(bbLearners.lastName), asc(bbLearners.firstName)).limit(500);
    res.json({ data: rows });
  });

  router.post('/learners', async (req, res) => {
    const ctx = requireCapability(res, 'learners.write');
    const body = req.body as Record<string, unknown>;
    const admissionNo = readText(body['admissionNo'], 'admission_no', 1, 40);
    const firstName = readText(body['firstName'], 'first_name', 1, 80);
    const lastName = readText(body['lastName'], 'last_name', 1, 80);
    const dateOfBirth = body['dateOfBirth'] === undefined || body['dateOfBirth'] === null ? null : readDate(body['dateOfBirth'], 'date_of_birth');
    const classId = body['classId'] === undefined || body['classId'] === null ? null : readUuid(body['classId'], 'class_id');
    const guardian = body['guardian'] as { name?: unknown; phone?: unknown; relationship?: unknown } | undefined;

    const created = await db.transaction(async (tx) => {
      const [learner] = await tx.insert(bbLearners).values({
        schoolId: ctx.school.id, admissionNo, firstName, lastName, dateOfBirth,
      }).returning();
      if (guardian) {
        const guardName = readText(guardian.name, 'guardian_name', 2, 120);
        await tx.insert(bbGuardians).values({
          schoolId: ctx.school.id,
          learnerId: learner.id,
          name: guardName,
          phone: readOptionalText(guardian.phone, 'guardian_phone', 30),
          relationship: readOptionalText(guardian.relationship, 'guardian_relationship', 40),
          isPrimary: true,
        });
      }
      if (classId) {
        const [klass] = await tx.select().from(bbClasses)
          .where(and(eq(bbClasses.id, classId), eq(bbClasses.schoolId, ctx.school.id))).limit(1);
        if (!klass) fail(404, 'class_not_found');
        await tx.insert(bbEnrolments).values({ schoolId: ctx.school.id, yearId: klass.yearId, learnerId: learner.id, classId });
      }
      await recordAudit(tx, ctx, 'learner.created', 'learner', learner.id, { admissionNo });
      return learner;
    });
    res.status(201).json({ data: created });
  });

  router.get('/learners/:learnerId', async (req, res) => {
    const ctx = context(res);
    const learnerId = readUuid(req.params['learnerId'], 'learner_id');
    const learner = await requireLearner(db, ctx, learnerId);
    const [guardians, enrolments, attendance, fees] = await Promise.all([
      db.select().from(bbGuardians).where(eq(bbGuardians.learnerId, learnerId)).orderBy(desc(bbGuardians.isPrimary)),
      db.select({
        id: bbEnrolments.id, yearId: bbEnrolments.yearId, classId: bbEnrolments.classId,
        className: bbClasses.name, gradeLevel: bbClasses.gradeLevel, yearName: bbAcademicYears.name,
      }).from(bbEnrolments)
        .innerJoin(bbClasses, eq(bbClasses.id, bbEnrolments.classId))
        .innerJoin(bbAcademicYears, eq(bbAcademicYears.id, bbEnrolments.yearId))
        .where(eq(bbEnrolments.learnerId, learnerId)).orderBy(desc(bbAcademicYears.startsOn)),
      db.select({ status: bbAttendance.status, count: sql<number>`count(*)::int` })
        .from(bbAttendance).where(eq(bbAttendance.learnerId, learnerId)).groupBy(bbAttendance.status),
      db.select({
        invoiced: sql<number>`coalesce((select sum(i.amount_cents)::int from ${bbInvoices} i where i.learner_id = ${learnerId}), 0)`,
        paid: sql<number>`coalesce((select sum(p.amount_cents)::int from ${bbPayments} p where p.learner_id = ${learnerId}), 0)`,
      }).from(bbLearners).where(eq(bbLearners.id, learnerId)).limit(1),
    ]);
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const row of attendance) counts[row.status as AttendanceStatus] = Number(row.count);
    res.json({ data: {
      learner, guardians, enrolments, attendance: { counts, rate: attendanceRate(counts) },
      fees: { invoicedCents: Number(fees[0]?.invoiced ?? 0), paidCents: Number(fees[0]?.paid ?? 0) },
    } });
  });

  router.patch('/learners/:learnerId', async (req, res) => {
    const ctx = requireCapability(res, 'learners.write');
    const learnerId = readUuid(req.params['learnerId'], 'learner_id');
    await requireLearner(db, ctx, learnerId);
    const body = req.body as Record<string, unknown>;
    const patch: Partial<typeof bbLearners.$inferInsert> = {};
    if (body['firstName'] !== undefined) patch.firstName = readText(body['firstName'], 'first_name', 1, 80);
    if (body['lastName'] !== undefined) patch.lastName = readText(body['lastName'], 'last_name', 1, 80);
    if (body['status'] !== undefined) patch.status = readText(body['status'], 'status', 6, 12);
    if (body['dateOfBirth'] !== undefined) patch.dateOfBirth = body['dateOfBirth'] === null ? null : readDate(body['dateOfBirth'], 'date_of_birth');
    if (Object.keys(patch).length === 0) fail(400, 'nothing_to_update');
    const [updated] = await db.update(bbLearners).set(patch)
      .where(and(eq(bbLearners.id, learnerId), eq(bbLearners.schoolId, ctx.school.id))).returning();
    await recordAudit(db, ctx, 'learner.updated', 'learner', learnerId, { fields: Object.keys(patch) });
    res.json({ data: updated });
  });

  router.post('/learners/:learnerId/guardians', async (req, res) => {
    const ctx = requireCapability(res, 'learners.write');
    const learnerId = readUuid(req.params['learnerId'], 'learner_id');
    await requireLearner(db, ctx, learnerId);
    const body = req.body as Record<string, unknown>;
    const [created] = await db.insert(bbGuardians).values({
      schoolId: ctx.school.id, learnerId,
      name: readText(body['name'], 'guardian_name', 2, 120),
      phone: readOptionalText(body['phone'], 'guardian_phone', 30),
      relationship: readOptionalText(body['relationship'], 'guardian_relationship', 40),
      isPrimary: body['isPrimary'] === true,
    }).returning();
    res.status(201).json({ data: created });
  });

  router.post('/enrolments', async (req, res) => {
    const ctx = requireCapability(res, 'learners.write');
    const body = req.body as Record<string, unknown>;
    const learnerId = readUuid(body['learnerId'], 'learner_id');
    const classId = readUuid(body['classId'], 'class_id');
    await requireLearner(db, ctx, learnerId);
    const klass = await requireClass(db, ctx, classId);
    const [existing] = await db.select({ id: bbEnrolments.id }).from(bbEnrolments)
      .where(and(eq(bbEnrolments.learnerId, learnerId), eq(bbEnrolments.yearId, klass.yearId))).limit(1);
    if (existing) fail(409, 'learner_already_enrolled_this_year');
    const [created] = await db.insert(bbEnrolments).values({
      schoolId: ctx.school.id, yearId: klass.yearId, learnerId, classId,
    }).returning();
    await recordAudit(db, ctx, 'learner.enrolled', 'enrolment', created.id, { learnerId, classId });
    res.status(201).json({ data: created });
  });

  router.get('/classes/:classId/attendance', async (req, res) => {
    const ctx = context(res);
    const classId = readUuid(req.params['classId'], 'class_id');
    const day = readDate(req.query['day'], 'day');
    await requireClass(db, ctx, classId);
    const roster = await db.select({
      learnerId: bbLearners.id,
      admissionNo: bbLearners.admissionNo,
      firstName: bbLearners.firstName,
      lastName: bbLearners.lastName,
      status: bbAttendance.status,
      markedAt: bbAttendance.markedAt,
    }).from(bbEnrolments)
      .innerJoin(bbLearners, eq(bbLearners.id, bbEnrolments.learnerId))
      .leftJoin(bbAttendance, and(eq(bbAttendance.learnerId, bbLearners.id), eq(bbAttendance.classId, classId), eq(bbAttendance.day, day)))
      .where(and(eq(bbEnrolments.classId, classId), eq(bbLearners.status, 'active')))
      .orderBy(asc(bbLearners.lastName), asc(bbLearners.firstName));
    res.json({ data: { day, classId, roster: roster.map((row) => ({ ...row, status: row.status ?? null })) } });
  });

  router.put('/classes/:classId/attendance', async (req, res) => {
    const ctx = requireCapability(res, 'attendance.write');
    const classId = readUuid(req.params['classId'], 'class_id');
    await requireClass(db, ctx, classId);
    if (ctx.member.role === 'teacher' && !(await teachesClass(db, ctx.member.id, classId))) fail(403, 'not_your_class');
    const body = req.body as Record<string, unknown>;
    const day = readDate(body['day'], 'day');
    const entries = readArray(body['records'], 'records', 300).map((raw) => {
      const record = raw as Record<string, unknown>;
      const status = readText(record['status'], 'attendance_status', 6, 10);
      if (!(ATTENDANCE_STATUSES as readonly string[]).includes(status)) fail(400, 'invalid_attendance_status');
      return { learnerId: readUuid(record['learnerId'], 'learner_id'), status: status as AttendanceStatus };
    });
    if (entries.length === 0) fail(400, 'empty_attendance');

    const enrolled = new Set((await db.select({ learnerId: bbEnrolments.learnerId }).from(bbEnrolments)
      .where(and(eq(bbEnrolments.classId, classId), eq(bbEnrolments.schoolId, ctx.school.id))))
      .map((row) => row.learnerId));
    const stray = entries.find((entry) => !enrolled.has(entry.learnerId));
    if (stray) fail(400, 'learner_not_in_class');

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx.insert(bbAttendance).values({
          schoolId: ctx.school.id, classId, learnerId: entry.learnerId, day,
          status: entry.status, markedByMemberId: ctx.member.id, markedAt: new Date(),
        }).onConflictDoUpdate({
          target: [bbAttendance.classId, bbAttendance.learnerId, bbAttendance.day],
          set: { status: entry.status, markedByMemberId: ctx.member.id, markedAt: new Date() },
        });
      }
      await recordAudit(tx, ctx, 'attendance.marked', 'class', classId, { day, records: entries.length });
    });
    res.json({ data: { day, marked: entries.length } });
  });

  return router;
}
