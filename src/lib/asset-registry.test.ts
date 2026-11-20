/**
 * APT-LABS — Asset Registry tests (Gate 1 → Gate 2 bridge)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAsset,
  updateAsset,
  retireAsset,
  getAsset,
  listAssets,
  canAccessAsset,
} from './asset-registry';
import { getRecord, clearRecords } from './record-envelope';
import { getRelationshipsForEntity, clearRelationships } from './relationship-store';
import { clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

function role(actorId: string, actorRole: 'owner' | 'member' | 'viewer') {
  return buildDemoContextWithActor('account-01', actorId, actorRole);
}

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

describe('Asset registry', () => {
  it('registers an asset as a RESOURCE record with a first-class HOLDS edge', () => {
    const rec = registerAsset({
      name: 'Machining bay 2',
      type: 'Facility',
      actorId: 'actor-01',
      capacity: '3 bays',
      createdBy: 'account-01',
      authz: role('actor-01', 'member'),
    });

    expect(getRecord(rec.id)?.family).toBe('RESOURCE');
    expect(getRecord(rec.id)?.data).toMatchObject({ name: 'Machining bay 2', status: 'active' });
    expect(getRelationshipsForEntity(rec.id)).toHaveLength(1);
    expect(getRelationshipsForEntity(rec.id)[0].kind).toBe('HOLDS');
  });

  it('gates registration on resource:write (a viewer is denied)', () => {
    expectDenied(() =>
      registerAsset({
        name: 'X',
        type: 'Asset',
        actorId: 'actor-01',
        createdBy: 'account-01',
        authz: role('actor-01', 'viewer'),
      }),
    );
  });

  it('lists assets for an actor, excluding retired ones by default', () => {
    registerAsset({ name: 'A', type: 'Asset', actorId: 'actor-01', createdBy: 'a' });
    const b = registerAsset({ name: 'B', type: 'Equipment', actorId: 'actor-01', createdBy: 'a' });
    retireAsset(b.id, 'replaced', 'a');

    const active = listAssets({ actorId: 'actor-01' });
    expect(active.map((r) => (r.data as { name: string }).name)).toEqual(['A']);

    // Retired is visible when requested explicitly.
    const retired = listAssets({ actorId: 'actor-01', status: 'retired' });
    expect(retired.map((r) => (r.data as { name: string }).name)).toEqual(['B']);
  });

  it('exposes the asset and its holdings through getAsset', () => {
    const rec = registerAsset({ name: 'Welding station', type: 'Facility', actorId: 'actor-01', createdBy: 'a' });
    const asset = getAsset(rec.id);
    expect(asset?.record.id).toBe(rec.id);
    expect(asset?.holdings).toHaveLength(1);
    expect(asset?.holdings[0].sourceId).toBe('actor-01');
  });

  it('lets a holder access an active asset, not a retired one', () => {
    const rec = registerAsset({ name: 'CNC', type: 'Equipment', actorId: 'actor-01', createdBy: 'a' });
    const owner = role('actor-01', 'owner');
    const member = role('actor-01', 'member');

    expect(canAccessAsset(member, rec.id)).toBe(true);

    // Retiring requires resource:admin; a member is denied.
    expectDenied(() => retireAsset(rec.id, 'x', 'account-01', member));

    // The owner (resource:admin) retires it.
    retireAsset(rec.id, 'out of service', 'account-01', owner);
    expect(canAccessAsset(member, rec.id)).toBe(false);
    // An admin can still inspect a retired asset.
    expect(canAccessAsset(owner, rec.id)).toBe(true);
  });

  it('updates an asset in place, gated by resource:write', () => {
    const rec = registerAsset({ name: 'Press', type: 'Equipment', actorId: 'actor-01', createdBy: 'a' });
    const updated = updateAsset(rec.id, { capacity: '200 units/day', updatedBy: 'account-01', authz: role('actor-01', 'member') });
    expect(updated?.data).toMatchObject({ capacity: '200 units/day' });

    // A viewer cannot update.
    expectDenied(() => updateAsset(rec.id, { capacity: 'nope', updatedBy: 'account-01', authz: role('actor-01', 'viewer') }));
  });

  it('refuses to act on a non-asset record', () => {
    expect(getAsset('not-an-asset-id')).toBeUndefined();
    expect(canAccessAsset(role('actor-01', 'owner'), 'not-an-asset-id')).toBe(false);
  });
});
