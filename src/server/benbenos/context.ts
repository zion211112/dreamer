import { and, eq, isNull, or } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { can, type BBCapability, type BBRole } from '../../../libs/benbenos/src/permissions';
import type { db as identityDb } from '../db/client';
import { bbAuditEvents, bbMembers, bbSchools, bbTeachingAssignments } from './schema';

/**
 * Benben-OS request context.
 *
 * A member is resolved from the authenticated session on every request; the
 * browser never sends a role, a school id it does not belong to, or a member id.
 */

export type Database = typeof identityDb;
export type BenbenosDatabase = Database;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export type Identity = { authUserId: string; email: string; name: string };
export type Identify = (req: Request) => Promise<Identity | null>;

export type Member = { id: string; schoolId: string; email: string; displayName: string; role: BBRole; status: string };
export type School = { id: string; name: string; code: string; county: string | null };

export type BenbenosContext = {
  db: Database;
  user: Identity;
  member: Member;
  school: School;
  memberships: { school: School; role: BBRole }[];
};

export class HttpError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = 'HttpError';
  }
}

export function fail(status: number, code: string): never {
  throw new HttpError(status, code);
}

export function context(res: Response): BenbenosContext {
  const value = res.locals['benbenos'] as BenbenosContext | undefined;
  if (!value) throw new HttpError(500, 'context_missing');
  return value;
}

export function requireCapability(res: Response, capability: BBCapability): BenbenosContext {
  const ctx = context(res);
  if (!can(ctx.member.role, capability)) fail(403, 'forbidden');
  return ctx;
}

function toMember(row: typeof bbMembers.$inferSelect): Member {
  return {
    id: row.id,
    schoolId: row.schoolId,
    email: row.email,
    displayName: row.displayName,
    role: row.role as BBRole,
    status: row.status,
  };
}

function toSchool(row: typeof bbSchools.$inferSelect): School {
  return { id: row.id, name: row.name, code: row.code, county: row.county };
}

/**
 * Links a pending invite to the signed-in account the first time that person
 * reaches the console. Matching is on the exact stored email; a member who was
 * already linked to a different account is never re-pointed.
 */
async function claimInvites(db: Database, user: Identity): Promise<void> {
  await db.update(bbMembers)
    .set({ authUserId: user.authUserId, status: 'active' })
    .where(and(
      eq(bbMembers.email, user.email.toLowerCase()),
      isNull(bbMembers.authUserId),
      eq(bbMembers.status, 'invited'),
    ));
}

export async function resolveContext(
  db: Database,
  user: Identity,
  requestedSchoolId: string | undefined,
): Promise<BenbenosContext> {
  await claimInvites(db, user);
  const rows = await db.select({ member: bbMembers, school: bbSchools })
    .from(bbMembers)
    .innerJoin(bbSchools, eq(bbSchools.id, bbMembers.schoolId))
    .where(and(eq(bbMembers.authUserId, user.authUserId), eq(bbMembers.status, 'active')));

  if (rows.length === 0) fail(403, 'no_school_membership');
  const memberships = rows.map((row) => ({ school: toSchool(row.school), role: row.member.role as BBRole }));
  const chosen = requestedSchoolId ? rows.find((row) => row.member.schoolId === requestedSchoolId) : undefined;
  if (requestedSchoolId && !chosen) fail(403, 'school_not_permitted');
  if (!chosen && rows.length > 1) fail(400, 'school_selection_required');
  const active = chosen ?? rows[0];
  return { db, user, member: toMember(active.member), school: toSchool(active.school), memberships };
}

/** Resolves the identity, then the school member and school for the request. */
export function authenticate(db: Database, identify: Identify) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await identify(req);
      if (!user) return next(new HttpError(401, 'unauthenticated'));
      const requested = req.get('x-benben-school')?.trim() || undefined;
      res.locals['benbenos'] = await resolveContext(db, user, requested);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export async function recordAudit(
  tx: Transaction | Database,
  ctx: { member: Member; school: School },
  action: string,
  subjectType: string,
  subjectId: string | null,
  details: Record<string, unknown> = {},
): Promise<void> {
  await tx.insert(bbAuditEvents).values({
    schoolId: ctx.school.id,
    memberId: ctx.member.id,
    action,
    subjectType,
    subjectId,
    details,
  });
}

/** Teachers may only touch the classes/subjects they are assigned to. */
export async function teachesClassSubject(db: Database | Transaction, memberId: string, classId: string, subjectId: string): Promise<boolean> {
  const [row] = await db.select({ id: bbTeachingAssignments.id }).from(bbTeachingAssignments)
    .where(and(
      eq(bbTeachingAssignments.memberId, memberId),
      eq(bbTeachingAssignments.classId, classId),
      eq(bbTeachingAssignments.subjectId, subjectId),
    )).limit(1);
  return !!row;
}

/** A teacher may mark attendance for a class they teach any subject in. */
export async function teachesClass(db: Database | Transaction, memberId: string, classId: string): Promise<boolean> {
  const [row] = await db.select({ id: bbTeachingAssignments.id }).from(bbTeachingAssignments)
    .where(and(eq(bbTeachingAssignments.memberId, memberId), eq(bbTeachingAssignments.classId, classId))).limit(1);
  return !!row;
}

export function mayActOnWholeSchool(role: BBRole): boolean {
  return role === 'principal' || role === 'registrar';
}

/* ---------- request validation ---------- */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) fail(400, `invalid_${field}`);
  return value;
}

export function readText(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) fail(400, `invalid_${field}`);
  return value.trim();
}

export function readOptionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > max) fail(400, `invalid_${field}`);
  return value.trim();
}

export function readInt(value: unknown, field: string, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max) fail(400, `invalid_${field}`);
  return value as number;
}

export function readDate(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400, `invalid_${field}`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(400, `invalid_${field}`);
  return value;
}

export function readOneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) fail(400, `invalid_${field}`);
  return value as T;
}

export function readArray(value: unknown, field: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail(400, `invalid_${field}`);
  return value;
}

export function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') fail(400, `invalid_${field}`);
  return value;
}

export { or };
