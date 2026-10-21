'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import type { WorkspaceKey } from '@/lib/workspace';

export async function saveWorkspaceDefault(value: string): Promise<{ error?: string; saved?: true }> {
  if (value !== 'apt' && value !== 'school') {
    return { error: 'Choose one of the available workspaces.' };
  }
  const localBlock = localAuthActionBlock();
  if (localBlock) {
    return { error: localBlock };
  }
  if (!hasSupabaseConfiguration()) {
    return { error: 'Workspace preferences are unavailable because sign-in is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(`Workspace identity could not be verified: ${authError.message}`);
  if (!auth.user) return { error: 'Sign in before saving a workspace preference.' };

  const preference: { user_id: string; default_workspace: WorkspaceKey } = {
    user_id: auth.user.id,
    default_workspace: value,
  };
  const preferenceWithTimestamp = { ...preference, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from('workspace_preferences')
    .upsert(preferenceWithTimestamp, { onConflict: 'user_id' });
  if (error) return { error: `Workspace preference could not be saved: ${error.message}` };

  revalidatePath('/');
  revalidatePath('/workspace');
  return { saved: true };

}
export interface ProblemBriefInput {
  title: string;
  place?: string;
  description?: string;
}

export interface ProblemBrief {
  id: string;
  title: string;
  place: string;
  description: string;
  status: string;
  createdAt: string;
}

export async function createProblemBrief(
  input: ProblemBriefInput,
): Promise<{ brief?: ProblemBrief; error?: string }> {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const place = typeof input?.place === 'string' ? input.place.trim() : '';
  const description = typeof input?.description === 'string' ? input.description.trim() : '';

  if (title.length < 1 || title.length > 160) {
    return { error: 'Add a problem title (1–160 characters).' };
  }
  if (place.length > 160) return { error: 'Location is too long.' };
  if (description.length > 4000) return { error: 'Description is too long.' };

  const localBlock = localAuthActionBlock();
  if (localBlock) return { error: localBlock };
  if (!hasSupabaseConfiguration()) {
    return { error: 'Problem briefs are unavailable because sign-in is not configured.' };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Identity could not be verified: ${authError.message}`);
    if (!auth.user) return { error: 'Sign in before creating a problem brief.' };

    const { data, error } = await supabase
      .from('problem_briefs')
      .insert({
        user_id: auth.user.id,
        title,
        place,
        description,
        status: 'draft',
        is_illustrative: false,
      })
      .select('id, title, place, description, status, created_at')
      .single();

    if (error) return { error: `Problem brief could not be saved: ${error.message}` };
    if (!data) return { error: 'Problem brief was not returned.' };

    revalidatePath('/workspace');
    return {
      brief: {
        id: data.id,
        title: data.title,
        place: data.place ?? '',
        description: data.description ?? '',
        status: data.status,
        createdAt: data.created_at,
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Problem brief could not be saved.' };
  }
}

export async function listProblemBriefs(): Promise<{ briefs?: ProblemBrief[]; error?: string }> {
  const localBlock = localAuthActionBlock();
  if (localBlock) return { briefs: [], error: localBlock };
  if (!hasSupabaseConfiguration()) return { briefs: [] };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Identity could not be verified: ${authError.message}`);
    if (!auth.user) return { briefs: [] };

    const { data, error } = await supabase
      .from('problem_briefs')
      .select('id, title, place, description, status, created_at')
      .order('created_at', { ascending: false });

    if (error) return { error: `Problem briefs could not be loaded: ${error.message}` };
    const briefs: ProblemBrief[] = (data ?? []).map(row => ({
      id: row.id,
      title: row.title,
      place: row.place ?? '',
      description: row.description ?? '',
      status: row.status,
      createdAt: row.created_at,
    }));
    return { briefs };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Problem briefs could not be loaded.' };
  }
}
