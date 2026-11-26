/**
 * APT-LABS — Ontology Layer Barrel
 *
 * Framework-agnostic canonical TypeScript definitions for the APTO ontology.
 * Re-exports all ontology modules for use by migrations, API schemas,
 * permissions, and UI property definitions.
 */

// Types
export type { Family, AptEntity, AptEntityBase, AptRelationship, AptRelationshipBase } from './types';
export type { ActorType, CapabilityType, ResourceType, PlaceType } from './types';
export type { IntentionType, CommitmentType, WorkType, ActivityType } from './types';
export type { OutputOutcomeType, ExchangeType, EvidenceType, ValueType } from './types';
export type { KnowledgeType, GovernanceType } from './types';
export type { CommitmentLifecycleState, CommitmentDepth } from './types';
export type { ProductiveRealityCycleStage } from './types';
export type { FamilyTypeMap } from './types';
export { FAMILY, FAMILY_LABELS, isFamily, isAptEntity, isAptRelationship, createOntologyId } from './types';
export { ACTOR_TYPE_LABELS } from './types';
export { OPERATIONAL_CORE, CONTINUITY_LEARNING, VALUE_LEGITIMACY, CONTEXT } from './types';
export { CANONICAL_DISTINCTIONS } from './types';

export {
  COMMITMENT_LIFECYCLE_STATE,
  COMMITMENT_LIFECYCLE_LABELS,
  COMMITMENT_LIFECYCLE_TRANSITIONS,
  isValidCommitmentLifecycleTransition,
  COMMITMENT_DEPTH,
  COMMITMENT_DEPTH_LABELS,
  PRODUCTIVE_REALITY_CYCLE,
  getProductiveRealityCycleStage,
} from './types';

// Shared network and domain protocol contracts
export type { NetworkStructure, NetworkStructureId } from './network';
export { NETWORK_STRUCTURES, NETWORK_CONTEXT_FAMILIES, NETWORK_CROSS_CUTTING_FAMILIES } from './network';
export type {
  DomainProtocolStatus,
  ProtocolFieldType,
  ProtocolDataClassification,
  DomainProtocolField,
  DomainRecordDefinition,
  DomainRelationshipMapping,
  DomainProtocolTransition,
  DomainProtocolExceptionPath,
  DomainProtocolDefinition,
  ProtocolValidationResult,
} from './protocols';
export { validateDomainProtocolDefinition, isDomainProtocolDefinition } from './protocols';

// Relationships
export type { RelationshipKind, RelationshipCardinality, RelationshipMetadata } from './relationships';
export {
  RELATIONSHIP_KIND,
  RELATIONSHIP_CARDINALITY,
  getCardinality,
  isValidRelationshipKind,
  isValidSourceTarget,
} from './relationships';

// Events
export type { AptEvent, CorrectiveEvent, EventSource, EventType } from './events';
export { EVENT_TYPE, createEvent, createEventId, createCorrectiveEvent, isAptEvent } from './events';

// Evidence
export type { Maturity, EvidenceStanding, EvidenceDimension, AptEvidence } from './evidence';
export {
  MATURITY,
  EVIDENCE_STANDING,
  MATURITY_LABELS,
  EVIDENCE_STANDING_LABELS,
  isMaturity,
  isEvidenceStanding,
  isEvidenceDimension,
  isActionableEvidence,
  isVerifiedEvidence,
} from './evidence';

// Actions
export type { ActionKind, ActionResult, AuthContext, ActionValidation } from './actions';
export type { CommitInput, AssignInput, VerifyInput, SettleInput, ProduceInput } from './actions';
export {
  ACTION_KIND,
  ACTION_LABELS,
  DEFAULT_ACTION_VALIDATIONS,
  DefaultActionEngine,
  createActionEngine,
  isActionKind,
} from './actions';

// Registry
export type {
  ObjectRegistry,
  EntityTypeDefinition,
  RelationshipTypeDefinition,
  PropertyDefinition,
  StateMachineDefinition,
  TransitionDefinition,
} from './registry';
export { DefaultObjectRegistry, createObjectRegistry } from './registry';

// Workflow
export type {
  WorkflowStep,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStatus,
  StepResult,
  WorkflowEngine,
} from './workflow';
export {
  CANONICAL_WORKFLOWS,
  isWorkflowStatus,
  isWorkflowDefinition,
} from './workflow';
