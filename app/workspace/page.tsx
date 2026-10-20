import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { StudioShell } from '@/components/studio/studio-shell';
import { assembleStudioDataset } from '@/lib/workbench/dataset';
import { deriveStudio } from '@/lib/workbench/derive';
import { isWorkspaceLane, resolveWorkspaceContext } from '@/lib/workspace';
import { getWorkspaceContext } from '@/lib/workspace-access';

export const metadata = {
  title: 'APT-LABS Network Studio',
  description:
    'A role-aware studio connecting investable Assets, Commons teams and Roll-verified work. It shows only what the server returned to the signed-in account.',
};

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; view?: string; focus?: string }>;
}) {
  const [{ context: requestedContext, view, focus }, workspace] = await Promise.all([
    searchParams,
    getWorkspaceContext(),
  ]);
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const active = resolveWorkspaceContext(workspace.contexts, requestedContext, workspace.defaultContextKey);
  const lane = isWorkspaceLane(view) ? view : 'assets';

  const dataset = await assembleStudioDataset({
    context: active.context,
    invalidContext: active.invalid,
    email: workspace.email,
    localMode: workspace.localMode,
    configured: workspace.configured,
  });
  const derivation = deriveStudio(dataset, focus);

  return (
    <main className="site-shell studio-shell">
      <SiteHeader hideNav />
      <StudioShell
        contextKey={active.context?.key ?? 'network'}
        dataset={dataset}
        derivation={derivation}
        view={lane}
      />
    </main>
  );
}
