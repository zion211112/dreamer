export type WorkspaceKey = 'apt' | 'school';
export type WorkspaceContextKind = 'network' | 'funder' | 'school' | 'crew';

export interface WorkspaceContextOption {
  key: string;
  kind: WorkspaceContextKind;
  label: string;
  role: string;
  organizationId: string | null;
  tenderId: string | null;
  tenderSlug: string | null;
  tenderStatus: string | null;
  assetName: string | null;
  isIllustrative: boolean;
}

export type WorkspaceLane = 'assets' | 'commons' | 'roll';

export function isWorkspaceLane(value: string | null | undefined): value is WorkspaceLane {
  return value === 'assets' || value === 'commons' || value === 'roll';
}

export function getDefaultWorkspace(
  roles: readonly string[],
  preference: string | null | undefined,
): WorkspaceKey {
  if (preference === 'apt' || preference === 'school') return preference;
  return roles.some(role => ['teacher', 'principal', 'tender_issuer'].includes(role))
    ? 'school'
    : 'apt';
}

export function getDefaultContextKey(
  contexts: readonly WorkspaceContextOption[],
  defaultWorkspace: WorkspaceKey,
): string {
  const network = contexts.find(context => context.kind === 'network');
  if (defaultWorkspace === 'school') {
    return contexts.find(context => context.kind === 'school')?.key
      ?? contexts.find(context => context.kind === 'crew')?.key
      ?? contexts.find(context => context.kind === 'funder')?.key
      ?? network?.key
      ?? 'network';
  }
  return contexts.find(context => context.kind === 'crew')?.key
    ?? contexts.find(context => context.kind === 'funder')?.key
    ?? network?.key
    ?? 'network';
}

export function resolveWorkspaceContext(
  contexts: readonly WorkspaceContextOption[],
  requestedKey: string | null | undefined,
  defaultContextKey: string,
): { context: WorkspaceContextOption | null; invalid: boolean } {
  if (!contexts.length) return { context: null, invalid: Boolean(requestedKey) };
  const defaultContext = contexts.find(context => context.key === defaultContextKey) ?? contexts[0];
  if (!requestedKey) return { context: defaultContext, invalid: false };
  const requestedContext = contexts.find(context => context.key === requestedKey);
  return requestedContext
    ? { context: requestedContext, invalid: false }
    : { context: defaultContext, invalid: true };
}
