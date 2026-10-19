'use server';

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';

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

export async function requestAuthLink(formData: FormData): Promise<{ error?: string; sent?: true }> {
  if (!hasSupabaseConfiguration()) {
    return { error: 'Account access is not configured for this deployment. The local School Console remains available.' };
  }
  const email = String(formData.get('email') ?? '').trim();
  const intent = formData.get('intent') === 'sign-up' ? 'sign-up' : 'sign-in';
  const next = safeReturnPath(String(formData.get('next') ?? '/workspace'));
  const siteOrigin = getSiteOrigin();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!siteOrigin) {
    return { error: 'The site URL is missing or invalid. Contact the site administrator.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: intent === 'sign-up',
      emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    console.error(`Account link request failed (${intent}): ${error.message}`);
    return { error: 'The account link could not be requested. Check the address or try again later.' };
  }
  return { sent: true };
}
