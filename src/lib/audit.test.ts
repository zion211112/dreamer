/**
 * APT-LABS — Audit event log tests (Gate 1 — Foundations)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  logAuditEvent,
  getAuditEvents,
  clearAuditEvents,
} from './audit';

describe('Audit event log', () => {
  beforeEach(() => {
    clearAuditEvents();
  });

  describe('logAuditEvent', () => {
    it('appends an audit event and returns it', () => {
      const event = logAuditEvent({
        accountId: 'account-01',
        actorId: 'actor-01',
        action: 'actor.create',
        resourceType: 'actor',
        resourceId: 'actor-01',
        details: { name: 'Kibera Makerspace' },
      });

      expect(event.id).toMatch(/^audit-/);
      expect(event.accountId).toBe('account-01');
      expect(event.actorId).toBe('actor-01');
      expect(event.action).toBe('actor.create');
      expect(event.resourceType).toBe('actor');
      expect(event.resourceId).toBe('actor-01');
      expect(event.details).toEqual({ name: 'Kibera Makerspace' });
      expect(event.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(event.supersedesId).toBeNull();
    });

    it('supports null account and actor', () => {
      const event = logAuditEvent({
        accountId: null,
        actorId: null,
        action: 'account.login',
        resourceType: null,
        resourceId: null,
      });
      expect(event.accountId).toBeNull();
      expect(event.actorId).toBeNull();
    });

    it('supports supersession', () => {
      const first = logAuditEvent({
        accountId: 'account-01',
        action: 'record.create',
        resourceType: 'record',
        resourceId: 'record-01',
      });
      const correction = logAuditEvent({
        accountId: 'account-01',
        action: 'record.update',
        resourceType: 'record',
        resourceId: 'record-01',
        supersedesId: first.id,
      });
      expect(correction.supersedesId).toBe(first.id);
    });
  });

  describe('getAuditEvents', () => {
    it('returns events newest first', () => {
      logAuditEvent({ accountId: 'a', action: 'actor.create', resourceType: 'actor', resourceId: 'x' });
      logAuditEvent({ accountId: 'a', action: 'actor.update', resourceType: 'actor', resourceId: 'x' });

      const events = getAuditEvents();
      expect(events).toHaveLength(2);
      expect(events[0].action).toBe('actor.update');
      expect(events[1].action).toBe('actor.create');
    });

    it('filters by accountId', () => {
      logAuditEvent({ accountId: 'account-01', action: 'actor.create', resourceType: 'actor', resourceId: 'x' });
      logAuditEvent({ accountId: 'account-02', action: 'actor.create', resourceType: 'actor', resourceId: 'y' });

      const events = getAuditEvents({ accountId: 'account-01' });
      expect(events).toHaveLength(1);
      expect(events[0].accountId).toBe('account-01');
    });

    it('filters by action', () => {
      logAuditEvent({ accountId: 'a', action: 'actor.create', resourceType: 'actor', resourceId: 'x' });
      logAuditEvent({ accountId: 'a', action: 'credential.issue', resourceType: 'credential', resourceId: 'y' });

      const events = getAuditEvents({ action: 'actor.create' });
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('actor.create');
    });

    it('filters by time range boundaries', () => {
      logAuditEvent({ accountId: 'a', action: 'actor.create', resourceType: 'actor', resourceId: 'x' });
      const now = Date.now();

      // A `from` one second in the future excludes everything logged so far.
      const futureFrom = new Date(now + 1000).toISOString();
      expect(getAuditEvents({ from: futureFrom })).toHaveLength(0);

      // A `to` one second in the past excludes everything logged so far.
      const pastTo = new Date(now - 1000).toISOString();
      expect(getAuditEvents({ to: pastTo })).toHaveLength(0);

      // A wide window around now includes the event.
      const wide = getAuditEvents({
        from: new Date(now - 1000).toISOString(),
        to: new Date(now + 1000).toISOString(),
      });
      expect(wide).toHaveLength(1);
      expect(wide[0].action).toBe('actor.create');
    });

    it('limits results', () => {
      for (let i = 0; i < 5; i++) {
        logAuditEvent({ accountId: 'a', action: 'actor.create', resourceType: 'actor', resourceId: `x${i}` });
      }
      const events = getAuditEvents({ limit: 2 });
      expect(events).toHaveLength(2);
    });

    it('returns empty array when no events', () => {
      expect(getAuditEvents()).toHaveLength(0);
    });
  });

  describe('clearAuditEvents', () => {
    it('removes all events', () => {
      logAuditEvent({ accountId: 'a', action: 'actor.create', resourceType: 'actor', resourceId: 'x' });
      clearAuditEvents();
      expect(getAuditEvents()).toHaveLength(0);
    });
  });
});
