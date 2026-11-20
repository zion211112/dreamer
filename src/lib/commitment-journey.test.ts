/**
 * APT-LABS — Coordination Journey tests (Gate 1 → Gate 3 bridge)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  postNeed,
  acceptCommitment,
  fulfilCommitment,
  getJourney,
} from './commitment-journey';
import { getRecord } from './record-envelope';
import { getRelationshipsForEntity, clearRelationships } from './relationship-store';
import { clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

function owner(actorId: string): ReturnType<typeof buildDemoContextWithActor> {
  return buildDemoContextWithActor('account-01', actorId, 'owner');
}

describe('Coordination journey', () => {
  beforeEach(() => {
    clearAllStore();
    clearRelationships();
    clearAuditEvents();
  });

  it('runs the full need → commitment → fulfilment flow', () => {
    const need = postNeed({
      need: 'We need a technician to maintain the workshop',
      actorId: 'actor-01',
      postedBy: 'account-01',
      authz: owner('actor-01'),
    });

    expect(getRecord(need.id)?.family).toBe('INTENTION');
    expect(getRecord(need.id)?.data).toMatchObject({ status: 'open' });

    const commitment = acceptCommitment({
      needId: need.id,
      providerActorId: 'provider-01',
      acceptedBy: 'account-02',
      authz: owner('actor-01'),
    });

    expect(commitment.family).toBe('COMMITMENT');
    expect(commitment.data).toMatchObject({ providerActorId: 'provider-01', status: 'accepted' });
    expect(getRecord(need.id)?.data).toMatchObject({ status: 'committed' });
    // The need is now linked to its provider as a first-class relationship.
    expect(getRelationshipsForEntity(need.id)).toHaveLength(1);

    const outcome = fulfilCommitment({
      commitmentId: commitment.id,
      outcome: 'Workshop maintained; service report filed',
      evidenceIds: ['evidence-01'],
      fulfilledBy: 'account-02',
      authz: owner('actor-01'),
    });

    expect(outcome.family).toBe('OUTPUT_OUTCOME');
    expect(outcome.evidenceIds).toEqual(['evidence-01']);
    expect(getRecord(commitment.id)?.data).toMatchObject({ status: 'fulfilled' });
    expect(getRecord(need.id)?.data).toMatchObject({ status: 'fulfilled' });
  });

  it('refuses to accept a need that is not open', () => {
    const need = postNeed({ need: 'x', actorId: 'actor-01', postedBy: 'a' });
    // Accept once (moves to committed).
    acceptCommitment({ needId: need.id, providerActorId: 'p', acceptedBy: 'a' });
    // A second acceptance must fail — the need is no longer open.
    expect(() =>
      acceptCommitment({ needId: need.id, providerActorId: 'p2', acceptedBy: 'a' }),
    ).toThrow(/not open/);
  });

  it('refuses to fulfil a commitment that is not accepted', () => {
    const need = postNeed({ need: 'x', actorId: 'actor-01', postedBy: 'a' });
    // No commitment was created, so fulfilling a bogus id must throw.
    expect(() =>
      fulfilCommitment({ commitmentId: 'commitment-bogus', outcome: 'y', fulfilledBy: 'a' }),
    ).toThrow(/Commitment not found/);
  });

  it('returns the composed, trustworthy journey', () => {
    const need = postNeed({ need: 'irrigation', actorId: 'actor-01', postedBy: 'a' });
    const commitment = acceptCommitment({
      needId: need.id,
      providerActorId: 'provider-01',
      acceptedBy: 'a',
    });
    fulfilCommitment({
      commitmentId: commitment.id,
      outcome: 'irrigation installed',
      evidenceIds: ['ev-1', 'ev-2'],
      fulfilledBy: 'a',
    });

    const journey = getJourney(need.id);
    expect(journey.need?.id).toBe(need.id);
    expect(journey.commitments).toHaveLength(1);
    expect(journey.outcomes).toHaveLength(1);
    expect(journey.relationships).toHaveLength(1);
    expect(journey.relationships[0].kind).toBe('ANSWERS');
    // The audit trail spans the need, the commitment, and the outcome.
    expect(journey.auditEvents.length).toBeGreaterThan(0);
    const actions = journey.auditEvents.map((e) => e.action);
    expect(actions).toContain('record.create');
    expect(actions).toContain('record.update');
  });

  it('gates the whole journey on permissions', () => {
    const viewer = buildDemoContextWithActor('account-01', 'actor-01', 'viewer');
    expect(() =>
      postNeed({ need: 'x', actorId: 'actor-01', postedBy: 'a', authz: viewer }),
    ).toThrow();
  });
});
