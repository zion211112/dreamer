import { afterEach, describe, expect, it, vi } from 'vitest';
import { KIRINYAGA_CAPACITY_SCENARIO } from './workbench-capacity';
import {
  readWorkbenchCapacityDrafts,
  saveWorkbenchCapacityDraft,
  validateWorkbenchCapacityDraft,
  type WorkbenchCapacityDraftInput,
} from './workbench-capacity-drafts';

const draftKey = 'aptlabs:workbench-capacity-drafts:v1';
const validInput: WorkbenchCapacityDraftInput = {
  title: 'Pump repair work plan',
  targetVolume: 12,
  startDate: '2026-11-16',
  endDate: '2026-12-15',
  candidateIds: [KIRINYAGA_CAPACITY_SCENARIO.candidates[0].id],
};

function installStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const localStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    values,
  };
  vi.stubGlobal('localStorage', localStorage);
  return localStorage;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('local Workbench capacity drafts', () => {
  it('requiresTrimmedTitleAndPositiveFiniteVolume', () => {
    expect(validateWorkbenchCapacityDraft({ ...validInput, title: '  ' })).toHaveProperty('title');
    expect(validateWorkbenchCapacityDraft({ ...validInput, targetVolume: 0 })).toHaveProperty('targetVolume');
    expect(validateWorkbenchCapacityDraft({ ...validInput, targetVolume: Number.POSITIVE_INFINITY })).toHaveProperty('targetVolume');
    expect(validateWorkbenchCapacityDraft(validInput)).toEqual({});
  });

  it('rejectsImpossibleOrReversedDates', () => {
    expect(validateWorkbenchCapacityDraft({ ...validInput, startDate: '2026-02-30' })).toHaveProperty('startDate');
    expect(validateWorkbenchCapacityDraft({ ...validInput, endDate: '2026-11-15' })).toHaveProperty('endDate');
  });

  it('requiresKnownUniqueCandidateIds', () => {
    expect(validateWorkbenchCapacityDraft({ ...validInput, candidateIds: [] })).toHaveProperty('candidateIds');
    expect(validateWorkbenchCapacityDraft({ ...validInput, candidateIds: ['unknown-candidate'] })).toHaveProperty('candidateIds');
    expect(validateWorkbenchCapacityDraft({
      ...validInput,
      candidateIds: [validInput.candidateIds[0], validInput.candidateIds[0]],
    })).toHaveProperty('candidateIds');
  });

  it('roundTripsUsingDedicatedVersionedKey', () => {
    const storage = installStorage({ 'other-module:key': 'preserve me' });
    vi.setSystemTime(new Date('2026-11-07T12:00:00.000Z'));

    expect(readWorkbenchCapacityDrafts()).toEqual([]);
    const saved = saveWorkbenchCapacityDraft({ ...validInput, title: '  Pump repair work plan  ' });
    const serialized = storage.values.get(draftKey);

    expect(saved).toMatchObject({
      title: 'Pump repair work plan',
      status: 'draft',
      candidateIds: validInput.candidateIds,
      createdAt: '2026-11-07T12:00:00.000Z',
      updatedAt: '2026-11-07T12:00:00.000Z',
    });
    expect(saved.id).toMatch(/^capacity-draft-/);
    expect(JSON.parse(serialized ?? '')).toEqual({ version: 1, drafts: [saved] });
    expect(readWorkbenchCapacityDrafts()).toEqual([saved]);
    expect(storage.values.get('other-module:key')).toBe('preserve me');
    expect([...storage.values.keys()]).toEqual(['other-module:key', draftKey]);
  });

  it('rejectsMalformedOrUnsupportedDataWithoutOverwriting', () => {
    const storage = installStorage({ [draftKey]: '{broken' });
    expect(() => readWorkbenchCapacityDrafts()).toThrow(/damaged/i);
    expect(storage.values.get(draftKey)).toBe('{broken');

    const unsupported = JSON.stringify({ version: 2, drafts: [] });
    storage.values.set(draftKey, unsupported);
    expect(() => readWorkbenchCapacityDrafts()).toThrow(/unsupported version/i);
    expect(storage.values.get(draftKey)).toBe(unsupported);

    const malformed = JSON.stringify({ version: 1, drafts: [{ id: 'invalid' }] });
    storage.values.set(draftKey, malformed);
    expect(() => readWorkbenchCapacityDrafts()).toThrow(/invalid format/i);
    expect(storage.values.get(draftKey)).toBe(malformed);
  });

  it('reportsBlockedReadsAndQuotaWrites', () => {
    const storage = installStorage();
    storage.getItem.mockImplementation(() => { throw new Error('blocked'); });
    expect(() => readWorkbenchCapacityDrafts()).toThrow(/could not read/i);

    storage.getItem.mockImplementation(() => null);
    storage.setItem.mockImplementation(() => { throw new Error('quota'); });
    expect(() => saveWorkbenchCapacityDraft(validInput)).toThrow(/could not save/i);
  });
});
