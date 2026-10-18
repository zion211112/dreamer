import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SignInForm } from './sign-in-form';
import { hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'School sign-in — APT-LABS',
  description: 'Request an email sign-in link for an authenticated school account.',
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/console');
  const configured = hasSupabaseConfiguration();
  const callbackError = params.error === 'missing-code'
    ? 'The sign-in link was incomplete. Request a new link.'
    : params.error === 'exchange-failed'
      ? 'The sign-in link could not be verified or has expired. Request a new link.'
      : params.error === 'configuration'
        ? 'Supabase configuration is missing for this deployment.'
        : '';
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="sign-in-panel">
        <p className="eyebrow">AUTHENTICATED SCHOOL ACCESS</p>
        <h1>Sign in to continue.</h1>
        <p>School publishing and private Assembly actions require a verified session and the right school membership. A Console view switch is not an account.</p>
        {callbackError && <p className="inline-error" role="alert">{callbackError}</p>}
        {configured
          ? <SignInForm next={next} />
          : <div className="setup-notice" role="status"><strong>Sign-in is not configured here.</strong><p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for this deployment. No sign-in request was sent.</p></div>}
        <Link className="text-link" href="/console">Return to local Console <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="page-footer"><span>APT-LABS / AUTHENTICATION</span><span>School roles are checked on the server before shared actions.</span></footer>
    </main>
  );
}
