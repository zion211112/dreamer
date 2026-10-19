import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CircleAlert,
  Compass,
  Factory,
  GraduationCap,
  Layers3,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { formatMoney } from '@/lib/tender-data';
import type { RollRecord, Tender } from '@/lib/tender';
import type { WorkspaceContextOption } from '@/lib/workspace';

export type WorkspaceLane = 'demand' | 'tenders' | 'assemblies' | 'roll';

const lanes: Array<{ key: WorkspaceLane; label: string; hint: string; icon: typeof Layers3 }> = [
  { key: 'demand', label: 'Demand', hint: 'Name the need', icon: Sparkles },
  { key: 'tenders', label: 'Tenders', hint: 'Inspect the math', icon: Layers3 },
  { key: 'assemblies', label: 'Assembly', hint: 'Do assigned work', icon: Factory },
  { key: 'roll', label: 'Roll', hint: 'Read verified proof', icon: ScrollText },
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
  if (context.kind === 'school') {
    const role = context.role === 'principal' ? 'School Admin'
      : context.role === 'tender_issuer' ? 'Tender Issuer'
        : 'Teacher';
    return `${role} · ${context.label}`;
  }
  return `${context.role.charAt(0).toUpperCase()}${context.role.slice(1)} · ${context.assetName ?? context.label}`;
}

function StateRail({ context, configured }: { context: WorkspaceContextOption | null; configured: boolean }) {
  const role = context?.kind === 'crew' ? context.role : null;
  const schoolCanPublish = context?.kind === 'school' && ['principal', 'tender_issuer'].includes(context.role);
  const schoolConsoleHref = schoolCanPublish ? '/console?role=principal#issue-tender' : '/console';

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

  if (context?.kind === 'school') {
    return (
      <section className="cockpit-rail-card cockpit-rail-primary">
        <p className="eyebrow">DEMAND / LOCAL CONSOLE</p>
        <h2>Your device is the starting point.</h2>
        <div className="cockpit-state-line"><GraduationCap aria-hidden="true" size={14} /><strong>School records stay local</strong></div>
        <p>{schoolCanPublish
          ? 'Use the Console to prepare a school Tender with quotes, an itemized bill of materials and assigned crew.'
          : 'The Console is available locally. Tender publication remains limited to a Principal or Tender issuer.'}</p>
        <Link className="button button-primary" href={schoolConsoleHref}>
          {schoolCanPublish ? 'Prepare a school Tender' : 'Open School Console'}
          <ArrowRight aria-hidden="true" size={14} />
        </Link>
        <div className="cockpit-rail-evidence"><LockKeyhole aria-hidden="true" size={14} /><span>No student or local Console records are sent to this workspace.</span></div>
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
        <p className="eyebrow">CAPITAL / CONTACT ONLY</p>
        <h2>Interest is not funding.</h2>
        <p>There is no Funder account, escrow, deposit, payment or yield workflow here. A public Tender may offer a contact-only conversation.</p>
        <Link className="cockpit-subtle-link" href="/tenders">Review the public Market <ArrowUpRight aria-hidden="true" size={13} /></Link>
      </section>
    </>
  );
}

function DemandSurface({ context }: { context: WorkspaceContextOption | null }) {
  const schoolCanPublish = context?.kind === 'school' && ['principal', 'tender_issuer'].includes(context.role);
  const href = schoolCanPublish ? '/console?role=principal#issue-tender' : context?.kind === 'school' ? '/console' : '/tenders';
  return (
    <div className="cockpit-empty-state cockpit-demand-empty">
      <div className="cockpit-empty-glyph"><Sparkles aria-hidden="true" size={20} /></div>
      <p className="eyebrow">DEMAND / ORIGIN POINT</p>
      <h3>{context?.kind === 'school' ? 'The Console stays on this device.' : 'A shared Demand inbox is not live yet.'}</h3>
      <p>
        {context?.kind === 'school'
          ? 'School Console drafts stay in browser storage. A Principal or Tender issuer can use its existing, explicit publishing flow to prepare a Tender; no draft or student record syncs here.'
          : 'No shared intake queue or founder submission workflow is connected. We show no sample needs as live demand.'}
      </p>
      <div className="cockpit-boundary-row">
        <span><i /> SOURCE</span><strong>{context?.kind === 'school' ? 'Local School Console' : 'No shared source'}</strong>
        <span><i /> NEXT</span><strong>{context?.kind === 'school' ? 'Review locally, publish deliberately' : 'Public Tenders remain readable'}</strong>
      </div>
      <Link className="cockpit-subtle-link" href={href}>
        {schoolCanPublish ? 'Prepare a school Tender locally' : context?.kind === 'school' ? 'Open local Console' : 'Inspect public Market'}
        <ArrowRight aria-hidden="true" size={14} />
      </Link>
    </div>
  );
}

function TenderSurface({ tenders }: { tenders: Tender[] }) {
  const visibleTenders = tenders.slice(0, 6);
  if (!visibleTenders.length) {
    return <div className="cockpit-empty-state"><p className="eyebrow">TENDER / MARKET</p><h3>No open Tenders are listed.</h3><p>The Market will show published work when it exists. Illustrative examples are not substituted for live records.</p><Link className="cockpit-subtle-link" href="/tenders">Open public Market <ArrowRight aria-hidden="true" size={14} /></Link></div>;
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
            <div><span>IMPORT ALTERNATIVE</span><strong>{formatMoney(tender.importQuoteMinor, tender.currency)}</strong></div>
            <i aria-hidden="true" />
            <div><span>PROPOSED LOCAL BOM</span><strong>{formatMoney(tender.localBomMinor, tender.currency)}</strong></div>
            <div className="cockpit-math-delta"><span>PLANNING DIFFERENCE</span><strong>{formatMoney(tender.importQuoteMinor - tender.localBomMinor, tender.currency)}</strong></div>
          </div>
          <div className="cockpit-tender-footer">
            <span>{tender.issuer} · {tender.isIllustrative ? 'planning example only' : 'public listing'}</span>
            <Link href={`/tenders/${tender.slug}`}>Inspect Tender <ArrowRight aria-hidden="true" size={13} /></Link>
          </div>
        </article>
      ))}
      <p className="cockpit-note">The difference is a planning comparison—not realized savings, funds collected or available escrow.</p>
      <Link className="cockpit-subtle-link" href="/tenders">Browse all public Tenders <ArrowRight aria-hidden="true" size={14} /></Link>
    </div>
  );
}

function AssemblySurface({
  contexts,
  selectedContext,
  tenders,
}: {
  contexts: WorkspaceContextOption[];
  selectedContext: WorkspaceContextOption | null;
  tenders: Tender[];
}) {
  const assignments = selectedContext?.kind === 'crew'
    ? [selectedContext]
    : contexts.filter(context => context.kind === 'crew');
  if (!assignments.length) {
    return (
      <div className="cockpit-empty-state">
        <div className="cockpit-empty-glyph"><Factory aria-hidden="true" size={20} /></div>
        <p className="eyebrow">ASSEMBLY / ASSIGNED WORK ONLY</p>
        <h3>No assigned Assembly is in this context.</h3>
        <p>Assembly is not an open chat room or public crew directory. It appears here only when your account is assigned to a Tender.</p>
        <Link className="cockpit-subtle-link" href="/tenders">Inspect open work <ArrowRight aria-hidden="true" size={14} /></Link>
      </div>
    );
  }
  return (
    <div className="cockpit-assignment-list">
      {assignments.map(assignment => {
        const tender = tenders.find(item => item.id === assignment.tenderId);
        const status = assignment.tenderStatus ?? tender?.status ?? 'open';
        return (
          <article className="cockpit-assignment-card" key={assignment.key}>
            <div className="cockpit-assignment-heading">
              <span className="cockpit-role-chip">{assignment.role}</span>
              <span>{statusLabel(status)}</span>
            </div>
            <h3>{assignment.assetName ?? assignment.label}</h3>
            <p>{tender?.summary ?? 'Assigned Tender record; open the private Assembly for its current Blueprint and transition state.'}</p>
            <div className="cockpit-assignment-footer">
              <span>{tender?.isIllustrative || assignment.isIllustrative ? 'Illustrative record · cannot enter Assembly' : 'Server-verified assignment'}</span>
              {assignment.tenderId && !assignment.isIllustrative
                ? <Link href={`/assembly/${assignment.tenderId}`}>Open Assembly <ArrowRight aria-hidden="true" size={13} /></Link>
                : <span>Not actionable</span>}
            </div>
          </article>
        );
      })}
      <p className="cockpit-note">Milestones and sign-off remain inside the existing assigned-crew workflow; no chat, file uploads or payment release are implied.</p>
    </div>
  );
}

function RollSurface({ records, configured }: { records: RollRecord[]; configured: boolean }) {
  if (!records.length) {
    return (
      <div className="cockpit-empty-state">
        <div className="cockpit-empty-glyph"><BadgeCheck aria-hidden="true" size={20} /></div>
        <p className="eyebrow">ROLL / PROOF RECORD</p>
        <h3>No completed build is recorded yet.</h3>
        <p>The Roll is written only when the existing Tender lifecycle records Anchor sign-off and deployment. A personal SBT or transferable credential is not issued.</p>
        <Link className="cockpit-subtle-link" href="/roll">Open the public Roll <ArrowRight aria-hidden="true" size={14} /></Link>
      </div>
    );
  }
  return (
    <div className="cockpit-roll-list">
      <div className="cockpit-roll-heading"><BadgeCheck aria-hidden="true" size={17} /><span>{configured ? 'PUBLISHED DEPLOYMENT RECORDS' : 'PUBLIC PREVIEW · NO LIVE DATABASE'}</span></div>
      {records.slice(0, 6).map(record => (
        <article className="cockpit-roll-card" key={record.id}>
          <div><p className="eyebrow">ANCHOR-VERIFIED DEPLOYMENT</p><h3>{record.assetName}</h3></div>
          <div className="cockpit-roll-details"><span>Deployed {dateLabel(record.deployedAt)}</span><span>Blueprint hash · {record.blueprintHash.slice(0, 14)}…</span></div>
          <Link href="/roll">Inspect proof record <ArrowRight aria-hidden="true" size={13} /></Link>
        </article>
      ))}
      <p className="cockpit-note">The Roll records completed work and its Blueprint hash. It is not an SBT, wallet, yield balance or voting entitlement.</p>
    </div>
  );
}

export function WorkspaceCockpit({
  contexts,
  context,
  view,
  tenders,
  roll,
  configured,
  invalidContext,
  email,
}: {
  contexts: WorkspaceContextOption[];
  context: WorkspaceContextOption | null;
  view: WorkspaceLane;
  tenders: Tender[];
  roll: RollRecord[];
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
        <div><p className="eyebrow"><span className="signal-dot" /> APT-LABS / EXECUTION COCKPIT</p><h1>Where the work moves.</h1></div>
        <div className="cockpit-topline-context"><span>ACTIVE CONTEXT</span><strong>{title}</strong><small>{email ?? 'Public preview · no account data'}</small></div>
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
        <aside className="cockpit-left" aria-label="Durable loop navigation">
          <div className="cockpit-loop-label"><span>THE DURABLE LOOP</span><span>01 — 04</span></div>
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
          <p className="eyebrow">TOOLS</p>
          <Link className="cockpit-tool-link" href="/commons"><BookOpen aria-hidden="true" size={15} /><span>Commons<small>Activity & library</small></span><ArrowUpRight aria-hidden="true" size={13} /></Link>
          {context?.kind === 'school' && <Link className="cockpit-tool-link" href="/console"><GraduationCap aria-hidden="true" size={15} /><span>School Console<small>Local to this device</small></span><ArrowUpRight aria-hidden="true" size={13} /></Link>}
          <div className="cockpit-left-footer"><ShieldCheck aria-hidden="true" size={14} /><span>Contexts show relationships. Server permissions decide actions.</span></div>
        </aside>

        <section className="cockpit-center" aria-labelledby="cockpit-lane-title">
          <div className="cockpit-center-heading">
            <div className="cockpit-center-icon"><LaneIcon aria-hidden="true" size={18} /></div>
            <div><p className="eyebrow">THE LOOP / {String(lanes.findIndex(item => item.key === view) + 1).padStart(2, '0')}</p><h2 id="cockpit-lane-title">{lane.label}</h2></div>
            <span className="cockpit-context-pill">{context?.kind === 'crew' ? context.role.toUpperCase() : context?.kind === 'school' ? 'SCHOOL CONTEXT' : 'NETWORK VIEW'}</span>
          </div>
          <div className="cockpit-loop-track" aria-label={`Selected loop stage: ${lane.label}`}>
            {lanes.map((item, index) => <span className={item.key === view ? 'current' : index < lanes.findIndex(entry => entry.key === view) ? 'past' : ''} key={item.key}><i />{item.label}</span>)}
          </div>
          <div className="cockpit-lane-content">
            {view === 'demand' && <DemandSurface context={context} />}
            {view === 'tenders' && <TenderSurface tenders={tenders} />}
            {view === 'assemblies' && <AssemblySurface contexts={contexts} selectedContext={context} tenders={tenders} />}
            {view === 'roll' && <RollSurface configured={configured} records={roll} />}
          </div>
        </section>

        <aside className="cockpit-right" aria-label="Current state and authorized actions">
          <div className="cockpit-rail-heading"><p className="eyebrow">STATE / NEXT ACTION</p><span>LIVE PERMISSIONS</span></div>
          <StateRail configured={configured} context={context} />
          <section className="cockpit-rail-card cockpit-rail-limits">
            <p className="eyebrow">PROTOCOL LIMITS / NOW</p>
            <ul>
              <li><span>Capital</span><strong>Contact only</strong></li>
              <li><span>Demand sync</span><strong>Not connected</strong></li>
              <li><span>Capability tokens</span><strong>Not issued</strong></li>
            </ul>
            <Link className="cockpit-subtle-link" href="/commons">Read how the network works <ArrowRight aria-hidden="true" size={13} /></Link>
          </section>
        </aside>
      </div>
      <footer className="page-footer"><span>APT-LABS / WORKSPACE</span><span>Demand → Tender → Assembly → Roll · state is not a transaction</span></footer>
    </main>
  );
}
