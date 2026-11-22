/**
 * APT-LABS — SBT-style attestation generator.
 *
 * Lightweight verifiable credential: issuer, subject, claims, evidence, expiry,
 * revocation. Off-chain personal data. Optional blockchain anchoring later.
 * Never places sensitive personal information on a public blockchain (charter A8).
 */

import { createRecord, getRecord, listRecords, updateRecord, type RecordEnvelope } from './record-envelope';
import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';

export type AttestationStatus = 'active' | 'revoked' | 'expired';

export interface SbtAttestationData {
  subjectId: string;
  subjectName: string;
  subjectRole: string;
  undertakingId: string;
  undertakingTitle: string;
  undertakingType: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string | null;
  status: AttestationStatus;
  revokedAt: string | null;
  revokedBy: string | null;
  revocationReason: string | null;
  claims: string[];
  evidenceIds: string[];
  hashAnchor: string | null;
}

export interface MintAttestationInput {
  subjectId: string;
  subjectName: string;
  subjectRole: string;
  undertakingId: string;
  undertakingTitle: string;
  undertakingType: string;
  claims: string[];
  evidenceIds: string[];
  hashAnchor: string | null;
  issuedBy: string;
  authz?: AuthzContext;
}

export interface RevokeAttestationInput {
  attestationId: string;
  revokedBy: string;
  reason: string;
  authz?: AuthzContext;
}

function attestationData(rec: RecordEnvelope): SbtAttestationData {
  return rec.data as unknown as SbtAttestationData;
}

/**
 * Mint an SBT-style attestation. Gated by `credential:issue`.
 */
export function mintAttestation(input: MintAttestationInput): RecordEnvelope {
  if (input.authz) {
    requirePermission(input.authz, 'credential:issue');
  }

  const now = new Date().toISOString();
  const record = createRecord({
    family: 'KNOWLEDGE',
    type: 'SBTAttestation',
    data: {
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      subjectRole: input.subjectRole,
      undertakingId: input.undertakingId,
      undertakingTitle: input.undertakingTitle,
      undertakingType: input.undertakingType,
      issuedBy: input.issuedBy,
      issuedAt: now,
      expiresAt: null,
      status: 'active' as AttestationStatus,
      revokedAt: null,
      revokedBy: null,
      revocationReason: null,
      claims: input.claims,
      evidenceIds: input.evidenceIds,
      hashAnchor: input.hashAnchor,
    },
    actorId: null,
    createdBy: input.issuedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.issuedBy,
    actorId: null,
    action: 'credential.issue',
    resourceType: 'knowledge',
    resourceId: record.id,
    details: { subjectId: input.subjectId, undertakingId: input.undertakingId },
  });

  return record;
}

/**
 * Revoke an attestation. Gated by `credential:revoke`.
 */
export function revokeAttestation(input: RevokeAttestationInput): RecordEnvelope | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:revoke');
  }

  const record = getRecord(input.attestationId);
  if (!record) throw new Error(`Attestation not found: ${input.attestationId}`);
  if (attestationData(record).status !== 'active') {
    throw new Error(`Attestation ${input.attestationId} is not active`);
  }

  const now = new Date().toISOString();
  const updated = updateRecord(input.attestationId, {
    data: {
      ...attestationData(record),
      status: 'revoked' as AttestationStatus,
      revokedAt: now,
      revokedBy: input.revokedBy,
      revocationReason: input.reason,
    },
    updatedBy: input.revokedBy,
    authz: input.authz,
  });

  logAuditEvent({
    accountId: input.revokedBy,
    actorId: null,
    action: 'credential.revoke',
    resourceType: 'knowledge',
    resourceId: record.id,
    details: { reason: input.reason },
  });

  return updated;
}

/**
 * Verify an attestation: returns it if active and not expired.
 */
export function verifyAttestation(id: string): RecordEnvelope | undefined {
  const record = getRecord(id);
  if (!record) return undefined;
  const d = attestationData(record);
  if (d.status !== 'active') return undefined;
  if (d.expiresAt && new Date(d.expiresAt) < new Date()) return undefined;
  return record;
}

/**
 * List all attestations for a subject.
 */
export function listAttestations(subjectId: string): RecordEnvelope[] {
  return listRecords({ family: 'KNOWLEDGE', type: 'SBTAttestation' }).filter(
    (r) => (r.data as { subjectId?: string }).subjectId === subjectId,
  );
}

/**
 * List all active attestations issued by a given issuer.
 */
export function listAttestationsByIssuer(issuedBy: string): RecordEnvelope[] {
  return listRecords({ family: 'KNOWLEDGE', type: 'SBTAttestation' }).filter(
    (r) => (r.data as { issuedBy?: string }).issuedBy === issuedBy && attestationData(r).status === 'active',
  );
}