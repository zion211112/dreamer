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
      <h1>{mode === 'sign-up' ? 'Create your account' : 'Sign in'}</h1>

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
