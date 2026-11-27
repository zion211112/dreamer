import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { authClient } from './auth';
import { useAuth } from './session';

function safeRedirect(value: string | undefined) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/workspace';
}

export function LandingPage() {
  const { session, loading } = useAuth();
  const location = useLocation();
  return <main class="landing-page"><div class="landing-nav"><a class="brand" href="/"><span class="brand-mark">A</span>APT-LABS</a><a class="button button-primary" href={session ? '/workspace' : '/sign-in'}>{loading ? 'Checking session…' : session ? 'Open workspace' : 'Sign in'}</a></div><section class="landing-hero"><p class="eyebrow">A shared network for productive work</p><h1>Make capacity visible.<br /><em>Make work connect.</em></h1><p>Bring people, organizations, needs, and accountable work into one shared record—so what gets built can carry forward.</p><div class="landing-actions"><a class="button button-primary" href={session ? '/workspace' : '/sign-up'}>{session ? 'Go to your work' : 'Create an account'}</a><a class="text-link" href="/sign-in">Already have an account? Sign in</a></div><div class="landing-foot"><span>People retain agency.</span><span>Work stays attributable.</span><span>Evidence stays distinct from claims.</span></div></section></main>;
}

export function SignInPage() { return <AuthPage signup={false} />; }
export function SignUpPage() { return <AuthPage signup />; }

function AuthPage({ signup }: { signup: boolean }) {
  const location = useLocation();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(new URLSearchParams(location.query).get('unavailable') === '1' ? 'Authentication service is unavailable. Try again later.' : '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const errors = {
    name: signup && !name.trim() ? 'Your name is required.' : '',
    email: !email ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : '',
    password: !password ? 'Password is required.' : signup && password.length < 8 ? 'Use at least 8 characters.' : '',
    confirm: signup && confirm !== password ? 'Passwords must match.' : '',
  };
  const submit = async (event: Event) => {
    event.preventDefault();
    setTouched(true); setError(''); setNotice('');
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    try {
      const result = signup
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) { setError(result.error.message || 'Authentication failed. Check your details and try again.'); return; }
      if (signup) {
        setNotice('Account created. Email verification and password recovery are not configured yet. Sign in with your new account.');
        return;
      }
      await refresh();
      location.route(safeRedirect(new URLSearchParams(location.query).get('redirect') ?? undefined), true);
    } catch {
      setError('Authentication service is unavailable. Try again later.');
    } finally { setBusy(false); }
  };
  return <main class="auth-page"><a class="brand" href="/"><span class="brand-mark">A</span>APT-LABS</a><section class="auth-panel"><p class="eyebrow">Personal identity · shared network</p><h1>{signup ? 'Create your account' : 'Welcome back'}</h1><p class="muted">{signup ? 'Start with your personal identity. Choose where and how to participate later.' : 'Sign in to continue to your workspace.'}</p><nav class="auth-tabs" aria-label="Account access"><a href={`/sign-in${location.query ? `?${new URLSearchParams(location.query)}` : ''}`} aria-current={!signup ? 'page' : undefined}>Sign in</a><a href="/sign-up" aria-current={signup ? 'page' : undefined}>Create account</a></nav>
    {error && <p class="form-error" role="alert">{error}</p>}{notice && <p class="form-notice" role="status">{notice}</p>}
    <form onSubmit={submit} noValidate>
      {signup && <div class="field"><label for="name">Your name</label><input id="name" name="name" autoComplete="name" value={name} onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)} onBlur={() => setTouched(true)} aria-invalid={Boolean(touched && errors.name)} />{touched && errors.name && <small>{errors.name}</small>}</div>}
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onInput={(e) => setEmail((e.currentTarget as HTMLInputElement).value)} onBlur={() => setTouched(true)} aria-invalid={Boolean(touched && errors.email)} />{touched && errors.email && <small>{errors.email}</small>}</div>
      <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onInput={(e) => setPassword((e.currentTarget as HTMLInputElement).value)} onBlur={() => setTouched(true)} aria-invalid={Boolean(touched && errors.password)} />{touched && errors.password && <small>{errors.password}</small>}</div>
      {signup && <div class="field"><label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" value={confirm} onInput={(e) => setConfirm((e.currentTarget as HTMLInputElement).value)} onBlur={() => setTouched(true)} aria-invalid={Boolean(touched && errors.confirm)} />{touched && errors.confirm && <small>{errors.confirm}</small>}</div>}
      <button class="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
    </form><p class="auth-boundary">Authentication is provided by APT-LABS. If the service is unavailable, access is denied; there is no demo sign-in.</p></section></main>;
}
