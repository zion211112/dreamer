/**
 * APT-LABS — Onboarding / productive entry tests (Gate 2)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { onboardActor, getProductiveProfile } from './onboarding-journey';
import { clearRecords } from './record-envelope';
import { clearRelationships } from './relationship-store';
import { getAuditEvents, clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

const owner = (actorId: string) => buildDemoContextWithActor('account-01', actorId, 'owner');
const member = (actorId: string) => buildDemoContextWithActor('account-01', actorId, 'member');

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

describe('Productive entry (onboarding)', () => {
  it('onboards an actor with its assets and capabilities in one flow', () => {
    const profile = onboardActor({
      type: 'company',
      name: 'Nairobi Machine Works',
      description: 'Fabrication and repair',
      ownerId: 'account-01',
      createdBy: 'account-01',
      assets: [
        { name: 'CNC lathe', type: 'Equipment', capacity: '1 unit' },
        { name: 'Shop floor', type: 'Facility' },
      ],
      capabilities: [
        { name: 'Custom parts', type: 'OperationalCapacity', availability: 'weekdays' },
        { name: 'Welding', type: 'Skill' },
      ],
    });

    expect(profile.actor.name).toBe('Nairobi Machine Works');
    expect(profile.assets).toHaveLength(2);
    expect(profile.capabilities).toHaveLength(2);
    // First-class edges tie the actor to each piece of capacity.
    expect(profile.relationships.filter((r) => r.kind === 'HOLDS')).toHaveLength(2);
    expect(profile.relationships.filter((r) => r.kind === 'PROVIDES')).toHaveLength(2);
  });

  it('the composed profile is discoverable afterwards', () => {
    const profile = onboardActor({
      type: 'cooperative',
      name: 'Machakos Farmers Coop',
      ownerId: 'account-01',
      createdBy: 'account-01',
      assets: [{ name: 'Grain store', type: 'Facility' }],
      capabilities: [{ name: 'Grain storage', type: 'Service' }],
    });

    const found = getProductiveProfile(profile.actor.id);
    expect(found?.actor.name).toBe('Machakos Farmers Coop');
    expect(found?.assets).toHaveLength(1);
    expect(found?.capabilities).toHaveLength(1);
    // Only this actor's capacity, nothing else.
    expect(found?.assets[0].actorId).toBe(profile.actor.id);
  });

  it('onboarding is gated: a member cannot create an actor', () => {
    const seed = onboardActor({
      type: 'company',
      name: 'Seed Actor',
      ownerId: 'account-01',
      createdBy: 'account-01',
    });
    const actorId = seed.actor.id;

    // A member has resource:write but not actor:write, so it cannot onboard.
    expectDenied(() =>
      onboardActor({
        type: 'company',
        name: 'Not Allowed',
        ownerId: 'account-01',
        createdBy: 'account-01',
        assets: [{ name: 'x', type: 'Asset' }],
        authz: member(actorId),
      }),
    );

    // An owner can.
    const ok = onboardActor({
      type: 'company',
      name: 'Allowed',
      ownerId: 'account-01',
      createdBy: 'account-01',
      assets: [{ name: 'x', type: 'Asset' }],
      authz: owner(actorId),
    });
    expect(ok.assets).toHaveLength(1);
  });

  it('records the onboarding in the audit trail', () => {
    const profile = onboardActor({
      type: 'startup',
      name: 'Green Energy Ltd',
      ownerId: 'account-01',
      createdBy: 'account-01',
      capabilities: [{ name: 'Solar install', type: 'Skill' }],
    });

    const actorCreates = getAuditEvents({ action: 'actor.create', resourceId: profile.actor.id });
    expect(actorCreates).toHaveLength(1);

    // The capability registration is logged too, attributed to the actor.
    const capCreates = getAuditEvents({ action: 'resource.create', resourceType: 'capability' });
    expect(capCreates).toHaveLength(1);
    expect(capCreates[0].actorId).toBe(profile.actor.id);
  });

  it('onboarding with no capacity still creates the actor', () => {
    const profile = onboardActor({
      type: 'individual',
      name: 'Solo Maker',
      ownerId: 'account-01',
      createdBy: 'account-01',
    });
    expect(profile.actor.id).toBeTruthy();
    expect(profile.assets).toHaveLength(0);
    expect(profile.capabilities).toHaveLength(0);
  });
});
