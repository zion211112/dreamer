import { describe, expect, it } from 'vitest';
import type { NetworkEntity, NetworkRelationship } from './people-network';
import type { CapabilityClaim, PeopleProfileRecord } from './people-profiles';
import {
  filterPeople,
  hasUsefulAvailabilityFilter,
  projectPeopleDirectoryEntries,
  searchPeople,
  getContextualAnchorLinks,
  type PeopleDirectoryEntry,
} from './people-discovery';

const person: NetworkEntity = {
  id: 'person-nia',
  type: 'person',
  name: 'Nia Wanjiru',
  role: 'Field systems designer',
  summary: 'Works on maintainable community infrastructure.',
  location: 'Nairobi',
  capabilities: ['Systems design'],
};

const crew: NetworkEntity = {
  id: 'crew-field-systems',
  type: 'crew',
  name: 'Field Systems Crew',
  role: 'Installation & maintenance',
  summary: 'Coordinates community infrastructure work.',
  location: 'Nairobi',
  capabilities: ['Electrical safety'],
};

const claims: CapabilityClaim[] = [
  { id: 'cap-systems-design', subjectId: person.id, name: 'Systems design', scope: 'Community infrastructure', visibility: 'public', claimSource: 'unspecified', evidenceIds: [] },
  { id: 'cap-private-contact', subjectId: person.id, name: 'Hidden design capability', scope: 'private scope', visibility: 'private', claimSource: 'self-declared', evidenceIds: [] },
];

const profile: PeopleProfileRecord = {
  id: 'profile-nia',
  subjectId: person.id,
  origin: 'user-authored',
  ownerId: 'owner-1',
  availability: 'limited-availability',
  claims,
  offers: [{ id: 'offer-one', subjectId: person.id, title: 'Field systems review', scope: 'Review infrastructure plans', deliverables: ['Review note'], serviceArea: 'Central Kenya' }],
  contactMethods: [{ id: 'contact-secret', type: 'email', value: 'secret@example.test', display: false, preferred: false }],
};

function entry(overrides: Partial<PeopleDirectoryEntry> = {}): PeopleDirectoryEntry {
  return {
    entity: person,
    claims: [claims[0]],
    offers: profile.offers,
    availability: 'not-stated',
    serviceAreas: ['Nairobi'],
    relatedWork: ['Microgrid commissioning'],
    ...overrides,
  };
}

describe('People directory discovery', () => {
  it('searches names, roles, capabilities, offers, and supplied areas', () => {
    const records = [entry(), entry({ entity: crew, claims: [{ ...claims[0], id: 'cap-electrical', subjectId: crew.id, name: 'Electrical safety' }], offers: [], serviceAreas: ['Kirinyaga'], relatedWork: [] })];

    expect(searchPeople(records, 'Nia').map(item => item.entity.id)).toEqual([person.id]);
    expect(searchPeople(records, 'Field systems').map(item => item.entity.id)).toEqual([person.id, crew.id]);
    expect(searchPeople(records, 'Electrical safety').map(item => item.entity.id)).toEqual([crew.id]);
    expect(searchPeople(records, 'Field systems review').map(item => item.entity.id)).toEqual([person.id]);
    expect(searchPeople(records, 'Kirinyaga').map(item => item.entity.id)).toEqual([crew.id]);
    expect(searchPeople(records, 'Microgrid commissioning').map(item => item.entity.id)).toEqual([person.id]);
  });

  it('combines capability, area, and explicit availability filters', () => {
    const records = [
      entry({ availability: 'limited-availability' }),
      entry({ entity: crew, claims: [{ ...claims[0], id: 'cap-electrical', subjectId: crew.id, name: 'Electrical safety' }], offers: [], availability: 'open-to-enquiries', serviceAreas: ['Kirinyaga'], relatedWork: [] }),
    ];

    expect(filterPeople(records, { capability: 'systems', serviceArea: 'nairobi', availability: 'limited-availability' })).toHaveLength(1);
    expect(filterPeople(records, { availability: 'open-to-enquiries' }).map(item => item.entity.id)).toEqual([crew.id]);
    expect(filterPeople(records, { availability: 'not-taking-work' })).toEqual([]);
  });

  it('does not search or return private capability claims', () => {
    const records = [entry({ claims })];

    expect(searchPeople(records, 'Hidden design capability')).toEqual([]);
    expect(searchPeople(records, 'secret@example.test')).toEqual([]);
    expect(searchPeople(records, 'secret').flatMap(item => item.claims.map(claim => claim.name))).toEqual([]);
    expect(filterPeople(records, {}).flatMap(item => item.claims.map(claim => claim.name))).toEqual(['Systems design']);
  });

  it('hides the availability filter when every record is not stated', () => {
    expect(hasUsefulAvailabilityFilter([entry(), entry({ entity: crew, availability: 'not-stated' })])).toBe(false);
    expect(hasUsefulAvailabilityFilter([entry({ availability: 'limited-availability' })])).toBe(true);
  });

  it('projects only people and crews with explicitly linked work', () => {
    const work: NetworkEntity = {
      id: 'work-microgrid', type: 'work', name: 'Microgrid commissioning', role: 'Infrastructure work',
      summary: 'Commissioning work.', capabilities: [],
    };
    const asset: NetworkEntity = {
      id: 'asset-kemetos1', type: 'asset', name: 'Kemetos1', role: 'Software asset',
      summary: 'Software asset.', capabilities: [],
    };
    const relationships: NetworkRelationship[] = [
      { id: 'nia-work', sourceId: person.id, targetId: work.id, kind: 'work', verb: 'designs' },
      { id: 'nia-asset', sourceId: person.id, targetId: asset.id, kind: 'affiliation', verb: 'uses' },
    ];

    const projected = projectPeopleDirectoryEntries([person, crew, work, asset], relationships, [profile]);

    expect(projected.map(item => item.entity.id)).toEqual([person.id, crew.id]);
    expect(projected[0].claims.map(claim => claim.name)).toEqual(['Systems design']);
    expect(projected[0].availability).toBe('limited-availability');
    expect(projected[0].relatedWork).toEqual(['Microgrid commissioning']);
    expect(projected[1].claims[0]).toMatchObject({ name: 'Electrical safety', claimSource: 'unspecified', visibility: 'public' });
    expect(projected[1].availability).toBe('not-stated');
  });

  it('returns only directly linked anchors that exist in the current record', () => {
    const relationships: NetworkRelationship[] = [
      { id: 'nia-open-design', sourceId: person.id, targetId: 'institution-open-design', kind: 'affiliation', verb: 'works with' },
      { id: 'nia-missing', sourceId: person.id, targetId: 'missing-anchor', kind: 'work', verb: 'works on' },
      { id: 'unrelated', sourceId: crew.id, targetId: 'institution-open-design', kind: 'affiliation', verb: 'works with' },
    ];

    expect(getContextualAnchorLinks(
      person.id,
      relationships,
      new Set(['institution-open-design']),
    )).toEqual(['institution-open-design']);
  });
});
