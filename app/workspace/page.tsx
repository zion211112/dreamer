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
  searchParams: Promise<{ context?: string; view?: string; mode?: string }>;
}) {
  const [{ context: requestedContext, view, mode }, workspace] = await Promise.all([
    searchParams,
    getWorkspaceContext(),
  ]);
  const guest = mode === 'guest';
  if (!guest && workspace.configured && !workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const active = workspace.authenticated && !guest
    ? resolveWorkspaceContext(workspace.contexts, requestedContext, workspace.defaultContextKey)
    : { context: null, invalid: guest ? false : Boolean(requestedContext) };
  const [tenders, roll, commons] = await Promise.all([getMarketTenders(), getPublicRoll(), getCommonsActivity()]);

  return (
    <WorkspaceCockpit
      commonsPosts={commons.data ?? []}
      commonsError={commons.error}
      configured={workspace.configured}
      context={active.context}
      email={workspace.email}
      guest={guest}
      invalidContext={active.invalid}
      roll={roll}
      tenders={tenders}
      view={isWorkspaceLane(view) ? view : 'assets'}
    />
  );
}
