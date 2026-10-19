import 'server-only';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import {
  getDefaultContextKey,
  getDefaultWorkspace,
  type WorkspaceContextOption,
  type WorkspaceKey,
} from '@/lib/workspace';
import { isTenderStatus } from '@/lib/tender';

export interface WorkspaceContext {
  configured: boolean;
  authenticated: boolean;
  email: string | null;
  defaultWorkspace: WorkspaceKey;
  hasSchoolMembership: boolean;
  contexts: WorkspaceContextOption[];
  defaultContextKey: string;
}

function parseWorkspaceContexts(value: unknown): WorkspaceContextOption[] {
  if (!Array.isArray(value)) throw new Error('Workspace contexts returned an invalid response.');
  const contexts: WorkspaceContextOption[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      throw new Error('Workspace contexts contain an invalid record.');
    }
    const row = item as Record<string, unknown>;
    const kind = row.context_kind;
    if (kind !== 'network' && kind !== 'funder' && kind !== 'school' && kind !== 'crew') {
      throw new Error('Workspace context contains an unknown context kind.');
    }
    const key = row.context_key;
    const label = row.context_label;
    const role = row.context_role;
    if (typeof key !== 'string' || !key || typeof label !== 'string' || !label || typeof role !== 'string') {
      throw new Error('Workspace context has missing identity fields.');
    }
    if (seen.has(key)) throw new Error('Workspace context keys must be unique.');
    seen.add(key);
    const nullableFields = ['organization_id', 'tender_id', 'tender_status', 'tender_slug', 'asset_name'] as const;
    for (const field of nullableFields) {
      if (row[field] !== null && row[field] !== undefined && typeof row[field] !== 'string') {
        throw new Error(`Workspace context has an invalid ${field} field.`);
      }
    }
    const tenderStatus = typeof row.tender_status === 'string' ? row.tender_status : null;
    if (tenderStatus && !isTenderStatus(tenderStatus)) {
      throw new Error('Workspace context has an unknown Tender lifecycle state.');
    }
    if (typeof row.is_illustrative !== 'boolean' && row.is_illustrative !== null) {
      throw new Error('Workspace context has an invalid illustrative-data marker.');
    }
    contexts.push({
      key,
      kind,
      label,
      role,
      organizationId: typeof row.organization_id === 'string' ? row.organization_id : null,
      tenderId: typeof row.tender_id === 'string' ? row.tender_id : null,
      tenderSlug: typeof row.tender_slug === 'string' ? row.tender_slug : null,
      tenderStatus,
      assetName: typeof row.asset_name === 'string' ? row.asset_name : null,
      isIllustrative: row.is_illustrative === true,
    });
  }
  if (contexts.filter(context => context.kind === 'network').length !== 1) {
    throw new Error('An authenticated workspace must have exactly one base network context.');
  }
  const kindOrder = { network: 0, funder: 1, school: 2, crew: 3 };
  return contexts.sort((left, right) =>
    kindOrder[left.kind] - kindOrder[right.kind]
    || left.label.localeCompare(right.label)
    || left.key.localeCompare(right.key)
  );
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  if (!hasSupabaseConfiguration()) {
    return {
      configured: false,
      authenticated: false,
      email: null,
      defaultWorkspace: 'apt',
      hasSchoolMembership: false,
      contexts: [],
      defaultContextKey: 'network',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(`Workspace identity could not be verified: ${authError.message}`);
  if (!auth.user) {
    return {
      configured: true,
      authenticated: false,
      email: null,
      defaultWorkspace: 'apt',
      hasSchoolMembership: false,
      contexts: [],
      defaultContextKey: 'network',
    };
  }

  const [contextsResult, preferenceResult] = await Promise.all([
    supabase.rpc('get_workspace_contexts'),
    supabase
      .from('workspace_preferences')
      .select('default_workspace')
      .eq('user_id', auth.user.id)
      .maybeSingle(),
  ]);

  if (contextsResult.error) {
    throw new Error(`Workspace contexts could not be loaded: ${contextsResult.error.message}`);
  }
  if (preferenceResult.error) {
    throw new Error(`Workspace preference could not be loaded: ${preferenceResult.error.message}`);
  }

  const contexts = parseWorkspaceContexts(contextsResult.data);
  const roles = contexts.filter(context => context.kind === 'school').map(context => context.role);
  const defaultWorkspace = getDefaultWorkspace(roles, preferenceResult.data?.default_workspace);
  const hasSchoolMembership = roles.length > 0;

  return {
    configured: true,
    authenticated: true,
    email: auth.user.email ?? null,
    defaultWorkspace,
    hasSchoolMembership,
    contexts,
    defaultContextKey: getDefaultContextKey(contexts, defaultWorkspace),
  };
}
