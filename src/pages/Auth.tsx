import { useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';

const contexts = [
  { id: 'people', label: 'People' },
  { id: 'institutions', label: 'Institutions' },
  { id: 'commons', label: 'Commons' },
];

export function Auth() {
  const [location, navigate] = useLocation();
  const isSignUp = location === '/sign-up';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [context, setContext] = useState('people');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    return '';
  };

  const validatePassword = (value: string, isSignUp: boolean) => {
    if (!value) return 'Password is required.';
    if (isSignUp && value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const validateConfirmPassword = (value: string, password: string) => {
    if (!value) return 'Confirm your password.';
    if (value !== password) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, isSignUp);
    const confirmError = isSignUp ? validateConfirmPassword(confirmPassword, password) : '';

    if (emailError || passwordError || confirmError) {
      setFieldErrors({ email: emailError, password: passwordError, confirmPassword: confirmError });
      return;
    }

    setFieldErrors({});

    const requestedNext = new URLSearchParams(window.location.search).get('next');
    const next = requestedNext
      && requestedNext.startsWith('/')
      && !requestedNext.startsWith('//')
      && !requestedNext.includes('\\')
      ? requestedNext
      : `/workspace/${context}`;

    try {
      localStorage.setItem('workspaceContext', context);
      localStorage.setItem('authUser', JSON.stringify({ email, context }));
    } catch {
      setError('This browser could not save the demo session. Check your storage settings and try again.');
      return;
    }

    navigate(next);
  };

  return (
    <main className="auth-layout">
      <header className="auth-header">
        <BrandMark size="sm" />
      </header>

      <div className="auth-main">
        <section className="auth-intro" aria-labelledby="auth-intro-title">
          <p className="auth-intro-label">A practical network for local work</p>
          <h1 id="auth-intro-title">
            Make good work<br />
            <span>find its people.</span>
          </h1>
          <p className="auth-intro-copy">
            A considered place for people, institutions, and ideas to meet around the work their communities need.
          </p>
          <p className="auth-intro-coordinate">People <span>/</span> Place <span>/</span> Possibility</p>
        </section>

        <section className="auth-form-panel" aria-labelledby="auth-title">
          <header className="auth-heading">
            <h2 id="auth-title">{isSignUp ? 'Make a place for the work.' : 'Find your place in the work.'}</h2>
            <p>
              {isSignUp
                ? 'Choose a workspace and continue.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </header>

          <div className="auth-mode-switch" role="tablist" aria-label="Account action">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              onClick={() => navigate('/sign-in')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignUp}
              onClick={() => navigate('/sign-up')}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="auth-error" role="alert">{error}</p>}

            <div className="auth-field">
              <label htmlFor="auth-workspace">Workspace</label>
              <select
                id="auth-workspace"
                name="workspace"
                value={context}
                onChange={(event: Event) => setContext((event.target as HTMLSelectElement).value)}
                required
              >
                {contexts.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-email">Email</label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@domain.org"
                value={email}
                onChange={(value: string) => { setEmail(value); setFieldErrors(prev => ({ ...prev, email: validateEmail(value) })); }}
                onBlur={() => setFieldErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
              />
              {fieldErrors.email && <p id="auth-email-error" className="auth-field-error" role="alert">{fieldErrors.email}</p>}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(value: string) => { setPassword(value); setFieldErrors(prev => ({ ...prev, password: validatePassword(value, isSignUp) })); }}
                onBlur={() => setFieldErrors(prev => ({ ...prev, password: validatePassword(password, isSignUp) }))}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
              />
              {fieldErrors.password && <p id="auth-password-error" className="auth-field-error" role="alert">{fieldErrors.password}</p>}
            </div>

            {isSignUp && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <Input
                  id="auth-confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(value: string) => { setConfirmPassword(value); setFieldErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) })); }}
                  onBlur={() => setFieldErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }))}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'auth-confirm-error' : undefined}
                />
                {fieldErrors.confirmPassword && <p id="auth-confirm-error" className="auth-field-error" role="alert">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <Button type="submit" className="auth-submit" size="lg">
              {isSignUp ? 'Create account' : 'Sign in'}
              <span className="auth-submit-arrow" aria-hidden="true">→</span>
            </Button>
          </form>
        </section>
      </div>

      <footer className="auth-footer">
        <span>APT—LABS <i aria-hidden="true">/</i> Studio entrance</span>
      </footer>
    </main>
  );
}
