import { describe, expect, it } from 'vitest';
import { WORKSPACE_HOME_START_ACTIONS } from './workspace-overview';

describe('Workspace Home starting actions', () => {
  it('offers only the real Network entry point instead of duplicating primary navigation', () => {
    expect(WORKSPACE_HOME_START_ACTIONS).toEqual([
      {
        href: '/workspace/network/people',
        label: 'Explore the network',
        description: 'Find people, crews, institutions, and capabilities to work with.',
      },
    ]);
  });
});
