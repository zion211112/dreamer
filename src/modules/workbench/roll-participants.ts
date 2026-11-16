import type { Crew } from './data';

export interface RollParticipantInput {
  role: 'anchor' | 'builder' | 'apprentice' | 'coordinator';
  personId: string;
  personName: string;
  profileId: string | null;
  capabilityClaims: string[];
  evidenceIds: string[];
}

const CREW_ROLES = [
  { role: 'anchor', name: 'anchor', personId: 'anchorPersonId' },
  { role: 'builder', name: 'builder', personId: 'builderPersonId' },
  { role: 'apprentice', name: 'apprentice', personId: 'apprenticePersonId' },
  { role: 'coordinator', name: 'coordinator', personId: 'coordinatorPersonId' },
] as const;

export function crewToRollParticipants(crew: Crew): RollParticipantInput[] {
  const participants: RollParticipantInput[] = [];

  for (const { role, name, personId: personIdField } of CREW_ROLES) {
    const personName = crew[name];
    if (!personName || personName === '—') continue;

    const personId = crew[personIdField];
    if (!personId) {
      throw new Error(`The ${role} crew member is missing a Network entity ID.`);
    }

    participants.push({
      role,
      personId,
      personName,
      profileId: null,
      capabilityClaims: [],
      evidenceIds: [],
    });
  }

  return participants;
}
