import { safeReturnPath } from '@/lib/supabase/urls';

export type CredentialIntent = 'sign-in' | 'sign-up';

export interface CredentialValidation {
  email: string;
  password: string;
  intent: CredentialIntent;
  next: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

// Returns a user-facing message, or null when the credentials are acceptable.
export function validateCredentials(
  input: { email: string; password: string; intent: CredentialIntent },
): string | null {
  const email = input.email.trim();
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  const minLength = input.intent === 'sign-up' ? MIN_PASSWORD_LENGTH : 1;
  if (input.password.length < minLength || input.password.length > MAX_PASSWORD_LENGTH) {
    return input.intent === 'sign-up'
      ? `Choose a password between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`
      : 'Enter your password.';
  }
  return null;
}

export function readCredentialFormData(formData: FormData): CredentialValidation {
  const intent: CredentialIntent = formData.get('intent') === 'sign-up' ? 'sign-up' : 'sign-in';
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    intent,
    next: safeReturnPath(String(formData.get('next') ?? '/workspace')),
  };
}

// Supabase surfaces a few distinct auth failures. Distinguishing them lets the
// form tell the user what to do next instead of showing one generic message.
export function describeSignInFailure(message: string): string {
  const lowered = message.toLowerCase();
  if (lowered.includes('email not confirmed')) {
    return 'This address still needs email confirmation. Open the confirmation link sent to your inbox, then sign in.';
  }
  if (lowered.includes('invalid login credentials')) {
    return 'Email or password was not accepted. If you have not created an account yet, use "Create a basic account".';
  }
  return 'Email or password was not accepted.';
}
