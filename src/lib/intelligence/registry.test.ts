import { describe, expect, it } from 'vitest';
import { createIntelligenceRegistry } from './registry';
import type { Attestation, Finding, Transition } from './types';

const now = '2026-11-10T00:00:00Z';

function makeAttestation(overrides: Partial<Attestation> = {}): Attestation {
  return {
    id: 'att-1',
    subject: 'sub-1',
    issuer: 'issuer-1',
    claim: 'Completed pump overhaul',
    scope: 'Mwea Water Cooperative',
    evidence: ['ev-1'],
    issuedAt: now,
    status: 'active',
    consent: true,
    portable: true,
    ...overrides,
  };
}

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: 'find-1',
    subject: 'crew-1',
    scope: 'canal lining readiness',
    evidenceBase: ['att-1'],
    assessment: 'Ready to proceed',
    limitations: ['No settlement history yet'],
    authorizedDecisionMaker: 'cooperative council',
    status: 'issued',
    issuedAt: now,
    undertaking: 'uw-1',
    ...overrides,
  };

}

function makeTransition(overrides: Partial<Transition> = {}): Transition {
  return {
    kind: 'contribution-to-attestation',
    undertaking: 'uw-1',
    rule: 'Issuer attests a bounded, consent-based claim.',
    authorizedBy: 'issuer-1',
    effectedAt: now,
    ...overrides,
  };
}

describe('Intelligence registry', () => {
  it('registers and retrieves attestations scoped to an undertaking', () => {
    const reg = createIntelligenceRegistry();
    reg.registerAttestation(makeAttestation({ undertaking: 'uw-1' }));
    reg.registerAttestation(makeAttestation({ id: 'att-2', undertaking: 'uw-2' }));

    expect(reg.attestations).toHaveLength(2);
    expect(reg.forUndertaking('uw-1').attestations).toHaveLength(1);
    expect(reg.forUndertaking('uw-2').attestations).toHaveLength(1);
  });

  it('groups findings, instruments, contributions, and transitions by undertaking', () => {
    const reg = createIntelligenceRegistry();
    reg.registerFinding(makeFinding());
    reg.registerTransition(makeTransition({ kind: 'identity-to-contribution' }));

    const grouped = reg.forUndertaking('uw-1');
    expect(grouped.findings).toHaveLength(1);
    expect(grouped.transitions).toHaveLength(1);
    expect(grouped.contributions).toHaveLength(0);
    expect(grouped.instruments).toHaveLength(0);
  });

  it('returns empty arrays for an unknown undertaking', () => {
    const reg = createIntelligenceRegistry();
    const grouped = reg.forUndertaking('no-such-undertaking');

    expect(grouped.attestations).toEqual([]);
    expect(grouped.findings).toEqual([]);
    expect(grouped.transitions).toEqual([]);
  });
});
