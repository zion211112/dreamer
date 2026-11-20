/**
 * APT-LABS — Relationship Store tests (Gate 1 — Foundations)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRelationship,
  terminateRelationship,
  getRelationship,
  listRelationships,
  getRelationshipsForEntity,
  clearRelationships,
} from './relationship-store';
import { clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

/** Assert that fn throws the permission-denied error (code AUTHZ_DENIED). */
function expectDenied(fn: () => unknown): void {
  try {
    fn();
    throw new Error('expected fn to throw');
  } catch (e) {
    expect((e as { code?: string }).code).toBe('AUTHZ_DENIED');
  }
}

describe('Relationship store', () => {
  beforeEach(() => {
    clearAllStore();
    clearRelationships();
    clearAuditEvents();
  });

  describe('createRelationship', () => {
    it('creates an active relationship at version 1 with provenance', () => {
      const rel = createRelationship({
        kind: 'MEMBER_OF',
        sourceId: 'person-01',
        targetId: 'institution-01',
        sourceRole: 'teacher',
        actorId: 'actor-01',
        createdBy: 'account-01',
      });

      expect(rel.id).toMatch(/^rel-/);
      expect(rel.kind).toBe('MEMBER_OF');
      expect(rel.sourceId).toBe('person-01');
      expect(rel.targetId).toBe('institution-01');
      expect(rel.sourceRole).toBe('teacher');
      expect(rel.status).toBe('active');
      expect(rel.version).toBe(1);
      expect(rel.supersedesId).toBeNull();
      expect(rel.createdBy).toBe('account-01');
      expect(rel.auditEventIds).toHaveLength(1);
    });

    it('returns the existing active edge instead of duplicating it', () => {
      const first = createRelationship({
        kind: 'MEMBER_OF',
        sourceId: 'person-01',
        targetId: 'institution-01',
        createdBy: 'account-01',
      });
      const second = createRelationship({
        kind: 'MEMBER_OF',
        sourceId: 'person-01',
        targetId: 'institution-01',
        createdBy: 'account-01',
      });
      expect(second.id).toBe(first.id);
      expect(listRelationships()).toHaveLength(1);
    });

    it('allows the same pair under different kinds', () => {
      createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      createRelationship({ kind: 'OWNS', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      expect(listRelationships()).toHaveLength(2);
    });
  });

  describe('terminateRelationship', () => {
    it('marks a relationship terminated with an end time', () => {
      const rel = createRelationship({
        kind: 'MEMBER_OF',
        sourceId: 'person-01',
        targetId: 'institution-01',
        createdBy: 'account-01',
      });

      const terminated = terminateRelationship(rel.id, 'left the school', 'account-01');
      expect(terminated?.status).toBe('terminated');
      expect(terminated?.endedAt).toBeDefined();
      expect(terminated?.auditEventIds).toHaveLength(2);
    });

    it('excludes terminated edges from the default list', () => {
      const rel = createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      terminateRelationship(rel.id, 'done', 'x');
      expect(listRelationships()).toHaveLength(0);
      expect(listRelationships({ status: 'terminated' })).toHaveLength(1);
    });

    it('returns undefined for unknown id', () => {
      expect(terminateRelationship('rel-unknown', 'r', 'x')).toBeUndefined();
    });
  });

  describe('reads', () => {
    beforeEach(() => {
      createRelationship({ kind: 'MEMBER_OF', sourceId: 'p1', targetId: 'inst1', actorId: 'actor-01', createdBy: 'x' });
      createRelationship({ kind: 'OWNS', sourceId: 'p2', targetId: 'asset1', actorId: 'actor-02', createdBy: 'x' });
      createRelationship({ kind: 'MEMBER_OF', sourceId: 'p1', targetId: 'crew1', actorId: 'actor-01', createdBy: 'x' });
    });

    it('filters by kind', () => {
      expect(listRelationships({ kind: 'MEMBER_OF' })).toHaveLength(2);
      expect(listRelationships({ kind: 'OWNS' })).toHaveLength(1);
    });

    it('filters by actorId', () => {
      expect(listRelationships({ actorId: 'actor-01' })).toHaveLength(2);
      expect(listRelationships({ actorId: 'actor-02' })).toHaveLength(1);
    });

    it('getRelationshipsForEntity returns edges on either side', () => {
      // p1 has two member-of edges
      expect(getRelationshipsForEntity('p1')).toHaveLength(2);
      // inst1 is a target of one
      expect(getRelationshipsForEntity('inst1')).toHaveLength(1);
      // asset1 is a target of one
      expect(getRelationshipsForEntity('asset1')).toHaveLength(1);
    });

    it('getRelationship returns a single edge by id', () => {
      const all = listRelationships();
      expect(getRelationship(all[0].id)?.id).toBe(all[0].id);
    });
  });

  describe('permission gating', () => {
    it('denies create without record:write', () => {
      const viewer = buildDemoContextWithActor('account-01', 'actor-01', 'viewer');
      expectDenied(() =>
        createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x', authz: viewer })
      );
    });

    it('allows create with record:write', () => {
      const member = buildDemoContextWithActor('account-01', 'actor-01', 'member');
      const rel = createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x', authz: member });
      expect(rel.id).toMatch(/^rel-/);
    });

    it('denies terminate without record:admin', () => {
      const rel = createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      const manager = buildDemoContextWithActor('account-01', 'actor-01', 'manager');
      expectDenied(() => terminateRelationship(rel.id, 'r', 'x', manager));
    });

    it('allows terminate with record:admin', () => {
      const rel = createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      const owner = buildDemoContextWithActor('account-01', 'actor-01', 'owner');
      expect(terminateRelationship(rel.id, 'r', 'x', owner)?.status).toBe('terminated');
    });
  });

  describe('clearRelationships', () => {
    it('removes all relationships', () => {
      createRelationship({ kind: 'MEMBER_OF', sourceId: 'a', targetId: 'b', createdBy: 'x' });
      clearRelationships();
      expect(listRelationships()).toHaveLength(0);
    });
  });
});
