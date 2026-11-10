/**
 * Lean, in-memory registry for Intelligence ontology objects.
 *
 * Browser-local, illustrative, single source per pilot. Keyed by undertaking
 * so pilots can look up the attestations, instruments, and findings linked to
 * their work items. No persistence backend, no coin balances, no transfers.
 */

import {
  Attestation,
  Contribution,
  EconomicInstrument,
  Finding,
  Transition,
} from './types';

export interface IntelligenceRegistry {
  readonly attestations: readonly Attestation[];
  readonly contributions: readonly Contribution[];
  readonly instruments: readonly EconomicInstrument[];
  readonly findings: readonly Finding[];
  readonly transitions: readonly Transition[];

  registerAttestation(a: Attestation): void;
  registerContribution(c: Contribution): void;
  registerInstrument(i: EconomicInstrument): void;
  registerFinding(f: Finding): void;
  registerTransition(t: Transition): void;

  /** All ontology objects linked to a given undertaking (pilot lane). */
  forUndertaking(undertaking: string): {
    attestations: Attestation[];
    contributions: Contribution[];
    instruments: EconomicInstrument[];
    findings: Finding[];
    transitions: Transition[];
  };
}

export function createIntelligenceRegistry(): IntelligenceRegistry {
  const attestations: Attestation[] = [];
  const contributions: Contribution[] = [];
  const instruments: EconomicInstrument[] = [];
  const findings: Finding[] = [];
  const transitions: Transition[] = [];

  return {
    get attestations() {
      return attestations;
    },
    get contributions() {
      return contributions;
    },
    get instruments() {
      return instruments;
    },
    get findings() {
      return findings;
    },
    get transitions() {
      return transitions;
    },

    registerAttestation(a) {
      attestations.push(a);
    },
    registerContribution(c) {
      contributions.push(c);
    },
    registerInstrument(i) {
      instruments.push(i);
    },
    registerFinding(f) {
      findings.push(f);
    },
    registerTransition(t) {
      transitions.push(t);
    },

    forUndertaking(undertaking) {
      return {
        attestations: attestations.filter((a) => a.undertaking === undertaking),
        contributions: contributions.filter((c) => c.undertaking === undertaking),
        instruments: instruments.filter((i) => i.undertaking === undertaking),
        findings: findings.filter((f) => f.undertaking === undertaking),
        transitions: transitions.filter((t) => t.undertaking === undertaking),
      };
    },
  };
}
