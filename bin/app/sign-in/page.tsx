import { SiteHeader } from '@/components/site-header';
import { AuthEntry } from './auth-entry';
import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Sign in — APT-LABS',
  description: 'Sign in to your APT-LABS account with email and password.',
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/workspace');
  const localMode = isLocalAuthEnabled();
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
      <AuthEntry callbackError={callbackError} localMode={localMode} next={next} />
      <footer className="page-footer"><span>APT-LABS / ACCESS</span><span>Membership and crew permissions are checked on the server.</span></footer>
    </main>
  );
}
