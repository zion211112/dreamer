import { useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const contexts = [
  { id: 'people', label: 'People' },
  { id: 'institutions', label: 'Institutions' },
  { id: 'commons', label: 'Commons' },
];

const GITHUB_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function Auth() {
  const [location, navigate] = useLocation();
  const isSignUp = location === '/sign-up';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [context, setContext] = useState('people');
  const [error, setError] = useState('');

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

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
      <aside className="auth-brand-panel" aria-label="APT-LABS">
        <BrandMark size="lg" />
      </aside>

      <section className="auth-main">
        <div className="auth-content">
          <div className="auth-topline">
            <span className="auth-eyebrow">APT-LABS / ACCESS</span>
            <div className="auth-mode-switch" aria-label="Account action">
              <button
                type="button"
                aria-pressed={!isSignUp}
                onClick={() => navigate('/sign-in')}
              >
                Sign in
              </button>
              <button
                type="button"
                aria-pressed={isSignUp}
                onClick={() => navigate('/sign-up')}
              >
                Create account
              </button>
            </div>
          </div>

          <header className="auth-heading">
            <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            <p>
              {isSignUp
                ? 'Start with the workspace that fits your work.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </header>

          <div className="auth-provider-options">
            <Button className="auth-provider-button" variant="ghost" disabled>
              {GOOGLE_SVG}
              <span>Google</span>
            </Button>
            <Button className="auth-provider-button" variant="ghost" disabled>
              {GITHUB_SVG}
              <span>GitHub</span>
            </Button>
          </div>
          <p className="auth-provider-note">
            Google and GitHub sign-in are not connected in this build.
          </p>

          <div className="auth-divider"><span>or continue with email</span></div>

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
                onChange={setEmail}
                autoComplete="email"
                required
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="auth-forgot-button"
                    onClick={() => setError('Password reset is not available in this demo.')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="auth-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                aria-invalid={Boolean(error)}
              />
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
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(error)}
                />
              </div>
            )}

            <Button type="submit" className="auth-submit" size="lg">
              {isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="auth-demo-note">
            Demo mode only. No account is created, and your password is not saved or sent.
          </p>
        </div>
      </section>
    </main>
  );
}
