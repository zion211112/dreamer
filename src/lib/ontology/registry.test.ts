import { describe, it, expect } from 'vitest';
import {
  DefaultObjectRegistry,
  createObjectRegistry,
  type EntityTypeDefinition,
  type PropertyDefinition,
} from './registry';
import type { Family } from './types';
import type { RelationshipKind } from './relationships';
import { RELATIONSHIP_KIND } from './relationships';

describe('ontology registry', () => {
  describe('createObjectRegistry', () => {
    it('creates an empty registry', () => {
      const registry = createObjectRegistry();
      expect(registry.listEntityTypes()).toEqual([]);
      expect(registry.listRelationshipTypes()).toEqual([]);
    });
  });

  describe('registerEntityType / getEntityType', () => {
    it('registers and retrieves entity types', () => {
      const registry = createObjectRegistry();
      const def: EntityTypeDefinition = {
        family: 'ACTOR' as Family,
        type: 'Person',
        label: 'Person',
        properties: [
          { name: 'displayName', type: 'string', required: true },
          { name: 'email', type: 'string', required: false },
        ],
      };
      registry.registerEntityType(def);
      const retrieved = registry.getEntityType('ACTOR' as Family, 'Person');
      expect(retrieved).toBeDefined();
      expect(retrieved!.label).toBe('Person');
      expect(retrieved!.properties).toHaveLength(2);
    });
    it('returns undefined for unregistered types', () => {
      const registry = createObjectRegistry();
      expect(registry.getEntityType('ACTOR' as Family, 'Person')).toBeUndefined();
    });
    it('lists all entity types for a family', () => {
      const registry = createObjectRegistry();
      registry.registerEntityType({
        family: 'ACTOR' as Family, type: 'Person', label: 'Person', properties: [],
      });
      registry.registerEntityType({
        family: 'ACTOR' as Family, type: 'Organization', label: 'Organization', properties: [],
      });
      registry.registerEntityType({
        family: 'WORK' as Family, type: 'Project', label: 'Project', properties: [],
      });
      const actors = registry.getEntityTypesForFamily('ACTOR' as Family);
      expect(actors).toHaveLength(2);
      expect(actors.map((a) => a.type)).toContain('Person');
      expect(actors.map((a) => a.type)).toContain('Organization');
    });
  });

  describe('validateEntity', () => {
    it('validates a valid entity', () => {
      const registry = createObjectRegistry();
      registry.registerEntityType({
        family: 'ACTOR' as Family,
        type: 'Person',
        label: 'Person',
        properties: [{ name: 'displayName', type: 'string', required: true }],
      });
      const result = registry.validateEntity({
        id: 'ent-1',
        family: 'ACTOR' as Family,
        type: 'Person',
        name: 'Jane',
        occurredAt: '2026-01-01T00:00:00Z',
        recordedAt: '2026-01-01T00:00:00Z',
        version: 1,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01T00:00:00Z',
        properties: { displayName: 'Jane' },
      });
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });
    it('reports missing required properties', () => {
      const registry = createObjectRegistry();
      registry.registerEntityType({
        family: 'ACTOR' as Family,
        type: 'Person',
        label: 'Person',
        properties: [{ name: 'displayName', type: 'string', required: true }],
      });
      const result = registry.validateEntity({
        id: 'ent-1',
        family: 'ACTOR' as Family,
        type: 'Person',
        name: 'Jane',
        occurredAt: '2026-01-01T00:00:00Z',
        recordedAt: '2026-01-01T00:00:00Z',
        version: 1,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    it('returns errors for unregistered types', () => {
      const registry = createObjectRegistry();
      const result = registry.validateEntity({
        id: 'ent-1',
        family: 'ACTOR' as Family,
        type: 'UnknownType',
        name: 'Jane',
        occurredAt: '2026-01-01T00:00:00Z',
        recordedAt: '2026-01-01T00:00:00Z',
        version: 1,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01T00:00:00Z',
      });
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('registerRelationshipType / validateRelationship', () => {
    it('registers and validates relationship types', () => {
      const registry = createObjectRegistry();
      registry.registerRelationshipType({
        kind: RELATIONSHIP_KIND.HOLDS_CAPABILITY,
        label: 'Holds Capability',
        sourceFamilies: ['ACTOR'],
        targetFamilies: ['CAPABILITY'],
        repeatable: true,
        directional: true,
        metadataProperties: [],
      });
      const result = registry.validateRelationship({
        id: 'rel-1',
        kind: RELATIONSHIP_KIND.HOLDS_CAPABILITY,
        sourceId: 'actor-1',
        targetId: 'cap-1',
        status: 'active',
        version: 1,
        recordedAt: '2026-01-01T00:00:00Z',
        createdBy: 'user-1',
      });
      expect(result.ok).toBe(true);
    });
    it('returns errors for unregistered relationship kinds', () => {
      const registry = createObjectRegistry();
      const result = registry.validateRelationship({
        id: 'rel-1',
        kind: RELATIONSHIP_KIND.HOLDS_CAPABILITY,
        sourceId: 'actor-1',
        targetId: 'cap-1',
        status: 'active',
        version: 1,
        recordedAt: '2026-01-01T00:00:00Z',
        createdBy: 'user-1',
      });
      expect(result.ok).toBe(false);
    });
  });
});
