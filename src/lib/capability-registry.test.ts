/**
 * APT-LABS — Capability Registry tests (Gate 2 — Productive Entry)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerCapability,
  updateCapability,
  retireCapability,
  getCapability,
  listCapabilities,
  canAccessCapability,
} from './capability-registry';
import { clearRecords } from './record-envelope';
import { getRelationshipsForEntity, clearRelationships } from './relationship-store';
import { clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

const role = (actorId: string, r: 'owner' | 'member' | 'viewer') =>
  buildDemoContextWithActor('account-01', actorId, r);

function expectDenied(fn: () => void): void {
  let threw: unknown;
  try {
    fn();
  } catch (e) {
    threw = e;
  }
  expect(threw).toBeDefined();
  expect((threw as { code?: string }).code).toBe('AUTHZ_DENIED');
}

beforeEach(() => {
  clearAllStore();
  clearRecords();
  clearRelationships();
  clearAuditEvents();
});

describe('Capability registry', () => {
  it('registers a capability as a CAPABILITY record with a PROVIDES edge', () => {
    const rec = registerCapability({
      name: 'Welding services',
      type: 'OperationalCapacity',
      actorId: 'actor-01',
      availability: 'Mon–Fri',
      createdBy: 'account-01',
      authz: role('actor-01', 'member'),
    });

    expect(rec.family).toBe('CAPABILITY');
    expect(rec.data).toMatchObject({ name: 'Welding services', status: 'active' });
    const edges = getRelationshipsForEntity(rec.id);
    expect(edges).toHaveLength(1);
    expect(edges[0].kind).toBe('PROVIDES');
  });

  it('gates registration on resource:write (a viewer is denied)', () => {
    expectDenied(() =>
      registerCapability({
        name: 'X',
        type: 'Skill',
        actorId: 'actor-01',
        createdBy: 'account-01',
        authz: role('actor-01', 'viewer'),
      }),
    );
  });

  it('lists active capabilities for an actor, excluding retired by default', () => {
    registerCapability({ name: 'A', type: 'Skill', actorId: 'actor-01', createdBy: 'a' });
    const b = registerCapability({ name: 'B', type: 'Qualification', actorId: 'actor-01', createdBy: 'a' });
    retireCapability(b.id, 'lapsed', 'a');

    expect(listCapabilities({ actorId: 'actor-01' }).map((r) => (r.data as { name: string }).name)).toEqual(['A']);
    expect(listCapabilities({ actorId: 'actor-01', status: 'retired' }).map((r) => (r.data as { name: string }).name)).toEqual(['B']);
  });

  it('exposes the capability and its provisions through getCapability', () => {
    const rec = registerCapability({ name: 'Machining', type: 'Skill', actorId: 'actor-01', createdBy: 'a' });
    const cap = getCapability(rec.id);
    expect(cap?.record.id).toBe(rec.id);
    expect(cap?.provisions).toHaveLength(1);
    expect(cap?.provisions[0].sourceId).toBe('actor-01');
  });

  it('lets a holder access an active capability, not a retired one', () => {
    const rec = registerCapability({ name: 'Design', type: 'Skill', actorId: 'actor-01', createdBy: 'a' });
    const owner = role('actor-01', 'owner');
    const member = role('actor-01', 'member');

    expect(canAccessCapability(member, rec.id)).toBe(true);

    // Retiring needs resource:admin; a member is denied.
    expectDenied(() => retireCapability(rec.id, 'x', 'account-01', member));

    retireCapability(rec.id, 'out of scope', 'account-01', owner);
    expect(canAccessCapability(member, rec.id)).toBe(false);
    expect(canAccessCapability(owner, rec.id)).toBe(true);
  });

  it('updates a capability in place, gated by resource:write', () => {
    const rec = registerCapability({ name: 'Press op', type: 'OperationalCapacity', actorId: 'actor-01', createdBy: 'a' });
    updateCapability(rec.id, { availability: 'weekends', updatedBy: 'account-01', authz: role('actor-01', 'member') });
    expect(getCapability(rec.id)?.record.data).toMatchObject({ availability: 'weekends' });

    expectDenied(() => updateCapability(rec.id, { availability: 'nope', updatedBy: 'account-01', authz: role('actor-01', 'viewer') }));
  });

  it('refuses to act on a non-capability record', () => {
    expect(getCapability('not-a-capability')).toBeUndefined();
    expect(canAccessCapability(role('actor-01', 'owner'), 'not-a-capability')).toBe(false);
  });
});
