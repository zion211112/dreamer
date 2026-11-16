import { describe, expect, it } from 'vitest';
import type { Crew } from './data';
import { crewToRollParticipants } from './roll-participants';

describe('crewToRollParticipants', () => {
  it('preserves selected Network entity IDs', () => {
    const crew: Crew = {
      anchor: 'Nia Wanjiru',
      anchorPersonId: 'person-nia',
      builder: 'Omar Ali',
      builderPersonId: 'person-omar',
    };

    expect(crewToRollParticipants(crew).map(({ role, personId, personName }) => ({
      role,
      personId,
      personName,
    }))).toEqual([
      { role: 'anchor', personId: 'person-nia', personName: 'Nia Wanjiru' },
      { role: 'builder', personId: 'person-omar', personName: 'Omar Ali' },
    ]);
  });

  it('throws when a named crew role has no Network entity ID', () => {
    expect(() => crewToRollParticipants({ builder: 'Omar Ali' })).toThrow(/builder.*Network/i);
  });

  it('omits empty and em-dash roles', () => {
    expect(crewToRollParticipants({ anchor: '', builder: '—', apprentice: undefined })).toEqual([]);
  });
});
