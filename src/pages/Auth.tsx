import { useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody } from '../components/Card';

interface AuthProps {
  mode: 'sign-in' | 'sign-up';
}

const contexts = [
  { id: 'people', label: 'People', subtitle: 'Skill in motion' },
  { id: 'institutions', label: 'Institutions', subtitle: 'Purposeful backing' },
  { id: 'commons', label: 'Commons', subtitle: 'Work that stands' },
];

export function Auth({ mode }: AuthProps) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
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
    if (!context) {
      setError('Select a workspace context.');
      return;
    }

    setLoading(true);
    
    // Simulate magic link sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store context in localStorage
    localStorage.setItem('workspaceContext', context);
    
    // Get next param from URL or default
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next') || '/workspace/people';
    
    setLoading(false);
    navigate(next);
  };

  const isSignIn = mode === 'sign-in';

  return (
    <div className="auth-shell" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--terrain-pale) 40%, transparent), transparent 40rem),
        radial-gradient(ellipse at 80% 100%, color-mix(in srgb, var(--brass-pale) 25%, transparent), transparent 30rem),
        var(--bg)
      `,
    }}>
      {/* Grid background */}
      <div className="auth-grid-bg" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: 0.15,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent calc(var(--space-5) - 1px), var(--hairline) var(--space-5)),
          repeating-linear-gradient(90deg, transparent, transparent calc(var(--space-5) - 1px), var(--hairline) var(--space-5))
        `,
        backgroundSize: 'var(--space-5) var(--space-5)',
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, #000 0%, transparent 80%)',
      }} />

      {/* Coordinate marker */}
      <div className="auth-coordinate" style={{
        position: 'fixed',
        top: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 'var(--space-1)',
        fontFamily: 'var(--mono)',
        fontSize: 'var(--step--2)',
        color: 'var(--text-faint)',
        pointerEvents: 'none',
      }}>
        <span className="coord-label" style={{
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--terrain)',
        }}>FIELD STATION</span>
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
        <Card style={{ width: '100%', maxWidth: '420px' }}>
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
                <span className="term-command" style={{ color: 'var(--brass)', marginLeft: '8px' }}>{isSignIn ? 'sign-in' : 'sign-up'}</span>
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

          <CardBody style={{ padding: 'var(--space-5) var(--space-4) var(--space-2)' }}>
            {/* Brand mark */}
            <div className="auth-brand-mark" style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-5) var(--space-4) var(--space-2)',
            }}>
              <BrandMark size="lg" />
            </div>

            <p className="auth-eyebrow" style={{
              textAlign: 'center',
              fontFamily: 'var(--mono)',
              fontSize: 'var(--step--2)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-faint)',
              margin: '0 0 var(--space-2)',
            }}>
              AUTHENTICATION · MINIMAL
            </p>

            <h1 className="auth-headline" style={{
              textAlign: 'center',
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: '300',
              lineHeight: '1.3',
              color: 'var(--ink)',
              margin: '0 0 var(--space-3)',
            }}>
              {isSignIn ? 'Enter the studio' : 'Join the network'}
            </h1>

            <p className="auth-intro" style={{
              textAlign: 'center',
              fontSize: 'var(--step-0)',
              lineHeight: '1.6',
              color: 'var(--text-muted)',
              margin: '0 0 var(--space-5)',
            }}>
              We&apos;ll send a magic link. No password required.
            </p>
          </CardBody>

          <CardBody style={{ padding: '0 var(--space-4) var(--space-4)' }}>
            <form onSubmit={handleSubmit} className="auth-form" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              {error && (
                <div className="auth-error-banner" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  margin: '0 0 var(--space-4)',
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
                gap: 'var(--space-1)',
              }}>
                <div className="field-label-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <label className="auth-label" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--mono)',
                    fontSize: 'var(--step--2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>
                    Email
                  </label>
                </div>
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

              {/* Context selector */}
              <div className="auth-field" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}>
                <div className="field-label-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <label className="auth-label" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--mono)',
                    fontSize: 'var(--step--2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>
                    Workspace
                  </label>
                </div>
                <select
                  value={context}
                  onChange={(e: Event) => setContext((e.target as HTMLSelectElement).value)}
                  className="input"
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-elev)',
                    color: 'var(--text)',
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
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </Button>

              <div className="auth-separator" style={{
                margin: 'var(--space-4) 0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                color: 'var(--text-faint)',
                fontFamily: 'var(--mono)',
                fontSize: 'var(--step--2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                <span>Or continue with</span>
                <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                style={{ width: '100%' }}
                onClick={() => {
                  const next = new URLSearchParams(window.location.search).get('next') || '/workspace/people';
                  window.location.href = `/auth/google?next=${encodeURIComponent(next)}`;
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ marginRight: '8px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <p className="auth-switch" style={{
                textAlign: 'center',
                fontSize: 'var(--step--1)',
                color: 'var(--text-muted)',
                margin: 'var(--space-2) 0 0',
              }}>
                {isSignIn ? (
                  <>New to the network? <Link href={`/sign-up?next=${encodeURIComponent(new URLSearchParams(window.location.search).get('next') || '/workspace/people')}`} className="auth-link" style={{ color: 'var(--terrain)', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color var(--fast)' }}>Create an account</Link></>
                ) : (
                  <>Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(new URLSearchParams(window.location.search).get('next') || '/workspace/people')}`} className="auth-link" style={{ color: 'var(--terrain)', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color var(--fast)' }}>Sign in</Link></>
                )}
              </p>

              <div className="auth-local-notice" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                margin: 'var(--space-2) 0 var(--space-4)',
                background: 'var(--info-bg)',
                border: '1px solid var(--info)',
                borderRadius: 'var(--radius-3)',
                fontSize: 'var(--step--1)',
                color: 'var(--info)',
                lineHeight: '1.5',
              }}>
                <span style={{ flexShrink: 0, fontSize: 'var(--step-0)', marginTop: '2px' }}>ℹ</span>
                <span>Workspace context stored locally for demo</span>
              </div>
            </form>
          </CardBody>

          <div className="auth-card-footer" style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--bg-subtle)',
            textAlign: 'center',
          }}>
            <p className="auth-footer-text" style={{
              margin: '0 0 var(--space-1)',
              fontFamily: 'var(--serif)',
              fontSize: 'var(--step--1)',
              color: 'var(--text-muted)',
            }}>
              For the people, by the people—built with care.
            </p>
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
