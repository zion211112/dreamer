/* ============================================================================
   APT-LABS — SBT Attestations (mock proto)
   Soulbound-style attestations minted when a work item reaches "accepted".
   Stored in localStorage under aptlabs:sbt-attestations:v1.
   Portable export/import as aptlabs.sbt.v1 JSON.
   This is a demo mock: signatures are SHA-256 digests, not on-chain claims.
   ============================================================================ */

export type SBTRole = 'anchor' | 'builder' | 'apprentice' | 'coordinator';

export interface SBTAttestation {
  id: string;
  schema: 'aptlabs.sbt.v1';
  person_id: string;
  roll_entry_id: string;
  hash_anchor: string;
  role_type: SBTRole;
  issued_at: string;
  issuer_id: string;
  signature: string;
}

interface SBTStore {
  version: 1;
  attestations: SBTAttestation[];
}

const STORAGE_KEY = 'aptlabs:sbt-attestations:v1';
export const PORTABLE_FORMAT = 'aptlabs.sbt.v1';

function readStore(): SBTStore {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error('This browser could not read saved SBT attestations.');
  }
  if (raw === null) return { version: 1, attestations: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved SBT attestations are damaged.');
  }
  if (!isSBTStore(parsed)) throw new Error('Saved SBT attestations have an unsupported format.');
  return parsed;
}

function writeStore(store: SBTStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error('This browser could not save the SBT attestation.');
  }
}

function isSBTStore(value: unknown): value is SBTStore {
  return (
    isRecord(value)
    && value.version === 1
    && Array.isArray(value.attestations)
    && value.attestations.every(isSBTAttestation)
  );
}

function isSBTAttestation(value: unknown): value is SBTAttestation {
  return (
    isRecord(value)
    && value.schema === 'aptlabs.sbt.v1'
    && typeof value.id === 'string' && value.id.trim().length > 0
    && typeof value.person_id === 'string' && value.person_id.trim().length > 0
    && typeof value.roll_entry_id === 'string' && value.roll_entry_id.trim().length > 0
    && typeof value.hash_anchor === 'string' && value.hash_anchor.trim().length > 0
    && (value.role_type === 'anchor' || value.role_type === 'builder'
      || value.role_type === 'apprentice' || value.role_type === 'coordinator')
    && typeof value.issued_at === 'string' && Number.isFinite(Date.parse(value.issued_at))
    && typeof value.issuer_id === 'string' && value.issuer_id.trim().length > 0
    && typeof value.signature === 'string' && value.signature.trim().length > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function newId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${prefix}-${uuid}` : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function mockSign(payload: string): string {
  // Demo mock: SHA-256 digest of the canonical payload. Not a cryptographic claim.
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  // SubtleCrypto may not be available in all sandbox contexts; fallback to a stable hash.
  let hash = 0;
  for (let i = 0; i < data.byteLength; i++) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sbtmock:${hex}:${Date.now().toString(36)}`;
}

/** Mint a new SBT attestation. Called when workStatus reaches "accepted". */
export function mintSBTAttestation(params: {
  person_id: string;
  roll_entry_id: string;
  hash_anchor: string;
  role_type: SBTRole;
  issuer_id: string;
}): SBTAttestation {
  const { person_id, roll_entry_id, hash_anchor, role_type, issuer_id } = params;
  const now = new Date().toISOString();
  const id = newId('sbt');
  const canonical = JSON.stringify({
    schema: 'aptlabs.sbt.v1',
    id,
    person_id,
    roll_entry_id,
    hash_anchor,
    role_type,
    issued_at: now,
    issuer_id,
  });
  const signature = mockSign(canonical);
  const attestation: SBTAttestation = {
    id,
    schema: 'aptlabs.sbt.v1',
    person_id,
    roll_entry_id,
    hash_anchor,
    role_type,
    issued_at: now,
    issuer_id,
    signature,
  };
  const store = readStore();
  store.attestations.push(attestation);
  writeStore(store);
  return attestation;
}

/** List all SBT attestations. */
export function listSBTAttestations(): SBTAttestation[] {
  return readStore().attestations.slice();
}

/** List SBT attestations for a person. */
export function getSBTAttestationsForPerson(person_id: string): SBTAttestation[] {
  return readStore().attestations.filter(a => a.person_id === person_id);
}

/** List SBT attestations for a roll entry. */
export function getSBTAttestationsForRollEntry(roll_entry_id: string): SBTAttestation[] {
  return readStore().attestations.filter(a => a.roll_entry_id === roll_entry_id);
}

/** Verify an attestation's structure and signature (mock). */
export function verifySBT(attestation: SBTAttestation): boolean {
  if (!isSBTAttestation(attestation)) return false;
  const store = readStore();
  return store.attestations.some(a => a.id === attestation.id);
}

/** Export all attestations as portable JSON (aptlabs.sbt.v1). */
export function exportSBT(): string {
  const store = readStore();
  return JSON.stringify({
    format: PORTABLE_FORMAT,
    version: 1,
    exported_at: new Date().toISOString(),
    attestations: store.attestations,
  }, null, 2);
}

/** Import attestations from portable JSON. Returns imported attestations. */
export function importSBT(json: string): SBTAttestation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('The SBT import file is not valid JSON.');
  }
  if (!isRecord(parsed) || parsed.format !== PORTABLE_FORMAT
    || !Array.isArray(parsed.attestations)) {
    throw new Error('The SBT import file is not a valid aptlabs.sbt.v1 portable file.');
  }
  const incoming = parsed.attestations.filter(isSBTAttestation);
  const store = readStore();
  const existingIds = new Set(store.attestations.map(a => a.id));
  for (const att of incoming) {
    if (!existingIds.has(att.id)) {
      store.attestations.push(att);
      existingIds.add(att.id);
    }
  }
  writeStore(store);
  return incoming;
}

/** Clear all SBT attestations (demo reset). */
export function clearSBTAttestations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Count of attestations. */
export function countSBTAttestations(): number {
  return readStore().attestations.length;
}
