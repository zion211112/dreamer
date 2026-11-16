import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { CommonsProposal } from '@/lib/local-workflows';
import type { WorkItem } from './data';

const storage = new Map<string, string>();
let workbenchData: typeof import('./data');

beforeAll(async () => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  storage.set('aptlabs:workbench-items:v1', JSON.stringify([
    workItem(null),
    {
      ...workItem(1200),
      id: 'invalid-capital',
      capital: { ...workItem(1200).capital, financial: 'unknown' },
    },
  ]));
  workbenchData = await import('./data');
});

afterAll(() => vi.unstubAllGlobals());

function proposal(overrides: Partial<CommonsProposal> = {}): CommonsProposal {
  return {
    id: 'proposal-workshop',
    institutionId: 'institution-1',
    institutionName: 'Workshop',
    sourceSignalId: 'signal-workshop',
    title: 'Repair workshop equipment',
    rationale: 'Restore the shared lathe.',
    rule: 'Steward review required',
    status: 'approved',
    createdBy: 'steward@example.test',
    createdAt: '2026-11-16T00:00:00.000Z',
    events: [],
    ...overrides,
  };
}

function workItem(financial: number | null): WorkItem {
  return {
    id: 'work-item',
    pilot: 'open',
    title: 'Workshop repairs',
    discipline: 'Workshop',
    location: 'Nairobi',
    gate: 'proposed',
    evidence: ['public'],
    capital: {
      financial,
      materials: [],
      conditions: [],
      deployed: false,
      escrowed: false,
    },
    crew: {},
  };
}

describe('Workbench proposal conversion and capital', () => {
  it('loads explicitly unpriced items and rejects malformed persisted amounts', () => {
    expect(workbenchData.WORK_ITEMS.value.map((item) => item.id)).toEqual(['work-item']);
  });

  it('creates an unpriced Open-pilot undertaking with proposal and signal traceability', () => {
    const item = workbenchData.createUndertakingFromProposal(proposal(), 'steward', 'Nairobi');

    expect(item).toMatchObject({
      pilot: 'open',
      title: 'Repair workshop equipment',
      location: 'Nairobi',
      capital: { financial: null },
      sourceProposalId: 'proposal-workshop',
      sourceSignalId: 'signal-workshop',
    });
  });

  it('does not create an undertaking from an unapproved proposal', () => {
    expect(workbenchData.createUndertakingFromProposal(proposal({ status: 'pending' }), 'steward', 'Nairobi'))
      .toBeUndefined();
  });

  it('sums only priced work items', () => {
    const items = [workItem(null), workItem(1200), workItem(800)];

    expect(workbenchData.totalCommittedCapital(items)).toBe(2000);
  });
});
