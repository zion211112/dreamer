import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, CalendarDays, HardHat, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { getPublicRollProfile } from '@/lib/roll-profile';

function dateLabel(value: string | null): string {
  if (!value) return 'No deployment recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

export default async function RollProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ userId }, { mode }] = await Promise.all([params, searchParams]);
  const guest = false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) notFound();
  const result = await getPublicRollProfile(userId);
  if (result.error) throw new Error(result.error);
  if (!result.profile) notFound();

  const { profile, badges } = result;
  return (
    <main className="site-shell roll-profile-shell">
      <SiteHeader />
      <div className="opportunities-back"><Link href={guest ? '/roll?mode=guest' : '/roll'}><ArrowLeft aria-hidden="true" size={14} /> The Roll</Link><span>PUBLIC CAPABILITY PROFILE</span></div>
      <header className="roll-profile-head">
        <div className="roll-profile-mark"><HardHat aria-hidden="true" size={25} /><span>ROLL / BUILDER</span></div>
        <div><p className="eyebrow">CONSENTED PUBLIC PROFILE</p><h1>{profile.display_name}</h1><p>Capability is recorded from verified deployment—not self-reported credentials.</p></div>
        <span className="roll-rank-stamp">{profile.derived_rank}</span>
      </header>
      <section className="roll-profile-stats" aria-label="Derived Roll statistics">
        <div><span>DEPLOYED ASSETS</span><strong>{profile.deployed_asset_count}</strong></div>
        <div><span>CAPABILITY BADGES</span><strong>{profile.capability_badge_count}</strong></div>
        <div><span>LAST VERIFIED BUILD</span><strong><CalendarDays aria-hidden="true" size={15} />{dateLabel(profile.last_verified_build_at)}</strong></div>
      </section>
      <section className="roll-profile-ledger">
        <div className="section-heading"><div><p className="eyebrow">APPEND-ONLY / DEPLOYMENT PROOF</p><h2>Work that made it into the world.</h2></div><ShieldCheck aria-hidden="true" size={19} /></div>
        {!badges.length ? <div className="ledger-empty-state"><BadgeCheck aria-hidden="true" size={19} /><h3>No badge yet.</h3><p>New builders are welcome in the network. A Capability Badge appears only after an assigned, non-illustrative Asset is deployed.</p><Link className="text-link" href={guest ? '/commons/opportunities?mode=guest' : '/commons/opportunities'}>Find a role <ArrowLeft aria-hidden="true" size={13} /></Link></div> : (
          <div className="roll-profile-badges">
            {badges.map(badge => <article className="roll-profile-badge" key={badge.id}>
              <div><p className="eyebrow">CAPABILITY BADGE / {badge.role.toUpperCase()}</p><h3><Link href={`/tenders/${badge.asset_slug}${guest ? '?mode=guest' : ''}`}>{badge.asset_name}</Link></h3><span>Anchor-verified deployment · {dateLabel(badge.issued_at)}</span></div>
              <code>BLUEPRINT {badge.blueprint_hash.slice(0, 20)}…</code>
            </article>)}
          </div>
        )}
        <p className="fine-print">Historical badges do not decay. Rank is derived from verified deployments; recency is shown separately and is not a yield, governance, or transfer right.</p>
      </section>
      <footer className="page-footer"><span>APT-LABS / ROLL PROFILE</span><span>Proof in the record, not the pitch.</span></footer>
    </main>
  );
}
