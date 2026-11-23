/**
 * APT-LABS — Contribution & Value Attribution Engine (Stage 3 — Economic
 * Intelligence)
 *
 * Records contributions, calculates allocations per accepted evidence and
 * defined agreements. Distinguishes labour, ownership, capital, expertise,
 * risk, contractual entitlement.
 *
 * Pure domain layer: the Vue monolith's localStorage-backed contribution,
 * allocation-rule, and allocation-result stores (and their audit/permission
 * gating) were stripped. The value-domain contracts and the pure allocation
 * arithmetic are kept.
 */

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
  /** 0-1, calculated during allocation. */
  allocationShare?: number;
  /** Calculated monetary value. */
  allocatedValue?: number;
  version: number;
}

export interface AllocationRule {
  id: string;
  commitmentId: string;
  contributionType: ContributionType;
  /** 0-1 relative weight within type. */
  weight: number;
  /** Base monetary value before weight. */
  baseValue: number;
  /** Multiplier for quality/risk/etc. */
  multiplier: number;
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
// Pure allocation arithmetic
// ---------------------------------------------------------------------------

/** All contribution types, used to initialise per-type accumulators. */
export const CONTRIBUTION_TYPES: readonly ContributionType[] = [
  'labour',
  'ownership',
  'capital',
  'expertise',
  'risk',
  'contractual-entitlement',
] as const;

/**
 * The share of a contribution type's weight that one rule holds. 0 when the
 * type has no weight at all. Pure.
 */
export function allocationShare(rule: AllocationRule, sameTypeRules: AllocationRule[]): number {
  const typeWeightSum = sameTypeRules
    .filter((r) => r.contributionType === rule.contributionType)
    .reduce((sum, r) => sum + r.weight, 0);
  return typeWeightSum > 0 ? rule.weight / typeWeightSum : 0;
}

/** Allocate a rule's monetary value to one contribution by its weight share. Pure. */
export function allocatedValueFor(rule: AllocationRule, share: number): number {
  return rule.baseValue * rule.multiplier * share;
}

/** Empty per-type accumulator map for contribution summaries. Pure. */
export function emptyContributionTypeAccumulator(): Record<ContributionType, { count: number; value: number }> {
  return {
    labour: { count: 0, value: 0 },
    ownership: { count: 0, value: 0 },
    capital: { count: 0, value: 0 },
    expertise: { count: 0, value: 0 },
    risk: { count: 0, value: 0 },
    'contractual-entitlement': { count: 0, value: 0 },
  };
}
