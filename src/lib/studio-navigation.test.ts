import { describe, expect, it } from 'vitest';
import {
  STUDIO_FLOW_MODULES,
  STUDIO_NETWORK_VIEWS,
  STUDIO_SECONDARY_MODULES,
  getStudioModuleForContext,
  getStudioModuleLabel,
  type StudioContext,
} from './studio-navigation';

describe('Studio workspace navigation', () => {
  it('keeps the productive path primary and supporting views secondary', () => {
    expect(STUDIO_FLOW_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([
      { id: 'radar', label: 'Radar', href: '/workspace/commons' },
      { id: 'network', label: 'Network', href: '/workspace/people' },
      { id: 'undertakings', label: 'Undertakings', href: '/workspace/workbench' },
      { id: 'roll', label: 'Roll', href: '/workspace/roll' },
    ]);

    expect(STUDIO_SECONDARY_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([
      { id: 'annals', label: 'Annals', href: '/workspace/annals' },
      { id: 'apt-coin-lab', label: 'APT Coin Lab', href: '/workspace/apt-coin-lab' },
    ]);

    expect(STUDIO_NETWORK_VIEWS).toEqual([
      { context: 'institutions', label: 'Institutions & assets', href: '/workspace/institutions' },
      { context: 'capabilities', label: 'Capabilities & relations', href: '/workspace/institutions/network' },
    ]);
  });

  it('maps every workspace context to the productive module or its supporting view', () => {
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
      ['people', 'network'],
      ['capabilities', 'network'],
      ['institutions', 'network'],
      ['school-console', null],
    ]);

    expect(getStudioModuleLabel('school-console')).toBe('School Console');
    expect(getStudioModuleLabel('institutions')).toBe('Network');
  });
});
