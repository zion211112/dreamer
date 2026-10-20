'use client';

import { useActionState } from 'react';
import { authenticateWithPassword, type AuthActionState } from './actions';

const initialState: AuthActionState = {};

export function SignInForm({
  next,
  mode = 'sign-in',
  localMode = false,
}: {
  next: string;
  mode?: 'sign-in' | 'sign-up';
  localMode?: boolean;
}) {
  const [state, formAction, pending] = useActionState(authenticateWithPassword, initialState);
  return (
    <form action={formAction} className="sign-in-form">
      <label>Email<input autoComplete="username" name="email" required type="email" /></label>
      <label>Password<input autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} name="password" required type="password" /></label>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />
      <button className="button button-primary" disabled={pending} type="submit">{pending ? 'Verifying…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
      {state.error && <p className="inline-error" role="alert">{state.error}</p>}
      {localMode && <p className="auth-provider-note">Local development identity. Any email and password opens the Studio in this browser. Nothing is sent to a server and no account is created.</p>}
      {!localMode && mode === 'sign-up' && <p className="auth-provider-note">Local development account. Any email and password are accepted.</p>}
    </form>
  );
}
