import { describe, it, expect } from 'vitest';
import {
  ACTION_KIND,
  ACTION_LABELS,
  DEFAULT_ACTION_VALIDATIONS,
  DefaultActionEngine,
  createActionEngine,
  isActionKind,
  type ActionResult,
  type AuthContext,
} from './actions';

describe('ontology actions', () => {
  describe('ACTION_KIND', () => {
    it('defines five kinetic actions', () => {
      expect(Object.values(ACTION_KIND)).toHaveLength(5);
      expect(ACTION_KIND.COMMIT).toBe('commit');
      expect(ACTION_KIND.ASSIGN).toBe('assign');
      expect(ACTION_KIND.VERIFY).toBe('verify');
      expect(ACTION_KIND.SETTLE).toBe('settle');
      expect(ACTION_KIND.PRODUCE).toBe('produce');
    });
  });

  describe('ACTION_LABELS', () => {
    it('has a label for every action kind', () => {
      for (const kind of Object.values(ACTION_KIND)) {
        expect(ACTION_LABELS[kind]).toBeDefined();
        expect(typeof ACTION_LABELS[kind]).toBe('string');
      }
    });
  });

  describe('isActionKind', () => {
    it('returns true for valid kinds', () => {
      expect(isActionKind('commit')).toBe(true);
      expect(isActionKind('settle')).toBe(true);
    });
    it('returns false for invalid values', () => {
      expect(isActionKind('not-an-action')).toBe(false);
      expect(isActionKind('')).toBe(false);
    });
  });

  describe('DEFAULT_ACTION_VALIDATIONS', () => {
    it('defines validation rules for every action kind', () => {
      for (const kind of Object.values(ACTION_KIND)) {
        expect(DEFAULT_ACTION_VALIDATIONS[kind]).toBeDefined();
      }
    });
    it('SETTLE requires institution or admin role', () => {
      const rule = DEFAULT_ACTION_VALIDATIONS[ACTION_KIND.SETTLE];
      expect(rule.requiredRoles).toContain('institution');
      expect(rule.requiredRoles).toContain('admin');
    });
    it('ASSIGN requires coordinator, admin, or institution', () => {
      const rule = DEFAULT_ACTION_VALIDATIONS[ACTION_KIND.ASSIGN];
      expect(rule.requiredRoles).toContain('coordinator');
      expect(rule.requiredRoles).toContain('admin');
      expect(rule.requiredRoles).toContain('institution');
    });
  });

  describe('DefaultActionEngine.authorize', () => {
    const engine = new DefaultActionEngine();
    const baseCtx: AuthContext = {
      actorId: 'user-1',
      role: 'coordinator',
      organizationId: 'org-1',
    };

    it('allows authorized role for commit', () => {
      expect(engine.authorize(baseCtx, ACTION_KIND.COMMIT, {})).toBeNull();
    });
    it('denies unauthorized role for settle', () => {
      const result = engine.authorize({ ...baseCtx, role: 'founder' }, ACTION_KIND.SETTLE, {});
      expect(result).not.toBeNull();
      expect(result).toContain("not authorized");
    });
    it('allows institution role for settle', () => {
      expect(engine.authorize({ ...baseCtx, role: 'institution' }, ACTION_KIND.SETTLE, {})).toBeNull();
    });
    it('denies unknown action kind', () => {
      const result = engine.authorize(baseCtx, 'unknown-action' as any, {});
      expect(result).not.toBeNull();
    });
  });

  describe('DefaultActionEngine.execute', () => {
    const engine = new DefaultActionEngine();
    const ctx: AuthContext = {
      actorId: 'user-1',
      role: 'coordinator',
      organizationId: 'org-1',
    };
    const source = { system: 'aptlabs-web', method: 'ui.action' };

    it('returns success for authorized commit', async () => {
      const result = await engine.execute(
        ctx,
        ACTION_KIND.COMMIT,
        { commitmentId: 'cm-1', committingActorId: 'user-1', terms: 'test', effectiveAt: '2026-01-01T00:00:00Z' },
        source,
      );
      expect(result.ok).toBe(true);
      expect(result.actionKind).toBe('commit');
      expect(result.eventId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('returns failure for unauthorized settle', async () => {
      const founderCtx: AuthContext = { actorId: 'user-1', role: 'founder' };
      const result = await engine.execute(
        founderCtx,
        ACTION_KIND.SETTLE,
        { exchangeId: 'ex-1', settledAt: '2026-01-01T00:00:00Z' },
        source,
      );
      expect(result.ok).toBe(false);
      expect(result.actionKind).toBe('settle');
      expect(result.error).toBeDefined();
    });
  });

  describe('createActionEngine', () => {
    it('creates an action engine', () => {
      const engine = createActionEngine();
      expect(engine).toBeDefined();
      expect(typeof engine.authorize).toBe('function');
      expect(typeof engine.execute).toBe('function');
    });
  });
});
