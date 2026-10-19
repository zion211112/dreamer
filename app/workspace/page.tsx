import { redirect } from 'next/navigation';
import { WorkspaceCockpit } from '@/components/workspace-cockpit';
import { getMarketTenders, getPublicRoll } from '@/lib/tender-repository';
import { isWorkspaceLane, resolveWorkspaceContext } from '@/lib/workspace';
import { getWorkspaceContext } from '@/lib/workspace-access';

export const metadata = {
  title: 'APT-LABS Execution Cockpit',
  description: 'A role-aware workspace for the Demand, Tender, Assembly and Roll loop.',
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
  if (workspace.configured && !workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const active = workspace.authenticated
    ? resolveWorkspaceContext(workspace.contexts, requestedContext, workspace.defaultContextKey)
    : { context: null, invalid: Boolean(requestedContext) };
  const [tenders, roll] = await Promise.all([getMarketTenders(), getPublicRoll()]);

  return (
    <WorkspaceCockpit
      configured={workspace.configured}
      context={active.context}
      contexts={workspace.contexts}
      email={workspace.email}
      invalidContext={active.invalid}
      roll={roll}
      tenders={tenders}
      view={isWorkspaceLane(view) ? view : 'demand'}
    />
  );
}
