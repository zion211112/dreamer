/**
 * Passport — evidence-backed capability representation for an actor.
 *
 * Position: Passport is not a universal score or credit rating. It distinguishes
 * four claims that are commonly conflated:
 *   1. Claimed qualification — what the actor says they can do.
 *   2. Qualified — verified by an identified issuer.
 *   3. Work completed — undertakings performed in a given capacity.
 *   4. Outcome accepted — evidence that delivery was accepted and recorded.
 *
 * A claim is not evidence. Evidence is not acceptance. Acceptance is not
 * universal competence.
 *
 * Primary home: Network. Assembled view draws from Network entities and Roll
 * attestations. Portable: an actor can present a selectively disclosed set of
 * credentials outside APT-LABS.
 */

import type { SbtAttestation } from './sbt-attestations';
import { listSbtAttestationsForPerson } from './sbt-attestations';
import { ENTITY_BY_ID } from './people-network';
import { queryRollEntries } from './db/roll';

export type CapabilityLevel = 'claimed' | 'qualified' | 'demonstrated' | 'accepted';

export interface CapabilityClaim {
  capability: string;
  level: CapabilityLevel;
  basis: 'self-reported' | 'issuer-verified' | 'undertaking-completed' | 'outcome-accepted';
  sourceId: string; // entity id, attestation id, or roll entry id
  note: string;
}

export interface PassportView {
  entityId: string;
  name: string;
  type: string;
  role: string;
  location: string | undefined;
  recordBasis: string | undefined;
  capabilities: CapabilityClaim[];
  attestations: SbtAttestation[];
  undertakings: Array<{
    undertakingId: string;
    title: string;
    type: string;
    acceptedBy: string;
    acceptedAt: string | null;
    outcome: 'accepted' | 'partial' | 'disputed' | 'cancelled' | 'unresolved' | 'proposed' | 'not-recorded';
  }>;
}

export async function buildPassport(entityId: string): Promise<PassportView | undefined> {
  const entity = ENTITY_BY_ID.get(entityId);
  if (!entity) return undefined;

  const attestations = listSbtAttestationsForPerson(entityId);
  const attestedCapabilities = new Set<string>();
  for (const attestation of attestations) {
    for (const claim of attestation.capabilityClaims) {
      attestedCapabilities.add(claim);
    }
  }

  // Roll-based undertakings for this person, to separate acceptance from mere demonstration.
  let undertakings: PassportView['undertakings'] = [];
  try {
    const entries = await queryRollEntries();
    undertakings = entries
      .filter((e) => e.participants.some((p) => p.person_id === entityId))
      .map((e) => {
        return {
          undertakingId: e.undertaking_id,
          title: e.title,
          type: e.undertaking_type,
          acceptedBy: e.acceptance.accepted_by,
          acceptedAt: e.acceptance.accepted_at,
          outcome: (e.acceptance.accepted_by ? 'accepted' : 'not-recorded') as PassportView['undertakings'][number]['outcome'],
        };
      });
  } catch {
    undertakings = [];
  }

  const acceptedUndertakingIds = new Set(undertakings.map((u) => u.undertakingId));

  const capabilities: CapabilityClaim[] = [];
  for (const capability of entity.capabilities) {
    let level: CapabilityLevel = 'claimed';
    let basis: CapabilityClaim['basis'] = 'self-reported';
    let sourceId = entityId;
    let note = 'Self-reported capability from Network record.';

    if (attestedCapabilities.has(capability)) {
      level = 'qualified';
      basis = 'issuer-verified';
      note = 'Capability backed by an SBT attestation issued after a Roll entry.';
    }
    if (acceptedUndertakingIds.size > 0) {
      level = 'accepted';
      basis = 'outcome-accepted';
      note = 'Capability demonstrated in an accepted undertaking recorded to the Roll.';
    }

    capabilities.push({ capability, level, basis, sourceId, note });
  }

  return {
    entityId,
    name: entity.name,
    type: entity.type,
    role: entity.role,
    location: entity.location,
    recordBasis: entity.recordBasis,
    capabilities,
    attestations,
    undertakings,
  };
}

export async function exportPassport(entityId: string): Promise<string | undefined> {
  const passport = await buildPassport(entityId);
  if (!passport) return undefined;
  return JSON.stringify({
    format: 'aptlabs.passport.v1',
    anchor: 'APT-LABS',
    exportedAt: new Date().toISOString(),
    ...passport,
  }, null, 2);
}