import { describe, it, expect } from 'vitest';
import {
  FAMILY,
  isFamily,
  isAptEntity,
  isAptRelationship,
  createOntologyId,
  OPERATIONAL_CORE,
  CONTINUITY_LEARNING,
  VALUE_LEGITIMACY,
  CONTEXT,
  CANONICAL_DISTINCTIONS,
  FAMILY_LABELS,
} from './types';

describe('ontology types', () => {
  describe('FAMILY', () => {
    it('defines all 13 families', () => {
      expect(Object.values(FAMILY)).toHaveLength(13);
      expect(FAMILY.ACTOR).toBe('ACTOR');
      expect(FAMILY.CAPABILITY).toBe('CAPABILITY');
      expect(FAMILY.RESOURCE).toBe('RESOURCE');
      expect(FAMILY.PLACE).toBe('PLACE');
      expect(FAMILY.INTENTION).toBe('INTENTION');
      expect(FAMILY.COMMITMENT).toBe('COMMITMENT');
      expect(FAMILY.WORK).toBe('WORK');
      expect(FAMILY.ACTIVITY).toBe('ACTIVITY');
      expect(FAMILY.OUTPUT_OUTCOME).toBe('OUTPUT_OUTCOME');
      expect(FAMILY.EXCHANGE).toBe('EXCHANGE');
      expect(FAMILY.EVIDENCE).toBe('EVIDENCE');
      expect(FAMILY.KNOWLEDGE).toBe('KNOWLEDGE');
      expect(FAMILY.GOVERNANCE).toBe('GOVERNANCE');
    });
  });

  describe('isFamily', () => {
    it('returns true for valid families', () => {
      expect(isFamily('ACTOR')).toBe(true);
      expect(isFamily('WORK')).toBe(true);
    });
    it('returns false for invalid values', () => {
      expect(isFamily('NOT_A_FAMILY')).toBe(false);
      expect(isFamily('')).toBe(false);
      expect(isFamily(null as unknown as string)).toBe(false);
    });
  });

  describe('isAptEntity', () => {
    it('returns true for a valid entity', () => {
      const entity = {
        id: 'ent-1',
        family: 'ACTOR',
        type: 'Person',
        name: 'Jane Doe',
        occurredAt: '2026-01-01T00:00:00Z',
        recordedAt: '2026-01-01T00:00:00Z',
        version: 1,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(isAptEntity(entity)).toBe(true);
    });
    it('returns false for invalid entities', () => {
      expect(isAptEntity(null)).toBe(false);
      expect(isAptEntity({})).toBe(false);
      expect(isAptEntity({ id: '1', family: 'ACTOR' })).toBe(false);
    });
  });

  describe('isAptRelationship', () => {
    it('returns true for a valid relationship', () => {
      const rel = {
        id: 'rel-1',
        kind: 'HOLDS_CAPABILITY',
        sourceId: 'actor-1',
        targetId: 'cap-1',
        status: 'active',
        version: 1,
        recordedAt: '2026-01-01T00:00:00Z',
        createdBy: 'user-1',
      };
      expect(isAptRelationship(rel)).toBe(true);
    });
    it('returns false for invalid relationships', () => {
      expect(isAptRelationship(null)).toBe(false);
      expect(isAptRelationship({})).toBe(false);
    });
  });

  describe('createOntologyId', () => {
    it('creates ids with the given prefix', () => {
      const id = createOntologyId('actor');
      expect(id).toMatch(/^actor-/);
    });
    it('creates unique ids', () => {
      const a = createOntologyId('x');
      const b = createOntologyId('x');
      expect(a).not.toBe(b);
    });
  });

  describe('family groupings', () => {
    it('operational core has 6 families', () => {
      expect(OPERATIONAL_CORE).toHaveLength(6);
    });
    it('continuity & learning has 4 families', () => {
      expect(CONTINUITY_LEARNING).toHaveLength(4);
    });
    it('value & legitimacy has 2 families', () => {
      expect(VALUE_LEGITIMACY).toHaveLength(2);
    });
    it('context has 1 family', () => {
      expect(CONTEXT).toHaveLength(1);
    });
    it('all groups combined equal all 13 families', () => {
      const all = new Set([
        ...OPERATIONAL_CORE,
        ...CONTINUITY_LEARNING,
        ...VALUE_LEGITIMACY,
        ...CONTEXT,
      ]);
      expect(all.size).toBe(13);
    });
  });

  describe('FAMILY_LABELS', () => {
    it('has a label for every family', () => {
      for (const family of Object.values(FAMILY)) {
        expect(FAMILY_LABELS[family]).toBeDefined();
        expect(typeof FAMILY_LABELS[family]).toBe('string');
        expect(FAMILY_LABELS[family]!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CANONICAL_DISTINCTIONS', () => {
    it('is non-empty', () => {
      expect(CANONICAL_DISTINCTIONS.length).toBeGreaterThan(0);
    });
    it('includes the core distinction Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement', () => {
      expect(CANONICAL_DISTINCTIONS.some((d) => d.includes('Approval ≠ Authorization'))).toBe(true);
    });
  });
});
