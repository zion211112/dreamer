import { redirect } from 'next/navigation';
import { WorkspaceCockpit } from '@/components/workspace-cockpit';
import { getMarketTenders, getPublicRoll } from '@/lib/tender-repository';
import { isWorkspaceLane, resolveWorkspaceContext } from '@/lib/workspace';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getCommonsActivity } from '@/lib/commons';

export const metadata = {
  title: 'APT-LABS Execution Cockpit',
  description: 'A role-aware studio connecting investable Assets, Commons teams and Roll-verified work.',
};

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; view?: string }>;
}) {
  const [{ context: requestedContext, view }, workspace] = await Promise.all([
    searchParams,
    getWorkspaceContext(),
  ]);
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const active = resolveWorkspaceContext(workspace.contexts, requestedContext, workspace.defaultContextKey);
  const [tenders, roll, commons] = await Promise.all([getMarketTenders(), getPublicRoll(), getCommonsActivity()]);

  return (
    <WorkspaceCockpit
      commonsPosts={commons.data ?? []}
      commonsError={commons.error}
      configured={workspace.configured}
      context={active.context}
      email={workspace.email}
      invalidContext={active.invalid}
      localMode={workspace.localMode}
      roll={roll}
      tenders={tenders}
      view={isWorkspaceLane(view) ? view : 'assets'}
    />
  );
}
