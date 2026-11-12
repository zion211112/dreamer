import { describe, expect, it } from 'vitest';
import { getWorkspaceHomePersona } from './workspace-overview';

describe('Workspace Home persona', () => {
  it('provides three role-aware next steps without exposing module names', () => {
    const founder = getWorkspaceHomePersona('founder');
    const institution = getWorkspaceHomePersona('institution');

    expect(founder.actions).toHaveLength(3);
    expect(institution.actions).toHaveLength(3);
    expect(founder.actions.map(action => action.label)).not.toEqual(institution.actions.map(action => action.label));
    expect(founder.actions.every(action => !/commons|network|workbench|roll|intelligence/i.test(action.label))).toBe(true);
    expect(founder.actions.map(action => action.stage)).toEqual(['Signal', 'Capability', 'Commitment']);
    expect(founder.pathTitle).toBe('From need to undertaking');
    expect(getWorkspaceHomePersona(null).roleLabel).toBe('Member');
  });
});
