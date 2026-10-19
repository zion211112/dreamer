import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { OpportunityBoard } from '@/components/opportunity-board';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getMarketTenders } from '@/lib/tender-repository';
import { getCommonsOpportunities, getVisibleOpportunityApplications } from '@/lib/opportunities';

export const metadata = {
  title: 'Opportunities — APT-LABS Commons',
  description: 'Asset-linked roles for builders, founders and verified execution teams.',
};

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const [{ mode }, workspace, tenders, listing] = await Promise.all([
    searchParams,
    getWorkspaceContext(),
    getMarketTenders(),
    getCommonsOpportunities(),
  ]);
  const guest = mode === 'guest';
  let applications: Awaited<ReturnType<typeof getVisibleOpportunityApplications>> = [];
  let applicationError: string | null = null;
  try {
    if (!guest && workspace.authenticated) {
      applications = await getVisibleOpportunityApplications(listing.opportunities.map(opportunity => opportunity.id));
    }
  } catch (error) {
    applicationError = error instanceof Error ? error.message : 'Visible applications could not be loaded.';
  }
  const eligibleAssets = tenders.filter(tender =>
    !tender.isIllustrative &&
    !['draft', 'cancelled', 'deployed'].includes(tender.status)
  );
  const canPublish = !guest && workspace.contexts.some(context =>
    context.kind === 'school' && ['principal', 'tender_issuer'].includes(context.role)
  );

  return (
    <main className="site-shell opportunities-shell">
      <SiteHeader guest={guest} />
      <div className="opportunities-back"><Link href={guest ? '/commons?mode=guest' : '/commons'}><ArrowLeft aria-hidden="true" size={14} /> Commons</Link><span><Compass aria-hidden="true" size={13} /> NETWORK / OPPORTUNITIES</span></div>
      {applicationError && <p className="opportunity-alert" role="alert">{applicationError}</p>}
      <OpportunityBoard
        applications={applications}
        assets={eligibleAssets}
        authenticated={workspace.authenticated && !guest}
        canPublish={canPublish}
        configured={listing.configured}
        guest={guest}
        loadError={listing.error}
        opportunities={listing.opportunities}
      />
      <footer className="page-footer"><span>APT-LABS / COMMONS</span><span>Roles attach to Assets · proof comes from deployment</span></footer>
    </main>
  );
}
