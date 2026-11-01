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
      <header className="auth-header">
        <BrandMark size="sm" />
        <span className="auth-header-status">
          <span aria-hidden="true" />
          Browser-local demo
        </span>
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
            <p className="auth-eyebrow">Your studio, on this device</p>
            <h2 id="auth-title">{isSignUp ? 'Make a place for the work.' : 'Find your place in the work.'}</h2>
            <p>
              {isSignUp
                ? 'Choose a workspace and continue.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </header>

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
                style={{ borderRadius: '3px', padding: '0 13px' }}
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
                    Password reset unavailable in this demo
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
                style={{ borderRadius: '3px', padding: '0 13px' }}
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
                  style={{ borderRadius: '3px', padding: '0 13px' }}
                />
              </div>
            )}

            <Button type="submit" className="auth-submit" size="lg" style={{ borderRadius: '3px' }}>
              {isSignUp ? 'Create account' : 'Sign in'}
              <span className="auth-submit-arrow" aria-hidden="true">→</span>
            </Button>
          </form>

          <p className="auth-demo-note">
            <span className="auth-demo-mark" aria-hidden="true">i</span>
            <span>Demo only. No account is created. Passwords are never stored or sent.</span>
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>APT—LABS <i aria-hidden="true">/</i> Studio entrance</span>
        <span>Local prototype <i aria-hidden="true">·</i> 001</span>
      </footer>
    </main>
  );
}
