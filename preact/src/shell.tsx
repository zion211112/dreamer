import type { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { signOut, useAuth } from './session';

const destinations = [
  { href: '/workspace', label: 'Home', icon: 'M3 10 12 3l9 7v11h-6v-6H9v6H3z' },
  { href: '/workspace/commons', label: 'Commons', icon: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5' },
  { href: '/workspace/workbench', label: 'Workbench', icon: 'M3 7h18v14H3zM7 7V4h10v3M3 12h18M10 12v2h4v-2' },
  { href: '/workspace/network', label: 'Network', icon: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m14-4a4 4 0 0 1 3 4M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-1a4 4 0 0 0-2-7' },
  { href: '/workspace/records', label: 'Records', icon: 'M7 3h8l5 5v13H7zM15 3v6h5M10 13h7M10 17h7' },
];

export function AppShell({ children }: { children: ComponentChildren }) {
  const location = useLocation();
  const { session, refresh } = useAuth();
  const current = useMemo(() => destinations.find((item) => item.href === location.path || (item.href !== '/workspace' && location.path.startsWith(`${item.href}/`))) ?? destinations[0], [location.path]);
  return <div class="app-shell">
    <a class="skip-link" href="#workspace-main">Skip to main content</a>
    <header class="topbar">
      <a class="brand" href="/workspace" aria-label="APT-LABS home"><span class="brand-mark" aria-hidden="true">A</span><span>APT-LABS</span></a>
      <div class="top-context"><span class="context-label">WORKSPACE</span><span>{current.label}</span></div>
      <div class="top-tools"><label class="search-control"><span class="sr-only">Search open work in Commons</span><input type="search" placeholder="Search open work" onKeyDown={(event) => { if (event.key === 'Enter') location.route(`/workspace/commons?q=${encodeURIComponent((event.currentTarget as HTMLInputElement).value)}`); }} /><span class="search-hint">↵</span></label></div>
    </header>
    <div class="shell-body">
      <nav class="primary-rail" aria-label="Workspace destinations"><div class="rail-caption">Workspace</div>{destinations.map((item) => {
        const active = item.href === '/workspace' ? location.path === item.href : location.path === item.href || location.path.startsWith(`${item.href}/`);
        return <a key={item.href} class="rail-link" href={item.href} aria-current={active ? 'page' : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={item.icon} /></svg><span>{item.label}</span></a>;
      })}<div class="rail-support"><a href="/workspace/reference" aria-current={location.path === '/workspace/reference' ? 'page' : undefined}>Reference <span>Typed record explorer</span></a></div><div class="rail-account"><span class="account-mark" aria-hidden="true">{session?.user.name.trim().charAt(0).toUpperCase() ?? 'A'}</span><span class="account-copy"><strong>{session?.user.name}</strong><small>Signed in</small></span><button class="sign-out" type="button" onClick={async () => { await signOut(); await refresh(); location.route('/sign-in', true); }}>Sign out</button></div></nav>
      <main class="main-content" id="workspace-main" tabIndex={-1}>{children}</main>
      <footer class="statusbar"><span>{current.label}</span><span>Only records your session may access</span><a href="/workspace/reference">Reference</a></footer>
    </div>
  </div>;
}
