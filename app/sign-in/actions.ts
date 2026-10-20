'use server';

import { safeReturnPath } from '@/lib/supabase/urls';
import { redirect } from 'next/navigation';

export async function authenticateWithPassword(formData: FormData): Promise<{
  error?: string;
  authenticated?: true;
  confirmationRequired?: true;
}> {
  const { email, password, next } = readCredentialFormData(formData);

  // Local prototype sign-in: any email and password accepted.
  // The workspace grants/crews are still enforced server-side.
  if (!next) {
    return { error: 'Redirect path is missing.' };
  }

  const authenticated = Boolean(email.trim()) && Boolean(password);

  if (!authenticated) {
    return { error: 'Please enter both an email and a password.' };
  }

  const nextPath = safeReturnPath(next);
  redirect(nextPath);
}

function readCredentialFormData(formData: FormData): { email: string; password: string; next: string } {
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    next: safeReturnPath(String(formData.get('next') ?? '/workspace')),
  };
}
