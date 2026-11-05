export type StudioContext =
  | 'annals'
  | 'people'
  | 'capabilities'
  | 'institutions'
  | 'school-console'
  | 'commons'
  | 'workbench'
  | 'field-desk'
  | 'roll'
  | 'apt-coin-lab';

export type StudioModuleId =
  | 'radar'
  | 'network'
  | 'undertakings'
  | 'roll'
  | 'annals'
  | 'apt-coin-lab'
  ;

export interface StudioNavigationModule {
  id: StudioModuleId;
  label: string;
  href: string;
  contexts: readonly StudioContext[];
}

export const STUDIO_FLOW_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'radar',
    label: 'Radar',
    href: '/workspace/commons',
    contexts: ['commons'],
  },
  {
    id: 'network',
    label: 'Network',
    href: '/workspace/people',
    contexts: ['people', 'institutions', 'capabilities'],
  },
  {
    id: 'undertakings',
    label: 'Undertakings',
    href: '/workspace/workbench',
    contexts: ['workbench', 'field-desk'],
  },
  {
    id: 'roll',
    label: 'Roll',
    href: '/workspace/roll',
    contexts: ['roll'],
  },
];

export const STUDIO_SECONDARY_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'annals',
    label: 'Annals',
    href: '/workspace/annals',
    contexts: ['annals'],
  },
  {
    id: 'apt-coin-lab',
    label: 'APT Coin Lab',
    href: '/workspace/apt-coin-lab',
    contexts: ['apt-coin-lab'],
  },
];

export const STUDIO_NETWORK_VIEWS = [
  {
    context: 'institutions',
    label: 'Institutions & assets',
    href: '/workspace/institutions',
  },
  {
    context: 'capabilities',
    label: 'Capabilities & relations',
    href: '/workspace/institutions/network',
  },
] as const;

export function getStudioModuleForContext(context: StudioContext): StudioModuleId | null {
  switch (context) {
    case 'commons':
      return 'radar';
    case 'people':
    case 'capabilities':
    case 'institutions':
      return 'network';
    case 'workbench':
    case 'field-desk':
      return 'undertakings';
    case 'roll':
      return 'roll';
    case 'annals':
      return 'annals';
    case 'apt-coin-lab':
      return 'apt-coin-lab';
    case 'school-console':
      return null;
    default: {
      const exhaustiveContext: never = context;
      throw new Error(`Unsupported Studio context: ${exhaustiveContext}`);
    }
  }
}

export function getStudioModuleLabel(context: StudioContext): string {
  if (context === 'school-console') return 'School Console';
  const moduleId = getStudioModuleForContext(context);
  const module = [...STUDIO_FLOW_MODULES, ...STUDIO_SECONDARY_MODULES]
    .find(destination => destination.id === moduleId);
  if (!module) throw new Error(`Studio navigation is missing module "${moduleId}".`);
  return module.label;
}
