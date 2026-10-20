import 'server-only';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { isLocalAuthEnabled } from '@/lib/auth-mode';

export interface CommonsPost {
  id: string;
  title: string;
  body: string;
  post_kind: string;
  created_at: string;
  published_at: string;
  author_name: string;
}

export interface CommonsResource {
  id: string;
  title: string;
  summary: string;
  resource_kind: string;
  source_url: string;
  attribution: string;
  license_name: string;
  license_url: string;
  revision: string;
  tender_id: string | null;
  published_at: string;
}

export interface CommonsComment {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  author_name: string;
}

export interface CommonsPollOption {
  id: string;
  poll_id: string;
  label: string;
  position: number;
}

export interface CommonsPollResult {
  poll_id: string;
  option_id: string;
  vote_count: number;
}

export interface CommonsPoll {
  id: string;
  post_id: string;
  status: string;
  closes_at: string;
  options: CommonsPollOption[];
  results: CommonsPollResult[];
}

export interface CommonsIdentityState {
  configured: boolean;
  authenticated: boolean;
  contributor: boolean;
  moderator: boolean;
  contributorRequestsOpen: boolean;
  requestStatus: string | null;
  email: string | null;
  displayName: string;
  publicNameConsent: boolean;
  error: string | null;
}

export interface CommonsQuery<T> {
  configured: boolean;
  data: T | null;
  error: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requiredString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string') throw new Error(`Commons record has an invalid ${field} field.`);
  return value;
}

function nullableString(record: Record<string, unknown>, field: string): string | null {
  const value = record[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new Error(`Commons record has an invalid ${field} field.`);
  return value;
}

function requiredNumber(record: Record<string, unknown>, field: string): number {
  const value = record[field];
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) throw new Error(`Commons record has an invalid ${field} field.`);
  return number;
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Commons returned a record in an unexpected format.');
  return value;
}

function postFrom(value: unknown): CommonsPost {
  const row = record(value);
  return {
    id: requiredString(row, 'id'),
    title: requiredString(row, 'title'),
    body: requiredString(row, 'body'),
    post_kind: requiredString(row, 'post_kind'),
    created_at: requiredString(row, 'created_at'),
    published_at: requiredString(row, 'published_at'),
    author_name: requiredString(row, 'author_name'),
  };
}

function resourceFrom(value: unknown): CommonsResource {
  const row = record(value);
  return {
    id: requiredString(row, 'id'),
    title: requiredString(row, 'title'),
    summary: requiredString(row, 'summary'),
    resource_kind: requiredString(row, 'resource_kind'),
    source_url: requiredString(row, 'source_url'),
    attribution: requiredString(row, 'attribution'),
    license_name: requiredString(row, 'license_name'),
    license_url: requiredString(row, 'license_url'),
    revision: requiredString(row, 'revision'),
    tender_id: nullableString(row, 'tender_id'),
    published_at: requiredString(row, 'published_at'),
  };
}

function commentFrom(value: unknown): CommonsComment {
  const row = record(value);
  return {
    id: requiredString(row, 'id'),
    post_id: requiredString(row, 'post_id'),
    body: requiredString(row, 'body'),
    created_at: requiredString(row, 'created_at'),
    author_name: requiredString(row, 'author_name'),
  };
}

function optionFrom(value: unknown): CommonsPollOption {
  const row = record(value);
  return {
    id: requiredString(row, 'id'),
    poll_id: requiredString(row, 'poll_id'),
    label: requiredString(row, 'label'),
    position: requiredNumber(row, 'position'),
  };
}

function resultFrom(value: unknown): CommonsPollResult {
  const row = record(value);
  return {
    poll_id: requiredString(row, 'poll_id'),
    option_id: requiredString(row, 'option_id'),
    vote_count: requiredNumber(row, 'vote_count'),
  };
}

export async function getCommonsIdentityState(): Promise<CommonsIdentityState> {
  const empty: CommonsIdentityState = {
    configured: hasSupabaseConfiguration(),
    authenticated: false,
    contributor: false,
    moderator: false,
    contributorRequestsOpen: false,
    requestStatus: null,
    email: null,
    displayName: '',
    publicNameConsent: false,
    error: null,
  };
  // A local development identity has no verified Commons membership, so the
  // Commons stays read-only until a server-verified account is used.
  if (isLocalAuthEnabled()) return { ...empty, configured: false };
  if (!empty.configured) return empty;

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) return { ...empty, error: `Your Commons identity could not be verified: ${authError.message}` };
  if (!auth.user) return empty;

  const [contributorResult, requestResult, moderatorResult, requestAvailabilityResult, profileResult] = await Promise.all([
    supabase.from('commons_contributors').select('is_active').eq('user_id', auth.user.id).maybeSingle(),
    supabase.from('commons_access_requests').select('status').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.rpc('is_commons_moderator'),
    supabase.rpc('commons_contributor_requests_open'),
    supabase.from('commons_profiles').select('display_name, public_name_consent').eq('user_id', auth.user.id).maybeSingle(),
  ]);
  const failed = [contributorResult, requestResult, moderatorResult, requestAvailabilityResult, profileResult].find(result => result.error);
  if (failed?.error) return { ...empty, authenticated: true, email: auth.user.email ?? null, error: `Commons access could not be loaded: ${failed.error.message}` };

  return {
    ...empty,
    authenticated: true,
    contributor: contributorResult.data?.is_active === true,
    moderator: moderatorResult.data === true,
    contributorRequestsOpen: requestAvailabilityResult.data === true,
    requestStatus: requestResult.data?.status ?? null,
    email: auth.user.email ?? null,
    displayName: typeof profileResult.data?.display_name === 'string' ? profileResult.data.display_name : '',
    publicNameConsent: profileResult.data?.public_name_consent === true,
  };
}

export async function getCommonsActivity(): Promise<CommonsQuery<CommonsPost[]>> {
  if (!hasSupabaseConfiguration()) return { configured: false, data: [], error: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_commons_posts')
    .select('id, title, body, post_kind, created_at, published_at, author_name')
    .order('published_at', { ascending: false })
    .limit(40);
  if (error) return { configured: true, data: null, error: `Commons activity could not be loaded: ${error.message}` };
  try {
    return { configured: true, data: (data ?? []).map(postFrom), error: null };
  } catch (parseError) {
    return { configured: true, data: null, error: parseError instanceof Error ? parseError.message : 'Commons activity was malformed.' };
  }
}

export async function getCommonsLibrary(): Promise<CommonsQuery<CommonsResource[]>> {
  if (!hasSupabaseConfiguration()) return { configured: false, data: [], error: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_commons_resources')
    .select('id, title, summary, resource_kind, source_url, attribution, license_name, license_url, revision, tender_id, published_at')
    .order('published_at', { ascending: false })
    .limit(100);
  if (error) return { configured: true, data: null, error: `Commons Library could not be loaded: ${error.message}` };
  try {
    return { configured: true, data: (data ?? []).map(resourceFrom), error: null };
  } catch (parseError) {
    return { configured: true, data: null, error: parseError instanceof Error ? parseError.message : 'Commons Library data was malformed.' };
  }
}

export async function getCommonsResource(resourceId: string): Promise<CommonsQuery<CommonsResource>> {
  if (!hasSupabaseConfiguration()) return { configured: false, data: null, error: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('public_commons_resources')
    .select('id, title, summary, resource_kind, source_url, attribution, license_name, license_url, revision, tender_id, published_at')
    .eq('id', resourceId)
    .maybeSingle();
  if (error) return { configured: true, data: null, error: `Commons resource could not be loaded: ${error.message}` };
  if (!data) return { configured: true, data: null, error: 'This resource is not published or does not exist.' };
  try {
    return { configured: true, data: resourceFrom(data), error: null };
  } catch (parseError) {
    return { configured: true, data: null, error: parseError instanceof Error ? parseError.message : 'Commons resource data was malformed.' };
  }
}

export interface CommonsPostDetail {
  post: CommonsPost;
  resources: CommonsResource[];
  comments: CommonsComment[];
  poll: CommonsPoll | null;
}

export async function getCommonsPostDetail(postId: string): Promise<CommonsQuery<CommonsPostDetail>> {
  if (!hasSupabaseConfiguration()) return { configured: false, data: null, error: null };
  const supabase = await createSupabaseServerClient();
  const { data: postRow, error: postError } = await supabase
    .from('public_commons_posts')
    .select('id, title, body, post_kind, created_at, published_at, author_name')
    .eq('id', postId)
    .maybeSingle();
  if (postError) return { configured: true, data: null, error: `Commons post could not be loaded: ${postError.message}` };
  if (!postRow) return { configured: true, data: null, error: 'This post is not published or does not exist.' };

  let post: CommonsPost;
  try {
    post = postFrom(postRow);
  } catch (parseError) {
    return { configured: true, data: null, error: parseError instanceof Error ? parseError.message : 'Commons post data was malformed.' };
  }
  const [linkResult, commentResult, pollResult] = await Promise.all([
    supabase.from('public_commons_post_resources').select('resource_id').eq('post_id', postId),
    supabase.from('public_commons_comments').select('id, post_id, body, created_at, author_name').eq('post_id', postId).order('published_at', { ascending: true }).limit(100),
    supabase.from('public_commons_polls').select('id, post_id, status, closes_at').eq('post_id', postId).maybeSingle(),
  ]);
  const failed = [linkResult, commentResult, pollResult].find(result => result.error);
  if (failed?.error) return { configured: true, data: null, error: `Commons discussion details could not be loaded: ${failed.error.message}` };
  try {
    const linkedResourceIds = (linkResult.data ?? []).map(row => row.resource_id);
    const resourceResult = linkedResourceIds.length
      ? await supabase.from('public_commons_resources')
          .select('id, title, summary, resource_kind, source_url, attribution, license_name, license_url, revision, tender_id, published_at')
          .in('id', linkedResourceIds)
      : { data: [], error: null };
    if (resourceResult.error) return { configured: true, data: null, error: `Linked Commons resources could not be loaded: ${resourceResult.error.message}` };
    const pollRow = pollResult.data;
    let poll: CommonsPoll | null = null;
    if (pollRow) {
      const [optionsResult, resultsResult] = await Promise.all([
        supabase.from('public_commons_poll_options').select('id, poll_id, label, position').eq('poll_id', pollRow.id).order('position'),
        supabase.from('public_commons_poll_results').select('poll_id, option_id, vote_count').eq('poll_id', pollRow.id),
      ]);
      if (optionsResult.error || resultsResult.error) {
        const message = optionsResult.error?.message ?? resultsResult.error?.message ?? 'Unknown poll error.';
        return { configured: true, data: null, error: `Advisory poll could not be loaded: ${message}` };
      }
      poll = {
        id: pollRow.id,
        post_id: pollRow.post_id,
        status: pollRow.status,
        closes_at: pollRow.closes_at,
        options: (optionsResult.data ?? []).map(optionFrom),
        results: (resultsResult.data ?? []).map(resultFrom),
      };
    }
    return {
      configured: true,
      data: {
        post,
        resources: (resourceResult.data ?? []).map(resourceFrom),
        comments: (commentResult.data ?? []).map(commentFrom),
        poll,
      },
      error: null,
    };
  } catch (parseError) {
    return { configured: true, data: null, error: parseError instanceof Error ? parseError.message : 'Commons discussion data was malformed.' };
  }
}
