import { describe, expect, it } from 'vitest';
import {
  BRANCH_MODULES,
  getStudioEnvironmentForContext,
  getStudioEnvironmentHome,
  getStudioModuleForContext,
  getStudioModuleLabel,
  MAIN_MODULES,
  type StudioContext,
} from './studio-navigation';

describe('Studio environment navigation', () => {
  it('keeps Branch destinations distinct from Main destinations', () => {
    expect(BRANCH_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([
      { id: 'annals', label: 'Annals', href: '/workspace/annals' },
      { id: 'radar', label: 'Radar', href: '/workspace/commons' },
      { id: 'undertakings', label: 'Undertakings', href: '/workspace/workbench' },
      { id: 'roll', label: 'Roll', href: '/workspace/roll' },
      { id: 'apt-coin-lab', label: 'APT Coin Lab', href: '/workspace/apt-coin-lab' },
    ]);

    expect(MAIN_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([
      { id: 'people', label: 'People & Crews', href: '/workspace/people' },
      { id: 'institutions', label: 'Institutions & Assets', href: '/workspace/institutions' },
    ]);
  });

  it('maps every workspace context to the correct environment', () => {
    const contexts: StudioContext[] = [
      'annals',
      'commons',
      'workbench',
      'field-desk',
      'roll',
      'apt-coin-lab',
      'people',
      'capabilities',
      'institutions',
      'school-console',
    ];

    expect(contexts.map(context => [context, getStudioEnvironmentForContext(context)])).toEqual([
      ['annals', 'branch'],
      ['commons', 'branch'],
      ['workbench', 'branch'],
      ['field-desk', 'branch'],
      ['roll', 'branch'],
      ['apt-coin-lab', 'branch'],
      ['people', 'main'],
      ['capabilities', 'main'],
      ['institutions', 'main'],
      ['school-console', 'branch'],
    ]);
  });

  it('maps module contexts and keeps School Console contextual instead of a destination', () => {
    const contexts: StudioContext[] = [
      'annals',
      'commons',
      'workbench',
      'field-desk',
      'roll',
      'apt-coin-lab',
      'people',
      'capabilities',
      'institutions',
      'school-console',
    ];

    expect(contexts.map(context => [context, getStudioModuleForContext(context)])).toEqual([
      ['annals', 'annals'],
      ['commons', 'radar'],
      ['workbench', 'undertakings'],
      ['field-desk', 'undertakings'],
      ['roll', 'roll'],
      ['apt-coin-lab', 'apt-coin-lab'],
      ['people', 'people'],
      ['capabilities', 'people'],
      ['institutions', 'institutions'],
      ['school-console', null],
    ]);
    expect(getStudioModuleLabel('school-console')).toBe('School Console');
  });

  it('uses the environment landing views for the persistent switcher', () => {
    expect(getStudioEnvironmentHome('branch')).toBe('/workspace/annals');
    expect(getStudioEnvironmentHome('main')).toBe('/workspace/people');
  });
});
