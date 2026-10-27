'use client';

import { useActionState, useCallback, useId, useRef, useState } from 'react';
import { authenticateWithPassword, type AuthActionState } from './actions';
import { validateCredentials, type CredentialIntent } from '@/lib/supabase/credentials';

const initialState: AuthActionState = {};

export function SignInForm({
  next,
  mode = 'sign-in',
}: {
  next: string;
  mode?: 'sign-in' | 'sign-up';
}) {
  const [state, formAction, pending] = useActionState(authenticateWithPassword, initialState);
  const [localError, setLocalError] = useState<string | null>(null);
  const emailId = useId();
  const contextId = useId();
  const emailErrorId = useId();
  const emailRef = useRef<HTMLInputElement | null>(null);

  const intent: CredentialIntent = mode;

  const errorMessage = state.error ?? localError;
  const hasError = !!errorMessage;

  const validateOnSubmit = useCallback(
    (formData: FormData): boolean => {
      const email = String(formData.get('email') ?? '').trim();
      const context = String(formData.get('workspace') ?? '').trim();
      if (!email) {
        setLocalError('Enter your email address.');
        if (emailRef.current) emailRef.current.focus();
        return false;
      }
      if (!context) {
        setLocalError('Select a workspace context.');
        return false;
      }
      const message = validateCredentials({ email, password: 'magic-link', intent });
      if (message) {
        setLocalError(message);
        if (emailRef.current) emailRef.current.focus();
        return false;
      }
      setLocalError(null);
      return true;
    },
    [intent],
  );

  const handleSubmit = (formData: FormData) => {
    if (!validateOnSubmit(formData)) return;
    void formAction(formData);
  };

  return (
    <form action={handleSubmit} className="sign-in-form" noValidate>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />

      <div className="field">
        <label htmlFor={emailId} className="form-label">Email</label>
        <input
          id={emailId}
          ref={emailRef}
          className="form-input"
          autoComplete="username"
          name="email"
          type="email"
          required
          placeholder="you@domain.org"
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? emailErrorId : undefined}
        />
        {hasError && (
          <p id={emailErrorId} className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
        <p className="form-hint">We'll send a magic link. No password required.</p>
      </div>

      <div className="field">
        <label htmlFor={contextId} className="form-label">Workspace</label>
        <select
          id={contextId}
          name="workspace"
          className="form-input form-select"
          required
          aria-invalid={hasError ? 'true' : undefined}
        >
          <option value="">Choose a workspace…</option>
          <option value="apt">APT-LABS Network</option>
          <option value="school">School Console</option>
        </select>
      </div>

      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Send Magic Link'}
      </button>

      <div className="auth-divider"><span>Or continue with</span></div>

      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => window.location.href = `/auth/google?next=${encodeURIComponent(next)}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{marginRight: 8}}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
