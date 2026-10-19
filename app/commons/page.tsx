import Link from 'next/link';
import { ArrowRight, BookOpen, CircleHelp, ShieldCheck, SquarePen } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { CommonsActionForm, CommonsProfileForm } from '@/components/commons-forms';
import { requestCommonsAccess, saveCommonsProfile } from './actions';
import { getCommonsActivity, getCommonsIdentityState } from '@/lib/commons';

export const metadata = {
  title: 'Commons — APT-LABS',
  description: 'Activity and open resource records for people building local capability.',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

export default async function CommonsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const guest = mode === 'guest';
  const [activity, identity] = await Promise.all([getCommonsActivity(), getCommonsIdentityState()]);
  const canAct = identity.authenticated && !guest;

  return (
    <main className="site-shell commons-shell">
      <SiteHeader guest={guest} />
      <section className="commons-hero">
        <div>
          <p className="eyebrow"><span className="signal-dot" /> APT-LABS / COMMONS</p>
          <h1>Knowledge travels<br /><em>with the work.</em></h1>
          <p>Activity for people building, learning and documenting. Read openly; contribute only after human approval. This is a workshop record, not a social feed.</p>
        </div>
        <div className="commons-hero-mark" aria-hidden="true"><span>FIELD</span><strong>NOTES</strong><i>APT / 01</i></div>
      </section>

      <section className="commons-layout" aria-label="Commons activity and participation">
        <div className="commons-activity">
          <div className="commons-section-heading">
            <div><p className="eyebrow">01 / ACTIVITY</p><h2>From the workshop</h2></div>
            <div className="commons-hero-links"><Link className="text-link" href={guest ? '/commons/opportunities?mode=guest' : '/commons/opportunities'}>Asset-linked opportunities <ArrowRight aria-hidden="true" size={14} /></Link><Link className="text-link" href={guest ? '/commons/library?mode=guest' : '/commons/library'}>Open the Library <ArrowRight aria-hidden="true" size={14} /></Link></div>
          </div>
          {activity.error && <div className="commons-alert" role="alert">{activity.error}</div>}
          {!activity.configured && (
            <div className="commons-empty">
              <BookOpen aria-hidden="true" size={20} />
              <h3>Commons is not connected yet.</h3>
              <p>Published posts and resources will appear here after the workspace Commons migration is applied. No demonstration activity is presented as live.</p>
            </div>
          )}
          {activity.configured && !activity.error && activity.data?.length === 0 && (
            <div className="commons-empty">
              <CircleHelp aria-hidden="true" size={20} />
              <h3>The workshop is quiet.</h3>
              <p>There are no published Commons posts yet. Pending contributions remain private until a moderator approves them.</p>
            </div>
          )}
          <div className="commons-post-list">
            {activity.data?.map(post => (
              <article className="commons-post-card" key={post.id}>
                <div className="commons-post-meta"><span>{post.post_kind === 'poll' ? 'ADVISORY POLL' : 'FIELD NOTE'}</span><span>{formatDate(post.published_at)}</span></div>
                <h3><Link href={`/commons/${post.id}${guest ? '?mode=guest' : ''}`}>{post.title}</Link></h3>
                <p>{post.body}</p>
                <div className="commons-post-byline"><span>Shared by {post.author_name}</span><Link href={`/commons/${post.id}${guest ? '?mode=guest' : ''}`}>Open discussion <ArrowRight aria-hidden="true" size={13} /></Link></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="commons-side">
          <section className="commons-side-card">
            <p className="eyebrow">02 / PARTICIPATE</p>
            <h2>Keep the signal useful.</h2>
            {!guest && identity.error && <div className="commons-alert" role="alert">{identity.error}</div>}
            {!canAct && (
              <>
                <p>Public reading does not require an account. Approved adult contributors can submit moderated notes, resource links and advisory polls.</p>
                <Link className="button button-primary" href="/sign-in?next=%2Fcommons">Sign in to request access <ArrowRight aria-hidden="true" size={14} /></Link>
              </>
            )}
            {canAct && !identity.error && !identity.contributor && identity.requestStatus === 'pending' && identity.contributorRequestsOpen && (
              <div className="commons-pending"><span className="signal-dot" /><span><strong>Request in review</strong><small>Commons contributions remain closed until a moderator responds.</small></span></div>
            )}
            {canAct && !identity.error && !identity.contributor && identity.requestStatus === 'pending' && !identity.contributorRequestsOpen && (
              <div className="commons-closed"><strong>Request is waiting.</strong><span>No active moderator is currently available to review pending contributor requests.</span></div>
            )}
            {canAct && !identity.error && !identity.contributor && identity.requestStatus !== 'pending' && (
              identity.contributorRequestsOpen ? <>
                <p>Access is granted by a human moderator. Email sign-in proves control of an address, not age, identity or professional qualifications. Youth participation is not enabled.</p>
                <CommonsActionForm action={requestCommonsAccess} submitLabel={identity.requestStatus === 'declined' ? 'Request review again' : 'Request contributor access'} />
              </> : <div className="commons-closed"><strong>Contribution is read-only at this deployment.</strong><span>No active moderator is available to review requests. Read public activity and return when human review is staffed.</span></div>
            )}
            {canAct && !identity.error && identity.contributor && (
              <>
                <p>Your account has approved contributor access. Each submission is reviewed before publication.</p>
                <Link className="button button-primary" href="/commons/contribute"><SquarePen aria-hidden="true" size={14} /> Create a contribution</Link>
              </>
            )}
            {canAct && identity.moderator && (
              <Link className="commons-moderator-link" href="/commons/moderation"><ShieldCheck aria-hidden="true" size={14} /> Moderator desk</Link>
            )}
          </section>

          {canAct && !identity.error && (
            <section className="commons-side-card commons-identity-card">
              <p className="eyebrow">03 / YOUR PUBLIC IDENTITY</p>
              <h2>Private by default.</h2>
              <p>Your email is never displayed. Choose whether to share a public name beside published work.</p>
              <CommonsProfileForm
                action={saveCommonsProfile}
                displayName={identity.displayName}
                publicNameConsent={identity.publicNameConsent}
              />
            </section>
          )}

          <section className="commons-boundary">
            <ShieldCheck aria-hidden="true" size={16} />
            <p><strong>No uploads. No private chat. No token or payment features.</strong> Resources are approved public links with source, attribution, license and revision metadata. License claims are supplied by contributors and reviewed, not independently certified.</p>
          </section>
        </aside>
      </section>
      <footer className="page-footer"><span>APT-LABS / COMMONS</span><span>Public reading · moderated contribution · no hosted files</span></footer>
    </main>
  );
}
