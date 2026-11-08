export type StudioContext =
  | 'commons'
  | 'network:people'
  | 'network:institutions'
  | 'network:capabilities'
  | 'workbench'
  | 'workbench:field-desk'
  | 'workbench:school-console'
  | 'records:canon'
  | 'records:annals'
  | 'records:roll'
  | 'intelligence'
  | 'intelligence:coin-lab';

export type StudioModuleId =
  | 'commons'
  | 'network'
  | 'workbench'
  | 'records'
  | 'intelligence';

export interface StudioNavigationModule {
  id: StudioModuleId;
  label: string;
  href: string;
  contexts: readonly StudioContext[];
}

export const STUDIO_FLOW_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'commons',
    label: 'Commons',
    href: '/workspace/commons',
    contexts: ['commons'],
  },
  {
    id: 'network',
    label: 'Network',
    href: '/workspace/network/people',
    contexts: ['network:people', 'network:institutions', 'network:capabilities'],
  },
  {
    id: 'workbench',
    label: 'Workbench',
    href: '/workspace/workbench',
    contexts: ['workbench', 'workbench:field-desk', 'workbench:school-console'],
  },
  {
    id: 'records',
    label: 'Records',
    href: '/workspace/records/roll',
    contexts: ['records:canon', 'records:annals', 'records:roll'],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    href: '/workspace/intelligence/coin-lab',
    contexts: ['intelligence', 'intelligence:coin-lab'],
  },
];

export const STUDIO_SECONDARY_MODULES: readonly StudioNavigationModule[] = [];

export const STUDIO_NETWORK_VIEWS = [
  {
    context: 'network:institutions',
    label: 'Institutions & assets',
    href: '/workspace/network/institutions',
  },
  {
    context: 'network:capabilities',
    label: 'Capabilities & relations',
    href: '/workspace/network/capabilities',
  },
] as const;

export function getStudioModuleForContext(context: StudioContext): StudioModuleId | null {
  switch (context) {
    case 'commons':
      return 'commons';
    case 'network:people':
    case 'network:institutions':
    case 'network:capabilities':
      return 'network';
    case 'workbench':
    case 'workbench:field-desk':
    case 'workbench:school-console':
      return 'workbench';
    case 'records:canon':
    case 'records:annals':
    case 'records:roll':
      return 'records';
    case 'intelligence':
    case 'intelligence:coin-lab':
      return 'intelligence';
    default: {
      const exhaustiveContext: never = context;
      throw new Error(`Unsupported Studio context: ${exhaustiveContext}`);
    }
  }
}

export function getStudioModuleLabel(context: StudioContext): string {
  const moduleId = getStudioModuleForContext(context);
  if (!moduleId) return 'Unknown';
  const module = STUDIO_FLOW_MODULES.find(destination => destination.id === moduleId);
  if (!module) throw new Error(`Studio navigation is missing module "${moduleId}".`);
  return module.label;
}
