/**
 * APT-LABS — Ontology Evidence Dimensions
 *
 * Two evidence-standing dimensions:
 *   Maturity (planned, prototype, operational, retired) ×
 *   Evidence standing (unassessed, reported, supported, verified, disputed, rejected, expired).
 *
 * Every evidence claim carries both dimensions. Evidence standing is about
 * how well the claim is supported, not about access classification
 * (public/participant/restricted are access classifications, per charter A5).
 */

import type { Family } from './types';

// ---------------------------------------------------------------------------
// Maturity dimension
// ---------------------------------------------------------------------------

export const MATURITY = {
  PLANNED: 'planned',
  PROTOTYPE: 'prototype',
  OPERATIONAL: 'operational',
  RETIRED: 'retired',
} as const;

export type Maturity = (typeof MATURITY)[keyof typeof MATURITY];

export const MATURITY_LABELS: Record<Maturity, string> = {
  [MATURITY.PLANNED]: 'Planned',
  [MATURITY.PROTOTYPE]: 'Prototype',
  [MATURITY.OPERATIONAL]: 'Operational',
  [MATURITY.RETIRED]: 'Retired',
};

// ---------------------------------------------------------------------------
// Evidence standing dimension
// ---------------------------------------------------------------------------

export const EVIDENCE_STANDING = {
  UNASSESSED: 'unassessed',
  REPORTED: 'reported',
  SUPPORTED: 'supported',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export type EvidenceStanding = (typeof EVIDENCE_STANDING)[keyof typeof EVIDENCE_STANDING];

export const EVIDENCE_STANDING_LABELS: Record<EvidenceStanding, string> = {
  [EVIDENCE_STANDING.UNASSESSED]: 'Unassessed',
  [EVIDENCE_STANDING.REPORTED]: 'Reported',
  [EVIDENCE_STANDING.SUPPORTED]: 'Supported',
  [EVIDENCE_STANDING.VERIFIED]: 'Verified',
  [EVIDENCE_STANDING.DISPUTED]: 'Disputed',
  [EVIDENCE_STANDING.REJECTED]: 'Rejected',
  [EVIDENCE_STANDING.EXPIRED]: 'Expired',
};

// ---------------------------------------------------------------------------
// Evidence dimension: the maturity × standing matrix
// ---------------------------------------------------------------------------

export interface EvidenceDimension {
  maturity: Maturity;
  standing: EvidenceStanding;
}

/** Whether a given maturity × standing combination is considered actionable. */
export function isActionableEvidence(dim: EvidenceDimension): boolean {
  // Operational + verified/supported is actionable.
  // Prototype + supported may be actionable with conditions.
  // Planned, retired, disputed, rejected, expired are not actionable.
  if (dim.maturity === MATURITY.RETIRED) return false;
  if (dim.standing === EVIDENCE_STANDING.REJECTED) return false;
  if (dim.standing === EVIDENCE_STANDING.EXPIRED) return false;
  if (dim.standing === EVIDENCE_STANDING.DISPUTED) return false;
  if (dim.maturity === MATURITY.PLANNED) return false;
  return true;
}

/** Whether a given maturity × standing combination is considered verified. */
export function isVerifiedEvidence(dim: EvidenceDimension): boolean {
  return dim.standing === EVIDENCE_STANDING.VERIFIED;
}

// ---------------------------------------------------------------------------
// Evidence record (links to EVIDENCE family entity)
// ---------------------------------------------------------------------------

export interface AptEvidence {
  id: string;
  /** Evidence type (claim, document, observation, measurement, etc.). */
  type: string;
  /** Maturity dimension. */
  maturity: Maturity;
  /** Evidence standing dimension. */
  standing: EvidenceStanding;
  /** What this evidence supports (subject entity id). */
  supportsSubjectId: string;
  /** Subject family. */
  supportsSubjectFamily?: Family;
  /** When the evidence was observed/created. */
  occurredAt: string;
  /** When the evidence was recorded. */
  recordedAt: string;
  /** Who recorded the evidence. */
  recordedBy: string;
  /** Verification actor (if verified). */
  verifiedBy?: string;
  /** When verified (if verified). */
  verifiedAt?: string;
  /** Access classification: public | participant | restricted (per roll.ts pattern). */
  accessLayer: 'public' | 'participant' | 'restricted';
  /** Hash anchor for integrity verification (optional). */
  hashAnchor?: string;
  /** Version. */
  version: number;
}

// ---------------------------------------------------------------------------
// Runtime guards
// ---------------------------------------------------------------------------

export function isMaturity(value: unknown): value is Maturity {
  return typeof value === 'string'
    && Object.values(MATURITY).includes(value as Maturity);
}

export function isEvidenceStanding(value: unknown): value is EvidenceStanding {
  return typeof value === 'string'
    && Object.values(EVIDENCE_STANDING).includes(value as EvidenceStanding);
}

export function isEvidenceDimension(value: unknown): value is EvidenceDimension {
  if (!value || typeof value !== 'object') return false;
  const d = value as Partial<EvidenceDimension>;
  return isMaturity(d.maturity) && isEvidenceStanding(d.standing);
}
