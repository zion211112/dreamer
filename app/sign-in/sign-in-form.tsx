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
      if (result.authenticated) router.push(next);
    })} className="sign-in-form">
      <label>Login<input autoComplete="username" name="email" required type="text" /></label>
      <label>Password<input autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} maxLength={128} minLength={mode === 'sign-up' ? 12 : 1} name="password" required type="password" /></label>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />
      <button className="button button-primary" disabled={pending} type="submit">{pending ? 'Verifying…' : mode === 'sign-up' ? 'Create account' : 'Sign in with email'}</button>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {confirmationRequired && <p className="console-message" role="status">Account created. Check your email to confirm the address, then sign in. An account does not grant school, crew, or Commons contributor access.</p>}
      {mode === 'sign-up' && <p className="auth-provider-note">Use a unique password of at least 12 characters.</p>}
    </form>
  );
}
