import { redirect } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace-shell';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getMarketTenders } from '@/lib/tender-repository';
import { getAuthenticatedUserProfileData } from '@/lib/user-profile';
import { listProblemBriefs } from './actions';

export const metadata = {
  title: 'APT-LABS — Workspace',
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
    <WorkspaceShell
      initialTenders={tenders}
      initialBriefs={briefsResult.briefs ?? []}
      userEmail={workspace.email ?? ''}
      profileData={profileData}
      localMode={workspace.localMode}
    />
  );
}
