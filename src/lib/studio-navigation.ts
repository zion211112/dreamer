export type StudioContext =
  | 'people'
  | 'capabilities'
  | 'institutions'
  | 'commons'
  | 'workbench'
  | 'field-desk'
  | 'roll'
  | 'apt-coin-lab';

export type StudioModuleId = 'radar' | 'people' | 'institutions' | 'undertakings' | 'roll' | 'apt-coin-lab';

export interface StudioNavigationModule {
  id: StudioModuleId;
  label: string;
  href: string;
  defaultContext: StudioContext;
  contexts: readonly StudioContext[];
}

export const STUDIO_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'radar',
    label: 'Radar',
    href: '/workspace/commons',
    defaultContext: 'commons',
    contexts: ['commons'],
  },
  {
    id: 'people',
    label: 'People',
    href: '/workspace/people',
    defaultContext: 'people',
    contexts: ['people', 'capabilities'],
  },
  {
    id: 'institutions',
    label: 'Institutions',
    href: '/workspace/institutions',
    defaultContext: 'institutions',
    contexts: ['institutions'],
  },
  {
    id: 'undertakings',
    label: 'Undertakings',
    href: '/workspace/workbench',
    defaultContext: 'workbench',
    contexts: ['workbench', 'field-desk'],
  },
  {
    id: 'roll',
    label: 'Roll',
    href: '/workspace/roll',
    defaultContext: 'roll',
    contexts: ['roll'],
  },
  {
    id: 'apt-coin-lab',
    label: 'APT Coin Lab',
    href: '/workspace/apt-coin-lab',
    defaultContext: 'apt-coin-lab',
    contexts: ['apt-coin-lab'],
  },
];

export function getStudioModuleForContext(context: StudioContext): StudioModuleId {
  switch (context) {
    case 'commons':
      return 'radar';
    case 'people':
    case 'capabilities':
      return 'people';
    case 'institutions':
      return 'institutions';
    case 'workbench':
    case 'field-desk':
      return 'undertakings';
    case 'roll':
      return 'roll';
    case 'apt-coin-lab':
      return 'apt-coin-lab';
    default: {
      const exhaustiveContext: never = context;
      throw new Error(`Unsupported Studio context: ${exhaustiveContext}`);
    }
  }
}

export function getStudioModuleLabel(context: StudioContext): string {
  const moduleId = getStudioModuleForContext(context);
  const module = STUDIO_MODULES.find(destination => destination.id === moduleId);
  if (!module) throw new Error(`Studio navigation is missing module "${moduleId}".`);
  return module.label;
}
