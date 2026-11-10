/**
 * APT-LABS Intelligence — lean abstract ontology.
 *
 * Three independently governed pillars connected by one relationship:
 *
 *   Identity → Contribution → Attestation → Economic interaction
 *
 * Each transition has its own rules; none is automatic.
 *
 * This module is deliberately dependency-free: it imports nothing from
 * Workbench, Records, or the shell, so every other module (including the five
 * pilot lanes) can import it without coupling. It declares types only — no
 * balances, transfers, rewards, or operational coin behavior.
 */

// ---------------------------------------------------------------------------
// Pillar 1 — APT Passport: attestation (SBT-style)
// ---------------------------------------------------------------------------

export type AttestationStatus = 'active' | 'revoked' | 'expired' | 'disputed';

export interface Attestation {
  /** Stable identifier for the attestation record. */
  id: string;
  /** The participant the claim is about (their holder key / DID). */
  subject: string;
  /** Who issued / attested the claim. */
  issuer: string;
  /** The bounded claim being made. */
  claim: string;
  /** The bounded scope in which the claim holds. */
  scope: string;
  /** References to supporting evidence. */
  evidence: readonly string[];
  /** When the attestation was issued. */
  issuedAt: string;
  /** Current status. */
  status: AttestationStatus;
  /** The participant consented to this attestation being issued. */
  consent: boolean;
  /** Optional expiry. */
  expiresAt?: string;
  /** Reason for revocation, if revoked. */
  revocationReason?: string;
  /** The participant may present this outside APT-LABS (portable, not captive). */
  portable: boolean;
  /** Shared reference linking to the delivery / financial / contribution flows. */
  undertaking?: string;
}

/** A contribution event — reported or evidenced activity, role, scope, attribution basis. */
export interface Contribution {
  id: string;
  /** Person or crew. */
  actor: string;
  /** Contextual role, e.g. anchor / builder / apprentice. */
  role: string;
  /** What was contributed, bounded. */
  scope: string;
  /** Shared reference linking to the delivery / financial flows. */
  undertaking: string;
  /** Who reported it. */
  source: string;
  /** References to supporting evidence. */
  evidence: readonly string[];
  /** self-declared / attributed / independently supported. */
  attributionBasis: string;
  /** The actor consented to this contribution being recorded. */
  consent: boolean;
  /** When the contribution was recorded. */
  recordedAt: string;
}

// ---------------------------------------------------------------------------
// Pillar 2 — APT Coin: economic instrument / scenario
// ---------------------------------------------------------------------------

export type InstrumentLifecycle = 'proposed' | 'active' | 'suspended' | 'retired';

export interface EconomicInstrument {
  id: string;
  /** Narrow, defined function — purpose evidenced before activation. */
  purpose: string;
  issuer: string;
  terms: string;
  lifecycle: InstrumentLifecycle;
  /** Verified productive nodes that participate. */
  participants: readonly string[];
  settlementRules: string;
  /** Shared reference linking to the undertaking. */
  undertaking?: string;
  // Deliberately absent: balances, transfers, rewards, wages, coin-gated access.
}

// ---------------------------------------------------------------------------
// Pillar 3 — Intelligence Engine: finding / assessment
// ---------------------------------------------------------------------------

export type FindingStatus = 'draft' | 'issued' | 'withdrawn';

export interface Finding {
  id: string;
  /** The enterprise / crew / cooperative being assessed. */
  subject: string;
  scope: string;
  /** References to attestations, roll entries, obligations consulted. */
  evidenceBase: readonly string[];
  /** Structured, evidence-backed assessment of productive capacity and risk. */
  assessment: string;
  /** What this finding does NOT establish — limitations are explicit. */
  limitations: readonly string[];
  /** The authorized financing party who makes the capital deployment decision. */
  authorizedDecisionMaker: string;
  status: FindingStatus;
  issuedAt: string;
  /** Shared reference linking to the undertaking being assessed. */
  undertaking: string;
}

// ---------------------------------------------------------------------------
// The central relationship: four transitions, each with its own rules
// ---------------------------------------------------------------------------

export type TransitionKind =
  | 'identity-to-contribution'
  | 'contribution-to-attestation'
  | 'attestation-to-economic-interaction';

export interface Transition {
  kind: TransitionKind;
  /** The shared undertaking reference linking the three independent flows. */
  undertaking: string;
  /** The rule governing this transition — none is automatic. */
  rule: string;
  /** Actor authorized to effect the transition. */
  authorizedBy: string;
  effectedAt: string;
}
