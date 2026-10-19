import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { CommonsModerationForm } from '@/components/commons-forms';
import { SiteHeader } from '@/components/site-header';
import {
  reviewCommonsAccessRequest,
  reviewCommonsContent,
  reviewCommonsReport,
  setCommonsContributorActive,
} from '../actions';
import { getCommonsIdentityState } from '@/lib/commons';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Moderator Desk — Commons — APT-LABS',
  description: 'Review Commons contributions, reports and contributor access.',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export default async function CommonsModerationPage() {
  const identity = await getCommonsIdentityState();
  if (!identity.authenticated) redirect('/sign-in?next=%2Fcommons%2Fmoderation');

  if (identity.error || !identity.moderator) {
    return (
      <main className="site-shell commons-shell">
        <SiteHeader />
        <section className="commons-detail">
          <p className="eyebrow">COMMONS / MODERATOR DESK</p>
          <h1>Restricted workspace.</h1>
          <p>{identity.error ?? 'Moderator access is provisioned separately from account creation and contributor approval.'}</p>
          <Link className="text-link" href="/commons">Return to Commons <ArrowLeft aria-hidden="true" size={14} /></Link>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [
    requestsResult,
    resourcesResult,
    postsResult,
    commentsResult,
    reportsResult,
    contributorsResult,
    eventsResult,
  ] = await Promise.all([
    supabase.from('moderator_commons_access_requests').select('id, user_id, email, created_at').order('created_at', { ascending: true }).limit(100),
    supabase.from('commons_resources').select('id, title, summary, resource_kind, source_url, attribution, license_name, license_url, revision, created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(100),
    supabase.from('commons_posts').select('id, title, body, post_kind, created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(100),
    supabase.from('commons_comments').select('id, post_id, body, created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(100),
    supabase.from('commons_reports').select('id, target_kind, target_id, reporter_id, reason, created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(100),
    supabase.from('commons_contributors').select('user_id, is_active, approved_at').order('approved_at', { ascending: false }).limit(100),
    supabase.from('commons_moderation_events').select('id, target_kind, target_id, action, note, created_at').order('created_at', { ascending: false }).limit(30),
  ]);
  const queryErrors = [
    requestsResult.error && `Access requests: ${requestsResult.error.message}`,
    resourcesResult.error && `Resource queue: ${resourcesResult.error.message}`,
    postsResult.error && `Post queue: ${postsResult.error.message}`,
    commentsResult.error && `Comment queue: ${commentsResult.error.message}`,
    reportsResult.error && `Reports: ${reportsResult.error.message}`,
    contributorsResult.error && `Contributors: ${contributorsResult.error.message}`,
    eventsResult.error && `Audit history: ${eventsResult.error.message}`,
  ].filter((message): message is string => Boolean(message));

  const requests = requestsResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const posts = postsResult.data ?? [];
  const comments = commentsResult.data ?? [];
  const reports = reportsResult.data ?? [];
  const contributors = contributorsResult.data ?? [];
  const events = eventsResult.data ?? [];
  const pendingCount = requests.length + resources.length + posts.length + comments.length + reports.length;

  return (
    <main className="site-shell commons-shell">
      <SiteHeader />
      <section className="commons-subhero commons-moderation-hero">
        <Link className="commons-back-link" href="/commons"><ArrowLeft aria-hidden="true" size={14} /> Commons activity</Link>
        <p className="eyebrow"><ShieldCheck aria-hidden="true" size={14} /> MODERATOR DESK / HUMAN REVIEW</p>
        <h1>Review before release.</h1>
        <p>{pendingCount} pending item{pendingCount === 1 ? '' : 's'} across access, posts, resources, comments and reports. Approval is an editorial and safeguarding decision, not an automated identity check.</p>
      </section>
      {queryErrors.map(error => <div className="commons-alert" key={error} role="alert">{error}</div>)}

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">01 / ACCESS</p><h2>Contributor requests</h2></div><span>{requests.length} pending</span></div>
        {requests.length === 0 ? <p className="commons-form-hint">No pending access requests.</p> : requests.map(request => (
          <article className="commons-queue-card" key={request.id}>
            <div><span className="eyebrow">REQUESTED {formatDate(request.created_at)} UTC</span><h3>{request.email ?? 'Email unavailable'}</h3><p>Account ID · {request.user_id}</p></div>
            <CommonsModerationForm
              action={reviewCommonsAccessRequest}
              decisions={['approve', 'decline']}
              fields={{ request_id: request.id }}
              labels={{ approve: 'Approve contributor', decline: 'Decline' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">02 / LIBRARY</p><h2>Resource links</h2></div><span>{resources.length} pending</span></div>
        {resources.length === 0 ? <p className="commons-form-hint">No pending resource submissions.</p> : resources.map(resource => (
          <article className="commons-queue-card" key={resource.id}>
            <div>
              <span className="eyebrow">{resource.resource_kind.toUpperCase()} · {formatDate(resource.created_at)} UTC</span>
              <h3>{resource.title}</h3><p>{resource.summary}</p>
              <dl className="commons-queue-metadata"><div><dt>Source</dt><dd><a href={resource.source_url} rel="noopener noreferrer" target="_blank">{resource.source_url}</a></dd></div><div><dt>Attribution</dt><dd>{resource.attribution}</dd></div><div><dt>License</dt><dd><a href={resource.license_url} rel="noopener noreferrer" target="_blank">{resource.license_name}</a> · rev. {resource.revision}</dd></div></dl>
            </div>
            <CommonsModerationForm
              action={reviewCommonsContent}
              decisions={['publish', 'hide', 'reject']}
              fields={{ target_kind: 'resource', target_id: resource.id }}
              labels={{ publish: 'Publish', hide: 'Hide', reject: 'Reject' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">03 / ACTIVITY</p><h2>Posts and polls</h2></div><span>{posts.length} pending</span></div>
        {posts.length === 0 ? <p className="commons-form-hint">No pending posts or polls.</p> : posts.map(post => (
          <article className="commons-queue-card" key={post.id}>
            <div><span className="eyebrow">{post.post_kind.toUpperCase()} · SUBMITTED {formatDate(post.created_at)} UTC</span><h3>{post.title}</h3><p className="commons-queue-body">{post.body}</p></div>
            <CommonsModerationForm
              action={reviewCommonsContent}
              decisions={['publish', 'hide', 'reject']}
              fields={{ target_kind: 'post', target_id: post.id }}
              labels={{ publish: 'Publish', hide: 'Hide', reject: 'Reject' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">04 / DISCUSSION</p><h2>Comments</h2></div><span>{comments.length} pending</span></div>
        {comments.length === 0 ? <p className="commons-form-hint">No pending comments.</p> : comments.map(comment => (
          <article className="commons-queue-card" key={comment.id}>
            <div><span className="eyebrow">POST {comment.post_id} · SUBMITTED {formatDate(comment.created_at)} UTC</span><p>{comment.body}</p></div>
            <CommonsModerationForm
              action={reviewCommonsContent}
              decisions={['publish', 'hide', 'reject']}
              fields={{ target_kind: 'comment', target_id: comment.id }}
              labels={{ publish: 'Publish', hide: 'Hide', reject: 'Reject' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">05 / REPORTS</p><h2>Member flags</h2></div><span>{reports.length} pending</span></div>
        {reports.length === 0 ? <p className="commons-form-hint">No pending reports.</p> : reports.map(report => (
          <article className="commons-queue-card" key={report.id}>
            <div><span className="eyebrow">{report.target_kind.toUpperCase()} · {formatDate(report.created_at)} UTC</span><h3>{report.reason}</h3><p>Target {report.target_id} · reporter {report.reporter_id}</p></div>
            <CommonsModerationForm
              action={reviewCommonsReport}
              decisions={['resolve', 'dismiss']}
              fields={{ report_id: report.id }}
              labels={{ resolve: 'Resolve report', dismiss: 'Dismiss' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">06 / CONTRIBUTOR STEWARDSHIP</p><h2>Approved accounts</h2></div><span>{contributors.length} records</span></div>
        {contributors.length === 0 ? <p className="commons-form-hint">No approved contributors.</p> : contributors.map(contributor => (
          <article className="commons-queue-card commons-contributor-row" key={contributor.user_id}>
            <div><span className="eyebrow">{contributor.is_active ? 'ACTIVE' : 'SUSPENDED'} · APPROVED {formatDate(contributor.approved_at)} UTC</span><h3>{contributor.user_id}</h3></div>
            <CommonsModerationForm
              action={setCommonsContributorActive}
              decisions={[contributor.is_active ? 'false' : 'true']}
              fields={{ user_id: contributor.user_id }}
              labels={{ false: 'Suspend access', true: 'Restore access' }}
            />
          </article>
        ))}
      </section>

      <section className="commons-moderation-section">
        <div className="commons-section-heading"><div><p className="eyebrow">07 / AUDIT</p><h2>Recent moderation actions</h2></div></div>
        {events.length === 0 ? <p className="commons-form-hint">No moderation actions recorded.</p> : (
          <ol className="commons-audit-list">
            {events.map(event => <li key={event.id}><time dateTime={event.created_at}>{formatDate(event.created_at)} UTC</time><strong>{event.action.replaceAll('_', ' ')}</strong><span>{event.target_kind} · {event.target_id}</span>{event.note && <p>{event.note}</p>}</li>)}
          </ol>
        )}
      </section>
      <footer className="page-footer"><span>APT-LABS / MODERATION</span><span>Human review is recorded; public labels are not external certification</span></footer>
    </main>
  );
}
