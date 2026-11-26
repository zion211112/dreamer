import { Router } from 'express';
import { and, asc, eq, sql } from 'drizzle-orm';
import { parseKesToCents } from '../../../libs/benbenos/src/money';
import {
  context, fail, readArray, readInt, readOneOf, readOptionalText, readText, readUuid,
  recordAudit, requireCapability, type BenbenosDatabase,
} from './context';
import {
  bbAcademicYears, bbClasses, bbEnrolments, bbFeeStructures, bbInvoices, bbLearners, bbPayments, bbTerms,
} from './schema';

const METHODS = ['cash', 'mpesa', 'bank', 'other'] as const;

function readAmount(value: unknown, field: string): number {
  if (typeof value !== 'string' || value.length > 20) fail(400, `invalid_${field}`);
  try {
    return parseKesToCents(value);
  } catch {
    return fail(400, `invalid_${field}`);
  }
}

export function financeRouter(db: BenbenosDatabase): Router {
  const router = Router();

  router.get('/fees/structures', async (req, res) => {
    requireCapability(res, 'fees.read');
    const ctx = context(res);
    const yearId = typeof req.query['yearId'] === 'string' ? readUuid(req.query['yearId'], 'year_id') : null;
    const filters = [eq(bbFeeStructures.schoolId, ctx.school.id)];
    if (yearId) filters.push(eq(bbFeeStructures.yearId, yearId));
    const rows = await db.select({
      id: bbFeeStructures.id,
      name: bbFeeStructures.name,
      gradeLevel: bbFeeStructures.gradeLevel,
      amountCents: bbFeeStructures.amountCents,
      yearId: bbFeeStructures.yearId,
      yearName: bbAcademicYears.name,
    }).from(bbFeeStructures)
      .innerJoin(bbAcademicYears, eq(bbAcademicYears.id, bbFeeStructures.yearId))
      .where(and(...filters)).orderBy(asc(bbAcademicYears.startsOn), asc(bbFeeStructures.gradeLevel));
    res.json({ data: rows });
  });

  router.post('/fees/structures', async (req, res) => {
    const ctx = requireCapability(res, 'fees.write');
    const body = req.body as Record<string, unknown>;
    const yearId = readUuid(body['yearId'], 'year_id');
    const name = readText(body['name'], 'fee_name', 3, 120);
    const gradeLevel = body['gradeLevel'] === undefined || body['gradeLevel'] === null ? null : readInt(body['gradeLevel'], 'grade_level', 4, 9);
    const amountCents = readAmount(body['amountKes'], 'amount');
    const [year] = await db.select({ id: bbAcademicYears.id }).from(bbAcademicYears)
      .where(and(eq(bbAcademicYears.id, yearId), eq(bbAcademicYears.schoolId, ctx.school.id))).limit(1);
    if (!year) fail(404, 'year_not_found');
    const [created] = await db.insert(bbFeeStructures).values({
      schoolId: ctx.school.id, yearId, name, gradeLevel, amountCents,
    }).returning();
    await recordAudit(db, ctx, 'fee_structure.created', 'fee_structure', created.id, { name, amountCents });
    res.status(201).json({ data: created });
  });

  router.post('/fees/invoices', async (req, res) => {
    const ctx = requireCapability(res, 'fees.write');
    const body = req.body as Record<string, unknown>;
    const termId = readUuid(body['termId'], 'term_id');
    const feeStructureId = readUuid(body['feeStructureId'], 'fee_structure_id');
    const classId = body['classId'] === undefined || body['classId'] === null ? null : readUuid(body['classId'], 'class_id');
    const [term] = await db.select().from(bbTerms)
      .where(and(eq(bbTerms.id, termId), eq(bbTerms.schoolId, ctx.school.id))).limit(1);
    if (!term) fail(404, 'term_not_found');
    const [fee] = await db.select().from(bbFeeStructures)
      .where(and(eq(bbFeeStructures.id, feeStructureId), eq(bbFeeStructures.schoolId, ctx.school.id))).limit(1);
    if (!fee) fail(404, 'fee_structure_not_found');
    if (fee.yearId !== term.yearId) fail(400, 'fee_structure_wrong_year');

    const enrolments = await db.select({
      learnerId: bbEnrolments.learnerId,
      classId: bbEnrolments.classId,
      gradeLevel: bbClasses.gradeLevel,
    }).from(bbEnrolments)
      .innerJoin(bbClasses, eq(bbClasses.id, bbEnrolments.classId))
      .where(and(
        eq(bbEnrolments.yearId, term.yearId),
        classId ? eq(bbEnrolments.classId, classId) : sql`true`,
      ));
    const target = fee.gradeLevel === null ? enrolments : enrolments.filter((row) => row.gradeLevel === fee.gradeLevel);
    if (target.length === 0) fail(409, 'no_learners_to_invoice');

    const created = await db.transaction(async (tx) => {
      const rows = await tx.insert(bbInvoices).values(target.map((row) => ({
        schoolId: ctx.school.id, termId, learnerId: row.learnerId,
        feeStructureId: fee.id, amountCents: fee.amountCents,
      }))).onConflictDoNothing().returning({ id: bbInvoices.id, learnerId: bbInvoices.learnerId });
      await recordAudit(tx, ctx, 'invoices.generated', 'term', termId, { invoices: rows.length, feeStructureId: fee.id });
      return rows;
    });
    res.status(201).json({ data: { created: created.length, skipped: target.length - created.length } });
  });

  router.get('/fees/ledger', async (req, res) => {
    requireCapability(res, 'fees.read');
    const ctx = context(res);
    const termId = readUuid(req.query['termId'], 'term_id');
    const [term] = await db.select().from(bbTerms)
      .where(and(eq(bbTerms.id, termId), eq(bbTerms.schoolId, ctx.school.id))).limit(1);
    if (!term) fail(404, 'term_not_found');

    const rows = await db.select({
      learnerId: bbLearners.id,
      admissionNo: bbLearners.admissionNo,
      firstName: bbLearners.firstName,
      lastName: bbLearners.lastName,
      className: sql<string | null>`(select c.name from ${bbClasses} c join ${bbEnrolments} e on e.class_id = c.id where e.learner_id = ${bbLearners}.id and e.year_id = ${term.yearId} limit 1)`,
      invoicedCents: sql<number>`coalesce((select sum(i.amount_cents)::int from ${bbInvoices} i where i.learner_id = ${bbLearners}.id and i.term_id = ${termId}), 0)`,
      paidCents: sql<number>`coalesce((select sum(p.amount_cents)::int from ${bbPayments} p where p.learner_id = ${bbLearners}.id), 0)`,
    }).from(bbLearners)
      .where(and(eq(bbLearners.schoolId, ctx.school.id), eq(bbLearners.status, 'active')))
      .orderBy(asc(bbLearners.lastName), asc(bbLearners.firstName));
    const data = rows.map((row) => ({
      ...row,
      invoicedCents: Number(row.invoicedCents),
      paidCents: Number(row.paidCents),
      balanceCents: Number(row.invoicedCents) - Number(row.paidCents),
    }));
    res.json({ data: {
      term,
      learners: data,
      totals: data.reduce((totals, row) => ({
        invoicedCents: totals.invoicedCents + row.invoicedCents,
        paidCents: totals.paidCents + row.paidCents,
        balanceCents: totals.balanceCents + row.balanceCents,
      }), { invoicedCents: 0, paidCents: 0, balanceCents: 0 }),
    } });
  });

  router.post('/fees/payments', async (req, res) => {
    const ctx = requireCapability(res, 'fees.write');
    const body = req.body as Record<string, unknown>;
    const learnerId = readUuid(body['learnerId'], 'learner_id');
    const amountCents = readAmount(body['amountKes'], 'amount');
    const method = readOneOf(body['method'], 'method', METHODS);
    const reference = readOptionalText(body['reference'], 'reference', 80);
    const [learner] = await db.select({ id: bbLearners.id }).from(bbLearners)
      .where(and(eq(bbLearners.id, learnerId), eq(bbLearners.schoolId, ctx.school.id))).limit(1);
    if (!learner) fail(404, 'learner_not_found');
    const created = await db.transaction(async (tx) => {
      const [payment] = await tx.insert(bbPayments).values({
        schoolId: ctx.school.id, learnerId, amountCents, method, reference, recordedByMemberId: ctx.member.id,
      }).onConflictDoNothing().returning();
      if (!payment) fail(409, 'duplicate_reference');
      await recordAudit(tx, ctx, 'payment.recorded', 'learner', learnerId, { amountCents, method });
      return payment;
    });
    res.status(201).json({ data: created });
  });

  router.get('/fees/payments', async (req, res) => {
    requireCapability(res, 'fees.read');
    const ctx = context(res);
    const learnerId = readUuid(req.query['learnerId'], 'learner_id');
    const rows = await db.select({
      id: bbPayments.id,
      learnerId: bbPayments.learnerId,
      amountCents: bbPayments.amountCents,
      method: bbPayments.method,
      reference: bbPayments.reference,
      receivedAt: bbPayments.receivedAt,
      learnerName: sql<string>`${bbLearners.firstName} || ' ' || ${bbLearners.lastName}`,
    }).from(bbPayments)
      .innerJoin(bbLearners, eq(bbLearners.id, bbPayments.learnerId))
      .where(and(eq(bbPayments.schoolId, ctx.school.id), eq(bbPayments.learnerId, learnerId)))
      .orderBy(sql`${bbPayments.receivedAt} desc`).limit(100);
    res.json({ data: rows });
  });

  // Kept for the UI's quick intake: several learners, one bank slip.
  router.post('/fees/payments/batch', async (req, res) => {
    const ctx = requireCapability(res, 'fees.write');
    const body = req.body as Record<string, unknown>;
    const entries = readArray(body['entries'], 'entries', 300).map((raw) => {
      const entry = raw as Record<string, unknown>;
      return {
        learnerId: readUuid(entry['learnerId'], 'learner_id'),
        amountCents: readAmount(entry['amountKes'], 'amount'),
        reference: readOptionalText(entry['reference'], 'reference', 80),
      };
    });
    if (entries.length === 0) fail(400, 'empty_payments');
    const method = readOneOf(body['method'], 'method', METHODS);
    const ids = entries.map((entry) => entry.learnerId);
    const known = new Set((await db.select({ id: bbLearners.id }).from(bbLearners)
      .where(and(eq(bbLearners.schoolId, ctx.school.id), sql`${bbLearners.id} in ${ids}`)))
      .map((row) => row.id));
    if (entries.some((entry) => !known.has(entry.learnerId))) fail(404, 'learner_not_found');
    const count = await db.transaction(async (tx) => {
      const rows = await tx.insert(bbPayments).values(entries.map((entry) => ({
        schoolId: ctx.school.id, learnerId: entry.learnerId, amountCents: entry.amountCents,
        method, reference: entry.reference, recordedByMemberId: ctx.member.id,
      }))).onConflictDoNothing().returning({ id: bbPayments.id });
      await recordAudit(tx, ctx, 'payments.batch_recorded', 'school', ctx.school.id, { payments: rows.length });
      return rows.length;
    });
    res.status(201).json({ data: { recorded: count } });
  });

  return router;
}
