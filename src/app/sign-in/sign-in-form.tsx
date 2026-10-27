'use client';

import { useActionState, useCallback, useId, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { authenticateWithPassword, type AuthActionState } from './actions';
import { validateCredentials, type CredentialIntent } from '@/lib/supabase/credentials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = (formData: FormData) => {
    if (!validateOnSubmit(formData)) return;
    formAction(formData);
  };

  return (
    <Card className="auth-form-card">
      <CardContent className="auth-form-content">
        <form action={handleSubmit} className="auth-form" noValidate>
          <input name="intent" type="hidden" value={mode} />
          <input name="next" type="hidden" value={next} />

          {hasError && (
            <Alert variant="destructive" className="auth-error-alert">
              <AlertCircle size={16} className="mr-2" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="auth-field">
            <div className="field-label-row">
              <Label htmlFor={emailId} className="auth-label">
                <Mail size={14} aria-hidden="true" />
                Email
              </Label>
              <span className="field-hint">identity</span>
            </div>
            <div className="auth-input-wrapper">
              <Input
                id={emailId}
                ref={emailRef}
                type="email"
                autoComplete="username"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-invalid={hasError ? 'true' : undefined}
                aria-describedby={hasError ? emailErrorId : undefined}
                disabled={pending}
                className="auth-input"
              />
            </div>
            {hasError && (
              <p id={emailErrorId} className="auth-field-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="auth-field">
            <div className="field-label-row">
              <Label htmlFor={passwordId} className="auth-label">
                <Lock size={14} aria-hidden="true" />
                Password
              </Label>
              <span className="field-hint">credential</span>
            </div>
            <div className="auth-input-wrapper">
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                aria-invalid={hasError ? 'true' : undefined}
                aria-describedby={hasError ? passwordErrorId : undefined}
                disabled={pending}
                className="auth-input pr-12"
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {hasError && (
              <p id={passwordErrorId} className="auth-field-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Submit Button - Terminal styled */}
          <Button
            type="submit"
            className="auth-submit-btn"
            disabled={pending}
            size="lg"
          >
            {pending ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Verifying…
              </>
            ) : mode === 'sign-up' ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Create account
              </>
            ) : (
              <>
                <Lock size={18} className="mr-2" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <Separator className="auth-separator" />

        <div className="auth-footnotes">
          {!localMode && (
            <p className="auth-note">
              {mode === 'sign-up'
                ? 'Local development account. Any email and password are accepted.'
                : (
                  <>
                    Forgot your password? {' '}
                    <a href={`/sign-in?next=${encodeURIComponent(next)}&error=reset`} className="auth-link">
                      Request a reset link
                    </a>
                  </>
                )}
            </p>
          )}

          {localMode && (
            <Alert variant="default" className="auth-local-notice">
              <AlertCircle size={14} className="mr-2" />
              <AlertDescription>
                Local development identity. Any email and password opens the Studio in this browser. Nothing is sent to a server and no account is created.
              </AlertDescription>
            </Alert>
          )}

          <p className="auth-switch">
            {mode === 'sign-up' ? (
              <>Already have an account? <a href={`/sign-in?next=${encodeURIComponent(next)}`} className="auth-link">Sign in</a></>
            ) : (
              <>New to the network? <a href={`/sign-up?next=${encodeURIComponent(next)}`} className="auth-link">Create a basic account</a></>
            )}
          </p>
        </div>
      </CardContent>
      <div className="auth-card-footer">
        <p className="auth-footer-text">APT-LABS — Sovereign Coordination Engine</p>
        <p className="auth-footer-hash">#coordination-is-infrastructure</p>
      </div>
    </Card>
  );
}
