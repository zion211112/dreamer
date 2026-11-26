import { EVENT_TYPE, type EventType } from './events';
import { isValidRelationshipKind, isValidSourceTarget, type RelationshipKind } from './relationships';
import { FAMILY, isFamily, type Family } from './types';

export type DomainProtocolStatus = 'draft' | 'pilot' | 'active' | 'deprecated' | 'superseded';
export type ProtocolFieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
export type ProtocolDataClassification = 'public' | 'participant-scoped' | 'sensitive' | 'restricted';

export interface DomainProtocolField {
  name: string;
  type: ProtocolFieldType;
  required: boolean;
  description?: string;
}

export interface DomainRecordDefinition {
  type: string;
  name: string;
  kernelFamily: Family;
  fields: readonly DomainProtocolField[];
  classification: ProtocolDataClassification;
  retention: string;
  sensitiveDataMinimization: string;
}

export interface DomainRelationshipMapping {
  localTerm: string;
  kernelKind: RelationshipKind;
  sourceFamily: Family;
  targetFamily: Family;
  meaning: string;
}

export interface DomainProtocolExceptionPath {
  kind: 'correction' | 'cancellation' | 'dispute' | 'appeal' | 'expiry';
  description: string;
}

export interface DomainProtocolTransition {
  from: string;
  to: string;
  initiatingActor: string;
  requiredPermission: string;
  preconditions: readonly string[];
  evidenceExpected: readonly string[];
  decisionOwner: string;
  eventType: EventType;
  exceptionPaths: readonly DomainProtocolExceptionPath[];
}

/**
 * Versioned domain extension over the shared kernel. This declaration does not
 * grant runtime authority or activate a protocol by itself.
 */
export interface DomainProtocolDefinition {
  id: string;
  namespace: string;
  version: string;
  name: string;
  steward: string;
  status: DomainProtocolStatus;
  effectiveFrom: string;
  jurisdiction: string;
  sourceBasis: string;
  kernelFamilies: readonly Family[];
  relationshipKinds: readonly RelationshipKind[];
  relationshipMappings: readonly DomainRelationshipMapping[];
  records: readonly DomainRecordDefinition[];
  states: readonly string[];
  transitions: readonly DomainProtocolTransition[];
  compatibility: {
    readableVersions: readonly string[];
    migration: string;
  };
  authorizationPrivacyEvidence?: readonly string[];
  conformanceEvidence?: readonly string[];
}

export interface ProtocolValidationResult {
  valid: boolean;
  errors: string[];
}

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function isSemanticVersion(value: string): boolean {
  const match = SEMVER.exec(value);
  if (!match) return false;
  return (match[4]?.split('.') ?? []).every((part) => !/^\d+$/.test(part) || part === '0' || !part.startsWith('0'));
}
const IDENTIFIER = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const CLASSIFICATIONS: readonly ProtocolDataClassification[] = ['public', 'participant-scoped', 'sensitive', 'restricted'];
const FIELD_TYPES: readonly ProtocolFieldType[] = ['string', 'number', 'boolean', 'date', 'array', 'object'];
const FORBIDDEN_FAMILY_LABELS = new Set(['PERSON', 'ACCOUNT', 'ORGANIZATION', 'INSTITUTION', 'CREW', 'ASSET']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasUniqueValues(values: readonly unknown[]): boolean {
  return new Set(values).size === values.length;
}

function isProtocolField(value: unknown): value is DomainProtocolField {
  if (!isRecord(value)) return false;
  const field = value as Partial<DomainProtocolField>;
  return nonEmpty(field.name)
    && IDENTIFIER.test(field.name)
    && FIELD_TYPES.includes(field.type as ProtocolFieldType)
    && typeof field.required === 'boolean'
    && (field.description === undefined || typeof field.description === 'string');
}

function isRelationshipMapping(value: unknown): value is DomainRelationshipMapping {
  if (!isRecord(value)) return false;
  const mapping = value as Partial<DomainRelationshipMapping>;
  return nonEmpty(mapping.localTerm)
    && nonEmpty(mapping.kernelKind)
    && nonEmpty(mapping.sourceFamily)
    && nonEmpty(mapping.targetFamily)
    && nonEmpty(mapping.meaning);
}

function isDomainRecord(value: unknown): value is DomainRecordDefinition {
  if (!isRecord(value)) return false;
  const record = value as Partial<DomainRecordDefinition>;
  return nonEmpty(record.type)
    && /^[A-Za-z][A-Za-z0-9]*(?:[._-][A-Za-z0-9]+)*$/.test(record.type)
    && nonEmpty(record.name)
    && nonEmpty(record.kernelFamily)
    && Array.isArray(record.fields)
    && record.fields.every(isProtocolField)
    && hasUniqueValues((record.fields as DomainProtocolField[]).map(({ name }) => name))
    && CLASSIFICATIONS.includes(record.classification as ProtocolDataClassification)
    && nonEmpty(record.retention)
    && nonEmpty(record.sensitiveDataMinimization);
}

function isTransition(value: unknown): value is DomainProtocolTransition {
  if (!isRecord(value)) return false;
  const transition = value as Partial<DomainProtocolTransition>;
  return nonEmpty(transition.from)
    && nonEmpty(transition.to)
    && typeof transition.initiatingActor === 'string'
    && typeof transition.requiredPermission === 'string'
    && Array.isArray(transition.preconditions)
    && transition.preconditions.every((item) => typeof item === 'string')
    && Array.isArray(transition.evidenceExpected)
    && transition.evidenceExpected.every((item) => typeof item === 'string')
    && typeof transition.decisionOwner === 'string'
    && nonEmpty(transition.eventType)
    && Array.isArray(transition.exceptionPaths)
    && transition.exceptionPaths.every((path) => isRecord(path)
      && ['correction', 'cancellation', 'dispute', 'appeal', 'expiry'].includes(String(path['kind']))
      && nonEmpty(path['description']))
    && hasUniqueValues((transition.exceptionPaths as DomainProtocolExceptionPath[]).map(({ kind }) => kind));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonEmpty);
}

function isDomainProtocolShape(value: unknown): value is DomainProtocolDefinition {
  if (!isRecord(value)) return false;
  const protocol = value as Partial<DomainProtocolDefinition>;
  const compatibility = protocol.compatibility;
  return nonEmpty(protocol.id)
    && nonEmpty(protocol.namespace)
    && nonEmpty(protocol.version)
    && nonEmpty(protocol.name)
    && nonEmpty(protocol.steward)
    && ['draft', 'pilot', 'active', 'deprecated', 'superseded'].includes(String(protocol.status))
    && nonEmpty(protocol.effectiveFrom)
    && nonEmpty(protocol.jurisdiction)
    && nonEmpty(protocol.sourceBasis)
    && Array.isArray(protocol.kernelFamilies)
    && protocol.kernelFamilies.every(nonEmpty)
    && Array.isArray(protocol.relationshipKinds)
    && protocol.relationshipKinds.every(nonEmpty)
    && Array.isArray(protocol.relationshipMappings)
    && protocol.relationshipMappings.every(isRelationshipMapping)
    && Array.isArray(protocol.records)
    && protocol.records.every(isDomainRecord)
    && Array.isArray(protocol.states)
    && protocol.states.every(nonEmpty)
    && Array.isArray(protocol.transitions)
    && protocol.transitions.every(isTransition)
    && isRecord(compatibility)
    && isStringArray(compatibility['readableVersions'])
    && nonEmpty(compatibility['migration'])
    && (protocol.authorizationPrivacyEvidence === undefined || isStringArray(protocol.authorizationPrivacyEvidence))
    && (protocol.conformanceEvidence === undefined || isStringArray(protocol.conformanceEvidence));
}

/** Validate untrusted protocol metadata against kernel and activation invariants. */
export function validateDomainProtocolDefinition(value: unknown): ProtocolValidationResult {
  if (!isDomainProtocolShape(value)) {
    return { valid: false, errors: ['Protocol definition has an invalid shape or missing required fields.'] };
  }

  const errors: string[] = [];
  const knownFamilies = new Set(Object.values(FAMILY));
  for (const family of value.kernelFamilies) {
    if (!knownFamilies.has(family as Family)) errors.push(`Unknown kernel family: ${family}.`);
  }
  for (const kind of value.relationshipKinds) {
    if (!isValidRelationshipKind(kind)) errors.push(`Unknown kernel relationship kind: ${kind}.`);
  }
  for (const mapping of value.relationshipMappings) {
    if (!isFamily(mapping.sourceFamily) || !isFamily(mapping.targetFamily)) {
      errors.push(`Relationship mapping '${mapping.localTerm}' references an unknown kernel family.`);
    }
    if (!isValidRelationshipKind(mapping.kernelKind)) {
      errors.push(`Unknown kernel relationship kind in mapping: ${mapping.kernelKind}.`);
    } else if (!value.relationshipKinds.includes(mapping.kernelKind)) {
      errors.push(`Mapped relationship '${mapping.localTerm}' must declare its kernel kind.`);
    } else if (!isValidSourceTarget(mapping.kernelKind, mapping.sourceFamily, mapping.targetFamily)) {
      errors.push(`Relationship mapping '${mapping.localTerm}' has invalid kernel endpoint families.`);
    }
    if (!value.kernelFamilies.includes(mapping.sourceFamily) || !value.kernelFamilies.includes(mapping.targetFamily)) {
      errors.push(`Relationship mapping '${mapping.localTerm}' must use declared kernel families.`);
    }
  }
  if (!hasUniqueValues(value.relationshipMappings.map(({ localTerm }) => localTerm))) {
    errors.push('Local relationship terms must be unique within the protocol.');
  }
  if (!hasUniqueValues(value.states)) errors.push('Protocol states must be unique.');
  if (value.transitions.length > 0 && value.states.length === 0) errors.push('Transitions require declared protocol states.');
  if (!value.compatibility.readableVersions.includes(value.version)) {
    errors.push('compatibility.readableVersions must include the protocol version.');
  }
  if (!isSemanticVersion(value.version)) errors.push('Protocol version must be semantic versioning.');
  const idParts = value.id.split(':');
  if (!IDENTIFIER.test(value.namespace) || idParts.length !== 2 || idParts[0] !== value.namespace || !IDENTIFIER.test(idParts[1])) {
    errors.push('Protocol id must use its namespace followed by a local identifier.');
  }
  if (!Number.isFinite(Date.parse(value.effectiveFrom))) errors.push('effectiveFrom must be a valid date-time.');
  if (!hasUniqueValues(value.kernelFamilies)) errors.push('kernelFamilies must not contain duplicates.');
  if (!hasUniqueValues(value.relationshipKinds)) errors.push('relationshipKinds must not contain duplicates.');
  if (!hasUniqueValues(value.records.map(({ type }) => type))) errors.push('Domain record types must be unique within the protocol.');
  if (!hasUniqueValues(value.relationshipMappings.map(({ localTerm }) => localTerm.toLocaleLowerCase()))) {
    errors.push('Local relationship terms must be unique regardless of case.');
  }
  if (value.kernelFamilies.some((family) => FORBIDDEN_FAMILY_LABELS.has(family))) {
    errors.push('Protocol cannot introduce a parallel identity, actor, or resource family.');
  }

  for (const record of value.records) {
    if (!value.kernelFamilies.includes(record.kernelFamily)) {
      errors.push(`Record '${record.type}' must map to a declared kernel family.`);
    }
  }

  for (const transition of value.transitions) {
    if (!nonEmpty(transition.initiatingActor)) errors.push(`Transition '${transition.from}' requires an initiatingActor.`);
    if (!nonEmpty(transition.requiredPermission)) errors.push(`Transition '${transition.from}' requires requiredPermission.`);
    if (!nonEmpty(transition.decisionOwner)) errors.push(`Transition '${transition.from}' requires a decisionOwner.`);
    if (!Object.values(EVENT_TYPE).includes(transition.eventType)) {
      errors.push(`Transition '${transition.from}' must emit a canonical attributable event type.`);
    }
    if (!transition.exceptionPaths.some(({ kind }) => kind === 'correction')) {
      errors.push(`Transition '${transition.from}' requires a correction exception path.`);
    }
    if (!hasUniqueValues(transition.exceptionPaths.map(({ kind }) => kind))) {
      errors.push(`Transition '${transition.from}' must not repeat exception path kinds.`);
    }
    if (transition.from === transition.to) errors.push(`Transition '${transition.from}' to itself is invalid.`);
    if (!value.states.includes(transition.from) || !value.states.includes(transition.to)) {
      errors.push(`Transition '${transition.from}' to '${transition.to}' must use declared protocol states.`);
    }
  }

  if (value.status === 'active') {
    if (!value.authorizationPrivacyEvidence?.length) {
      errors.push('Active protocol requires authorizationPrivacyEvidence.');
    }
    if (!value.conformanceEvidence?.length) {
      errors.push('Active protocol requires conformanceEvidence.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isDomainProtocolDefinition(value: unknown): value is DomainProtocolDefinition {
  return isDomainProtocolShape(value) && validateDomainProtocolDefinition(value).valid;
}
