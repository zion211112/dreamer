import { useEffect, useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import type { UserRole } from '../lib/auth/types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';

const workspacePaths = {
  people: '/workspace/people',
  school: '/workspace/institutions/school-console',
  commons: '/workspace/commons',
  workbench: '/workspace/workbench',
  roll: '/workspace/roll',
} as const;

const workspaces = [
  { id: 'people', label: 'Parent / caregiver' },
  { id: 'school', label: 'School team' },
  { id: 'commons', label: 'Community member' },
  { id: 'workbench', label: 'Local provider / crew' },
  { id: 'roll', label: 'Coordinator / steward' },
];

type WorkspaceId = keyof typeof workspacePaths;
type SignUpRole = Extract<UserRole, 'founder' | 'institution' | 'coordinator'>;
type AuthMethod = 'Google' | 'GitHub' | 'phone';

function isWorkspaceId(value: string): value is WorkspaceId {
  return workspaces.some((workspace) => workspace.id === value);
}

function defaultWorkspaceForRole(role: UserRole): WorkspaceId {
  if (role === 'institution') return 'school';
  if (role === 'coordinator') return 'roll';
  return 'people';
}

function getWorkspacePath(workspaceId: WorkspaceId): string {
  return workspacePaths[workspaceId];
}

function AuthMethodIcon({ method }: { method: AuthMethod }) {
  if (method === 'Google') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.48h3.24c1.9-1.75 2.98-4.33 2.98-7.3Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.48c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.75-5.58-4.1H3.08v2.56A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.42 13.93a6 6 0 0 1 0-3.86V7.5H3.08a10 10 0 0 0 0 9Z" />
        <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.5l2.86-2.86A9.56 9.56 0 0 0 12 1.99a10 10 0 0 0-8.92 5.5l3.34 2.58c.78-2.35 2.98-4.1 5.58-4.1Z" />
      </svg>
    );
  }

  if (method === 'GitHub') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.75 2.3 3.87 1.64.1-.73.4-1.23.7-1.51-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.06 1.15a10.6 10.6 0 0 1 5.57 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.55.23 2.69.12 2.98.72.78 1.15 1.78 1.15 3 0 4.29-2.6 5.23-5.09 5.5.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M7.1 3.5h2.5l1.2 4.2-1.8 1.8a15 15 0 0 0 5.5 5.5l1.8-1.8 4.2 1.2v2.5a2 2 0 0 1-2.2 2A16.3 16.3 0 0 1 5.1 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Auth() {
  const [location, navigate] = useLocation();
  const { signUp, signIn, loading, error: authError, profile } = useAuth();
  const isSignUp = location === '/sign-up';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<SignUpRole>('founder');
  const [organizationName, setOrganizationName] = useState('');
  const [workspace, setWorkspace] = useState<WorkspaceId>('people');
  const [workspaceCustomized, setWorkspaceCustomized] = useState(false);
  const [error, setError] = useState('');
  const [methodNotice, setMethodNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; displayName?: string }>({});

  useEffect(() => {
    if (profile && !workspaceCustomized) {
      setWorkspace(defaultWorkspaceForRole(profile.role));
    }
  }, [profile, workspaceCustomized]);

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

  const validateDisplayName = (value: string) => {
    if (!value.trim()) return 'Display name is required.';
    return '';
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, isSignUp);
    const confirmError = isSignUp ? validateConfirmPassword(confirmPassword, password) : '';
    const displayNameError = isSignUp ? validateDisplayName(displayName) : '';

    if (emailError || passwordError || confirmError || displayNameError) {
      setFieldErrors({ email: emailError, password: passwordError, confirmPassword: confirmError, displayName: displayNameError });
      return;
    }

    const requestedNext = new URLSearchParams(window.location.search).get('next');
    const validNext = requestedNext
      && requestedNext.startsWith('/')
      && !requestedNext.startsWith('//')
      && !requestedNext.includes('\\')
      ? requestedNext
      : null;

    try {
      let result;
      if (isSignUp) {
        result = await signUp({ email, password, displayName, role, organizationName });
      } else {
        result = await signIn({ email, password });
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      const defaultWorkspace = defaultWorkspaceForRole(result.profile?.role ?? role);
      const destination = workspaceCustomized ? workspace : defaultWorkspace;
      navigate(validNext ?? getWorkspacePath(destination));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    }
  };

  return (
    <main className="auth-layout">
      <header className="auth-header">
        <BrandMark size="sm" />
        <span className="auth-demo-status"><span aria-hidden="true" />Browser-local demo</span>
      </header>

      <div className="auth-main">
        <section className="auth-form-panel" aria-labelledby="auth-title">
          <header className="auth-heading">
            <h1 id="auth-title">{isSignUp ? 'Create your account' : 'Sign in'}</h1>
          </header>

          <nav className="auth-mode-switch" aria-label="Account">
            <Link href="/sign-in" aria-current={!isSignUp ? 'page' : undefined} onClick={() => setMethodNotice('')}>
              Sign in
            </Link>
            <Link href="/sign-up" aria-current={isSignUp ? 'page' : undefined} onClick={() => setMethodNotice('')}>
              Create account
            </Link>
          </nav>

          <form onSubmit={handleSubmit} className="auth-form">
            {(error || authError) && <p className="auth-error" role="alert">{error || authError}</p>}

            {isSignUp && (
              <div className="auth-field">
                <label htmlFor="auth-display-name">Display name</label>
                <Input
                  id="auth-display-name"
                  name="displayName"
                  type="text"
                  placeholder="Your name or venture name"
                  value={displayName}
                  onChange={(value: string) => { setDisplayName(value); setFieldErrors(prev => ({ ...prev, displayName: validateDisplayName(value) })); }}
                  onBlur={() => setFieldErrors(prev => ({ ...prev, displayName: validateDisplayName(displayName) }))}
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(fieldErrors.displayName)}
                  aria-describedby={fieldErrors.displayName ? 'auth-display-name-error' : undefined}
                />
                {fieldErrors.displayName && <p id="auth-display-name-error" className="auth-field-error" role="alert">{fieldErrors.displayName}</p>}
              </div>
            )}

            {isSignUp && role === 'institution' && (
              <div className="auth-field">
                <label htmlFor="auth-org-name">Organization name</label>
                <Input
                  id="auth-org-name"
                  name="organizationName"
                  type="text"
                  placeholder="School, cooperative, company name"
                  value={organizationName}
                  onChange={(value: string) => setOrganizationName(value)}
                  autoComplete="organization"
                />
              </div>
            )}

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

            <div className={`auth-onboarding-bar${isSignUp ? '' : ' auth-onboarding-bar-single'}`}>
              {isSignUp && (
                <div className="auth-field">
                  <label htmlFor="auth-role">Role</label>
                  <select
                    id="auth-role"
                    name="role"
                    value={role}
                    onChange={(event: Event) => {
                      const selectedRole = (event.target as HTMLSelectElement).value;
                      if (selectedRole === 'founder' || selectedRole === 'institution' || selectedRole === 'coordinator') {
                        setRole(selectedRole);
                        if (!workspaceCustomized) setWorkspace(defaultWorkspaceForRole(selectedRole));
                      }
                    }}
                    required
                  >
                    <option value="founder">Founder / business / crew</option>
                    <option value="institution">School / institution</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="auth-workspace">Start in</label>
                <select
                  id="auth-workspace"
                  name="workspace"
                  value={workspace}
                  onChange={(event: Event) => {
                    const selectedWorkspace = (event.target as HTMLSelectElement).value;
                    if (isWorkspaceId(selectedWorkspace)) {
                      setWorkspace(selectedWorkspace);
                      setWorkspaceCustomized(true);
                    }
                  }}
                  required
                >
                  {workspaces.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="auth-submit" size="lg" disabled={loading}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create account' : 'Sign in')}
            </Button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>
          <div className="auth-provider-options" role="group" aria-label="Other sign-in methods">
            {(['Google', 'GitHub', 'phone'] as const).map((method) => (
              <button
                key={method}
                type="button"
                className="auth-provider-button"
                aria-label={`Continue with ${method}`}
                title={`Continue with ${method}`}
                onClick={() => setMethodNotice(`${method} sign-in is not connected in this browser-local demo.`)}
              >
                <AuthMethodIcon method={method} />
              </button>
            ))}
          </div>
          <p className="auth-provider-note">Google, GitHub, and phone sign-in are not connected.</p>
          {methodNotice && <p className="auth-method-notice" role="status">{methodNotice}</p>}
        </section>
      </div>

      <footer className="auth-footer">
        <span>Browser-local demo. Passwords are not stored.</span>
      </footer>
    </main>
  );
}