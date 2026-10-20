'use server';

import { redirect } from 'next/navigation';
import { clearLocalSession } from '@/lib/local-auth';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  await clearLocalSession();
  if (hasSupabaseConfiguration()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signOut();
      if (error) console.error(`Sign-out failed: ${error.message}`);
    } catch (error) {
      console.error(`Sign-out failed: ${error instanceof Error ? error.message : 'Unexpected error.'}`);
    }
  }
  redirect('/');
}
