import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkItem } from '@/modules/workbench/data';

const storage = new Map<string, string>();
let workbenchData: typeof import('@/modules/workbench/data');
let intelligence: typeof import('./intelligence');

function workItem(financial: number | null): WorkItem {
  return {
    id: 'open-unpriced',
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

beforeAll(async () => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  storage.set('aptlabs:workbench-items:v1', JSON.stringify([workItem(null)]));
  workbenchData = await import('@/modules/workbench/data');
  intelligence = await import('./intelligence');
}, 30_000);

beforeEach(() => {
  workbenchData.WORK_ITEMS.value = [workItem(null)];
});

afterAll(() => vi.unstubAllGlobals());

describe('forecastPilot capital status', () => {
  it('does not report an unpriced undertaking as zero committed capital', async () => {
    const forecast = await intelligence.forecastPilot('open');

    expect(forecast.totalCapital).toBeNull();
  });

  it('keeps an empty pilot forecast at zero', async () => {
    workbenchData.WORK_ITEMS.value = [];

    const forecast = await intelligence.forecastPilot('open');

    expect(forecast.totalCapital).toBe(0);
  });
});
