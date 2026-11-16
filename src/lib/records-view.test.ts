import { describe, expect, it } from 'vitest';
import type { RollEntry } from './db/roll';
import { getRollOutcome } from './records-view';

function entry(id: string, acceptedAt: string): Pick<RollEntry, 'id' | 'acceptance'> {
  return {
    id,
    acceptance: {
      accepted_by: 'coordinator-1',
      accepted_at: acceptedAt,
      inspection_report_id: null,
      cost_disclosed: null,
    },
  };
}

describe('getRollOutcome', () => {
  it('recognizes accepted entries even when the ID is new', () => {
    expect(getRollOutcome(entry('roll-new', '2026-11-16T10:00:00Z')))
      .toEqual({ label: 'accepted', kind: 'accepted' });
  });

  it('keeps entries without an acceptance timestamp unrecorded', () => {
    expect(getRollOutcome(entry('roll-new', '')))
      .toEqual({ label: 'Not recorded', kind: 'not-recorded' });
  });

  it('preserves explicit legacy outcome overrides', () => {
    expect(getRollOutcome(entry('roll-2026-10-20-01', '2026-11-16T10:00:00Z')))
      .toEqual({ label: 'proposed', kind: 'proposed' });
  });
});
