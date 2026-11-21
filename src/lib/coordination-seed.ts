/**
 * APT-LABS — Seed the coordination system of record from the operational pilots.
 *
 * Coordination reads the same localStorage-backed lib records every other module
 * uses, so on a first visit it opens blank. This seeder turns the five seeded
 * Kenyan undertakings into a *real, matchable* coordination board — providers,
 * open needs, in-flight commitments, and evidence — by calling the genuine lib
 * writes (onboardActor, postNeed, acceptCommitment, fulfilCommitment,
 * registerEvidence, markEvidenceVerified). Nothing here is a mock array: every
 * record is auditable and every need actually matches against a provider.
 *
 * Guarded so it runs exactly once and never touches data a person created.
 */

import { OPERATIONAL_PILOTS } from './demo-seed';
import { listActors } from './actors';
import { getItem, setItem } from './storage';
import { onboardActor } from './onboarding-journey';
import { postNeed, acceptCommitment, fulfilCommitment } from './commitment-journey';
import { registerEvidence, markEvidenceVerified } from './evidence-store';

const MARKER = 'aptlabs:coordination-seeded:v1';
const DEMO_ACCOUNT = 'demo';
const DEMO_DEMAND = 'demand';

/** Capability category keyed to a participant's role, so matching is selective. */
function capType(role: string): string {
  switch (role) {
    case 'builder': return 'Fabrication';
    case 'anchor': return 'Coordination';
    case 'coordinator': return 'Facilitation';
    case 'apprentice': return 'Apprenticeship';
    default: return 'Skill';
  }
}

/**
 * Seed the coordination board when the record is empty.
 * @returns true when a seed was written, false when it already existed.
 */
export function seedCoordinationIfEmpty(): boolean {
  if (getItem(MARKER) === '1' || listActors().length > 0) {
    setItem(MARKER, '1');
    return false;
  }

  // 1 — Providers: every participant, typed by role so needs match selectively.
  const roleActor: Record<string, Record<string, string>> = {};
  for (const pilot of OPERATIONAL_PILOTS) {
    roleActor[pilot.id] = {};
    for (const pp of pilot.participants) {
      const profile = onboardActor({
        type: 'individual',
        name: `${pp.personName} · ${pilot.label}`,
        description: `${capType(pp.role)} — ${pilot.institution.name}`,
        ownerId: DEMO_ACCOUNT,
        createdBy: DEMO_ACCOUNT,
        capabilities: pp.capabilityClaims.map((claim) => ({ name: claim, type: capType(pp.role) })),
      });
      roleActor[pilot.id][pp.role] = profile.actor.id;
    }
  }

  const thiba = OPERATIONAL_PILOTS[2];
  const nyeri = OPERATIONAL_PILOTS[3];
  const embu = OPERATIONAL_PILOTS[4];

  // 2 — Needs: two answerable, one genuine gap (no provider offers 'FieldTrial').
  const n1 = postNeed({ need: 'Fabricate the Thiba micro-hydro rig', actorId: DEMO_DEMAND, postedBy: DEMO_ACCOUNT, requires: ['Fabrication'] });
  const n2 = postNeed({ need: 'Facilitate the Nyeri repair knowledge exchange', actorId: DEMO_DEMAND, postedBy: DEMO_ACCOUNT, requires: ['Facilitation'] });
  postNeed({ need: 'Run the Embu solar drying field trial', actorId: DEMO_DEMAND, postedBy: DEMO_ACCOUNT, requires: ['FieldTrial'] });

  // 3 — Commitments: answer the two matchable needs; leave the gap open.
  const c1 = acceptCommitment({ needId: n1.id, providerActorId: roleActor[thiba.id].builder, acceptedBy: DEMO_ACCOUNT });
  acceptCommitment({ needId: n2.id, providerActorId: roleActor[nyeri.id].coordinator, acceptedBy: DEMO_ACCOUNT });
  // Deliver one to show the loop end-to-end (Thiba rig fabricated + safety-checked).
  fulfilCommitment({ commitmentId: c1.id, outcome: 'Micro-hydro rig fabricated; installation and safety record attached', fulfilledBy: DEMO_ACCOUNT });

  // 4 — Evidence: register three across the layers, verify two.
  const e1 = registerEvidence({ type: 'Document', summary: `${thiba.label} — fabrication plan: rig dimensions and materials`, actorId: null, createdBy: DEMO_ACCOUNT });
  const e2 = registerEvidence({ type: 'Observation', summary: `${nyeri.label} — apprentice pairing log: mentor-apprentice assignments`, actorId: null, createdBy: DEMO_ACCOUNT });
  registerEvidence({ type: 'Attestation', summary: `${embu.label} — solar drying unit economics: cost per unit and throughput`, actorId: null, createdBy: DEMO_ACCOUNT });
  markEvidenceVerified(e1.id, DEMO_ACCOUNT);
  markEvidenceVerified(e2.id, DEMO_ACCOUNT);

  setItem(MARKER, '1');
  return true;
}
