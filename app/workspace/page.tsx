import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { WorkspaceShell } from '@/components/workspace-shell';
import { getWorkspaceContext } from '@/lib/workspace-access';

export const metadata = {
  title: 'APT-LABS — Network Workspace',
  description:
    'A working prototype of the APT-LABS network workspace. Illustrative scenario data only; no live transactions.',
};

export default async function WorkspacePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  return (
    <main className="site-shell studio-shell">
      <SiteHeader hideNav />
      <WorkspaceShell />
      <footer className="page-footer">
        <span>APT-LABS / NETWORK WORKSPACE</span>
        <span>Illustrative scenario data only. No live transactions, people, or funding.</span>
      </footer>
    </main>
  );
}
