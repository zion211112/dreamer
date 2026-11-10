import { describe, expect, it } from 'vitest';
import {
  STUDIO_FLOW_MODULES,
  STUDIO_NETWORK_VIEWS,
  STUDIO_SECONDARY_MODULES,
  getStudioContextLabel,
  getStudioModuleForContext,
  getStudioModuleLabel,
  type StudioContext,
} from './studio-navigation';

describe('Studio workspace navigation', () => {
  it('keeps the productive path primary and supporting views secondary', () => {
    expect(STUDIO_FLOW_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([
      { id: 'home', label: 'Home', href: '/workspace' },
      { id: 'commons', label: 'Commons', href: '/workspace/commons' },
      { id: 'network', label: 'Network', href: '/workspace/network/people' },
      { id: 'records', label: 'The Roll', href: '/workspace/records/roll' },
    ]);
    expect(STUDIO_FLOW_MODULES).toHaveLength(4);
    expect(STUDIO_FLOW_MODULES.some(module => module.id === 'intelligence')).toBe(false);
    expect(STUDIO_FLOW_MODULES.some(module => module.id === 'workbench')).toBe(false);

    expect(STUDIO_SECONDARY_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([]);

    expect(STUDIO_NETWORK_VIEWS).toEqual([
      { context: 'network:institutions', label: 'Institutions & assets', href: '/workspace/network/institutions' },
      { context: 'network:capabilities', label: 'Capabilities & relations', href: '/workspace/network/capabilities' },
    ]);
  });

  it('maps every workspace context to the productive module or its supporting view', () => {
    const contexts: StudioContext[] = [
      'overview',
      'commons',
      'network:people',
      'network:institutions',
      'network:capabilities',
      'records:canon',
      'records:annals',
      'records:roll',
      'intelligence',
      'intelligence:coin-lab',
    ];

    expect(contexts.map(context => [context, getStudioModuleForContext(context)])).toEqual([
      ['overview', 'home'],
      ['commons', 'commons'],
      ['network:people', 'network'],
      ['network:institutions', 'network'],
      ['network:capabilities', 'network'],
      ['records:canon', 'records'],
      ['records:annals', 'records'],
      ['records:roll', 'records'],
      ['intelligence', 'intelligence'],
      ['intelligence:coin-lab', 'intelligence'],
    ]);

    expect(getStudioModuleLabel('overview')).toBe('Home');
    expect(getStudioModuleLabel('commons')).toBe('Commons');
    expect(getStudioModuleLabel('network:people')).toBe('Network');
    expect(getStudioModuleLabel('records:roll')).toBe('The Roll');
    expect(getStudioModuleLabel('intelligence:coin-lab')).toBe('Intelligence');
    expect(getStudioContextLabel('overview')).toBe('Home');
    expect(contexts.slice(1).map(getStudioContextLabel)).toEqual(contexts.slice(1).map(getStudioModuleLabel));
  });
});