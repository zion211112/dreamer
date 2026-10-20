'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import type { TenderStatus } from '@/lib/tender';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const transitionTargets: TenderStatus[] = ['materials', 'fabrication', 'anchor_signed', 'deployed'];

export async function transitionAssembly(
  tenderId: string,
  nextStatus: TenderStatus,
): Promise<{ rollId?: string; error?: string }> {
  if (!uuidPattern.test(tenderId) || !transitionTargets.includes(nextStatus)) {
    return { error: 'Invalid Tender reference or Assembly transition.' };
  }
  const localBlock = localAuthActionBlock();
  if (localBlock) {
    return { error: localBlock };
  }
  if (!hasSupabaseConfiguration()) {
    return { error: 'Private Assembly is not configured for this deployment.' };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { error: 'Your crew session could not be verified. Sign in again before changing Assembly state.' };
    }
    const { data, error } = await supabase.rpc('transition_tender', {
      p_tender_id: tenderId,
      p_next_status: nextStatus,
    });
    if (error) return { error: `Assembly transition rejected: ${error.message}` };
    if (nextStatus === 'deployed' && typeof data !== 'string') {
      return { error: 'Deployment did not return a Roll record. The Tender state was not confirmed.' };
    }
    revalidatePath(`/assembly/${tenderId}`);
    revalidatePath('/roll');
    revalidatePath('/tenders');
    return { rollId: typeof data === 'string' ? data : undefined };
  } catch (error) {
    return { error: `Assembly transition failed: ${error instanceof Error ? error.message : 'Unexpected server error.'}` };
  }
}
