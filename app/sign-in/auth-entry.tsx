'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { SignInForm } from './sign-in-form';

export function AuthEntry({
  next,
  callbackError,
  mode = 'sign-in',
}: {
  next: string;
  callbackError?: string;
  mode?: 'sign-in' | 'sign-up';
}) {
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
      <p className="auth-entry-intro">Sign in to enter your local APT-LABS workspace. Local development accounts are provisioned by the site administrator.</p>

      {callbackError && <p className="inline-error" role="alert">{callbackError}</p>}

      <div className="auth-entry-actions">
        <div className="local-auth-card">
          <p className="local-auth-label">Local development account</p>
          <p className="local-auth-note">Credentials are set in the .env file (DEV_SIGN_IN_EMAIL / DEV_SIGN_IN_PASSWORD).</p>
          <SignInForm mode={mode} next={next} />
        </div>
      </div>

      <p className="auth-account-switch">
        {mode === 'sign-up'
          ? <>Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></>
          : <>New to the network? <Link href={`/sign-up?next=${encodeURIComponent(next)}`}>Create a basic account</Link></>}
      </p>

      <p className="auth-entry-boundary">Identity does not grant school, crew, or publishing permissions. Those are verified separately on the server.</p>
      <div className="auth-entry-foot"><span>DEMO PROTOTYPE</span><span>LOCAL DEV ONLY — NO REMOTE SYNCHRONIZATION</span></div>
    </section>
  );
}
