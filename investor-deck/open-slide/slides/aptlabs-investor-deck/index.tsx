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
  typeScale: { hero: 152, body: 72 },
  radius: 0,
};

type SlideProps = {
  number: string;
  section: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
};

function Slide({ number, section, title, children, dark = false }: SlideProps) {
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
        <span>{number} <i>/</i> 09</span>
      </footer>
    </section>
  );
}

function Thesis() {
  return (
    <Slide number="01" section="THESIS" title="Make productive capacity visible. Make work cumulative." dark>
      <div className="thesis-layout">
        <div>
          <p className="pitch-lede">APT-LABS is designed to help institutions and local producers coordinate work from need to evidence.</p>
          <p className="pitch-muted">A shared operating record connects people, resources, commitments, delivery, and what is learned.</p>
        </div>
        <div className="field-record" aria-label="Illustrative coordination record: need, capacity, commitment, work, evidence">
          <div className="field-record__label">ILLUSTRATIVE WORK RECORD <span>NOT A LIVE TRANSACTION</span></div>
          <ol>
            <li><b>01</b><span>Need defined</span><em>intention</em></li>
            <li><b>02</b><span>Capacity assembled</span><em>actors + resources</em></li>
            <li><b>03</b><span>Work coordinated</span><em>commitments</em></li>
            <li><b>04</b><span>Evidence retained</span><em>knowledge</em></li>
          </ol>
        </div>
      </div>
      <p className="pitch-kicker">A coordination system, not a contractor, school, or funding vehicle.</p>
    </Slide>
  );
}

function Problem() {
  return (
    <Slide number="02" section="THE PROBLEM" title="Capacity is distributed. Coordination is fragmented.">
      <p className="pitch-lede">Needs, skills, assets, agreements, and evidence often live in different places.</p>
      <div className="fragment-map" aria-label="Needs, people, resources, and records are disconnected across systems">
        {['NEEDS', 'PEOPLE', 'RESOURCES', 'AGREEMENTS', 'EVIDENCE'].map((item, index) => (
          <div className={`fragment fragment--${index + 1}`} key={item}>
            <span>0{index + 1}</span><strong>{item}</strong>
          </div>
        ))}
        <div className="fragment-map__center">HARD TO<br />CONNECT<br />AND REUSE</div>
      </div>
      <p className="pitch-note">This is the company thesis to validate—not a quantified market study or customer-research result.</p>
    </Slide>
  );
}

function ProductLoop() {
  const modules = [
    ['Commons', 'Discover needs and opportunities'],
    ['Network', 'Map people and capabilities'],
    ['Workbench', 'Scope and coordinate work'],
    ['Records', 'Preserve decisions and evidence'],
    ['Intelligence', 'Support matching and planning'],
  ];
  return (
    <Slide number="03" section="THE PRODUCT" title="One human-led loop. Five connected jobs.">
      <div className="module-loop">
        {modules.map(([name, description], index) => (
          <article className="module-loop__item" key={name}>
            <span>0{index + 1}</span><h2>{name}</h2><p>{description}</p>
          </article>
        ))}
      </div>
      <p className="pitch-note">Software can organize and suggest; institutions and people retain decision authority. The current product is a browser-local demo, not a live deployment.</p>
    </Slide>
  );
}

function MtoWorks() {
  return (
    <Slide number="04" section="CASE CONTEXT / MTO WORKS" title="A river-to-work pathway, carefully bounded.">
      <div className="river-record">
        <svg viewBox="0 0 1000 300" role="img" aria-labelledby="river-title river-desc">
          <title id="river-title">Illustrative river and work pathway</title>
          <desc id="river-desc">A proposed sequence from local need through site review, engineering, delivery, and evidence.</desc>
          <path d="M25 214 C150 82 245 274 367 160 S575 85 698 176 S855 274 975 108" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="12 14" />
          {[['Need', 70, 190], ['Site review', 290, 193], ['Engineering', 500, 101], ['Delivery', 724, 171], ['Evidence', 920, 134]].map(([label, x, y]) => (
            <g key={label as string} transform={`translate(${x} ${y})`}>
              <circle r="13" fill="#AD8B55" />
              <text y="42" textAnchor="middle">{label}</text>
            </g>
          ))}
        </svg>
        <p className="pitch-lede">A proposed hydro context—not a completed or validated infrastructure project.</p>
      </div>
      <p className="pitch-note">Project identity, stage, site permissions, hydrology, engineering, safety, cost, maintenance, and community outcomes are unverified.</p>
    </Slide>
  );
}

function Kemetos() {
  return (
    <Slide number="05" section="CASE CONTEXT / KEMETOS" title="Treat the learning environment as a testable design hypothesis.">
      <div className="school-study">
        <div className="floor-pattern" role="img" aria-label="Abstract patterned-floor concept diagram">
          {Array.from({ length: 28 }, (_, index) => <span key={index} />)}
        </div>
        <div className="school-study__copy">
          <p className="pitch-lede">Patterned flooring and spatial cues could be explored for arrival, movement, or transitions.</p>
          <p>This is not evidence of improved cognition or learning.</p>
          <p className="pitch-note">Co-design locally. Check accessibility, sensory load, slip resistance, and maintenance. Measure observable use before considering causal claims.</p>
        </div>
      </div>
    </Slide>
  );
}

function CaseLimits() {
  return (
    <Slide number="06" section="WHAT THE CASES PROVE" title="A shared coordination grammar. Not proof of outcomes.">
      <div className="case-compare">
        <article><span>RIVER / MTO WORKS</span><h2>Proposed work context</h2><p>Authority, feasibility, delivery, and benefit still need evidence.</p></article>
        <article><span>LEARNING SPACE / KEMETOS</span><h2>Design hypothesis</h2><p>Local co-design and evaluation must precede stronger claims.</p></article>
      </div>
      <p className="pitch-statement">Neither case establishes product-market fit, revenue, repeat use, hydro feasibility, or learning effects.</p>
    </Slide>
  );
}

function BusinessModel() {
  return (
    <Slide number="07" section="BUSINESS MODEL" title="Earn the right to scale through real workflows.">
      <div className="model-record">
        <div className="model-record__number">3–5%</div>
        <div>
          <p className="pitch-lede">Illustrative procurement-routing fee model.</p>
          <p>Product direction only—not current pricing, booked revenue, or a validated take rate.</p>
        </div>
      </div>
      <div className="proof-row">
        <span>FIRST WEDGE</span><strong>Institutional workflows where local capacity is hard to coordinate.</strong>
        <span>TO VALIDATE</span><strong>Buyer authority · willingness to pay · accepted delivery · payment timing.</strong>
      </div>
      <p className="pitch-note">No insurance, financing, or data-licensing product is presented as live.</p>
    </Slide>
  );
}

function ProofGates() {
  const gates = [
    ['Buyer', 'Who can authorize the work, and will they pay?'],
    ['Delivery', 'Can a local team meet scope and acceptance criteria?'],
    ['Cashflow', 'Can payment timing work for buyers and providers?'],
    ['Governance', 'Who maintains assets and resolves disputes?'],
    ['Evidence', 'What permissions, privacy, and outcome measures apply?'],
    ['Feasibility', 'What site-specific engineering and learning tests are needed?'],
  ];
  return (
    <Slide number="08" section="PROOF GATES" title="Evidence before scale.">
      <div className="gate-list">
        {gates.map(([label, question], index) => (
          <article key={label}><span>0{index + 1}</span><h2>{label}</h2><p>{question}</p><b>OPEN TEST</b></article>
        ))}
      </div>
      <p className="pitch-note">Each result should change the plan; none is represented here as already achieved.</p>
    </Slide>
  );
}

function Ask() {
  return (
    <Slide number="09" section="THE CONVERSATION" title="Discuss the investment.">
      <div className="ask-layout">
        <div>
          <p className="pitch-lede">APT-LABS is building a way for institutions and local producers to coordinate work and preserve evidence.</p>
          <p className="pitch-muted">The next conversation should test the thesis, the first workflow, and the proof gates—not rely on unverified projections.</p>
        </div>
        <a className="investment-cta" href="https://wa.me/254704260906?text=Hello%20APT-LABS%2C%20I%27d%20like%20to%20discuss%20the%20investment."
          target="_blank" rel="noopener noreferrer">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </div>
      <p className="pitch-note">No raise amount or terms are published. This page is for discussion, not an offer or solicitation.</p>
    </Slide>
  );
}

export const meta: SlideMeta = { title: 'APT-LABS Investor Deck' };

export default [
  Thesis,
  Problem,
  ProductLoop,
  MtoWorks,
  Kemetos,
  CaseLimits,
  BusinessModel,
  ProofGates,
  Ask,
] satisfies Page[];
