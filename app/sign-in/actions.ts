'use server';

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';
import { describeSignInFailure, readCredentialFormData, validateCredentials } from '@/lib/supabase/credentials';

export async function requestOAuth(
  provider: 'google' | 'github',
  nextPath: string,
): Promise<{ url?: string; error?: string }> {
  if (!hasSupabaseConfiguration()) {
    return { error: 'Social sign-in is unavailable until account services are configured.' };
  }
  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) return { error: 'The site URL is missing or invalid. Contact the site administrator.' };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(safeReturnPath(nextPath))}`,
      },
    });
    if (error) {
      console.error(`OAuth request failed (${provider}): ${error.message}`);
      return { error: `${provider === 'google' ? 'Google' : 'GitHub'} sign-in could not be started. Check provider configuration or try again later.` };
    }
    if (!data.url) return { error: 'The identity provider did not return a sign-in URL.' };
    return { url: data.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Social sign-in could not be started.' };
  }
}

export async function authenticateWithPassword(formData: FormData): Promise<{
  error?: string;
  authenticated?: true;
  confirmationRequired?: true;
}> {
  const { email, password, intent, next } = readCredentialFormData(formData);

  if (!hasSupabaseConfiguration()) {
    return { error: 'Account access is not configured for this deployment. The local School Console remains available.' };
  }
  const siteOrigin = getSiteOrigin();
  const invalid = validateCredentials({ email, password, intent });
  if (invalid) return { error: invalid };
  if (!siteOrigin) {
    return { error: 'The site URL is missing or invalid. Contact the site administrator.' };
  }
  const supabase = await createSupabaseServerClient();
  if (intent === 'sign-up') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      console.error(`Password account creation failed: ${error.message}`);
      return { error: 'The account could not be created. Check the address or try again later.' };
    }
    return data.session ? { authenticated: true } : { confirmationRequired: true };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`Password sign-in failed: ${error.message}`);
    return { error: describeSignInFailure(error.message) };
  }
  if (!data.session) return { error: 'A verified account session could not be established.' };
  return { authenticated: true };
}

/**
 * One-click sign-in for local development only.
 *
 * Deliberately not compiled into a production session: the action refuses unless the
 * server is running `next dev`, and the credentials come from environment variables
 * rather than source control. This replaces the earlier hard-coded admin login that
 * had to be reverted because the password shipped with the code.
 */
export async function devSignIn(nextPath: string): Promise<{ error?: string; authenticated?: true }> {
  if (process.env.NODE_ENV !== 'development') {
    return { error: 'Development sign-in is unavailable in this environment.' };
  }
  const email = process.env.DEV_SIGN_IN_EMAIL;
  const password = process.env.DEV_SIGN_IN_PASSWORD;
  if (!email || !password) {
    return { error: 'Development sign-in is not configured. Set DEV_SIGN_IN_EMAIL and DEV_SIGN_IN_PASSWORD.' };
  }
  if (!hasSupabaseConfiguration()) {
    return { error: 'Account access is not configured for this deployment.' };
  }
  const next = safeReturnPath(nextPath);
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(`Development sign-in failed: ${error.message}`);
      return { error: 'Development sign-in failed. Check DEV_SIGN_IN_EMAIL and DEV_SIGN_IN_PASSWORD.' };
    }
    if (!data.session) return { error: 'A verified account session could not be established.' };
    return { authenticated: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Development sign-in could not be started.' };
  }
}
