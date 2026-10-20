'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { devSignIn } from './actions';

/**
 * One-click dev sign-in. Only rendered when the server reports development mode with
 * credentials configured, and the action independently refuses outside `next dev`.
 */
export function DevSignInButton({ next, enabled }: { next: string; enabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  if (!enabled) return null;

  return (
    <div className="dev-sign-in">
      <button
        className="button button-primary"
        disabled={pending}
        type="button"
        onClick={() => startTransition(async () => {
          setError('');
          const result = await devSignIn(next);
          if (result.error) setError(result.error);
          if (result.authenticated) router.push(next);
        })}
      >
        {pending ? 'Signing in…' : 'Dev sign in'}
      </button>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </div>
  );
}
