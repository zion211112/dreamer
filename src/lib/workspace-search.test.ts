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
  it('exposesImplementedWorkspaceDestinations', () => {
    expect(WORKSPACE_SEARCH_DESTINATIONS).toEqual([
      { id: 'home', label: 'Home', module: 'Home', href: '/workspace' },
      { id: 'commons', label: 'Commons', module: 'Commons', href: '/workspace/commons' },
      { id: 'network', label: 'People & crews', module: 'Network', href: '/workspace/network/people' },
      { id: 'workbench', label: 'Pilot lanes', module: 'Workbench', href: '/workspace/workbench' },
      { id: 'records', label: 'The Roll', module: 'The Roll', href: '/workspace/records/roll' },
      { id: 'intelligence', label: 'Intelligence', module: 'Intelligence', href: '/workspace/intelligence' },
    ]);
  });

  it('searchesDestinationLabelsAndModuleNames', () => {
    expect(filterWorkspaceDestinations('  CAPACITY ', destinations)).toEqual([destinations[0]]);
    expect(filterWorkspaceDestinations('workbench', destinations)).toEqual([destinations[0]]);
  });

  it('returnsNoMatchesForUnknownDestination', () => {
    expect(filterWorkspaceDestinations('unavailable workflow', destinations)).toEqual([]);
  });
});
