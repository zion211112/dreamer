import { describe, expect, it } from 'vitest';
import {
  filterWorkspaceDestinations,
  WORKSPACE_SEARCH_DESTINATIONS,
  type WorkspaceSearchDestination,
} from './workspace-search';

const destinations: WorkspaceSearchDestination[] = [
  { id: 'capacity', label: 'Find capacity', module: 'Workbench', href: '/workspace/workbench' },
  { id: 'records', label: 'Roll history', module: 'Records', href: '/workspace/records/roll' },
  { id: 'commons', label: 'Commons', module: 'Commons', href: '/workspace/commons' },
];

describe('filterWorkspaceDestinations', () => {
  it('exposesOnlyImplementedWorkbenchDestinations', () => {
    expect(WORKSPACE_SEARCH_DESTINATIONS).toEqual(expect.arrayContaining([
      { id: 'workbench-plan', label: 'Build a work plan', module: 'Workbench', href: '/workspace/workbench/plan' },
      { id: 'workbench-examples', label: 'Local examples', module: 'Workbench', href: '/workspace/workbench/examples' },
      { id: 'workbench-field-desk', label: 'Field desk', module: 'Workbench', href: '/workspace/workbench/field-desk' },
      { id: 'workbench-school-console', label: 'School Console', module: 'Workbench', href: '/workspace/assets/school-console' },
      { id: 'workbench-applications', label: 'Opportunities', module: 'Workbench', href: '/workspace/workbench/applications' },
      { id: 'workbench-review', label: 'Review & authorize', module: 'Workbench', href: '/workspace/workbench/review' },
      { id: 'workbench-delivery', label: 'Track delivery', module: 'Workbench', href: '/workspace/workbench/delivery' },
    ]));
  });

  it('searchesDestinationLabelsAndModuleNames', () => {
    expect(filterWorkspaceDestinations('  CAPACITY ', destinations)).toEqual([destinations[0]]);
    expect(filterWorkspaceDestinations('workbench', destinations)).toEqual([destinations[0]]);
  });

  it('returnsNoMatchesForUnknownDestination', () => {
    expect(filterWorkspaceDestinations('unavailable workflow', destinations)).toEqual([]);
  });
});
