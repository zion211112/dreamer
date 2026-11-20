/**
 * APT-LABS — Authorization tests (Gate 1 — Foundations)
 */

import { describe, it, expect } from 'vitest';
import {
  canPerform,
  canAccessActor,
  requirePermission,
  buildDemoContext,
  buildDemoContextWithActor,
  type AuthzContext,
} from './authz';

function ctx(overrides: Partial<AuthzContext> = {}): AuthzContext {
  return {
    platformRole: 'authenticated',
    accountId: 'account-01',
    actorId: null,
    actorRole: null,
    isAuthenticated: true,
    ...overrides,
  };
}

describe('Authorization', () => {
  describe('canPerform — platform-level permissions', () => {
    it('denies unauthenticated users everything except platform:read:public', () => {
      const publicCtx = ctx({ isAuthenticated: false, platformRole: 'public', accountId: null });

      expect(canPerform(publicCtx, 'platform:read:public')).toBe(true);
      expect(canPerform(publicCtx, 'platform:write:public')).toBe(false);
      expect(canPerform(publicCtx, 'actor:read')).toBe(false);
    });

    it('grants public read to public role', () => {
      expect(canPerform(ctx({ platformRole: 'public', accountId: null }), 'platform:read:public')).toBe(true);
      expect(canPerform(ctx({ platformRole: 'public', accountId: null }), 'platform:write:public')).toBe(false);
    });

    it('grants authenticated users platform:read:public and platform:write:public', () => {
      expect(canPerform(ctx({ platformRole: 'authenticated' }), 'platform:read:public')).toBe(true);
      expect(canPerform(ctx({ platformRole: 'authenticated' }), 'platform:write:public')).toBe(true);
    });

    it('admin wildcard grants every permission', () => {
      const admin = ctx({ platformRole: 'admin' });
      expect(canPerform(admin, 'platform:admin')).toBe(true);
      expect(canPerform(admin, 'actor:admin')).toBe(true);
      expect(canPerform(admin, 'credential:issue')).toBe(true);
    });

    it('moderator cannot platform:admin', () => {
      expect(canPerform(ctx({ platformRole: 'moderator' }), 'platform:admin')).toBe(false);
      expect(canPerform(ctx({ platformRole: 'moderator' }), 'platform:moderate')).toBe(true);
    });

    it('credentialIssuerAdmin can issue credentials', () => {
      expect(canPerform(ctx({ platformRole: 'credentialIssuerAdmin' }), 'credential:issue')).toBe(true);
      expect(canPerform(ctx({ platformRole: 'credentialIssuerAdmin' }), 'platform:admin')).toBe(false);
    });
  });

  describe('canPerform — actor-scoped permissions require actor context', () => {
    it('denies actor-scoped permission without actor context', () => {
      const noActor = ctx({ actorId: null, actorRole: null });
      expect(canPerform(noActor, 'actor:write')).toBe(false);
      expect(canPerform(noActor, 'resource:write')).toBe(false);
    });

    it('allows read for authenticated users without actor context via platform role', () => {
      const noActor = ctx({ actorId: null, actorRole: null });
      // authenticated platform role doesn't include resource:read, so denied
      expect(canPerform(noActor, 'resource:read')).toBe(false);
      // platform:read:public is allowed
      expect(canPerform(noActor, 'platform:read:public')).toBe(true);
    });

    it('checks actor role when actor context present', () => {
      const memberCtx = ctx({
        actorId: 'actor-01',
        actorRole: 'member',
      });
      expect(canPerform(memberCtx, 'resource:read')).toBe(true);
      expect(canPerform(memberCtx, 'resource:admin')).toBe(false);
      expect(canPerform(memberCtx, 'actor:manageRoles')).toBe(false);
    });

    it('owner has broad actor-scoped permissions', () => {
      const ownerCtx = ctx({ actorId: 'actor-01', actorRole: 'owner' });
      expect(canPerform(ownerCtx, 'actor:admin')).toBe(true);
      expect(canPerform(ownerCtx, 'resource:admin')).toBe(true);
      expect(canPerform(ownerCtx, 'credential:issue')).toBe(true);
    });

    it('viewer has read-only actor-scoped permissions', () => {
      const viewerCtx = ctx({ actorId: 'actor-01', actorRole: 'viewer' });
      expect(canPerform(viewerCtx, 'resource:read')).toBe(true);
      expect(canPerform(viewerCtx, 'resource:write')).toBe(false);
      expect(canPerform(viewerCtx, 'actor:write')).toBe(false);
    });
  });

  describe('platform role overrides actor role', () => {
    it('admin overrides actor role restrictions', () => {
      const adminWithViewerRole = ctx({
        platformRole: 'admin',
        actorId: 'actor-01',
        actorRole: 'viewer',
      });
      expect(canPerform(adminWithViewerRole, 'actor:admin')).toBe(true);
    });

    it('trustAdmin can access evidence admin', () => {
      const trustCtx = ctx({
        platformRole: 'trustAdmin',
        actorId: 'actor-01',
        actorRole: 'member',
      });
      expect(canPerform(trustCtx, 'evidence:admin')).toBe(true);
    });
  });

  describe('canAccessActor', () => {
    it('denies unauthenticated', () => {
      expect(canAccessActor(ctx({ isAuthenticated: false, accountId: null }), 'actor-01')).toBe(false);
    });

    it('denies account without id', () => {
      expect(canAccessActor(ctx({ accountId: null }), 'actor-01')).toBe(false);
    });

    it('grants admin any actor', () => {
      expect(canAccessActor(ctx({ platformRole: 'admin' }), 'actor-unknown')).toBe(true);
    });

    it('grants moderator and trustAdmin any actor', () => {
      expect(canAccessActor(ctx({ platformRole: 'moderator' }), 'actor-unknown')).toBe(true);
      expect(canAccessActor(ctx({ platformRole: 'trustAdmin' }), 'actor-unknown')).toBe(true);
    });
  });

  describe('requirePermission', () => {
    it('throws when permission denied', () => {
      expect(() => requirePermission(ctx({ actorRole: 'viewer' }), 'actor:admin')).toThrow(
        'Authorization failed'
      );
    });

    it('throws with AUTHZ_DENIED code', () => {
      try {
        requirePermission(ctx({ actorRole: 'viewer' }), 'actor:admin');
        throw new Error('should have thrown');
      } catch (err) {
        expect((err as Error & { code?: string }).code).toBe('AUTHZ_DENIED');
      }
    });

    it('does not throw when permission granted', () => {
      expect(() =>
        requirePermission(ctx({ actorId: 'actor-01', actorRole: 'owner' }), 'actor:admin')
      ).not.toThrow();
    });
  });

  describe('buildDemoContext', () => {
    it('returns unauthenticated context for null account', () => {
      const c = buildDemoContext(null);
      expect(c.isAuthenticated).toBe(false);
      expect(c.platformRole).toBe('public');
      expect(c.accountId).toBeNull();
    });

    it('returns authenticated context for an account', () => {
      const c = buildDemoContext('user@example.org');
      expect(c.isAuthenticated).toBe(true);
      expect(c.platformRole).toBe('authenticated');
      expect(c.accountId).toBe('user@example.org');
    });
  });

  describe('buildDemoContextWithActor', () => {
    it('includes actor context', () => {
      const c = buildDemoContextWithActor('user@example.org', 'actor-01', 'member');
      expect(c.isAuthenticated).toBe(true);
      expect(c.actorId).toBe('actor-01');
      expect(c.actorRole).toBe('member');
    });
  });
});
