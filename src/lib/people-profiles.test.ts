import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  canEditPeopleProfile,
  createImportedPeopleProfile,
  createUserProfileRevision,
  getCapabilityEvidence,
  getDisplayableContactMethods,
  getPeopleProfileForSubject,
  isPeopleAvailability,
  isPeopleProfileRecord,
  readPeopleProfiles,
  readPeopleProfileOwnerId,
  savePeopleProfiles,
  updateUserProfileRevision,
  type PeopleProfileRecord,
} from './people-profiles';
import type { NetworkEntity } from './people-network';

const storageKey = 'aptlabs:people-profiles:v1';

function profile(overrides: Partial<PeopleProfileRecord> = {}): PeopleProfileRecord {
  return {
    id: 'profile-nia',
    subjectId: 'person-nia',
    origin: 'user-authored',
    ownerId: 'owner-1',
    availability: 'not-stated',
    claims: [{
      id: 'cap-systems-design',
      subjectId: 'person-nia',
      name: 'Systems design',
      scope: 'Community infrastructure systems',
      visibility: 'public',
      claimSource: 'unspecified',
      evidenceIds: ['evidence-work-sample'],
    }],
    offers: [],
    contactMethods: [
      { id: 'contact-private', type: 'email', value: 'private@example.test', display: false, preferred: false },
      { id: 'contact-public', type: 'website', value: 'https://example.test', display: true, preferred: true },
    ],
    ...overrides,
  };
}

function importedEntity(overrides: Partial<NetworkEntity> = {}): NetworkEntity {
  return {
    id: 'person-imported-nia',
    type: 'person',
    name: 'Nia Wanjiru',
    role: 'Field systems designer',
    summary: 'Works on maintainable community infrastructure.',
    capabilities: ['Systems design'],
    ...overrides,
  };
}

function stubProfileStorage(value: unknown = null) {
  const values = new Map<string, string>();
  if (value !== null) values.set(storageKey, JSON.stringify(value));
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, stored: string) => values.set(key, stored),
  };
  vi.stubGlobal('localStorage', storage);
  return { storage, values };
}

afterEach(() => vi.unstubAllGlobals());

describe('People profile domain', () => {
  it('accepts only supported availability values', () => {
    expect(isPeopleAvailability('open-to-enquiries')).toBe(true);
    expect(isPeopleAvailability('limited-availability')).toBe(true);
    expect(isPeopleAvailability('not-taking-work')).toBe(true);
    expect(isPeopleAvailability('not-stated')).toBe(true);
    expect(isPeopleAvailability('available-next-week')).toBe(false);
    expect(isPeopleAvailability(undefined)).toBe(false);
  });

  it('keeps claim source separate from evidence verification', () => {
    const record = profile({
      claims: [{
        ...profile().claims[0],
        claimSource: 'self-declared',
      }],
    });

    expect(isPeopleProfileRecord(record)).toBe(true);
    expect(record.claims[0].claimSource).toBe('self-declared');
    expect(record.claims[0]).not.toHaveProperty('verificationStatus');
  });

  it('hides contact methods unless display is explicitly enabled', () => {
    expect(getDisplayableContactMethods(profile())).toEqual([
      { id: 'contact-public', type: 'website', value: 'https://example.test', display: true, preferred: true },
    ]);
  });

  it('projects a crew-owned contact route only when that crew selected display', () => {
    const crewProfile = profile({
      subjectId: 'crew-field-systems',
      contactMethods: [
        { id: 'crew-private', type: 'email', value: 'private-crew@example.test', display: false, preferred: false },
        { id: 'crew-public', type: 'website', value: 'https://crew.example.test', display: true, preferred: true },
      ],
    });

    expect(getDisplayableContactMethods(crewProfile)).toEqual([
      { id: 'crew-public', type: 'website', value: 'https://crew.example.test', display: true, preferred: true },
    ]);
  });

  it('allows editing only an owned user-authored profile', () => {
    expect(canEditPeopleProfile(profile(), 'owner-1')).toBe(true);
    expect(canEditPeopleProfile(profile(), 'owner-2')).toBe(false);
    expect(canEditPeopleProfile(profile({ origin: 'imported', ownerId: undefined }), 'owner-1')).toBe(false);
    expect(canEditPeopleProfile(profile({ origin: 'studio-example', ownerId: undefined }), 'owner-1')).toBe(false);
  });

  it('creates a linked user revision without changing the imported record', () => {
    const imported = profile({ id: 'imported-nia', origin: 'imported', ownerId: undefined, sourceRecordId: undefined });
    const original = structuredClone(imported);
    const revision = createUserProfileRevision(imported, 'owner-1');

    expect(revision).toMatchObject({
      subjectId: imported.subjectId,
      origin: 'user-authored',
      ownerId: 'owner-1',
      sourceRecordId: 'imported-nia',
    });
    expect(revision.id).not.toBe(imported.id);
    expect(imported).toEqual(original);
  });

  it('creates an imported profile baseline without changing its entity', () => {
    const entity = importedEntity();
    const original = structuredClone(entity);
    const baseline = createImportedPeopleProfile(entity);

    expect(baseline).toMatchObject({
      subjectId: entity.id,
      origin: 'imported',
      availability: 'not-stated',
      claims: [{
        subjectId: entity.id,
        name: 'Systems design',
        visibility: 'public',
        claimSource: 'unspecified',
        evidenceIds: [],
      }],
      offers: [],
      contactMethods: [],
    });
    expect(entity).toEqual(original);
  });

  it('creates a linked local revision from an imported entity profile', () => {
    const baseline = createImportedPeopleProfile(importedEntity());
    const revision = createUserProfileRevision(baseline, 'owner-1');

    expect(revision).toMatchObject({
      subjectId: baseline.subjectId,
      origin: 'user-authored',
      ownerId: 'owner-1',
      sourceRecordId: baseline.id,
    });
    expect(baseline.origin).toBe('imported');
  });

  it('updates only approved fields on an owned user revision', () => {
    const baseline = createImportedPeopleProfile(importedEntity());
    const revision = createUserProfileRevision(baseline, 'owner-1');
    const original = structuredClone(revision);
    const changes = {
      availability: 'limited-availability' as const,
      availabilityUpdatedAt: '2026-11-01T10:00:00.000Z',
      contactMethods: [
        { id: 'contact-email', type: 'email' as const, value: 'nia@example.test', display: false, preferred: false },
        { id: 'contact-site', type: 'website' as const, value: 'https://nia.example.test', display: true, preferred: true },
      ],
    };

    const updated = updateUserProfileRevision(revision, 'owner-1', changes);

    expect(updated).toMatchObject(changes);
    expect(updated.claims).toEqual(revision.claims);
    expect(updated.offers).toEqual(revision.offers);
    expect(updated.sourceRecordId).toBe(baseline.id);
    expect(revision).toEqual(original);
    expect(getDisplayableContactMethods(updated)).toEqual([changes.contactMethods[1]]);
  });

  it('rejects editing an unowned or imported profile revision', () => {
    const baseline = createImportedPeopleProfile(importedEntity());
    const revision = createUserProfileRevision(baseline, 'owner-1');
    const changes = { availability: 'open-to-enquiries' as const, contactMethods: [] };

    expect(() => updateUserProfileRevision(revision, 'owner-2', changes)).toThrow(/owner/i);
    expect(() => updateUserProfileRevision(baseline, 'owner-1', changes)).toThrow(/user-authored/i);
  });

  it('rejects multiple preferred contacts in a local revision', () => {
    const revision = createUserProfileRevision(createImportedPeopleProfile(importedEntity()), 'owner-1');
    const contacts = [
      { id: 'contact-one', type: 'email' as const, value: 'one@example.test', display: true, preferred: true },
      { id: 'contact-two', type: 'phone' as const, value: '+10000000000', display: true, preferred: true },
    ];

    expect(() => updateUserProfileRevision(revision, 'owner-1', {
      availability: 'not-stated',
      contactMethods: contacts,
    })).toThrow(/preferred/i);
  });

  it('uses the explicit user-authored revision without merging its imported source', () => {
    const imported = profile({ id: 'imported-nia', origin: 'imported', ownerId: undefined, sourceRecordId: undefined });
    const revision = createUserProfileRevision(imported, 'owner-1');

    expect(getPeopleProfileForSubject([imported, revision], imported.subjectId)).toEqual(revision);
    expect(imported.origin).toBe('imported');
  });

  it('returns only evidence explicitly linked to the requested capability', () => {
    const records = [
      { id: 'evidence-one', sourceId: 'work-one', type: 'work-sample' as const, suppliedBy: 'Nia', supportsCapabilityId: 'cap-one', verificationStatus: 'unverified' as const },
      { id: 'evidence-two', sourceId: 'credential-two', type: 'credential' as const, suppliedBy: 'Institute', issuedBy: 'Institute', supportsCapabilityId: 'cap-two', verificationStatus: 'verified' as const, verifiedBy: 'Institute' },
    ];

    expect(getCapabilityEvidence('cap-one', records)).toEqual([records[0]]);
    expect(getCapabilityEvidence('missing', records)).toEqual([]);
  });

  it('does not treat an issuer-verified credential as accepted work', () => {
    const credential = {
      id: 'credential-one',
      sourceId: 'issuer-record-one',
      type: 'credential' as const,
      suppliedBy: 'Nia',
      issuedBy: 'Technical Institute',
      supportsCapabilityId: 'cap-one',
      verificationStatus: 'verified' as const,
      verifiedBy: 'Technical Institute',
    };

    expect(getCapabilityEvidence('cap-one', [credential])).toEqual([credential]);
    expect(getCapabilityEvidence('cap-one', [credential])[0]).toMatchObject({
      type: 'credential',
      verificationStatus: 'verified',
      verifiedBy: 'Technical Institute',
    });
  });
});

describe('People profile storage', () => {
  it('reads the browser-local demo email as a normalized owner key', () => {
    const { storage } = stubProfileStorage();
    storage.setItem('authUser', JSON.stringify({ email: ' Nia@Example.Test ', context: 'people' }));

    expect(readPeopleProfileOwnerId(storage)).toBe('nia@example.test');
  });

  it('returns no owner when the browser-local demo identity is absent', () => {
    const { storage } = stubProfileStorage();
    expect(readPeopleProfileOwnerId(storage)).toBe('');
  });

  it('reports malformed browser-local identity data', () => {
    const { storage } = stubProfileStorage();
    storage.setItem('authUser', '{broken');

    expect(() => readPeopleProfileOwnerId(storage)).toThrow(/identity is malformed/i);
  });

  it('round-trips valid records and preserves separate records with similar names', () => {
    const { storage } = stubProfileStorage();
    const records = [
      profile(),
      profile({ id: 'profile-nia-imported', origin: 'imported', ownerId: undefined, sourceRecordId: undefined }),
    ];

    savePeopleProfiles(records, storage);

    expect(readPeopleProfiles(storage)).toEqual(records);
  });

  it('returns an empty list when no local profiles have been saved', () => {
    const { storage } = stubProfileStorage();
    expect(readPeopleProfiles(storage)).toEqual([]);
  });

  it('rejects malformed profiles without replacing existing stored data', () => {
    const { storage, values } = stubProfileStorage([profile()]);
    const previous = values.get(storageKey);

    expect(() => savePeopleProfiles([{ ...profile(), availability: 'available-next-week' } as unknown as PeopleProfileRecord], storage)).toThrow(/invalid/i);
    expect(values.get(storageKey)).toBe(previous);
  });

  it('rejects malformed stored data without destructive fallback', () => {
    const { storage, values } = stubProfileStorage([profile()]);
    values.set(storageKey, JSON.stringify([{ ...profile(), contactMethods: 'private' }]));
    const malformed = values.get(storageKey);

    expect(() => readPeopleProfiles(storage)).toThrow(/invalid/i);
    expect(values.get(storageKey)).toBe(malformed);
  });
});
