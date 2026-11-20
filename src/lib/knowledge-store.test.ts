/**
 * APT-LABS — Knowledge store tests (Gate 4 — Memory & Intelligence)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  registerKnowledge,
  distillKnowledge,
  markKnowledgeConfirmed,
  getKnowledge,
  listKnowledge,
  knowledgeForOutcome,
} from './knowledge-store';
import { createRecord, clearRecords } from './record-envelope';
import { createRollEntry } from './db/roll';
import { getAuditEvents, clearAuditEvents } from './audit';
import { buildDemoContextWithActor, type AuthzContext } from './authz';
import { clearAllStore } from './storage';

/** In-memory localStorage so the Roll demo fixtures are readable under node. */
function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value)),
  };
}

let owner: AuthzContext;
let member: AuthzContext;
let viewer: AuthzContext;

beforeEach(() => {
  clearAllStore();
  clearRecords();
  clearAuditEvents();
  vi.stubGlobal('localStorage', createMemoryStorage());
  owner = buildDemoContextWithActor('account-01', 'actor-01', 'owner');
  member = buildDemoContextWithActor('account-01', 'actor-01', 'member');
  viewer = buildDemoContextWithActor('account-01', 'actor-01', 'viewer');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Run fn, and if it throws, return the error's `.code` (or undefined). */
function denied(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (e) {
    return (e as { code?: string }).code;
  }
}

describe('registerKnowledge', () => {
  it('creates a KNOWLEDGE record with a proposed status and an audit event', () => {
    const rec = registerKnowledge({
      type: 'Method',
      title: 'Two-stage fence inspection',
      summary: 'Inspect before welding and again after curing.',
      actorId: 'actor-01',
      createdBy: 'account-01',
    });
    expect(rec.family).toBe('KNOWLEDGE');
    expect(rec.status).toBe('active');
    expect(rec.data.status).toBe('proposed');
    expect(rec.data.title).toBe('Two-stage fence inspection');

    const events = getAuditEvents({ action: 'knowledge.create' });
    expect(events).toHaveLength(1);
    expect(events[0].resourceId).toBe(rec.id);
    expect(events[0].resourceType).toBe('knowledge');
    expect(events[0].details.type).toBe('Method');
  });

  it('carries a derivedFrom pointer when knowledge is distilled from an outcome', () => {
    const rec = registerKnowledge({
      type: 'Lesson',
      title: 'Lesson · Welding',
      summary: 'Accepted outcome for welding.',
      derivedFrom: 'demo-1',
      createdBy: 'account-01',
    });
    expect(rec.data.derivedFrom).toBe('demo-1');
    const events = getAuditEvents({ action: 'knowledge.create' });
    expect(events[0].details.derivedFrom).toBe('demo-1');
  });

  it('is gated by knowledge:write (owner allowed, viewer denied)', () => {
    expect(() =>
      registerKnowledge({ type: 'Standard', title: 'ok', summary: 'ok', createdBy: 'account-01', authz: owner }),
    ).not.toThrow();
    expect(
      denied(() =>
        registerKnowledge({ type: 'Standard', title: 'denied', summary: 'denied', createdBy: 'account-01', authz: viewer }),
      ),
    ).toBe('AUTHZ_DENIED');
  });
});

describe('distillKnowledge', () => {
  it('turns an accepted Roll outcome into a Lesson record', async () => {
    const rec = await distillKnowledge('demo-1', 'account-01');
    expect(rec).toBeDefined();
    expect(rec!.type).toBe('Lesson');
    expect(rec!.data.derivedFrom).toBe('demo-1');
    expect(rec!.data.title).toBe('Lesson · DEMO · Workshop fabrication');
    expect(rec!.data.summary).toContain('acceptance recorded by demo-coord-001');
    expect(rec!.data.status).toBe('proposed');

    const events = getAuditEvents({ action: 'knowledge.create' });
    expect(events).toHaveLength(1);
    expect(events[0].details.derivedFrom).toBe('demo-1');
  });

  it('is idempotent: distilling the same outcome again returns the existing record', async () => {
    const first = await distillKnowledge('demo-2', 'account-01');
    const again = await distillKnowledge('demo-2', 'account-01');
    expect(again?.id).toBe(first?.id);
    const events = getAuditEvents({ action: 'knowledge.create', resourceId: first!.id });
    expect(events).toHaveLength(1);
  });

  it('refuses to distill an outcome that has no recorded acceptance', async () => {
    const unaccepted = await createRollEntry({
      undertaking_id: 'u-900',
      undertaking_type: 'physical',
      title: 'Unaccepted work',
      scope: 'never accepted',
      deliverables: [],
      reusable_designs: null,
      commissioned_by: { institution_id: 'inst-1', name: 'Inst', coordinator_id: 'coord-1' },
      participants: [],
      evidence: [],
      acceptance: { accepted_by: '', accepted_at: '', inspection_report_id: null, cost_disclosed: null },
      maintenance_obligations: null,
    }, 'account-01');

    expect(await distillKnowledge(unaccepted.id, 'account-01')).toBeUndefined();
    expect(listKnowledge()).toHaveLength(0);
  });

  it('returns undefined for an unknown Roll entry', async () => {
    expect(await distillKnowledge('no-such-entry', 'account-01')).toBeUndefined();
  });
});

describe('markKnowledgeConfirmed', () => {
  it('transitions knowledge to confirmed and logs knowledge.update', () => {
    const rec = registerKnowledge({ type: 'Finding', title: 'x', summary: 'x', createdBy: 'account-01' });
    const updated = markKnowledgeConfirmed(rec.id, 'account-01');
    expect(updated?.data.status).toBe('confirmed');

    // Idempotent: confirming an already-confirmed record does not re-log.
    const again = markKnowledgeConfirmed(rec.id, 'account-01');
    expect(again?.data.status).toBe('confirmed');
    expect(getAuditEvents({ action: 'knowledge.update' })).toHaveLength(1);
  });

  it('returns undefined for a non-knowledge record', () => {
    const other = createRecord({ family: 'EVIDENCE', type: 'Document', data: { summary: 'd' }, createdBy: 'account-01' });
    expect(markKnowledgeConfirmed(other.id, 'account-01')).toBeUndefined();
  });

  it('is gated by knowledge:admin (owner allowed, member denied)', () => {
    const ok = registerKnowledge({ type: 'Protocol', title: 'ok', summary: 'ok', createdBy: 'account-01' });
    expect(() => markKnowledgeConfirmed(ok.id, 'account-01', owner)).not.toThrow();

    const blocked = registerKnowledge({ type: 'Protocol', title: 'blocked', summary: 'blocked', createdBy: 'account-01' });
    expect(denied(() => markKnowledgeConfirmed(blocked.id, 'account-01', member))).toBe('AUTHZ_DENIED');
  });
});

describe('reads', () => {
  it('getKnowledge returns only KNOWLEDGE-family records', () => {
    const rec = registerKnowledge({ type: 'Lesson', title: 'x', summary: 'x', createdBy: 'account-01' });
    const ev = createRecord({ family: 'EVIDENCE', type: 'Document', data: { summary: 'd' }, createdBy: 'account-01' });
    expect(getKnowledge(rec.id)?.id).toBe(rec.id);
    expect(getKnowledge(ev.id)).toBeUndefined();
  });

  it('listKnowledge filters by type, status, and actor', () => {
    registerKnowledge({ type: 'Method', title: 'a', summary: 'a', actorId: 'actor-01', createdBy: 'account-01' });
    registerKnowledge({ type: 'Lesson', title: 'b', summary: 'b', actorId: 'actor-02', createdBy: 'account-01' });

    expect(listKnowledge()).toHaveLength(2);
    expect(listKnowledge({ type: 'Method' })).toHaveLength(1);
    expect(listKnowledge({ actorId: 'actor-01' })).toHaveLength(1);
    expect(listKnowledge({ status: 'proposed' })).toHaveLength(2);

    const first = listKnowledge({ type: 'Method' })[0];
    markKnowledgeConfirmed(first.id, 'account-01');
    expect(listKnowledge({ status: 'confirmed' })).toHaveLength(1);
    expect(listKnowledge({ status: 'proposed' })).toHaveLength(1);
  });

  it('knowledgeForOutcome resolves knowledge distilled from an outcome', async () => {
    const rec = await distillKnowledge('demo-3', 'account-01');
    expect(knowledgeForOutcome('demo-3')?.id).toBe(rec?.id);
    expect(knowledgeForOutcome('no-such-outcome')).toBeUndefined();
  });
});
