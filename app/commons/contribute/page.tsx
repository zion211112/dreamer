import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BookOpen, CircleAlert } from 'lucide-react';
import { CommonsActionForm, CommonsTextField } from '@/components/commons-forms';
import { SiteHeader } from '@/components/site-header';
import { submitCommonsPoll, submitCommonsPost, submitCommonsResource } from '../actions';
import { getCommonsIdentityState, getCommonsLibrary } from '@/lib/commons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'Contribute — Commons — APT-LABS',
  description: 'Submit a field note, advisory poll or source-linked resource for human review.',
};

export default async function CommonsContributePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  if (mode === 'guest') redirect('/commons?mode=guest');
  const [identity, library] = await Promise.all([getCommonsIdentityState(), getCommonsLibrary()]);
  if (!identity.authenticated) redirect('/sign-in?next=%2Fcommons%2Fcontribute');

  return (
    <main className="site-shell commons-shell">
      <SiteHeader />
      <section className="commons-subhero">
        <Link className="commons-back-link" href="/commons"><ArrowLeft aria-hidden="true" size={14} /> Commons activity</Link>
        <p className="eyebrow">COMMONS / CONTRIBUTOR DESK</p>
        <h1>Leave a useful trace.</h1>
        <p>Posts, polls and resource links enter a private review queue. They become public only after a moderator approves them.</p>
      </section>
      {identity.error && <div className="commons-alert" role="alert">{identity.error}</div>}
      {!identity.error && !identity.contributor && (
        <div className="commons-gate">
          <CircleAlert aria-hidden="true" size={19} />
          <div><strong>Contributor access is required.</strong><p>Return to Commons to request access. Sign-in alone does not grant contribution rights.</p></div>
          <Link className="text-link" href="/commons">Access status <ArrowLeft aria-hidden="true" size={14} /></Link>
        </div>
      )}
      {!identity.error && identity.contributor && !identity.contributorRequestsOpen && (
        <div className="commons-gate">
          <CircleAlert aria-hidden="true" size={19} />
          <div><strong>Commons is read-only at this deployment.</strong><p>No active human moderator is available to review new submissions.</p></div>
        </div>
      )}
      {!identity.error && identity.contributor && identity.contributorRequestsOpen && (
        <>
          <div className="commons-review-notice"><BookOpen aria-hidden="true" size={16} /><p>Review is human-led. Submitting does not promise publication. No files are uploaded or hosted, and license metadata is not independently certified.</p></div>
          <section className="commons-compose-grid" aria-label="Contribution types">
            <article className="commons-compose-card">
              <p className="eyebrow">01 / FIELD NOTE</p>
              <h2>Share work in progress.</h2>
              <p>Discuss a build, lesson, failure or technique. Keep student and sensitive personal data out of public posts.</p>
              <CommonsActionForm action={submitCommonsPost} submitLabel="Submit field note">
                <CommonsTextField label="Title" maxLength={160} name="title" placeholder="A clear, specific headline" />
                <CommonsTextField label="Post" maxLength={5000} multiline name="body" placeholder="What happened? What can another maker learn?" rows={7} />
                {library.data && library.data.length > 0 && (
                  <fieldset className="commons-resource-picker">
                    <legend>Link published Library resources (optional, up to five)</legend>
                    {library.data.slice(0, 30).map(resource => (
                      <label key={resource.id}><input name="resource_id" type="checkbox" value={resource.id} /><span>{resource.title}<small>{resource.resource_kind} · rev. {resource.revision}</small></span></label>
                    ))}
                  </fieldset>
                )}
              </CommonsActionForm>
            </article>

            <article className="commons-compose-card">
              <p className="eyebrow">02 / ADVISORY POLL</p>
              <h2>Ask the network.</h2>
              <p>Gather non-binding input. Polls do not allocate funds, assign crews or govern a treasury.</p>
              <CommonsActionForm action={submitCommonsPoll} submitLabel="Submit poll for review">
                <CommonsTextField label="Question" maxLength={160} name="question" placeholder="What should this question help us learn?" />
                <CommonsTextField label="Context" maxLength={3000} multiline name="context" placeholder="Explain the decision context and what the result can influence." rows={4} />
                <fieldset className="commons-poll-inputs">
                  <legend>Options (two required, up to six)</legend>
                  {[0, 1, 2, 3, 4, 5].map(index => (
                    <Input key={index} maxLength={120} name="option" placeholder={`Option ${index + 1}${index < 2 ? ' (required)' : ' (optional)'}`} required={index < 2} />
                  ))}
                </fieldset>
                <div className="commons-field">
                  <Label htmlFor="commons-poll-closes">Close time</Label>
                  <Input id="commons-poll-closes" name="closes_at" required type="datetime-local" />
                  <small>Use your local time; the public record is shown in UTC.</small>
                </div>
              </CommonsActionForm>
            </article>

            <article className="commons-compose-card commons-compose-resource">
              <p className="eyebrow">03 / LIBRARY RESOURCE</p>
              <h2>Preserve the provenance.</h2>
              <p>Submit an approved public link with the minimum context a future builder needs to assess it.</p>
              <CommonsActionForm action={submitCommonsResource} submitLabel="Submit resource for review">
                <CommonsTextField label="Resource title" maxLength={180} name="title" placeholder="Name the reference" />
                <CommonsTextField label="Summary" maxLength={2000} multiline name="summary" placeholder="What is it, and when is it useful?" rows={4} />
                <div className="commons-field">
                  <Label htmlFor="commons-resource-kind">Resource type</Label>
                  <select id="commons-resource-kind" name="resource_kind" required defaultValue="">
                    <option disabled value="">Choose a type</option>
                    <option value="blueprint">Blueprint</option>
                    <option value="bom">Bill of materials</option>
                    <option value="cad">CAD reference</option>
                    <option value="media">Media</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>
                <CommonsTextField label="Public source URL" maxLength={2000} name="source_url" placeholder="https://…" />
                <CommonsTextField label="Attribution" maxLength={400} name="attribution" placeholder="Creator, publisher or rights holder" />
                <CommonsTextField label="Declared license" maxLength={120} name="license_name" placeholder="Exact license or rights statement" />
                <CommonsTextField label="License URL" maxLength={2000} name="license_url" placeholder="https://…" />
                <CommonsTextField label="Revision or version" maxLength={80} name="revision" placeholder="Version, date or revision ID" />
                <div className="commons-field">
                  <Label htmlFor="commons-resource-tender">Related published Tender ID (optional)</Label>
                  <Input id="commons-resource-tender" maxLength={36} name="tender_id" placeholder="UUID" />
                </div>
              </CommonsActionForm>
            </article>
          </section>
          {library.error && <div className="commons-alert" role="alert">{library.error}</div>}
        </>
      )}
      <footer className="page-footer"><span>APT-LABS / CONTRIBUTION</span><span>Moderated before publication · public links only</span></footer>
    </main>
  );
}
