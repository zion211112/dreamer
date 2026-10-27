import { useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody } from '../components/Card';

const contexts = [
  { id: 'people', label: 'People', subtitle: 'Skill in motion' },
  { id: 'institutions', label: 'Institutions', subtitle: 'Purposeful backing' },
  { id: 'commons', label: 'Commons', subtitle: 'Work that stands' },
];

const GITHUB_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function Auth() {
  const [, navigate] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [context, setContext] = useState('people');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!context) {
      setError('Select a workspace context.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    localStorage.setItem('workspaceContext', context);
    localStorage.setItem('authUser', JSON.stringify({ email, context }));

    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next') || '/workspace/people';

    setLoading(false);
    navigate(next);
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    const next = new URLSearchParams(window.location.search).get('next') || '/workspace/people';
    window.location.href = `/auth/${provider}?next=${encodeURIComponent(next)}`;
  };

  return (
    <div className="auth-shell" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--terrain-pale) 35%, transparent), transparent 35rem),
        radial-gradient(ellipse at 80% 100%, color-mix(in srgb, var(--brass-pale) 20%, transparent), transparent 25rem),
        var(--bg)
      `,
    }}>
      {/* Grid background */}
      <div className="auth-grid-bg" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: 0.12,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent calc(var(--space-5) - 1px), var(--hairline) var(--space-5)),
          repeating-linear-gradient(90deg, transparent, transparent calc(var(--space-5) - 1px), var(--hairline) var(--space-5))
        `,
        backgroundSize: 'var(--space-5) var(--space-5)',
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, #000 0%, transparent 75%)',
      }} />

      {/* Coordinate marker */}
      <div className="auth-coordinate" style={{
        position: 'fixed',
        top: 'var(--space-5)',
        right: 'var(--space-5)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
        fontFamily: 'var(--mono)',
        fontSize: 'var(--step--2)',
        color: 'var(--text-faint)',
        pointerEvents: 'none',
      }}>
        <span className="coord-label" style={{
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--terrain)',
        }}>FIELD DESK</span>
        <span className="coord-value">00° 00′</span>
      </div>

      <section className="auth-entry" style={{
        flex: 1,
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-6) var(--space-4)',
        position: 'relative',
        zIndex: 2,
      }}>
        <Card style={{ width: '100%', maxWidth: '400px' }}>
          {/* Terminal header */}
          <div className="auth-terminal-header" style={{
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--space-3) var(--space-4)',
          }}>
            <div className="terminal-bar" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}>
              <div className="terminal-dots" style={{ display: 'flex', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--oxide)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amber)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--terrain)' }} />
              </div>
              <span className="terminal-title" style={{
                flex: 1,
                fontFamily: 'var(--mono)',
                fontSize: 'var(--step--2)',
                color: 'var(--text-muted)',
              }}>
                <span className="term-prompt" style={{ color: 'var(--phosphor)' }}>apt@field-desk</span>
                <span className="term-command" style={{ color: 'var(--brass)', marginLeft: '8px' }}>{isSignUp ? 'sign-up' : 'sign-in'}</span>
                <span className="term-cursor visible" style={{
                  display: 'inline-block',
                  width: '1ch',
                  height: '1.2em',
                  background: 'var(--phosphor)',
                  color: 'var(--bg-term)',
                  animation: 'term-blink 1.06s steps(1) infinite',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                }} />
              </span>
            </div>
          </div>

          <CardBody style={{ padding: 'var(--space-5) var(--space-4) var(--space-3)' }}>
            {/* Brand mark */}
            <div className="auth-brand-mark" style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}>
              <BrandMark size="lg" />
            </div>

            <h1 className="auth-headline" style={{
              textAlign: 'center',
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(26px, 4.5vw, 34px)',
              fontWeight: '300',
              lineHeight: '1.25',
              color: 'var(--ink)',
              margin: '0 0 var(--space-1)',
            }}>
              {isSignUp ? 'Create your identity' : 'Enter the studio'}
            </h1>

            <p className="auth-subtext" style={{
              textAlign: 'center',
              fontSize: 'var(--step-0)',
              lineHeight: '1.55',
              color: 'var(--text-muted)',
              margin: '0 0 var(--space-5)',
            }}>
              {isSignUp
                ? 'Join the network. Build with intent.'
                : 'Your workspace, your context, your terms.'}
            </p>

            {/* Mode toggle - nested below headline */}
            <div className="auth-mode-toggle" style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 'var(--space-5)',
              padding: '2px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-3)',
              border: '1px solid var(--border)',
            }}>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                style={{
                  padding: 'var(--space-1) var(--space-4)',
                  fontFamily: 'var(--mono)',
                  fontSize: 'var(--step--1)',
                  fontWeight: 500,
                  color: isSignUp ? 'var(--text-muted)' : 'var(--ink)',
                  background: isSignUp ? 'transparent' : 'var(--bg-elev)',
                  border: 'none',
                  borderRadius: 'var(--radius-2)',
                  cursor: 'pointer',
                  transition: 'all var(--fast)',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                style={{
                  padding: 'var(--space-1) var(--space-4)',
                  fontFamily: 'var(--mono)',
                  fontSize: 'var(--step--1)',
                  fontWeight: 500,
                  color: !isSignUp ? 'var(--text-muted)' : 'var(--ink)',
                  background: !isSignUp ? 'transparent' : 'var(--bg-elev)',
                  border: 'none',
                  borderRadius: 'var(--radius-2)',
                  cursor: 'pointer',
                  transition: 'all var(--fast)',
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}>
              {error && (
                <div className="auth-error-banner" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--err-bg)',
                  border: '1px solid var(--err)',
                  borderRadius: 'var(--radius-3)',
                  color: 'var(--err)',
                  fontFamily: 'var(--mono)',
                  fontSize: 'var(--step--1)',
                }}>
                  <span className="error-glyph" style={{ fontSize: 'var(--step-0)' }}>⚠</span>
                  {error}
                </div>
              )}

              {/* Email field */}
              <div className="auth-field" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <label className="auth-label" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: 'var(--step--2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@domain.org"
                  value={email}
                  onChange={setEmail}
                  autoComplete="username"
                  required
                  aria-invalid={!!error}
                />
              </div>

              {/* Password field */}
              <div className="auth-field" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="auth-label" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--mono)',
                    fontSize: 'var(--step--2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>
                    Password
                  </label>
                  {!isSignUp && (
                    <Link href="/forgot-password" className="forgot-link" style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 'var(--step--2)',
                      color: 'var(--terrain)',
                      textDecoration: 'none',
                      borderBottom: '1px solid transparent',
                      transition: 'border-color var(--fast)',
                    }}>
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  aria-invalid={!!error}
                />
              </div>

              {/* Confirm password (sign up only) */}
              {isSignUp && (
                <div className="auth-field" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <label className="auth-label" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--mono)',
                    fontSize: 'var(--step--2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    required
                    aria-invalid={!!error}
                  />
                </div>
              )}

              {/* Context selector */}
              <div className="auth-field" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <label className="auth-label" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: 'var(--step--2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                  Workspace
                </label>
                <select
                  value={context}
                  onChange={(e: Event) => setContext((e.target as HTMLSelectElement).value)}
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-elev)',
                    color: 'var(--text)',
                    fontFamily: 'var(--sans)',
                    fontSize: 'var(--step-0)',
                    cursor: 'pointer',
                    transition: 'border var(--fast), box-shadow var(--fast), background var(--fast)',
                  }}
                  required
                >
                  <option value="">Choose a workspace…</option>
                  {contexts.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>
                      {ctx.label} — {ctx.subtitle}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                style={{ width: '100%', marginTop: 'var(--space-1)' }}
              >
                {loading ? 'Authenticating…' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            {/* OAuth divider */}
            <div className="auth-separator" style={{
              margin: 'var(--space-4) 0 var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              color: 'var(--text-faint)',
              fontFamily: 'var(--mono)',
              fontSize: 'var(--step--2)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
              <span>Or continue with</span>
              <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
            </div>

            {/* OAuth buttons - minimal logos */}
            <div className="auth-oauth" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-3)' }}
                onClick={() => handleOAuth('github')}
              >
                {GITHUB_SVG}
                <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--step--1)' }}>GitHub</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-3)' }}
                onClick={() => handleOAuth('google')}
              >
                {GOOGLE_SVG}
                <span style={{ fontFamily: 'var(--mono)', fontSize: 'var(--step--1)' }}>Google</span>
              </Button>
            </div>

            <div className="auth-local-notice" style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--info-bg)',
              border: '1px solid var(--info)',
              borderRadius: 'var(--radius-3)',
              fontSize: 'var(--step--1)',
              color: 'var(--info)',
              lineHeight: '1.5',
              textAlign: 'center',
              fontFamily: 'var(--mono)',
            }}>
              Workspace context stored locally · Demo mode
            </div>
          </CardBody>

          <div className="auth-card-footer" style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--bg-subtle)',
            textAlign: 'center',
          }}>
            <p className="auth-footer-hash" style={{
              margin: 0,
              fontFamily: 'var(--mono)',
              fontSize: 'var(--step--2)',
              color: 'var(--terrain)',
            }}>
              #zeptepi
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}