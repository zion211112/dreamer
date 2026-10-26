'use client';

import { SignInForm } from './sign-in-form';

export function AuthEntry({
  next,
  callbackError,
  mode = 'sign-in',
  localMode = false,
}: {
  next: string;
  callbackError?: string;
  mode?: 'sign-in' | 'sign-up';
  localMode?: boolean;
}) {
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
          <SignInForm localMode={localMode} next={next} mode={mode} />
        </div>
      </div>

      <p className="auth-accounts">
        {mode === 'sign-up'
          ? <>Already have an account? <a href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</a></>
          : <>New to the network? <a href={`/sign-up?next=${encodeURIComponent(next)}`}>Create a basic account</a></>}
      </p>

      {localMode && (
        <p className="auth-entry-boundary" role="note">
          Local development identity. It opens the Studio for this browser only. It is not a verified account, it is not stored on a server, and it grants no school, crew or publishing permission.
        </p>
      )}
      <div className="auth-entry-foot"><span>DEMO PROTOTYPE</span><span>LOCAL DEV ONLY — NO REMOTE SYNCHRONIZATION</span></div>
    </section>
  );
}
