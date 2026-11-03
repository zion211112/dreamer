export type StudioContext =
  | 'people'
  | 'institutions'
  | 'network'
  | 'commons'
  | 'workbench'
  | 'field-desk'
  | 'roll';

export type StudioModuleId = 'radar' | 'network' | 'undertakings' | 'roll';
export type StudioNetworkViewId = 'people' | 'institutions' | 'capabilities';

export interface StudioNavigationModule {
  id: StudioModuleId;
  label: string;
  href: string;
  defaultContext: StudioContext;
  contexts: readonly StudioContext[];
}

export interface StudioNetworkDestination {
  id: 'institutions' | 'capabilities';
  label: string;
  href: string;
  context: StudioContext;
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
    id: 'network',
    label: 'Network',
    href: '/workspace/people',
    defaultContext: 'people',
    contexts: ['people', 'institutions', 'network'],
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
];

export const STUDIO_NETWORK_VIEWS: readonly StudioNetworkDestination[] = [
  {
    id: 'institutions',
    label: 'Institutions',
    href: '/workspace/institutions',
    context: 'institutions',
  },
  {
    id: 'capabilities',
    label: 'Capability Directory',
    href: '/workspace/institutions/network',
    context: 'network',
  },
];

export function getStudioModuleForContext(context: StudioContext): StudioModuleId {
  switch (context) {
    case 'commons':
      return 'radar';
    case 'people':
    case 'institutions':
    case 'network':
      return 'network';
    case 'workbench':
    case 'field-desk':
      return 'undertakings';
    case 'roll':
      return 'roll';
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

export function getStudioNetworkView(context: StudioContext): StudioNetworkViewId | null {
  switch (context) {
    case 'people':
      return 'people';
    case 'institutions':
      return 'institutions';
    case 'network':
      return 'capabilities';
    case 'commons':
    case 'workbench':
    case 'field-desk':
    case 'roll':
      return null;
    default: {
      const exhaustiveContext: never = context;
      throw new Error(`Unsupported Studio context: ${exhaustiveContext}`);
    }
  }
}
