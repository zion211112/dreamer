import { describe, it, expect } from 'vitest';
import {
  MATURITY,
  EVIDENCE_STANDING,
  isMaturity,
  isEvidenceStanding,
  isEvidenceDimension,
  isActionableEvidence,
  isVerifiedEvidence,
  MATURITY_LABELS,
  EVIDENCE_STANDING_LABELS,
} from './evidence';

describe('ontology evidence', () => {
  describe('MATURITY', () => {
    it('defines four maturity levels', () => {
      expect(Object.values(MATURITY)).toHaveLength(4);
      expect(MATURITY.PLANNED).toBe('planned');
      expect(MATURITY.PROTOTYPE).toBe('prototype');
      expect(MATURITY.OPERATIONAL).toBe('operational');
      expect(MATURITY.RETIRED).toBe('retired');
    });
  });

  describe('EVIDENCE_STANDING', () => {
    it('defines seven evidence standing levels', () => {
      expect(Object.values(EVIDENCE_STANDING)).toHaveLength(7);
      expect(EVIDENCE_STANDING.UNASSESSED).toBe('unassessed');
      expect(EVIDENCE_STANDING.REPORTED).toBe('reported');
      expect(EVIDENCE_STANDING.SUPPORTED).toBe('supported');
      expect(EVIDENCE_STANDING.VERIFIED).toBe('verified');
      expect(EVIDENCE_STANDING.DISPUTED).toBe('disputed');
      expect(EVIDENCE_STANDING.REJECTED).toBe('rejected');
      expect(EVIDENCE_STANDING.EXPIRED).toBe('expired');
    });
  });

  describe('isMaturity / isEvidenceStanding', () => {
    it('validates maturity values', () => {
      expect(isMaturity('operational')).toBe(true);
      expect(isMaturity('invalid')).toBe(false);
    });
    it('validates evidence standing values', () => {
      expect(isEvidenceStanding('verified')).toBe(true);
      expect(isEvidenceStanding('invalid')).toBe(false);
    });
  });

  describe('isEvidenceDimension', () => {
    it('returns true for valid dimensions', () => {
      expect(isEvidenceDimension({ maturity: 'operational', standing: 'verified' })).toBe(true);
    });
    it('returns false for invalid dimensions', () => {
      expect(isEvidenceDimension({ maturity: 'bad', standing: 'verified' })).toBe(false);
      expect(isEvidenceDimension({ maturity: 'operational', standing: 'bad' })).toBe(false);
      expect(isEvidenceDimension(null)).toBe(false);
    });
  });

  describe('isActionableEvidence', () => {
    it('returns true for operational + verified', () => {
      expect(isActionableEvidence({ maturity: 'operational', standing: 'verified' })).toBe(true);
    });
    it('returns true for operational + supported', () => {
      expect(isActionableEvidence({ maturity: 'operational', standing: 'supported' })).toBe(true);
    });
    it('returns false for planned', () => {
      expect(isActionableEvidence({ maturity: 'planned', standing: 'verified' })).toBe(false);
    });
    it('returns false for retired', () => {
      expect(isActionableEvidence({ maturity: 'retired', standing: 'verified' })).toBe(false);
    });
    it('returns false for rejected', () => {
      expect(isActionableEvidence({ maturity: 'operational', standing: 'rejected' })).toBe(false);
    });
    it('returns false for disputed', () => {
      expect(isActionableEvidence({ maturity: 'operational', standing: 'disputed' })).toBe(false);
    });
    it('returns false for expired', () => {
      expect(isActionableEvidence({ maturity: 'operational', standing: 'expired' })).toBe(false);
    });
  });

  describe('isVerifiedEvidence', () => {
    it('returns true only for verified standing', () => {
      expect(isVerifiedEvidence({ maturity: 'operational', standing: 'verified' })).toBe(true);
      expect(isVerifiedEvidence({ maturity: 'operational', standing: 'supported' })).toBe(false);
    });
  });

  describe('labels', () => {
    it('MATURITY_LABELS has a label for every maturity', () => {
      for (const m of Object.values(MATURITY)) {
        expect(MATURITY_LABELS[m]).toBeDefined();
      }
    });
    it('EVIDENCE_STANDING_LABELS has a label for every standing', () => {
      for (const s of Object.values(EVIDENCE_STANDING)) {
        expect(EVIDENCE_STANDING_LABELS[s]).toBeDefined();
      }
    });
  });
});
