'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireMember(): Promise<{ supabase?: Awaited<ReturnType<typeof createSupabaseServerClient>>; error?: string }> {
  const localBlock = localAuthActionBlock();
  if (localBlock) return { error: localBlock };
  if (!hasSupabaseConfiguration()) return { error: 'Live Commons actions are unavailable until network services are configured.' };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Your account could not be verified: ${error.message}`);
  if (!data.user) return { error: 'Sign in with Google, GitHub, or email before continuing.' };
  return { supabase };
}

export async function publishOpportunity(input: {
  tenderId: string;
  roleTitle: string;
  description: string;
  skills: string;
}): Promise<{ id?: string; error?: string }> {
  if (!uuidPattern.test(input.tenderId)) return { error: 'Choose a valid published Asset.' };
  const roleTitle = input.roleTitle.trim();
  const description = input.description.trim();
  const skillTags = [...new Set(input.skills.split(',').map(skill => skill.trim()).filter(Boolean))];
  if (roleTitle.length < 2 || roleTitle.length > 120 || description.length < 20 || description.length > 3000) {
    return { error: 'Add a role title and a 20–3000 character scope.' };
  }
  if (skillTags.length > 12 || skillTags.some(skill => skill.length > 40)) {
    return { error: 'Use up to 12 skill tags, each no longer than 40 characters.' };
  }

  try {
    const { supabase, error: memberError } = await requireMember();
    if (memberError || !supabase) return { error: memberError ?? 'Your identity could not be verified.' };
    const { data, error } = await supabase.rpc('publish_commons_opportunity', {
      p_tender_id: input.tenderId,
      p_role_title: roleTitle,
      p_description: description,
      p_skill_tags: skillTags,
    });
    if (error) return { error: `The opportunity was not published: ${error.message}` };
    if (typeof data !== 'string') return { error: 'The Commons did not return an opportunity reference.' };
    revalidatePath('/commons/opportunities');
    revalidatePath('/workspace');
    return { id: data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The opportunity could not be published.' };
  }
}

export async function applyToOpportunity(input: {
  opportunityId: string;
  note: string;
  shareRollProfile: boolean;
}): Promise<{ id?: string; error?: string }> {
  if (!uuidPattern.test(input.opportunityId)) return { error: 'Choose a valid opportunity.' };
  const note = input.note.trim();
  if (note.length < 20 || note.length > 2000) return { error: 'Your introduction must be between 20 and 2000 characters.' };
  try {
    const { supabase, error: memberError } = await requireMember();
    if (memberError || !supabase) return { error: memberError ?? 'Your identity could not be verified.' };
    const { data, error } = await supabase.rpc('apply_to_commons_opportunity', {
      p_opportunity_id: input.opportunityId,
      p_note: note,
      p_share_roll_profile: input.shareRollProfile,
    });
    if (error) return { error: `Your application was not submitted: ${error.message}` };
    if (typeof data !== 'string') return { error: 'The Commons did not return an application reference.' };
    revalidatePath('/commons/opportunities');
    revalidatePath('/workspace');
    return { id: data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Your application could not be submitted.' };
  }
}

export async function reviewOpportunityApplication(input: {
  applicationId: string;
  status: 'reviewed' | 'declined';
}): Promise<{ success?: true; error?: string }> {
  if (!uuidPattern.test(input.applicationId)) return { error: 'Application reference is invalid.' };
  try {
    const { supabase, error: memberError } = await requireMember();
    if (memberError || !supabase) return { error: memberError ?? 'Your identity could not be verified.' };
    const { error } = await supabase.rpc('review_commons_application', {
      p_application_id: input.applicationId,
      p_status: input.status,
    });
    if (error) return { error: `Application review was not saved: ${error.message}` };
    revalidatePath('/commons/opportunities');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Application review could not be saved.' };
  }
}
