export interface WorkspaceSearchDestination {
  id: string;
  label: string;
  module: string;
  href: string;
}

export const WORKSPACE_SEARCH_DESTINATIONS: readonly WorkspaceSearchDestination[] = [
  { id: 'home', label: 'Home', module: 'Home', href: '/workspace' },
  { id: 'commons', label: 'Commons', module: 'Commons', href: '/workspace/commons' },
  { id: 'network', label: 'People & crews', module: 'Network', href: '/workspace/network/people' },
  { id: 'records', label: 'The Roll', module: 'The Roll', href: '/workspace/records/roll' },
];

export function filterWorkspaceDestinations(
  query: string,
  destinations: readonly WorkspaceSearchDestination[],
): WorkspaceSearchDestination[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...destinations];

  return destinations.filter(destination => (
    `${destination.label} ${destination.module}`.toLocaleLowerCase().includes(normalizedQuery)
  ));
}
