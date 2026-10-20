import { SiteHeader } from '@/components/site-header';
import { AuthEntry } from '../sign-in/auth-entry';
import { isLocalAuthEnabled } from '@/lib/auth-mode';
import { safeReturnPath } from '@/lib/supabase/urls';

export const metadata = {
  title: 'Create an account — APT-LABS',
  description: 'Create an APT-LABS account with Google, GitHub, or email and password.',
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? '/workspace');
  const localMode = isLocalAuthEnabled();

  return (
    <main className="site-shell">
      <SiteHeader />
      <AuthEntry localMode={localMode} mode="sign-up" next={next} />
      <footer className="page-footer"><span>APT-LABS / ACCOUNT ACCESS</span><span>Public Market and Roll remain available without an account.</span></footer>
    </main>
  );
}
