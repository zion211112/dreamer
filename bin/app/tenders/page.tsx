import { SiteHeader } from '@/components/site-header';
import { InstitutionDirectory, type InstitutionCardData } from '@/components/institution-directory';
import { InstitutionProfileForm } from '@/components/institution-profile-form';
import { getPublishedInstitutions } from '@/lib/institution-directory';
import { getWorkspaceContext } from '@/lib/workspace-access';
import { getCommonsOpportunities } from '@/lib/opportunities';

export const metadata = {
  title: 'Institutions — APT-LABS',
  description: 'Browse institutions with published profiles and links to eligible work.',
};

export default async function TendersPage() {
  const [directory, workspace, opportunityListing] = await Promise.all([
    getPublishedInstitutions(),
    getWorkspaceContext(),
    getCommonsOpportunities(),
  ]);
  const principalContexts = workspace.authenticated && !workspace.localMode
    ? workspace.contexts.filter(context => context.kind === 'school' && context.role === 'principal')
    : [];
  const opportunitiesByInstitution = new Map<string, number>();
  for (const opportunity of opportunityListing.opportunities) {
    if (!opportunity.organization_id) continue;
    opportunitiesByInstitution.set(
      opportunity.organization_id,
      (opportunitiesByInstitution.get(opportunity.organization_id) ?? 0) + 1,
    );
  }
  const cards: InstitutionCardData[] = directory.institutions.map(institution => ({
    id: institution.id,
    name: institution.name,
    kind: institution.kind,
    location: institution.location,
    summary: institution.summary,
    opportunityCount: opportunityListing.error ? null : opportunitiesByInstitution.get(institution.id) ?? 0,
    fundingSlug: institution.fundingSlug,
  }));
  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="page-intro institution-intro">
        <p className="eyebrow"><span className="section-index">01</span> INSTITUTIONS / PUBLIC DIRECTORY</p>
        <h1>Institutions.</h1>
        <p>Published profiles linked to real work and contact-only funding enquiries.</p>
      </section>
      <section aria-label="Published institutions" className="institution-section">
        <InstitutionDirectory
          configured={directory.configured}
          institutions={cards}
          loadError={directory.error}
          dataWarning={opportunityListing.error}
        />
      </section>
      {principalContexts.length > 0 && directory.configured && !directory.error && (
        <section aria-label="Manage institution profiles" className="institution-profile-management">
          <p className="eyebrow">PROFILE MANAGEMENT / PRINCIPALS</p>
          {principalContexts.map(context => {
            const institution = directory.institutions.find(item => item.id === context.organizationId);
            return context.organizationId ? (
              <InstitutionProfileForm
                key={context.organizationId}
                organizationId={context.organizationId}
                organizationName={institution?.name ?? context.label}
                summary={institution?.summary ?? ''}
                published={Boolean(institution)}
              />
            ) : null;
          })}
        </section>
      )}
      <footer className="page-footer"><span>APT-LABS / INSTITUTIONS</span><span>Work and capital remain Tender-linked workflows</span></footer>
    </main>
  );
}
