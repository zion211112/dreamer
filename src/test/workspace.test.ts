import {
  getDefaultContextKey,
  getDefaultWorkspace,
  getWorkspaceHref,
  resolveWorkspaceContext,
  type WorkspaceContextOption,
} from '@/lib/workspace';

const contexts: WorkspaceContextOption[] = [
  {
    key: 'network',
    kind: 'network',
    label: 'Network Member',
    role: 'member',
    organizationId: null,
    tenderId: null,
    tenderSlug: null,
    tenderStatus: null,
    assetName: null,
    isIllustrative: false,
  },
  {
    key: 'school:school-1',
    kind: 'school',
    label: 'Kirinyaga Boys',
    role: 'principal',
    organizationId: 'school-1',
    tenderId: null,
    tenderSlug: null,
    tenderStatus: null,
    assetName: null,
    isIllustrative: false,
  },
  {
    key: 'crew:tender-1:builder',
    kind: 'crew',
    label: 'Water pump',
    role: 'builder',
    organizationId: 'school-1',
    tenderId: 'tender-1',
    tenderSlug: 'water-pump',
    tenderStatus: 'fabrication',
    assetName: 'Water pump',
    isIllustrative: false,
  },
];

describe('workspace selection', () => {
  it('prefers school contexts for school members when no preference is saved', () => {
    expect(getDefaultWorkspace(['teacher'], null)).toBe('school');
    expect(getDefaultWorkspace(['principal'], undefined)).toBe('school');
    expect(getDefaultWorkspace(['tender_issuer'], null)).toBe('school');
  });

  it('defaults basic network identities to APT-LABS', () => {
    expect(getDefaultWorkspace([], null)).toBe('apt');
    expect(getDefaultWorkspace(['unrecognized'], null)).toBe('apt');
  });

  it('uses a saved preference only to choose a workspace destination', () => {
    expect(getDefaultWorkspace(['teacher'], 'apt')).toBe('apt');
    expect(getDefaultWorkspace([], 'school')).toBe('school');
    expect(getDefaultWorkspace([], 'anchor')).toBe('apt');
  });

  it('maps product context to its route without granting access', () => {
    expect(getWorkspaceHref('apt')).toBe('/workspace');
    expect(getWorkspaceHref('school')).toBe('/console');
  });

  it('defaults to an assigned crew context or the selected school context', () => {
    expect(getDefaultContextKey(contexts, 'apt')).toBe('crew:tender-1:builder');
    expect(getDefaultContextKey(contexts, 'school')).toBe('school:school-1');
    expect(getDefaultContextKey([contexts[0]], 'school')).toBe('network');
  });

  it('resolves only a server-provided context and falls back for stale context keys', () => {
    expect(resolveWorkspaceContext(contexts, 'crew:tender-1:builder', 'network')).toEqual({
      context: contexts[2],
      invalid: false,
    });
    expect(resolveWorkspaceContext(contexts, 'school:other-account', 'network')).toEqual({
      context: contexts[0],
      invalid: true,
    });
  });
});
