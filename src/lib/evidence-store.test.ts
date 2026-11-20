/**
 * APT-LABS — Evidence store tests (Gate 4 — Memory & Intelligence)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerEvidence,
  attachEvidence,
  markEvidenceVerified,
  getEvidence,
  listEvidence,
  getEvidenceForRecord,
} from './evidence-store';
import { createRecord, clearRecords } from './record-envelope';
import { getAuditEvents, clearAuditEvents } from './audit';
import { buildDemoContextWithActor, type AuthzContext } from './authz';
import { clearAllStore } from './storage';

let owner: AuthzContext;
let member: AuthzContext;
let viewer: AuthzContext;

beforeEach(() => {
  clearAllStore();
  clearRecords();
  clearAuditEvents();
  owner = buildDemoContextWithActor('account-01', 'actor-01', 'owner');
  member = buildDemoContextWithActor('account-01', 'actor-01', 'member');
  viewer = buildDemoContextWithActor('account-01', 'actor-01', 'viewer');
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

describe('registerEvidence', () => {
  it('creates an EVIDENCE record with a default unverified status and an audit event', () => {
    const rec = registerEvidence({
      type: 'Document',
      summary: 'Site survey',
      sourceUri: 'oss://apt-labs/evidence/site-survey.pdf',
      actorId: 'actor-01',
      createdBy: 'account-01',
    });
    expect(rec.family).toBe('EVIDENCE');
    expect(rec.status).toBe('active');
    expect(rec.data.status).toBe('unverified');
    expect(rec.data.sourceUri).toBe('oss://apt-labs/evidence/site-survey.pdf');

    const events = getAuditEvents({ action: 'evidence.create' });
    expect(events).toHaveLength(1);
    expect(events[0].resourceId).toBe(rec.id);
    expect(events[0].resourceType).toBe('evidence');
  });

  it('is gated by evidence:write (owner allowed, viewer denied)', () => {
    expect(() =>
      registerEvidence({ type: 'Document', summary: 'ok', createdBy: 'account-01', authz: owner }),
    ).not.toThrow();
    expect(
      denied(() =>
        registerEvidence({ type: 'Document', summary: 'denied', createdBy: 'account-01', authz: viewer }),
      ),
    ).toBe('AUTHZ_DENIED');
  });
});

describe('attachEvidence', () => {
  it('attaches evidence to the record it supports, idempotently', () => {
    const target = createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'Fence' }, createdBy: 'account-01' });
    const ev = registerEvidence({ type: 'Document', summary: 'survey', createdBy: 'account-01' });

    const updated = attachEvidence(target.id, ev.id, 'account-01');
    expect(updated?.evidenceIds).toContain(ev.id);

    // Attaching the same evidence again must not duplicate it.
    const again = attachEvidence(target.id, ev.id, 'account-01');
    expect(again?.evidenceIds.filter((id) => id === ev.id)).toHaveLength(1);

    // Unknown target → undefined.
    expect(attachEvidence('no-such-record', ev.id, 'account-01')).toBeUndefined();
  });

  it('refuses to attach a non-EVIDENCE record as evidence', () => {
    const target = createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'x' }, createdBy: 'account-01' });
    const other = createRecord({ family: 'KNOWLEDGE', type: 'Method', data: { note: 'm' }, createdBy: 'account-01' });
    expect(attachEvidence(target.id, other.id, 'account-01')).toBeUndefined();
  });

  it('is gated by evidence:write (viewer denied)', () => {
    const target = createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'x' }, createdBy: 'account-01' });
    const ev = registerEvidence({ type: 'Document', summary: 'x', createdBy: 'account-01' });
    expect(denied(() => attachEvidence(target.id, ev.id, 'account-01', viewer))).toBe('AUTHZ_DENIED');
  });
});

describe('markEvidenceVerified', () => {
  it('transitions evidence to verified and logs evidence.verify', () => {
    const ev = registerEvidence({ type: 'Attestation', summary: 'a', createdBy: 'account-01' });
    const updated = markEvidenceVerified(ev.id, 'account-01');
    expect(updated?.data.status).toBe('verified');

    // Idempotent: verifying an already-verified record does not re-log.
    const again = markEvidenceVerified(ev.id, 'account-01');
    expect(again?.data.status).toBe('verified');
    expect(getAuditEvents({ action: 'evidence.verify' })).toHaveLength(1);
  });

  it('returns undefined for a non-evidence record', () => {
    const other = createRecord({ family: 'KNOWLEDGE', type: 'Method', data: { note: 'm' }, createdBy: 'account-01' });
    expect(markEvidenceVerified(other.id, 'account-01')).toBeUndefined();
  });

  it('is gated by evidence:admin (owner allowed, member denied)', () => {
    const ok = registerEvidence({ type: 'Document', summary: 'ok', createdBy: 'account-01' });
    expect(() => markEvidenceVerified(ok.id, 'account-01', owner)).not.toThrow();

    const blocked = registerEvidence({ type: 'Document', summary: 'blocked', createdBy: 'account-01' });
    expect(denied(() => markEvidenceVerified(blocked.id, 'account-01', member))).toBe('AUTHZ_DENIED');
  });
});

describe('reads', () => {
  it('getEvidence returns only EVIDENCE-family records', () => {
    const ev = registerEvidence({ type: 'Document', summary: 'x', createdBy: 'account-01' });
    const k = createRecord({ family: 'KNOWLEDGE', type: 'Method', data: { note: 'm' }, createdBy: 'account-01' });
    expect(getEvidence(ev.id)?.id).toBe(ev.id);
    expect(getEvidence(k.id)).toBeUndefined();
  });

  it('listEvidence filters by status, type and actor', () => {
    registerEvidence({ type: 'Document', summary: 'a', actorId: 'actor-01', createdBy: 'account-01' });
    registerEvidence({ type: 'Measurement', summary: 'b', actorId: 'actor-02', createdBy: 'account-01' });

    expect(listEvidence({ status: 'unverified' })).toHaveLength(2);
    expect(listEvidence({ actorId: 'actor-01' })).toHaveLength(1);
    expect(listEvidence({ type: 'Measurement' })).toHaveLength(1);

    const first = listEvidence({ actorId: 'actor-01' })[0];
    markEvidenceVerified(first.id, 'account-01');
    expect(listEvidence({ status: 'unverified' })).toHaveLength(1);
    expect(listEvidence({ status: 'verified' })).toHaveLength(1);
  });

  it('getEvidenceForRecord resolves the evidence attached to a record', () => {
    const target = createRecord({ family: 'OUTPUT_OUTCOME', type: 'Outcome', data: { outcome: 'done' }, createdBy: 'account-01' });
    const ev = registerEvidence({ type: 'TestResult', summary: 'pass', createdBy: 'account-01' });
    attachEvidence(target.id, ev.id, 'account-01');

    const linked = getEvidenceForRecord(target.id);
    expect(linked).toHaveLength(1);
    expect(linked[0].id).toBe(ev.id);

    const bare = createRecord({ family: 'OUTPUT_OUTCOME', type: 'Outcome', data: { outcome: 'x' }, createdBy: 'account-01' });
    expect(getEvidenceForRecord(bare.id)).toHaveLength(0);
  });
});
