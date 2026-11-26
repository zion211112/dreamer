import { describe, expect, it } from 'vitest';
import {
  STUDIO_LINK_TYPES,
  STUDIO_OBJECT_TYPES,
  parseStudioGraphQuery,
  parseStudioQuery,
  studioHref,
  studioObjectType,
  studioQueryFromParams,
  studioQueryParams,
} from '@apt-labs/domain';

describe('studio ontology registry', () => {
  it('publishes eight object types with unique ids', () => {
    expect(STUDIO_OBJECT_TYPES).toHaveLength(8);
    const ids = STUDIO_OBJECT_TYPES.map((type) => type.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every type properties, and makes every filterable key a real property', () => {
    for (const type of STUDIO_OBJECT_TYPES) {
      expect(type.properties.length, type.id).toBeGreaterThan(0);
      const keys = new Set(type.properties.map((property) => property.key));
      for (const key of type.filterable) expect(keys.has(key), type.id + '.' + key).toBe(true);
    }
  });

  it('only links types that exist', () => {
    const ids = new Set(STUDIO_OBJECT_TYPES.map((type) => type.id));
    for (const link of STUDIO_LINK_TYPES) {
      for (const from of link.from) expect(ids.has(from), link.id + ' from ' + from).toBe(true);
      for (const to of link.to) expect(ids.has(to), link.id + ' to ' + to).toBe(true);
    }
  });

  it('builds workbench links for records that own a detail route', () => {
    expect(studioObjectType('undertaking')?.hrefTemplate).toBe('/workspace/workbench/:id');
    expect(studioHref('undertaking', { id: 'abc' })).toBe('/workspace/workbench/abc');
    expect(studioHref('interest', { id: 'i1', undertakingId: 'u1' })).toBe('/workspace/workbench/u1');
    expect(studioHref('undertaking', { id: 'a/b' })).toBe('/workspace/workbench/a%2Fb');
    expect(studioHref('person', { id: 'p1' })).toBeNull();
  });
});

describe('studio query contract', () => {
  it('applies bounded defaults', () => {
    const parsed = parseStudioQuery({ type: 'undertaking' });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.limit).toBe(40);
    expect(parsed.data.offset).toBe(0);
    expect(parsed.data.sort).toBe('recent');
  });

  it('trims search and accepts status lists', () => {
    const parsed = parseStudioQuery({ type: 'undertaking', search: '  flood  ', status: ['open', 'active'] });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.search).toBe('flood');
    expect(parsed.data.status).toEqual(['open', 'active']);
  });

  it('refuses shapes the server would have to guess about', () => {
    expect(parseStudioQuery({ type: 'undertaking', surprise: true }).success).toBe(false);
    expect(parseStudioQuery({ type: 'secrets' }).success).toBe(false);
    expect(parseStudioQuery({ type: 'undertaking', limit: 5000 }).success).toBe(false);
    expect(parseStudioQuery({ type: 'undertaking', offset: -1 }).success).toBe(false);
    expect(parseStudioQuery({ type: 'undertaking', status: Array.from({ length: 9 }, () => 'open') }).success).toBe(false);
    expect(parseStudioQuery({}).success).toBe(false);
  });

  it('coerces graph depth from a query string and caps it', () => {
    const parsed = parseStudioGraphQuery({ type: 'undertaking', id: '0b6f3d32-8f3a-4f2e-9a1b-2c3d4e5f6071', depth: '2' });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.depth).toBe(2);
    expect(parseStudioGraphQuery({ type: 'undertaking', id: '0b6f3d32-8f3a-4f2e-9a1b-2c3d4e5f6071', depth: '3' }).success).toBe(false);
    expect(parseStudioGraphQuery({ type: 'undertaking', id: 'not-a-uuid' }).success).toBe(false);
  });

  it('round-trips a deep-linkable view through URL params', () => {
    const query = parseStudioQuery({ type: 'report', search: 'delivered scope', status: ['unreviewed'], sort: 'title', limit: 40, offset: 0 });
    expect(query.success).toBe(true);
    if (!query.success) return;
    const params = studioQueryParams(query.data);
    const restored = studioQueryFromParams(params, 'undertaking');
    expect(restored.type).toBe('report');
    expect(restored.search).toBe('delivered scope');
    expect(restored.status).toEqual(['unreviewed']);
    expect(restored.sort).toBe('title');
  });

  it('falls back to a safe default for an unparseable link', () => {
    const restored = studioQueryFromParams(new URLSearchParams('type=secrets&limit=9999'));
    expect(restored.type).toBe('undertaking');
    expect(restored.limit).toBe(40);
  });
});
