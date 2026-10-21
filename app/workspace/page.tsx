import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { WorkspaceShell } from '@/components/workspace-shell';
import { getWorkspaceContext } from '@/lib/workspace-access';

export const metadata = {
  title: 'APT-LABS — Workspace',
  description: 'Network workspace. Illustrative scenario data only.',
};

export default async function WorkspacePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  return (
    <main className="site-shell studio-shell">
      <SiteHeader hideNav />
      <WorkspaceShell />
    </main>
  );
}
