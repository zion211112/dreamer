import { redirect } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace-shell';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getMarketTenders } from '@/lib/tender-repository';
import { listProblemBriefs } from './actions';

export const metadata = {
  title: 'APT-LABS — Workspace',
  description: 'Network workspace. Live Supabase records plus illustrative scenario data.',
};

export default async function WorkspacePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const [tenders, briefsResult] = await Promise.all([
    getMarketTenders().catch(() => []),
    listProblemBriefs(),
  ]);

  return (
    <main className="site-shell studio-shell">
      <WorkspaceShell
        initialTenders={tenders}
        initialBriefs={briefsResult.briefs ?? []}
        userEmail={workspace.email ?? ''}
        localMode={workspace.localMode}
        defaultWorkspace={workspace.defaultWorkspace}
        contexts={workspace.contexts}
        defaultContextKey={workspace.defaultContextKey}
        canPersistPreference={!workspace.localMode}
      />
    </main>
  );
}

