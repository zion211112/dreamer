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
    <section className="auth-entry flex min-h-[svh] flex-col items-center justify-center px-4 py-6 text-center">
      <div className="auth-entry-brand mb-2">
        <span className="wordmark-symbol" aria-hidden="true">A</span>
        <span>APT<span className="wordmark-dash">—</span>LABS</span>
      </div>
      <p className="eyebrow text-xs mb-1 tracking-wider">THE SOVEREIGN COORDINATION ENGINE</p>
      <h1 className="text-xl font-semibold mb-1 leading-tight">Find your place<br /><em className="font-normal">in the work.</em></h1>
      <p className="auth-entry-intro text-sm text-muted-foreground mb-4">Sign in to enter your workspace.</p>

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

    </section>
  );
}
