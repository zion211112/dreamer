import { describe, expect, it } from 'vitest';
import {
  getStudioModuleForContext,
  getStudioModuleLabel,
  STUDIO_MODULES,
  type StudioContext,
} from './studio-navigation';

describe('Studio navigation model', () => {
  it('defines six flat workspace modules and their routes in order', () => {
    expect(STUDIO_MODULES.map(({ id, label, href, defaultContext, contexts }) => ({
      id,
      label,
      href,
      defaultContext,
      contexts,
    }))).toEqual([
      { id: 'radar', label: 'Radar', href: '/workspace/commons', defaultContext: 'commons', contexts: ['commons'] },
      { id: 'people', label: 'People', href: '/workspace/people', defaultContext: 'people', contexts: ['people', 'capabilities'] },
      { id: 'institutions', label: 'Institutions', href: '/workspace/institutions', defaultContext: 'institutions', contexts: ['institutions'] },
      { id: 'undertakings', label: 'Undertakings', href: '/workspace/workbench', defaultContext: 'workbench', contexts: ['workbench', 'field-desk'] },
      { id: 'roll', label: 'Roll', href: '/workspace/roll', defaultContext: 'roll', contexts: ['roll'] },
      { id: 'apt-coin-lab', label: 'APT Coin Lab', href: '/workspace/apt-coin-lab', defaultContext: 'apt-coin-lab', contexts: ['apt-coin-lab'] },
    ]);
  });

  it('maps every existing workspace context to its operational module', () => {
    const contexts: StudioContext[] = [
      'people',
      'capabilities',
      'institutions',
      'commons',
      'workbench',
      'field-desk',
      'roll',
      'apt-coin-lab',
    ];

    expect(contexts.map(context => [context, getStudioModuleForContext(context)])).toEqual([
      ['people', 'people'],
      ['capabilities', 'people'],
      ['institutions', 'institutions'],
      ['commons', 'radar'],
      ['workbench', 'undertakings'],
      ['field-desk', 'undertakings'],
      ['roll', 'roll'],
      ['apt-coin-lab', 'apt-coin-lab'],
    ]);
  });

  it('returns the parent module label for each context', () => {
    const contexts: StudioContext[] = [
      'people',
      'capabilities',
      'institutions',
      'commons',
      'workbench',
      'field-desk',
      'roll',
      'apt-coin-lab',
    ];

    expect(contexts.map(context => getStudioModuleLabel(context))).toEqual([
      'People',
      'People',
      'Institutions',
      'Radar',
      'Undertakings',
      'Undertakings',
      'Roll',
      'APT Coin Lab',
    ]);
  });
});
