'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

export type InstitutionProfileActionState = {
  error?: string;
  saved?: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveInstitutionProfile(
  organizationId: string,
  _previousState: InstitutionProfileActionState,
  formData: FormData,
): Promise<InstitutionProfileActionState> {
  if (!uuidPattern.test(organizationId)) return { error: 'Institution reference is invalid.' };
  const localBlock = localAuthActionBlock();
  if (localBlock) return { error: localBlock };
  if (!hasSupabaseConfiguration()) {
    return { error: 'Institution profiles require authenticated network services.' };
  }

  const summaryValue = formData.get('summary');
  if (typeof summaryValue !== 'string') return { error: 'Enter a public summary.' };
  const summary = summaryValue.trim();
  const published = formData.get('published') === 'on';
  if (summary.length > 320) return { error: 'Summaries must be 320 characters or fewer.' };
  if (published && !summary) return { error: 'Add a short public summary before publishing.' };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Your identity could not be verified: ${authError.message}`);
    if (!auth.user) return { error: 'Sign in as an institution principal to manage this profile.' };

    const { error } = await supabase.rpc('set_organization_directory_profile', {
      p_organization_id: organizationId,
      p_public_summary: summary || null,
      p_published: published,
    });
    if (error) return { error: `Institution profile was not saved: ${error.message}` };

    revalidatePath('/tenders');
    return { saved: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Institution profile could not be saved.',
    };
  }
}
