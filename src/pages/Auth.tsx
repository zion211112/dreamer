import { useEffect, useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import type { UserRole } from '../lib/auth/types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';

const workspacePaths = {
  annals: '/workspace/annals',
  people: '/workspace/people',
  school: '/workspace/institutions/school-console',
  commons: '/workspace/commons',
  workbench: '/workspace/workbench',
  roll: '/workspace/roll',
} as const;

const workspaces = [
  { id: 'annals', label: 'Branch / Annals' },
  { id: 'people', label: 'Parent / caregiver' },
  { id: 'school', label: 'School team' },
  { id: 'commons', label: 'Community member' },
  { id: 'workbench', label: 'Local provider / crew' },
  { id: 'roll', label: 'Coordinator / steward' },
];

type WorkspaceId = keyof typeof workspacePaths;
type SignUpRole = Extract<UserRole, 'founder' | 'institution' | 'coordinator'>;

function isWorkspaceId(value: string): value is WorkspaceId {
  return workspaces.some((workspace) => workspace.id === value);
}

function defaultWorkspaceForRole(_role: UserRole): WorkspaceId {
  return 'annals';
}

function getWorkspacePath(workspaceId: WorkspaceId): string {
  return workspacePaths[workspaceId];
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
  const [workspace, setWorkspace] = useState<WorkspaceId>('annals');
  const [workspaceCustomized, setWorkspaceCustomized] = useState(false);
  const [error, setError] = useState('');
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
      </header>

      <div className="auth-main">
        <section className="auth-form-panel" aria-labelledby="auth-title">
          <header className="auth-heading">
            <h1 id="auth-title">{isSignUp ? 'Create your account' : 'Sign in'}</h1>
          </header>

          <nav className="auth-mode-switch" aria-label="Account">
            <Link href="/sign-in" aria-current={!isSignUp ? 'page' : undefined}>
              Sign in
            </Link>
            <Link href="/sign-up" aria-current={isSignUp ? 'page' : undefined}>
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
        </section>
      </div>

    </main>
  );
}