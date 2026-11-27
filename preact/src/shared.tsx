import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { signOut, useAuth } from './session';

export function PageHeader({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ComponentChildren; action?: ComponentChildren }) {
  return <header class="page-head"><div><p class="eyebrow">{eyebrow}</p><h1>{title}</h1>{children && <p class="lede">{children}</p>}</div>{action && <div class="page-actions">{action}</div>}</header>;
}

export function StateMessage({ title, children, retry, kind = 'empty' }: { title: string; children?: ComponentChildren; retry?: () => void; kind?: 'empty' | 'error' | 'loading' }) {
  return <section class={`state state-${kind}`} role={kind === 'error' ? 'alert' : kind === 'loading' ? 'status' : undefined} aria-live={kind === 'loading' ? 'polite' : undefined}><div><h2>{title}</h2>{children && <p>{children}</p>}</div>{retry && <button type="button" class="button button-quiet" onClick={retry}>Try again</button>}</section>;
}

export function ModuleLinks({ current, children }: { current: string; children: ComponentChildren }) {
  const location = useLocation();
  return <nav class="subnav" aria-label={`${current} sections`}><a href={`${location.path}/canon`} aria-current={location.path.endsWith('/canon') ? 'page' : undefined}>Canon</a>{children}</nav>;
}

export function SignOutButton() {
  const location = useLocation();
  const { refresh } = useAuth();
  return <button class="icon-button" type="button" onClick={async () => { await signOut(); await refresh(); location.route('/sign-in', true); }} aria-label="Sign out">Sign out</button>;
}

export function NotFoundPage() {
  return <main class="auth-check"><h1>Page not found</h1><p>This route is not part of the workspace.</p><a href="/workspace">Return to workspace</a></main>;
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

export function humanise(value: string) {
  return value.replaceAll('_', ' ').replaceAll('.', ' ');
}
