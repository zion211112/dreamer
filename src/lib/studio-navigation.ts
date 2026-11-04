export type StudioEnvironment = 'branch' | 'main';

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
  | 'annals'
  | 'radar'
  | 'undertakings'
  | 'roll'
  | 'apt-coin-lab'
  | 'people'
  | 'institutions';

export interface StudioNavigationModule {
  id: StudioModuleId;
  label: string;
  href: string;
  environment: StudioEnvironment;
  contexts: readonly StudioContext[];
}

export const BRANCH_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'annals',
    label: 'Annals',
    href: '/workspace/annals',
    environment: 'branch',
    contexts: ['annals'],
  },
  {
    id: 'radar',
    label: 'Radar',
    href: '/workspace/commons',
    environment: 'branch',
    contexts: ['commons'],
  },
  {
    id: 'undertakings',
    label: 'Undertakings',
    href: '/workspace/workbench',
    environment: 'branch',
    contexts: ['workbench', 'field-desk'],
  },
  {
    id: 'roll',
    label: 'Roll',
    href: '/workspace/roll',
    environment: 'branch',
    contexts: ['roll'],
  },
  {
    id: 'apt-coin-lab',
    label: 'APT Coin Lab',
    href: '/workspace/apt-coin-lab',
    environment: 'branch',
    contexts: ['apt-coin-lab'],
  },
];

export const MAIN_MODULES: readonly StudioNavigationModule[] = [
  {
    id: 'people',
    label: 'People & Crews',
    href: '/workspace/people',
    environment: 'main',
    contexts: ['people', 'capabilities'],
  },
  {
    id: 'institutions',
    label: 'Institutions & Assets',
    href: '/workspace/institutions',
    environment: 'main',
    contexts: ['institutions'],
  },
];

export const STUDIO_MODULES: readonly StudioNavigationModule[] = [
  ...BRANCH_MODULES,
  ...MAIN_MODULES,
];

export function getStudioEnvironmentForContext(context: StudioContext): StudioEnvironment {
  switch (context) {
    case 'annals':
    case 'commons':
    case 'workbench':
    case 'field-desk':
    case 'roll':
    case 'apt-coin-lab':
    case 'school-console':
      return 'branch';
    case 'people':
    case 'capabilities':
    case 'institutions':
      return 'main';
    default: {
      const exhaustiveContext: never = context;
      throw new Error(`Unsupported Studio context: ${exhaustiveContext}`);
    }
  }
}

export function getStudioModuleForContext(context: StudioContext): StudioModuleId | null {
  switch (context) {
    case 'annals':
      return 'annals';
    case 'commons':
      return 'radar';
    case 'workbench':
    case 'field-desk':
      return 'undertakings';
    case 'roll':
      return 'roll';
    case 'apt-coin-lab':
      return 'apt-coin-lab';
    case 'people':
    case 'capabilities':
      return 'people';
    case 'institutions':
      return 'institutions';
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
  const module = STUDIO_MODULES.find(destination => destination.id === moduleId);
  if (!module) throw new Error(`Studio navigation is missing module "${moduleId}".`);
  return module.label;
}

export function getStudioEnvironmentHome(environment: StudioEnvironment): string {
  return environment === 'branch' ? '/workspace/annals' : '/workspace/people';
}
