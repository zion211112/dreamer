import { describe, expect, it } from 'vitest';
import {
  getStudioModuleForContext,
  getStudioModuleLabel,
  getStudioNetworkView,
  STUDIO_MODULES,
  STUDIO_NETWORK_VIEWS,
  type StudioContext,
} from './studio-navigation';

describe('Studio navigation model', () => {
  it('defines the four operational modules and their existing routes in order', () => {
    expect(STUDIO_MODULES.map(({ id, label, href, defaultContext, contexts }) => ({
      id,
      label,
      href,
      defaultContext,
      contexts,
    }))).toEqual([
      { id: 'radar', label: 'Radar', href: '/workspace/commons', defaultContext: 'commons', contexts: ['commons'] },
      { id: 'network', label: 'Network', href: '/workspace/people', defaultContext: 'people', contexts: ['people', 'institutions', 'network'] },
      { id: 'undertakings', label: 'Undertakings', href: '/workspace/workbench', defaultContext: 'workbench', contexts: ['workbench', 'field-desk'] },
      { id: 'roll', label: 'Roll', href: '/workspace/roll', defaultContext: 'roll', contexts: ['roll'] },
    ]);
  });

  it('defines Network secondary destinations without replacing existing routes', () => {
    expect(STUDIO_NETWORK_VIEWS.map(({ id, label, href, context }) => ({
      id,
      label,
      href,
      context,
    }))).toEqual([
      { id: 'institutions', label: 'Institutions', href: '/workspace/institutions', context: 'institutions' },
      { id: 'capabilities', label: 'Capability Directory', href: '/workspace/institutions/network', context: 'network' },
    ]);
  });

  it('maps every existing workspace context to its operational module', () => {
    const contexts: StudioContext[] = [
      'people',
      'institutions',
      'network',
      'commons',
      'workbench',
      'field-desk',
      'roll',
    ];

    expect(contexts.map(context => [context, getStudioModuleForContext(context)])).toEqual([
      ['people', 'network'],
      ['institutions', 'network'],
      ['network', 'network'],
      ['commons', 'radar'],
      ['workbench', 'undertakings'],
      ['field-desk', 'undertakings'],
      ['roll', 'roll'],
    ]);
  });

  it('returns the parent module label for each context', () => {
    const contexts: StudioContext[] = [
      'people',
      'institutions',
      'network',
      'commons',
      'workbench',
      'field-desk',
      'roll',
    ];

    expect(contexts.map(context => getStudioModuleLabel(context))).toEqual([
      'Network',
      'Network',
      'Network',
      'Radar',
      'Undertakings',
      'Undertakings',
      'Roll',
    ]);
  });

  it('selects the exact Network view and returns null outside Network', () => {
    expect(getStudioNetworkView('people')).toBe('people');
    expect(getStudioNetworkView('institutions')).toBe('institutions');
    expect(getStudioNetworkView('network')).toBe('capabilities');
    expect(getStudioNetworkView('commons')).toBeNull();
    expect(getStudioNetworkView('workbench')).toBeNull();
    expect(getStudioNetworkView('field-desk')).toBeNull();
    expect(getStudioNetworkView('roll')).toBeNull();
  });
});
