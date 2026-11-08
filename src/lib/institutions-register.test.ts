import { describe, expect, it } from 'vitest';
import { EXAMPLE_FIELD_SIGNALS } from './ecosystem-examples';
import { PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS } from './people-network';

describe('Institutions / Assets starter register', () => {
  it('contains only the five approved records with their existing IDs', () => {
    const records = PEOPLE_NETWORK
      .filter(entity => entity.type === 'institution' || entity.type === 'asset')
      .map(entity => entity.id)
      .sort();

    expect(records).toEqual([
      'asset-kemetos1',
      'asset-school-management-console',
      'asset-tool-library',
      'institution-kibera-makerspace',
      'mwea-water',
    ]);
  });

  it('keeps every bundled relationship attached to existing entities', () => {
    const entityIds = new Set(PEOPLE_NETWORK.map(entity => entity.id));

    expect(PEOPLE_RELATIONSHIPS.every(relationship =>
      entityIds.has(relationship.sourceId) && entityIds.has(relationship.targetId),
    )).toBe(true);
  });

  it('does not imply an institution association for the Community Tool Library', () => {
    const institutionIds = new Set(PEOPLE_NETWORK
      .filter(entity => entity.type === 'institution')
      .map(entity => entity.id));
    const toolLibrary = PEOPLE_NETWORK.find(entity => entity.id === 'asset-tool-library');

    expect(toolLibrary?.context).toContain('No institution association is recorded');
    expect(PEOPLE_RELATIONSHIPS.some(relationship =>
      relationship.sourceId === 'asset-tool-library' && institutionIds.has(relationship.targetId)
      || relationship.targetId === 'asset-tool-library' && institutionIds.has(relationship.sourceId),
    )).toBe(false);
  });

  it('uses two explicitly illustrative Commons prompts without asset links', () => {
    expect(EXAMPLE_FIELD_SIGNALS.map(signal => signal.institutionId).sort())
      .toEqual(['institution-kibera-makerspace', 'mwea-water']);
    expect(EXAMPLE_FIELD_SIGNALS).toHaveLength(2);
    expect(EXAMPLE_FIELD_SIGNALS.every(signal =>
      signal.scenario
      && signal.recordBasis === 'illustrative'
      && signal.authorizationStatus === 'not-authorized'
      && signal.assetId === undefined
      && signal.assetName === undefined
      && signal.details.includes('No asset, condition, authority, approval, or live report is represented'),
    )).toBe(true);
  });
});
