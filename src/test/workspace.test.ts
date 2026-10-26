import {
  getDefaultContextKey,
  getDefaultWorkspace,
  isWorkspaceLane,
  parseWorkspaceFocus,
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
    key: 'funder:asset-1',
    kind: 'funder',
    label: 'Solar kitchen',
    role: 'funder',
    organizationId: 'school-1',
    tenderId: 'asset-1',
    tenderSlug: 'solar-kitchen',
    tenderStatus: 'open',
    assetName: 'Solar kitchen',
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

  it('recognizes only the three Network Studio panes', () => {
    expect(isWorkspaceLane('assets')).toBe(true);
    expect(isWorkspaceLane('commons')).toBe(true);
    expect(isWorkspaceLane('roll')).toBe(true);
    expect(isWorkspaceLane('demand')).toBe(false);
    expect(isWorkspaceLane('assemblies')).toBe(false);
  });

  it('defaults to an assigned crew context or the selected school context', () => {
    expect(getDefaultContextKey(contexts, 'apt')).toBe('crew:tender-1:builder');
    expect(getDefaultContextKey(contexts, 'school')).toBe('school:school-1');
    expect(getDefaultContextKey([contexts[0]], 'school')).toBe('network');
    expect(getDefaultContextKey([contexts[0], contexts[2]], 'apt')).toBe('funder:asset-1');
  });

  it('resolves only a server-provided context and falls back for stale context keys', () => {
    expect(resolveWorkspaceContext(contexts, 'crew:tender-1:builder', 'network')).toEqual({
      context: contexts[3],
      invalid: false,
    });
    expect(resolveWorkspaceContext(contexts, 'school:other-account', 'network')).toEqual({
      context: contexts[0],
      invalid: true,
    });
  });
});

describe('workspace focus parsing', () => {
  it('parses a record focus into its kind and identifier', () => {
    expect(parseWorkspaceFocus('asset:abc')).toEqual({
      kind: 'record',
      key: 'asset:abc',
      recordKind: 'asset',
      recordId: 'abc',
      queueId: null,
    });
  });

  it('parses a queue focus into its queue identifier', () => {
    expect(parseWorkspaceFocus('queue:my-applications')).toEqual({
      kind: 'queue',
      key: 'queue:my-applications',
      recordKind: null,
      recordId: null,
      queueId: 'my-applications',
    });
  });

  it('splits a record focus on the first colon only', () => {
    expect(parseWorkspaceFocus('capital_intent:xyz')).toEqual({
      kind: 'record',
      key: 'capital_intent:xyz',
      recordKind: 'capital_intent',
      recordId: 'xyz',
      queueId: null,
    });
  });

  it('refuses empty and missing focus values', () => {
    expect(parseWorkspaceFocus(null)).toBeNull();
    expect(parseWorkspaceFocus(undefined)).toBeNull();
    expect(parseWorkspaceFocus('')).toBeNull();
    expect(parseWorkspaceFocus('   ')).toBeNull();
  });

  it('refuses a focus without a kind separator', () => {
    expect(parseWorkspaceFocus('nonsense')).toBeNull();
  });

  it('refuses a focus without an identifier', () => {
    expect(parseWorkspaceFocus('asset:')).toBeNull();
    expect(parseWorkspaceFocus('queue:')).toBeNull();
  });
});
