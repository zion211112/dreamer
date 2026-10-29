import { redirect } from 'next/navigation';
import { WorkspaceDesk } from '@/components/workspace-desk';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getMarketTenders } from '@/lib/tender-repository';
import { getAuthenticatedUserProfileData } from '@/lib/user-profile';
import { listProblemBriefs } from './actions';

export const metadata = {
  title: 'APT-LABS — Field Desk',
  description: 'Network workspace. Live Supabase records plus illustrative scenario data.',
};

export default async function WorkspacePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

  const [tenders, briefsResult, profileData] = await Promise.all([
    getMarketTenders().catch(() => []),
    listProblemBriefs(),
    getAuthenticatedUserProfileData(),
  ]);

  return (
    <WorkspaceDesk
      initialTenders={tenders}
      initialBriefs={briefsResult.briefs ?? []}
      userEmail={workspace.email ?? ''}
      profileData={profileData}
      localMode={workspace.localMode}
      workspaceContexts={workspace}
    />
  );
}