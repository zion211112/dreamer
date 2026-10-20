'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { requestOAuth } from './actions';
import { SignInForm } from './sign-in-form';

function GoogleMark() {
  return (
    <svg aria-hidden="true" height="17" viewBox="0 0 48 48" width="17">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6.1C12.2 13.6 17.6 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.4c-.5 2.9-2.1 5.4-4.5 7.1l7.2 5.6c4.3-4 7-9.9 7-17Z" />
      <path fill="#FBBC05" d="M10.3 28.6a14.7 14.7 0 0 1 0-9.2l-7.8-6.1a24 24 0 0 0 0 21.4l7.8-6.1Z" />
      <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.9l-7.2-5.6c-2 1.4-4.8 2.3-8.8 2.3-6.4 0-11.8-4.1-13.7-9.8l-7.8 6.1C6.5 43.1 14.6 48 24 48Z" />
    </svg>
  );
}

export function AuthEntry({
  configured,
  next,
  callbackError,
  configStatus = 'ready',
  mode = 'sign-in',
}: {
  configured: boolean;
  next: string;
  callbackError?: string;
  configStatus?: 'ready' | 'missing' | 'placeholder' | 'invalid';
  mode?: 'sign-in' | 'sign-up';
}) {
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function beginOAuth(provider: 'google' | 'github') {
    setError('');
    startTransition(async () => {
      const result = await requestOAuth(provider, next);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.location.assign(result.url);
      }
    });
  }

  return (
    <section className="auth-entry">
      <div className="auth-entry-brand">
        <span className="wordmark-symbol" aria-hidden="true">A</span>
        <span>APT<span className="wordmark-dash">—</span>LABS</span>
      </div>
      <p className="eyebrow">THE SOVEREIGN COORDINATION ENGINE</p>
      <h1>Find your place<br /><em>in the work.</em></h1>
      <p className="auth-entry-intro">Sign in to enter your APT-LABS workspace. A verified account is required for private workspace access.</p>

      {callbackError && <p className="inline-error" role="alert">{callbackError}</p>}
      <div className="auth-entry-actions">
        <button className="auth-provider-button" disabled={!configured || pending} onClick={() => beginOAuth('google')} type="button">
          <GoogleMark /> Continue with Google
        </button>
        <button className="auth-provider-button" disabled={!configured || pending} onClick={() => beginOAuth('github')} type="button">
          <Github aria-hidden="true" size={17} /> Continue with GitHub
        </button>
        {!configured && (
          <div className="setup-notice" role="status">
            <strong>Account access is not configured.</strong>
            <p>{configStatus === 'placeholder'
              ? 'The Supabase public key is still a placeholder value. Set NEXT_PUBLIC_SUPABASE_ANON_KEY to the real anon (public) key from Project Settings → API.'
              : configStatus === 'invalid'
                ? 'The Supabase URL is not a valid project URL. It must look like https://<20-character-project-ref>.supabase.co.'
                : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on this deployment, then restart the server.'}</p>
          </div>
        )}
        {error && <p className="inline-error" role="alert">{error}</p>}
      </div>
      <details className="auth-email-option" open={configured}>
        <summary>Email and password <span aria-hidden="true">+</span></summary>
        {configured
          ? <SignInForm mode={mode} next={next} />
          : <p className="auth-provider-note" role="status">Email and password sign-in stays disabled until the Supabase settings above are supplied.</p>}
      </details>
      <p className="auth-account-switch">
        {mode === 'sign-up'
          ? <>Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></>
          : <>New to the network? <Link href={`/sign-up?next=${encodeURIComponent(next)}`}>Create a basic account</Link></>}
      </p>
      <p className="auth-entry-boundary">Identity does not grant school, crew, or publishing permissions. Those are verified separately on the server.</p>
      <div className="auth-entry-foot"><span>DEMO PROTOTYPE</span><span>IDENTITY ≠ ENTITLEMENT</span></div>
    </section>
  );
}
