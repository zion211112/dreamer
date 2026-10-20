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
