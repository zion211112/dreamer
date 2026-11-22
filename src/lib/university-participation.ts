/**
 * APT-LABS — University participation layer.
 *
 * Universities participate as institutional actors: post research needs,
 * host student projects, issue credentials. Built on the existing Actor,
 * Intention, and Credential structures — no new entity types required.
 */

import { createRecord, getRecord, listRecords, type RecordEnvelope } from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { createRelationship } from './relationship-store';

export interface UniversityProfileData {
  name: string;
  county: string;
  researchFocus: string[];
  credentialIssuer: boolean;
  establishedAt: string | null;
}

export interface RegisterUniversityInput {
  name: string;
  county: string;
  researchFocus: string[];
  credentialIssuer: boolean;
  actorId: string;
  registeredBy: string;
  authz?: AuthzContext;
}

export interface PostResearchNeedInput {
  universityId: string;
  title: string;
  description: string;
  requires?: string[];
  postedBy: string;
  authz?: AuthzContext;
}

export interface HostStudentProjectInput {
  universityId: string;
  studentActorId: string;
  projectTitle: string;
  commitmentId: string;
  hostedBy: string;
  authz?: AuthzContext;
}

export interface IssueCredentialInput {
  subjectId: string;
  undertakingId: string;
  undertakingTitle: string;
  role: string;
  claims: string[];
  evidenceIds: string[];
  issuedBy: string;
  authz?: AuthzContext;
}

/**
 * Register a university as an institutional actor. Gated by `actor:write`.
 */
export function registerUniversity(input: RegisterUniversityInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'actor:write');
  }

  const record = createRecord({
    family: 'ACTOR',
    type: 'University',
    data: {
      name: input.name,
      county: input.county,
      researchFocus: input.researchFocus,
      credentialIssuer: input.credentialIssuer,
      establishedAt: new Date().toISOString(),
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
    details: { name: input.name, county: input.county },
  });

  return record;
}

/**
 * Post a research need as an INTENTION of type ResearchNeed.
 */
export function postResearchNeed(input: PostResearchNeedInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'intention:write');
  }

  const record = createRecord({
    family: 'INTENTION',
    type: 'ResearchNeed',
    data: {
      universityId: input.universityId,
      title: input.title,
      description: input.description,
      requires: input.requires ?? [],
      status: 'open',
    },
    actorId: input.universityId,
    createdBy: input.postedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.postedBy,
    actorId: input.universityId,
    action: 'intention.create',
    resourceType: 'intention',
    resourceId: record.id,
    details: { title: input.title, universityId: input.universityId },
  });

  return record;
}

/**
 * Host a student project: link a student actor to a university commitment.
 */
export function hostStudentProject(input: HostStudentProjectInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'work:write');
  }

  const commitment = getRecord(input.commitmentId);
  if (!commitment) throw new Error(`Commitment not found: ${input.commitmentId}`);

  const record = createRecord({
    family: 'ACTIVITY',
    type: 'StudentProjectHost',
    data: {
      universityId: input.universityId,
      studentActorId: input.studentActorId,
      projectTitle: input.projectTitle,
      commitmentId: input.commitmentId,
    },
    actorId: input.universityId,
    createdBy: input.hostedBy,
    evidenceIds: [],
    authz: input.authz,
  });

  createRelationship({
    kind: 'HOSTS',
    sourceId: input.universityId,
    targetId: input.studentActorId,
    sourceRole: 'university',
    targetRole: 'student',
    actorId: input.universityId,
    createdBy: input.hostedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.hostedBy,
    actorId: input.universityId,
    action: 'commitment.create',
    resourceType: 'activity',
    resourceId: record.id,
    details: { projectTitle: input.projectTitle, studentActorId: input.studentActorId },
  });

  return record;
}

/**
 * List universities.
 */
export function listUniversities(): RecordEnvelope[] {
  return listRecords({ family: 'ACTOR', type: 'University' });
}

/**
 * Get a university by id.
 */
export function getUniversity(id: string): RecordEnvelope | undefined {
  return getRecord(id);
}

/**
 * List research needs posted by universities.
 */
export function listResearchNeeds(): RecordEnvelope[] {
  return listRecords({ family: 'INTENTION', type: 'ResearchNeed' });
}