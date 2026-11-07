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
      { id: 'commons', label: 'Commons', href: '/workspace/commons' },
      { id: 'network', label: 'Network', href: '/workspace/network/people' },
      { id: 'workbench', label: 'Workbench', href: '/workspace/workbench' },
      { id: 'records', label: 'Records', href: '/workspace/records/roll' },
      { id: 'intelligence', label: 'Intelligence', href: '/workspace/intelligence/coin-lab' },
    ]);
    expect(STUDIO_FLOW_MODULES).toHaveLength(5);
    expect(STUDIO_FLOW_MODULES.find(module => module.id === 'workbench')?.contexts).toEqual([
      'workbench',
      'workbench:plan',
      'workbench:examples',
      'workbench:field-desk',
      'workbench:school-console',
      'workbench:applications',
      'workbench:review',
      'workbench:delivery',
    ]);

    expect(STUDIO_SECONDARY_MODULES.map(({ id, label, href }) => ({ id, label, href }))).toEqual([]);

    expect(STUDIO_NETWORK_VIEWS).toEqual([
      { context: 'network:institutions', label: 'Institutions & assets', href: '/workspace/network/institutions' },
      { context: 'network:capabilities', label: 'Capabilities & relations', href: '/workspace/network/capabilities' },
    ]);
  });

  it('maps every workspace context to the productive module or its supporting view', () => {
    const contexts: StudioContext[] = [
      'commons',
      'network:people',
      'network:institutions',
      'network:capabilities',
      'workbench',
      'workbench:plan',
      'workbench:examples',
      'workbench:field-desk',
      'workbench:school-console',
      'workbench:applications',
      'workbench:review',
      'workbench:delivery',
      'records:canon',
      'records:annals',
      'records:roll',
      'intelligence',
      'intelligence:coin-lab',
    ];

    expect(contexts.map(context => [context, getStudioModuleForContext(context)])).toEqual([
      ['commons', 'commons'],
      ['network:people', 'network'],
      ['network:institutions', 'network'],
      ['network:capabilities', 'network'],
      ['workbench', 'workbench'],
      ['workbench:plan', 'workbench'],
      ['workbench:examples', 'workbench'],
      ['workbench:field-desk', 'workbench'],
      ['workbench:school-console', 'workbench'],
      ['workbench:applications', 'workbench'],
      ['workbench:review', 'workbench'],
      ['workbench:delivery', 'workbench'],
      ['records:canon', 'records'],
      ['records:annals', 'records'],
      ['records:roll', 'records'],
      ['intelligence', 'intelligence'],
      ['intelligence:coin-lab', 'intelligence'],
    ]);

    expect(getStudioModuleLabel('commons')).toBe('Commons');
    expect(getStudioModuleLabel('network:people')).toBe('Network');
    expect(getStudioModuleLabel('records:roll')).toBe('Records');
    expect(getStudioModuleLabel('intelligence:coin-lab')).toBe('Intelligence');
  });
});