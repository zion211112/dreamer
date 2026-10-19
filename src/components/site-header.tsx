import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowUpRight, Orbit } from 'lucide-react';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { getWorkspaceContext } from '@/lib/workspace-access';

export async function SiteHeader({ frontDoor = false }: { frontDoor?: boolean }) {
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
              contexts={context.contexts}
              defaultContextKey={context.defaultContextKey}
              defaultWorkspace={context.defaultWorkspace}
            />
          </Suspense>
        )}
      </div>
      {!frontDoor && (
        <nav aria-label="Main navigation" className="site-nav">
          <Link href="/tenders">Assets</Link>
          <Link href="/commons">Commons</Link>
          <Link href="/roll">Roll</Link>
        </nav>
      )}
      <div className="header-actions">
        {frontDoor
          ? <>
              {!signedIn && <Link className="header-sign-in" href="/sign-in">Sign in</Link>}
              <Link className="header-issue" href={signedIn ? '/workspace' : '/sign-in?next=%2Fworkspace'}>{signedIn ? 'Open studio' : 'Sign in to studio'} <ArrowUpRight aria-hidden="true" size={14} /></Link>
            </>
          : signedIn
          ? <span className="header-account">{context.email ?? 'Signed in'}</span>
          : <>
              <Link className="header-sign-in" href="/sign-in">Sign in</Link>
              <Link className="header-issue" href="/sign-in">Try studio <ArrowUpRight aria-hidden="true" size={14} /></Link>
            </>}
      </div>
    </header>
  );
}
