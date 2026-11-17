import {
  type DesignSystem,
  type Page,
  type SlideMeta,
} from '@open-slide/core';
import type { ReactNode } from 'react';
import './styles.css';

export const design: DesignSystem = {
  palette: { bg: '#F4F1E9', text: '#292B25', accent: '#344438' },
  fonts: {
    display: 'Georgia, "Times New Roman", serif',
    body: 'system-ui, -apple-system, "Segoe UI Variable", sans-serif',
  },
  typeScale: { hero: 132, body: 72 },
  radius: 0,
};

type SlideProps = {
  number: string;
  section: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
  total?: string;
};

function Slide({ number, section, title, children, dark = false, total = '05' }: SlideProps) {
  return (
    <section className={`pitch-slide${dark ? ' pitch-slide--dark' : ''}`} aria-labelledby={`slide-title-${number}`}>
      <header className="pitch-topline">
        <span>APT-LABS <i>/</i> INVESTOR DECK</span>
        <span>{section}</span>
      </header>
      <h1 className="pitch-title" id={`slide-title-${number}`}>{title}</h1>
      <div className="pitch-content">{children}</div>
      <footer className="pitch-footer">
        <span>STRUCTURAL EMERGENCE</span>
        <span>{number} <i>/</i> {total}</span>
      </footer>
    </section>
  );
}

function Vision() {
  return (
    <Slide number="01" section="VISION" title="From Kongo to Mt. Zion." dark>
      <div className="vision-layout">
        <p className="pitch-lede">APT-LABS helps institutions and local producers coordinate work from need to evidence.</p>
        <p className="pitch-muted">A shared operating record keeps people, resources, commitments, delivery, and lessons connected.</p>
      </div>
      <p className="pitch-kicker">A coordination layer, not a contractor, school, or funding vehicle.</p>
    </Slide>
  );
}

function MtoWorks() {
  return (
    <Slide number="02" section="GROUND PROOF / MTO WORKS" title="One river. One workforce. One proof of direction.">
      <div className="proof-frame proof-frame--mto">
        <img src="/investor-memo/mto-works.png" alt="MTO WORKS — grounded proof of direction" />
      </div>
      <p className="pitch-note">This is a proposed work context, not a completed or validated facility. Authority, feasibility, delivery, and benefit still need evidence.</p>
    </Slide>
  );
}

function SovereignFuture() {
  return (
    <Slide number="03" section="SOVEREIGN FUTURE" title="People own the systems that shape their lives.">
      <div className="proof-frame proof-frame--future">
        <img src="/investor-memo/sovereign-future.png" alt="African sovereign future — people owning their systems" />
      </div>
      <p className="pitch-note">Not just factories and industries. A future where the record of work, knowledge, and coordination stays local and reusable.</p>
    </Slide>
  );
}

function MissingLayer() {
  return (
    <Slide number="04" section="THE PROBLEM" title="Capacity is distributed. Coordination is fragmented.">
      <p className="pitch-lede">Needs, skills, assets, agreements, and evidence live in different places across Africa.</p>
      <p className="pitch-muted">APT-LABS is the missing coordination layer: one shared record that connects them without replacing local decision-making.</p>
      <div className="fragment-map" aria-label="Needs, people, resources, agreements, and evidence are disconnected">
        {['NEEDS', 'PEOPLE', 'RESOURCES', 'AGREEMENTS', 'EVIDENCE'].map((item, index) => (
          <div className={`fragment fragment--${index + 1}`} key={item}>
            <span>0{index + 1}</span><strong>{item}</strong>
          </div>
        ))}
        <div className="fragment-map__center">HARD TO<br />CONNECT<br />AND REUSE</div>
      </div>
    </Slide>
  );
}

function Entry() {
  const proof = [
    ['WEDGE', 'Institutional workflows where local capacity is hard to coordinate.'],
    ['GATE', 'Buyer authority · delivery acceptance · payment timing — each is an open test.'],
    ['SCALE', 'A Kirinyaga beachhead, then reuse of the coordination record across regions and workflows.'],
  ];
  return (
    <Slide number="05" section="ENTRY POINT" title="Start where the work is.">
      <div className="entry-grid">
        {proof.map(([label, text]) => (
          <article key={label}>
            <span>{label}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <p className="pitch-statement">No inflated market numbers. No invented traction. Earn the right to scale through real workflows.</p>
      <p className="pitch-note">The next conversation tests the thesis, the first workflow, and the proof gates — not unverified projections.</p>
    </Slide>
  );
}

export const meta: SlideMeta = { title: 'APT-LABS Investor Deck' };

export default [
  Vision,
  MtoWorks,
  SovereignFuture,
  MissingLayer,
  Entry,
] satisfies Page[];
