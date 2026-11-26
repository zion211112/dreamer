import { Router } from 'express';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { markSubmission, validateScheme, type Answer, type SchemeQuestion } from '../../../libs/benbenos/src/marking';
import { attendanceRate, summariseTerm, type ConfirmedMark } from '../../../libs/benbenos/src/report';
import {
  context, fail, mayActOnWholeSchool, readArray, readInt, readOptionalText, readOneOf, readText, readUuid,
  recordAudit, requireCapability, teachesClassSubject, type BenbenosDatabase, type BenbenosContext, type Transaction,
} from './context';
import {
  bbAssessments, bbAttendance, bbClasses, bbEnrolments, bbLearners, bbMarks, bbSubjects, bbTerms,
} from './schema';

const KINDS = ['formative', 'summative'] as const;

async function requireAssessment(db: BenbenosDatabase | Transaction, ctx: BenbenosContext, assessmentId: string) {
  const [row] = await db.select().from(bbAssessments)
    .where(and(eq(bbAssessments.id, assessmentId), eq(bbAssessments.schoolId, ctx.school.id))).limit(1);
  if (!row) fail(404, 'assessment_not_found');
  return row;
}

async function requireTerm(db: BenbenosDatabase | Transaction, ctx: BenbenosContext, termId: string) {
  const [row] = await db.select().from(bbTerms)
    .where(and(eq(bbTerms.id, termId), eq(bbTerms.schoolId, ctx.school.id))).limit(1);
  if (!row) fail(404, 'term_not_found');
  return row;
}

/** Enforces teacher scope once the assessment is known. */
async function assertCanMark(db: BenbenosDatabase | Transaction, ctx: BenbenosContext, assessment: { classId: string; subjectId: string }): Promise<void> {
  if (mayActOnWholeSchool(ctx.member.role)) return;
  if (ctx.member.role !== 'teacher') fail(403, 'forbidden');
  if (!(await teachesClassSubject(db, ctx.member.id, assessment.classId, assessment.subjectId))) fail(403, 'not_your_class_subject');
}

function parseScheme(raw: unknown): SchemeQuestion[] | null {
  if (raw === undefined || raw === null) return null;
  try {
    validateScheme(raw as SchemeQuestion[]);
  } catch (error) {
    fail(400, error instanceof Error && error.message ? `invalid_scheme` : 'invalid_scheme');
  }
  return raw as SchemeQuestion[];
}

function parseAnswers(value: unknown, scheme: SchemeQuestion[]): Record<string, Answer> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(400, 'invalid_answers');
  const record = value as Record<string, unknown>;
  const answers: Record<string, Answer> = {};
  for (const question of scheme) {
    const answer = record[question.id];
    if (answer === undefined || answer === null) { answers[question.id] = null; continue; }
    if (question.type === 'mcq') {
      if (typeof answer !== 'number' || !Number.isSafeInteger(answer) || answer < 0) fail(400, `invalid_answer_${question.id}`);
      answers[question.id] = answer;
    } else {
      if (typeof answer !== 'string' || answer.length > 4000) fail(400, `invalid_answer_${question.id}`);
      answers[question.id] = answer;
    }
  }
  return answers;
}

export function academicsRouter(db: BenbenosDatabase): Router {
  const router = Router();

  router.get('/assessments', async (req, res) => {
    const ctx = context(res);
    const classId = typeof req.query['classId'] === 'string' ? readUuid(req.query['classId'], 'class_id') : null;
    const termId = typeof req.query['termId'] === 'string' ? readUuid(req.query['termId'], 'term_id') : null;
    const filters = [eq(bbAssessments.schoolId, ctx.school.id)];
    if (classId) filters.push(eq(bbAssessments.classId, classId));
    if (termId) filters.push(eq(bbAssessments.termId, termId));
    const rows = await db.select({
      id: bbAssessments.id,
      title: bbAssessments.title,
      kind: bbAssessments.kind,
      maxScore: bbAssessments.maxScore,
      createdAt: bbAssessments.createdAt,
      classId: bbAssessments.classId,
      className: bbClasses.name,
      subjectId: bbAssessments.subjectId,
      subjectName: bbSubjects.name,
      termId: bbAssessments.termId,
      hasScheme: sql<boolean>`${bbAssessments.scheme} is not null`,
      marked: sql<number>`(select count(*)::int from ${bbMarks} m where m.assessment_id = ${bbAssessments.id})`,
      drafts: sql<number>`(select count(*)::int from ${bbMarks} m where m.assessment_id = ${bbAssessments.id} and m.status = 'draft')`,
      confirmed: sql<number>`(select count(*)::int from ${bbMarks} m where m.assessment_id = ${bbAssessments.id} and m.status = 'confirmed')`,
      autoMarked: sql<number>`(select count(*)::int from ${bbMarks} m where m.assessment_id = ${bbAssessments.id} and m.source = 'auto')`,
    }).from(bbAssessments)
      .innerJoin(bbClasses, eq(bbClasses.id, bbAssessments.classId))
      .innerJoin(bbSubjects, eq(bbSubjects.id, bbAssessments.subjectId))
      .where(and(...filters))
      .orderBy(desc(bbAssessments.createdAt)).limit(200);
    res.json({ data: rows });
  });

  router.post('/assessments', async (req, res) => {
    const ctx = requireCapability(res, 'marks.write');
    const body = req.body as Record<string, unknown>;
    const classId = readUuid(body['classId'], 'class_id');
    const subjectId = readUuid(body['subjectId'], 'subject_id');
    const termId = readUuid(body['termId'], 'term_id');
    const title = readText(body['title'], 'title', 3, 160);
    const kind = readOneOf(body['kind'], 'kind', KINDS);
    const maxScore = readInt(body['maxScore'], 'max_score', 1, 1000);
    const scheme = parseScheme(body['scheme']);
    const schemeTotal = scheme ? scheme.reduce((total, question) => total + question.marks, 0) : null;
    if (scheme && schemeTotal !== maxScore) fail(400, 'scheme_total_must_equal_max_score');

    const [klass] = await db.select().from(bbClasses)
      .where(and(eq(bbClasses.id, classId), eq(bbClasses.schoolId, ctx.school.id))).limit(1);
    if (!klass) fail(404, 'class_not_found');
    await requireTerm(db, ctx, termId);
    const [subject] = await db.select().from(bbSubjects)
      .where(and(eq(bbSubjects.id, subjectId), eq(bbSubjects.schoolId, ctx.school.id))).limit(1);
    if (!subject) fail(404, 'subject_not_found');
    if (ctx.member.role === 'teacher' && !(await teachesClassSubject(db, ctx.member.id, classId, subjectId))) fail(403, 'not_your_class_subject');

    const created = await db.transaction(async (tx) => {
      const [assessment] = await tx.insert(bbAssessments).values({
        schoolId: ctx.school.id, yearId: klass.yearId, termId, classId, subjectId,
        title, kind, maxScore, scheme, createdByMemberId: ctx.member.id,
      }).returning();
      await recordAudit(tx, ctx, 'assessment.created', 'assessment', assessment.id, { title, maxScore, autoMarking: !!scheme });
      return assessment;
    });
    res.status(201).json({ data: created });
  });

  router.get('/assessments/:assessmentId', async (req, res) => {
    const ctx = context(res);
    const assessment = await requireAssessment(db, ctx, readUuid(req.params['assessmentId'], 'assessment_id'));
    const roster = await db.select({
      learnerId: bbLearners.id,
      admissionNo: bbLearners.admissionNo,
      firstName: bbLearners.firstName,
      lastName: bbLearners.lastName,
    }).from(bbEnrolments)
      .innerJoin(bbLearners, eq(bbLearners.id, bbEnrolments.learnerId))
      .where(and(eq(bbEnrolments.classId, assessment.classId), eq(bbLearners.status, 'active')))
      .orderBy(asc(bbLearners.lastName), asc(bbLearners.firstName));
    const marks = await db.select().from(bbMarks).where(eq(bbMarks.assessmentId, assessment.id));
    const byLearner = new Map(marks.map((mark) => [mark.learnerId, mark]));
    res.json({ data: {
      assessment,
      roster: roster.map((learner) => ({ ...learner, mark: byLearner.get(learner.learnerId) ?? null })),
    } });
  });

  router.put('/assessments/:assessmentId/marks', async (req, res) => {
    const ctx = requireCapability(res, 'marks.write');
    const assessment = await requireAssessment(db, ctx, readUuid(req.params['assessmentId'], 'assessment_id'));
    await assertCanMark(db, ctx, assessment);
    const body = req.body as Record<string, unknown>;
    const entries = readArray(body['entries'], 'entries', 300).map((raw) => {
      const entry = raw as Record<string, unknown>;
      return {
        learnerId: readUuid(entry['learnerId'], 'learner_id'),
        score: readInt(entry['score'], 'score', 0, assessment.maxScore),
        comment: readOptionalText(entry['comment'], 'comment', 300),
      };
    });
    if (entries.length === 0) fail(400, 'empty_marks');
    const existing = await db.select({ learnerId: bbMarks.learnerId, status: bbMarks.status })
      .from(bbMarks).where(eq(bbMarks.assessmentId, assessment.id));
    const confirmed = new Set(existing.filter((row) => row.status === 'confirmed').map((row) => row.learnerId));
    if (entries.some((entry) => confirmed.has(entry.learnerId))) fail(409, 'mark_confirmed');

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx.insert(bbMarks).values({
          schoolId: ctx.school.id, assessmentId: assessment.id, learnerId: entry.learnerId,
          score: entry.score, source: 'manual', status: 'draft', comment: entry.comment,
          enteredByMemberId: ctx.member.id, updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [bbMarks.assessmentId, bbMarks.learnerId],
          set: { score: entry.score, source: 'manual', comment: entry.comment, enteredByMemberId: ctx.member.id, updatedAt: new Date() },
        });
      }
      await recordAudit(tx, ctx, 'marks.saved', 'assessment', assessment.id, { entries: entries.length });
    });
    res.json({ data: { saved: entries.length } });
  });

  router.post('/assessments/:assessmentId/auto-mark', async (req, res) => {
    const ctx = requireCapability(res, 'marks.write');
    const assessment = await requireAssessment(db, ctx, readUuid(req.params['assessmentId'], 'assessment_id'));
    await assertCanMark(db, ctx, assessment);
    const scheme = parseScheme(assessment.scheme);
    if (!scheme) fail(409, 'assessment_has_no_scheme');

    const body = req.body as Record<string, unknown>;
    const entries = readArray(body['entries'], 'entries', 300).map((raw) => {
      const entry = raw as Record<string, unknown>;
      const answers = parseAnswers(entry['answers'], scheme);
      return { learnerId: readUuid(entry['learnerId'], 'learner_id'), answers, marked: markSubmission(scheme, answers) };
    });
    if (entries.length === 0) fail(400, 'empty_auto_mark');
    const existing = await db.select({ learnerId: bbMarks.learnerId, status: bbMarks.status })
      .from(bbMarks).where(eq(bbMarks.assessmentId, assessment.id));
    const confirmed = new Set(existing.filter((row) => row.status === 'confirmed').map((row) => row.learnerId));
    if (entries.some((entry) => confirmed.has(entry.learnerId))) fail(409, 'mark_confirmed');

    const results = await db.transaction(async (tx) => {
      const saved: { learnerId: string; score: number; percent: number; level: string }[] = [];
      for (const entry of entries) {
        await tx.insert(bbMarks).values({
          schoolId: ctx.school.id, assessmentId: assessment.id, learnerId: entry.learnerId,
          score: entry.marked.score, source: 'auto', status: 'draft',
          answers: { responses: entry.answers, breakdown: entry.marked.questions },
          enteredByMemberId: ctx.member.id, updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [bbMarks.assessmentId, bbMarks.learnerId],
          set: {
            score: entry.marked.score, source: 'auto',
            answers: { responses: entry.answers, breakdown: entry.marked.questions },
            enteredByMemberId: ctx.member.id, updatedAt: new Date(),
          },
        });
        saved.push({ learnerId: entry.learnerId, score: entry.marked.score, percent: entry.marked.percent, level: entry.marked.level });
      }
      await recordAudit(tx, ctx, 'marks.auto_marked', 'assessment', assessment.id, { entries: entries.length });
      return saved;
    });
    res.json({ data: { saved: results.length, results } });
  });

  router.post('/assessments/:assessmentId/confirm', async (req, res) => {
    const ctx = requireCapability(res, 'marks.confirm');
    const assessment = await requireAssessment(db, ctx, readUuid(req.params['assessmentId'], 'assessment_id'));
    const body = req.body as Record<string, unknown>;
    const learnerIds = body['learnerIds'] === undefined ? null : readArray(body['learnerIds'], 'learner_ids', 300).map((id) => readUuid(id, 'learner_id'));
    const filters = [eq(bbMarks.assessmentId, assessment.id), eq(bbMarks.status, 'draft')];
    if (learnerIds) filters.push(inArray(bbMarks.learnerId, learnerIds));
    const updated = await db.transaction(async (tx) => {
      const rows = await tx.update(bbMarks).set({
        status: 'confirmed', confirmedByMemberId: ctx.member.id, confirmedAt: new Date(), updatedAt: new Date(),
      }).where(and(...filters)).returning({ id: bbMarks.id });
      if (rows.length > 0) {
        await recordAudit(tx, ctx, 'marks.confirmed', 'assessment', assessment.id, { marks: rows.length });
      }
      return rows.length;
    });
    if (updated === 0) fail(409, 'no_draft_marks');
    res.json({ data: { confirmed: updated } });
  });

  router.post('/assessments/:assessmentId/reopen', async (req, res) => {
    const ctx = requireCapability(res, 'marks.confirm');
    const assessment = await requireAssessment(db, ctx, readUuid(req.params['assessmentId'], 'assessment_id'));
    const updated = await db.transaction(async (tx) => {
      const rows = await tx.update(bbMarks).set({ status: 'draft', confirmedByMemberId: null, confirmedAt: null, updatedAt: new Date() })
        .where(and(eq(bbMarks.assessmentId, assessment.id), eq(bbMarks.status, 'confirmed')))
        .returning({ id: bbMarks.id });
      if (rows.length > 0) await recordAudit(tx, ctx, 'marks.reopened', 'assessment', assessment.id, { marks: rows.length });
      return rows.length;
    });
    if (updated === 0) fail(409, 'no_confirmed_marks');
    res.json({ data: { reopened: updated } });
  });

  router.get('/reports', async (req, res) => {
    const ctx = context(res);
    const classId = readUuid(req.query['classId'], 'class_id');
    const termId = readUuid(req.query['termId'], 'term_id');
    const term = await requireTerm(db, ctx, termId);
    const [klass] = await db.select().from(bbClasses)
      .where(and(eq(bbClasses.id, classId), eq(bbClasses.schoolId, ctx.school.id))).limit(1);
    if (!klass) fail(404, 'class_not_found');

    const roster = await db.select({
      learnerId: bbLearners.id,
      admissionNo: bbLearners.admissionNo,
      firstName: bbLearners.firstName,
      lastName: bbLearners.lastName,
    }).from(bbEnrolments)
      .innerJoin(bbLearners, eq(bbLearners.id, bbEnrolments.learnerId))
      .where(and(eq(bbEnrolments.classId, classId), eq(bbLearners.status, 'active')))
      .orderBy(asc(bbLearners.lastName), asc(bbLearners.firstName));

    const rows = await db.select({
      learnerId: bbMarks.learnerId,
      score: bbMarks.score,
      maxScore: bbAssessments.maxScore,
      subjectCode: bbSubjects.code,
      subjectName: bbSubjects.name,
    }).from(bbMarks)
      .innerJoin(bbAssessments, eq(bbAssessments.id, bbMarks.assessmentId))
      .innerJoin(bbSubjects, eq(bbSubjects.id, bbAssessments.subjectId))
      .where(and(
        eq(bbMarks.schoolId, ctx.school.id),
        eq(bbMarks.status, 'confirmed'),
        eq(bbAssessments.termId, termId),
        eq(bbAssessments.classId, classId),
      ));

    const attendance = await db.select({
      learnerId: bbAttendance.learnerId,
      status: bbAttendance.status,
      count: sql<number>`count(*)::int`,
    }).from(bbAttendance)
      .where(and(
        eq(bbAttendance.classId, classId),
        sql`${bbAttendance.day} between ${term.startsOn} and ${term.endsOn}`,
      )).groupBy(bbAttendance.learnerId, bbAttendance.status);

    const marksByLearner = new Map<string, ConfirmedMark[]>();
    for (const row of rows) {
      const list = marksByLearner.get(row.learnerId) ?? [];
      list.push({ subjectCode: row.subjectCode, subjectName: row.subjectName, score: row.score, maxScore: row.maxScore });
      marksByLearner.set(row.learnerId, list);
    }
    const attendanceByLearner = new Map<string, { present: number; late: number; absent: number; excused: number }>();
    for (const row of attendance) {
      const counts = attendanceByLearner.get(row.learnerId) ?? { present: 0, late: 0, absent: 0, excused: 0 };
      counts[row.status as keyof typeof counts] = Number(row.count);
      attendanceByLearner.set(row.learnerId, counts);
    }

    const data = roster.map((learner) => {
      const summary = summariseTerm(marksByLearner.get(learner.learnerId) ?? []);
      const counts = attendanceByLearner.get(learner.learnerId) ?? { present: 0, late: 0, absent: 0, excused: 0 };
      return { ...learner, ...summary, attendanceRate: attendanceRate(counts), attendance: counts };
    });
    res.json({ data: { class: klass, term, learners: data } });
  });

  return router;
}
