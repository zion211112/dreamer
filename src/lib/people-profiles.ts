import type { NetworkEntity } from './people-network';

export type PeopleAvailability =
  | 'open-to-enquiries'
  | 'limited-availability'
  | 'not-taking-work'
  | 'not-stated';

export type CapabilityClaimSource = 'self-declared' | 'attributed' | 'unspecified';
export type CapabilityVisibility = 'public' | 'private';
export type PeopleProfileOrigin = 'user-authored' | 'imported' | 'studio-example';
export type PeopleEvidenceType =
  | 'work-sample'
  | 'reference'
  | 'credential'
  | 'institutional-attestation'
  | 'accepted-contribution';
export type PeopleEvidenceVerificationStatus = 'unverified' | 'verified';
export type PeopleContactMethodType = 'email' | 'phone' | 'website' | 'other';

export interface CapabilityClaim {
  id: string;
  subjectId: string;
  name: string;
  scope: string;
  visibility: CapabilityVisibility;
  claimSource: CapabilityClaimSource;
  evidenceIds: string[];
}

export interface PeopleEvidence {
  id: string;
  sourceId: string;
  type: PeopleEvidenceType;
  suppliedBy: string;
  issuedBy?: string;
  supportsCapabilityId: string;
  verificationStatus: PeopleEvidenceVerificationStatus;
  verifiedBy?: string;
}

export interface PeopleServiceOffer {
  id: string;
  subjectId: string;
  title: string;
  scope: string;
  deliverables: string[];
  serviceArea?: string;
  indicativeTerms?: string;
}

export interface PeopleContactMethod {
  id: string;
  type: PeopleContactMethodType;
  value: string;
  display: boolean;
  preferred: boolean;
}

export interface PeopleProfileRecord {
  id: string;
  subjectId: string;
  origin: PeopleProfileOrigin;
  ownerId?: string;
  sourceRecordId?: string;
  availability: PeopleAvailability;
  availabilityUpdatedAt?: string;
  claims: CapabilityClaim[];
  offers: PeopleServiceOffer[];
  contactMethods: PeopleContactMethod[];
}

export interface PeopleProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const storageKey = 'aptlabs:people-profiles:v1';
const availabilityValues: readonly PeopleAvailability[] = [
  'open-to-enquiries',
  'limited-availability',
  'not-taking-work',
  'not-stated',
];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function isPeopleAvailability(value: unknown): value is PeopleAvailability {
  return typeof value === 'string' && availabilityValues.includes(value as PeopleAvailability);
}

function isCapabilityClaim(value: unknown, subjectId: string): value is CapabilityClaim {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && value.subjectId === subjectId
    && isNonEmptyString(value.name)
    && typeof value.scope === 'string'
    && (value.visibility === 'public' || value.visibility === 'private')
    && (value.claimSource === 'self-declared' || value.claimSource === 'attributed' || value.claimSource === 'unspecified')
    && isStringArray(value.evidenceIds);
}

function isPeopleServiceOffer(value: unknown, subjectId: string): value is PeopleServiceOffer {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && value.subjectId === subjectId
    && isNonEmptyString(value.title)
    && typeof value.scope === 'string'
    && isStringArray(value.deliverables)
    && (value.serviceArea === undefined || typeof value.serviceArea === 'string')
    && (value.indicativeTerms === undefined || typeof value.indicativeTerms === 'string');
}

function isPeopleContactMethod(value: unknown): value is PeopleContactMethod {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && (value.type === 'email' || value.type === 'phone' || value.type === 'website' || value.type === 'other')
    && isNonEmptyString(value.value)
    && typeof value.display === 'boolean'
    && typeof value.preferred === 'boolean';
}

export function isPeopleProfileRecord(value: unknown): value is PeopleProfileRecord {
  if (!isRecord(value)
    || !isNonEmptyString(value.id)
    || !isNonEmptyString(value.subjectId)
    || (value.origin !== 'user-authored' && value.origin !== 'imported' && value.origin !== 'studio-example')
    || value.origin === 'user-authored' && !isNonEmptyString(value.ownerId)
    || value.ownerId !== undefined && typeof value.ownerId !== 'string'
    || value.sourceRecordId !== undefined && typeof value.sourceRecordId !== 'string'
    || !isPeopleAvailability(value.availability)
    || value.availabilityUpdatedAt !== undefined && typeof value.availabilityUpdatedAt !== 'string'
    || !Array.isArray(value.claims)
    || !value.claims.every(claim => isCapabilityClaim(claim, value.subjectId as string))
    || !Array.isArray(value.offers)
    || !value.offers.every(offer => isPeopleServiceOffer(offer, value.subjectId as string))
    || !Array.isArray(value.contactMethods)
    || !value.contactMethods.every(isPeopleContactMethod)) return false;

  const claimIds = new Set((value.claims as CapabilityClaim[]).map(claim => claim.id));
  const methodIds = new Set((value.contactMethods as PeopleContactMethod[]).map(method => method.id));
  return claimIds.size === value.claims.length
    && methodIds.size === value.contactMethods.length
    && (value.contactMethods as PeopleContactMethod[]).filter(method => method.preferred).length <= 1
    && (value.origin !== 'imported' || value.sourceRecordId === undefined);
}

export function getDisplayableContactMethods(profile: PeopleProfileRecord): PeopleContactMethod[] {
  return profile.contactMethods.filter(method => method.display);
}

export function canEditPeopleProfile(profile: PeopleProfileRecord, ownerId: string): boolean {
  return profile.origin === 'user-authored'
    && typeof profile.ownerId === 'string'
    && Boolean(ownerId.trim())
    && profile.ownerId === ownerId.trim();
}

export function getPeopleProfileForSubject(
  profiles: readonly PeopleProfileRecord[],
  subjectId: string,
): PeopleProfileRecord | undefined {
  const matching = profiles.filter(profile => profile.subjectId === subjectId);
  return [...matching].reverse().find(profile => profile.origin === 'user-authored')
    ?? matching[matching.length - 1];
}

function newProfileId(): string {
  return `people-profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createUserProfileRevision(imported: PeopleProfileRecord, ownerId: string): PeopleProfileRecord {
  if (!isPeopleProfileRecord(imported) || imported.origin !== 'imported') {
    throw new Error('Only a valid imported People profile can be copied into an editable revision.');
  }
  if (!ownerId.trim()) throw new Error('A local profile owner is required to create a revision.');

  return {
    ...imported,
    id: newProfileId(),
    origin: 'user-authored',
    ownerId: ownerId.trim(),
    sourceRecordId: imported.id,
    claims: imported.claims.map(claim => ({ ...claim, evidenceIds: [...claim.evidenceIds] })),
    offers: imported.offers.map(offer => ({ ...offer, deliverables: [...offer.deliverables] })),
    contactMethods: imported.contactMethods.map(method => ({ ...method })),
  };
}

export function createImportedPeopleProfile(entity: NetworkEntity): PeopleProfileRecord {
  if (entity.type !== 'person' && entity.type !== 'crew') {
    throw new Error('Only an imported person or crew can have an editable profile revision.');
  }

  return {
    id: entity.id,
    subjectId: entity.id,
    origin: 'imported',
    availability: 'not-stated',
    claims: entity.capabilities.map((name, index) => ({
      id: `${entity.id}-capability-${index}`,
      subjectId: entity.id,
      name,
      scope: '',
      visibility: 'public',
      claimSource: 'unspecified',
      evidenceIds: [],
    })),
    offers: [],
    contactMethods: [],
  };
}

export function updateUserProfileRevision(
  profile: PeopleProfileRecord,
  ownerId: string,
  changes: Pick<PeopleProfileRecord, 'availability' | 'availabilityUpdatedAt' | 'contactMethods'>,
): PeopleProfileRecord {
  if (!isPeopleProfileRecord(profile) || !canEditPeopleProfile(profile, ownerId)) {
    throw new Error('Only the local owner can edit a user-authored People profile revision.');
  }
  if (!isPeopleAvailability(changes.availability)
    || changes.availabilityUpdatedAt !== undefined && !isNonEmptyString(changes.availabilityUpdatedAt)
    || !Array.isArray(changes.contactMethods)
    || !changes.contactMethods.every(isPeopleContactMethod)) {
    throw new Error('People profile revision changes are invalid.');
  }
  if (changes.contactMethods.filter(method => method.preferred).length > 1) {
    throw new Error('Only one contact method can be preferred.');
  }

  const updated: PeopleProfileRecord = {
    ...profile,
    availability: changes.availability,
    ...(changes.availabilityUpdatedAt === undefined
      ? {}
      : { availabilityUpdatedAt: changes.availabilityUpdatedAt }),
    contactMethods: changes.contactMethods.map(method => ({ ...method })),
  };
  if (!isPeopleProfileRecord(updated)) throw new Error('People profile revision changes are invalid.');
  return updated;
}

export function getCapabilityEvidence(
  capabilityId: string,
  evidenceRecords: readonly PeopleEvidence[],
): PeopleEvidence[] {
  return evidenceRecords.filter(record => record.supportsCapabilityId === capabilityId);
}

function browserStorage(): PeopleProfileStorage {
  if (typeof localStorage === 'undefined') throw new Error('This browser does not provide local profile storage.');
  return localStorage;
}

export function readPeopleProfileOwnerId(storage: PeopleProfileStorage = browserStorage()): string {
  let raw: string | null;
  try {
    raw = storage.getItem('authUser');
  } catch {
    throw new Error('This browser could not read the local demo identity.');
  }
  if (raw === null) return '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The saved browser-local demo identity is malformed.');
  }
  if (!isRecord(parsed) || typeof parsed.email !== 'string') return '';
  return parsed.email.trim().toLocaleLowerCase();
}

export function readPeopleProfiles(storage: PeopleProfileStorage = browserStorage()): PeopleProfileRecord[] {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey);
  } catch {
    throw new Error('This browser could not read local People profiles.');
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved local People profiles are malformed and were not changed.');
  }
  if (!Array.isArray(parsed) || !parsed.every(isPeopleProfileRecord)) {
    throw new Error('Saved local People profiles have an invalid format and were not changed.');
  }
  return parsed;
}

export function savePeopleProfiles(
  profiles: readonly PeopleProfileRecord[],
  storage: PeopleProfileStorage = browserStorage(),
): void {
  if (!profiles.every(isPeopleProfileRecord)) {
    throw new Error('People profiles are invalid; existing saved data was not changed.');
  }
  try {
    storage.setItem(storageKey, JSON.stringify(profiles));
  } catch {
    throw new Error('This browser could not save local People profiles.');
  }
}
