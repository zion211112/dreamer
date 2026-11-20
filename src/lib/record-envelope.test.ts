/**
 * APT-LABS — Record Envelope tests (Gate 1 — Foundations)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRecord,
  updateRecord,
  supersedeRecord,
  retireRecord,
  getRecord,
  listRecords,
  clearRecords,
} from './record-envelope';
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

describe('Record envelope', () => {
  beforeEach(() => {
    clearAllStore();
    clearRecords();
    clearAuditEvents();
  });

  describe('createRecord', () => {
    it('creates an active record at version 1 with provenance', () => {
      const rec = createRecord({
        family: 'EVIDENCE',
        type: 'Measurement',
        data: { value: 42, unit: 'kg' },
        createdBy: 'account-01',
        actorId: 'actor-01',
      });

      expect(rec.id).toMatch(/^rec-/);
      expect(rec.family).toBe('EVIDENCE');
      expect(rec.type).toBe('Measurement');
      expect(rec.data).toEqual({ value: 42, unit: 'kg' });
      expect(rec.status).toBe('active');
      expect(rec.version).toBe(1);
      expect(rec.supersedesId).toBeNull();
      expect(rec.createdBy).toBe('account-01');
      expect(rec.updatedBy).toBe('account-01');
      expect(rec.auditEventIds).toHaveLength(1);
    });

    it('persists so getRecord and listRecords return it', () => {
      const rec = createRecord({
        family: 'RESOURCE',
        type: 'Asset',
        data: { name: 'Lathes' },
        createdBy: 'account-01',
      });
      expect(getRecord(rec.id)?.id).toBe(rec.id);
      expect(listRecords()).toHaveLength(1);
    });
  });

  describe('updateRecord', () => {
    it('bumps the version and records the change', () => {
      const rec = createRecord({
        family: 'RESOURCE',
        type: 'Asset',
        data: { name: 'Lathes' },
        createdBy: 'account-01',
      });

      const updated = updateRecord(rec.id, {
        data: { name: 'Lathes (restored)' },
        updatedBy: 'account-02',
      });

      expect(updated?.version).toBe(2);
      expect(updated?.data).toEqual({ name: 'Lathes (restored)' });
      expect(updated?.updatedBy).toBe('account-02');
      expect(updated?.auditEventIds).toHaveLength(2);
      expect(updated?.status).toBe('active');
    });

    it('returns undefined for unknown id', () => {
      expect(updateRecord('rec-unknown', { updatedBy: 'a' })).toBeUndefined();
    });
  });

  describe('supersedeRecord', () => {
    it('creates a new active version, marks the old one superseded, and links them', () => {
      const rec = createRecord({
        family: 'KNOWLEDGE',
        type: 'Method',
        data: { step: 'v1' },
        createdBy: 'account-01',
      });

      const next = supersedeRecord(rec.id, {
        data: { step: 'v2' },
        reason: 'step order corrected',
        updatedBy: 'account-01',
      });

      expect(next).toBeDefined();
      expect(next?.id).not.toBe(rec.id);
      expect(next?.version).toBe(2);
      expect(next?.status).toBe('active');
      expect(next?.supersedesId).toBe(rec.id);
      expect(next?.data).toEqual({ step: 'v2' });

      const old = getRecord(rec.id);
      expect(old?.status).toBe('superseded');
      expect(old?.version).toBe(1);
    });

    it('returns undefined for unknown id', () => {
      expect(supersedeRecord('rec-unknown', { data: {}, reason: 'x', updatedBy: 'a' })).toBeUndefined();
    });
  });

  describe('retireRecord', () => {
    it('marks a record retired terminally', () => {
      const rec = createRecord({
        family: 'INTENTION',
        type: 'Need',
        data: { need: 'irrigation' },
        createdBy: 'account-01',
      });

      const retired = retireRecord(rec.id, 'superseded by new plan', 'account-01');
      expect(retired?.status).toBe('retired');
      expect(retired?.version).toBe(1);
    });
  });

  describe('listRecords filters', () => {
    beforeEach(() => {
      createRecord({ family: 'RESOURCE', type: 'Asset', data: {}, createdBy: 'a', actorId: 'actor-01' });
      createRecord({ family: 'RESOURCE', type: 'Facility', data: {}, createdBy: 'a', actorId: 'actor-02' });
      createRecord({
        family: 'WORK',
        type: 'Project',
        data: {},
        createdBy: 'a',
        actorId: 'actor-01',
        status: 'draft',
      });
    });

    it('filters by family', () => {
      expect(listRecords({ family: 'RESOURCE' })).toHaveLength(2);
      expect(listRecords({ family: 'WORK' })).toHaveLength(1);
    });

    it('filters by actorId', () => {
      expect(listRecords({ actorId: 'actor-01' })).toHaveLength(2);
      expect(listRecords({ actorId: 'actor-02' })).toHaveLength(1);
    });

    it('filters by status', () => {
      expect(listRecords({ status: 'draft' })).toHaveLength(1);
      expect(listRecords({ status: 'active' })).toHaveLength(2);
    });

    it('filters by type', () => {
      expect(listRecords({ type: 'Facility' })).toHaveLength(1);
    });
  });

  describe('permission gating', () => {
    it('denies create when authz lacks record:write', () => {
      const noWrite = buildDemoContextWithActor('account-01', 'actor-01', 'viewer');
      expectDenied(() =>
        createRecord({
          family: 'RESOURCE',
          type: 'Asset',
          data: {},
          createdBy: 'account-01',
          actorId: 'actor-01',
          authz: noWrite,
        })
      );
    });

    it('allows create when authz has record:write', () => {
      const canWrite = buildDemoContextWithActor('account-01', 'actor-01', 'member');
      const rec = createRecord({
        family: 'RESOURCE',
        type: 'Asset',
        data: { name: 'ok' },
        createdBy: 'account-01',
        actorId: 'actor-01',
        authz: canWrite,
      });
      expect(rec.id).toMatch(/^rec-/);
    });

    it('denies retire when authz lacks record:admin', () => {
      const rec = createRecord({ family: 'RESOURCE', type: 'Asset', data: {}, createdBy: 'a' });
      const manager = buildDemoContextWithActor('account-01', 'actor-01', 'manager');
      // manager does not hold record:admin
      expectDenied(() => retireRecord(rec.id, 'reason', 'account-01', manager));
    });

    it('allows retire when authz has record:admin', () => {
      const rec = createRecord({ family: 'RESOURCE', type: 'Asset', data: {}, createdBy: 'a' });
      const owner = buildDemoContextWithActor('account-01', 'actor-01', 'owner');
      const retired = retireRecord(rec.id, 'done', 'account-01', owner);
      expect(retired?.status).toBe('retired');
    });
  });

  describe('clearRecords', () => {
    it('removes all records', () => {
      createRecord({ family: 'RESOURCE', type: 'Asset', data: {}, createdBy: 'a' });
      createRecord({ family: 'WORK', type: 'Project', data: {}, createdBy: 'a' });
      clearRecords();
      expect(listRecords()).toHaveLength(0);
    });
  });
});
