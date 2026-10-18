'use client';

import { useState, useTransition } from 'react';
import { requestSignInLink } from './actions';

export function SignInForm({ next }: { next: string }) {
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <form action={formData => startTransition(async () => {
      setError('');
      setSent(false);
      const result = await requestSignInLink(formData);
      if (result.error) setError(result.error);
      if (result.sent) setSent(true);
    })} className="sign-in-form">
      <label>Email address<input autoComplete="email" name="email" required type="email" /></label>
      <input name="next" type="hidden" value={next} />
      <button className="button button-primary" disabled={pending} type="submit">{pending ? 'Requesting link…' : 'Email me a sign-in link'}</button>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {sent && <p className="console-message" role="status">If this address is eligible, a sign-in link has been sent. Check your inbox; this page does not confirm school membership.</p>}
    </form>
  );
}
