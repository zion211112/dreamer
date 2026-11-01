import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  expressLocalWorkInterest,
  readLocalWorkInterests,
  removeLocalWorkInterest,
} from './workbench-interest';

const interestKey = 'aptlabs:workbench-interests:v1';

function installStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const localStorage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
    values,
  };
  vi.stubGlobal('localStorage', localStorage);
  return localStorage;
}

afterEach(() => vi.unstubAllGlobals());

describe('isolated local Workbench interests', () => {
  it('round-trips records containing only a local ID, opportunity ID, and ISO creation time', () => {
    const storage = installStorage();

    const saved = expressLocalWorkInterest('school-learning-animation');

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ opportunityId: 'school-learning-animation' });
    expect(Object.keys(saved[0]).sort()).toEqual(['createdAt', 'id', 'opportunityId']);
    expect(saved[0].id).toMatch(/^work-interest-/);
    expect(new Date(saved[0].createdAt).toISOString()).toBe(saved[0].createdAt);
    expect(storage.values.get(interestKey)).toBe(JSON.stringify(saved));
    expect(readLocalWorkInterests()).toEqual(saved);
  });

  it('does not duplicate repeated interest for the same opportunity', () => {
    installStorage();

    const first = expressLocalWorkInterest('school-learning-animation');
    const repeated = expressLocalWorkInterest('school-learning-animation');

    expect(repeated).toEqual(first);
    expect(readLocalWorkInterests()).toHaveLength(1);
  });

  it('removes only the selected opportunity interest', () => {
    installStorage();
    expressLocalWorkInterest('school-learning-animation');
    const second = expressLocalWorkInterest('kemetos-agi1-software')[0];

    expect(removeLocalWorkInterest('school-learning-animation')).toEqual([second]);
    expect(readLocalWorkInterests()).toEqual([second]);
  });

  it('retains a valid interest whose opportunity is no longer in the local example set', () => {
    const stale = {
      id: 'work-interest-existing',
      opportunityId: 'removed-example',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    installStorage({ [interestKey]: JSON.stringify([stale]) });

    expect(readLocalWorkInterests()).toEqual([stale]);
  });

  it('rejects malformed JSON, extra identity fields, and invalid timestamps without overwriting data', () => {
    const storage = installStorage({ [interestKey]: '{broken' });
    expect(() => readLocalWorkInterests()).toThrow(/damaged/i);
    expect(storage.values.get(interestKey)).toBe('{broken');

    storage.values.set(interestKey, JSON.stringify([{
      id: 'work-interest-1',
      opportunityId: 'example',
      createdAt: '2026-11-01T00:00:00.000Z',
      applicant: 'Example Person',
    }]));
    expect(() => readLocalWorkInterests()).toThrow(/invalid|unsupported/i);

    storage.values.set(interestKey, JSON.stringify([{
      id: 'work-interest-1',
      opportunityId: 'example',
      createdAt: 'not-a-date',
    }]));
    expect(() => readLocalWorkInterests()).toThrow(/invalid|unsupported/i);
  });

  it('reports read failures instead of returning an empty interest list', () => {
    const storage = installStorage();
    storage.getItem.mockImplementation(() => { throw new Error('blocked'); });

    expect(() => readLocalWorkInterests()).toThrow(/could not read/i);
  });

  it('reports write failures when expressing or removing interest', () => {
    const storage = installStorage();
    storage.setItem.mockImplementation(() => { throw new Error('quota'); });

    expect(() => expressLocalWorkInterest('school-learning-animation')).toThrow(/could not save/i);

    storage.values.set(interestKey, JSON.stringify([{
      id: 'work-interest-existing',
      opportunityId: 'school-learning-animation',
      createdAt: '2026-11-01T00:00:00.000Z',
    }]));
    expect(() => removeLocalWorkInterest('school-learning-animation')).toThrow(/could not save/i);
  });

  it('leaves existing application and simulation storage unchanged', () => {
    const applicationKey = 'aptlabs:workbench-local-flow:v1';
    const simulationKey = 'aptlabs:workbench-simulations:v1';
    const storage = installStorage({
      [applicationKey]: '{"preserve":"application"}',
      [simulationKey]: '[{"preserve":"simulation"}]',
    });

    expressLocalWorkInterest('school-learning-animation');
    removeLocalWorkInterest('school-learning-animation');

    expect(storage.values.get(applicationKey)).toBe('{"preserve":"application"}');
    expect(storage.values.get(simulationKey)).toBe('[{"preserve":"simulation"}]');
    expect([...storage.values.keys()]).toContain(interestKey);
  });
});
