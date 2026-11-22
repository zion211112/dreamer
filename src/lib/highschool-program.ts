/**
 * APT-LABS — High School Build Programme.
 *
 * High school students learn productive skills by contributing to real
 * community projects posted in Commons. Contributions earn verified outcomes
 * and apt-coins. Built on existing Actor, Activity, and Evidence structures.
 */

import { createRecord, getRecord, listRecords, type RecordEnvelope } from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { createRelationship } from './relationship-store';

export interface StudentProfileData {
  schoolName: string;
  county: string;
  grade: string;
  skills: string[];
  mentorId: string | null;
  verifiedOutcomes: number;
  aptCoinsEarned: number;
}

export interface RegisterStudentInput {
  schoolName: string;
  county: string;
  grade: string;
  skills: string[];
  mentorId: string | null;
  actorId: string;
  registeredBy: string;
  authz?: AuthzContext;
}

export interface JoinBuildProgrammeInput {
  studentActorId: string;
  commitmentId: string;
  projectTitle: string;
  joinedBy: string;
  authz?: AuthzContext;
}

export interface LogContributionInput {
  studentActorId: string;
  projectTitle: string;
  contribution: string;
  evidenceIds: string[];
  loggedBy: string;
  authz?: AuthzContext;
}

function studentData(rec: RecordEnvelope): StudentProfileData {
  return rec.data as unknown as StudentProfileData;
}

/**
 * Register a high school student as an actor. Gated by `actor:write`.
 */
export function registerStudent(input: RegisterStudentInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'actor:write');
  }

  const record = createRecord({
    family: 'ACTOR',
    type: 'Student',
    data: {
      schoolName: input.schoolName,
      county: input.county,
      grade: input.grade,
      skills: input.skills,
      mentorId: input.mentorId,
      verifiedOutcomes: 0,
      aptCoinsEarned: 0,
    },
    actorId: input.actorId,
    createdBy: input.registeredBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.registeredBy,
    actorId: input.actorId,
    action: 'actor.create',
    resourceType: 'actor',
    resourceId: record.id,
    details: { schoolName: input.schoolName, county: input.county, grade: input.grade },
  });

  return record;
}

/**
 * Student joins the build programme by accepting a work commitment.
 */
export function joinBuildProgramme(input: JoinBuildProgrammeInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'work:execute');
  }

  const commitment = getRecord(input.commitmentId);
  if (!commitment) throw new Error(`Commitment not found: ${input.commitmentId}`);

  const record = createRecord({
    family: 'ACTIVITY',
    type: 'StudentBuildParticipation',
    data: {
      studentActorId: input.studentActorId,
      commitmentId: input.commitmentId,
      projectTitle: input.projectTitle,
    },
    actorId: commitment.actorId ?? null,
    createdBy: input.joinedBy,
    evidenceIds: [],
    authz: input.authz,
  });

  createRelationship({
    kind: 'PARTICIPATES_IN',
    sourceId: input.studentActorId,
    targetId: input.commitmentId,
    sourceRole: 'student',
    targetRole: 'commitment',
    actorId: commitment.actorId ?? null,
    createdBy: input.joinedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.joinedBy,
    actorId: input.studentActorId,
    action: 'commitment.accept',
    resourceType: 'activity',
    resourceId: record.id,
    details: { projectTitle: input.projectTitle },
  });

  return record;
}

/**
 * Log a student's contribution to a project, with evidence.
 */
export function logContribution(input: LogContributionInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'evidence:write');
  }

  const record = createRecord({
    family: 'ACTIVITY',
    type: 'StudentContribution',
    data: {
      studentActorId: input.studentActorId,
      projectTitle: input.projectTitle,
      contribution: input.contribution,
    },
    actorId: null,
    createdBy: input.loggedBy,
    evidenceIds: input.evidenceIds,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.loggedBy,
    actorId: input.studentActorId,
    action: 'evidence.create',
    resourceType: 'activity',
    resourceId: record.id,
    details: { projectTitle: input.projectTitle },
  });

  return record;
}

/**
 * Get the student ledger: verified outcomes and apt-coins earned.
 */
export function studentLedger(studentActorId: string): {
  studentId: string;
  verifiedOutcomes: number;
  aptCoinsEarned: number;
  contributions: RecordEnvelope[];
} | undefined {
  const student = listRecords({ family: 'ACTOR', type: 'Student' }).find(
    (r) => r.actorId === studentActorId,
  );
  if (!student) return undefined;

  const d = studentData(student);
  const contributions = listRecords({ family: 'ACTIVITY', type: 'StudentContribution' }).filter(
    (r) => (r.data as { studentActorId?: string }).studentActorId === studentActorId,
  );

  return {
    studentId: student.id,
    verifiedOutcomes: d.verifiedOutcomes,
    aptCoinsEarned: d.aptCoinsEarned,
    contributions,
  };
}

/**
 * List students.
 */
export function listStudents(): RecordEnvelope[] {
  return listRecords({ family: 'ACTOR', type: 'Student' });
}