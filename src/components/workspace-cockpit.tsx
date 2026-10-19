import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CircleAlert,
  Compass,
  GraduationCap,
  BriefcaseBusiness,
  Layers3,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { capitalEfficiencyPercent } from '@/lib/tender';
import { formatMoney } from '@/lib/tender-data';
import type { RollRecord, Tender } from '@/lib/tender';
import type { WorkspaceContextOption, WorkspaceLane } from '@/lib/workspace';
import type { CommonsPost } from '@/lib/commons';

const lanes: Array<{ key: WorkspaceLane; label: string; hint: string; icon: typeof Layers3 }> = [
  { key: 'assets', label: 'Assets', hint: 'Capital & execution', icon: Layers3 },
  { key: 'commons', label: 'Commons', hint: 'People & opportunity', icon: BriefcaseBusiness },
  { key: 'roll', label: 'Roll', hint: 'Proof & capability', icon: ScrollText },
];

function laneHref(contextKey: string, lane: WorkspaceLane): string {
  const params = new URLSearchParams({ context: contextKey, view: lane });
  return `/workspace?${params.toString()}`;
}

function dateLabel(value: string): string {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(timestamp);
}

function statusLabel(value: string): string {
  return value.replaceAll('_', ' ');
}

function contextTitle(context: WorkspaceContextOption | null): string {
  if (!context) return 'Public preview';
  if (context.kind === 'network') return 'Network Member';
  if (context.kind === 'funder') return `Funder · ${context.assetName ?? context.label}`;
  if (context.kind === 'school') {
    const role = context.role === 'principal' ? 'School Admin'
      : context.role === 'tender_issuer' ? 'Tender Issuer'
        : 'Teacher';
    return `${role} · ${context.label}`;
  }
  return `${context.role.charAt(0).toUpperCase()}${context.role.slice(1)} · ${context.assetName ?? context.label}`;
}

function CommonsSurface({ posts, error }: { posts: CommonsPost[]; error: string | null }) {
  return (
    <div className="cockpit-commons">
      <div className="commons-opportunity-callout">
        <div><p className="eyebrow">WORK / ASSET-LINKED</p><h3>Find the people behind the build.</h3><p>Open roles attach to a specific Asset. A Builder’s Roll profile travels with an application.</p></div>
        <Link className="button button-primary" href="/commons/opportunities">Open opportunities <ArrowRight aria-hidden="true" size={14} /></Link>
      </div>
      <div className="commons-feed-heading"><span className="eyebrow">FIELD SIGNAL / MODERATED ACTIVITY</span><Link href="/commons">Commons archive <ArrowUpRight aria-hidden="true" size={13} /></Link></div>
      {error ? <div className="opportunity-alert" role="alert">{error}</div> : !posts.length ? (
        <div className="cockpit-empty-state"><BookOpen aria-hidden="true" size={19} /><h3>The workshop is quiet.</h3><p>There are no published Commons updates yet. Asset-linked opportunities remain available in the work board.</p></div>
      ) : posts.slice(0, 5).map(post => (
        <article className="cockpit-commons-post" key={post.id}>
          <div className="cockpit-commons-meta"><span>{post.post_kind === 'poll' ? 'ADVISORY POLL' : 'FIELD NOTE'}</span><time dateTime={post.published_at}>{dateLabel(post.published_at)}</time></div>
          <h3><Link href={`/commons/${post.id}`}>{post.title}</Link></h3>
          <p>{post.body}</p>
          <div className="cockpit-commons-byline"><span>{post.author_name}</span><Link href={`/commons/${post.id}`}>Open note <ArrowRight aria-hidden="true" size={12} /></Link></div>
        </article>
      ))}
    </div>
  );
}

function StateRail({ context, configured, tenders }: { context: WorkspaceContextOption | null; configured: boolean; tenders: Tender[] }) {
  const role = context?.kind === 'crew' ? context.role : null;

  if (role) {
    const state = context?.tenderStatus ? statusLabel(context.tenderStatus) : 'Assigned Tender';
    const next = context?.tenderStatus === 'fabrication' && role === 'anchor'
      ? 'Inspect the active Blueprint and continue through Anchor sign-off.'
      : context?.tenderStatus === 'anchor_signed'
        ? 'The assigned crew can record deployment to the Roll.'
        : 'Open your assigned Assembly to see the next permitted transition.';
    return (
      <section className="cockpit-rail-card cockpit-rail-primary">
        <p className="eyebrow">YOUR ASSIGNMENT / {role.toUpperCase()}</p>
        <h2>{context?.assetName ?? 'Assigned build'}</h2>
        <div className="cockpit-state-line"><span className="cockpit-state-dot" /><strong>{state}</strong></div>
        <p>{next}</p>
        {context?.tenderId && !context.isIllustrative
          ? <Link className="button button-primary" href={`/assembly/${context.tenderId}`}>Open assigned Assembly <ArrowRight aria-hidden="true" size={14} /></Link>
          : <p className="cockpit-caution">Illustrative Tenders are not assignable and cannot enter a real Assembly.</p>}
        <div className="cockpit-rail-evidence"><ShieldCheck aria-hidden="true" size={14} /><span>Every transition is checked against this assignment on the server.</span></div>
      </section>
    );
  }

  if (context?.kind === 'funder') {
    const asset = tenders.find(tender => tender.id === context.tenderId);
    return (
      <section className="cockpit-rail-card cockpit-rail-primary">
        <p className="eyebrow">FUNDER / CAPITAL INTENT</p>
        <h2>{context.assetName ?? 'Your backed Asset'}</h2>
        <div className="cockpit-state-line"><span className="cockpit-state-dot" /><strong>Intent recorded · non-binding</strong></div>
        {asset ? (
          <div className="funder-context-metrics">
            <div><span>BUILD COST</span><strong>{formatMoney(asset.assetBuildCostMinor, asset.currency)}</strong></div>
            <div><span>PROJECTED ANNUAL YIELD</span><strong>{asset.projectedAnnualYieldMinor === null ? 'Not modeled' : formatMoney(asset.projectedAnnualYieldMinor, asset.currency)}</strong></div>
            <div><span>CAPITAL EFFICIENCY</span><strong>{capitalEfficiencyPercent(asset) === null ? 'Evidence pending' : `${capitalEfficiencyPercent(asset)}% / year`}</strong></div>
          </div>
        ) : <p>Asset economics could not be loaded for this capital context.</p>}
        <p>Intent is not a payment, escrow balance, or yield right. Offline settlement is separately verified by an authorized issuer.</p>
        {context.tenderSlug && <Link className="button button-primary" href={`/tenders/${context.tenderSlug}`}>Open Asset dossier <ArrowRight aria-hidden="true" size={14} /></Link>}
        <div className="cockpit-rail-evidence"><ShieldCheck aria-hidden="true" size={14} /><span>Projected yield is a model, not realized revenue.</span></div>
      </section>
    );
  }

  if (context?.kind === 'school') {
    return (
      <section className="cockpit-rail-card cockpit-rail-primary">
        <p className="eyebrow">SCHOOL / LOCAL CONTEXT</p>
        <h2>Keep records on the device.</h2>
        <div className="cockpit-state-line"><GraduationCap aria-hidden="true" size={14} /><strong>School records stay local</strong></div>
        <p>The School Console is a separate local-first utility, represented in the public register as Asset 001. No student records or device drafts enter this network workspace.</p>
        <Link className="button button-primary" href="/tenders/school-console">Review Asset 001 <ArrowRight aria-hidden="true" size={14} /></Link>
        <div className="cockpit-rail-evidence"><LockKeyhole aria-hidden="true" size={14} /><span>Network actions require separately verified membership.</span></div>
      </section>
    );
  }

  return (
    <>
      <section className="cockpit-rail-card cockpit-rail-primary">
        <p className="eyebrow">YOUR NETWORK STATE</p>
        <h2>{configured ? 'Basic network member' : 'Public preview'}</h2>
        <div className="cockpit-state-line"><Compass aria-hidden="true" size={14} /><strong>No work role is assigned</strong></div>
        <p>Read the public Market and Roll. School and crew contexts appear only after trusted administrators assign membership; there is no open-role signup or self-serve invitation workflow.</p>
        <Link className="button button-primary" href="/tenders">Explore public Tenders <ArrowRight aria-hidden="true" size={14} /></Link>
        {!configured && <p className="cockpit-caution">Account-backed actions are unavailable until Supabase is configured.</p>}
      </section>
      <section className="cockpit-rail-card">
        <p className="eyebrow">CAPITAL / INTENT SIGNAL</p>
        <h2>Allocate with eyes open.</h2>
        <p>Authenticated members can record non-binding Capital Intent. It is not payment, settlement, escrow, or a promise of yield; an authorized issuer must verify offline settlement.</p>
        <Link className="cockpit-subtle-link" href="/tenders">Inspect asset dossiers <ArrowUpRight aria-hidden="true" size={13} /></Link>
      </section>
    </>
  );
}

function TenderSurface({ tenders, context }: { tenders: Tender[]; context: WorkspaceContextOption | null }) {
  const registerHref = '/tenders';
  const prioritized = context?.tenderId
    ? [...tenders].sort((left, right) => Number(right.id === context.tenderId) - Number(left.id === context.tenderId))
    : tenders;
  const visibleTenders = prioritized.slice(0, 6);
  if (!visibleTenders.length) {
    return <div className="cockpit-empty-state"><p className="eyebrow">TENDER / MARKET</p><h3>No open Tenders are listed.</h3><p>The Asset Register will show published infrastructure when it exists. Illustrative scenarios are never shown as live work.</p><Link className="cockpit-subtle-link" href={registerHref}>Open public asset register <ArrowRight aria-hidden="true" size={14} /></Link></div>;
  }
  return (
    <div className="cockpit-tender-list">
      {visibleTenders.map(tender => (
        <article className="cockpit-tender-card" key={tender.id}>
          <div className="cockpit-tender-topline">
            <span>{tender.isIllustrative ? 'ILLUSTRATIVE' : `PUBLISHED / ${statusLabel(tender.status).toUpperCase()}`}</span>
            <span>{tender.location || tender.category}</span>
          </div>
          <div className="cockpit-tender-main">
            <div><h3><Link href={`/tenders/${tender.slug}`}>{tender.assetName}</Link></h3><p>{tender.summary}</p></div>
            <ArrowUpRight aria-hidden="true" size={15} />
          </div>
          <div className="cockpit-math">
            <div><span>ASSET BUILD COST</span><strong>{formatMoney(tender.assetBuildCostMinor, tender.currency)}</strong></div>
            <i aria-hidden="true" />
            <div><span>PROJECTED ANNUAL YIELD</span><strong>{tender.projectedAnnualYieldMinor === null ? 'Not modeled' : formatMoney(tender.projectedAnnualYieldMinor, tender.currency)}</strong></div>
            <div className="cockpit-math-delta"><span>CAPITAL EFFICIENCY</span><strong>{capitalEfficiencyPercent(tender) === null ? 'Evidence pending' : `${capitalEfficiencyPercent(tender)}% / year`}</strong></div>
          </div>
          <div className="cockpit-tender-footer">
            <span>{tender.issuer} · {tender.isIllustrative ? 'planning example only' : 'public listing'}</span>
            <Link href={`/tenders/${tender.slug}`}>Inspect asset dossier <ArrowRight aria-hidden="true" size={13} /></Link>
          </div>
        </article>
      ))}
      <p className="cockpit-note">Yield figures are scenarios, not realized revenue. Capital Intent is non-binding and does not mean funds have settled.</p>
      <Link className="cockpit-subtle-link" href={registerHref}>Browse the public asset register <ArrowRight aria-hidden="true" size={14} /></Link>
    </div>
  );
}

function RollSurface({
  records,
  configured,
  context,
}: {
  records: RollRecord[];
  configured: boolean;
  context: WorkspaceContextOption | null;
}) {
  const capabilityRecord = context?.kind === 'crew' && !context.isIllustrative
    ? records.find(record => record.tenderId === context.tenderId)
    : undefined;
  const capabilityBadge = capabilityRecord && context
    ? (
      <article className="capability-badge" aria-label="Roll-backed capability badge prototype">
        <div className="capability-badge-seal"><BadgeCheck aria-hidden="true" size={25} /><span>APT / ROLL</span></div>
        <div className="capability-badge-copy">
          <p className="eyebrow">CAPABILITY BADGE / NON-TRANSFERABLE</p>
          <h3>{capabilityRecord.assetName}</h3>
          <p>{context.role} · Anchor-verified deployment · {dateLabel(capabilityRecord.deployedAt)}</p>
          <code>ROLL {capabilityRecord.id} · BLUEPRINT {capabilityRecord.blueprintHash.slice(0, 18)}…</code>
        </div>
        <div className="capability-badge-foot">LABOR PROOF · NO YIELD RIGHTS ATTACHED</div>
      </article>
    )
    : null;
  if (!records.length) {
    return (
      <>
        {capabilityBadge}
        <div className="cockpit-empty-state">
          <div className="cockpit-empty-glyph"><BadgeCheck aria-hidden="true" size={20} /></div>
          <p className="eyebrow">ROLL / PROOF RECORD</p>
          <h3>No completed build is recorded yet.</h3>
          <p>The Roll is written only after assigned-Anchor sign-off and deployment. A cryptographically portable credential is not issued in this deployment.</p>
          <Link className="cockpit-subtle-link" href="/roll">Open the public Roll <ArrowRight aria-hidden="true" size={14} /></Link>
        </div>
      </>
    );
  }
  return (
    <div className="cockpit-roll-list">
      {capabilityBadge}
      {context?.kind === 'crew' && !capabilityBadge && (
        <div className="capability-badge-empty">
          <p className="eyebrow">CAPABILITY BADGE / NOT YET EARNED</p>
          <strong>Build first. The Roll remembers.</strong>
          <span>Only a deployed, Anchor-signed Tender can support a labor credential. Capital intent and account activity do not count.</span>
        </div>
      )}
      <div className="cockpit-roll-heading"><BadgeCheck aria-hidden="true" size={17} /><span>{configured ? 'PUBLISHED DEPLOYMENT RECORDS' : 'PUBLIC PREVIEW · NO LIVE DATABASE'}</span></div>
      {records.slice(0, 6).map(record => (
        <article className="cockpit-roll-card" key={record.id}>
          <div><p className="eyebrow">ANCHOR-VERIFIED DEPLOYMENT</p><h3>{record.assetName}</h3></div>
          <div className="cockpit-roll-details"><span>Deployed {dateLabel(record.deployedAt)}</span><span>Blueprint hash · {record.blueprintHash.slice(0, 14)}…</span></div>
          <Link href="/roll">Inspect proof record <ArrowRight aria-hidden="true" size={13} /></Link>
        </article>
      ))}
      <p className="cockpit-note">The prototype capability badge is a context-linked view of a Roll record, not yet a public-key-verifiable credential. No cash-flow or cooperative voting rights are issued by this screen.</p>
    </div>
  );
}

export function WorkspaceCockpit({
  context,
  view,
  tenders,
  roll,
  commonsPosts,
  commonsError,
  configured,
  invalidContext,
  email,
}: {
  context: WorkspaceContextOption | null;
  view: WorkspaceLane;
  tenders: Tender[];
  roll: RollRecord[];
  commonsPosts: CommonsPost[];
  commonsError: string | null;
  configured: boolean;
  invalidContext: boolean;
  email: string | null;
}) {
  const title = contextTitle(context);
  const lane = lanes.find(item => item.key === view) ?? lanes[0];
  const LaneIcon = lane.icon;

  return (
    <main className="site-shell workspace-shell cockpit-shell">
      <SiteHeader />
      <div className="cockpit-topline">
        <div><p className="eyebrow"><span className="signal-dot" /> APT-LABS / NETWORK STUDIO</p><h1>Where the work moves.</h1></div>
        <div className="cockpit-topline-context"><span>ACTIVE CONTEXT</span><strong>{title}</strong><small>{email ?? 'Signed in'}</small></div>
      </div>

      {invalidContext && (
        <div className="cockpit-context-alert" role="status">
          <CircleAlert aria-hidden="true" size={15} />
          {configured
            ? 'That context is no longer available to this account. Showing your default verified context.'
            : 'Workspace contexts are unavailable until sign-in is configured. Showing the public preview.'}
        </div>
      )}

      <div className="cockpit-grid">
        <aside className="cockpit-left" aria-label="Network studio navigation">
          <div className="cockpit-loop-label"><span>NETWORK STUDIO</span><span>01 — 03</span></div>
          <nav className="cockpit-loop-nav">
            {lanes.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  aria-current={view === item.key ? 'page' : undefined}
                  className={`cockpit-loop-link ${view === item.key ? 'active' : ''}`}
                  href={laneHref(context?.key ?? 'network', item.key)}
                  key={item.key}
                >
                  <span className="cockpit-loop-index">0{index + 1}</span>
                  <Icon aria-hidden="true" size={16} />
                  <span className="cockpit-loop-copy"><strong>{item.label}</strong><small>{item.hint}</small></span>
                  {view === item.key && <span className="cockpit-loop-current" aria-label="Current stage" />}
                </Link>
              );
            })}
          </nav>
          <div className="cockpit-left-divider" />
          <p className="eyebrow">QUICK ACCESS</p>
          <Link className="cockpit-tool-link" href="/commons/opportunities"><BriefcaseBusiness aria-hidden="true" size={15} /><span>Open roles<small>Asset-linked work</small></span><ArrowUpRight aria-hidden="true" size={13} /></Link>
          <Link className="cockpit-tool-link" href="/tenders/school-console"><GraduationCap aria-hidden="true" size={15} /><span>School Console Asset<small>Asset 001 · local utility</small></span><ArrowUpRight aria-hidden="true" size={13} /></Link>
          <div className="cockpit-left-footer"><ShieldCheck aria-hidden="true" size={14} /><span>Contexts show relationships. Server permissions decide actions.</span></div>
        </aside>

        <section className="cockpit-center" aria-labelledby="cockpit-lane-title">
          <div className="cockpit-center-heading">
            <div className="cockpit-center-icon"><LaneIcon aria-hidden="true" size={18} /></div>
            <div><p className="eyebrow">THE NETWORK / {String(lanes.findIndex(item => item.key === view) + 1).padStart(2, '0')}</p><h2 id="cockpit-lane-title">{lane.label}</h2></div>
            <span className="cockpit-context-pill">{context?.kind === 'crew' ? context.role.toUpperCase() : context?.kind === 'school' ? 'SCHOOL CONTEXT' : 'NETWORK VIEW'}</span>
          </div>
          <div className="network-pane-tabs" aria-label="Selected network pane">
            {lanes.map(item => <span aria-current={item.key === view ? 'page' : undefined} className={item.key === view ? 'current' : ''} key={item.key}>{item.label}</span>)}
          </div>
          <div className="cockpit-lane-content">
            {view === 'assets' && <TenderSurface context={context} tenders={tenders} />}
            {view === 'commons' && <CommonsSurface error={commonsError} posts={commonsPosts} />}
            {view === 'roll' && <RollSurface configured={configured} context={context} records={roll} />}
          </div>
        </section>

        <aside className="cockpit-right" aria-label="Profile and current state">
          <div className="cockpit-rail-heading"><p className="eyebrow">STATE / NEXT ACTION</p><span>LIVE PERMISSIONS</span></div>
          <StateRail configured={configured} context={context} tenders={tenders} />
          <section className="cockpit-rail-card cockpit-rail-limits">
            <p className="eyebrow">PROOF / CURRENT RULE</p>
            <ul>
                <li><span>Profile</span><strong>Consent-first</strong></li>
                <li><span>Capability</span><strong>Verified deployment</strong></li>
                <li><span>Capital</span><strong>Intent is not payment</strong></li>
            </ul>
            <Link className="cockpit-subtle-link" href="/roll">Inspect proof rules <ArrowRight aria-hidden="true" size={13} /></Link>
          </section>
        </aside>
      </div>
      <footer className="page-footer"><span>APT-LABS / NETWORK STUDIO</span><span>Assets ↔ Commons ↔ Roll · verified work moves the graph</span></footer>
    </main>
  );
}
