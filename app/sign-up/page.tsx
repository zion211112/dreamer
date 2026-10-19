import { SiteHeader } from '@/components/site-header';
import { AuthEntry } from '../sign-in/auth-entry';
import { hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Create an account — APT-LABS',
  description: 'Join APT-LABS with Google, GitHub, email, or prototype guest access.',
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/workspace');
  const configured = hasSupabaseConfiguration();

  return (
    <main className="site-shell">
      <SiteHeader />
      <AuthEntry configured={configured} mode="sign-up" next={next} />
      <footer className="page-footer"><span>APT-LABS / ACCOUNT ACCESS</span><span>Public Market and Roll remain available without an account.</span></footer>
    </main>
  );
}
