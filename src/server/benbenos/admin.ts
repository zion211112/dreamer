import { Router } from 'express';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { BB_ROLES, isBBRole } from '../../../libs/benbenos/src/permissions';
import { parseKesToCents } from '../../../libs/benbenos/src/money';
import {
  context, fail, readInt, readOneOf, readText, readUuid, recordAudit, requireCapability,
  type BenbenosDatabase,
} from './context';
import {
  bbAuditEvents, bbClasses, bbMembers, bbSubjects, bbTeachingAssignments, bbTenderDrafts,
} from './schema';

export function adminRouter(db: BenbenosDatabase): Router {
  const router = Router();

  router.get('/staff', async (_req, res) => {
    const ctx = context(res);
    if (ctx.member.role !== 'principal' && ctx.member.role !== 'registrar') fail(403, 'forbidden');
    const rows = await db.select({
      id: bbMembers.id,
      email: bbMembers.email,
      displayName: bbMembers.displayName,
      role: bbMembers.role,
      status: bbMembers.status,
      createdAt: bbMembers.createdAt,
      linked: sql<boolean>`${bbMembers.authUserId} is not null`,
      assignments: sql<number>`(select count(*)::int from ${bbTeachingAssignments} a where a.member_id = ${bbMembers}.id)`,
    }).from(bbMembers)
      .where(eq(bbMembers.schoolId, ctx.school.id))
      .orderBy(sql`case ${bbMembers.role} when 'principal' then 0 when 'registrar' then 1 when 'teacher' then 2 else 3 end`, bbMembers.displayName);
    res.json({ data: rows });
  });

  router.post('/staff', async (req, res) => {
    const ctx = requireCapability(res, 'staff.manage');
    const body = req.body as Record<string, unknown>;
    const email = readText(body['email'], 'email', 5, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'invalid_email');
    const displayName = readText(body['displayName'], 'display_name', 2, 120);
    const role = readOneOf(body['role'], 'role', BB_ROLES);
    const [created] = await db.insert(bbMembers).values({
      schoolId: ctx.school.id, email, displayName, role, status: 'invited',
    }).returning();
    await recordAudit(db, ctx, 'staff.invited', 'member', created.id, { role });
    res.status(201).json({ data: created });
  });

  router.patch('/staff/:memberId', async (req, res) => {
    const ctx = requireCapability(res, 'staff.manage');
    const memberId = readUuid(req.params['memberId'], 'member_id');
    const [member] = await db.select().from(bbMembers)
      .where(and(eq(bbMembers.id, memberId), eq(bbMembers.schoolId, ctx.school.id))).limit(1);
    if (!member) fail(404, 'member_not_found');
    const body = req.body as Record<string, unknown>;
    const role = body['role'] === undefined ? member.role : readOneOf(body['role'], 'role', BB_ROLES);
    const status = body['status'] === undefined ? member.status : readOneOf(body['status'], 'status', ['invited', 'active', 'disabled'] as const);
    if (member.role === 'principal' && (role !== 'principal' || status !== 'active')) {
      const [other] = await db.select({ id: bbMembers.id }).from(bbMembers)
        .where(and(
          eq(bbMembers.schoolId, ctx.school.id),
          eq(bbMembers.role, 'principal'),
          eq(bbMembers.status, 'active'),
          ne(bbMembers.id, memberId),
        )).limit(1);
      if (!other) fail(409, 'last_principal');
    }
    if (role !== member.role) {
      const assigned = await db.select({ id: bbTeachingAssignments.id }).from(bbTeachingAssignments)
        .where(and(eq(bbTeachingAssignments.memberId, memberId), eq(bbTeachingAssignments.schoolId, ctx.school.id))).limit(1);
      if (assigned.length > 0 && role !== 'teacher' && role !== 'principal' && role !== 'registrar') fail(409, 'member_has_assignments');
    }
    const [updated] = await db.update(bbMembers).set({ role, status })
      .where(and(eq(bbMembers.id, memberId), eq(bbMembers.schoolId, ctx.school.id))).returning();
    await recordAudit(db, ctx, 'staff.updated', 'member', memberId, { role, status });
    res.json({ data: updated });
  });

  router.get('/assignments', async (req, res) => {
    const ctx = context(res);
    const memberId = typeof req.query['memberId'] === 'string' ? readUuid(req.query['memberId'], 'member_id') : null;
    const filters = [eq(bbTeachingAssignments.schoolId, ctx.school.id)];
    if (memberId) filters.push(eq(bbTeachingAssignments.memberId, memberId));
    const rows = await db.select({
      id: bbTeachingAssignments.id,
      memberId: bbTeachingAssignments.memberId,
      memberName: bbMembers.displayName,
      classId: bbTeachingAssignments.classId,
      className: bbClasses.name,
      gradeLevel: bbClasses.gradeLevel,
      subjectId: bbTeachingAssignments.subjectId,
      subjectName: bbSubjects.name,
      subjectCode: bbSubjects.code,
    }).from(bbTeachingAssignments)
      .innerJoin(bbMembers, eq(bbMembers.id, bbTeachingAssignments.memberId))
      .innerJoin(bbClasses, eq(bbClasses.id, bbTeachingAssignments.classId))
      .innerJoin(bbSubjects, eq(bbSubjects.id, bbTeachingAssignments.subjectId))
      .where(and(...filters)).orderBy(bbClasses.name, bbSubjects.name);
    res.json({ data: rows });
  });

  router.post('/assignments', async (req, res) => {
    const ctx = requireCapability(res, 'staff.manage');
    const body = req.body as Record<string, unknown>;
    const memberId = readUuid(body['memberId'], 'member_id');
    const classId = readUuid(body['classId'], 'class_id');
    const subjectId = readUuid(body['subjectId'], 'subject_id');
    const [member] = await db.select().from(bbMembers)
      .where(and(eq(bbMembers.id, memberId), eq(bbMembers.schoolId, ctx.school.id))).limit(1);
    if (!member) fail(404, 'member_not_found');
    if (member.status === 'disabled') fail(409, 'member_disabled');
    const [klass] = await db.select({ id: bbClasses.id }).from(bbClasses)
      .where(and(eq(bbClasses.id, classId), eq(bbClasses.schoolId, ctx.school.id))).limit(1);
    if (!klass) fail(404, 'class_not_found');
    const [subject] = await db.select({ id: bbSubjects.id }).from(bbSubjects)
      .where(and(eq(bbSubjects.id, subjectId), eq(bbSubjects.schoolId, ctx.school.id))).limit(1);
    if (!subject) fail(404, 'subject_not_found');
    const [created] = await db.insert(bbTeachingAssignments).values({
      schoolId: ctx.school.id, memberId, classId, subjectId,
    }).onConflictDoNothing().returning();
    if (!created) fail(409, 'assignment_exists');
    await recordAudit(db, ctx, 'assignment.created', 'assignment', created.id, { memberId, classId, subjectId });
    res.status(201).json({ data: created });
  });

  router.delete('/assignments/:assignmentId', async (req, res) => {
    const ctx = requireCapability(res, 'staff.manage');
    const assignmentId = readUuid(req.params['assignmentId'], 'assignment_id');
    const [removed] = await db.delete(bbTeachingAssignments)
      .where(and(eq(bbTeachingAssignments.id, assignmentId), eq(bbTeachingAssignments.schoolId, ctx.school.id)))
      .returning({ id: bbTeachingAssignments.id });
    if (!removed) fail(404, 'assignment_not_found');
    await recordAudit(db, ctx, 'assignment.removed', 'assignment', assignmentId);
    res.status(204).end();
  });

  router.get('/audit', async (req, res) => {
    requireCapability(res, 'audit.read');
    const ctx = context(res);
    const limit = req.query['limit'] === undefined ? 100 : readInt(Number(req.query['limit']), 'limit', 1, 500);
    const rows = await db.select({
      id: bbAuditEvents.id,
      action: bbAuditEvents.action,
      subjectType: bbAuditEvents.subjectType,
      subjectId: bbAuditEvents.subjectId,
      details: bbAuditEvents.details,
      occurredAt: bbAuditEvents.occurredAt,
      memberName: bbMembers.displayName,
    }).from(bbAuditEvents)
      .leftJoin(bbMembers, eq(bbMembers.id, bbAuditEvents.memberId))
      .where(eq(bbAuditEvents.schoolId, ctx.school.id))
      .orderBy(desc(bbAuditEvents.occurredAt)).limit(limit);
    res.json({ data: rows });
  });

  router.get('/tenders', async (_req, res) => {
    const ctx = context(res);
    if (!isBBRole(ctx.member.role) || ctx.member.role !== 'principal') fail(403, 'forbidden');
    const rows = await db.select().from(bbTenderDrafts)
      .where(eq(bbTenderDrafts.schoolId, ctx.school.id))
      .orderBy(desc(bbTenderDrafts.createdAt)).limit(100);
    res.json({ data: rows });
  });

  router.post('/tenders', async (req, res) => {
    const ctx = requireCapability(res, 'tenders.write');
    const body = req.body as Record<string, unknown>;
    const title = readText(body['title'], 'title', 3, 160);
    const scope = readText(body['scope'], 'scope', 10, 8000);
    const estimatedCents = body['estimatedKes'] === undefined || body['estimatedKes'] === null
      ? null
      : (() => { try { return parseKesToCents(String(body['estimatedKes'])); } catch { return fail(400, 'invalid_estimate'); } })();
    const [created] = await db.insert(bbTenderDrafts).values({
      schoolId: ctx.school.id, title, scope, estimatedCents, createdByMemberId: ctx.member.id,
    }).returning();
    await recordAudit(db, ctx, 'tender_draft.created', 'tender_draft', created.id, { title });
    res.status(201).json({ data: created });
  });

  return router;
}
