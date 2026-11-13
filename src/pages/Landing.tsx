import { Link } from 'wouter';

const MODULES = [
  { id: 'commons', label: 'Commons', hint: 'Field signals and steward decisions', href: '/workspace/commons' },
  { id: 'network', label: 'Network', hint: 'People, crews, institutions, capabilities', href: '/workspace/network' },
  { id: 'workbench', label: 'Workbench', hint: 'Scope, assemble, coordinate work', href: '/workspace/workbench' },
  { id: 'records', label: 'Records', hint: 'Canon, annals, roll evidence ledger', href: '/workspace/records' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Matching, forecasting, analytics', href: '/workspace/intelligence' },
];

const ONTOLOGY = [
  { id: 'actors', label: 'Actors', kind: 'capability', detail: 'People, crews, institutions with persistent identity', accent: 'olive' },
  { id: 'resources', label: 'Resources', kind: 'evidence', detail: 'Skills, assets, capital, knowledge stewarded and operated', accent: 'sage' },
  { id: 'intentions', label: 'Intentions', kind: 'knowledge', detail: 'Proposed actions and recorded needs that initiate work', accent: 'clay' },
  { id: 'commitments', label: 'Commitments', kind: 'system', detail: 'Undertakings that bind actors to scope and acceptance', accent: 'brass' },
  { id: 'activity', label: 'Activity', kind: 'evidence', detail: 'Recorded outcomes, evidence, hash-anchored roll entries', accent: 'umber' },
  { id: 'knowledge', label: 'Knowledge', kind: 'system', detail: 'Findings, attestations, instruments institutions act on', accent: 'olive' },
];

const PATH = [
  { num: '01', title: 'Need recorded', detail: 'Buyer defines scope and criteria.', active: true },
  { num: '02', title: 'Work accepted', detail: 'Buyer reviews evidence and accepts.' },
  { num: '03', title: 'Payment released', detail: 'Payment releases on acceptance.' },
  { num: '04', title: 'Evidence anchored', detail: 'SHA-256 hash. Roll entry created.' },
];

export function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-wordmark">aptlabs</div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <h1>Productive capacity,<br className="landing-hero-break" />legible on its own terms.</h1>
            <p className="landing-hero-lede">
              Communities already hold knowledge, coordination, and memory. What is
              missing is legibility. APT-LABS makes people, crews, institutions,
              assets, skills, needs, opportunities, work, and evidence actionable —
              so real economic activity can be organised and repeatedly activated.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-hero-primary" href="/sign-in?next=%2Fworkspace">Enter the workspace</Link>
              <Link className="landing-hero-quiet" href="/investor-memo">Read the memo</Link>
            </div>
          </div>
          <div className="landing-hero-figure">
            <svg className="landing-mirror-curve" viewBox="0 0 600 520" preserveAspectRatio="none">
              <defs>
                <pattern id="mirror-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0 L0 0 0 40" fill="none" stroke="var(--line)" stroke-width="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="520" fill="url(#mirror-grid)" />
              <path
                d="M 60 300 Q 180 220 300 300 T 540 300"
                fill="none"
                stroke="var(--state-canon)"
                stroke-width="1.2"
                className="landing-mirror-path"
              />
              <circle cx="300" cy="300" r="6" fill="var(--state-canon)" />
              <circle cx="120" cy="300" r="4" fill="var(--muted)" />
              <circle cx="480" cy="300" r="4" fill="var(--muted)" />
              <path
                d="M 300 60 Q 380 180 300 300 T 300 540"
                fill="none"
                stroke="var(--clay)"
                stroke-width="1"
                opacity="0.5"
              />
              <circle cx="300" cy="120" r="3" fill="var(--clay)" opacity="0.6" />
              <circle cx="300" cy="480" r="3" fill="var(--clay)" opacity="0.6" />
            </svg>
          </div>
        </section>

        <section className="landing-path">
          <div className="landing-path-inner">
            <p className="landing-path-kicker">The buyer path</p>
            <div className="landing-path-line">One need. One acceptance. One payment.</div>
            <div className="landing-path-stage-lane">
              {PATH.map((s, i) => (
                <div key={s.num} className={`landing-path-stage${s.active ? ' is-active' : ''}`}>
                  <span className="landing-path-stage-num">{s.num}</span>
                  <div className="landing-path-stage-copy">
                    <span className="landing-path-stage-title">{s.title}</span>
                    <p className="landing-path-stage-detail">{s.detail}</p>
                  </div>
                  {i < PATH.length - 1 && <span className="landing-path-stage-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-ontology">
          <div className="landing-ontology-inner">
            <div className="landing-ontology-head">
              <p className="landing-ontology-kicker">Shared ontology</p>
              <h2>Six structures, six boundaries. One graph.</h2>
            </div>
            <div className="landing-ontology-field">
              <svg className="landing-ontology-svg" viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern id="offset-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 30 M 60 30 L 30 60" fill="none" stroke="var(--hairline)" stroke-width="0.4" />
                  </pattern>
                  <rect x="0" y="0" width="900" height="460" fill="url(#offset-grid)" />
                  <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* horizontal density strips */}
                <rect x="0" y="60" width="900" height="1" fill="var(--line)" opacity="0.3" />
                <rect x="0" y="160" width="900" height="1" fill="var(--line)" opacity="0.2" />
                <rect x="0" y="260" width="900" height="1" fill="var(--line)" opacity="0.3" />
                <rect x="0" y="360" width="900" height="1" fill="var(--line)" opacity="0.2" />
                {/* modular rectangles, alternating densities */}
                <rect x="120" y="90" width="260" height="60" fill="var(--bg-subtle)" />
                <rect x="520" y="190" width="220" height="50" fill="var(--bg-subtle)" opacity="0.6" />
                <rect x="60" y="290" width="180" height="70" fill="var(--bg-subtle)" opacity="0.4" />
                {/* central intersection loop */}
                <path d="M 450 140 Q 560 140 560 230 T 450 230 Q 340 230 340 140 Z" fill="none" stroke="var(--line-strong)" stroke-width="0.8" opacity="0.5" />
                <path d="M 450 230 Q 560 230 560 320 T 450 320 Q 340 320 340 230 Z" fill="none" stroke="var(--line-strong)" stroke-width="0.8" opacity="0.4" />
                {/* node points with intersections */}
                <circle cx="220" cy="150" r="5" fill="var(--olive)" className="ontology-node" />
                <circle cx="450" cy="140" r="4" fill="var(--clay)" className="ontology-node" />
                <circle cx="680" cy="220" r="5" fill="var(--sage)" className="ontology-node" />
                <circle cx="450" cy="230" r="6" fill="var(--brass)" className="ontology-node ontology-node--hub" />
                <circle cx="220" cy="320" r="4" fill="var(--umber)" className="ontology-node" />
                <circle cx="780" cy="340" r="5" fill="var(--ink)" className="ontology-node" />
                {/* connecting paths */}
                <path d="M 220 150 Q 340 140 450 140" fill="none" stroke="var(--line)" stroke-width="0.7" />
                <path d="M 450 140 Q 560 180 680 220" fill="none" stroke="var(--line)" stroke-width="0.7" />
                <path d="M 680 220 Q 560 260 450 230" fill="none" stroke="var(--line)" stroke-width="0.7" />
                <path d="M 450 230 Q 340 270 220 320" fill="none" stroke="var(--line)" stroke-width="0.7" />
                <path d="M 220 320 Q 340 360 450 320" fill="none" stroke="var(--line)" stroke-width="0.7" />
                <path d="M 450 320 Q 560 340 780 340" fill="none" stroke="var(--line)" stroke-width="0.7" />
              </svg>
            </div>
            <div className="landing-ontology-list">
              {ONTOLOGY.map((o) => (
                <div key={o.id} className={`landing-ontology-item accent-${o.accent}`}>
                  <div className="landing-ontology-item-head">
                    <span className="landing-ontology-item-kind">{o.kind}</span>
                    <span className="landing-ontology-item-dot" />
                  </div>
                  <h3>{o.label}</h3>
                  <p>{o.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-modules">
          <div className="landing-modules-inner">
            <div className="landing-modules-grid">
              {MODULES.map((m) => (
                <div key={m.id} className="landing-module-cell">
                  <div className="landing-module-cell-dot" aria-hidden="true" />
                  <h3>{m.label}</h3>
                  <p>{m.hint}</p>
                  <Link href={m.href}>Open</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>Iko Live</h2>
            <p>APT-LABS is infrastructure for making fragmented productive capacity visible,
            connectable, and governable. Deploy it where it matters.</p>
            <div className="landing-cta-actions">
              <Link className="landing-cta-primary" href="/investor-memo">Partner with us</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-footer-brand">aptlabs</span>
        <p>Browser-local. No live institutional, payment, telemetry, or credential connections.</p>
      </footer>
    </div>
  );
}
