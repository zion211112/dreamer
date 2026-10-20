import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { signOut } from '@/lib/supabase/sign-out';

export async function SiteHeader({ frontDoor = false, hideNav = false }: { frontDoor?: boolean; hideNav?: boolean }) {
  const context = await getWorkspaceContext();
  const signedIn = context.authenticated;

  return (
    <header className={`site-header ${signedIn ? 'site-header-signed-in' : ''}`}>
      <div className="site-header-brand">
        <Link aria-label="APT-LABS home" className="wordmark" href="/">
          <span aria-hidden="true" className="wordmark-symbol">A</span>
          <span>APT<span className="wordmark-dash">—</span>LABS</span>
        </Link>
        {signedIn && (
          <Suspense fallback={<span className="workspace-switcher workspace-switcher-loading">Loading context…</span>}>
            <WorkspaceSwitcher
              canPersistPreference={!context.localMode}
              contexts={context.contexts}
              defaultContextKey={context.defaultContextKey}
              defaultWorkspace={context.defaultWorkspace}
            />
          </Suspense>
        )}
      </div>
      {!frontDoor && !hideNav && signedIn && (
        <nav aria-label="Main navigation" className="site-nav">
          <Link href="/tenders">Assets</Link>
          <Link href="/commons">Commons</Link>
          <Link href="/roll">Roll</Link>
        </nav>
      )}
      <div className="header-actions">
        {signedIn
          ? <>
              <span className="header-account">{context.email ?? 'Signed in'}</span>
              {context.localMode && <span className="local-badge">LOCAL</span>}
              <Link className="header-issue" href="/workspace">User dashboard <ArrowUpRight aria-hidden="true" size={14} /></Link>
              <form action={signOut}>
                <button className="header-sign-in" type="submit">Sign out</button>
              </form>
            </>
          : <Link
              className="header-issue"
              href={frontDoor ? '/sign-in?next=%2Fworkspace' : '/sign-in'}
            >
              User dashboard <ArrowUpRight aria-hidden="true" size={14} />
            </Link>}
      </div>
    </header>
  );
}
