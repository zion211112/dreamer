/**
 * APT-LABS — Commitment Graph (Stage 1 Foundation)
 *
 * Maps promises, responsibilities, resources, dependencies, deadlines, acceptance across organizations.
 *
 * Commitment = promise + responsibilities + resources + dependencies + deadlines + acceptance criteria
 * Cross-organizational: commitments can involve multiple organizations
 * Dependency mapping: commitment A blocks commitment B
 * Deadline tracking with alerts
 * Acceptance criteria linked to evidence requirements
 * Graph traversal: given a commitment, show all upstream/downstream dependencies
 * Query: "What commitments is org X responsible for?" "What blocks commitment Y?"
 */

import {
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  type RecordEnvelope,
} from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import {
  getActor,
  type Actor,
  getOrganization,
  type Organization,
} from './actors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommitmentStatus = 'proposed' | 'accepted' | 'in_progress' | 'fulfilled' | 'revoked' | 'blocked';

export type DependencyType = 'blocks' | 'is_blocked_by' | 'requires' | 'enables';

export interface CommitmentData {
  title: string;
  description?: string;
  organizationId: string;
  responsibleActorIds: string[];
  assigneeActorIds: string[];
  status: CommitmentStatus;
  committedAt: string;
  deadline?: string;
  dependsOnCommitmentIds: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  resourceIds: string[];
  needId?: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  [key: string]: unknown;
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
  evidenceType: string;
  minEvidenceStanding: string;
  satisfiedByEvidenceIds: string[];
  isMet: boolean;
  [key: string]: unknown;
}

export interface CommitmentNode {
  commitment: RecordEnvelope;
  data: CommitmentData;
  upstream: CommitmentNode[];
  downstream: CommitmentNode[];
  organization: Organization | undefined;
  assignees: Actor[];
  daysUntilDeadline?: number;
  isBlocked: boolean;
  blockedBy: CommitmentNode[];
  criteriaProgress: { total: number; met: number };
}

export interface CommitmentDependency {
  fromCommitmentId: string;
  toCommitmentId: string;
  type: DependencyType;
  createdAt: string;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const DEPENDENCIES_KEY = 'aptlabs:commitment-dependencies';

import { readJson, writeJson } from './storage';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readDependencies(): CommitmentDependency[] {
  return readJson<CommitmentDependency[]>(DEPENDENCIES_KEY, []);
}

function writeDependencies(deps: CommitmentDependency[]): void {
  writeJson(DEPENDENCIES_KEY, deps);
}

function commitmentData(rec: RecordEnvelope): CommitmentData {
  return rec.data as unknown as CommitmentData;
}

// ---------------------------------------------------------------------------
// Commitment CRUD
// ---------------------------------------------------------------------------

export interface CreateCommitmentInput {
  title: string;
  description?: string;
  organizationId: string;
  responsibleActorIds: string[];
  assigneeActorIds: string[];
  deadline?: string;
  dependsOnCommitmentIds?: string[];
  acceptanceCriteria: Omit<AcceptanceCriterion, 'id' | 'satisfiedByEvidenceIds' | 'isMet'>[];
  resourceIds?: string[];
  needId?: string;
  createdBy: string;
  authz?: AuthzContext;
}

export interface UpdateCommitmentInput {
  title?: string;
  description?: string;
  status?: CommitmentStatus;
  deadline?: string;
  responsibleActorIds?: string[];
  assigneeActorIds?: string[];
  acceptanceCriteria?: AcceptanceCriterion[];
  resourceIds?: string[];
  dependsOnCommitmentIds?: string[];
  updatedBy: string;
  authz?: AuthzContext;
}

/**
 * Create a new commitment.
 */
export function createCommitment(input: CreateCommitmentInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:write');
  }

  const now = nowIso();
  const criteria: AcceptanceCriterion[] = input.acceptanceCriteria.map((c) => {
    const { description, evidenceType, minEvidenceStanding } = c;
    return {
      id: createId('criterion'),
      description,
      evidenceType,
      minEvidenceStanding,
      satisfiedByEvidenceIds: [],
      isMet: false,
    } as AcceptanceCriterion;
  });

  const data: CommitmentData = {
    title: input.title,
    description: input.description,
    organizationId: input.organizationId,
    responsibleActorIds: input.responsibleActorIds,
    assigneeActorIds: input.assigneeActorIds,
    status: 'proposed',
    committedAt: now,
    deadline: input.deadline,
    dependsOnCommitmentIds: input.dependsOnCommitmentIds ?? [],
    acceptanceCriteria: criteria,
    resourceIds: input.resourceIds ?? [],
    needId: input.needId,
    version: 1,
    updatedAt: now,
    updatedBy: input.createdBy,
  };

  const commitment = createRecord({
    family: 'COMMITMENT',
    type: 'Commitment',
    data,
    actorId: input.organizationId,
    createdBy: input.createdBy,
    authz: input.authz,
  });

  // Create dependency edges
  const dependencies = readDependencies();
  for (const depId of data.dependsOnCommitmentIds) {
    dependencies.push({
      fromCommitmentId: depId,
      toCommitmentId: commitment.id,
      type: 'blocks',
      createdAt: now,
      createdBy: input.createdBy,
    });
  }
  writeDependencies(dependencies);

  // If linked to a need, create ANSWERS relationship
  if (input.needId) {
    // Note: relationship creation would go here if we had the function
    // createRelationship({ ... })
  }

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.organizationId,
    action: 'commitment.create',
    resourceType: 'commitment',
    resourceId: commitment.id,
    details: { title: input.title, organizationId: input.organizationId },
  });

  return commitment;
}

/**
 * Update a commitment.
 */
export function updateCommitment(commitmentId: string, input: UpdateCommitmentInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:write');
  }

  const commitment = getRecord(commitmentId);
  if (!commitment || commitment.family !== 'COMMITMENT') return undefined;

  const data = commitmentData(commitment);
  const now = nowIso();

  const updatedData: CommitmentData = {
    ...data,
    title: input.title ?? data.title,
    description: input.description ?? data.description,
    status: input.status ?? data.status,
    deadline: input.deadline ?? data.deadline,
    responsibleActorIds: input.responsibleActorIds ?? data.responsibleActorIds,
    assigneeActorIds: input.assigneeActorIds ?? data.assigneeActorIds,
    acceptanceCriteria: input.acceptanceCriteria ?? data.acceptanceCriteria,
    resourceIds: input.resourceIds ?? data.resourceIds,
    dependsOnCommitmentIds: input.dependsOnCommitmentIds ?? data.dependsOnCommitmentIds,
    version: data.version + 1,
    updatedAt: now,
    updatedBy: input.updatedBy,
  };

  const updated = updateRecord(commitmentId, {
    data: updatedData,
    updatedBy: input.updatedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.updatedBy,
    actorId: commitment.actorId,
    action: 'commitment.accept',
    resourceType: 'commitment',
    resourceId: commitmentId,
    details: { changes: Object.keys(input).filter((k) => k !== 'updatedBy' && k !== 'authz') },
  });

  return updated;
}

/**
 * Advance commitment status.
 */
export function advanceCommitmentStatus(
  commitmentId: string,
  newStatus: CommitmentStatus,
  updatedBy: string,
  authz?: AuthzContext
): RecordEnvelope | undefined {
  return updateCommitment(commitmentId, { status: newStatus, updatedBy, authz });
}

// ---------------------------------------------------------------------------
// Dependency Management
// ---------------------------------------------------------------------------

export interface AddDependencyInput {
  fromCommitmentId: string;
  toCommitmentId: string;
  type: DependencyType;
  createdBy: string;
  authz?: AuthzContext;
}

/**
 * Add a dependency between commitments.
 * fromCommitmentId blocks toCommitmentId (type = 'blocks')
 * toCommitmentId is_blocked_by fromCommitmentId (type = 'is_blocked_by')
 */
export function addCommitmentDependency(input: AddDependencyInput): CommitmentDependency | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:write');
  }

  const from = getRecord(input.fromCommitmentId);
  const to = getRecord(input.toCommitmentId);
  if (!from || !to || from.family !== 'COMMITMENT' || to.family !== 'COMMITMENT') {
    return undefined;
  }

  // Prevent circular dependencies
  if (wouldCreateCycle(input.fromCommitmentId, input.toCommitmentId)) {
    throw new Error('Adding this dependency would create a cycle');
  }

  const now = nowIso();
  const dep: CommitmentDependency = {
    fromCommitmentId: input.fromCommitmentId,
    toCommitmentId: input.toCommitmentId,
    type: input.type,
    createdAt: now,
    createdBy: input.createdBy,
  };

  const dependencies = readDependencies();
  dependencies.push(dep);
  writeDependencies(dependencies);

  // Update the "to" commitment's dependsOnCommitmentIds
  const toData = commitmentData(to);
  if (!toData.dependsOnCommitmentIds.includes(input.fromCommitmentId)) {
    updateCommitment(input.toCommitmentId, {
      dependsOnCommitmentIds: [...toData.dependsOnCommitmentIds, input.fromCommitmentId],
      updatedBy: input.createdBy,
      authz: input.authz,
    });
  }

  logAuditEvent({
    accountId: input.createdBy,
    actorId: from.actorId,
    action: 'commitment.accept',
    resourceType: 'commitment',
    resourceId: input.toCommitmentId,
    details: { dependsOn: input.fromCommitmentId, type: input.type },
  });

  return dep;
}

/**
 * Remove a dependency.
 */
export function removeCommitmentDependency(
  fromCommitmentId: string,
  toCommitmentId: string,
  removedBy: string,
  authz?: AuthzContext
): boolean {
  if (authz) {
    requirePermission(authz, 'commitment:write');
  }

  const dependencies = readDependencies();
  const idx = dependencies.findIndex(
    (d) => d.fromCommitmentId === fromCommitmentId && d.toCommitmentId === toCommitmentId
  );
  if (idx === -1) return false;

  dependencies.splice(idx, 1);
  writeDependencies(dependencies);

  // Update the "to" commitment's dependsOnCommitmentIds
  const to = getRecord(toCommitmentId);
  if (to && to.family === 'COMMITMENT') {
    const toData = commitmentData(to);
    updateCommitment(toCommitmentId, {
      dependsOnCommitmentIds: toData.dependsOnCommitmentIds.filter((id) => id !== fromCommitmentId),
      updatedBy: removedBy,
      authz,
    });
  }

  logAuditEvent({
    accountId: removedBy,
    actorId: to?.actorId ?? null,
    action: 'commitment.accept',
    resourceType: 'commitment',
    resourceId: toCommitmentId,
    details: { removedDependency: fromCommitmentId },
  });

  return true;
}

/**
 * Check if adding a dependency would create a cycle.
 */
function wouldCreateCycle(fromId: string, toId: string): boolean {
  const dependencies = readDependencies();
  const adjacency = new Map<string, string[]>();
  for (const d of dependencies) {
    if (!adjacency.has(d.fromCommitmentId)) adjacency.set(d.fromCommitmentId, []);
    adjacency.get(d.fromCommitmentId)!.push(d.toCommitmentId);
  }

  const visited = new Set<string>();
  const stack = [toId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === fromId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const neighbors = adjacency.get(current) ?? [];
    stack.push(...neighbors);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Graph Traversal
// ---------------------------------------------------------------------------

/**
 * Get all upstream dependencies (what this commitment depends on, recursively).
 */
export function getUpstreamDependencies(commitmentId: string): CommitmentNode[] {
  const dependencies = readDependencies();
  const directDeps = dependencies
    .filter((d) => d.toCommitmentId === commitmentId)
    .map((d) => d.fromCommitmentId);

  const result: CommitmentNode[] = [];
  for (const depId of directDeps) {
    const node = buildCommitmentNode(depId);
    if (node) result.push(node);
  }
  return result;
}

/**
 * Get all downstream dependents (what depends on this commitment, recursively).
 */
export function getDownstreamDependents(commitmentId: string): CommitmentNode[] {
  const dependencies = readDependencies();
  const directDependents = dependencies
    .filter((d) => d.fromCommitmentId === commitmentId)
    .map((d) => d.toCommitmentId);

  const result: CommitmentNode[] = [];
  for (const depId of directDependents) {
    const node = buildCommitmentNode(depId);
    if (node) result.push(node);
  }
  return result;
}

/**
 * Get all commitments that block this one (direct + transitive).
 */
export function getBlockedBy(commitmentId: string): CommitmentNode[] {
  return getUpstreamDependencies(commitmentId);
}

/**
 * Get all commitments this one blocks (direct + transitive).
 */
export function getBlocking(commitmentId: string): CommitmentNode[] {
  return getDownstreamDependents(commitmentId);
}

/**
 * Build a full commitment node with graph context.
 */
function buildCommitmentNode(commitmentId: string): CommitmentNode | undefined {
  const commitment = getRecord(commitmentId);
  if (!commitment || commitment.family !== 'COMMITMENT') return undefined;

  const data = commitmentData(commitment);
  const org = data.organizationId ? getOrganization(data.organizationId) : undefined;
  const assignees = data.assigneeActorIds.map((id) => getActor(id)).filter((a): a is Actor => Boolean(a));

  const upstream = getUpstreamDependencies(commitmentId);
  const downstream = getDownstreamDependents(commitmentId);
  const blockedBy = upstream.filter((n) => n.data.status !== 'fulfilled');

  let daysUntilDeadline: number | undefined;
  if (data.deadline) {
    const diff = new Date(data.deadline).getTime() - Date.now();
    daysUntilDeadline = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const criteriaProgress = {
    total: data.acceptanceCriteria.length,
    met: data.acceptanceCriteria.filter((c) => c.isMet).length,
  };

  return {
    commitment,
    data,
    upstream,
    downstream,
    organization: org,
    assignees,
    daysUntilDeadline,
    isBlocked: blockedBy.length > 0,
    blockedBy,
    criteriaProgress,
  };
}

/**
 * Get full commitment node by ID.
 */
export function getCommitmentNode(commitmentId: string): CommitmentNode | undefined {
  return buildCommitmentNode(commitmentId);
}

/**
 * Get all commitments for an organization.
 */
export function getCommitmentsByOrganization(organizationId: string): CommitmentNode[] {
  const all = listRecords({ family: 'COMMITMENT' });
  return all
    .filter((c) => commitmentData(c).organizationId === organizationId)
    .map((c) => buildCommitmentNode(c.id))
    .filter((n): n is CommitmentNode => Boolean(n));
}

/**
 * Get all commitments for an actor (as assignee or responsible).
 */
export function getCommitmentsByActor(actorId: string): CommitmentNode[] {
  const all = listRecords({ family: 'COMMITMENT' });
  return all
    .filter((c) => {
      const data = commitmentData(c);
      return data.assigneeActorIds.includes(actorId) || data.responsibleActorIds.includes(actorId);
    })
    .map((c) => buildCommitmentNode(c.id))
    .filter((n): n is CommitmentNode => Boolean(n));
}

/**
 * Get commitments by status.
 */
export function getCommitmentsByStatus(status: CommitmentStatus): CommitmentNode[] {
  const all = listRecords({ family: 'COMMITMENT' });
  return all
    .filter((c) => commitmentData(c).status === status)
    .map((c) => buildCommitmentNode(c.id))
    .filter((n): n is CommitmentNode => Boolean(n));
}

/**
 * Get overdue commitments.
 */
export function getOverdueCommitments(): CommitmentNode[] {
  const now = Date.now();
  const all = listRecords({ family: 'COMMITMENT' });
  return all
    .filter((c) => {
      const data = commitmentData(c);
      return data.deadline && new Date(data.deadline).getTime() < now && data.status !== 'fulfilled';
    })
    .map((c) => buildCommitmentNode(c.id))
    .filter((n): n is CommitmentNode => Boolean(n));
}

/**
 * Get commitments at risk (deadline within 7 days, not fulfilled).
 */
export function getAtRiskCommitments(daysThreshold = 7): CommitmentNode[] {
  const now = Date.now();
  const threshold = now + daysThreshold * 24 * 60 * 60 * 1000;
  const all = listRecords({ family: 'COMMITMENT' });
  return all
    .filter((c) => {
      const data = commitmentData(c);
      return data.deadline &&
        new Date(data.deadline).getTime() <= threshold &&
        data.status !== 'fulfilled';
    })
    .map((c) => buildCommitmentNode(c.id))
    .filter((n): n is CommitmentNode => Boolean(n));
}

// ---------------------------------------------------------------------------
// Acceptance Criteria & Evidence Linking
// ---------------------------------------------------------------------------

export interface UpdateCriterionInput {
  commitmentId: string;
  criterionId: string;
  isMet: boolean;
  satisfiedByEvidenceIds?: string[];
  updatedBy: string;
  authz?: AuthzContext;
}

/**
 * Mark an acceptance criterion as met/unmet, linking evidence.
 */
export function updateAcceptanceCriterion(input: UpdateCriterionInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'commitment:write');
  }

  const commitment = getRecord(input.commitmentId);
  if (!commitment || commitment.family !== 'COMMITMENT') return undefined;

  const data = commitmentData(commitment);
  const criterionIdx = data.acceptanceCriteria.findIndex((c) => c.id === input.criterionId);
  if (criterionIdx === -1) return undefined;

  const criteria = [...data.acceptanceCriteria];
  criteria[criterionIdx] = {
    ...criteria[criterionIdx],
    isMet: input.isMet,
    satisfiedByEvidenceIds: input.satisfiedByEvidenceIds ?? criteria[criterionIdx].satisfiedByEvidenceIds,
  };

  return updateCommitment(input.commitmentId, {
    acceptanceCriteria: criteria,
    updatedBy: input.updatedBy,
    authz: input.authz,
  });
}

/**
 * Check if all acceptance criteria for a commitment are met.
 */
export function areAllCriteriaMet(commitmentId: string): boolean {
  const commitment = getRecord(commitmentId);
  if (!commitment || commitment.family !== 'COMMITMENT') return false;
  const data = commitmentData(commitment);
  return data.acceptanceCriteria.length > 0 && data.acceptanceCriteria.every((c) => c.isMet);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * What commitments is an organization responsible for?
 */
export function getOrganizationResponsibilities(organizationId: string): CommitmentNode[] {
  return getCommitmentsByOrganization(organizationId);
}

/**
 * What blocks a specific commitment?
 */
export function getWhatBlocks(commitmentId: string): CommitmentNode[] {
  return getBlockedBy(commitmentId);
}

/**
 * What does a specific commitment block?
 */
export function getWhatIsBlocked(commitmentId: string): CommitmentNode[] {
  return getBlocking(commitmentId);
}

/**
 * All commitments in the graph (with full node data).
 */
export function getAllCommitmentNodes(): CommitmentNode[] {
  const all = listRecords({ family: 'COMMITMENT' });
  return all.map((c) => buildCommitmentNode(c.id)).filter((n): n is CommitmentNode => Boolean(n));
}

/**
 * Commitment graph statistics.
 */
export interface CommitmentGraphStats {
  total: number;
  byStatus: Record<CommitmentStatus, number>;
  overdue: number;
  atRisk: number;
  blocked: number;
  totalDependencies: number;
  organizationsInvolved: number;
}

export function getCommitmentGraphStats(): CommitmentGraphStats {
  const all = listRecords({ family: 'COMMITMENT' });
  const nodes = all.map((c) => buildCommitmentNode(c.id)).filter((n): n is CommitmentNode => Boolean(n));
  const dependencies = readDependencies();

  const byStatus: Record<CommitmentStatus, number> = {
    proposed: 0,
    accepted: 0,
    in_progress: 0,
    fulfilled: 0,
    revoked: 0,
    blocked: 0,
  };

  for (const n of nodes) {
    byStatus[n.data.status] = (byStatus[n.data.status] || 0) + 1;
  }

  const orgIds = new Set(nodes.map((n) => n.data.organizationId).filter(Boolean));

  return {
    total: nodes.length,
    byStatus,
    overdue: getOverdueCommitments().length,
    atRisk: getAtRiskCommitments().length,
    blocked: nodes.filter((n) => n.isBlocked).length,
    totalDependencies: dependencies.length,
    organizationsInvolved: orgIds.size,
  };
}