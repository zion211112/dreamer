/**
 * APT-LABS — Ontology Relationship Vocabulary
 *
 * Canonical relationship kinds and cardinality definitions. Each relationship
 * is a first-class, versioned record (never a bare foreign key). Carries its
 * own metadata: role, start/end dates, authority, consent, verification, status.
 *
 * Consolidates the existing relationship vocabulary from
 * `src/lib/people-network.ts` (membership, affiliation, work, stewardship,
 * contribution, evidence, owns, operates, stewards, funds, contributes_to,
 * attests, issues) with the APTO 13-family vocabulary.
 */

import type { Family } from './types';

// ---------------------------------------------------------------------------
// Canonical relationship kinds
// ---------------------------------------------------------------------------

export const RELATIONSHIP_KIND = {
  // Actor ↔ Actor
  AFFILIATED_WITH: 'AFFILIATED_WITH',
  ACTS_ON_BEHALF_OF: 'ACTS_ON_BEHALF_OF',

  // Actor ↔ Capability / Resource
  HOLDS_CAPABILITY: 'HOLDS_CAPABILITY',
  OFFERS_CAPACITY: 'OFFERS_CAPACITY',
  CONTROLS_RESOURCE: 'CONTROLS_RESOURCE',
  CUSTODIES: 'CUSTODIES',
  OPERATES: 'OPERATES',

  // Actor / Resource ↔ Place
  LOCATED_AT: 'LOCATED_AT',

  // Actor ↔ Intention / Commitment / Work
  RESPONDS_TO: 'RESPONDS_TO',
  AUTHORIZED_BY: 'AUTHORIZED_BY',
  COMMITTED_TO: 'COMMITTED_TO',
  ASSIGNED_TO: 'ASSIGNED_TO',

  // Work ↔ Resource / Activity / Output
  REQUIRES: 'REQUIRES',
  USES: 'USES',
  PRODUCES: 'PRODUCES',
  FULFILLS: 'FULFILLS',

  // Evidence ↔ everything
  SUPPORTED_BY: 'SUPPORTED_BY',
  SUPPORTED_BY_EVIDENCE: 'SUPPORTED_BY_EVIDENCE',
  VERIFIED_BY: 'VERIFIED_BY',

  // Derivation & dependency
  DERIVED_FROM: 'DERIVED_FROM',
  DEPENDS_ON: 'DEPENDS_ON',

  // Governance
  GOVERNED_BY: 'GOVERNED_BY',

  // Exchange
  SETTLES: 'SETTLES',

  // Legacy / people-network alignment
  MEMBERSHIP: 'MEMBERSHIP',
  WORK: 'WORK_RELATIONSHIP',
  STEWARDSHIP: 'STEWARDSHIP',
  CONTRIBUTION: 'CONTRIBUTION',
  FUNDS: 'FUNDS',
  CONTRIBUTES_TO: 'CONTRIBUTES_TO',
  ATTESTS: 'ATTESTS',
  ISSUES: 'ISSUES',
} as const;

export type RelationshipKind = (typeof RELATIONSHIP_KIND)[keyof typeof RELATIONSHIP_KIND];

// ---------------------------------------------------------------------------
// Allowed source → target family pairs per relationship kind (cardinality)
// ---------------------------------------------------------------------------

export interface RelationshipCardinality {
  kind: RelationshipKind;
  /** Allowed source families. */
  sources: readonly Family[];
  /** Allowed target families. */
  targets: readonly Family[];
  /** Whether multiple relationships of this kind between the same pair are allowed. */
  repeatable: boolean;
  /** Whether the relationship is directional (source ≠ target matters). */
  directional: boolean;
}

export const RELATIONSHIP_CARDINALITY: readonly RelationshipCardinality[] = [
  // Actor ↔ Actor (organizations, institutions, collectives are Actor types, not separate families)
  { kind: RELATIONSHIP_KIND.AFFILIATED_WITH, sources: ['ACTOR'], targets: ['ACTOR'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.ACTS_ON_BEHALF_OF, sources: ['ACTOR'], targets: ['ACTOR'], repeatable: true, directional: true },
  // Actor → Capability / Resource
  { kind: RELATIONSHIP_KIND.HOLDS_CAPABILITY, sources: ['ACTOR'], targets: ['CAPABILITY'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.OFFERS_CAPACITY, sources: ['ACTOR'], targets: ['CAPABILITY', 'RESOURCE'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.CONTROLS_RESOURCE, sources: ['ACTOR'], targets: ['RESOURCE'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.CUSTODIES, sources: ['ACTOR'], targets: ['RESOURCE', 'EVIDENCE', 'KNOWLEDGE'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.OPERATES, sources: ['ACTOR'], targets: ['RESOURCE', 'WORK'], repeatable: true, directional: true },
  // Actor / Resource / Work → Place
  { kind: RELATIONSHIP_KIND.LOCATED_AT, sources: ['ACTOR', 'RESOURCE', 'WORK'], targets: ['PLACE'], repeatable: true, directional: true },
  // Intention / Work → Intention
  { kind: RELATIONSHIP_KIND.RESPONDS_TO, sources: ['INTENTION', 'WORK'], targets: ['INTENTION'], repeatable: true, directional: true },
  // Work / Commitment / Activity → Governance / Actor
  { kind: RELATIONSHIP_KIND.AUTHORIZED_BY, sources: ['WORK', 'COMMITMENT', 'ACTIVITY'], targets: ['GOVERNANCE', 'ACTOR'], repeatable: true, directional: true },
  // Actor → Commitment
  { kind: RELATIONSHIP_KIND.COMMITTED_TO, sources: ['ACTOR'], targets: ['COMMITMENT'], repeatable: true, directional: true },
  // Actor → Work
  { kind: RELATIONSHIP_KIND.ASSIGNED_TO, sources: ['ACTOR'], targets: ['WORK'], repeatable: true, directional: true },
  // Work → Capability / Resource
  { kind: RELATIONSHIP_KIND.REQUIRES, sources: ['WORK'], targets: ['CAPABILITY', 'RESOURCE'], repeatable: true, directional: true },
  // Work / Activity → Resource
  { kind: RELATIONSHIP_KIND.USES, sources: ['WORK', 'ACTIVITY'], targets: ['RESOURCE'], repeatable: true, directional: true },
  // Work / Activity → Output & Outcome
  { kind: RELATIONSHIP_KIND.PRODUCES, sources: ['WORK', 'ACTIVITY'], targets: ['OUTPUT_OUTCOME'], repeatable: true, directional: true },
  // Work / Commitment → Intention / Exchange
  { kind: RELATIONSHIP_KIND.FULFILLS, sources: ['WORK', 'COMMITMENT'], targets: ['INTENTION', 'EXCHANGE'], repeatable: true, directional: true },
  // Work / Commitment / Output & Outcome → Evidence
  { kind: RELATIONSHIP_KIND.SUPPORTED_BY, sources: ['WORK', 'COMMITMENT', 'OUTPUT_OUTCOME'], targets: ['EVIDENCE'], repeatable: true, directional: true },
  // Evidence → Evidence (claims supported by evidence records)
  { kind: RELATIONSHIP_KIND.SUPPORTED_BY_EVIDENCE, sources: ['EVIDENCE'], targets: ['EVIDENCE'], repeatable: true, directional: true },
  // Evidence → Actor
  { kind: RELATIONSHIP_KIND.VERIFIED_BY, sources: ['EVIDENCE'], targets: ['ACTOR'], repeatable: true, directional: true },
  // Output & Outcome / Knowledge → Output & Outcome / Knowledge
  { kind: RELATIONSHIP_KIND.DERIVED_FROM, sources: ['OUTPUT_OUTCOME', 'KNOWLEDGE'], targets: ['OUTPUT_OUTCOME', 'KNOWLEDGE'], repeatable: true, directional: true },
  // Work / Activity → Work / Activity
  { kind: RELATIONSHIP_KIND.DEPENDS_ON, sources: ['WORK', 'ACTIVITY'], targets: ['WORK', 'ACTIVITY'], repeatable: true, directional: true },
  // Actor / Resource / Work → Governance
  { kind: RELATIONSHIP_KIND.GOVERNED_BY, sources: ['ACTOR', 'RESOURCE', 'WORK'], targets: ['GOVERNANCE'], repeatable: true, directional: true },
  // Exchange → Exchange / Work
  { kind: RELATIONSHIP_KIND.SETTLES, sources: ['EXCHANGE'], targets: ['EXCHANGE', 'WORK'], repeatable: true, directional: true },
  // Legacy alignment (all ACTOR family, since Organization/Collective are Actor types)
  { kind: RELATIONSHIP_KIND.MEMBERSHIP, sources: ['ACTOR'], targets: ['ACTOR'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.STEWARDSHIP, sources: ['ACTOR'], targets: ['RESOURCE', 'WORK'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.CONTRIBUTION, sources: ['ACTOR'], targets: ['WORK'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.FUNDS, sources: ['ACTOR'], targets: ['WORK', 'EXCHANGE'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.CONTRIBUTES_TO, sources: ['ACTOR', 'WORK'], targets: ['WORK', 'OUTPUT_OUTCOME'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.ATTESTS, sources: ['ACTOR'], targets: ['EVIDENCE', 'WORK'], repeatable: true, directional: true },
  { kind: RELATIONSHIP_KIND.ISSUES, sources: ['ACTOR'], targets: ['COMMITMENT', 'EXCHANGE', 'EVIDENCE'], repeatable: true, directional: true },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getCardinality(kind: RelationshipKind): RelationshipCardinality | undefined {
  return RELATIONSHIP_CARDINALITY.find((c) => c.kind === kind);
}

export function isValidRelationshipKind(value: unknown): value is RelationshipKind {
  return typeof value === 'string'
    && Object.values(RELATIONSHIP_KIND).includes(value as RelationshipKind);
}

export function isValidSourceTarget(
  kind: RelationshipKind,
  sourceFamily: Family,
  targetFamily: Family,
): boolean {
  const cardinality = getCardinality(kind);
  if (!cardinality) return false;
  return (
    cardinality.sources.includes(sourceFamily)
    && cardinality.targets.includes(targetFamily)
  );
}

// ---------------------------------------------------------------------------
// Relationship metadata (carried on every relationship record)
// ---------------------------------------------------------------------------

export interface RelationshipMetadata {
  /** Role the source plays in this relationship. */
  sourceRole?: string;
  /** Role the target plays in this relationship. */
  targetRole?: string;
  /** When the relationship began (ISO string). */
  startedAt?: string;
  /** When the relationship ended (ISO string). */
  endedAt?: string;
  /** Authority under which the relationship exists. */
  authority?: string;
  /** Consent status (for actor-involving relationships). */
  consent?: string;
  /** Verification status. */
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'disputed' | 'rejected';
  /** Evidence ids supporting this relationship. */
  evidenceIds?: string[];
  /** Arbitrary structured properties. */
  properties?: Record<string, unknown>;
}
