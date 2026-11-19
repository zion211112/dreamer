import { describe, it, expect } from 'vitest';
import {
  RELATIONSHIP_KIND,
  RELATIONSHIP_CARDINALITY,
  getCardinality,
  isValidRelationshipKind,
  isValidSourceTarget,
} from './relationships';
import type { Family } from './types';

describe('ontology relationships', () => {
  describe('RELATIONSHIP_KIND', () => {
    it('defines relationship kinds', () => {
      expect(RELATIONSHIP_KIND.HOLDS_CAPABILITY).toBe('HOLDS_CAPABILITY');
      expect(RELATIONSHIP_KIND.AFFILIATED_WITH).toBe('AFFILIATED_WITH');
      expect(RELATIONSHIP_KIND.SETTLES).toBe('SETTLES');
      expect(RELATIONSHIP_KIND.GOVERNED_BY).toBe('GOVERNED_BY');
    });
    it('includes people-network legacy kinds', () => {
      expect(RELATIONSHIP_KIND.MEMBERSHIP).toBe('MEMBERSHIP');
      expect(RELATIONSHIP_KIND.STEWARDSHIP).toBe('STEWARDSHIP');
      expect(RELATIONSHIP_KIND.CONTRIBUTION).toBe('CONTRIBUTION');
      expect(RELATIONSHIP_KIND.ATTESTS).toBe('ATTESTS');
    });
  });

  describe('isValidRelationshipKind', () => {
    it('returns true for valid kinds', () => {
      expect(isValidRelationshipKind('HOLDS_CAPABILITY')).toBe(true);
      expect(isValidRelationshipKind('COMMITTED_TO')).toBe(true);
    });
    it('returns false for invalid values', () => {
      expect(isValidRelationshipKind('NOT_A_KIND')).toBe(false);
      expect(isValidRelationshipKind('')).toBe(false);
    });
  });

  describe('RELATIONSHIP_CARDINALITY', () => {
    it('defines cardinality for all kinds', () => {
      expect(RELATIONSHIP_CARDINALITY.length).toBeGreaterThan(0);
    });
    it('HOLDS_CAPABILITY allows ACTOR → CAPABILITY', () => {
      const card = getCardinality(RELATIONSHIP_KIND.HOLDS_CAPABILITY);
      expect(card).toBeDefined();
      expect(card!.sources).toContain('ACTOR');
      expect(card!.targets).toContain('CAPABILITY');
    });
    it('COMMITTED_TO allows ACTOR → COMMITMENT', () => {
      const card = getCardinality(RELATIONSHIP_KIND.COMMITTED_TO);
      expect(card).toBeDefined();
      expect(card!.sources).toContain('ACTOR');
      expect(card!.targets).toContain('COMMITMENT');
    });
  });

  describe('getCardinality', () => {
    it('returns undefined for unknown kinds', () => {
      expect(getCardinality('UNKNOWN_KIND' as any)).toBeUndefined();
    });
  });

  describe('isValidSourceTarget', () => {
    it('returns true for valid source/target pairs', () => {
      expect(isValidSourceTarget('HOLDS_CAPABILITY', 'ACTOR' as Family, 'CAPABILITY' as Family)).toBe(true);
    });
    it('returns false for invalid source/target pairs', () => {
      expect(isValidSourceTarget('HOLDS_CAPABILITY', 'CAPABILITY' as Family, 'ACTOR' as Family)).toBe(false);
    });
    it('returns false for unknown kinds', () => {
      expect(isValidSourceTarget('UNKNOWN' as any, 'ACTOR' as Family, 'CAPABILITY' as Family)).toBe(false);
    });
  });
});
