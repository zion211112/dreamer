import express from 'express';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as identitySchema from '../src/server/db/schema';
import { createBenbenosRouter } from '../src/server/benbenos/router';

/**
 * End-to-end API tests against a real PostgreSQL database.
 *
 * Start it with: docker compose -f docker-compose.identity.yml up -d
 * Run with:      npx vitest run tests/benbenos.api.spec.ts
 * Override the database with BENBENOS_TEST_DATABASE_URL.
 */

const DATABASE_URL = process.env['BENBENOS_TEST_DATABASE_URL']
  ?? 'postgres://apt_labs:local-only-change-me@127.0.0.1:54329/benbenos';

type TestUser = { id: string; email: string; name: string };

const principal: TestUser = { id: 'test-principal', email: 'principal@shule.test', name: 'Amina Principal' };
const teacher: TestUser = { id: 'test-teacher', email: 'teacher@shule.test', name: 'Brian Teacher' };
const outsider: TestUser = { id: 'test-outsider', email: 'outsider@other.test', name: 'Cynthia Outsider' };

let pool: Pool;
let server: ReturnType<express.Express['listen']>;
let baseUrl: string;

const state: Record<string, string> = {};
const users = new Map<string, TestUser>([[principal.id, principal], [teacher.id, teacher], [outsider.id, outsider]]);

async function call(
  user: TestUser | null,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; json: any }> {
  const response = await fetch(`${baseUrl}/api/benbenos${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(user ? { 'x-test-user': user.id } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, json: text ? JSON.parse(text) : null };
}

beforeAll(async () => {
  pool = new Pool({ connectionString: DATABASE_URL, max: 4 });
  const db = drizzle(pool, { schema: identitySchema });

  const truncate = await pool.query<{ statement: string }>(
    "select 'TRUNCATE ' || string_agg(format('%I', tablename), ', ') || ' CASCADE' as statement "
    + "from pg_tables where schemaname = 'public' and tablename like 'bb\\_%'",
  );
  if (truncate.rows[0]?.statement) await pool.query(truncate.rows[0].statement);

  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/benbenos', createBenbenosRouter({
    db,
    identify: async (req) => {
      const user = users.get(req.get('x-test-user') ?? '');
      return user ? { authUserId: user.id, email: user.email, name: user.name } : null;
    },
  }));
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
});

describe('Benben-OS API', () => {
  it('requires a session', async () => {
    const response = await call(null, 'GET', '/me');
    expect(response.status).toBe(401);
  });

  it('onboards a school with the CBC subject catalogue', async () => {
    const response = await call(principal, 'POST', '/schools', {
      name: 'Shule ya Benben', code: 'bbs-001', county: 'Nairobi',
      year: { name: '2026', startsOn: '2026-01-05', endsOn: '2026-11-27' },
      terms: [
        { name: 'Term 1', ordinal: 1, startsOn: '2026-01-05', endsOn: '2026-04-10' },
        { name: 'Term 2', ordinal: 2, startsOn: '2026-05-04', endsOn: '2026-08-07' },
        { name: 'Term 3', ordinal: 3, startsOn: '2026-08-31', endsOn: '2026-11-27' },
      ],
    });
    expect(response.status).toBe(201);
    expect(response.json.data.school.code).toBe('BBS-001');
    state['schoolId'] = response.json.data.school.id;
    state['memberId'] = response.json.data.member.id;
    state['yearId'] = response.json.data.year.id;

    const subjects = await call(principal, 'GET', '/subjects');
    expect(subjects.status).toBe(200);
    expect(subjects.json.data.map((subject: { code: string }) => subject.code)).toContain('MAT');

    const terms = await call(principal, 'GET', '/years');
    state['termId'] = terms.json.data.terms.find((term: { ordinal: number }) => term.ordinal === 1).id;
    expect(terms.json.data.terms).toHaveLength(3);
  });

  it('reports the signed-in member, school and capabilities', async () => {
    const response = await call(principal, 'GET', '/me');
    expect(response.status).toBe(200);
    expect(response.json.data.member.role).toBe('principal');
    expect(response.json.data.capabilities).toContain('marks.confirm');
    expect(response.json.data.capabilities).toContain('fees.write');
  });

  it('creates a class and learners, and refuses a duplicate admission number', async () => {
    const klass = await call(principal, 'POST', '/classes', { name: 'Grade 4 East', gradeLevel: 4, yearId: state['yearId'] });
    expect(klass.status).toBe(201);
    state['classId'] = klass.json.data.id;

    const learner = await call(principal, 'POST', '/learners', {
      admissionNo: 'ADM-001', firstName: 'Wanjiku', lastName: 'Kamau',
      dateOfBirth: '2016-03-14', classId: state['classId'],
      guardian: { name: 'Grace Kamau', phone: '+254700000001', relationship: 'Mother' },
    });
    expect(learner.status).toBe(201);
    state['learner1'] = learner.json.data.id;

    const second = await call(principal, 'POST', '/learners', {
      admissionNo: 'ADM-002', firstName: 'Otieno', lastName: 'Odhiambo', classId: state['classId'],
    });
    expect(second.status).toBe(201);
    state['learner2'] = second.json.data.id;

    const duplicate = await call(principal, 'POST', '/learners', {
      admissionNo: 'ADM-001', firstName: 'Duplicate', lastName: 'Learner',
    });
    expect(duplicate.status).toBe(409);

    const list = await call(principal, 'GET', `/learners?classId=${state['classId']}`);
    expect(list.json.data).toHaveLength(2);
  });

  it('claims a staff invite only for the matching email and applies teacher scope', async () => {
    const invite = await call(principal, 'POST', '/staff', {
      email: teacher.email, displayName: teacher.name, role: 'teacher',
    });
    expect(invite.status).toBe(201);
    state['teacherMemberId'] = invite.json.data.id;

    const claimed = await call(teacher, 'GET', '/me');
    expect(claimed.status).toBe(200);
    expect(claimed.json.data.member.status).toBe('active');
    expect(claimed.json.data.member.role).toBe('teacher');

    const denied = await call(teacher, 'PUT', `/classes/${state['classId']}/attendance`, {
      day: '2026-02-02',
      records: [{ learnerId: state['learner1'], status: 'present' }],
    });
    expect(denied.status).toBe(403);
    expect(denied.json.error).toBe('not_your_class');

    const subjectList = await call(principal, 'GET', '/subjects');
    const maths = subjectList.json.data.find((subject: { code: string }) => subject.code === 'MAT');
    state['subjectId'] = maths.id;

    const assignment = await call(principal, 'POST', '/assignments', {
      memberId: state['teacherMemberId'], classId: state['classId'], subjectId: state['subjectId'],
    });
    expect(assignment.status).toBe(201);

    const allowed = await call(teacher, 'PUT', `/classes/${state['classId']}/attendance`, {
      day: '2026-02-02',
      records: [
        { learnerId: state['learner1'], status: 'present' },
        { learnerId: state['learner2'], status: 'absent' },
      ],
    });
    expect(allowed.status).toBe(200);
    expect(allowed.json.data.marked).toBe(2);

    const roster = await call(teacher, 'GET', `/classes/${state['classId']}/attendance?day=2026-02-02`);
    expect(roster.json.data.roster.map((row: { status: string }) => row.status).sort()).toEqual(['absent', 'present']);
  });

  it('auto-marks a paper, keeps it as a draft, and only a confirmer can publish it', async () => {
    const assessment = await call(principal, 'POST', '/assessments', {
      classId: state['classId'], subjectId: state['subjectId'], termId: state['termId'],
      title: 'End of topic: Plants', kind: 'formative', maxScore: 10,
      scheme: [
        { id: 'q1', type: 'mcq', marks: 4, correctOption: 2 },
        { id: 'q2', type: 'keyword', marks: 6, keywords: ['photosynthesis', 'chlorophyll'], minKeywords: 1 },
      ],
    });
    expect(assessment.status).toBe(201);
    state['assessmentId'] = assessment.json.data.id;

    const auto = await call(teacher, 'POST', `/assessments/${state['assessmentId']}/auto-mark`, {
      entries: [
        { learnerId: state['learner1'], answers: { q1: 2, q2: 'Plants use photosynthesis in leaves.' } },
        { learnerId: state['learner2'], answers: { q1: 0, q2: 'I do not remember.' } },
      ],
    });
    expect(auto.status).toBe(200);
    expect(auto.json.data.results.find((row: { learnerId: string }) => row.learnerId === state['learner1']).level).toBe('EE');
    expect(auto.json.data.results.find((row: { learnerId: string }) => row.learnerId === state['learner2']).score).toBe(0);

    const detail = await call(teacher, 'GET', `/assessments/${state['assessmentId']}`);
    expect(detail.json.data.roster.every((row: { mark: { status: string } | null }) => row.mark?.status === 'draft')).toBe(true);

    const teacherConfirm = await call(teacher, 'POST', `/assessments/${state['assessmentId']}/confirm`, {});
    expect(teacherConfirm.status).toBe(403);

    const confirmed = await call(principal, 'POST', `/assessments/${state['assessmentId']}/confirm`, {});
    expect(confirmed.status).toBe(200);
    expect(confirmed.json.data.confirmed).toBe(2);

    const editConfirmed = await call(teacher, 'PUT', `/assessments/${state['assessmentId']}/marks`, {
      entries: [{ learnerId: state['learner1'], score: 1 }],
    });
    expect(editConfirmed.status).toBe(409);
    expect(editConfirmed.json.error).toBe('mark_confirmed');
  });

  it('builds a term report from confirmed marks and attendance only', async () => {
    const report = await call(principal, 'GET', `/reports?classId=${state['classId']}&termId=${state['termId']}`);
    expect(report.status).toBe(200);
    const first = report.json.data.learners.find((row: { learnerId: string }) => row.learnerId === state['learner1']);
    expect(first.overallPercent).toBe(100);
    expect(first.overallLevel).toBe('EE');
    expect(first.subjects[0].subjectCode).toBe('MAT');
    expect(first.attendanceRate).toBe(100);
  });

  it('invoices a class, records a payment, and reports the balance', async () => {
    const fee = await call(principal, 'POST', '/fees/structures', {
      yearId: state['yearId'], name: 'Termly tuition', amountKes: '12,500',
    });
    expect(fee.status).toBe(201);
    expect(fee.json.data.amountCents).toBe(1250000);
    state['feeId'] = fee.json.data.id;

    const invoices = await call(principal, 'POST', '/fees/invoices', {
      termId: state['termId'], feeStructureId: state['feeId'],
    });
    expect(invoices.status).toBe(201);
    expect(invoices.json.data.created).toBe(2);

    const repeat = await call(principal, 'POST', '/fees/invoices', {
      termId: state['termId'], feeStructureId: state['feeId'],
    });
    expect(repeat.json.data.created).toBe(0);

    const payment = await call(principal, 'POST', '/fees/payments', {
      learnerId: state['learner1'], amountKes: '5000', method: 'mpesa', reference: 'MPESA-1',
    });
    expect(payment.status).toBe(201);

    const duplicate = await call(principal, 'POST', '/fees/payments', {
      learnerId: state['learner1'], amountKes: '5000', method: 'mpesa', reference: 'MPESA-1',
    });
    expect(duplicate.status).toBe(409);

    const ledger = await call(principal, 'GET', `/fees/ledger?termId=${state['termId']}`);
    expect(ledger.json.data.totals.invoicedCents).toBe(2500000);
    expect(ledger.json.data.totals.paidCents).toBe(500000);
    expect(ledger.json.data.totals.balanceCents).toBe(2000000);
  });

  it('keeps another school out of this school’s learner records', async () => {
    const other = await call(outsider, 'POST', '/schools', { name: 'Other School', code: 'OTH-1' });
    expect(other.status).toBe(201);

    const learners = await call(outsider, 'GET', '/learners');
    expect(learners.status).toBe(200);
    expect(learners.json.data).toHaveLength(0);

    const peek = await call(outsider, 'GET', `/learners/${state['learner1']}`);
    expect(peek.status).toBe(404);

    const headerPeek = await call(outsider, 'GET', '/learners', undefined, { 'x-benben-school': state['schoolId'] });
    expect(headerPeek.status).toBe(403);
    expect(headerPeek.json.error).toBe('school_not_permitted');
  });

  it('records an audit trail and keeps tender drafts principal-only', async () => {
    const audit = await call(principal, 'GET', '/audit');
    expect(audit.status).toBe(200);
    expect(audit.json.data.map((row: { action: string }) => row.action)).toEqual(
      expect.arrayContaining(['school.created', 'learner.created', 'marks.confirmed', 'payment.recorded']),
    );

    const teacherAudit = await call(teacher, 'GET', '/audit');
    expect(teacherAudit.status).toBe(403);

    const draft = await call(principal, 'POST', '/tenders', {
      title: 'Supply of Grade 4 readers', scope: 'Procure 300 approved Grade 4 readers for the 2026 school year.', estimatedKes: '150000',
    });
    expect(draft.status).toBe(201);

    const teacherTenders = await call(teacher, 'GET', '/tenders');
    expect(teacherTenders.status).toBe(403);
  });

  it('summarises the day for the principal dashboard', async () => {
    // The dashboard bills the term that contains today, so make sure that term
    // has invoices regardless of when this suite runs.
    const terms = await call(principal, 'GET', '/years');
    await call(principal, 'POST', '/fees/invoices', {
      termId: terms.json.data.currentTermId, feeStructureId: state['feeId'],
    });

    const overview = await call(principal, 'GET', '/overview');
    expect(overview.status).toBe(200);
    expect(overview.json.data.counts.learners).toBe(2);
    expect(overview.json.data.counts.classes).toBe(1);
    expect(overview.json.data.fees.invoicedCents).toBe(2500000);
    expect(overview.json.data.fees.paidCents).toBe(500000);
  });
});
