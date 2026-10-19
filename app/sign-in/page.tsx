import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SignInForm } from './sign-in-form';
import { hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Sign in — APT-LABS',
  description: 'Sign in to your APT-LABS account.',
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
    <main className="site-shell">
      <SiteHeader />
      <section className="sign-in-panel">
        <p className="eyebrow">ONE IDENTITY · PERMISSIONS BY MEMBERSHIP</p>
        <h1>Welcome back.</h1>
        <p>Sign in to your workspace. School, crew, and Commons access are granted separately; an account alone does not assign a role.</p>
        {callbackError && <p className="inline-error" role="alert">{callbackError}</p>}
        {configured
          ? <SignInForm next={next} />
          : <div className="setup-notice" role="status"><strong>Sign-in is not configured here.</strong><p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for this deployment. No sign-in request was sent.</p></div>}
        <Link className="text-link" href="/sign-up">New to the network? Create an account <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="page-footer"><span>APT-LABS / ACCOUNT ACCESS</span><span>Membership and crew permissions are checked on the server.</span></footer>
    </main>
  );
}
