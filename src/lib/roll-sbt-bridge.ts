/* ============================================================================
   APT-LABS — Roll → SBT bridge (mock proto)
   Wires the end-to-end operating core:
     Workbench simulation acceptance → Roll entry → SBT attestation
   When a simulation completes with a roll preview, a Roll entry is created
   (demo mode: localStorage) and SBT attestations are minted for each
   simulated role. Local workbench acceptance also mints SBT attestations.
   ============================================================================ */

import { createRollEntry, getRollEntry, type RollEntry } from './db/roll';
import { mintSBTAttestation, type SBTRole } from './sbt-attestations';
import { type WorkbenchSimulation } from './workbench-simulation';
import { readLocalWorkbench } from './local-workbench';

const DEMO_USER_ID = 'aptlabs-demo-user';

function roleFromSimulatedRole(role: string): SBTRole | null {
  const normalized = role.trim().toLocaleLowerCase();
  if (normalized.includes('anchor')) return 'anchor';
  if (normalized.includes('builder')) return 'builder';
  if (normalized.includes('apprentice')) return 'apprentice';
  if (normalized.includes('coordinator')) return 'coordinator';
  return null;
}

/** Person id for a simulated role, derived deterministically from the simulation. */
function personIdForRole(simulationId: string, role: string): string {
  const suffix = simulationId.slice(-6);
  return `person-sim-${role}-${suffix}`;
}

/** Institution id from the simulation context, or a demo fallback. */
function institutionFor(simulation: WorkbenchSimulation): {
  institutionId: string;
  institutionName: string;
  coordinatorId: string;
} {
  const id = simulation.source.institutionId;
  if (id) return {
    institutionId: id,
    institutionName: `Institution · ${id}`,
    coordinatorId: `person-coord-${id.slice(-6)}`,
  };
  return {
    institutionId: 'inst-demo-commons',
    institutionName: 'APT-LABS Commons (demo)',
    coordinatorId: 'person-coord-demo',
  };
}

/** Create a Roll entry from a completed simulation with roll preview. */
export async function createRollFromSimulation(
  simulation: WorkbenchSimulation,
): Promise<{ entry: RollEntry; sbtAttestations: import('./sbt-attestations').SBTAttestation[] }> {
  const preview = simulation.rollPreview;
  if (!preview) throw new Error('No roll preview on this simulation.');

  const { institutionId, institutionName, coordinatorId } = institutionFor(simulation);
  const undertakingType = simulation.plan.workKind === 'physical-asset' ? 'physical' : 'digital';

  const participants = preview.simulatedRoles.map((role) => {
    const roleType = roleFromSimulatedRole(role) || 'builder';
    return {
      role_type: roleType,
      person_id: personIdForRole(simulation.id, role),
      profile_id: null,
      name: role,
      capability_claims: [role],
      evidence_ids: preview.evidence.slice(),
    };
  });

  // Ensure at least a coordinator exists for acceptance
  if (!participants.some(p => p.role_type === 'coordinator')) {
    participants.unshift({
      role_type: 'coordinator',
      person_id: personIdForRole(simulation.id, 'Coordinator'),
      profile_id: null,
      name: 'Coordinator',
      capability_claims: ['coordination'],
      evidence_ids: [],
    });
  }

  const entry = await createRollEntry({
    undertaking_id: `undertaking-${simulation.id.slice(-8)}`,
    undertaking_type: undertakingType,
    title: preview.assetName,
    scope: simulation.plan.scope,
    deliverables: preview.evidence.length > 0 ? preview.evidence : simulation.plan.packages.map(p => p.title).filter(Boolean),
    reusable_designs: null,
    commissioned_by: {
      institution_id: institutionId,
      name: institutionName,
      coordinator_id: coordinatorId,
    },
    participants,
    evidence: preview.evidence.map((title, index) => ({
      id: `ev-${simulation.id.slice(-4)}-${index}`,
      layer: 'public' as const,
      title,
      file_url: null,
      description: `Evidence recorded during ${simulation.source.assetName} simulation.`,
    })),
    acceptance: {
      accepted_by: coordinatorId,
      accepted_at: new Date().toISOString(),
      inspection_report_id: null,
      cost_disclosed: simulation.plan.costAssumptions
        ? { amount: Number(simulation.plan.costAssumptions.amount), currency: simulation.plan.costAssumptions.currency }
        : null,
    },
    maintenance_obligations: null,
    recorded_by: DEMO_USER_ID,
  }, DEMO_USER_ID);

  // Mint SBT attestations for each participant
  const sbtAttestations: import('./sbt-attestations').SBTAttestation[] = [];
  for (const participant of participants) {
    const att = mintSBTAttestation({
      person_id: participant.person_id,
      roll_entry_id: entry.id,
      hash_anchor: entry.hash_anchor,
      role_type: participant.role_type,
      issuer_id: DEMO_USER_ID,
    });
    sbtAttestations.push(att);
  }

  return { entry, sbtAttestations };
}

/** Mint SBT attestations for a locally accepted work application.
 *
 * When `rollEntryId`/`hashAnchor` are not supplied, a Roll entry is created
 * from the accepted local application first, then SBT attestations are minted.
 * Returns the created Roll entry and SBT attestation, or null if the
 * application is not in an accepted state.
 */
export async function mintSBTForAcceptedLocalWork({
  applicationId,
  applicant,
  rollEntryId,
  hashAnchor,
  roleType = 'builder',
}: {
  applicationId: string;
  applicant: string;
  rollEntryId?: string;
  hashAnchor?: string;
  roleType?: SBTRole;
}): Promise<{ entry: RollEntry; sbtAttestation: import('./sbt-attestations').SBTAttestation } | null> {
  const record = readLocalWorkbench();
  const application = record.applications.find(a => a.id === applicationId && a.applicant === applicant);
  if (!application || application.workStatus !== 'accepted') return null;

  let entry: RollEntry;
  if (rollEntryId && hashAnchor) {
    const existing = await getRollEntry(rollEntryId);
    if (!existing) return null;
    entry = existing;
  } else {
    entry = await createRollEntry({
      undertaking_id: `undertaking-local-${applicationId.slice(-8)}`,
      undertaking_type: 'physical',
      title: `Local work · ${application.opportunityId}`,
      scope: application.note,
      deliverables: [application.deliveryEvidence].filter(Boolean),
      reusable_designs: null,
      commissioned_by: {
        institution_id: 'inst-demo-commons',
        name: 'APT-LABS Commons (demo)',
        coordinator_id: 'person-coord-demo',
      },
      participants: [{
        role_type: roleType,
        person_id: `person-local-${applicant.replace(/\s+/g, '-').toLocaleLowerCase()}-${applicationId.slice(-6)}`,
        profile_id: null,
        name: applicant,
        capability_claims: [application.opportunityId],
        evidence_ids: application.deliveryEvidence ? [application.deliveryEvidence] : [],
      }],
      evidence: application.deliveryEvidence ? [{
        id: `ev-local-${applicationId.slice(-6)}`,
        layer: 'public',
        title: application.deliveryEvidence,
        file_url: null,
        description: `Delivery evidence for local application ${applicationId}.`,
      }] : [],
      acceptance: {
        accepted_by: applicant,
        accepted_at: new Date().toISOString(),
        inspection_report_id: null,
        cost_disclosed: null,
      },
      maintenance_obligations: null,
      recorded_by: DEMO_USER_ID,
    }, DEMO_USER_ID);
  }

  const att = mintSBTAttestation({
    person_id: `person-local-${applicant.replace(/\s+/g, '-').toLocaleLowerCase()}-${applicationId.slice(-6)}`,
    roll_entry_id: entry.id,
    hash_anchor: entry.hash_anchor,
    role_type: roleType,
    issuer_id: DEMO_USER_ID,
  });

  return { entry, sbtAttestation: att };
}
