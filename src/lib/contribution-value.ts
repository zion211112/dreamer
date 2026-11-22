/**
 * APT-LABS — Contribution & Value Attribution Engine (Stage 3 — Economic Intelligence)
 *
 * Records contributions, calculates allocations per accepted evidence and
 * defined agreements. Distinguishes labour, ownership, capital, expertise,
 * risk, contractual entitlement.
 */

import { getCommitmentNode } from './commitment-graph';
import { getActor } from './actors';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContributionType =
  | 'labour'
  | 'ownership'
  | 'capital'
  | 'expertise'
  | 'risk'
  | 'contractual-entitlement';

export type ContributionStatus = 'proposed' | 'accepted' | 'verified' | 'disputed' | 'settled';

export interface ContributionRecord {
  id: string;
  commitmentId: string;
  actorId: string;
  actorName: string;
  organizationId?: string;
  type: ContributionType;
  amount: number;
  unit: string;
  description: string;
  evidenceIds: string[];
  status: ContributionStatus;
  submittedAt: string;
  submittedBy: string;
  verifiedAt?: string;
  verifiedBy?: string;
  allocationShare?: number; // 0-1, calculated during allocation
  allocatedValue?: number;  // calculated monetary value
  version: number;
}

export interface AllocationRule {
  id: string;
  commitmentId: string;
  contributionType: ContributionType;
  weight: number; // 0-1 relative weight within type
  baseValue: number; // base monetary value before weight
  multiplier: number; // multiplier for quality/risk/etc
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface AllocationResult {
  contributionId: string;
  actorId: string;
  actorName: string;
  contributionType: ContributionType;
  amount: number;
  unit: string;
  weight: number;
  multiplier: number;
  allocatedValue: number;
  currency: string;
  rationale: string;
}

export interface CommitmentAllocation {
  commitmentId: string;
  commitmentTitle: string;
  totalValue: number;
  currency: string;
  allocations: AllocationResult[];
  allocationsByActor: Record<string, AllocationResult[]>;
  allocationsByType: Record<ContributionType, AllocationResult[]>;
  unallocatedValue: number;
  generatedAt: string;
  generatedBy: string;
}

export interface ActorContributionSummary {
  actorId: string;
  actorName: string;
  period: { from: string; to: string };
  totalContributions: number;
  totalAllocatedValue: number;
  contributionsByType: Record<ContributionType, { count: number; value: number }>;
  commitmentsInvolved: string[];
  recentContributions: ContributionRecord[];
}

export interface OrganizationValueFlow {
  organizationId: string;
  organizationName: string;
  period: { from: string; to: string };
  totalValueIn: number;
  totalValueOut: number;
  netValueFlow: number;
  currency: string;
  contributionsByActor: Record<string, { actorName: string; valueIn: number; valueOut: number }>;
  commitmentsByStatus: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const CONTRIBUTIONS_KEY = 'aptlabs:contributions';
const ALLOCATION_RULES_KEY = 'aptlabs:allocation-rules';
const ALLOCATION_RESULTS_KEY = 'aptlabs:allocation-results';

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Contribution Recording
// ---------------------------------------------------------------------------

export interface RecordContributionInput {
  commitmentId: string;
  actorId: string;
  type: ContributionType;
  amount: number;
  unit: string;
  description: string;
  evidenceIds?: string[];
  submittedBy: string;
  authz?: AuthzContext;
}

/**
 * Record a contribution to a commitment.
 */
export function recordContribution(input: RecordContributionInput): ContributionRecord {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const actor = getActor(input.actorId);
  if (!actor) throw new Error(`Actor ${input.actorId} not found`);

  const node = getCommitmentNode(input.commitmentId);
  if (!node) throw new Error(`Commitment ${input.commitmentId} not found`);

  const contribution: ContributionRecord = {
    id: createId('contrib'),
    commitmentId: input.commitmentId,
    actorId: input.actorId,
    actorName: actor.name,
    organizationId: undefined,
    type: input.type,
    amount: input.amount,
    unit: input.unit,
    description: input.description,
    evidenceIds: input.evidenceIds ?? [],
    status: 'proposed',
    submittedAt: nowIso(),
    submittedBy: input.submittedBy,
    version: 1,
  };

  const contributions = readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []);
  contributions.push(contribution);
  writeJson(CONTRIBUTIONS_KEY, contributions);

  logAuditEvent({
    accountId: input.submittedBy,
    actorId: input.actorId,
    action: 'record.create',
    resourceType: 'contribution',
    resourceId: contribution.id,
    details: { commitmentId: input.commitmentId, type: input.type, amount: input.amount },
  });

  return contribution;
}

export function getContribution(contributionId: string): ContributionRecord | undefined {
  return readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).find((c) => c.id === contributionId);
}

export function getContributionsByCommitment(commitmentId: string): ContributionRecord[] {
  return readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).filter((c) => c.commitmentId === commitmentId);
}

export function getContributionsByActor(actorId: string): ContributionRecord[] {
  return readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).filter((c) => c.actorId === actorId);
}

export function updateContributionStatus(contributionId: string, status: ContributionStatus, verifiedBy: string, authz?: AuthzContext): ContributionRecord | undefined {
  if (authz) {
    requirePermission(authz, 'economic:write');
  }

  const contributions = readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []);
  const idx = contributions.findIndex((c) => c.id === contributionId);
  if (idx === -1) return undefined;

  contributions[idx] = {
    ...contributions[idx],
    status,
    verifiedAt: status === 'verified' ? nowIso() : contributions[idx].verifiedAt,
    verifiedBy: status === 'verified' ? verifiedBy : contributions[idx].verifiedBy,
    version: contributions[idx].version + 1,
  };
  writeJson(CONTRIBUTIONS_KEY, contributions);

  logAuditEvent({
    accountId: verifiedBy,
    actorId: contributions[idx].actorId,
    action: 'record.update',
    resourceType: 'contribution',
    resourceId: contributionId,
    details: { status },
  });

  return contributions[idx];
}

// ---------------------------------------------------------------------------
// Allocation Rules
// ---------------------------------------------------------------------------

export interface CreateAllocationRuleInput {
  commitmentId: string;
  contributionType: ContributionType;
  weight: number;
  baseValue: number;
  multiplier: number;
  description: string;
  createdBy: string;
  authz?: AuthzContext;
}

export function createAllocationRule(input: CreateAllocationRuleInput): AllocationRule {
  if (input.authz) {
    requirePermission(input.authz, 'economic:write');
  }

  const rule: AllocationRule = {
    id: createId('alloc-rule'),
    commitmentId: input.commitmentId,
    contributionType: input.contributionType,
    weight: input.weight,
    baseValue: input.baseValue,
    multiplier: input.multiplier,
    description: input.description,
    createdAt: nowIso(),
    createdBy: input.createdBy,
  };

  const rules = readJson<AllocationRule[]>(ALLOCATION_RULES_KEY, []);
  rules.push(rule);
  writeJson(ALLOCATION_RULES_KEY, rules);

  logAuditEvent({
    accountId: input.createdBy,
    actorId: input.createdBy,
    action: 'record.create',
    resourceType: 'allocation-rule',
    resourceId: rule.id,
    details: { commitmentId: input.commitmentId, type: input.contributionType },
  });

  return rule;
}

export function getAllocationRulesByCommitment(commitmentId: string): AllocationRule[] {
  return readJson<AllocationRule[]>(ALLOCATION_RULES_KEY, []).filter((r) => r.commitmentId === commitmentId);
}

// ---------------------------------------------------------------------------
// Allocation Calculation
// ---------------------------------------------------------------------------

export interface CalculateAllocationsInput {
  commitmentId: string;
  calculatedBy: string;
  authz?: AuthzContext;
}

export function calculateAllocations(input: CalculateAllocationsInput): CommitmentAllocation {
  if (input.authz) {
    requirePermission(input.authz, 'economic:read');
  }

  const node = getCommitmentNode(input.commitmentId);
  if (!node) throw new Error(`Commitment ${input.commitmentId} not found`);

  const data = node.commitment.data as Record<string, unknown>;
  const commitments = readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).filter((c) => c.commitmentId === input.commitmentId);
  const rules = readJson<AllocationRule[]>(ALLOCATION_RULES_KEY, []).filter((r) => r.commitmentId === input.commitmentId);

  // Calculate total value from rules
  let totalValue = 0;
  const allocations: AllocationResult[] = [];

  for (const rule of rules) {
    const typeContributions = commitments.filter((c) => c.type === rule.contributionType && c.status === 'verified');
    const typeWeightSum = rules.filter((r) => r.contributionType === rule.contributionType).reduce((sum, r) => sum + r.weight, 0);

    for (const contrib of typeContributions) {
      const share = typeWeightSum > 0 ? rule.weight / typeWeightSum : 0;
      const allocatedValue = rule.baseValue * rule.multiplier * share;

      allocations.push({
        contributionId: contrib.id,
        actorId: contrib.actorId,
        actorName: contrib.actorName,
        contributionType: rule.contributionType,
        amount: contrib.amount,
        unit: contrib.unit,
        weight: rule.weight,
        multiplier: rule.multiplier,
        allocatedValue,
        currency: 'KES',
        rationale: `Weight ${(rule.weight * 100).toFixed(1)}% × multiplier ${rule.multiplier} × base value ${rule.baseValue}`,
      });

      totalValue += allocatedValue;
    }
  }

  // If no rules, distribute equally among verified contributions
  if (allocations.length === 0 && commitments.length > 0) {
    const verifiedContribs = commitments.filter((c) => c.status === 'verified');
    const share = 1 / verifiedContribs.length;
    const perContributionValue = typeof data.valueKes === 'number' ? data.valueKes : 0;

    for (const c of verifiedContribs) {
      allocations.push({
        contributionId: c.id,
        actorId: c.actorId,
        actorName: c.actorName,
        contributionType: c.type,
        amount: c.amount,
        unit: c.unit,
        weight: share,
        multiplier: 1,
        allocatedValue: perContributionValue * share,
        currency: 'KES',
        rationale: 'Equal share among verified contributions',
      });
      totalValue += perContributionValue * share;
    }
  }

  // Group by actor and type
  const allocationsByActor: Record<string, AllocationResult[]> = {};
  const allocationsByType: Record<ContributionType, AllocationResult[]> = {
    labour: [],
    ownership: [],
    capital: [],
    expertise: [],
    risk: [],
    'contractual-entitlement': [],
  };

  for (const a of allocations) {
    if (!allocationsByActor[a.actorId]) allocationsByActor[a.actorId] = [];
    allocationsByActor[a.actorId].push(a);
    allocationsByType[a.contributionType].push(a);
  }

  const unallocatedValue = Math.max(0, totalValue - allocations.reduce((sum, a) => sum + a.allocatedValue, 0));

  const result: CommitmentAllocation = {
    commitmentId: input.commitmentId,
    commitmentTitle: (data.title ?? '') as string,
    totalValue,
    currency: 'KES',
    allocations,
    allocationsByActor,
    allocationsByType,
    unallocatedValue,
    generatedAt: nowIso(),
    generatedBy: input.calculatedBy,
  };

  // Persist allocation results
  const existingResults = readJson<AllocationResult[]>(ALLOCATION_RESULTS_KEY, []);
  const newResults = allocations.map((a) => ({ ...a, commitmentId: input.commitmentId }));
  writeJson(ALLOCATION_RESULTS_KEY, [...existingResults, ...newResults]);

  logAuditEvent({
    accountId: input.calculatedBy,
    actorId: input.calculatedBy,
    action: 'record.create',
    resourceType: 'allocation',
    resourceId: input.commitmentId,
    details: { totalValue, allocationsCount: allocations.length },
  });

  return result;
}

export function getAllocationResult(commitmentId: string): CommitmentAllocation | undefined {
  const results = readJson<AllocationResult[]>(ALLOCATION_RESULTS_KEY, []);
  // Return the latest allocation for this commitment
  const commitmentResults = results.filter((r) => r.contributionId === commitmentId);
  if (commitmentResults.length === 0) return undefined;

  const allocationsByActor: Record<string, AllocationResult[]> = {};
  const allocationsByType: Record<ContributionType, AllocationResult[]> = {
    labour: [], ownership: [], capital: [], expertise: [], risk: [], 'contractual-entitlement': [],
  };

  let totalValue = 0;
  for (const r of commitmentResults) {
    totalValue += r.allocatedValue;
    if (!allocationsByActor[r.actorId]) allocationsByActor[r.actorId] = [];
    allocationsByActor[r.actorId].push(r);
    allocationsByType[r.contributionType].push(r);
  }

  return {
    commitmentId,
    commitmentTitle: '',
    totalValue,
    currency: 'KES',
    allocations: commitmentResults,
    allocationsByActor,
    allocationsByType,
    unallocatedValue: 0,
    generatedAt: nowIso(),
    generatedBy: 'system',
  };
}

// ---------------------------------------------------------------------------
// Actor & Organization Summaries
// ---------------------------------------------------------------------------

export function getActorContributionSummary(actorId: string, periodFrom: string, periodTo: string): ActorContributionSummary {
  const actor = getActor(actorId);
  if (!actor) throw new Error(`Actor ${actorId} not found`);

  const contributions = readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).filter((c) =>
    c.actorId === actorId && c.submittedAt >= periodFrom && c.submittedAt <= periodTo
  );

  const totalAllocatedValue = contributions.reduce((sum, c) => sum + (c.allocatedValue ?? 0), 0);

  const contributionsByType: Record<ContributionType, { count: number; value: number }> = {
    labour: { count: 0, value: 0 },
    ownership: { count: 0, value: 0 },
    capital: { count: 0, value: 0 },
    expertise: { count: 0, value: 0 },
    risk: { count: 0, value: 0 },
    'contractual-entitlement': { count: 0, value: 0 },
  };

  const commitmentIds = new Set<string>();
  for (const c of contributions) {
    contributionsByType[c.type].count++;
    contributionsByType[c.type].value += c.allocatedValue ?? 0;
    commitmentIds.add(c.commitmentId);
  }

  return {
    actorId,
    actorName: actor.name,
    period: { from: periodFrom, to: periodTo },
    totalContributions: contributions.length,
    totalAllocatedValue,
    contributionsByType,
    commitmentsInvolved: Array.from(commitmentIds),
    recentContributions: contributions.slice(0, 10),
  };
}

export function getOrganizationValueFlow(organizationId: string, periodFrom: string, periodTo: string): OrganizationValueFlow {
  const org = getActor(organizationId);
  if (!org) throw new Error(`Organization ${organizationId} not found`);

  // Get all contributions for actors in this organization
  const allContributions = readJson<ContributionRecord[]>(CONTRIBUTIONS_KEY, []).filter((c) =>
    c.submittedAt >= periodFrom && c.submittedAt <= periodTo
  );

  let totalValueIn = 0;
  let totalValueOut = 0;

  const contributionsByActor: Record<string, { actorName: string; valueIn: number; valueOut: number }> = {};

  for (const c of allContributions) {
    const value = c.allocatedValue ?? 0;
    if (!contributionsByActor[c.actorId]) {
      contributionsByActor[c.actorId] = { actorName: c.actorName, valueIn: 0, valueOut: 0 };
    }
    contributionsByActor[c.actorId].valueIn += value;
    totalValueIn += value;
  }

  return {
    organizationId,
    organizationName: org.name,
    period: { from: periodFrom, to: periodTo },
    totalValueIn,
    totalValueOut,
    netValueFlow: totalValueIn - totalValueOut,
    currency: 'KES',
    contributionsByActor,
    commitmentsByStatus: {},
  };
}
