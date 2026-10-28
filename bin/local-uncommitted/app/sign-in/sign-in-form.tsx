'use client';

import { useActionState, useCallback, useId, useRef, useState } from 'react';
import { authenticateWithPassword, type AuthActionState } from './actions';
import { validateCredentials, type CredentialIntent } from '@/lib/supabase/credentials';

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
  const [localError, setLocalError] = useState<string | null>(null);
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const intent: CredentialIntent = mode;

  const errorMessage = state.error ?? localError;
  const hasError = !!errorMessage;

  const validateOnSubmit = useCallback(
    (formData: FormData): boolean => {
      const email = String(formData.get('email') ?? '').trim();
      const password = String(formData.get('password') ?? '');
      const message = validateCredentials({ email, password, intent });
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

  const handleSubmit = (event: React.FormAction<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!validateOnSubmit(formData)) return;
    void formAction(formData);
  };

  return (
    <form action={handleSubmit} className="sign-in-form flex flex-col gap-3 w-full max-w-sm" noValidate>
      <input name="intent" type="hidden" value={mode} />
      <input name="next" type="hidden" value={next} />

      <div className="field flex flex-col gap-1">
        <label htmlFor={emailId} className="text-sm font-medium">Email</label>
        <input
          id={emailId}
          ref={emailRef}
          className="input px-3 py-2 text-sm"
          autoComplete="username"
          name="email"
          type="email"
          required
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? emailErrorId : undefined}
        />
        {hasError && (
          <p id={emailErrorId} className="inline-error text-xs" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="field flex flex-col gap-1">
        <label htmlFor={passwordId} className="text-sm font-medium">Password</label>
        <input
          id={passwordId}
          className="input px-3 py-2 text-sm"
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? passwordErrorId : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? '🙈' : '👁'}
        </button>
        {hasError && (
          <p id={passwordErrorId} className="inline-error text-xs" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <button className="button-primary px-4 py-2 text-sm" disabled={pending} type="submit">
        {pending ? 'Verifying…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
      </button>

      {!localMode && (
        <p className="auth-provider-note auth-note">
          {mode === 'sign-up'
            ? 'Local development account. Any email and password are accepted.'
            : <>Forgot your password? <a href={`/sign-in?next=${encodeURIComponent(next)}&error=reset`}>Request a reset link</a></>}
        </p>
      )}

    </form>
  );
}
