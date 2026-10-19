import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Orbit } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

export default function HomePage() {
  return (
    <main className="site-shell frontdoor-shell">
      <SiteHeader frontDoor />
      <section className="frontdoor-hero">
        <div className="frontdoor-copy">
          <p className="eyebrow frontdoor-kicker"><span className="signal-dot" /> APT-LABS / SOVEREIGN COORDINATION ENGINE</p>
          <h1>Make good work<br /><em>find its people.</em></h1>
          <p className="frontdoor-lede">A practical network for people who build what their communities need.</p>
          <p className="frontdoor-body">APT-LABS brings local knowledge, capable hands, and committed capital into the same place—so ideas can move from intention to work in the world.</p>
          <div className="frontdoor-actions">
            <Link className="button button-primary" href="/sign-in?next=%2Fworkspace">Enter the studio <ArrowRight aria-hidden="true" size={15} /></Link>
          </div>
          <div className="frontdoor-coordinate"><span>BUILT FOR REAL-WORLD EXECUTION</span><span>PROTOTYPE · 001</span></div>
        </div>
        <div className="frontdoor-orbit" aria-label="APT-LABS: people, capability and capital working together">
          <div className="frontdoor-orbit-coordinate">FIELD STATION / 00° 00′</div>
          <div className="frontdoor-orbit-graphic" aria-hidden="true">
            <span className="frontdoor-orbit-ring frontdoor-orbit-ring-outer" />
            <span className="frontdoor-orbit-ring frontdoor-orbit-ring-inner" />
            <span className="frontdoor-orbit-cross frontdoor-orbit-cross-x" />
            <span className="frontdoor-orbit-cross frontdoor-orbit-cross-y" />
            <span className="frontdoor-orbit-core"><Orbit size={28} strokeWidth={1.2} /><b>APT</b></span>
            <span className="frontdoor-orbit-point frontdoor-orbit-point-one" />
            <span className="frontdoor-orbit-point frontdoor-orbit-point-two" />
            <span className="frontdoor-orbit-point frontdoor-orbit-point-three" />
          </div>
          <div className="frontdoor-orbit-label frontdoor-orbit-label-one"><span>01 / PEOPLE</span><strong>Skill in motion</strong></div>
          <div className="frontdoor-orbit-label frontdoor-orbit-label-two"><span>02 / CAPITAL</span><strong>Purposeful backing</strong></div>
          <div className="frontdoor-orbit-label frontdoor-orbit-label-three"><span>03 / EVIDENCE</span><strong>Work that stands</strong></div>
          <div className="frontdoor-orbit-stamp">A NETWORK<br />BUILT TO DO</div>
          <div className="frontdoor-orbit-caption">COORDINATION IS INFRASTRUCTURE</div>
        </div>
      </section>

      <section className="frontdoor-principle" aria-labelledby="frontdoor-principle-title">
        <p className="eyebrow">THE OPERATING BELIEF / 001</p>
        <h2 id="frontdoor-principle-title">Coordination is not overhead.<br /><em>It is how the future gets built.</em></h2>
        <p>When capable people can find one another, earn trust through real work, and reach the resources to act, communities gain more than a project. They gain the confidence to build the next one.</p>
      </section>

      <footer className="site-footer frontdoor-footer">
        <Link className="wordmark footer-wordmark" href="/"><span aria-hidden="true" className="wordmark-symbol">A</span><span>APT<span className="wordmark-dash">—</span>LABS</span></Link>
        <p>For the people, by the people—built with care.</p>
        <Link className="text-link" href="/sign-in?next=%2Fworkspace">Enter the studio <ArrowUpRight aria-hidden="true" size={14} /></Link>
      </footer>
    </main>
  );
}
