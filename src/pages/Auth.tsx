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
      <section className="auth-main">
        <div className="auth-content">
          <div className="auth-brand">
            <BrandMark size="sm" />
            <span>APT<span aria-hidden="true">—</span>LABS</span>
          </div>
          <div className="auth-topline">
            <span className="auth-eyebrow">BROWSER-LOCAL DEMO</span>
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
            <h1>{isSignUp ? 'Make a place for the work.' : 'Find your place in the work.'}</h1>
            <p>
              {isSignUp
                ? 'Choose a workspace and continue.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </header>

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
            Browser-local demo only. No account is created. Passwords are never stored or sent.
          </p>
        </div>
      </section>
    </main>
  );
}
