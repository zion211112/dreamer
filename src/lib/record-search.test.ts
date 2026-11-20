/**
 * APT-LABS — Record search tests (Gate 4 — Memory & Intelligence)
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { clearRecords, createRecord } from './record-envelope';
import { clearAuditEvents, logAuditEvent } from './audit';
import { searchAuditEvents, searchRecords } from './record-search';
import { clearAllStore } from './storage';

beforeEach(() => {
  clearAllStore();
  clearRecords();
  clearAuditEvents();
});

describe('searchRecords', () => {
  it('returns no hits for an empty or whitespace-only query', () => {
    createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'Fence' }, createdBy: 'account-01' });
    expect(searchRecords('')).toHaveLength(0);
    expect(searchRecords('   ')).toHaveLength(0);
  });

  it('finds records by substring of their data, case-insensitively', () => {
    createRecord({
      family: 'INTENTION',
      type: 'Need',
      data: { need: 'Fence repair around the school', category: 'Skill' },
      createdBy: 'account-01',
    });
    createRecord({
      family: 'COMMITMENT',
      type: 'Agreement',
      data: { offer: 'Welding', by: 'Kibera Welding Co-op' },
      createdBy: 'account-01',
    });

    const hits = searchRecords('FENCE');
    expect(hits).toHaveLength(1);
    expect(hits[0].record.type).toBe('Need');
    expect(hits[0].matchedOn).toContain('data');
    expect(hits[0].matchedOn).not.toContain('type');
  });

  it('reports which fields a hit matched on', () => {
    const rec = createRecord({
      family: 'KNOWLEDGE',
      type: 'Lesson',
      data: { title: 'Lesson · Welding', summary: 'accepted' },
      createdBy: 'account-01',
    });
    const byFamily = searchRecords('knowledge');
    expect(byFamily).toHaveLength(1);
    expect(byFamily[0].record.id).toBe(rec.id);
    expect(byFamily[0].matchedOn).toContain('family');

    const byType = searchRecords('lesson');
    expect(byType).toHaveLength(1);
    expect(byType[0].matchedOn).toContain('type');
  });

  it('excludes records that do not match', () => {
    createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'Fence' }, createdBy: 'account-01' });
    createRecord({ family: 'RESOURCE', type: 'Equipment', data: { name: 'Angle grinder' }, createdBy: 'account-01' });
    expect(searchRecords('fence').map((h) => h.record.family)).toEqual(['INTENTION']);
    expect(searchRecords('grinder').map((h) => h.record.family)).toEqual(['RESOURCE']);
  });

  it('ranks records matching more fields first, then by recency', () => {
    const narrow = createRecord({
      family: 'RESOURCE',
      type: 'Equipment',
      data: { note: 'mentions welding only in prose' },
      createdBy: 'account-01',
    });
    const wide = createRecord({
      family: 'COMMITMENT',
      type: 'Welding',
      data: { offer: 'welding', by: 'welding co-op' },
      createdBy: 'account-01',
    });

    const hits = searchRecords('welding');
    expect(hits[0].record.id).toBe(wide.id);
    expect(hits[0].matchedOn.length).toBeGreaterThan(hits[1].matchedOn.length);
    expect(hits[1].record.id).toBe(narrow.id);
  });

  it('honours family, actor and limit filters', () => {
    createRecord({ family: 'INTENTION', type: 'Need', data: { need: 'a' }, actorId: 'actor-01', createdBy: 'account-01' });
    createRecord({ family: 'COMMITMENT', type: 'Agreement', data: { offer: 'b' }, actorId: 'actor-02', createdBy: 'account-01' });

    expect(searchRecords('need', { family: 'INTENTION' })).toHaveLength(1);
    expect(searchRecords('a', { actorId: 'actor-01' })).toHaveLength(1);

    const many = searchRecords('need', { limit: 0 });
    expect(many).toHaveLength(0);
  });
});

describe('searchAuditEvents', () => {
  it('finds audit events by substring of action, resource and account', () => {
    logAuditEvent({
      accountId: 'account-01',
      actorId: 'actor-01',
      action: 'knowledge.create',
      resourceType: 'knowledge',
      resourceId: 'rec-1',
      details: { type: 'Lesson' },
    });
    logAuditEvent({
      accountId: 'account-02',
      actorId: null,
      action: 'record.create',
      resourceType: 'record',
      resourceId: 'rec-2',
      details: {},
    });

    expect(searchAuditEvents('KNOWLEDGE')).toHaveLength(1);
    expect(searchAuditEvents('knowledge')[0].resourceId).toBe('rec-1');
    expect(searchAuditEvents('record')).toHaveLength(1);
    expect(searchAuditEvents('record')[0].resourceId).toBe('rec-2');
    expect(searchAuditEvents('account-02')).toHaveLength(1);
  });

  it('returns no events for an empty or unmatched query', () => {
    logAuditEvent({
      accountId: 'account-01',
      actorId: null,
      action: 'record.create',
      resourceType: 'record',
      resourceId: 'rec-1',
      details: {},
    });
    expect(searchAuditEvents('')).toHaveLength(0);
    expect(searchAuditEvents('zzz-no-match')).toHaveLength(0);
  });

  it('honours the limit filter', () => {
    for (let i = 0; i < 5; i += 1) {
      logAuditEvent({
        accountId: 'account-01',
        actorId: null,
        action: 'record.create',
        resourceType: 'record',
        resourceId: `rec-${i}`,
        details: {},
      });
    }
    expect(searchAuditEvents('record')).toHaveLength(5);
    expect(searchAuditEvents('record', { limit: 2 })).toHaveLength(2);
  });
});
