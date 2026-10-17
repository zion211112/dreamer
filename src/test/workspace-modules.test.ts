import { describe, expect, it } from 'vitest';
import { modules } from '@/lib/workspace-data';
import { moduleRecords, moduleInfo } from '@/lib/module-records';

describe('APT-LABS module surfaces', () => {
  for (const name of ['Kernel', 'Network', 'Builds', 'Operations', 'Research'] as const) {
    it(`${name} has selectable records for each explorer page`, () => {
      const module = modules.find(m => m.name === name);
      expect(module).toBeDefined();
      expect(moduleInfo[name].namespace).toBe(`apt.${name.toLowerCase()}`);
      for (const page of module?.pages ?? []) {
        if (name === 'Kernel' && page === 'Overview') continue;
        const records = moduleRecords[name][page];
        expect(records?.length).toBeGreaterThan(0);
        if (!records) throw new Error(`Missing records for ${name} / ${page}`);
        expect(new Set(records.map(r => r.id)).size).toBe(records.length);
      }
    });
  }
});
