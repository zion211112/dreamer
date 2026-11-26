/**
 * APT-LABS — Ontology Core Types
 *
 * Canonical TypeScript definitions of the APTO (APT Core Ontology) semantic
 * families, plus the entity base, relationship base, and event envelope.
 *
 * Framework-agnostic: no UI framework dependencies. Survives any UI-framework
 * choice (Preact, Vue 3, or other). Migrations, API schemas, permissions, and
 * UI property definitions derive from this single canonical language.
 *
 * Consolidates the APTO family ontology with the existing 6-structure
 * ontology (`docs/ontology.md`, `docs/domain-model.md`).
 */

// ---------------------------------------------------------------------------
// 13 canonical object families
// ---------------------------------------------------------------------------

export const FAMILY = {
  ACTOR: 'ACTOR',
  CAPABILITY: 'CAPABILITY',
  RESOURCE: 'RESOURCE',
  PLACE: 'PLACE',
  INTENTION: 'INTENTION',
  COMMITMENT: 'COMMITMENT',
  WORK: 'WORK',
  ACTIVITY: 'ACTIVITY',
  EVENT: 'EVENT',
  OUTPUT_OUTCOME: 'OUTPUT_OUTCOME',
  EXCHANGE: 'EXCHANGE',
  VALUE: 'VALUE',
  EVIDENCE: 'EVIDENCE',
  KNOWLEDGE: 'KNOWLEDGE',
  GOVERNANCE: 'GOVERNANCE',
} as const;

export type Family = (typeof FAMILY)[keyof typeof FAMILY];

export const FAMILY_LABELS: Record<Family, string> = {
  [FAMILY.ACTOR]: 'Actor',
  [FAMILY.CAPABILITY]: 'Capability',
  [FAMILY.RESOURCE]: 'Resource',
  [FAMILY.PLACE]: 'Place',
  [FAMILY.INTENTION]: 'Intention',
  [FAMILY.COMMITMENT]: 'Commitment',
  [FAMILY.WORK]: 'Work',
  [FAMILY.ACTIVITY]: 'Activity',
  [FAMILY.EVENT]: 'Event',
  [FAMILY.OUTPUT_OUTCOME]: 'Output & Outcome',
  [FAMILY.EXCHANGE]: 'Exchange',
  [FAMILY.VALUE]: 'Value',
  [FAMILY.EVIDENCE]: 'Evidence',
  [FAMILY.KNOWLEDGE]: 'Knowledge',
  [FAMILY.GOVERNANCE]: 'Governance',
};

export const ACTOR_TYPE_LABELS = {
  // APTO canonical types
  Person: 'Person',
  Organization: 'Organization',
  Collective: 'Collective',
  Institution: 'Institution',
  Enterprise: 'Enterprise',
  Cooperative: 'Cooperative',
  GovernmentUnit: 'Government Unit',
  SoftwareAgent: 'Software Agent',
  // Application-level types (practical)
  individual: 'Individual',
  company: 'Company',
  enterprise: 'Enterprise',
  startup: 'Startup',
  institution: 'Institution',
  governmentUnit: 'Government Unit',
  university: 'University',
  school: 'School',
  researchLab: 'Research Laboratory',
  cooperative: 'Cooperative',
  communityOrganisation: 'Community Organisation',
  ngo: 'Non-governmental Organisation',
  crew: 'Crew / Collective',
  consortium: 'Project Consortium',
  other: 'Other',
};

// ---------------------------------------------------------------------------
// Family-specific canonical types (examples from APTO)
// ---------------------------------------------------------------------------

export type ActorType =
  // APTO canonical types (semantic)
  | 'Person'
  | 'Organization'
  | 'Collective'
  | 'Institution'
  | 'Enterprise'
  | 'Cooperative'
  | 'GovernmentUnit'
  | 'SoftwareAgent'
  // Application-level types (practical, used in actors.ts)
  | 'individual'
  | 'company'
  | 'enterprise'
  | 'startup'
  | 'governmentUnit'
  | 'university'
  | 'school'
  | 'researchLab'
  | 'communityOrganisation'
  | 'ngo'
  | 'crew'
  | 'consortium'
  | 'other'
  | 'institution'
  | 'cooperative';

export type CapabilityType =
  | 'Skill'
  | 'Competence'
  | 'Qualification'
  | 'Experience'
  | 'TechnicalCapability'
  | 'OperationalCapacity'
  | 'Availability';

export type ResourceType =
  | 'Asset'
  | 'Facility'
  | 'Equipment'
  | 'Material'
  | 'Inventory'
  | 'Land'
  | 'Energy'
  | 'Capital'
  | 'Dataset'
  | 'IP';

export type PlaceType =
  | 'Country'
  | 'Region'
  | 'County'
  | 'Locality'
  | 'Site'
  | 'Facility'
  | 'GeographicArea'
  | 'Jurisdiction';

export type IntentionType =
  | 'Need'
  | 'Demand'
  | 'Opportunity'
  | 'Objective'
  | 'Proposal'
  | 'Hypothesis'
  | 'Constraint';

export type CommitmentType =
  | 'Obligation'
  | 'Assignment'
  | 'Agreement'
  | 'ContractualPromise'
  | 'Reservation'
  | 'FundingCommitment';

export type WorkType =
  | 'Programme'
  | 'Initiative'
  | 'Project'
  | 'WorkPackage'
  | 'WorkOrder'
  | 'Task'
  | 'ServiceCase'
  | 'Experiment'
  | 'ProductionRun';

export type ActivityType =
  | 'Inspection'
  | 'Meeting'
  | 'Training'
  | 'ExperimentStep'
  | 'ServiceEvent'
  | 'ProductionEvent'
  | 'Transfer'
  | 'Delivery';

export type OutputOutcomeType =
  | 'Deliverable'
  | 'Product'
  | 'Service'
  | 'Result'
  | 'Outcome'
  | 'Impact'
  | 'Indicator';

export type ExchangeType =
  | 'Offer'
  | 'Request'
  | 'Quote'
  | 'Procurement'
  | 'PurchaseOrder'
  | 'Invoice'
  | 'Payment'
  | 'Shipment'
  | 'Settlement';

export type EvidenceType =
  | 'Claim'
  | 'Document'
  | 'Observation'
  | 'Measurement'
  | 'TestResult'
  | 'Attestation'
  | 'Verification'
  | 'AuditRecord';

export type KnowledgeType =
  | 'Method'
  | 'Protocol'
  | 'Standard'
  | 'Dataset'
  | 'Model'
  | 'Finding'
  | 'Design'
  | 'Curriculum'
  | 'Lesson'
  | 'Research';

export type GovernanceType =
  | 'Mandate'
  | 'Identity'
  | 'Membership'
  | 'Role'
  | 'Permission'
  | 'Consent'
  | 'Policy'
  | 'Jurisdiction'
  | 'DataClassification';

// ---------------------------------------------------------------------------
// Event family types (distinct from Activity: atomic occurrences vs sustained processes)
// ---------------------------------------------------------------------------

export type EventType =
  | 'Occurrence'
  | 'Transaction'
  | 'Incident'
  | 'Milestone'
  | 'Signal'
  | 'Alert'
  | 'StateChange';

// ---------------------------------------------------------------------------
// Value family types (aligns with EXCHANGE; value is plural and situated)
// ---------------------------------------------------------------------------

export type ValueType =
  | 'Exchange'
  | 'ValueStream'
  | 'Transfer'
  | 'Contribution'
  | 'Allocation'
  | 'Investment'
  | 'Grant'
  | 'Donation'
  | 'Settlement';

// ---------------------------------------------------------------------------
// Commitment lifecycle (first-class infrastructure)
//   proposed → accepted → active → fulfilled → discharged → expired
// ---------------------------------------------------------------------------

export const COMMITMENT_LIFECYCLE_STATE = {
  PROPOSED: 'proposed',
  ACCEPTED: 'accepted',
  ACTIVE: 'active',
  FULFILLED: 'fulfilled',
  DISCHARGED: 'discharged',
  EXPIRED: 'expired',
} as const;

export type CommitmentLifecycleState =
  (typeof COMMITMENT_LIFECYCLE_STATE)[keyof typeof COMMITMENT_LIFECYCLE_STATE];

export const COMMITMENT_LIFECYCLE_LABELS: Record<CommitmentLifecycleState, string> = {
  [COMMITMENT_LIFECYCLE_STATE.PROPOSED]: 'Proposed',
  [COMMITMENT_LIFECYCLE_STATE.ACCEPTED]: 'Accepted',
  [COMMITMENT_LIFECYCLE_STATE.ACTIVE]: 'Active',
  [COMMITMENT_LIFECYCLE_STATE.FULFILLED]: 'Fulfilled',
  [COMMITMENT_LIFECYCLE_STATE.DISCHARGED]: 'Discharged',
  [COMMITMENT_LIFECYCLE_STATE.EXPIRED]: 'Expired',
};

export const COMMITMENT_LIFECYCLE_TRANSITIONS: Record<CommitmentLifecycleState, readonly CommitmentLifecycleState[]> = {
  [COMMITMENT_LIFECYCLE_STATE.PROPOSED]: [COMMITMENT_LIFECYCLE_STATE.ACCEPTED, COMMITMENT_LIFECYCLE_STATE.EXPIRED],
  [COMMITMENT_LIFECYCLE_STATE.ACCEPTED]: [COMMITMENT_LIFECYCLE_STATE.ACTIVE, COMMITMENT_LIFECYCLE_STATE.EXPIRED],
  [COMMITMENT_LIFECYCLE_STATE.ACTIVE]: [
    COMMITMENT_LIFECYCLE_STATE.FULFILLED,
    COMMITMENT_LIFECYCLE_STATE.DISCHARGED,
    COMMITMENT_LIFECYCLE_STATE.EXPIRED,
  ],
  [COMMITMENT_LIFECYCLE_STATE.FULFILLED]: [],
  [COMMITMENT_LIFECYCLE_STATE.DISCHARGED]: [],
  [COMMITMENT_LIFECYCLE_STATE.EXPIRED]: [],
};

export function isValidCommitmentLifecycleTransition(
  from: CommitmentLifecycleState,
  to: CommitmentLifecycleState,
): boolean {
  return COMMITMENT_LIFECYCLE_TRANSITIONS[from].includes(to);
}

// ---------------------------------------------------------------------------
// Commitment depth indicators
// ---------------------------------------------------------------------------

export const COMMITMENT_DEPTH = {
  SHALLOW: 'shallow',
  MODERATE: 'moderate',
  DEEP: 'deep',
  STRATEGIC: 'strategic',
} as const;

export type CommitmentDepth = (typeof COMMITMENT_DEPTH)[keyof typeof COMMITMENT_DEPTH];

export const COMMITMENT_DEPTH_LABELS: Record<CommitmentDepth, string> = {
  [COMMITMENT_DEPTH.SHALLOW]: 'Shallow',
  [COMMITMENT_DEPTH.MODERATE]: 'Moderate',
  [COMMITMENT_DEPTH.DEEP]: 'Deep',
  [COMMITMENT_DEPTH.STRATEGIC]: 'Strategic',
};

// ---------------------------------------------------------------------------
// Productive reality cycle
//   Intention → Capability Assembly → Commitment → Execution → Evidence → Outcome → Value → Knowledge
// ---------------------------------------------------------------------------

export interface ProductiveRealityCycleStage {
  key: string;
  label: string;
  family: Family;
  /** Kinetic action that advances this stage (undefined = governance-gated, no kinetic action). */
  advancesBy?: 'commit' | 'assign' | 'verify' | 'settle' | 'produce';
  /** Whether this stage is typically gated by an authority decision before proceeding. */
  authorityGated: boolean;
}

export const PRODUCTIVE_REALITY_CYCLE: readonly ProductiveRealityCycleStage[] = [
  { key: 'intention', label: 'Intention', family: FAMILY.INTENTION, authorityGated: true },
  {
    key: 'capability-assembly',
    label: 'Capability Assembly',
    family: FAMILY.CAPABILITY,
    advancesBy: 'produce',
    authorityGated: false,
  },
  {
    key: 'commitment',
    label: 'Commitment',
    family: FAMILY.COMMITMENT,
    advancesBy: 'commit',
    authorityGated: true,
  },
  {
    key: 'execution',
    label: 'Execution',
    family: FAMILY.WORK,
    advancesBy: 'produce',
    authorityGated: false,
  },
  {
    key: 'evidence',
    label: 'Evidence',
    family: FAMILY.EVIDENCE,
    advancesBy: 'verify',
    authorityGated: true,
  },
  {
    key: 'outcome',
    label: 'Outcome',
    family: FAMILY.OUTPUT_OUTCOME,
    advancesBy: 'produce',
    authorityGated: false,
  },
  {
    key: 'value',
    label: 'Value',
    family: FAMILY.VALUE,
    advancesBy: 'settle',
    authorityGated: false,
  },
  {
    key: 'knowledge',
    label: 'Knowledge',
    family: FAMILY.KNOWLEDGE,
    authorityGated: false,
  },
] as const;

export function getProductiveRealityCycleStage(key: string): ProductiveRealityCycleStage | undefined {
  return PRODUCTIVE_REALITY_CYCLE.find((s) => s.key === key);
}

// ---------------------------------------------------------------------------
// Entity base
// ---------------------------------------------------------------------------

export interface AptEntityBase {
  /** Canonical, globally unique identifier for the entity. */
  id: string;
  /** One of the 13 families. */
  family: Family;
  /** Family-specific type discriminator. */
  type: string;
  /** Human-readable name of the entity (record name, rendered in serif). */
  name: string;
  /** Optional description. */
  description?: string;
  /** When this entity record came into existence in the source system. */
  occurredAt: string;
  /** When this entity record was recorded in APT-LABS. */
  recordedAt: string;
  /** Place where the entity is located or operates (optional). */
  placeId?: string;
  /** Organization that owns or stewards this entity (optional). */
  organizationId?: string;
  /** Version for optimistic concurrency / correction tracking. */
  version: number;
  /** Actor who created this record. */
  createdBy: string;
  /** Actor who last modified this record. */
  updatedBy: string;
  /** Actor who last modified this record. */
  updatedAt: string;
  /** Evidence standing reference (links to EVIDENCE family records). */
  evidenceIds?: string[];
  /** Arbitrary structured properties, validated against the registry schema. */
  properties?: Record<string, unknown>;
}

export interface AptEntity extends AptEntityBase {}

// ---------------------------------------------------------------------------
// Relationship base (first-class, versioned records — never bare foreign keys)
// ---------------------------------------------------------------------------

export interface AptRelationshipBase {
  id: string;
  /** Canonical relationship kind. */
  kind: string;
  /** Source entity id. */
  sourceId: string;
  /** Target entity id. */
  targetId: string;
  /** Role the source plays in this relationship (optional, semantic). */
  sourceRole?: string;
  /** Role the target plays in this relationship (optional, semantic). */
  targetRole?: string;
  /** When the relationship began (optional). */
  startedAt?: string;
  /** When the relationship ended (optional). */
  endedAt?: string;
  /** Authority under which the relationship exists (optional). */
  authority?: string;
  /** Consent status (optional, for actor-involving relationships). */
  consent?: string;
  /** Verification status (optional). */
  verificationStatus?: string;
  /** Current lifecycle status. */
  status: 'active' | 'inactive' | 'superseded' | 'terminated';
  /** Version for correction tracking. */
  version: number;
  /** When this relationship record was recorded. */
  recordedAt: string;
  /** Actor who created this record. */
  createdBy: string;
  /** Evidence ids supporting this relationship (optional). */
  evidenceIds?: string[];
  /** Arbitrary structured properties. */
  properties?: Record<string, unknown>;
}

export interface AptRelationship extends AptRelationshipBase {}

// ---------------------------------------------------------------------------
// Entity map: family → allowed types (for registry validation)
// ---------------------------------------------------------------------------

export interface FamilyTypeMap {
  [FAMILY.ACTOR]: ActorType;
  [FAMILY.CAPABILITY]: CapabilityType;
  [FAMILY.RESOURCE]: ResourceType;
  [FAMILY.PLACE]: PlaceType;
  [FAMILY.INTENTION]: IntentionType;
  [FAMILY.COMMITMENT]: CommitmentType;
  [FAMILY.WORK]: WorkType;
  [FAMILY.ACTIVITY]: ActivityType;
  [FAMILY.EVENT]: EventType;
  [FAMILY.OUTPUT_OUTCOME]: OutputOutcomeType;
  [FAMILY.EXCHANGE]: ExchangeType;
  [FAMILY.VALUE]: ValueType;
  [FAMILY.EVIDENCE]: EvidenceType;
  [FAMILY.KNOWLEDGE]: KnowledgeType;
  [FAMILY.GOVERNANCE]: GovernanceType;
}

// ---------------------------------------------------------------------------
// Operational core vs continuity & learning vs value & legitimacy vs context
// ---------------------------------------------------------------------------

export const OPERATIONAL_CORE: readonly Family[] = [
  FAMILY.ACTOR,
  FAMILY.CAPABILITY,
  FAMILY.RESOURCE,
  FAMILY.INTENTION,
  FAMILY.COMMITMENT,
  FAMILY.WORK,
];

export const CONTINUITY_LEARNING: readonly Family[] = [
  FAMILY.ACTIVITY,
  FAMILY.EVENT,
  FAMILY.OUTPUT_OUTCOME,
  FAMILY.EVIDENCE,
  FAMILY.KNOWLEDGE,
];

export const VALUE_LEGITIMACY: readonly Family[] = [
  FAMILY.EXCHANGE,
  FAMILY.VALUE,
  FAMILY.GOVERNANCE,
];

export const CONTEXT: readonly Family[] = [FAMILY.PLACE];

// ---------------------------------------------------------------------------
// Canonical distinctions (enforced in schema + UI)
// ---------------------------------------------------------------------------

export const CANONICAL_DISTINCTIONS: readonly string[] = [
  'Person ≠ Account',
  'Organization ≠ Institution',
  'Skill ≠ Qualification',
  'Capability ≠ Capacity',
  'Asset ≠ Resource',
  'Need ≠ Demand',
  'Intention ≠ Commitment',
  'Commitment ≠ Work',
  'Work ≠ Activity',
  'Event ≠ Activity',
  'Output ≠ Outcome',
  'Value ≠ Price',
  'Exchange ≠ Value',
  'Commitment ≠ Obligation',
  'Claim ≠ Evidence',
  'Evidence ≠ Verification',
  'Knowledge ≠ Document',
  'Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement',
];

// ---------------------------------------------------------------------------
// Runtime type guards
// ---------------------------------------------------------------------------

export function isFamily(value: unknown): value is Family {
  return typeof value === 'string'
    && Object.values(FAMILY).includes(value as Family);
}

export function isAptEntity(value: unknown): value is AptEntity {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<AptEntity>;
  return (
    typeof e.id === 'string'
    && isFamily(e.family)
    && typeof e.type === 'string'
    && typeof e.name === 'string'
    && typeof e.occurredAt === 'string'
    && typeof e.recordedAt === 'string'
    && typeof e.version === 'number'
    && typeof e.createdBy === 'string'
    && typeof e.updatedBy === 'string'
    && typeof e.updatedAt === 'string'
  );
}

export function isAptRelationship(value: unknown): value is AptRelationship {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<AptRelationship>;
  return (
    typeof r.id === 'string'
    && typeof r.kind === 'string'
    && typeof r.sourceId === 'string'
    && typeof r.targetId === 'string'
    && typeof r.status === 'string'
    && typeof r.version === 'number'
    && typeof r.recordedAt === 'string'
    && typeof r.createdBy === 'string'
  );
}

// ---------------------------------------------------------------------------
// Local id helper (shared with local-workflows pattern)
// ---------------------------------------------------------------------------

let ontologyCounter = 0;

export function createOntologyId(prefix: string): string {
  ontologyCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${ontologyCounter.toString(36)}`;
}
