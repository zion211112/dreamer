import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CBC_SUBJECTS } from '../libs/benbenos/src/cbc';
import { markSubmission, type SchemeQuestion } from '../libs/benbenos/src/marking';
import * as identitySchema from '../src/server/db/schema';
import {
  bbAcademicYears, bbAssessments, bbAttendance, bbClasses, bbEnrolments, bbFeeStructures,
  bbGuardians, bbInvoices, bbLearners, bbMarks, bbMembers, bbPayments, bbSchools, bbSubjects,
  bbTeachingAssignments, bbTerms,
} from '../src/server/benbenos/schema';

/**
 * Seeds a demonstration school. Refuses to touch a database that already has
 * the demo school. Never run this against a database with real learner data.
 *
 *   BENBENOS_DATABASE_URL=postgres://... npx tsx scripts/seed-benbenos.ts
 *
 * Sign in to the console afterwards with the invited principal email
 * (principal@benben.demo); the first sign-in with that address claims the invite.
 */

const url = process.env['BENBENOS_DATABASE_URL'] ?? process.env['DATABASE_URL'];
if (!url) {
  console.error('Set BENBENOS_DATABASE_URL (or DATABASE_URL) to the Benben-OS database.');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 2 });
const db = drizzle(pool, { schema: identitySchema });

const DEMO_CODE = 'BENBEN-DEMO';
const today = new Date();
const iso = (date: Date) => date.toISOString().slice(0, 10);
const year = today.getUTCFullYear();
const name = (first: string, last: string) => ({ firstName: first, lastName: last });

const CLASSES = [
  { name: 'Grade 4 East', gradeLevel: 4 },
  { name: 'Grade 5 West', gradeLevel: 5 },
];

const LEARNERS = [
  name('Wanjiku', 'Kamau'), name('Otieno', 'Odhiambo'), name('Achieng', 'Owuor'),
  name('Brian', 'Kiptoo'), name('Faith', 'Njeri'), name('Hassan', 'Abdi'),
  name('Mercy', 'Chebet'), name('Kevin', 'Mwangi'), name('Zawadi', 'Juma'),
  name('Peter', 'Onyango'), name('Lydia', 'Wafula'), name('Samuel', 'Kariuki'),
];

const GUARDIANS = [
  ['Grace Kamau', 'Mother'], ['Joseph Odhiambo', 'Father'], ['Mary Owuor', 'Mother'],
  ['Daniel Kiptoo', 'Father'], ['Esther Njeri', 'Mother'], ['Halima Abdi', 'Mother'],
  ['Rebecca Chebet', 'Aunt'], ['Alice Mwangi', 'Mother'], ['Salim Juma', 'Father'],
  ['Rose Onyango', 'Mother'], ['Wekesa Wafula', 'Father'], ['Jane Kariuki', 'Mother'],
];

const STAFF = [
  { email: 'principal@benben.demo', displayName: 'Amina Wanjala', role: 'principal' as const },
  { email: 'registrar@benben.demo', displayName: 'Tobias Mwangi', role: 'registrar' as const },
  { email: 'teacher@benben.demo', displayName: 'Catherine Achieng', role: 'teacher' as const },
  { email: 'teacher2@benben.demo', displayName: 'David Kipchoge', role: 'teacher' as const },
  { email: 'bursar@benben.demo', displayName: 'Naomi Wairimu', role: 'bursar' as const },
];

const MAT_SCHEME: SchemeQuestion[] = [
  { id: 'q1', type: 'mcq', marks: 4, correctOption: 1 },
  { id: 'q2', type: 'mcq', marks: 3, correctOption: 2 },
  { id: 'q3', type: 'keyword', marks: 3, keywords: ['fraction', 'numerator', 'denominator'], minKeywords: 2 },
];
const ENG_SCHEME: SchemeQuestion[] = [
  { id: 'q1', type: 'mcq', marks: 5, correctOption: 0 },
  { id: 'q2', type: 'keyword', marks: 5, keywords: ['because', 'reason'], minKeywords: 1 },
];

async function main(): Promise<void> {
  const [existing] = await db.select({ id: bbSchools.id }).from(bbSchools).where(eq(bbSchools.code, DEMO_CODE)).limit(1);
  if (existing) {
    console.log(`Demo school ${DEMO_CODE} already exists (${existing.id}); nothing to do.`);
    return;
  }

  const [school] = await db.insert(bbSchools).values({
    name: 'Benben Primary School', code: DEMO_CODE, county: 'Nairobi',
  }).returning();

  const members = await db.insert(bbMembers).values(STAFF.map((member) => ({
    schoolId: school.id, email: member.email, displayName: member.displayName,
    role: member.role, status: 'invited' as const,
  }))).returning();
  const principal = members[0]!;
  const teacherOne = members[2]!;
  const teacherTwo = members[3]!;

  await db.insert(bbSubjects).values(CBC_SUBJECTS.map((subject) => ({
    schoolId: school.id, code: subject.code, name: subject.name,
  })));
  const subjects = await db.select().from(bbSubjects).where(eq(bbSubjects.schoolId, school.id));
  const maths = subjects.find((subject) => subject.code === 'MAT')!;
  const english = subjects.find((subject) => subject.code === 'ENG')!;

  const [academicYear] = await db.insert(bbAcademicYears).values({
    schoolId: school.id, name: String(year), startsOn: `${year}-01-05`, endsOn: `${year}-11-27`,
  }).returning();
  const terms = await db.insert(bbTerms).values([
    { schoolId: school.id, yearId: academicYear.id, name: 'Term 1', ordinal: 1, startsOn: `${year}-01-05`, endsOn: `${year}-04-10` },
    { schoolId: school.id, yearId: academicYear.id, name: 'Term 2', ordinal: 2, startsOn: `${year}-05-04`, endsOn: `${year}-08-07` },
    { schoolId: school.id, yearId: academicYear.id, name: 'Term 3', ordinal: 3, startsOn: `${year}-08-31`, endsOn: `${year}-11-27` },
  ]).returning();
  const currentTerm = terms.find((term) => term.startsOn <= iso(today) && term.endsOn >= iso(today)) ?? terms[terms.length - 1]!;

  const classes = await db.insert(bbClasses).values(CLASSES.map((klass) => ({
    schoolId: school.id, yearId: academicYear.id, name: klass.name, gradeLevel: klass.gradeLevel,
  }))).returning();

  const learners = await db.insert(bbLearners).values(LEARNERS.map((learner, index) => ({
    schoolId: school.id,
    admissionNo: `${year}-${String(index + 1).padStart(3, '0')}`,
    firstName: learner.firstName,
    lastName: learner.lastName,
    dateOfBirth: `${year - 10 - (index % 2)}-0${(index % 9) + 1}-1${index % 9}`,
  }))).returning();

  await db.insert(bbGuardians).values(learners.map((learner, index) => ({
    schoolId: school.id, learnerId: learner.id,
    name: GUARDIANS[index]![0]!, relationship: GUARDIANS[index]![1]!,
    phone: `+2547000${String(index).padStart(5, '0')}`,
    isPrimary: true,
  })));

  await db.insert(bbEnrolments).values(learners.map((learner, index) => ({
    schoolId: school.id, yearId: academicYear.id, learnerId: learner.id,
    classId: classes[index % classes.length]!.id,
  })));

  await db.insert(bbTeachingAssignments).values([
    { schoolId: school.id, memberId: teacherOne.id, classId: classes[0]!.id, subjectId: maths.id },
    { schoolId: school.id, memberId: teacherOne.id, classId: classes[0]!.id, subjectId: english.id },
    { schoolId: school.id, memberId: teacherTwo.id, classId: classes[1]!.id, subjectId: maths.id },
    { schoolId: school.id, memberId: teacherTwo.id, classId: classes[1]!.id, subjectId: english.id },
  ]);

  // Ten recent weekdays of attendance, with a deterministic spread of statuses.
  const days: string[] = [];
  const cursor = new Date(today);
  while (days.length < 10) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) days.push(iso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const attendance = [];
  for (const day of days) {
    for (const learner of learners) {
      const seat = learners.indexOf(learner);
      const status = (seat + day.charCodeAt(9)) % 11 === 0 ? 'absent' : (seat + day.charCodeAt(9)) % 13 === 0 ? 'late' : 'present';
      attendance.push({
        schoolId: school.id, classId: classes[seat % classes.length]!.id,
        learnerId: learner.id, day, status, markedByMemberId: principal.id,
      });
    }
  }
  await db.insert(bbAttendance).values(attendance);

  const assessmentRows = await db.insert(bbAssessments).values([
    { schoolId: school.id, yearId: academicYear.id, termId: currentTerm.id, classId: classes[0]!.id, subjectId: maths.id, title: 'Numbers: end of topic', kind: 'formative' as const, maxScore: 10, scheme: MAT_SCHEME, createdByMemberId: teacherOne.id },
    { schoolId: school.id, yearId: academicYear.id, termId: currentTerm.id, classId: classes[0]!.id, subjectId: english.id, title: 'Reading comprehension', kind: 'summative' as const, maxScore: 10, scheme: ENG_SCHEME, createdByMemberId: teacherOne.id },
  ]).returning();

  const markRows = [];
  for (const assessment of assessmentRows) {
    const scheme = assessment.scheme as SchemeQuestion[];
    const klassLearners = learners.filter((_, index) => index % classes.length === 0);
    for (const [index, learner] of klassLearners.entries()) {
      const answers: Record<string, number | string> = {};
      for (const question of scheme) {
        if (question.type === 'mcq') {
          answers[question.id] = (index + question.correctOption) % 4 === 0 ? question.correctOption : (question.correctOption + 1) % 3;
        } else {
          answers[question.id] = index % 2 === 0 ? question.keywords.join(' and ') : 'I am not sure.';
        }
      }
      const marked = markSubmission(scheme, answers);
      markRows.push({
        schoolId: school.id, assessmentId: assessment.id, learnerId: learner.id,
        score: marked.score, source: 'auto' as const, status: 'draft' as const,
        answers: { responses: answers, breakdown: marked.questions },
        enteredByMemberId: teacherOne.id,
      });
    }
  }
  await db.insert(bbMarks).values(markRows);

  const [fee] = await db.insert(bbFeeStructures).values({
    schoolId: school.id, yearId: academicYear.id, name: 'Termly tuition', amountCents: 1250000,
  }).returning();

  await db.insert(bbInvoices).values(learners.map((learner) => ({
    schoolId: school.id, termId: currentTerm.id, learnerId: learner.id,
    feeStructureId: fee.id, amountCents: fee.amountCents,
  })));

  await db.insert(bbPayments).values(learners.flatMap((learner, index) => {
    if (index % 4 === 0) return [{
      schoolId: school.id, learnerId: learner.id, amountCents: 1250000,
      method: 'mpesa' as const, reference: `DEMO-MPESA-${index}`, recordedByMemberId: principal.id,
    }];
    if (index % 4 === 1) return [{
      schoolId: school.id, learnerId: learner.id, amountCents: 500000,
      method: 'bank' as const, reference: `DEMO-BANK-${index}`, recordedByMemberId: principal.id,
    }];
    return [];
  }));

  console.log([
    `Seeded ${school.name} (${DEMO_CODE}).`,
    `  principal invite: ${principal.email}`,
    `  classes: ${classes.length}, learners: ${learners.length}, assessments: ${assessmentRows.length}, draft marks: ${markRows.length}`,
    `  current term: ${currentTerm.name}; sign in and the invite is claimed automatically.`,
  ].join('\n'));
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
