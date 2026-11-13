/**
 * SBT-style attestation library for APT-LABS.
 *
 * Position: attestation is closure, not foundation. An SBT is minted only
 * after a Roll entry exists for a completed undertaking. Stored in browser
 * localStorage (demo mode); portable as aptlabs.sbt.v1 JSON. Chain anchoring
 * (OP_RETURN/L2) is an optional, participant-opt-in layer on Roll density —
 * never a prerequisite for productive work.
 */

export type SbtRole = 'anchor' | 'builder' | 'apprentice' | 'coordinator';

export interface SbtAttestation {
  id: string;
  rollEntryId: string;
  undertakingId: string;
  undertakingTitle: string;
  undertakingType: string;
  role: SbtRole;
  personId: string;
  personName: string;
  issuedBy: string;
  issuedAt: string;
  hashAnchor: string;
  capabilityClaims: string[];
  evidenceIds: string[];
  status: 'active' | 'revoked' | 'expired';
  portable: boolean;
}

export interface SbtPortableExport {
  format: 'aptlabs.sbt.v1';
  anchor: 'APT-LABS';
  exportedAt: string;
  attestations: SbtAttestation[];
}

const STORAGE_KEY = 'aptlabs:sbt-attestations:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSbtRole(value: unknown): value is SbtRole {
  return ['anchor', 'builder', 'apprentice', 'coordinator'].includes(String(value));
}

function isSbtAttestation(value: unknown): value is SbtAttestation {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string'
    && typeof value.rollEntryId === 'string'
    && typeof value.undertakingId === 'string'
    && typeof value.undertakingTitle === 'string'
    && typeof value.undertakingType === 'string'
    && isSbtRole(value.role)
    && typeof value.personId === 'string'
    && typeof value.personName === 'string'
    && typeof value.issuedBy === 'string'
    && typeof value.issuedAt === 'string'
    && typeof value.hashAnchor === 'string'
    && Array.isArray(value.capabilityClaims)
    && value.capabilityClaims.every((c) => typeof c === 'string')
    && Array.isArray(value.evidenceIds)
    && value.evidenceIds.every((e) => typeof e === 'string')
    && ['active', 'revoked', 'expired'].includes(String(value.status))
    && typeof value.portable === 'boolean'
  );
}

function readSbtAttestations(): SbtAttestation[] {
  let serialized: string | null;
  try {
    serialized = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    throw new Error('SBT attestations are unreadable from this browser.', { cause: error });
  }
  if (serialized === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new Error('SBT attestations are unreadable: stored data is not valid JSON.', { cause: error });
  }
  if (!Array.isArray(parsed) || !parsed.every(isSbtAttestation)) {
    throw new Error('SBT attestations are unreadable: stored data does not match the attestation format.');
  }
  return parsed;
}

function writeSbtAttestations(attestations: SbtAttestation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attestations));
  } catch (error) {
    throw new Error('SBT attestations could not be saved in this browser.', { cause: error });
  }
}

/** Mint an SBT-style attestation for a participant in a completed Roll entry. */
export function mintSbtAttestation(input: {
  rollEntryId: string;
  undertakingId: string;
  undertakingTitle: string;
  undertakingType: string;
  role: SbtRole;
  personId: string;
  personName: string;
  issuedBy: string;
  hashAnchor: string;
  capabilityClaims: string[];
  evidenceIds: string[];
}): SbtAttestation {
  const now = new Date().toISOString();
  const attestation: SbtAttestation = {
    id: `sbt-${crypto.randomUUID()}`,
    rollEntryId: input.rollEntryId,
    undertakingId: input.undertakingId,
    undertakingTitle: input.undertakingTitle,
    undertakingType: input.undertakingType,
    role: input.role,
    personId: input.personId,
    personName: input.personName,
    issuedBy: input.issuedBy,
    issuedAt: now,
    hashAnchor: input.hashAnchor,
    capabilityClaims: [...input.capabilityClaims],
    evidenceIds: [...input.evidenceIds],
    status: 'active',
    portable: true,
  };
  const existing = readSbtAttestations();
  writeSbtAttestations([attestation, ...existing]);
  return attestation;
}

/** List all SBT attestations, newest first. */
export function listSbtAttestations(): SbtAttestation[] {
  return [...readSbtAttestations()].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

/** List attestations for a person. */
export function listSbtAttestationsForPerson(personId: string): SbtAttestation[] {
  return readSbtAttestations().filter((a) => a.personId === personId);
}

/** Verify an attestation by recomputing nothing (hash anchor already computed on Roll entry). */
export function verifySbtAttestation(id: string): { valid: boolean; attestation: SbtAttestation | null } {
  const attestation = readSbtAttestations().find((a) => a.id === id);
  if (!attestation) return { valid: false, attestation: null };
  return { valid: attestation.status === 'active', attestation };
}

/** Revoke an attestation (detectable, not prevented). */
export function revokeSbtAttestation(id: string): SbtAttestation {
  const attestations = readSbtAttestations();
  const index = attestations.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('This attestation is no longer available.');
  const updated = { ...attestations[index], status: 'revoked' as const };
  attestations[index] = updated;
  writeSbtAttestations(attestations);
  return updated;
}

/** Export all active attestations as portable aptlabs.sbt.v1 JSON. */
export function exportSbtPortable(): SbtPortableExport {
  return {
    format: 'aptlabs.sbt.v1',
    anchor: 'APT-LABS',
    exportedAt: new Date().toISOString(),
    attestations: readSbtAttestations().filter((a) => a.status === 'active'),
  };
}

/** Import portable attestations (deduplicated by id). */
export function importSbtPortable(exportData: unknown): { imported: number; total: number } {
  if (!isRecord(exportData) || exportData.format !== 'aptlabs.sbt.v1' || exportData.anchor !== 'APT-LABS') {
    throw new Error('Not a valid aptlabs.sbt.v1 portable attestation export.');
  }
  const incoming = Array.isArray(exportData.attestations) ? exportData.attestations : [];
  if (!incoming.every(isSbtAttestation)) {
    throw new Error('Portable attestation export contains invalid attestation records.');
  }
  const existing = readSbtAttestations();
  const existingIds = new Set(existing.map((a) => a.id));
  const added = incoming.filter((a) => !existingIds.has(a.id));
  writeSbtAttestations([...existing, ...added]);
  return { imported: added.length, total: readSbtAttestations().length };
}
