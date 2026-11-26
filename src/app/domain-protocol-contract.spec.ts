import { describe, expect, it } from 'vitest';
import {
  NETWORK_STRUCTURES,
  NETWORK_CONTEXT_FAMILIES,
  NETWORK_CROSS_CUTTING_FAMILIES,
  FAMILY,
  validateDomainProtocolDefinition,
  type DomainProtocolDefinition,
} from '../../libs/ontology/src';

const validProtocol: DomainProtocolDefinition = {
  id: 'ke.aptlabs.cooperative:production',
  namespace: 'ke.aptlabs.cooperative',
  version: '1.0.0',
  name: 'Cooperative production',
  steward: 'aptlabs-ontology-steward',
  status: 'active',
  effectiveFrom: '2026-11-25T00:00:00.000Z',
  jurisdiction: 'Kenya',
  sourceBasis: 'Reviewed cooperative production rules.',
  kernelFamilies: ['ACTOR', 'WORK', 'OUTPUT_OUTCOME'],
  relationshipKinds: ['PERFORMED_BY', 'PRODUCES'],
  relationshipMappings: [
    { localTerm: 'production performer', kernelKind: 'PERFORMED_BY', sourceFamily: 'WORK', targetFamily: 'ACTOR', meaning: 'Actor who performed the production run.' },
    { localTerm: 'production result', kernelKind: 'PRODUCES', sourceFamily: 'WORK', targetFamily: 'OUTPUT_OUTCOME', meaning: 'Outcome produced by the production run.' },
  ],
  records: [
    {
      type: 'ProductionRun',
      name: 'Production run',
      kernelFamily: 'WORK',
      fields: [{ name: 'cycle', type: 'string', required: true }],
      classification: 'participant-scoped',
      retention: 'Retain under the participating cooperative policy.',
      sensitiveDataMinimization: 'Do not collect personal details unrelated to the run.',
    },
  ],
  states: ['planned', 'started'],
  transitions: [
    {
      from: 'planned',
      to: 'started',
      initiatingActor: 'active cooperative member',
      requiredPermission: 'production:begin',
      preconditions: ['The run is approved by the cooperative.'],
      evidenceExpected: [],
      decisionOwner: 'cooperative production steward',
      eventType: 'SYSTEM_AUDIT',
      exceptionPaths: [{ kind: 'correction', description: 'Record a superseding event with its reason.' }],
    },
  ],
  compatibility: {
    readableVersions: ['1.0.0'],
    migration: 'No migration is needed for the initial version.',
  },
  authorizationPrivacyEvidence: ['Authorization and visibility tests passed.'],
  conformanceEvidence: ['Protocol conformance review passed.'],
};

describe('network kernel and domain protocol contract', () => {
  it('names the six high-level structures without prescribing a lifecycle', () => {
    expect(NETWORK_STRUCTURES.map(({ id }) => id)).toEqual([
      'actors', 'resources', 'intentions', 'commitments', 'activity', 'knowledge',
    ]);
    expect([
      ...NETWORK_STRUCTURES.flatMap(({ families }) => families),
      ...NETWORK_CONTEXT_FAMILIES,
      ...NETWORK_CROSS_CUTTING_FAMILIES,
    ].sort()).toEqual(Object.values(FAMILY).sort());
  });

  it('accepts a versioned protocol that specializes only the kernel concepts it needs', () => {
    expect(validateDomainProtocolDefinition(validProtocol)).toEqual({ valid: true, errors: [] });

    const agricultureEdgeProtocol = {
      ...validProtocol,
      id: 'ke.aptlabs.agriculture:inspection',
      namespace: 'ke.aptlabs.agriculture',
      status: 'pilot' as const,
      kernelFamilies: ['RESOURCE', 'ACTIVITY', 'EVIDENCE'],
      relationshipKinds: ['USES', 'SUPPORTED_BY'],
      relationshipMappings: [],
      records: [],
      states: [],
      transitions: [],
      authorizationPrivacyEvidence: undefined,
      conformanceEvidence: undefined,
    };
    expect(validateDomainProtocolDefinition(agricultureEdgeProtocol).valid).toBe(true);
  });

  it('rejects unknown kernel families and relationships', () => {
    const result = validateDomainProtocolDefinition({
      ...validProtocol,
      kernelFamilies: ['PERSON'] as never,
      relationshipKinds: ['RELATED_TO'],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('kernel family');
    expect(result.errors.join(' ')).toContain('relationship kind');
  });

  it('rejects invalid relationship endpoints and undeclared transition states', () => {
    const result = validateDomainProtocolDefinition({
      ...validProtocol,
      relationshipMappings: [
        { ...validProtocol.relationshipMappings[0], sourceFamily: 'ACTOR' },
        { ...validProtocol.relationshipMappings[1], kernelKind: 'PERFORMED_BY', targetFamily: 'ACTOR' },
      ],
      transitions: [{ ...validProtocol.transitions[0], to: 'finished' }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('invalid kernel endpoint families');
    expect(result.errors.join(' ')).toContain('declared protocol states');
  });

  it('rejects incomplete transition authority and correction requirements', () => {
    const result = validateDomainProtocolDefinition({
      ...validProtocol,
      transitions: [{
        ...validProtocol.transitions[0],
        requiredPermission: '',
        decisionOwner: '',
        exceptionPaths: [],
      }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('requiredPermission');
    expect(result.errors.join(' ')).toContain('decisionOwner');
    expect(result.errors.join(' ')).toContain('correction exception path');
  });

  it('requires authorization/privacy and conformance evidence before activation', () => {
    const result = validateDomainProtocolDefinition({
      ...validProtocol,
      authorizationPrivacyEvidence: [],
      conformanceEvidence: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('authorizationPrivacyEvidence');
    expect(result.errors.join(' ')).toContain('conformanceEvidence');
  });

  it('rejects malformed versions, unmapped domain records, and invalid input shapes', () => {
    const result = validateDomainProtocolDefinition({
      ...validProtocol,
      version: '1.0',
      records: [{ ...validProtocol.records[0], kernelFamily: 'PERSON' as never }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('semantic version');
    expect(result.errors.join(' ')).toContain('kernel family');
    expect(validateDomainProtocolDefinition({ ...validProtocol, version: '1.0.0-01' }).valid).toBe(false);
    expect(validateDomainProtocolDefinition(null).valid).toBe(false);
    expect(validateDomainProtocolDefinition({ version: 2 }).valid).toBe(false);
  });
});
