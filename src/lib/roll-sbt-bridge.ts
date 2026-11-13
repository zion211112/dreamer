/**
 * Roll → SBT bridge for APT-LABS.
 *
 * Position: an SBT is minted only after a Roll entry exists for a completed
 * undertaking. This bridge exposes createRollFromSimulation() and
 * mintSBTForAcceptedLocalWork() so Workbench acceptance can close into a Roll
 * entry and then mint attestations for each participant role.
 */

import type { RollEntry, UndertakingType } from './db/roll';
import { createRollEntry, queryRollEntries, verifyRollEntry } from './db/roll';
import type { SbtRole, SbtAttestation } from './sbt-attestations';
import { mintSbtAttestation, listSbtAttestations } from './sbt-attestations';

export interface RollFromSimulationInput {
  undertakingId: string;
  undertakingType: UndertakingType;
  title: string;
  scope: string;
  deliverables: string[];
  commissionedBy: {
    institutionId: string;
    name: string;
    coordinatorId: string;
  };
  participants: Array<{
    role: SbtRole;
    personId: string;
    personName: string;
    profileId: string | null;
    capabilityClaims: string[];
    evidenceIds: string[];
  }>;
  acceptance: {
    acceptedBy: string;
    acceptedAt: string;
    inspectionReportId: string | null;
    costDisclosed: { amount: number; currency: string } | null;
  };
  recordedBy: string;
  reusableDesigns?: Record<string, unknown> | null;
  maintenanceObligations?: Record<string, unknown> | null;
}

export interface RollAndAttestations {
  rollEntry: RollEntry;
  attestations: SbtAttestation[];
}

/** Create a Roll entry from a completed simulation / accepted local work. */
export async function createRollFromSimulation(
  input: RollFromSimulationInput
): Promise<RollEntry> {
  return createRollEntry(
    {
      undertaking_id: input.undertakingId,
      undertaking_type: input.undertakingType,
      title: input.title,
      scope: input.scope,
      deliverables: input.deliverables,
      reusable_designs: input.reusableDesigns ?? null,
      commissioned_by: {
        institution_id: input.commissionedBy.institutionId,
        name: input.commissionedBy.name,
        coordinator_id: input.commissionedBy.coordinatorId,
      },
      participants: input.participants.map((p) => ({
        role_type: p.role,
        person_id: p.personId,
        profile_id: p.profileId,
        name: p.personName,
        capability_claims: p.capabilityClaims,
        evidence_ids: p.evidenceIds,
      })),
      evidence: [], // populated later as evidence files are added
      acceptance: {
        accepted_by: input.acceptance.acceptedBy,
        accepted_at: input.acceptance.acceptedAt,
        inspection_report_id: input.acceptance.inspectionReportId,
        cost_disclosed: input.acceptance.costDisclosed,
      },
      maintenance_obligations: input.maintenanceObligations ?? null,
      recorded_by: input.recordedBy,
    },
    input.recordedBy
  );
}

/** Mint SBT attestations for every participant role on a Roll entry. */
export async function mintSBTForAcceptedLocalWork(
  rollEntry: RollEntry,
  issuedBy: string
): Promise<SbtAttestation[]> {
  const attestations: SbtAttestation[] = [];
  for (const participant of rollEntry.participants) {
    const attestation = mintSbtAttestation({
      rollEntryId: rollEntry.id,
      undertakingId: rollEntry.undertaking_id,
      undertakingTitle: rollEntry.title,
      undertakingType: rollEntry.undertaking_type,
      role: participant.role_type as SbtRole,
      personId: participant.person_id,
      personName: participant.name,
      issuedBy,
      hashAnchor: rollEntry.hash_anchor,
      capabilityClaims: participant.capability_claims,
      evidenceIds: participant.evidence_ids,
    });
    attestations.push(attestation);
  }
  return attestations;
}

/** List Roll entries (demo mode merges seed fixtures + written entries). */
export async function listRolls(): Promise<RollEntry[]> {
  return queryRollEntries();
}

/** Verify a Roll entry's hash anchor. */
export async function verifyRoll(hash: string): Promise<{
  valid: boolean;
  computedHash: string;
  storedHash: string;
}> {
  const entry = (await queryRollEntries()).find((e) => e.hash_anchor === hash);
  if (!entry) {
    return { valid: false, computedHash: '', storedHash: hash };
  }
  const result = await verifyRollEntry(entry);
  return {
    valid: result.valid,
    computedHash: result.computedHash,
    storedHash: result.storedHash,
  };
}

/** List SBT attestations newest first. */
export async function listAttestations(): Promise<SbtAttestation[]> {
  return listSbtAttestations();
}

/**
 * Close an accepted local work undertaking into a Roll entry and mint SBT
 * attestations for every participant role. This is the acceptance gate:
 * no Roll entry without acceptance; no SBT without a Roll entry.
 */
export interface FinalizeAcceptedLocalWorkInput {
  application: {
    id: string;
    opportunityId: string;
    applicant: string;
    deliveryEvidence: string;
    decisionNote: string;
  };
  undertaking: {
    id: string;
    type: UndertakingType;
    title: string;
    scope: string;
    deliverables: string[];
  };
  institution: {
    id: string;
    name: string;
    coordinatorId: string;
  };
  participants: Array<{
    role: SbtRole;
    personId: string;
    personName: string;
    profileId: string | null;
    capabilityClaims: string[];
    evidenceIds: string[];
  }>;
  recordedBy: string;
  reusableDesigns?: Record<string, unknown> | null;
  maintenanceObligations?: Record<string, unknown> | null;
}

export async function finalizeAcceptedLocalWork(
  input: FinalizeAcceptedLocalWorkInput
): Promise<RollAndAttestations> {
  const rollEntry = await createRollEntry(
    {
      undertaking_id: input.undertaking.id,
      undertaking_type: input.undertaking.type,
      title: input.undertaking.title,
      scope: input.undertaking.scope,
      deliverables: input.undertaking.deliverables,
      reusable_designs: input.reusableDesigns ?? null,
      commissioned_by: {
        institution_id: input.institution.id,
        name: input.institution.name,
        coordinator_id: input.institution.coordinatorId,
      },
      participants: input.participants.map((p) => ({
        role_type: p.role,
        person_id: p.personId,
        profile_id: p.profileId,
        name: p.personName,
        capability_claims: p.capabilityClaims,
        evidence_ids: p.evidenceIds,
      })),
      evidence: [],
      acceptance: {
        accepted_by: input.institution.coordinatorId,
        accepted_at: new Date().toISOString(),
        inspection_report_id: null,
        cost_disclosed: null,
      },
      maintenance_obligations: input.maintenanceObligations ?? null,
      recorded_by: input.recordedBy,
    },
    input.recordedBy
  );

  const attestations = await mintSBTForAcceptedLocalWork(rollEntry, input.recordedBy);

  return { rollEntry, attestations };
}
