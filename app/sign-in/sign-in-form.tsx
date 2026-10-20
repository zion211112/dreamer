'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateWithPassword } from './actions';

export function SignInForm({ next, mode = 'sign-in' }: { next: string; mode?: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form action={formData => startTransition(async () => {
      setError('');
      setConfirmationRequired(false);
      const result = await authenticateWithPassword(formData);
      if (result.error) setError(result.error);
      if (result.confirmationRequired) setConfirmationRequired(true);
      if (result.authenticated) { onSuccess?.(); router.push(next); }
    })} className="sign-in-form">
      <label>Email<input autoComplete="username" name="email" required type="email" /></label>
      <label>Password<input autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} name="password" required type="password" /></label>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />
      <button className="button button-primary" disabled={pending} type="submit">{pending ? 'Verifying…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {confirmationRequired && <p className="console-message" role="status">Local development account credentials are set in the .env file (DEV_SIGN_IN_EMAIL / DEV_SIGN_IN_PASSWORD).</p>}
      {mode === 'sign-up' && <p className="auth-provider-note">Local dev accounts are created by the site administrator. Contact your admin for credentials.</p>}
    </form>
  );
}
