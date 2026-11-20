/**
 * APT-LABS — Identity & account flows tests (Gate 1 — Foundations)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerIdentity,
  markIdentityVerified,
  updateIdentitySettings,
  requestRecovery,
  completeRecovery,
  getIdentityByAccount,
  clearIdentities,
} from './identity';
import { getAuditEvents, clearAuditEvents } from './audit';
import { clearAllStore } from './storage';
import { buildDemoContextWithActor } from './authz';

const owner = (actorId: string) => buildDemoContextWithActor('account-01', actorId, 'owner');
const viewer = (actorId: string) => buildDemoContextWithActor('account-01', actorId, 'viewer');

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
  clearIdentities();
  clearAuditEvents();
});

describe('Identity & account flows', () => {
  it('registers an identity as a version-1, unverified record, audited', () => {
    const rec = registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    });

    const found = getIdentityByAccount('account-01');
    expect(found?.id).toBe(rec.id);
    expect(found?.verified).toBe(false);
    expect(found?.version).toBe(1);

    const events = getAuditEvents({ action: 'account.register' });
    expect(events).toHaveLength(1);
    expect(events[0].resourceId).toBe(rec.id);
  });

  it('marks verified only for a trusted principal', () => {
    const id = registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    }).id;

    // A viewer (no record:admin) is denied.
    expectDenied(() => markIdentityVerified(id, 'account-01', viewer('actor-01')));
    expect(getIdentityByAccount('account-01')?.verified).toBe(false);

    // An owner (record:admin) succeeds and bumps the version.
    markIdentityVerified(id, 'account-01', owner('actor-01'));
    const after = getIdentityByAccount('account-01');
    expect(after?.verified).toBe(true);
    expect(after?.version).toBe(2);

    // Verification is a one-way transition; a second call is a no-op.
    markIdentityVerified(id, 'account-01', owner('actor-01'));
    expect(getIdentityByAccount('account-01')?.version).toBe(2);
  });

  it('lets an account edit their own settings, not another account', () => {
    const id = registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    }).id;

    // Self-service (no authz): the account edits itself.
    updateIdentitySettings(id, { location: 'Nairobi' }, 'account-01');
    expect(getIdentityByAccount('account-01')?.settings.location).toBe('Nairobi');

    // Self-service for someone else is denied.
    expectDenied(() => updateIdentitySettings(id, { location: 'Mombasa' }, 'account-02'));

    // An admin (record:admin) may edit another account's settings.
    updateIdentitySettings(id, { organizationName: 'APT-LABS' }, 'account-02', owner('actor-01'));
    expect(getIdentityByAccount('account-01')?.settings.organizationName).toBe('APT-LABS');
  });

  it('issues a one-time, expiring recovery token', () => {
    registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    });

    const token = requestRecovery({ accountId: 'account-01', requestedBy: 'account-01' });
    expect(token.consumed).toBe(false);

    // First use succeeds and returns the account.
    const result = completeRecovery(token.token);
    expect(result.accountId).toBe('account-01');

    // Second use is refused (one-time).
    expect(() => completeRecovery(token.token)).toThrow(/already used/);
  });

  it('refuses an expired recovery token', () => {
    registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    });

    // A negative TTL makes the token expire immediately.
    const token = requestRecovery({ accountId: 'account-01', requestedBy: 'account-01', ttlMs: -1000 });
    expect(() => completeRecovery(token.token)).toThrow(/expired/);
  });

  it('audits the recovery lifecycle', () => {
    registerIdentity({
      accountId: 'account-01',
      email: 'a@b.example',
      settings: { displayName: 'Ada' },
      createdBy: 'account-01',
    });
    const token = requestRecovery({ accountId: 'account-01', requestedBy: 'account-01' });
    completeRecovery(token.token);

    const events = getAuditEvents({ action: 'account.recovery' });
    const phases = events.map((e) => e.details.phase);
    expect(phases).toContain('request');
    expect(phases).toContain('complete');
  });
});
