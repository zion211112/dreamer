import { describe, expect, it } from 'vitest';
import { filterWorkspaceDestinations, type WorkspaceSearchDestination } from './workspace-search';

const destinations: WorkspaceSearchDestination[] = [
  { id: 'capacity', label: 'Find capacity', module: 'Workbench', href: '/workspace/workbench' },
  { id: 'records', label: 'Roll history', module: 'Records', href: '/workspace/records/roll' },
  { id: 'commons', label: 'Commons', module: 'Commons', href: '/workspace/commons' },
];

describe('filterWorkspaceDestinations', () => {
  it('searchesDestinationLabelsAndModuleNames', () => {
    expect(filterWorkspaceDestinations('  CAPACITY ', destinations)).toEqual([destinations[0]]);
    expect(filterWorkspaceDestinations('workbench', destinations)).toEqual([destinations[0]]);
  });

  it('returnsNoMatchesForUnknownDestination', () => {
    expect(filterWorkspaceDestinations('unavailable workflow', destinations)).toEqual([]);
  });
});
