import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { finalizeAcceptedLocalWork } from './roll-sbt-bridge';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('finalizeAcceptedLocalWork', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves the undertaking and selected Network identities in Roll and attestations', async () => {
    const { rollEntry, attestations } = await finalizeAcceptedLocalWork({
      application: {
        id: 'application-1',
        opportunityId: 'undertaking-1',
        applicant: 'person-nia',
        deliveryEvidence: 'Recorded at acceptance.',
        decisionNote: 'Accepted by the steward.',
      },
      undertaking: {
        id: 'undertaking-1',
        type: 'physical',
        title: 'Workshop repairs',
        scope: 'Repair the shared lathe.',
        deliverables: ['Lathe repaired'],
      },
      institution: {
        id: 'institution-workshop',
        name: 'Community Workshop',
        coordinatorId: 'person-coordinator',
      },
      participants: [{
        role: 'builder',
        personId: 'person-nia',
        personName: 'Nia Wanjiru',
        profileId: null,
        capabilityClaims: ['Machine repair'],
        evidenceIds: [],
      }],
      recordedBy: 'person-coordinator',
    });

    expect(rollEntry.undertaking_id).toBe('undertaking-1');
    expect(rollEntry.participants.map(({ person_id }) => person_id)).toEqual(['person-nia']);
    expect(attestations.map(({ undertakingId, personId }) => ({ undertakingId, personId })))
      .toEqual([{ undertakingId: 'undertaking-1', personId: 'person-nia' }]);
  });
});
