/**
 * P3 evidence — the coordination chain, end-to-end, framework-free.
 *
 * Proves the one operational chain the strategy hinges on:
 *   INTENTION (need) → COMMITMENT (provider accepts) → OUTPUT_OUTCOME (evidence)
 * and that the composed read (`getJourney`) is a trustworthy, audited picture.
 */

import { describe, it, expect } from 'vitest';
import {
  createJourneyStore,
  postNeed,
  acceptCommitment,
  fulfilCommitment,
  getJourney,
} from '@apt-labs/domain';

describe('coordination chain', () => {
  it('runs the full journey and composes a trustworthy picture', () => {
    const store = createJourneyStore();

    const need = postNeed(store, {
      need: 'Coordinate a micro-hydro fabrication rig',
      actorId: 'actor-programme',
      postedBy: 'account-coordinator',
      requires: ['fabrication', 'site coordination'],
    });
    expect(need.data['status']).toBe('open');

    const commitment = acceptCommitment(store, {
      needId: need.id,
      providerActorId: 'actor-crew',
      acceptedBy: 'account-provider',
    });
    expect(commitment.data['status']).toBe('accepted');
    // the need advanced to committed
    expect(getJourney(store, need.id).need?.data['status']).toBe('committed');

    const outcome = fulfilCommitment(store, {
      commitmentId: commitment.id,
      outcome: 'Rig fabrication complete and safety-verified',
      evidenceIds: ['evd-01', 'evd-02'],
      fulfilledBy: 'account-provider',
    });
    expect(outcome.evidenceIds).toEqual(['evd-01', 'evd-02']);

    const journey = getJourney(store, need.id);
    expect(journey.need?.data['status']).toBe('fulfilled');
    expect(journey.commitments).toHaveLength(1);
    expect(journey.outcomes).toHaveLength(1);
    expect(journey.relationships).toHaveLength(1); // the ANSWERS link
    // every step was audited
    const actions = journey.auditEvents.map((e) => e.action);
    expect(actions).toContain('intention.create');
    expect(actions).toContain('commitment.accept');
    expect(actions).toContain('commitment.fulfil');
    expect(actions).toContain('intention.update');
  });

  it('rejects fulfilling a commitment that does not exist', () => {
    const store = createJourneyStore();
    postNeed(store, { need: 'n', actorId: 'a', postedBy: 'p' });
    expect(() =>
      fulfilCommitment(store, { commitmentId: 'missing', outcome: 'x', fulfilledBy: 'p' }),
    ).toThrow();
  });
});
