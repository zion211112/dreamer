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

export type WorkspaceFocus = {
  kind: 'record' | 'queue';
  key: string;
  recordKind: string | null;
  recordId: string | null;
  queueId: string | null;
};

// The Studio addresses a record with `kind:id` and a queue with `queue:id`.
// Parsing lives here so the URL contract has one owner, and so an unknown
// kind is refused rather than resolved to something arbitrary.
export function parseWorkspaceFocus(value: string | null | undefined): WorkspaceFocus | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith('queue:')) {
    const queueId = raw.slice('queue:'.length);
    if (!queueId) return null;
    return { kind: 'queue', key: raw, recordKind: null, recordId: null, queueId };
  }
  const separator = raw.indexOf(':');
  if (separator <= 0) return null;
  const recordKind = raw.slice(0, separator);
  const recordId = raw.slice(separator + 1);
  if (!recordId) return null;
  return { kind: 'record', key: raw, recordKind, recordId, queueId: null };
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
