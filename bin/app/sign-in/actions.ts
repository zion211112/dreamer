'use server';

import { redirect } from 'next/navigation';
import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { createLocalSession } from '@/lib/local-auth';
import { describeSignInFailure, readCredentialFormData } from '@/lib/supabase/credentials';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';

export interface AuthActionState {
  error?: string;
}

export async function authenticateWithPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password, next } = readCredentialFormData(formData);

  if (!email || !password) {
    return { error: 'Please enter both an email and a password.' };
  }

  // The prototype has no connected backend yet. A local development identity
  // is signed into the browser only, so the Studio opens without a server
  // session. It grants no shared permission.
  if (isLocalAuthEnabled()) {
    await createLocalSession(email);
    redirect(next);
  }

  if (!hasSupabaseConfiguration()) {
    return { error: 'Sign-in is not configured for this deployment.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: describeSignInFailure(error.message) };
  if (!data.user) return { error: 'Sign-in did not return an account session.' };

  redirect(next);
}
