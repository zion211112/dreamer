'use server';

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';

export async function requestSignInLink(formData: FormData): Promise<{ error?: string; sent?: true }> {
  if (!hasSupabaseConfiguration()) {
    return { error: 'School sign-in is not configured for this deployment. The local Console remains available.' };
  }
  const email = String(formData.get('email') ?? '').trim();
  const next = safeReturnPath(String(formData.get('next') ?? '/console'));
  const siteOrigin = getSiteOrigin();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!siteOrigin) {
    return { error: 'The site URL is missing or invalid. Contact the site administrator.' };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) return { error: `Sign-in link could not be sent: ${error.message}` };
    return { sent: true };
  } catch (error) {
    return { error: `Sign-in link could not be sent: ${error instanceof Error ? error.message : 'Unexpected server error.'}` };
  }
}
