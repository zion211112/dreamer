'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import type { CommonsActionState } from '@/lib/commons-action-types';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const resourceKinds = ['blueprint', 'bom', 'cad', 'media', 'reference'];
const reportReasons = ['spam', 'unsafe', 'rights', 'privacy', 'other'];
const reviewDecisions = ['publish', 'hide', 'reject'];

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function actionError(error: unknown): CommonsActionState {
  return { error: error instanceof Error ? error.message : 'The Commons operation failed unexpectedly.' };
}

async function signedInClient() {
  const localBlock = localAuthActionBlock();
  if (localBlock) throw new Error(localBlock);
  if (!hasSupabaseConfiguration()) throw new Error('Commons contributions are unavailable because Supabase is not configured.');
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Your account could not be verified: ${error.message}`);
  if (!data.user) throw new Error('Sign in with an approved Commons account to continue.');
  return supabase;
}

export async function requestCommonsAccess(
  previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  void previousState;
  void formData;
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('request_commons_access');
    if (error) return { error: `Commons access request was not submitted: ${error.message}` };
    revalidatePath('/commons');
    return { success: 'Request received. A moderator must review it; email sign-in does not verify age or professional qualifications.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveCommonsProfile(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const displayName = field(formData, 'display_name');
  if (displayName.length > 80) return { error: 'Keep the display name to 80 characters or fewer.' };
  try {
    const supabase = await signedInClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) throw new Error(`Your account could not be verified: ${authError?.message ?? 'Sign in again.'}`);
    const { error } = await supabase.from('commons_profiles').upsert({
      user_id: data.user.id,
      display_name: displayName || 'Maker',
      public_name_consent: formData.get('public_name_consent') === 'on',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return { error: `Commons profile could not be saved: ${error.message}` };
    revalidatePath('/commons');
    revalidatePath('/commons/library');
    revalidatePath('/commons/contribute');
    return { success: 'Profile preferences saved.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function submitCommonsResource(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const title = field(formData, 'title');
  const summary = field(formData, 'summary');
  const resourceKind = field(formData, 'resource_kind');
  const sourceUrl = field(formData, 'source_url');
  const attribution = field(formData, 'attribution');
  const licenseName = field(formData, 'license_name');
  const licenseUrl = field(formData, 'license_url');
  const revision = field(formData, 'revision');
  const tenderId = field(formData, 'tender_id');
  if (!title || title.length > 180 || !summary || summary.length > 2000) {
    return { error: 'Add a title (1–180 characters) and a concise summary (1–2,000 characters).' };
  }
  if (!resourceKinds.includes(resourceKind)) return { error: 'Choose a valid resource type.' };
  for (const [label, value] of [['source', sourceUrl], ['license', licenseUrl]] as const) {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
    } catch {
      return { error: `Enter a valid public HTTP(S) ${label} URL.` };
    }
  }
  if (!attribution || attribution.length > 400 || !licenseName || licenseName.length > 120 || !revision || revision.length > 80) {
    return { error: 'Add attribution, a license name and a revision within the listed limits.' };
  }
  if (tenderId && !uuidPattern.test(tenderId)) return { error: 'The related Tender reference is invalid.' };
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('submit_commons_resource', {
      p_title: title,
      p_summary: summary,
      p_resource_kind: resourceKind,
      p_source_url: sourceUrl,
      p_attribution: attribution,
      p_license_name: licenseName,
      p_license_url: licenseUrl,
      p_revision: revision,
      p_tender_id: tenderId || null,
    });
    if (error) return { error: `Resource submission was not saved: ${error.message}` };
    revalidatePath('/commons');
    revalidatePath('/commons/library');
    return { success: 'Resource submitted for human review. It is not public until approved.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function submitCommonsPost(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const title = field(formData, 'title');
  const body = field(formData, 'body');
  const resourceIds = formData.getAll('resource_id').filter((value): value is string => typeof value === 'string');
  if (!title || title.length > 160 || !body || body.length > 5000) {
    return { error: 'Add a title (1–160 characters) and a post body (1–5,000 characters).' };
  }
  if (resourceIds.length > 5 || resourceIds.some(id => !uuidPattern.test(id)) || new Set(resourceIds).size !== resourceIds.length) {
    return { error: 'Select no more than five distinct published resources.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('submit_commons_post', {
      p_title: title,
      p_body: body,
      p_resource_ids: resourceIds,
    });
    if (error) return { error: `Post submission was not saved: ${error.message}` };
    revalidatePath('/commons');
    return { success: 'Post submitted for human review. It is not public until approved.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function submitCommonsPoll(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const question = field(formData, 'question');
  const context = field(formData, 'context');
  const options = formData.getAll('option')
    .map(value => typeof value === 'string' ? value.trim() : '')
    .filter(Boolean);
  const closesAtInput = field(formData, 'closes_at');
  const resourceIds = formData.getAll('resource_id').filter((value): value is string => typeof value === 'string');
  const closesAt = new Date(closesAtInput);
  if (!question || question.length > 160 || !context || context.length > 3000) {
    return { error: 'Add a question (1–160 characters) and context (1–3,000 characters).' };
  }
  if (options.length < 2 || options.length > 6 || options.some(option => !option || option.length > 120) ||
      new Set(options.map(option => option.toLocaleLowerCase())).size !== options.length) {
    return { error: 'Add two to six distinct options, each up to 120 characters.' };
  }
  if (!closesAtInput || !Number.isFinite(closesAt.getTime()) || closesAt.getTime() <= Date.now()) {
    return { error: 'Choose a future closing time for this advisory poll.' };
  }
  if (resourceIds.length > 5 || resourceIds.some(id => !uuidPattern.test(id)) || new Set(resourceIds).size !== resourceIds.length) {
    return { error: 'Select no more than five distinct published resources.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('submit_commons_poll', {
      p_question: question,
      p_context: context,
      p_options: options,
      p_closes_at: closesAt.toISOString(),
      p_resource_ids: resourceIds,
    });
    if (error) return { error: `Poll submission was not saved: ${error.message}` };
    revalidatePath('/commons');
    return { success: 'Advisory poll submitted for human review. It opens only after approval.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function submitCommonsComment(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const postId = field(formData, 'post_id');
  const body = field(formData, 'body');
  if (!uuidPattern.test(postId) || !body || body.length > 3000) return { error: 'Enter a comment of 1–3,000 characters.' };
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('submit_commons_comment', { p_post_id: postId, p_body: body });
    if (error) return { error: `Comment submission was not saved: ${error.message}` };
    revalidatePath(`/commons/${postId}`);
    return { success: 'Comment submitted for human review.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function castCommonsVote(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const pollId = field(formData, 'poll_id');
  const optionId = field(formData, 'option_id');
  const postId = field(formData, 'post_id');
  if (!uuidPattern.test(pollId) || !uuidPattern.test(optionId) || !uuidPattern.test(postId)) {
    return { error: 'This poll option is invalid.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('cast_commons_vote', { p_poll_id: pollId, p_option_id: optionId });
    if (error) return { error: `Vote was not recorded: ${error.message}` };
    revalidatePath(`/commons/${postId}`);
    return { success: 'Your advisory vote was recorded. It does not authorize treasury or payment decisions.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function reportCommonsContent(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const targetKind = field(formData, 'target_kind');
  const targetId = field(formData, 'target_id');
  const reason = field(formData, 'reason');
  if (!['resource', 'post', 'comment'].includes(targetKind) || !uuidPattern.test(targetId)) {
    return { error: 'The report target is invalid.' };
  }
  if (!reportReasons.includes(reason)) return { error: 'Choose a report reason.' };
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('report_commons_content', {
      p_target_kind: targetKind,
      p_target_id: targetId,
      p_reason: reason,
    });
    if (error) return { error: `Report was not submitted: ${error.message}` };
    revalidatePath('/commons/moderation');
    return { success: 'Report received for moderator review.' };
  } catch (error) {
    return actionError(error);
  }
}

export async function reviewCommonsAccessRequest(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const requestId = field(formData, 'request_id');
  const decision = field(formData, 'decision');
  const note = field(formData, 'note');
  if (!uuidPattern.test(requestId) || !['approve', 'decline'].includes(decision) || note.length > 500) {
    return { error: 'The access-request review is invalid.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('review_commons_access_request', {
      p_request_id: requestId,
      p_approve: decision === 'approve',
      p_note: note,
    });
    if (error) return { error: `Access request could not be reviewed: ${error.message}` };
    revalidatePath('/commons/moderation');
    revalidatePath('/commons');
    return { success: `Access request ${decision === 'approve' ? 'approved' : 'declined'}.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function reviewCommonsContent(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const targetKind = field(formData, 'target_kind');
  const targetId = field(formData, 'target_id');
  const decision = field(formData, 'decision');
  const note = field(formData, 'note');
  if (!['resource', 'post', 'comment'].includes(targetKind) || !uuidPattern.test(targetId) ||
      !reviewDecisions.includes(decision) || note.length > 500) {
    return { error: 'The content moderation action is invalid.' };
  }
  try {
    const supabase = await signedInClient();
    const rpcName = targetKind === 'resource'
      ? 'review_commons_resource'
      : targetKind === 'post'
        ? 'review_commons_post'
        : 'review_commons_comment';
    const rpcArgs = targetKind === 'resource'
      ? { p_resource_id: targetId, p_decision: decision, p_note: note }
      : targetKind === 'post'
        ? { p_post_id: targetId, p_decision: decision, p_note: note }
        : { p_comment_id: targetId, p_decision: decision, p_note: note };
    const { error } = await supabase.rpc(rpcName, rpcArgs);
    if (error) return { error: `Content could not be moderated: ${error.message}` };
    revalidatePath('/commons/moderation');
    revalidatePath('/commons');
    revalidatePath('/commons/library');
    revalidatePath(`/commons/${targetId}`);
    return { success: `Content ${decision === 'publish' ? 'published' : decision === 'hide' ? 'hidden' : 'rejected'}.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function reviewCommonsReport(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const reportId = field(formData, 'report_id');
  const decision = field(formData, 'decision');
  const note = field(formData, 'note');
  if (!uuidPattern.test(reportId) || !['resolve', 'dismiss'].includes(decision) || note.length > 500) {
    return { error: 'The report review is invalid.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('review_commons_report', {
      p_report_id: reportId,
      p_dismiss: decision === 'dismiss',
      p_note: note,
    });
    if (error) return { error: `Report could not be reviewed: ${error.message}` };
    revalidatePath('/commons/moderation');
    return { success: `Report ${decision === 'dismiss' ? 'dismissed' : 'resolved'}.` };
  } catch (error) {
    return actionError(error);
  }
}

export async function setCommonsContributorActive(
  _previousState: CommonsActionState,
  formData: FormData,
): Promise<CommonsActionState> {
  const userId = field(formData, 'user_id');
  const active = field(formData, 'decision');
  const note = field(formData, 'note');
  if (!uuidPattern.test(userId) || !['true', 'false'].includes(active) || note.length > 500) {
    return { error: 'The contributor status change is invalid.' };
  }
  try {
    const supabase = await signedInClient();
    const { error } = await supabase.rpc('set_commons_contributor_active', {
      p_user_id: userId,
      p_is_active: active === 'true',
      p_note: note,
    });
    if (error) return { error: `Contributor access could not be updated: ${error.message}` };
    revalidatePath('/commons/moderation');
    return { success: `Contributor access ${active === 'true' ? 'restored' : 'revoked'}.` };
  } catch (error) {
    return actionError(error);
  }
}
