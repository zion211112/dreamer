'use server';

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';
import { redirect } from 'next/navigation';

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
  const email = String(formData.get('email') ?? '').trim();
  const intent = formData.get('intent') === 'sign-up' ? 'sign-up' : 'sign-in';
  const password = String(formData.get('password') ?? '');
  const next = safeReturnPath(String(formData.get('next') ?? '/workspace'));

  // Fixed admin credential for prototype access — establishes a real Supabase session.
  if (email === 'admin' && password === 'root') {
    const supabase = await createSupabaseServerClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'admin@apt-labs.local',
      password: 'root',
    });
    // Ignore sign-up error if user already exists.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@apt-labs.local',
      password: 'root',
    });
    if (error) {
      console.error(`Direct admin sign-in failed: ${error.message}`);
      return { error: 'Direct sign-in failed.' };
    }
    if (!data.session) return { error: 'A verified account session could not be established.' };
    return { authenticated: true };
  }

  if (!hasSupabaseConfiguration()) {
    return { error: 'Account access is not configured for this deployment. The local School Console remains available.' };
  }
  const siteOrigin = getSiteOrigin();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (password.length < (intent === 'sign-up' ? 12 : 1) || password.length > 128) {
    return { error: intent === 'sign-up'
      ? 'Choose a password between 12 and 128 characters.'
      : 'Enter your password.' };
  }
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
    return { error: 'Email or password was not accepted.' };
  }
  if (!data.session) return { error: 'A verified account session could not be established.' };
  return { authenticated: true };
}

export async function directSignIn(formData: FormData): Promise<void> {
  const next = safeReturnPath(String(formData.get('next') ?? '/workspace'));
  const result = await authenticateWithPassword(formData);
  if (result.authenticated) {
    redirect(next);
  }
}
