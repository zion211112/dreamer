import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { Core, ElementDefinition } from 'cytoscape';
import { data } from './data';
import type { ReviewDecision, StudioGraph, StudioObject, StudioObjectTypeId, StudioOverview, StudioObjectSet, WorkspaceEvent, WorkspaceNetwork, WorkspaceOrganization, WorkspaceUndertaking, WorkbenchSummary, UndertakingDetail } from './types';
import { describeApiError } from './api';
import { PageHeader, StateMessage, dateLabel, humanise } from './shared';

type LoadState<T> = { value: T | null; loading: boolean; error: string };
const TYPES: StudioObjectTypeId[] = ['organization', 'undertaking', 'person', 'interest', 'offer', 'report', 'review', 'event'];

function useLoad<T>(load: () => Promise<T>, key: string, enabled = true) {
  const [state, setState] = useState<LoadState<T>>({ value: null, loading: enabled, error: '' });
  const refresh = async () => {
    setState((old) => ({ ...old, loading: true, error: '' }));
    try { setState({ value: await load(), loading: false, error: '' }); }
    catch (error) { setState((old) => ({ ...old, loading: false, error: describeApiError(error) })); }
  };
  useEffect(() => { if (enabled) void refresh(); }, [key, enabled]);
  return { ...state, refresh, setValue: (value: T) => setState({ value, loading: false, error: '' }) };
}

export function Workspace() {
  const location = useLocation();
  const path = location.path.replace(/\/+$/, '') || '/workspace';
  const route = useMemo(() => {
    if (path === '/workspace' || path === '/workspace/') return 'home';
    if (path === '/workspace/commons') return 'commons';
    if (path === '/workspace/workbench') return 'workbench';
    if (path.startsWith('/workspace/workbench/')) return 'undertaking';
    if (path === '/workspace/network' || path.startsWith('/workspace/network/')) return 'network';
    if (path === '/workspace/records' || path.startsWith('/workspace/records/')) return 'records';
    if (path === '/workspace/reference') return 'reference';
    if (path === '/workspace/intelligence') return 'records';
    if (path === '/workspace/ontology' || path === '/workspace/sovereignty') return 'reference';
    if (path === '/workspace/value' || path === '/workspace/workbench/value') return 'workbench';
    return 'notFound';
  }, [path]);
  useEffect(() => {
    if (path === '/workspace/intelligence') location.route('/workspace/records/annals', true);
    if (path === '/workspace/ontology' || path === '/workspace/sovereignty') location.route('/workspace/reference', true);
    if (path === '/workspace/value' || path === '/workspace/workbench/value') location.route('/workspace/workbench', true);
    if (path === '/workspace/network') location.route('/workspace/network/people', true);
    if (path === '/workspace/records') location.route('/workspace/records/canon', true);
  }, [path]);
  const id = path.startsWith('/workspace/workbench/') ? decodeURIComponent(path.slice('/workspace/workbench/'.length)) : '';
  if (route === 'home') return <Home />;
  if (route === 'commons') return <Commons />;
  if (route === 'workbench') return <Workbench />;
  if (route === 'undertaking') return <Undertaking id={id} />;
  if (route === 'network') return <Network section={path.split('/')[3] ?? 'people'} />;
  if (route === 'records') return <Records lens={path.split('/')[3] ?? 'canon'} />;
  if (route === 'reference') return <Reference />;
  return <StateMessage title="Page not found" kind="error">This route is not part of the workspace.</StateMessage>;
}

function Home() {
  const recordsState = useLoad(() => data.records(), 'home-records');
  const workbenchState = useLoad(() => data.workbench(), 'home-workbench');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const records = recordsState.value;
  const workbench = workbenchState.value;
  const items = records?.undertakings ?? [];
  const visibleItems = items.filter((item) => (status === 'all' || item.status === status) && `${item.title} ${item.organizationName} ${item.scope}`.toLowerCase().includes(query.toLowerCase()));
  const selected = visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0] ?? null;
  const attention = [
    ...(workbench?.needsYou.map((item) => ({ id: `${item.kind}-${item.undertakingId}-${item.createdAt}`, undertakingId: item.undertakingId, title: item.title, context: `${item.personName} · ${item.organizationName}`, label: item.kind === 'interest' ? 'Interest to review' : 'Report to review', createdAt: item.createdAt })) ?? []),
    ...(workbench?.offersToYou.map((item) => ({ id: item.offerId, undertakingId: item.undertakingId, title: item.title, context: item.organizationName, label: 'Offer to answer', createdAt: item.createdAt })) ?? []),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <section class="screen"><PageHeader eyebrow="Home · authorized work" title="Your desk" action={<a class="button button-primary" href="/workspace/commons">Find open work</a>}>Shared work you can access, with decisions that are waiting on you.</PageHeader>
    {recordsState.error ? <StateMessage title="Your work register could not be loaded" kind="error" retry={() => void recordsState.refresh()}>{recordsState.error} No work was changed.</StateMessage> : recordsState.loading && !records ? <StateMessage title="Loading your workspace" kind="loading">Checking authorized work and membership records…</StateMessage> : <>
      {workbenchState.error ? <StateMessage title="Your decision queue could not be loaded" kind="error" retry={() => void workbenchState.refresh()}>{workbenchState.error} The work register is still available below.</StateMessage> : workbenchState.loading && !workbench ? <p class="inspector-loading" role="status">Loading decisions that may need your attention…</p> : attention.length > 0 && <section class="desk-attention" aria-labelledby="desk-attention-title"><div class="section-heading"><div><p class="eyebrow">Next decisions</p><h2 id="desk-attention-title">Needs your attention <span class="count">{attention.length}</span></h2></div><a href="/workspace/workbench">Open Workbench →</a></div><div class="attention-list">{attention.slice(0, 3).map((item) => <a class="attention-row" href={`/workspace/workbench/${encodeURIComponent(item.undertakingId)}`} key={item.id}><span class="attention-kind">{item.label}</span><strong>{item.title}</strong><small>{item.context}</small><time>{dateLabel(item.createdAt)}</time><span class="attention-arrow" aria-hidden="true">→</span></a>)}</div></section>}
      <div class="desk-layout"><section class="desk-register" aria-labelledby="desk-register-title"><div class="section-heading"><div><p class="eyebrow">Shared network</p><h2 id="desk-register-title">Work register <span class="count">{visibleItems.length}</span></h2></div><a href="/workspace/commons">Browse Commons →</a></div>
        <div class="desk-controls"><label class="desk-filter" for="desk-search"><span>Find a record</span><input id="desk-search" type="search" value={query} onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)} placeholder="Title, organization, or scope"/></label><label class="desk-filter" for="desk-status"><span>Status</span><select id="desk-status" value={status} onChange={(event) => setStatus((event.currentTarget as HTMLSelectElement).value)}><option value="all">All statuses</option><option value="open">Open</option><option value="active">In delivery</option><option value="closed">Closed</option></select></label></div>
        {visibleItems.length > 0 ? <div class="desk-rows" role="group" aria-label="Authorized undertakings">{visibleItems.map((item) => <button type="button" class={`desk-row${selected?.id === item.id ? ' is-selected' : ''}`} aria-pressed={selected?.id === item.id} onClick={() => setSelectedId(item.id)} key={item.id}><span class="desk-row-copy"><strong>{item.title}</strong><small>{item.organizationName}</small><span>{item.scope}</span></span><span class={`status-mark status-${item.status}`}>{item.status === 'active' ? 'In delivery' : humanise(item.status)}</span><span class="desk-row-counts">{item.interestCount ?? 0} interest · {item.reportCount ?? 0} reports</span></button>)}</div> : <StateMessage title={query || status !== 'all' ? 'No work matches these filters' : 'No shared work is visible'}>{query || status !== 'all' ? 'Try a different search or status.' : <>Open work appears in Commons. You can also <a href="/workspace/workbench">publish scoped work</a> for an organization you manage.</>}</StateMessage>}
      </section>
      {selected && <RecordInspector item={selected}/>}
      </div>
      <div class="desk-context"><section class="section-block"><div class="section-heading"><div><p class="eyebrow">Membership</p><h2>Organizations</h2></div><a href="/workspace/network/institutions">Network →</a></div>{records?.organizations.length ? records.organizations.map((org) => <div class="membership-row" key={org.id}><strong>{org.name}</strong><span>{org.role} · {humanise(org.standing)}</span></div>) : <p class="muted">No active organization memberships. You can still discover open work.</p>}</section>
        <section class="section-block"><div class="section-heading"><div><p class="eyebrow">Provenance</p><h2>Recent activity</h2></div><a href="/workspace/records/annals">Records →</a></div>{records?.events.slice(0, 4).map((event) => <EventRow event={event} key={event.id} />) ?? <p class="muted">Activity appears here when authorized work is recorded.</p>}</section></div>
      <p class="desk-boundary">A delivery report is its author’s account; an organizational review is a separate decision.</p>
    </>}</section>;
}

function RecordInspector({ item }: { item: WorkspaceUndertaking }) {
  const detail = useLoad(() => data.undertaking(item.id), item.id);
  const work = detail.value?.id === item.id ? detail.value : null;
  return <aside class="record-inspector" aria-label="Selected undertaking"><p class="eyebrow">Selected record · undertaking</p><div class="inspector-title"><h2>{item.title}</h2><span class={`status-mark status-${item.status}`}>{item.status === 'active' ? 'In delivery' : humanise(item.status)}</span></div><p class="inspector-organization">{item.organizationName}</p>
    {detail.error ? <StateMessage title="Record details could not be loaded" kind="error" retry={() => void detail.refresh()}>{detail.error}</StateMessage> : detail.loading && !work ? <p class="inspector-loading" role="status">Loading authorized context…</p> : work ? <>
      <section class="inspector-scope"><h3>Published scope</h3><p>{work.scope}</p></section>
      <dl class="inspector-facts"><div><dt>Published by</dt><dd>{work.createdByName}</dd></div><div><dt>Published</dt><dd>{dateLabel(work.createdAt)}</dd></div><div><dt>Your position</dt><dd>{work.position.role ?? (work.position.isParticipant ? 'Participant' : work.position.hasInterest ? 'Interest submitted' : 'No membership or participation')}</dd></div><div><dt>Organization</dt><dd>{humanise(work.organizationStanding)} standing</dd></div></dl>
      <section class="inspector-history"><div class="section-heading"><div><p class="eyebrow">Attribution</p><h3>Recent record history</h3></div><span class="count">{work.events.length}</span></div>{work.events.length ? work.events.slice(0, 3).map((event) => <EventRow event={{ ...event, organizationId: work.organizationId, organizationName: work.organizationName }} key={event.id}/>) : <p class="muted">No recorded events are visible.</p>}</section>
      <a class="button button-primary inspector-open" href={`/workspace/workbench/${encodeURIComponent(item.id)}`}>Open full record <span aria-hidden="true">→</span></a>
    </> : null}
  </aside>;
}

function WorkRow({ item }: { item: WorkspaceUndertaking }) {
  return <a class="work-row" href={`/workspace/workbench/${encodeURIComponent(item.id)}`}><span class={`status-mark status-${item.status}`}>{item.status === 'active' ? 'In delivery' : humanise(item.status)}</span><span class="work-main"><strong>{item.title}</strong><small>{item.organizationName} · {item.scope}</small></span><time>{dateLabel(item.createdAt)}</time><span aria-hidden="true">→</span></a>;
}

function EventRow({ event }: { event: WorkspaceEvent }) {
  return <div class="event-row"><span class="event-dot" aria-hidden="true"/><div><strong>{humanise(event.action)}</strong><p>{event.actorName} · {event.organizationName ?? 'Shared network'}</p><time>{dateLabel(event.occurredAt)}</time></div></div>;
}

function Commons() {
  const location = useLocation();
  const [query, setQuery] = useState(location.query['q'] ?? '');
  const [debounced, setDebounced] = useState(query);
  useEffect(() => { const timer = setTimeout(() => setDebounced(query), 220); return () => clearTimeout(timer); }, [query]);
  const state = useLoad(() => data.undertakings(debounced), debounced);
  const rows = state.value?.filter((item) => item.status === 'open') ?? [];
  const [selectedId, setSelectedId] = useState('');
  const visibleRows = rows.filter((item) => `${item.title} ${item.organizationName} ${item.scope}`.toLowerCase().includes(debounced.toLowerCase()));
  const selected = visibleRows.find((item) => item.id === selectedId) ?? visibleRows[0] ?? null;
  return <section class="screen"><PageHeader eyebrow="Commons · discover" title="Open work, shared scope">Read the published scope and commissioning organization before deciding whether to express interest.</PageHeader>
    {state.error ? <StateMessage title="Commons could not be loaded" kind="error" retry={() => void state.refresh()}>{state.error}</StateMessage> : state.loading && !state.value ? <StateMessage title="Loading open undertakings" kind="loading">Only records authorized for your session are returned.</StateMessage> : <div class="commons-workspace"><section class="desk-register" aria-labelledby="commons-register-title"><div class="section-heading"><div><p class="eyebrow">Discover</p><h2 id="commons-register-title">Open undertakings <span class="count">{visibleRows.length}</span></h2></div><a href="/workspace/workbench">Your Workbench →</a></div>
      <div class="desk-controls"><label class="desk-filter" for="commons-search"><span>Search open work</span><input id="commons-search" type="search" value={query} onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)} placeholder="Title, organization, or scope"/></label><p class="commons-boundary">Open for interest</p></div>
      {visibleRows.length ? <div class="desk-rows" role="group" aria-label="Open undertakings">{visibleRows.map((item) => <button type="button" class={`desk-row${selected?.id === item.id ? ' is-selected' : ''}`} aria-pressed={selected?.id === item.id} onClick={() => setSelectedId(item.id)} key={item.id}><span class="desk-row-copy"><strong>{item.title}</strong><small>{item.organizationName}</small><span>{item.scope}</span></span><span class="status-mark status-open">Open</span><span class="desk-row-counts">{humanise(item.organizationStanding)} standing</span></button>)}</div> : <StateMessage title={debounced ? 'No open work matches this search' : 'No open undertakings yet'}>{debounced ? 'Try another phrase.' : 'When an organization publishes scoped work, it appears here. Interest is considered by that organization; it is not a match or an offer.'}</StateMessage>}
      </section>{selected && <RecordInspector item={selected}/>}</div>}
  </section>;
}

function Workbench() {
  const state = useLoad(() => data.workbench(), 'workbench');
  const { value: summary, loading, error, refresh, setValue } = state;
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const managed = summary?.organizations.filter((org) => ['owner', 'administrator', 'manager'].includes(org.role)) ?? [];
  const team = useLoad(() => data.network(), 'workbench-team', Boolean(summary?.organizations.length));
  const activeOrganizationId = organizationId || managed[0]?.id || '';
  const administrators = summary?.organizations.filter((org) => ['owner', 'administrator'].includes(org.role)) ?? [];
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const run = async (key: string, task: () => Promise<void>) => { setBusy(key); setActionError(''); setNotice(''); try { await task(); } catch (cause) { setActionError(describeApiError(cause)); } finally { setBusy(''); } };
  const createOrganization = async (event: Event) => { event.preventDefault(); if (!orgName.trim()) return; await run('create-org', async () => { const org = await data.createOrganization(orgName.trim()); setOrgName(''); setNotice('Organization created. You are its owner; publish a scoped undertaking next.'); await refresh(); setOrganizationId(org.id); }); };
  const createWork = async (event: Event) => { event.preventDefault(); const orgId = activeOrganizationId; if (!orgId || title.trim().length < 3 || !scope.trim()) return; await run('create-work', async () => { await data.createUndertaking(orgId, { title: title.trim(), scope: scope.trim() }); setTitle(''); setScope(''); setNotice('Undertaking published to the shared workspace.'); await refresh(); }); };
  const addMember = async (event: Event) => { event.preventDefault(); if (!activeOrganizationId || !memberEmail.trim()) return; await run('add-member', async () => { const member = await data.addMember(activeOrganizationId, memberEmail.trim(), memberRole); setMemberEmail(''); setNotice(`${member.name} added to the organization as ${member.role}.`); await team.refresh(); }); };
  const decide = async (offerId: string, decision: 'accepted' | 'declined') => run(offerId, async () => { await data.decideOffer(offerId, decision); setNotice(decision === 'accepted' ? 'Offer accepted. The work is now in delivery; report against its scope.' : 'Offer declined. The organization retains the decision record.'); await refresh(); });
  const close = async (item: WorkbenchSummary['organizationWork'][number]) => run(item.id, async () => { await data.closeUndertaking(item.organizationId, item.id); setNotice('Undertaking closed. Its history remains readable.'); await refresh(); });
  return <section class="screen"><PageHeader eyebrow="Workbench · coordinate" title="Work that has someone accountable on both ends." action={<a class="button button-primary" href="/workspace/commons">Find open work</a>}>Publish a scoped undertaking, decide interest through an offer, then report and review delivery as separate people.</PageHeader>
    {error && !summary ? <StateMessage title="Workbench could not be loaded" kind="error" retry={() => void refresh()}>{error}</StateMessage> : loading && !summary ? <StateMessage title="Loading your work" kind="loading">Loading work, offers, decisions, and organization context…</StateMessage> : summary && <>
      {notice && <p class="form-notice" role="status">{notice}</p>}{actionError && <p class="form-error" role="alert">{actionError}</p>}
      <nav class="workbench-tabs" aria-label="Workbench sections"><a href="#needs-you">Needs you <span>{summary.needsYou.length}</span></a><a href="#my-work">My work <span>{summary.myWork.length}</span></a><a href="#my-interest">My interest <span>{summary.myInterests.length}</span></a><a href="#offers-to-you">Offers <span>{summary.offersToYou.length}</span></a></nav>
      <div class="workbench-grid"><main class="workbench-main">
        <QueueSection id="needs-you" title="Needs you" description="Interests waiting for an organizational decision and reports waiting for a separate review." count={summary.needsYou.length}>{summary.needsYou.length ? summary.needsYou.map((item) => <article class="queue-item" key={`${item.kind}-${item.undertakingId}-${item.createdAt}`}><div class="queue-item-head"><span class="status-mark status-wait">{item.kind === 'interest' ? 'Interest' : 'Report'}</span><a href={`/workspace/workbench/${item.undertakingId}`}>{item.title}</a><time>{dateLabel(item.createdAt)}</time></div><small>{item.personName} · {item.organizationName}</small><p>{item.kind === 'interest' ? item.message : item.report}</p><a class="text-link" href={`/workspace/workbench/${item.undertakingId}`}>{item.kind === 'interest' ? 'Review interest' : 'Review report'} →</a></article>) : <p class="empty-copy">Nothing is waiting on you.</p>}</QueueSection>
        <QueueSection id="my-work" title="My work" description="Undertakings where you accepted an offer and joined delivery." count={summary.myWork.length}>{summary.myWork.length ? summary.myWork.map((item) => <article class="queue-item" key={item.undertakingId}><div class="queue-item-head"><span class={`status-mark status-${item.status}`}>{item.status === 'active' ? 'In delivery' : humanise(item.status)}</span><a href={`/workspace/workbench/${item.undertakingId}`}>{item.title}</a><time>{dateLabel(item.joinedAt)}</time></div><small>{item.organizationName}</small><p>{item.scope}</p></article>) : <p class="empty-copy">No delivery commitments yet. <a href="/workspace/commons">Browse open work.</a></p>}</QueueSection>
        <QueueSection id="my-interest" title="My interest" description="Expressions of interest still with an organization." count={summary.myInterests.length}>{summary.myInterests.length ? summary.myInterests.map((item) => <article class="queue-item" key={item.undertakingId}><div class="queue-item-head"><span class={`status-mark status-${item.status}`}>{humanise(item.status)}</span><a href={`/workspace/workbench/${item.undertakingId}`}>{item.title}</a><time>{dateLabel(item.createdAt)}</time></div><small>{item.organizationName}</small><p>{item.message}</p></article>) : <p class="empty-copy">No pending interest. <a href="/workspace/commons">Discover open work.</a></p>}</QueueSection>
      </main><aside class="workbench-side">
        <section id="offers-to-you" class="panel-section"><div class="section-heading"><div><p class="eyebrow">Commitments</p><h2>Offers to you <span class="count">{summary.offersToYou.length}</span></h2></div></div>{summary.offersToYou.length ? summary.offersToYou.map((offer) => <article class="offer-item" key={offer.offerId}><a href={`/workspace/workbench/${offer.undertakingId}`}><strong>{offer.title}</strong></a><small>{offer.organizationName} · issued by {offer.issuedByName}</small><p>{offer.proposal}</p><div class="button-row"><button class="button button-primary" disabled={busy === offer.offerId} onClick={() => void decide(offer.offerId, 'accepted')}>Accept</button><button class="button button-quiet" disabled={busy === offer.offerId} onClick={() => void decide(offer.offerId, 'declined')}>Decline</button></div></article>) : <p class="empty-copy">No pending offers.</p>}</section>
        <section class="panel-section"><div class="section-heading"><div><p class="eyebrow">Organization work</p><h2>Publish scoped work</h2></div></div>{summary.organizations.length === 0 ? <form class="form-stack" onSubmit={createOrganization}><p class="muted">Create an organization to establish shared authority and publish work. This does not verify the organization or make it public.</p><label for="org-name">Organization name</label><input id="org-name" value={orgName} onInput={(e) => setOrgName((e.currentTarget as HTMLInputElement).value)} required minLength={2} maxLength={200}/><button class="button button-primary" disabled={busy === 'create-org'}>{busy === 'create-org' ? 'Creating…' : 'Create organization'}</button></form> : managed.length === 0 ? <p class="empty-copy">You are a member, not an organization manager. Ask an owner, administrator, or manager to publish work.</p> : <form class="form-stack" onSubmit={createWork}><label for="publish-org">Publishing as</label><select id="publish-org" value={activeOrganizationId} onChange={(e) => setOrganizationId((e.currentTarget as HTMLSelectElement).value)}>{managed.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select><label for="work-title">Work title</label><input id="work-title" value={title} onInput={(e) => setTitle((e.currentTarget as HTMLInputElement).value)} minLength={3} maxLength={200} required placeholder="Describe the work"/><label for="work-scope">Scope and deliverable</label><textarea id="work-scope" value={scope} onInput={(e) => setScope((e.currentTarget as HTMLTextAreaElement).value)} rows={4} maxLength={10000} required placeholder="What is included, what is out of scope, and what delivery means."/><button class="button button-primary" disabled={busy === 'create-work'}>{busy === 'create-work' ? 'Publishing…' : 'Publish undertaking'}</button></form>}
          {summary.organizationWork.length > 0 && <div class="published-list"><h3>Your organization’s work</h3>{summary.organizationWork.map((item) => <article key={item.id}><a href={`/workspace/workbench/${item.id}`}>{item.title}</a><small>{humanise(item.status)} · {item.interestCount} interests · {item.participantCount} participants · {item.reportCount} reports</small>{item.status !== 'closed' && <button class="text-button" disabled={busy === item.id} onClick={() => void close(item)}>Close undertaking</button>}</article>)}</div>}
          <div class="published-list"><h3>Organization members</h3><p class="muted">Members share this organization’s authorized records. Only existing accounts can be added; this does not send an invitation email.</p>{team.error && <p class="form-error" role="alert">{team.error}</p>}{team.loading && !team.value ? <p class="muted" role="status">Loading memberships…</p> : team.value?.members.filter((member) => member.organizationId === activeOrganizationId).map((member) => <article key={member.id}><a>{member.name}</a><small>{member.role}</small></article>)}{administrators.some((org) => org.id === activeOrganizationId) && <form class="form-stack" onSubmit={addMember}><label for="member-email">Add existing account by email</label><input id="member-email" type="email" autoComplete="off" value={memberEmail} onInput={(e) => setMemberEmail((e.currentTarget as HTMLInputElement).value)} required/><label for="member-role">Organization role</label><select id="member-role" value={memberRole} onChange={(e) => setMemberRole((e.currentTarget as HTMLSelectElement).value)}><option value="manager">Manager</option><option value="member">Member</option><option value="viewer">Viewer</option><option value="administrator">Administrator</option></select><button class="button button-quiet" disabled={busy === 'add-member'}>{busy === 'add-member' ? 'Adding…' : 'Add member'}</button></form>}</div>
        </section><section class="boundary-note"><strong>Not enabled in this workspace</strong><span>Investment solicitation, payments, token issuance/mining, and outside-system imports require separately governed, supported flows.</span></section>
      </aside></div>
    </>}</section>;
}

function QueueSection({ id, title, description, count, children }: { id: string; title: string; description: string; count: number; children: preact.ComponentChildren }) {
  return <section id={id} class="panel-section"><div class="section-heading"><div><p class="eyebrow">Workbench</p><h2>{title} <span class="count">{count}</span></h2><p>{description}</p></div></div>{children}</section>;
}

function Undertaking({ id }: { id: string }) {
  const state = useLoad(() => data.undertaking(id), id);
  const { value: work, loading, error, refresh } = state;
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [interestText, setInterestText] = useState('');
  const [reportText, setReportText] = useState('');
  const [learning, setLearning] = useState('');
  const [localValue, setLocalValue] = useState('');
  const [financialAssessment, setFinancialAssessment] = useState<'consider' | 'not_indicated' | 'uncertain'>('uncertain');
  const [financialRationale, setFinancialRationale] = useState('');
  const [offerText, setOfferText] = useState<Record<string, string>>({});
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<Record<string, ReviewDecision>>({});
  const mutate = async (key: string, task: () => Promise<void>) => { setBusy(key); setActionError(''); setNotice(''); try { await task(); } catch (cause) { setActionError(describeApiError(cause)); } finally { setBusy(''); } };
  const submitInterest = async (event: Event) => { event.preventDefault(); if (!work || !interestText.trim()) return; await mutate('interest', async () => { await data.registerInterest(work.id, interestText.trim()); setInterestText(''); setNotice('Interest recorded with the owning organization. It is not an offer or participation.'); await refresh(); }); };
  const submitReport = async (event: Event) => { event.preventDefault(); if (!work || !reportText.trim()) return; await mutate('report', async () => { await data.submitReport(work.id, reportText.trim()); setReportText(''); setNotice('Report recorded as the participant’s account. It is not independent verification.'); await refresh(); }); };
  useEffect(() => {
    if (!work?.myReflection) return;
    setLearning(work.myReflection.learning);
    setLocalValue(work.myReflection.localValue);
    setFinancialAssessment(work.myReflection.financialRecordAssessment);
    setFinancialRationale(work.myReflection.financialRecordRationale);
  }, [work?.myReflection?.id, work?.myReflection?.version]);
  const saveReflection = async (event: Event) => { event.preventDefault(); if (!work || !learning.trim() || !localValue.trim() || !financialRationale.trim()) return; await mutate('reflection', async () => { await data.saveReflection(work.id, { learning: learning.trim(), localValue: localValue.trim(), financialRecordAssessment: financialAssessment, financialRecordRationale: financialRationale.trim(), expectedVersion: work.myReflection?.version ?? 0 }); setNotice('Your reflection was recorded. It is separate from the delivery report and organizational review.'); await refresh(); }); };
  const issueOffer = async (interestId: string) => { if (!work) return; await mutate(interestId, async () => { await data.issueOffer(work.organizationId, work.id, interestId, offerText[interestId] ?? ''); setNotice('Offer issued. Participation begins only when the recipient accepts.'); await refresh(); }); };
  const submitReview = async (reportId: string) => { if (!work) return; await mutate(reportId, async () => { await data.submitReview(work.organizationId, reportId, decision[reportId] ?? 'accepted', reviewText[reportId] ?? ''); setNotice('Review recorded separately from the report.'); await refresh(); }); };
  const close = async () => { if (!work) return; await mutate('close', async () => { await data.closeUndertaking(work.organizationId, work.id); setNotice('Undertaking closed. History remains readable.'); await refresh(); }); };
  if (error && !work) return <section class="screen"><StateMessage title="This undertaking cannot be opened" kind="error" retry={() => void refresh()}>{error}</StateMessage></section>;
  if (loading && !work) return <section class="screen"><StateMessage title="Loading undertaking" kind="loading">Reading the record and its authorized history…</StateMessage></section>;
  if (!work) return null;
  const statusText = work.status === 'active' ? 'In delivery' : work.status === 'closed' ? 'Closed' : 'Open for interest';
  return <section class="screen"><a class="back-link" href="/workspace/workbench">← Workbench</a>{notice && <p class="form-notice" role="status">{notice}</p>}{actionError && <p class="form-error" role="alert">{actionError}</p>}
    <PageHeader eyebrow={`${work.organizationName} · ${humanise(work.organizationStanding)}`} title={work.title}><span class={`status-mark status-${work.status}`}>{statusText}</span> · Published by {work.createdByName} · {dateLabel(work.createdAt)}</PageHeader>
    <nav class="record-tabs" aria-label="Undertaking sections"><a href="#record-scope">Scope</a><a href="#record-people">People</a><a href="#record-delivery">Delivery &amp; review</a><a href="#record-history">History</a></nav>
    <div class="undertaking-grid"><main><section id="record-scope" class="panel-section"><p class="eyebrow">Brief · published scope</p><h2>What this work includes</h2><p class="long-copy">{work.scope}</p></section>
      <section id="record-people" class="panel-section"><div class="section-heading"><div><p class="eyebrow">People</p><h2>Participants <span class="count">{work.participants.length}</span></h2></div></div>{work.participants.length ? work.participants.map((person) => <div class="membership-row" key={person.personId}><strong>{person.name}</strong><span>Joined {dateLabel(person.joinedAt)}</span></div>) : <p class="empty-copy">No accepted participants yet.</p>}</section>
      {work.position.isMember && <section class="panel-section"><div class="section-heading"><div><p class="eyebrow">Discovery and decision</p><h2>Expressions of interest <span class="count">{work.interests.length}</span></h2></div></div>{work.interests.length ? work.interests.map((item) => <article class="queue-item" key={item.id}><div class="queue-item-head"><strong>{item.personName}</strong><time>{dateLabel(item.createdAt)}</time>{item.declined && <span class="status-mark status-closed">Declined</span>}</div><p>{item.message}</p>{!item.declined && work.actions.canIssueOffer && <div class="inline-action"><label for={`offer-${item.id}`}>Offer and terms for this person</label><textarea id={`offer-${item.id}`} value={offerText[item.id] ?? ''} onInput={(e) => setOfferText({ ...offerText, [item.id]: (e.currentTarget as HTMLTextAreaElement).value })} placeholder="Describe the commitment, what is offered, and any relevant terms."/><div class="button-row"><button class="button button-primary" disabled={busy === item.id || !offerText[item.id]?.trim()} onClick={() => void issueOffer(item.id)}>Issue offer</button><button class="button button-quiet" disabled={busy === item.id} onClick={() => void mutate(item.id, async () => { await data.declineInterest(work.organizationId, work.id, item.id); setNotice('Interest declined and retained in the record.'); await refresh(); })}>Decline interest</button></div></div>}</article>) : <p class="empty-copy">No interest recorded.</p>}</section>}
      {work.position.isMember && <section class="panel-section"><p class="eyebrow">Commitments</p><h2>Offers</h2>{work.offers.length ? work.offers.map((offer) => <article class="queue-item" key={offer.id}><div class="queue-item-head"><strong>{offer.offeredToPersonName}</strong><span class="status-mark status-wait">{humanise(offer.status)}</span><time>{dateLabel(offer.createdAt)}</time></div><p>{offer.proposal}</p><small>Issued by {offer.issuedByName}</small></article>) : <p class="empty-copy">No offers issued yet.</p>}</section>}
      <section id="record-delivery" class="panel-section"><div class="section-heading"><div><p class="eyebrow">Participant account · organizational review</p><h2>Delivery and review</h2></div></div>{work.reports.length ? work.reports.map((report) => <article class="queue-item" key={report.id}><div class="queue-item-head"><strong>{report.authorName}</strong><time>{dateLabel(report.createdAt)}</time>{report.review && <span class="status-mark status-review">{humanise(report.review.decision)}</span>}</div><p class="long-copy">{report.report}</p>{report.review ? <div class="review-box"><strong>Review by {report.review.reviewerName}</strong><p>{report.review.rationale}</p></div> : work.position.canReview && report.authorPersonId !== work.createdByPersonId && <div class="inline-action"><label for={`decision-${report.id}`}>Review decision</label><select id={`decision-${report.id}`} value={decision[report.id] ?? 'accepted'} onChange={(e) => setDecision({ ...decision, [report.id]: (e.currentTarget as HTMLSelectElement).value as ReviewDecision })}><option value="accepted">Accepted</option><option value="needs_revision">Needs revision</option><option value="disputed">Disputed</option></select><label for={`rationale-${report.id}`}>Rationale</label><textarea id={`rationale-${report.id}`} value={reviewText[report.id] ?? ''} onInput={(e) => setReviewText({ ...reviewText, [report.id]: (e.currentTarget as HTMLTextAreaElement).value })} placeholder="What was assessed, and why?"/><button class="button button-primary" disabled={busy === report.id || !reviewText[report.id]?.trim()} onClick={() => void submitReview(report.id)}>Record review</button></div>}</article>) : <p class="empty-copy">No reports filed. A report is the participant’s account, not independent verification.</p>}{work.actions.canReport && <form class="inline-action" onSubmit={submitReport}><label for="report-text">Report delivered work</label><textarea id="report-text" rows={4} value={reportText} onInput={(e) => setReportText((e.currentTarget as HTMLTextAreaElement).value)} placeholder="What was delivered, what remains, and what the organization should assess." required/><button class="button button-primary" disabled={busy === 'report'}>{busy === 'report' ? 'Recording…' : 'Submit report'}</button></form>}</section>
      {work.status === 'closed' && (work.actions.canReflect || work.reflections.length > 0) && <section class="panel-section" aria-labelledby="reflection-title"><div class="section-heading"><div><p class="eyebrow">After close · participant-authored</p><h2 id="reflection-title">Personal reflection</h2></div></div>{work.reflections.map((reflection) => <article class="queue-item" key={reflection.latestVersionId}><div class="queue-item-head"><strong>{reflection.authorName}</strong><span class="status-mark">Version {reflection.version}</span><time>{dateLabel(reflection.createdAt)}</time></div><h3>What I learned</h3><p class="long-copy">{reflection.learning}</p><h3>Value for the local community</h3><p class="long-copy">{reflection.localValue}</p><h3>Financial-record assessment</h3><p><span class="status-mark">{humanise(reflection.financialRecordAssessment)}</span></p><p class="long-copy">{reflection.financialRecordRationale}</p></article>)}{work.actions.canReflect && <form class="inline-action" onSubmit={saveReflection}><p class="muted">This is your first-person reflection, not a delivery report, evidence claim, or organizational review. You may revise it later; each version is retained.</p><label for="reflection-learning">What did you learn?</label><textarea id="reflection-learning" rows={4} maxLength={10000} value={learning} onInput={(e) => setLearning((e.currentTarget as HTMLTextAreaElement).value)} required/><label for="reflection-value">What value did the work create for the local community?</label><textarea id="reflection-value" rows={4} maxLength={10000} value={localValue} onInput={(e) => setLocalValue((e.currentTarget as HTMLTextAreaElement).value)} required/><label for="reflection-financial-assessment">Does a separate financial record need consideration?</label><select id="reflection-financial-assessment" value={financialAssessment} onChange={(e) => setFinancialAssessment((e.currentTarget as HTMLSelectElement).value as typeof financialAssessment)}><option value="consider">Consider separately</option><option value="not_indicated">Not indicated</option><option value="uncertain">Uncertain</option></select><label for="reflection-financial-rationale">Context for this assessment</label><textarea id="reflection-financial-rationale" rows={3} maxLength={4000} value={financialRationale} onInput={(e) => setFinancialRationale((e.currentTarget as HTMLTextAreaElement).value)} required/><p class="boundary-note"><strong>Narrative context only</strong><span>Do not include amounts, account details, payment instructions, or obligations. This assessment creates no payment action or entitlement.</span></p><button class="button button-primary" disabled={busy === 'reflection'}>{busy === 'reflection' ? 'Saving…' : work.myReflection ? 'Save new reflection version' : 'Record reflection'}</button></form>}</section>}
      <section id="record-history" class="panel-section"><p class="eyebrow">Provenance</p><h2>History</h2>{work.events.length ? work.events.map((event) => <div class="event-row" key={event.id}><span class="event-dot"/><div><strong>{humanise(event.action)}</strong><p>{event.actorName}</p><time>{dateLabel(event.occurredAt)}</time></div></div>) : <p class="empty-copy">No recorded events are visible.</p>}</section></main>
      <aside class="workbench-side"><section class="panel-section"><p class="eyebrow">Your position</p><h2>Authority and next step</h2>{work.position.role ? <p class="muted">Your current organization membership: <strong>{work.position.role}</strong>. Server authorization governs each action.</p> : work.position.isParticipant ? <p class="muted">You are an accepted participant. You can report delivery; your own report cannot be reviewed by you.</p> : work.position.hasInterest ? <p class="muted">Your interest is with the organization. You are not a participant until you accept an offer.</p> : <p class="muted">This work is open. Expressing interest asks the organization to consider you; it does not create a commitment.</p>}
        {work.position.pendingOffer && <article class="offer-item"><strong>Offer waiting</strong><p>{work.position.pendingOffer.proposal}</p><small>Issued by {work.position.pendingOffer.issuedByName}</small><div class="button-row"><button class="button button-primary" disabled={busy === work.position.pendingOffer.id} onClick={() => void mutate(work.position.pendingOffer!.id, async () => { await data.decideOffer(work.position.pendingOffer!.id, 'accepted'); setNotice('Offer accepted. You are now a participant.'); await refresh(); })}>Accept</button><button class="button button-quiet" disabled={busy === work.position.pendingOffer.id} onClick={() => void mutate(work.position.pendingOffer!.id, async () => { await data.decideOffer(work.position.pendingOffer!.id, 'declined'); setNotice('Offer declined.'); await refresh(); })}>Decline</button></div></article>}
        {work.actions.canRegisterInterest && <form class="inline-action" onSubmit={submitInterest}><label for="interest-text">Why this scope fits your work</label><textarea id="interest-text" value={interestText} onInput={(e) => setInterestText((e.currentTarget as HTMLTextAreaElement).value)} placeholder="Relevant experience, crew/context if applicable, availability, and what you need to deliver." required/><button class="button button-primary" disabled={busy === 'interest'}>{busy === 'interest' ? 'Sending…' : 'Express interest'}</button></form>}
        {work.actions.canClose && <div class="inline-action"><p class="muted">Closing stops new interest, offers, and reports; history stays readable.</p><button class="button button-quiet" disabled={busy === 'close'} onClick={() => void close()}>Close undertaking</button></div>}
      </section><section class="boundary-note"><strong>What this record does not mean</strong><span>A report is not physical verification. Review is an organizational decision, not settlement. No payment or credential is created here.</span></section></aside></div></section>;
}

function Network({ section }: { section: string }) {
  const [mode, setMode] = useState<'list' | 'graph'>('list');
  const [query, setQuery] = useState('');
  const network = useLoad(() => data.network(), 'network');
  const records = useLoad(() => data.undertakings(), 'network-work');
  const people = network.value?.members ?? [];
  const organizations = network.value?.organizations ?? [];
  const work = records.value ?? [];
  const visiblePeople = people.filter((person) => `${person.name} ${person.organizationName} ${person.role}`.toLowerCase().includes(query.toLowerCase()));
  return <section class="screen"><PageHeader eyebrow="Network · authorized connections" title="People and institutions, in context">Relationships are visible through shared memberships and work you can access. Membership is not capability or authority.</PageHeader>
    <div class="section-tabs" aria-label="Network views"><a href="/workspace/network/people" aria-current={section === 'people' ? 'page' : undefined}>People</a><a href="/workspace/network/institutions" aria-current={section === 'institutions' ? 'page' : undefined}>Institutions</a><a href="/workspace/network/capabilities" aria-current={section === 'capabilities' ? 'page' : undefined}>Capabilities</a></div>
    {section === 'capabilities' ? <StateMessage title="Capabilities are not connected yet">No capability claims are shown here. When connected, a claim will remain separate from supporting evidence and an assessment.</StateMessage> : <><div class="view-controls"><div role="group" aria-label="Network display"><button class={mode === 'list' ? 'control-active' : ''} onClick={() => setMode('list')}>List</button><button class={mode === 'graph' ? 'control-active' : ''} onClick={() => setMode('graph')}>Graph</button></div>{mode === 'list' && <label><span class="sr-only">Search network</span><input value={query} onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)} placeholder={section === 'institutions' ? 'Search organizations' : 'Search people or organization'}/></label>}</div>
      {network.error || records.error ? <StateMessage title="Network could not be loaded" kind="error" retry={() => { void network.refresh(); void records.refresh(); }}>{network.error || records.error}</StateMessage> : (network.loading && !network.value || records.loading && !records.value) ? <StateMessage title="Loading your network" kind="loading">Only authorized memberships and work are requested.</StateMessage> : mode === 'graph' ? <NetworkGraph organizations={organizations} people={people} work={work}/>: section === 'institutions' ? <div class="record-list">{organizations.filter((org) => `${org.name} ${org.role} ${org.standing}`.toLowerCase().includes(query.toLowerCase())).map((org) => <article class="membership-row" key={org.id}><strong>{org.name}</strong><span>{org.role} · {humanise(org.standing)} · standing is descriptive, not authority</span></article>)}</div> : visiblePeople.length ? <div class="people-list">{visiblePeople.map((person) => <article class="people-row" key={`${person.organizationId}-${person.id}`}><span class="person-mark" aria-hidden="true">{person.name.trim().charAt(0).toUpperCase()}</span><div><strong>{person.name}</strong><small>{person.organizationName}</small></div><span class="role-chip">{person.role}</span></article>)}</div> : <StateMessage title={query ? 'No visible people match' : 'No other members are visible'}>{query ? 'Try another search.' : 'People appear through active organization memberships. Profiles are not fabricated.'}</StateMessage>}</>}
    <div class="boundary-note"><strong>Graph boundary</strong><span>Graph links are authorized records, not proof of endorsement, ownership, or unrestricted access. A missing link may be outside your view.</span></div>
  </section>;
}

function NetworkGraph({ organizations, people, work }: { organizations: WorkspaceOrganization[]; people: WorkspaceNetwork['members']; work: WorkspaceUndertaking[] }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<Core | null>(null);
  const [selected, setSelected] = useState<{ id: string; title: string; kind: string; description: string } | null>(null);
  const allOrganizations = Array.from(new Map([
    ...organizations.map((org) => [org.id, org] as const),
    ...work.map((item) => [item.organizationId, { id: item.organizationId, name: item.organizationName, role: 'visible work', standing: item.organizationStanding }] as const),
  ]).values());
  const allNodes: Array<{ id: string; title: string; kind: string; description: string }> = [
    ...allOrganizations.map((org) => ({ id: `org:${org.id}`, title: org.name, kind: 'Organization', description: `${org.role} · ${humanise(org.standing)} standing` })),
    ...Array.from(new Map(people.map((person) => [person.id, person])).values()).map((person) => ({ id: `person:${person.id}`, title: person.name, kind: 'Person', description: `Visible through ${people.filter((membership) => membership.id === person.id).map((membership) => membership.organizationName).join(', ')}` })),
    ...work.map((item) => ({ id: `work:${item.id}`, title: item.title, kind: 'Undertaking', description: `${item.organizationName} · ${humanise(item.status)}` })),
  ];
  const lookup = new Map(allNodes.map((node) => [node.id, node]));
  const organizationById = new Map(allOrganizations.map((organization) => [organization.id, organization]));
  const elements: ElementDefinition[] = [
    ...allNodes.map((node) => ({ data: { id: node.id, label: node.title, kind: node.kind } })),
    ...people.map((person) => ({ data: { id: `m:${person.id}:${person.organizationId}`, source: `person:${person.id}`, target: `org:${person.organizationId}`, label: 'member of' } })),
    ...work.filter((item) => organizationById.has(item.organizationId)).flatMap((item) => [
      { data: { id: `owner:${item.id}`, source: `org:${item.organizationId}`, target: `work:${item.id}`, label: 'published' } },
    ]),
  ];
  useEffect(() => {
    if (!host) return;
    let cy: Core | null = null;
    let cancelled = false;
    void import('cytoscape').then(({ default: cytoscape }) => {
      if (cancelled) return;
      cy = cytoscape({ container: host, elements, minZoom: 0.4, maxZoom: 2.5, style: [
      { selector: 'node', style: { 'background-color': (ele: cytoscape.NodeSingular) => ({ Organization: '#274b38', Person: '#527482', Undertaking: '#a26f3d' }[String(ele.data('kind'))] ?? '#527482'), label: 'data(label)', color: '#25352a', 'font-family': 'system-ui, sans-serif', 'font-size': '10px', 'text-wrap': 'ellipsis', 'text-max-width': '110px', 'text-valign': 'bottom', 'text-margin-y': 6, width: 27, height: 27, 'border-width': 2, 'border-color': '#faf8f2' } },
      { selector: 'node:selected', style: { 'border-color': '#a26f3d', 'border-width': 4, width: 34, height: 34 } },
      { selector: 'edge', style: { width: 1, 'line-color': '#aab5a9', 'target-arrow-color': '#aab5a9', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', color: '#68766c', 'font-size': '8px', 'text-background-color': '#faf8f2', 'text-background-opacity': 0.85, 'text-background-padding': '2px' } },
    ], layout: { name: 'cose', animate: false, fit: true, padding: 42, nodeRepulsion: () => 8500, idealEdgeLength: () => 110 } });
      cy.on('tap', 'node', (event) => { const node = lookup.get(String(event.target.id())); if (node) setSelected(node); });
      cy.on('tap', (event) => { if (event.target === cy) setSelected(null); });
      setInstance(cy);
    });
    return () => { cancelled = true; cy?.destroy(); setInstance(null); };
  }, [host, organizations, people, work]);
  return <div class="graph-layout"><section class="graph-panel"><div class="graph-toolbar"><span>{allNodes.length} visible records · {elements.length - allNodes.length} links</span><div><button onClick={() => instance?.fit(undefined, 36)}>Fit</button><button onClick={() => instance?.reset()}>Reset</button></div></div><div class="graph-canvas" ref={setHost} role="img" aria-label="Authorized network graph of organizations, members, and undertakings"/><div class="graph-legend"><span><i class="legend-organization"/>Organization</span><span><i class="legend-person"/>Person</span><span><i class="legend-work"/>Undertaking</span></div></section><aside class="graph-inspector"><p class="eyebrow">Selection</p>{selected ? <><span class="record-type">{selected.kind}</span><h2>{selected.title}</h2><p>{selected.description}</p>{selected.kind === 'Undertaking' && <a class="text-link" href={`/workspace/workbench/${selected.id.slice(5)}`}>Open in Workbench →</a>}</> : <><h2>Select a record</h2><p>Choose a node to inspect its authorized context. This graph is a navigation aid, not a complete or globally visible network.</p></>}<hr/><h3 class="graph-node-heading">Visible nodes</h3><div class="graph-node-list">{allNodes.map((node) => <button key={node.id} aria-pressed={selected?.id === node.id} onClick={() => { setSelected(node); instance?.getElementById(node.id).select(); }}><span class={`graph-node-dot graph-node-${node.kind.toLowerCase()}`}/><span><strong>{node.title}</strong><small>{node.kind}</small></span></button>)}</div><hr/><p class="muted">No hidden records are inferred from graph layout. Node positions carry no authority or trust score.</p></aside></div>;
}

function Records({ lens }: { lens: string }) {
  const [query, setQuery] = useState('');
  const records = useLoad(() => data.records(), 'records');
  const undertakings = records.value?.undertakings ?? [];
  const events = records.value?.events ?? [];
  const visibleWork = undertakings.filter((item) => `${item.title} ${item.organizationName} ${item.scope} ${item.status}`.toLowerCase().includes(query.toLowerCase()));
  const visibleEvents = events.filter((item) => `${item.actorName} ${item.organizationName} ${item.action} ${item.subjectType}`.toLowerCase().includes(query.toLowerCase()));
  return <section class="screen"><PageHeader eyebrow="Records · history and evidence" title="What was recorded, when, and by whom">A record shows that an action was entered. A report, review, organizational standing, and outcome are distinct things.</PageHeader>
    <div class="section-tabs" aria-label="Records lenses"><a href="/workspace/records/canon" aria-current={lens === 'canon' ? 'page' : undefined}>Canon</a><a href="/workspace/records/annals" aria-current={lens === 'annals' ? 'page' : undefined}>Annals</a><a href="/workspace/records/roll" aria-current={lens === 'roll' ? 'page' : undefined}>Roll</a></div>
    <div class="search-row"><label for="records-search">Filter visible records</label><input id="records-search" value={query} onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)} placeholder="Title, source, organization, or action"/><span>{lens === 'annals' ? visibleEvents.length : visibleWork.length} visible</span></div>
    {records.error ? <StateMessage title="Records could not be loaded" kind="error" retry={() => void records.refresh()}>{records.error}</StateMessage> : records.loading && !records.value ? <StateMessage title="Loading authorized records" kind="loading">No records are generated by this screen.</StateMessage> : lens === 'annals' ? <section class="records-table-wrap"><table class="records-table"><caption class="sr-only">Recorded events visible to this account</caption><thead><tr><th>When</th><th>Action</th><th>Recorded by</th><th>Organization</th><th>Subject</th></tr></thead><tbody>{visibleEvents.sort((a,b) => b.occurredAt.localeCompare(a.occurredAt)).map((event) => <tr key={event.id}><td>{dateLabel(event.occurredAt)}</td><td>{humanise(event.action)}</td><td>{event.actorName}</td><td>{event.organizationName ?? 'Shared network'}</td><td>{event.subjectType}</td></tr>)}</tbody></table>{!visibleEvents.length && <StateMessage title="No recorded events match this view"/>}</section> : lens === 'roll' ? <section class="roll-list">{visibleWork.length ? visibleWork.map((item) => <RollItem item={item} key={item.id}/>) : <StateMessage title="No undertakings are visible"/>}</section> : <><section class="section-block"><div class="section-heading"><div><p class="eyebrow">Canon</p><h2>Organizations</h2></div></div>{records.value?.organizations?.length ? records.value.organizations.map((org) => <div class="membership-row" key={org.id}><strong>{org.name}</strong><span>{org.role} · {humanise(org.standing)}</span></div>) : <p class="empty-copy">Organization memberships load from the authorized network view.</p>}</section><section class="section-block"><div class="section-heading"><div><p class="eyebrow">Canonical work records</p><h2>Undertakings</h2></div></div>{visibleWork.length ? visibleWork.map((item) => <WorkRow item={item} key={item.id}/>) : <StateMessage title="No undertakings match this view"/>}</section></>}
    <div class="boundary-note"><strong>Evidence is not inferred</strong><span>Roll shows the authorized undertaking record. Reported work and organization review remain separately attributed; neither proves settlement.</span></div>
  </section>;
}

function RollItem({ item }: { item: WorkspaceUndertaking }) {
  const [open, setOpen] = useState(false);
  const details = useLoad(() => data.undertaking(item.id), item.id, open);
  return <details class="roll-item" onToggle={(event) => { const next = (event.currentTarget as HTMLDetailsElement).open; setOpen(next); }}><summary><strong>{item.title}</strong><span>{item.organizationName}</span><span class={`status-mark status-${item.status}`}>{humanise(item.status)}</span><small>{item.interestCount ?? 0} interest · {item.reportCount ?? 0} report</small></summary>{open && (details.error ? <p class="form-error" role="alert">{details.error} <button onClick={() => void details.refresh()}>Retry</button></p> : details.loading && !details.value ? <p role="status">Loading authorized chain…</p> : details.value ? <div class="roll-details"><RollStage title="Interest" empty="No interest recorded.">{details.value.interests.map((interest) => <p key={interest.id}><strong>{interest.personName}</strong> · {dateLabel(interest.createdAt)}{interest.declined ? ' · declined' : ''}<br/><span>{interest.message}</span></p>)}</RollStage><RollStage title="Offers" empty="No offer issued.">{details.value.offers.map((offer) => <p key={offer.id}><strong>{offer.offeredToPersonName} · {humanise(offer.status)}</strong><br/><span>{offer.proposal}</span></p>)}</RollStage><RollStage title="Participants" empty="No participants recorded.">{details.value.participants.map((person) => <p key={person.personId}><strong>{person.name}</strong> · joined {dateLabel(person.joinedAt)}</p>)}</RollStage><RollStage title="Report and review" empty="No reports filed.">{details.value.reports.map((report) => <p key={report.id}><strong>{report.authorName}</strong> · {dateLabel(report.createdAt)}<br/><span>{report.report}</span><br/><em>{report.review ? `${humanise(report.review.decision)} by ${report.review.reviewerName}: ${report.review.rationale}` : 'Not yet reviewed · report is not independent verification'}</em></p>)}</RollStage><a class="text-link" href={`/workspace/workbench/${item.id}`}>Open in Workbench →</a></div> : null)}</details>;
}
function RollStage({ title, empty, children }: { title: string; empty: string; children: preact.ComponentChildren }) { const hasEntries = Array.isArray(children) ? children.length > 0 : Boolean(children); return <section><h3>{title}</h3>{hasEntries ? children : <p class="muted">{empty}</p>}</section>; }

function Reference() {
  const overview = useLoad(() => data.studioOverview(), 'studio-overview');
  const [type, setType] = useState<StudioObjectTypeId>('undertaking');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<StudioObjectSet | null>(null);
  const [selected, setSelected] = useState<StudioObject | null>(null);
  const [graph, setGraph] = useState<StudioGraph | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const runQuery = async (nextType = type, search = query) => { setBusy(true); setError(''); try { setResult(await data.studioQuery({ type: nextType, search: search.trim() || undefined, limit: 40, offset: 0, sort: 'recent' })); setSelected(null); setGraph(null); } catch (cause) { setError(describeApiError(cause)); } finally { setBusy(false); } };
  useEffect(() => { void runQuery(type, query); }, [type]);
  const inspect = async (object: StudioObject) => { setSelected(object); setGraph(null); try { setGraph(await data.studioGraph(object.type, object.id, 1)); } catch (cause) { setError(describeApiError(cause)); } };
  const types = overview.value?.types ?? TYPES.map((id) => ({ id, plural: `${id[0].toUpperCase()}${id.slice(1)}s`, label: id, description: '', hrefTemplate: null, properties: [], filterable: [] }));
  return <section class="screen"><PageHeader eyebrow="Reference · typed read layer" title="Explore the record">A searchable view of objects and authorized neighborhoods in the shared work record. The server controls which rows and links are visible.</PageHeader>
    {overview.error && <StateMessage title="Reference is unavailable" kind="error" retry={() => void overview.refresh()}>{overview.error}</StateMessage>}
    <div class="studio-controls"><div class="studio-types" role="tablist" aria-label="Record types">{types.map((item) => <button role="tab" aria-selected={type === item.id} class={type === item.id ? 'control-active' : ''} key={item.id} onClick={() => setType(item.id)}>{item.plural}<small>{overview.value?.counts[item.id] ?? ''}</small></button>)}</div><form class="search-row" onSubmit={(event) => { event.preventDefault(); void runQuery(); }}><label for="studio-search">Search {type}s</label><input id="studio-search" value={query} onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)} placeholder="Record, context, status"/><button class="button button-primary">Search</button></form></div>
    {error && <p class="form-error" role="alert">{error}</p>}{busy && <p role="status">Querying the authorized record…</p>}
    <div class="studio-grid"><section class="records-table-wrap"><table class="records-table"><thead><tr><th>Record</th><th>Context</th><th>State</th></tr></thead><tbody>{result?.objects.map((object) => <tr key={`${object.type}-${object.id}`} class={selected?.id === object.id ? 'row-selected' : ''} onClick={() => void inspect(object)}><td><button class="table-link" onClick={() => void inspect(object)}>{object.title}</button></td><td>{object.subtitle}</td><td>{object.status ? humanise(object.status) : 'Recorded'}</td></tr>)}</tbody></table>{!busy && !result?.objects.length && <StateMessage title="No records match this view">An empty set can mean no records, or records outside your authorization.</StateMessage>}</section>
      <aside class="object-inspector"><p class="eyebrow">Authorized object</p>{selected ? <><span class="record-type">{selected.type}</span><h2>{selected.title}</h2><p>{selected.subtitle}</p><dl>{Object.entries(selected.properties).slice(0,8).map(([key,value]) => <div key={key}><dt>{humanise(key)}</dt><dd>{value}</dd></div>)}</dl>{selected.href && <a class="text-link" href={selected.href}>Open source record →</a>}<h3>Authorized neighborhood</h3>{graph ? <><p>{graph.nodes.length} nodes · {graph.edges.length} links</p><ul>{graph.edges.map((edge) => <li key={edge.id}>{edge.label}</li>)}</ul>{!graph.edges.length && <p>No traceable links in this view.</p>}</> : <p role="status">Loading neighborhood…</p>}</> : <><h2>Select a record</h2><p>Properties and server-authorized links will appear here. A graph edge is not a grant of authority.</p></>}</aside></div>
    <section class="reference-boundaries"><h2>Record distinctions</h2><ul><li>Person ≠ account, crew, or asset.</li><li>Claim ≠ evidence ≠ assessment.</li><li>Membership ≠ mandate.</li><li>Report ≠ review ≠ settlement.</li></ul></section>
  </section>;
}
