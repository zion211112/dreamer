import { SiteHeader } from '@/components/site-header';
import { AuthEntry } from './auth-entry';
import { directSignIn } from './actions';
import { hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Sign in — APT-LABS',
  description: 'Sign in to your APT-LABS account with Google, GitHub, or email and password.',
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/workspace');
  const configured = hasSupabaseConfiguration();
  const callbackError = params.error === 'missing-code'
    ? 'The sign-in link was incomplete. Request a new link.'
    : params.error === 'exchange-failed'
      ? 'The sign-in link could not be verified or has expired. Request a new link.'
      : params.error === 'configuration'
        ? 'Supabase configuration is missing for this deployment.'
        : params.error === 'session-failed'
          ? 'The sign-in link was accepted, but an account session could not be loaded. Request a fresh link.'
        : '';
  return (
    <main className="site-shell auth-shell">
      <SiteHeader />
      <section className="auth-entry">
        <div className="auth-entry-brand">
          <span className="wordmark-symbol" aria-hidden="true">A</span>
          <span>APT<span className="wordmark-dash">—</span>LABS</span>
        </div>
        <form action={directSignIn} className="sign-in-form direct-sign-in">
          <input name="email" type="hidden" value="admin" />
          <input name="password" type="hidden" value="root" />
          <input name="intent" type="hidden" value="sign-in" />
          <input name="next" type="hidden" value={next} />
          <button className="button button-primary" type="submit">Direct sign in (dev)</button>
          <p className="auth-provider-note">No credentials required while security is disabled.</p>
        </form>
      </section>
      <AuthEntry callbackError={callbackError} configured={configured} next={next} />
      <footer className="page-footer"><span>APT-LABS / ACCESS</span><span>Membership and crew permissions are checked on the server.</span></footer>
    </main>
  );
}
