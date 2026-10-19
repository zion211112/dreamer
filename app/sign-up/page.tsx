import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SignInForm } from '../sign-in/sign-in-form';
import { hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Create an account — APT-LABS',
  description: 'Create an APT-LABS account with an email sign-in link.',
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/workspace');
  const configured = hasSupabaseConfiguration();

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="sign-in-panel">
        <p className="eyebrow">CREATE AN IDENTITY · ACCESS IS SEPARATE</p>
        <h1>Start with an account.</h1>
        <p>An account lets you sign in. School membership, crew assignment, and Commons contribution each require separate approval. No wallet or cryptographic keypair is created.</p>
        {configured
          ? <SignInForm mode="sign-up" next={next} />
          : <div className="setup-notice" role="status"><strong>Account creation is not configured here.</strong><p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for this deployment. No signup request was sent.</p></div>}
        <Link className="text-link" href="/sign-in">Already have an account? Sign in <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="page-footer"><span>APT-LABS / ACCOUNT ACCESS</span><span>Public Market and Roll remain available without an account.</span></footer>
    </main>
  );
}
