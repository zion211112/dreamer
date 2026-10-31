import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createConsoleSignalLink,
  hasRegisteredInstitution,
  parseConsoleDraftId,
  readFieldSignals,
  type FieldSignal,
} from './local-workflows';

const storageKey = 'aptlabs:commons-signals:v1';

function signal(overrides: Partial<FieldSignal> = {}): FieldSignal {
  return {
    id: 'signal-1',
    institutionId: 'school-1',
    institutionName: 'Sample School',
    assetName: 'Classroom power',
    location: '',
    title: 'Power interruptions',
    details: 'Power interruptions during afternoon lessons.',
    urgency: 'routine',
    status: 'new',
    createdAt: '2026-10-31T00:00:00.000Z',
    updatedAt: '2026-10-31T00:00:00.000Z',
    updates: [],
    scenario: false,
    ...overrides,
  };
}

function stubSignalStorage(value: unknown) {
  const values = new Map([[storageKey, JSON.stringify(value)]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, stored: string) => values.set(key, stored),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('FieldSignal compatibility', () => {
  it('continues reading legacy signals with an asset name and no Console source', () => {
    const legacy = signal();
    stubSignalStorage([legacy]);

    expect(readFieldSignals()).toEqual([legacy]);
  });

  it('reads an asset-free Console-linked signal', () => {
    const linked = {
      ...signal(),
      assetName: undefined,
      sourceConsoleDraftId: 'draft/one',
    };
    delete (linked as Partial<FieldSignal>).assetName;
    stubSignalStorage([linked]);

    expect(readFieldSignals()).toEqual([linked]);
  });

  it('rejects a malformed Console source reference', () => {
    const malformed = { ...signal(), sourceConsoleDraftId: 42 };
    stubSignalStorage([malformed]);

    expect(() => readFieldSignals()).toThrow(/invalid format/i);
  });

  it('creates and parses an encoded Console handoff without creating a signal', () => {
    const link = createConsoleSignalLink('draft/one');

    expect(link).toBe('/workspace/commons?sourceConsoleDraftId=draft%2Fone');
    expect(parseConsoleDraftId('?sourceConsoleDraftId=draft%2Fone')).toBe('draft/one');
    expect(parseConsoleDraftId('?sourceConsoleDraftId=%20%20')).toBeNull();
  });

  it('requires an explicitly registered institution ID', () => {
    expect(hasRegisteredInstitution('school-1', ['school-1'])).toBe(true);
    expect(hasRegisteredInstitution('', ['school-1'])).toBe(false);
    expect(hasRegisteredInstitution('unregistered', ['school-1'])).toBe(false);
  });
});
