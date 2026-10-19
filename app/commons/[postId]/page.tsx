import Link from 'next/link';
import { ArrowRight, BarChart3, MessageSquareText, ShieldCheck } from 'lucide-react';
import { CommonsActionForm, CommonsReportForm, CommonsTextField } from '@/components/commons-forms';
import { SiteHeader } from '@/components/site-header';
import { castCommonsVote, submitCommonsComment } from '../actions';
import { getCommonsIdentityState, getCommonsPostDetail } from '@/lib/commons';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const result = await getCommonsPostDetail(postId);
  return { title: result.data ? `${result.data.post.title} — Commons` : 'Commons — APT-LABS' };
}

export default async function CommonsPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ postId }, { mode }] = await Promise.all([params, searchParams]);
  const guest = false;
  const [result, identity] = await Promise.all([
    getCommonsPostDetail(postId),
    getCommonsIdentityState(),
  ]);
  if (!result.configured) {
    return (
      <main className="site-shell commons-shell">
        <SiteHeader />
        <div className="commons-alert">Commons is not connected here. No live activity can be displayed.</div>
      </main>
    );
  }
  if (!result.data || result.error) {
    return (
      <main className="site-shell commons-shell">
        <SiteHeader />
        <div className="commons-alert" role="alert">{result.error ?? 'This post is not available.'}</div>
        <Link className="text-link" href="/commons">Return to Commons activity</Link>
      </main>
    );
  }
  const { post, resources, comments, poll } = result.data;
  const canAct = identity.authenticated && !guest && !identity.error;
  const canContribute = canAct && identity.contributor && identity.contributorRequestsOpen;
  const pollIsOpen = poll?.status === 'open' && new Date(poll.closes_at).getTime() > Date.now();
  const totalVotes = poll?.results.reduce((sum, resultRow) => sum + resultRow.vote_count, 0) ?? 0;

  return (
    <main className="site-shell commons-shell">
      <SiteHeader />
      <article className="commons-detail commons-post-detail">
        <Link className="commons-back-link" href={guest ? '/commons?mode=guest' : '/commons'}>← Commons activity</Link>
        <div className="commons-post-meta"><span>{post.post_kind === 'poll' ? 'ADVISORY POLL' : 'FIELD NOTE'}</span><span>{formatDate(post.published_at)} UTC</span></div>
        <h1>{post.title}</h1>
        <p className="commons-detail-byline">Shared by {post.author_name}</p>
        <div className="commons-post-body">{post.body.split('\n').map((line, index) => <p key={`${index}-${line}`}>{line || '\u00a0'}</p>)}</div>

        {resources.length > 0 && (
          <section className="commons-linked-resources">
            <p className="eyebrow">REFERENCED MATERIAL</p>
            {resources.map(resource => (
              <Link className="commons-linked-resource" href={`/commons/library/${resource.id}${guest ? '?mode=guest' : ''}`} key={resource.id}>
                <span><strong>{resource.title}</strong><small>{resource.resource_kind} · rev. {resource.revision} · {resource.license_name}</small></span>
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            ))}
          </section>
        )}

        {poll && (
          <section className="commons-poll-card" aria-labelledby="poll-title">
            <div className="commons-poll-heading"><BarChart3 aria-hidden="true" size={17} /><div><p className="eyebrow">ADVISORY / NON-BINDING</p><h2 id="poll-title">Signal from the network</h2></div></div>
            <p className="commons-poll-closes">{pollIsOpen ? 'Closes' : 'Closed'} {formatDate(poll.closes_at)} UTC · {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</p>
            <div className="commons-poll-options">
              {poll.options.map(option => {
                const voteCount = poll.results.find(resultRow => resultRow.option_id === option.id)?.vote_count ?? 0;
                const percentage = totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0;
                return (
                  <div className="commons-poll-option" key={option.id}>
                    <div><span>{option.label}</span><strong>{voteCount} · {percentage}%</strong></div>
                    <span className="commons-poll-bar"><i style={{ width: `${percentage}%` }} /></span>
                  </div>
                );
              })}
            </div>
            {pollIsOpen && canContribute && (
              <CommonsActionForm action={castCommonsVote} className="commons-vote-form" submitLabel="Record advisory vote">
                <input name="poll_id" type="hidden" value={poll.id} />
                <input name="post_id" type="hidden" value={post.id} />
                <fieldset>
                  <legend>Select one option</legend>
                  {poll.options.map(option => (
                    <label className="commons-radio-option" key={option.id}>
                      <input name="option_id" required type="radio" value={option.id} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </fieldset>
              </CommonsActionForm>
            )}
            {pollIsOpen && !canContribute && (
              <p className="commons-form-hint">{canAct ? 'Voting requires approved contributor access and active moderation.' : 'Sign in with an approved contributor account to vote.'}</p>
            )}
            <p className="commons-form-hint">Polls are advisory only. They do not control funds, crew assignments, or cooperative treasury decisions.</p>
          </section>
        )}

        <section className="commons-comments">
          <div className="commons-section-heading">
            <div><p className="eyebrow">DISCUSSION / MODERATED</p><h2>{comments.length} {comments.length === 1 ? 'response' : 'responses'}</h2></div>
            <MessageSquareText aria-hidden="true" size={18} />
          </div>
          {comments.length === 0 && <p className="commons-form-hint">No published responses yet.</p>}
          {comments.map(comment => (
            <article className="commons-comment" key={comment.id}>
              <p>{comment.body}</p>
              <div className="commons-comment-meta"><span>{comment.author_name} · {formatDate(comment.created_at)} UTC</span>{canAct && <CommonsReportForm targetId={comment.id} targetKind="comment" />}</div>
            </article>
          ))}
          {canContribute ? (
            <CommonsActionForm action={submitCommonsComment} className="commons-comment-form" submitLabel="Submit for review">
              <input name="post_id" type="hidden" value={post.id} />
              <CommonsTextField label="Add a response" maxLength={3000} multiline name="body" placeholder="Keep it useful, specific and kind." rows={4} />
            </CommonsActionForm>
          ) : (
            <div className="commons-comment-gate">
              <ShieldCheck aria-hidden="true" size={15} />
              <span>{canAct ? 'Commenting requires approved contributor access and active moderation.' : 'Only approved contributors can add a moderated response.'}</span>
              {!canAct && <Link href={`/sign-in?next=%2Fcommons%2F${post.id}`}>Sign in</Link>}
            </div>
          )}
        </section>
        {!guest && identity.error && <div className="commons-alert" role="alert">{identity.error}</div>}
        {canAct && (
          <section className="commons-detail-report">
            <div><ShieldCheck aria-hidden="true" size={15} /><span>Flag a concern about this post.</span></div>
            <CommonsReportForm targetId={post.id} targetKind="post" />
          </section>
        )}
      </article>
      <footer className="page-footer"><span>APT-LABS / COMMONS ACTIVITY</span><span>Human-reviewed public record · advisory polls are not binding</span></footer>
    </main>
  );
}
