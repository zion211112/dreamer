export interface WorkspaceSearchDestination {
  id: string;
  label: string;
  module: string;
  href: string;
}

export const WORKSPACE_SEARCH_DESTINATIONS: readonly WorkspaceSearchDestination[] = [
  { id: 'commons', label: 'Commons', module: 'Commons', href: '/workspace/commons' },
  { id: 'network', label: 'People & crews', module: 'Network', href: '/workspace/network/people' },
  { id: 'workbench', label: 'Find capacity', module: 'Workbench', href: '/workspace/workbench' },
  { id: 'workbench-plan', label: 'Build a work plan', module: 'Workbench', href: '/workspace/workbench/plan' },
  { id: 'workbench-examples', label: 'Local examples', module: 'Workbench', href: '/workspace/workbench/examples' },
  { id: 'workbench-field-desk', label: 'Field desk', module: 'Workbench', href: '/workspace/workbench/field-desk' },
  { id: 'workbench-school-console', label: 'School Console', module: 'Workbench', href: '/workspace/workbench/school-console' },
  { id: 'workbench-applications', label: 'Opportunities', module: 'Workbench', href: '/workspace/workbench/applications' },
  { id: 'workbench-review', label: 'Review & authorize', module: 'Workbench', href: '/workspace/workbench/review' },
  { id: 'workbench-delivery', label: 'Track delivery', module: 'Workbench', href: '/workspace/workbench/delivery' },
  { id: 'records', label: 'Roll history', module: 'Records', href: '/workspace/records/roll' },
  { id: 'intelligence', label: 'Intelligence lab', module: 'Intelligence', href: '/workspace/intelligence/coin-lab' },
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
