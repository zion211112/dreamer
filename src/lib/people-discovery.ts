import { isPrimaryEntity, type NetworkEntity, type NetworkRelationship } from './people-network';
import {
  getPeopleProfileForSubject,
  type CapabilityClaim,
  type PeopleAvailability,
  type PeopleProfileRecord,
  type PeopleServiceOffer,
} from './people-profiles';

export interface PeopleDirectoryEntry {
  entity: NetworkEntity;
  claims: CapabilityClaim[];
  offers: PeopleServiceOffer[];
  availability: PeopleAvailability;
  serviceAreas: string[];
  relatedWork: string[];
}

export interface PeopleFilters {
  capability?: string;
  serviceArea?: string;
  availability?: PeopleAvailability;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

export function projectPeopleDirectoryEntries(
  entities: readonly NetworkEntity[],
  relationships: readonly NetworkRelationship[],
  profiles: readonly PeopleProfileRecord[],
): PeopleDirectoryEntry[] {
  const entityById = new Map(entities.map(entity => [entity.id, entity]));
  return entities.filter(isPrimaryEntity).filter(entity => entity.type !== 'asset').map(entity => {
    const profile = getPeopleProfileForSubject(profiles, entity.id);
    const claims = profile
      ? profile.claims.filter(claim => claim.visibility === 'public')
      : entity.capabilities.map((name, index) => ({
        id: `${entity.id}-capability-${index}`,
        subjectId: entity.id,
        name,
        scope: '',
        visibility: 'public' as const,
        claimSource: 'unspecified' as const,
        evidenceIds: [],
      }));
    const offers = profile?.offers ?? [];
    const relatedWork = relationships.flatMap(relationship => {
      const relatedId = relationship.sourceId === entity.id
        ? relationship.targetId
        : relationship.targetId === entity.id ? relationship.sourceId : null;
      if (!relatedId) return [];
      const relatedEntity = entityById.get(relatedId);
      return relatedEntity?.type === 'work' ? [relatedEntity.name] : [];
    });

    return {
      entity,
      claims,
      offers,
      availability: profile?.availability ?? 'not-stated',
      serviceAreas: unique([
        ...(entity.location ? [entity.location] : []),
        ...offers.flatMap(offer => offer.serviceArea ? [offer.serviceArea] : []),
      ]),
      relatedWork: unique(relatedWork),
    };
  });
}

function searchableValues(entry: PeopleDirectoryEntry): string[] {
  return [
    entry.entity.name,
    entry.entity.role,
    ...entry.claims.filter(claim => claim.visibility === 'public').map(claim => claim.name),
    ...entry.offers.flatMap(offer => [offer.title, offer.scope, ...offer.deliverables]),
    ...entry.serviceAreas,
    ...entry.relatedWork,
  ];
}

function withoutPrivateClaims(entry: PeopleDirectoryEntry): PeopleDirectoryEntry {
  return {
    ...entry,
    claims: entry.claims.filter(claim => claim.visibility === 'public'),
  };
}

export function searchPeople(
  records: readonly PeopleDirectoryEntry[],
  query: string,
): PeopleDirectoryEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return records
    .filter(entry => !normalizedQuery || searchableValues(entry).some(value => (
      value.toLocaleLowerCase().includes(normalizedQuery)
    )))
    .map(withoutPrivateClaims);
}

export function filterPeople(
  records: readonly PeopleDirectoryEntry[],
  filters: PeopleFilters,
): PeopleDirectoryEntry[] {
  const capability = filters.capability?.trim().toLocaleLowerCase();
  const serviceArea = filters.serviceArea?.trim().toLocaleLowerCase();
  return records.filter(entry => (
    (!capability || entry.claims.some(claim => claim.name.toLocaleLowerCase().includes(capability)))
    && (!serviceArea || entry.serviceAreas.some(area => area.toLocaleLowerCase().includes(serviceArea)))
    && (!filters.availability || entry.availability === filters.availability)
  )).map(withoutPrivateClaims);
}

export function hasUsefulAvailabilityFilter(records: readonly PeopleDirectoryEntry[]): boolean {
  return records.some(entry => entry.availability !== 'not-stated');
}

export function getContextualAnchorLinks(
  subjectId: string,
  relationships: readonly NetworkRelationship[],
  validAnchorIds: ReadonlySet<string>,
): string[] {
  const linkedIds = relationships.flatMap(relationship => {
    const relatedId = relationship.sourceId === subjectId
      ? relationship.targetId
      : relationship.targetId === subjectId ? relationship.sourceId : null;
    return relatedId && relatedId !== subjectId && validAnchorIds.has(relatedId) ? [relatedId] : [];
  });
  return unique(linkedIds);
}
