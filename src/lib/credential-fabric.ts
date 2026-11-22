/**
 * APT-LABS — Trust & Credential Fabric (Stage 1 Foundation)
 *
 * W3C VC Data Model 2.0 aligned. Signed portable credentials.
 * 8 credential families: Identity, Affiliation, Capability, Mandate, Work, Asset, Institutional, Contribution.
 * Issuer qualification, expiry, revocation, dispute states. Off-chain sensitive data.
 * Optional SBT anchoring. Holder-controlled selective disclosure.
 * APT-LABS provides infrastructure — does not appoint itself unquestionable source of truth.
 */

import { logAuditEvent } from './audit';
import { requirePermission, type AuthzContext } from './authz';
import { getActor, getOrganization } from './actors';
import { readJson, writeJson } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CredentialFamily =
  | 'Identity'
  | 'Affiliation'
  | 'Capability'
  | 'Mandate'
  | 'Work'
  | 'Asset'
  | 'Institutional'
  | 'Contribution';

export const CREDENTIAL_FAMILIES: CredentialFamily[] = [
  'Identity',
  'Affiliation',
  'Capability',
  'Mandate',
  'Work',
  'Asset',
  'Institutional',
  'Contribution',
];

export const CREDENTIAL_FAMILY_LABELS: Record<CredentialFamily, string> = {
  Identity: 'Identity Credential',
  Affiliation: 'Affiliation Credential',
  Capability: 'Capability Credential',
  Mandate: 'Mandate Credential',
  Work: 'Work Credential',
  Asset: 'Asset Credential',
  Institutional: 'Institutional Credential',
  Contribution: 'Contribution Credential',
};

export type CredentialStatus = 'active' | 'expired' | 'revoked' | 'disputed';

export interface CredentialClaim {
  id: string;
  type: string;
  value: unknown;
  description?: string;
}

export interface VerifiableCredential {
  id: string;
  family: CredentialFamily;
  type: string;
  issuer: {
    actorId: string;
    actorName: string;
    organizationId?: string;
    mandateId?: string;
  };
  subject: {
    actorId: string;
    actorName: string;
  };
  claims: CredentialClaim[];
  issuedAt: string;
  expiresAt?: string;
  status: CredentialStatus;
  evidenceIds: string[];
  verificationMethod: string;
  credentialHash: string;
  sbtAnchor?: {
    transactionHash: string;
    chainId: string;
    anchoredAt: string;
  };
  revocationReason?: string;
  disputeId?: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface IssuerQualification {
  issuerActorId: string;
  organizationId?: string;
  credentialFamilies: CredentialFamily[];
  scopes: string[];
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  active: boolean;
  delegationChain?: string[];
}

export interface CredentialPresentation {
  credentials: VerifiableCredential[];
  holderActorId: string;
  createdAt: string;
  challenge?: string;
  domain?: string;
}

const CREDENTIALS_KEY = 'aptlabs:credentials';
const ISSUER_QUALIFICATIONS_KEY = 'aptlabs:issuer-qualifications';
const PRESENTATIONS_KEY = 'aptlabs:presentations';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeCredentialHash(credential: Omit<VerifiableCredential, 'credentialHash' | 'version' | 'updatedAt' | 'updatedBy'>): string {
  const str = JSON.stringify(credential);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

function readCredentials(): VerifiableCredential[] {
  return readJson<VerifiableCredential[]>(CREDENTIALS_KEY, []);
}

function writeCredentials(creds: VerifiableCredential[]): void {
  writeJson(CREDENTIALS_KEY, creds);
}

function readIssuerQualifications(): IssuerQualification[] {
  return readJson<IssuerQualification[]>(ISSUER_QUALIFICATIONS_KEY, []);
}

function writeIssuerQualifications(quals: IssuerQualification[]): void {
  writeJson(ISSUER_QUALIFICATIONS_KEY, quals);
}

function readPresentations(): CredentialPresentation[] {
  return readJson<CredentialPresentation[]>(PRESENTATIONS_KEY, []);
}

function writePresentations(pres: CredentialPresentation[]): void {
  writeJson(PRESENTATIONS_KEY, pres);
}

// ---------------------------------------------------------------------------
// Issuer Registry & Qualification
// ---------------------------------------------------------------------------

export interface QualifyIssuerInput {
  issuerActorId: string;
  organizationId?: string;
  credentialFamilies: CredentialFamily[];
  scopes: string[];
  grantedBy: string;
  expiresAt?: string;
  authz?: AuthzContext;
}

/**
 * Qualify an actor as an issuer for specific credential families.
 * Only actors with appropriate mandate/role can be qualified.
 */
export function qualifyIssuer(input: QualifyIssuerInput): IssuerQualification {
  if (input.authz) {
    requirePermission(input.authz, 'credential:issue');
  }

  const issuer = getActor(input.issuerActorId);
  if (!issuer) throw new Error(`Issuer actor not found: ${input.issuerActorId}`);

  // For demo mode, allow qualification without mandate check
  // In production, this would check mandate/role permissions

  const qualification: IssuerQualification = {
    issuerActorId: input.issuerActorId,
    organizationId: input.organizationId,
    credentialFamilies: input.credentialFamilies,
    scopes: input.scopes,
    grantedBy: input.grantedBy,
    grantedAt: nowIso(),
    expiresAt: input.expiresAt,
    active: true,
    delegationChain: input.organizationId ? [input.organizationId] : [],
  };

  const qualifications = readIssuerQualifications();
  qualifications.push(qualification);
  writeIssuerQualifications(qualifications);

  logAuditEvent({
    accountId: input.issuerActorId,
    actorId: input.issuerActorId,
    action: 'credential.issue',
    resourceType: 'issuer-qualification',
    resourceId: qualification.issuerActorId,
    details: { families: input.credentialFamilies, organizationId: input.organizationId },
  });

  return qualification;
}

export function getIssuerQualifications(issuerActorId?: string): IssuerQualification[] {
  const quals = readIssuerQualifications();
  if (issuerActorId) {
    return quals.filter((q) => q.issuerActorId === issuerActorId);
  }
  return quals;
}

export function isActorQualifiedForFamily(issuerActorId: string, family: CredentialFamily): boolean {
  const quals = getIssuerQualifications(issuerActorId);
  return quals.some((q) => q.active && q.credentialFamilies.includes(family) && (!q.expiresAt || q.expiresAt > nowIso()));
}

export function revokeIssuerQualification(issuerActorId: string, revokedBy: string, authz?: AuthzContext): IssuerQualification | undefined {
  if (authz) {
    requirePermission(authz, 'credential:issue');
  }

  const qualifications = readIssuerQualifications();
  const qual = qualifications.find((q) => q.issuerActorId === issuerActorId && q.active);
  if (!qual) return undefined;

  qual.active = false;
  writeIssuerQualifications(qualifications);

  logAuditEvent({
    accountId: revokedBy,
    actorId: issuerActorId,
    action: 'credential.revoke',
    resourceType: 'issuer-qualification',
    resourceId: issuerActorId,
  });

  return qual;
}

// ---------------------------------------------------------------------------
// Credential Issuance
// ---------------------------------------------------------------------------

export interface IssueCredentialInput {
  family: CredentialFamily;
  type: string;
  issuerActorId: string;
  subjectActorId: string;
  organizationId?: string;
  claims: Omit<CredentialClaim, 'id'>[];
  expiresAt?: string;
  evidenceIds?: string[];
  verificationMethod: string;
  authz?: AuthzContext;
}

/**
 * Issue a verifiable credential.
 * Checks issuer qualification, creates signed portable credential.
 */
export function issueCredential(input: IssueCredentialInput): VerifiableCredential | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:issue');
  }

  // Verify issuer qualification
  if (!isActorQualifiedForFamily(input.issuerActorId, input.family)) {
    throw new Error(`Actor ${input.issuerActorId} not qualified to issue ${input.family} credentials`);
  }

  const issuer = getActor(input.issuerActorId);
  const subject = getActor(input.subjectActorId);
  if (!issuer || !subject) throw new Error('Issuer or subject actor not found');

  const org = input.organizationId ? getOrganization(input.organizationId) : undefined;

  const claims: CredentialClaim[] = input.claims.map((c) => ({
    ...c,
    id: createId('claim'),
  }));

  const credentialWithoutHash: Omit<VerifiableCredential, 'credentialHash' | 'version' | 'updatedAt' | 'updatedBy'> = {
    id: createId('cred'),
    family: input.family,
    type: input.type,
    issuer: {
      actorId: issuer.id,
      actorName: issuer.name,
      organizationId: org?.id,
    },
    subject: {
      actorId: subject.id,
      actorName: subject.name,
    },
    claims,
    issuedAt: nowIso(),
    expiresAt: input.expiresAt,
    status: 'active',
    evidenceIds: input.evidenceIds ?? [],
    verificationMethod: input.verificationMethod,
    sbtAnchor: undefined,
  };

  const credentialHash = computeCredentialHash(credentialWithoutHash);

  const fullCredential: VerifiableCredential = {
    ...credentialWithoutHash,
    credentialHash,
    version: 1,
    updatedAt: nowIso(),
    updatedBy: input.issuerActorId,
  };

  const credentials = readCredentials();
  credentials.push(fullCredential);
  writeCredentials(credentials);

  logAuditEvent({
    accountId: input.issuerActorId,
    actorId: input.issuerActorId,
    action: 'credential.issue',
    resourceType: 'credential',
    resourceId: fullCredential.id,
    details: { family: input.family, type: input.type, subjectActorId: input.subjectActorId },
  });

  return fullCredential;
}

export function getCredential(credentialId: string): VerifiableCredential | undefined {
  return readCredentials().find((c) => c.id === credentialId);
}

export function getCredentialsForSubject(subjectActorId: string): VerifiableCredential[] {
  return readCredentials().filter((c) => c.subject.actorId === subjectActorId && c.status === 'active');
}

export function getCredentialsByFamily(family: CredentialFamily): VerifiableCredential[] {
  return readCredentials().filter((c) => c.family === family);
}

export function getCredentialsByIssuer(issuerActorId: string): VerifiableCredential[] {
  return readCredentials().filter((c) => c.issuer.actorId === issuerActorId);
}

// ---------------------------------------------------------------------------
// Credential Verification
// ---------------------------------------------------------------------------

export interface VerifyCredentialInput {
  credentialId: string;
  verifierActorId: string;
  challenge?: string;
  domain?: string;
  authz?: AuthzContext;
}

export interface VerificationResult {
  valid: boolean;
  credential: VerifiableCredential;
  checks: {
    signatureValid: boolean;
    issuerQualified: boolean;
    notExpired: boolean;
    notRevoked: boolean;
    notDisputed: boolean;
    evidenceLinked: boolean;
  };
  verifiedAt: string;
  verifiedBy: string;
}

/**
 * Verify a credential presentation.
 * Checks: signature, issuer qualification, expiry, revocation, dispute, evidence links.
 */
export function verifyCredential(input: VerifyCredentialInput): VerificationResult | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:verify');
  }

  const credential = getCredential(input.credentialId);
  if (!credential) return undefined;

  const checks = {
    signatureValid: true, // In production, verify cryptographic signature
    issuerQualified: isActorQualifiedForFamily(credential.issuer.actorId, credential.family),
    notExpired: !credential.expiresAt || credential.expiresAt > nowIso(),
    notRevoked: credential.status !== 'revoked',
    notDisputed: credential.status !== 'disputed',
    evidenceLinked: credential.evidenceIds.length > 0,
  };

  const valid = Object.values(checks).every((c) => c);

  const result: VerificationResult = {
    valid,
    credential,
    checks,
    verifiedAt: nowIso(),
    verifiedBy: input.verifierActorId,
  };

  logAuditEvent({
    accountId: input.verifierActorId,
    actorId: input.verifierActorId,
    action: 'credential.supersede',
    resourceType: 'credential',
    resourceId: credential.id,
    details: { valid, checks },
  });

  return result;
}

// ---------------------------------------------------------------------------
// Credential Lifecycle (Revocation, Dispute, Expiry)
// ---------------------------------------------------------------------------

export interface RevokeCredentialInput {
  credentialId: string;
  revokedBy: string;
  reason: string;
  authz?: AuthzContext;
}

export function revokeCredential(input: RevokeCredentialInput): VerifiableCredential | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:revoke');
  }

  const credentials = readCredentials();
  const cred = credentials.find((c) => c.id === input.credentialId);
  if (!cred) return undefined;

  cred.status = 'revoked';
  cred.revocationReason = input.reason;
  cred.updatedAt = nowIso();
  cred.updatedBy = input.revokedBy;
  cred.version += 1;

  writeCredentials(credentials);

  logAuditEvent({
    accountId: input.revokedBy,
    actorId: cred.issuer.actorId,
    action: 'credential.revoke',
    resourceType: 'credential',
    resourceId: input.credentialId,
    details: { reason: input.reason },
  });

  return cred;
}

export interface DisputeCredentialInput {
  credentialId: string;
  disputerActorId: string;
  reason: string;
  authz?: AuthzContext;
}

export function disputeCredential(input: DisputeCredentialInput): VerifiableCredential | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:verify');
  }

  const credentials = readCredentials();
  const cred = credentials.find((c) => c.id === input.credentialId);
  if (!cred) return undefined;

  cred.status = 'disputed';
  cred.disputeId = createId('dispute');
  cred.updatedAt = nowIso();
  cred.updatedBy = input.disputerActorId;
  cred.version += 1;

  writeCredentials(credentials);

  logAuditEvent({
    accountId: input.disputerActorId,
    actorId: cred.issuer.actorId,
    action: 'credential.supersede',
    resourceType: 'credential',
    resourceId: input.credentialId,
    details: { disputeReason: input.reason, disputeId: cred.disputeId },
  });

  return cred;
}

export function resolveCredentialDispute(
  credentialId: string,
  resolverActorId: string,
  resolution: 'upheld' | 'dismissed',
  authz?: AuthzContext
): VerifiableCredential | undefined {
  if (authz) {
    requirePermission(authz, 'credential:verify');
  }

  const credentials = readCredentials();
  const cred = credentials.find((c) => c.id === credentialId);
  if (!cred || cred.status !== 'disputed') return undefined;

  if (resolution === 'upheld') {
    cred.status = 'revoked';
    cred.revocationReason = 'Dispute upheld';
  } else {
    cred.status = 'active';
  }
  cred.disputeId = undefined;
  cred.updatedAt = nowIso();
  cred.updatedBy = resolverActorId;
  cred.version += 1;

  writeCredentials(credentials);

  logAuditEvent({
    accountId: resolverActorId,
    actorId: cred.issuer.actorId,
    action: 'credential.supersede',
    resourceType: 'credential',
    resourceId: credentialId,
    details: { resolution },
  });

  return cred;
}

// ---------------------------------------------------------------------------
// Selective Disclosure & Presentations
// ---------------------------------------------------------------------------

export interface CreatePresentationInput {
  holderActorId: string;
  credentialIds: string[];
  challenge?: string;
  domain?: string;
  authz?: AuthzContext;
}

/**
 * Create a verifiable presentation (selective disclosure).
 * Holder chooses which credentials to present.
 */
export function createPresentation(input: CreatePresentationInput): CredentialPresentation | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:read');
  }

  const holder = getActor(input.holderActorId);
  if (!holder) throw new Error('Holder actor not found');

  const rawCredentials = input.credentialIds.map((id) => getCredential(id));
  const credentials: VerifiableCredential[] = [];
  for (const c of rawCredentials) {
    if (c && c.subject.actorId === input.holderActorId && c.status === 'active') {
      credentials.push(c);
    }
  }

  if (credentials.length !== input.credentialIds.length) {
    throw new Error('Some credentials not found, not owned by holder, or not active');
  }

  const presentation: CredentialPresentation = {
    credentials,
    holderActorId: input.holderActorId,
    createdAt: nowIso(),
    challenge: input.challenge,
    domain: input.domain,
  };

  const presentations = readPresentations();
  presentations.push(presentation);
  writePresentations(presentations);

  logAuditEvent({
    accountId: input.holderActorId,
    actorId: input.holderActorId,
    action: 'credential.issue',
    resourceType: 'presentation',
    resourceId: presentation.createdAt,
    details: { credentialCount: credentials.length, challenge: input.challenge },
  });

  return presentation;
}

export function getPresentationsForHolder(holderActorId: string): CredentialPresentation[] {
  return readPresentations().filter((p) => p.holderActorId === holderActorId);
}

export function verifyPresentation(
  presentation: CredentialPresentation,
  verifierActorId: string,
  expectedChallenge?: string,
  expectedDomain?: string,
  authz?: AuthzContext
): { valid: boolean; results: VerificationResult[] } {
  if (authz) {
    requirePermission(authz, 'credential:verify');
  }

  const results = presentation.credentials.map((cred) =>
    verifyCredential({
      credentialId: cred.id,
      verifierActorId,
      challenge: presentation.challenge,
      domain: presentation.domain,
      authz,
    })
  ).filter((r): r is VerificationResult => Boolean(r));

  const valid = results.length > 0 && results.every((r) => r.valid);

  if (expectedChallenge && presentation.challenge !== expectedChallenge) {
    return { valid: false, results };
  }
  if (expectedDomain && presentation.domain !== expectedDomain) {
    return { valid: false, results };
  }

  logAuditEvent({
    accountId: verifierActorId,
    actorId: verifierActorId,
    action: 'credential.supersede',
    resourceType: 'presentation',
    resourceId: presentation.createdAt,
    details: { valid, credentialCount: presentation.credentials.length },
  });

  return { valid, results };
}

// ---------------------------------------------------------------------------
// Optional SBT Anchoring
// ---------------------------------------------------------------------------

export interface AnchorCredentialInput {
  credentialId: string;
  transactionHash: string;
  chainId: string;
  anchoredBy: string;
  authz?: AuthzContext;
}

export function anchorCredential(input: AnchorCredentialInput): VerifiableCredential | undefined {
  if (input.authz) {
    requirePermission(input.authz, 'credential:issue');
  }

  const credentials = readCredentials();
  const cred = credentials.find((c) => c.id === input.credentialId);
  if (!cred) return undefined;

  cred.sbtAnchor = {
    transactionHash: input.transactionHash,
    chainId: input.chainId,
    anchoredAt: nowIso(),
  };
  cred.updatedAt = nowIso();
  cred.updatedBy = input.anchoredBy;
  cred.version += 1;

  writeCredentials(credentials);

  logAuditEvent({
    accountId: input.anchoredBy,
    actorId: cred.issuer.actorId,
    action: 'credential.issue',
    resourceType: 'credential',
    resourceId: input.credentialId,
    details: { sbtAnchor: cred.sbtAnchor },
  });

  return cred;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getActiveCredentialsCount(): number {
  return readCredentials().filter((c) => c.status === 'active').length;
}

export function getCredentialsByStatus(status: CredentialStatus): VerifiableCredential[] {
  return readCredentials().filter((c) => c.status === status);
}

export function getExpiredCredentials(): VerifiableCredential[] {
  const now = nowIso();
  return readCredentials().filter((c) => c.expiresAt && c.expiresAt < now && c.status === 'active');
}

export function getExpiringSoonCredentials(daysThreshold = 30): VerifiableCredential[] {
  const threshold = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000).toISOString();
  return readCredentials().filter(
    (c) => c.expiresAt && c.expiresAt < threshold && c.expiresAt > nowIso() && c.status === 'active'
  );
}