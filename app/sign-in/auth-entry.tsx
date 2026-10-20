'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateWithPassword } from './actions';

export function AuthEntry({
  next,
  callbackError,
  mode = 'sign-in',
}: {
  next: string;
  callbackError?: string;
  mode?: 'sign-in' | 'sign-up';
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <section className="auth-entry">
      <div className="auth-entry-brand">
        <span className="wordmark-symbol" aria-hidden="true">A</span>
        <span>APT<span className="wordmark-dash">—</span>LABS</span>
      </div>
      <p className="eyebrow">THE SOVEREIGN COORDINATION ENGINE</p>
      <h1>Find your place<br /><em>in the work.</em></h1>
      <p className="auth-entry-intro">Sign in to enter your workspace.</p>

      {callbackError && <p className="inline-error" role="alert">{callbackError}</p>}

      <div className="auth-entry-actions">
        <div className="local-auth-card">
          <SignInForm mode={mode} onSuccess={() => router.push(next)} />
        </div>
      </div>

      <p className="auth-accounts">
        {mode === 'sign-up'
          ? <>Already have an account? <a href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</a></>
          : <>New to the network? <a href={`/sign-up?next=${encodeURIComponent(next)}`}>Create a basic account</a></>}
      </p>

      <p className="auth-entry-boundary">Identity does not grant school, crew, or publishing permissions. Those are verified separately on the server.</p>
      <div className="auth-entry-foot"><span>DEMO PROTOTYPE</span><span>LOCAL DEV ONLY — NO REMOTE SYNCHRONIZATION</span></div>
    </section>
  );
}
