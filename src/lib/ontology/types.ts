/**
 * APT-LABS — Ontology Core Types
 *
 * Canonical TypeScript definitions of the 13 APTO (APT Core Ontology) semantic
 * families, plus the entity base, relationship base, and event envelope.
 *
 * Framework-agnostic: no UI framework dependencies. Survives any UI-framework
 * choice (Preact, Vue 3, or other). Migrations, API schemas, permissions, and
 * UI property definitions derive from this single canonical language.
 *
 * Consolidates the pasted 13-family ontology with the existing 6-structure
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
  OUTPUT_OUTCOME: 'OUTPUT_OUTCOME',
  EXCHANGE: 'EXCHANGE',
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
  [FAMILY.OUTPUT_OUTCOME]: 'Output & Outcome',
  [FAMILY.EXCHANGE]: 'Exchange',
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
  [FAMILY.OUTPUT_OUTCOME]: OutputOutcomeType;
  [FAMILY.EXCHANGE]: ExchangeType;
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
  FAMILY.OUTPUT_OUTCOME,
  FAMILY.EVIDENCE,
  FAMILY.KNOWLEDGE,
];

export const VALUE_LEGITIMACY: readonly Family[] = [
  FAMILY.EXCHANGE,
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
  'Output ≠ Outcome',
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
