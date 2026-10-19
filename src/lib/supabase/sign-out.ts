'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  if (hasSupabaseConfiguration()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error(`Sign-out failed: ${error.message}`);
  }
  redirect('/');
}
