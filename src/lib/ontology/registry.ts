/**
 * APT-LABS — Ontology Object Registry
 *
 * Canonical registry of entity types, properties, and state machines.
 * Generates or validates TypeScript contracts, DB migrations, API schemas,
 * relationship metadata, permissions, and UI property definitions from
 * one canonical language.
 */

import type { Family, AptEntity, AptRelationship } from './types';
import type { RelationshipKind } from './relationships';

// ---------------------------------------------------------------------------
// Property definition
// ---------------------------------------------------------------------------

export interface PropertyDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: readonly string[];
}

// ---------------------------------------------------------------------------
// Entity type definition (registered per family + type)
// ---------------------------------------------------------------------------

export interface EntityTypeDefinition {
  family: Family;
  type: string;
  label: string;
  description?: string;
  properties: PropertyDefinition[];
  stateMachine?: StateMachineDefinition;
}

// ---------------------------------------------------------------------------
// State machine definition (for gate states, commitment states, etc.)
// ---------------------------------------------------------------------------

export interface StateMachineDefinition {
  states: readonly string[];
  initialState: string;
  transitions: readonly TransitionDefinition[];
  terminalStates: readonly string[];
}

export interface TransitionDefinition {
  from: string;
  to: string;
  action: string; // kinetic action that triggers the transition
  guard?: string; // optional guard condition name
}

// ---------------------------------------------------------------------------
// Relationship type definition
// ---------------------------------------------------------------------------

export interface RelationshipTypeDefinition {
  kind: RelationshipKind;
  label: string;
  description?: string;
  sourceFamilies: readonly Family[];
  targetFamilies: readonly Family[];
  repeatable: boolean;
  directional: boolean;
  metadataProperties: PropertyDefinition[];
}

// ---------------------------------------------------------------------------
// Registry API
// ---------------------------------------------------------------------------

export interface ObjectRegistry {
  /** Register an entity type definition. */
  registerEntityType(def: EntityTypeDefinition): void;
  /** Register a relationship type definition. */
  registerRelationshipType(def: RelationshipTypeDefinition): void;
  /** Get an entity type definition by family + type. */
  getEntityType(family: Family, type: string): EntityTypeDefinition | undefined;
  /** Get all entity types for a family. */
  getEntityTypesForFamily(family: Family): EntityTypeDefinition[];
  /** Get a relationship type definition by kind. */
  getRelationshipType(kind: RelationshipKind): RelationshipTypeDefinition | undefined;
  /** Validate an entity against its type definition. */
  validateEntity(entity: AptEntity): { ok: boolean; errors: string[] };
  /** Validate a relationship against its type definition. */
  validateRelationship(rel: AptRelationship): { ok: boolean; errors: string[] };
  /** List all registered entity types. */
  listEntityTypes(): EntityTypeDefinition[];
  /** List all registered relationship types. */
  listRelationshipTypes(): RelationshipTypeDefinition[];
}

// ---------------------------------------------------------------------------
// Default registry implementation
// ---------------------------------------------------------------------------

export class DefaultObjectRegistry implements ObjectRegistry {
  private entityTypes = new Map<string, EntityTypeDefinition>();
  private relationshipTypes = new Map<string, RelationshipTypeDefinition>();

  private entityKey(family: Family, type: string): string {
    return `${family}:${type}`;
  }

  registerEntityType(def: EntityTypeDefinition): void {
    this.entityTypes.set(this.entityKey(def.family, def.type), def);
  }

  registerRelationshipType(def: RelationshipTypeDefinition): void {
    this.relationshipTypes.set(def.kind, def);
  }

  getEntityType(family: Family, type: string): EntityTypeDefinition | undefined {
    return this.entityTypes.get(this.entityKey(family, type));
  }

  getEntityTypesForFamily(family: Family): EntityTypeDefinition[] {
    return Array.from(this.entityTypes.values()).filter((d) => d.family === family);
  }

  getRelationshipType(kind: RelationshipKind): RelationshipTypeDefinition | undefined {
    return this.relationshipTypes.get(kind);
  }

  validateEntity(entity: AptEntity): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const def = this.getEntityType(entity.family, entity.type);
    if (!def) {
      errors.push(`No entity type definition for ${entity.family}:${entity.type}`);
      return { ok: false, errors };
    }
    for (const prop of def.properties) {
      if (prop.required && (entity.properties === undefined || entity.properties[prop.name] === undefined)) {
        errors.push(`Missing required property: ${prop.name}`);
      }
      if (prop.enum && entity.properties && entity.properties[prop.name] !== undefined) {
        if (!prop.enum.includes(String(entity.properties[prop.name]))) {
          errors.push(`Property '${prop.name}' value not in enum`);
        }
      }
    }
    return { ok: errors.length === 0, errors };
  }

  validateRelationship(rel: AptRelationship): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const def = this.getRelationshipType(rel.kind as RelationshipKind);
    if (!def) {
      errors.push(`No relationship type definition for kind: ${rel.kind}`);
      return { ok: false, errors };
    }
    return { ok: errors.length === 0, errors };
  }

  listEntityTypes(): EntityTypeDefinition[] {
    return Array.from(this.entityTypes.values());
  }

  listRelationshipTypes(): RelationshipTypeDefinition[] {
    return Array.from(this.relationshipTypes.values());
  }
}

export function createObjectRegistry(): ObjectRegistry {
  return new DefaultObjectRegistry();
}
