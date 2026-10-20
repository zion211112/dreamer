'use server';

import { getSiteOrigin, safeReturnPath } from '@/lib/supabase/urls';
import { redirect } from 'next/navigation';

export async function requestOAuth(
  provider: 'google' | 'github',
  nextPath: string,
): Promise<{ url?: string; error?: string }> {
  return { error: 'Social sign-in is not configured in local development. Use the email and password form.' };
}

export async function authenticateWithPassword(formData: FormData): Promise<{
  error?: string;
  authenticated?: true;
  confirmationRequired?: true;
}> {
  const { email, password, intent, next } = readCredentialFormData(formData);

  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) {
    return { error: 'The site URL is missing or invalid. Contact the site administrator.' };
  }

  const devEmail = process.env.DEV_SIGN_IN_EMAIL;
  const devPassword = process.env.DEV_SIGN_IN_PASSWORD;

  if (!devEmail || !devPassword) {
    return {
      error: 'Local sign-in is not configured. Set DEV_SIGN_IN_EMAIL and DEV_SIGN_IN_PASSWORD in the .env file.',
    };
  }

  if (intent === 'sign-up') {
    return { error: 'Local sign-up is not available in this mode. Use the social provider or a registered admin account.' };
  }

  const validEmail = email.trim() === devEmail;
  const validPassword = password === devPassword;

  if (!validEmail || !validPassword) {
    return {
      error: 'Email or password was not accepted. Use the local development credentials set in .env (DEV_SIGN_IN_EMAIL / DEV_SIGN_IN_PASSWORD).',
    };
  }

  const nextPath = safeReturnPath(next);
  redirect(nextPath);
}

export async function requestDirectDevSignIn(formData: FormData): Promise<never> {
  const next = safeReturnPath(String(formData.get('next') ?? '/workspace'));
  const email = process.env.DEV_SIGN_IN_EMAIL;
  if (!email) {
    throw new Error('Direct development sign-in requires DEV_SIGN_IN_EMAIL to be set.');
  }
  redirect(next);
}

function readCredentialFormData(formData: FormData): { email: string; password: string; intent: 'sign-in' | 'sign-up'; next: string } {
  const intent: 'sign-in' | 'sign-up' = formData.get('intent') === 'sign-up' ? 'sign-up' : 'sign-in';
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    intent,
    next: safeReturnPath(String(formData.get('next') ?? '/workspace')),
  };
}
