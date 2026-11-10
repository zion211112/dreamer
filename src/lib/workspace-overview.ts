export interface WorkspaceHomeStartAction {
  href: string;
  label: string;
  description: string;
}

export const WORKSPACE_HOME_START_ACTIONS: readonly WorkspaceHomeStartAction[] = [
  {
    href: '/workspace/commons',
    label: 'Open Commons',
    description: 'Browse needs, offers, opportunities, and shared knowledge.',
  },
  {
    href: '/workspace/network/people',
    label: 'Explore the network',
    description: 'Find people, crews, institutions, and capabilities to work with.',
  },
  {
    href: '/workspace/workbench',
    label: 'Open Workbench',
    description: 'Review pilot lanes and coordinated work.',
  },
  {
    href: '/workspace/records/roll',
    label: 'Review the Roll',
    description: 'Inspect durable records and supporting evidence.',
  },
  {
    href: '/workspace/intelligence',
    label: 'Open Intelligence',
    description: 'Review trust and economic intelligence research.',
  },
];
