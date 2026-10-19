'use client';

import { useState, useTransition } from 'react';
import { requestAuthLink } from './actions';

export function SignInForm({ next, mode = 'sign-in' }: { next: string; mode?: 'sign-in' | 'sign-up' }) {
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form action={formData => startTransition(async () => {
      setError('');
      setSent(false);
      const result = await requestAuthLink(formData);
      if (result.error) setError(result.error);
      if (result.sent) setSent(true);
    })} className="sign-in-form">
      <label>Email address<input autoComplete="email" name="email" required type="email" /></label>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />
      <button className="button button-primary" disabled={pending} type="submit">{pending ? 'Requesting link…' : mode === 'sign-up' ? 'Create account with email' : 'Email me a sign-in link'}</button>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {sent && <p className="console-message" role="status">If this address is eligible, an email link has been sent. Check your inbox. Creating an account does not grant school, crew, or Commons contributor access.</p>}
    </form>
  );
}
