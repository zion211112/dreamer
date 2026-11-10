export interface WorkspaceHomeStartAction {
  href: string;
  label: string;
  description: string;
}

export const WORKSPACE_HOME_START_ACTIONS: readonly WorkspaceHomeStartAction[] = [
  {
    href: '/workspace/network/people',
    label: 'Explore the network',
    description: 'Find people, crews, institutions, and capabilities to work with.',
  },
];
