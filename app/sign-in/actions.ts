'use server';

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';

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
