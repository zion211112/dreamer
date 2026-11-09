import { describe, expect, it } from 'vitest';
import { STUDIO_FLOW_MODULES, type StudioModuleId } from './studio-navigation';
import { WORKSPACE_OVERVIEW_ITEMS } from './workspace-overview';

const expectedModuleIds: StudioModuleId[] = [
  'commons',
  'network',
  'workbench',
  'records',
  'intelligence',
];

const expectedSummaries: Record<StudioModuleId, string> = {
  commons: 'Surface needs, offers, resources, opportunities, and problems for shared stewardship.',
  network: 'Understand people, crews, institutions, assets, capabilities, and relationships.',
  workbench: 'Scope, assemble, coordinate, and manage productive work.',
  records: 'Inspect structural records, event history, provenance, and supporting evidence.',
  intelligence: 'Explore the research surface; analytic tools are not connected in this workspace yet.',
};

describe('Workspace overview destinations', () => {
  it('lists each primary module exactly once in charter order', () => {
    const moduleIds = WORKSPACE_OVERVIEW_ITEMS.map(item => item.moduleId);

    expect(moduleIds).toEqual(expectedModuleIds);
    expect(new Set(moduleIds).size).toBe(expectedModuleIds.length);
  });

  it('uses the canonical navigation labels and routes with truthful summaries', () => {
    for (const item of WORKSPACE_OVERVIEW_ITEMS) {
      const module = STUDIO_FLOW_MODULES.find(candidate => candidate.id === item.moduleId);
      expect(module).toBeDefined();
      expect(item.label).toBe(module?.label);
      expect(item.href).toBe(module?.href);
      expect(item.summary).toBe(expectedSummaries[item.moduleId]);
    }
  });
});
