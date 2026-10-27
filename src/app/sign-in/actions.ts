'use server';

import { redirect } from 'next/navigation';
import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { createLocalSession } from '@/lib/local-auth';
import { readCredentialFormData } from '@/lib/supabase/credentials';

// The prototype is still in development and has no connected backend.
// While the local development identity is enabled, /sign-in accepts any
// email and password and stores a signed cookie in the browser only.
// Nothing is written to a server, no shared record is created, and every
// action that would write a shared record stays disabled.
export type AuthActionState = { error?: string; success?: boolean };

export async function authenticateWithPassword(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const credentials = readCredentialFormData(formData);

  if (isLocalAuthEnabled()) {
    await createLocalSession(credentials.email);
    redirect(credentials.next);
  }

  // Supabase path (not active in this prototype)
  return { error: 'Supabase Auth is not configured in this prototype.' };
}
