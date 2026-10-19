import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { getWorkspaceContext } from '@/lib/workspace-access';

export async function SiteHeader() {
  const context = await getWorkspaceContext();

  return (
    <header className={`site-header ${context.authenticated ? 'site-header-signed-in' : ''}`}>
      <div className="site-header-brand">
        <Link aria-label="APT-LABS home" className="wordmark" href="/">
          <span aria-hidden="true" className="wordmark-symbol">A</span>
          <span>APT<span className="wordmark-dash">—</span>LABS</span>
        </Link>
        {context.authenticated && (
          <Suspense fallback={<span className="workspace-switcher workspace-switcher-loading">Loading context…</span>}>
            <WorkspaceSwitcher
              contexts={context.contexts}
              defaultContextKey={context.defaultContextKey}
              defaultWorkspace={context.defaultWorkspace}
            />
          </Suspense>
        )}
      </div>
      <nav aria-label="Main navigation" className="site-nav">
        <Link href="/tenders">Work</Link>
        <Link href="/commons">Commons</Link>
        <Link href="/roll">The Roll</Link>
        <Link href="/console">School Console</Link>
      </nav>
      <div className="header-actions">
        {context.authenticated
          ? <span className="header-account">{context.email ?? 'Signed in'}</span>
          : <>
              <Link className="header-sign-in" href="/sign-in">Sign in</Link>
              <Link className="header-issue" href="/sign-up">Create account <ArrowUpRight aria-hidden="true" size={14} /></Link>
            </>}
      </div>
    </header>
  );
}
