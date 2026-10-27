'use client';

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
  return (
    <section className="auth-entry">
      <header className="auth-entry-brand">
        <a href="/" className="manuscript-brand" aria-label="APT-LABS Home">
          APT<span className="wordmark-dash">—</span>LABS<mark>Tender Engine</mark>
        </a>
        <span className="manuscript-kicker">Authentication · Editorial Manuscript</span>
      </header>

      <div className="auth-card">
        <div className="auth-head">
          <h1 className="auth-title">Enter the Studio</h1>
          <p className="auth-subtitle">Your workspace for sovereign coordination. Tenders, assemblies, and the Roll.</p>
        </div>

        {callbackError && (
          <div className="auth-error" role="alert">
            {callbackError}
          </div>
        )}

        <SignInForm next={next} mode={mode} />

        <footer className="auth-footer">
          <p>
            {mode === 'sign-up'
              ? <>Already have an account? <a href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</a></>
              : <>New to the network? <a href={`/sign-up?next=${encodeURIComponent(next)}`}>Create an account</a></>}
          </p>
        </footer>
      </div>
    </section>
  );
}
