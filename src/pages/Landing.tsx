import { Link } from 'wouter';
import { BrandMark } from '../components/BrandMark';

const MODULES = [
  { id: 'commons', label: 'Commons', hint: 'Field signals and steward decisions', href: '/workspace/commons' },
  { id: 'network', label: 'Network', hint: 'People, crews, institutions, capabilities', href: '/workspace/network' },
  { id: 'workbench', label: 'Workbench', hint: 'Scope, assemble, coordinate work', href: '/workspace/workbench' },
  { id: 'records', label: 'Records', hint: 'Canon, annals, roll evidence ledger', href: '/workspace/records' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Matching, forecasting, analytics', href: '/workspace/intelligence' },
];

const STRUCTURES = [
  { id: 'actors', label: 'Actors', detail: 'People, crews, institutions with persistent identity', accent: 'olive' },
  { id: 'resources', label: 'Resources', detail: 'Skills, assets, capital, knowledge stewarded and operated', accent: 'sage' },
  { id: 'intentions', label: 'Intentions', detail: 'Proposed actions and recorded needs that initiate work', accent: 'clay' },
  { id: 'commitments', label: 'Commitments', detail: 'Undertakings that bind actors to scope and acceptance', accent: 'brass' },
  { id: 'activity', label: 'Activity', detail: 'Recorded outcomes, evidence, hash-anchored roll entries', accent: 'umber' },
  { id: 'knowledge', label: 'Knowledge', detail: 'Findings, attestations, instruments institutions act on', accent: 'olive' },
];

const CYCLE = [
  { num: '01', title: 'Intake', detail: 'Receive and structure demand' },
  { num: '02', title: 'Diagnose', detail: 'Understand the actual problem' },
  { num: '03', title: 'Compose', detail: 'Design the solution and resources' },
  { num: '04', title: 'Authorise', detail: 'Establish authority and commitments' },
  { num: '05', title: 'Produce', detail: 'Coordinate and execute work' },
  { num: '06', title: 'Inspect', detail: 'Test against defined requirements' },
  { num: '07', title: 'Settle', detail: 'Resolve obligations and exchange' },
  { num: '08', title: 'Learn', detail: 'Preserve evidence and improve' },
];

const WORKORDER = [
  { num: '01', title: 'Need recorded', detail: 'Buyer defines scope and criteria.', active: true },
  { num: '02', title: 'Work accepted', detail: 'Buyer reviews evidence and accepts.' },
  { num: '03', title: 'Payment released', detail: 'Payment releases on acceptance.' },
  { num: '04', title: 'Evidence anchored', detail: 'SHA-256 hash. Roll entry created.' },
];

export function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <BrandMark size="md" href="/" />
        <nav className="landing-nav" aria-label="Primary">
          <Link href="#cycle">The path</Link>
          <Link href="#structures">Structures</Link>
          <Link href="#modules">Boundaries</Link>
          <Link className="landing-nav-cta" href="/sign-in?next=%2Fworkspace">Enter the workspace</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-hero-kicker">APT-LABS · WORKSPACE</p>
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
            <div className="landing-hero-grid" />
          </div>
        </section>

        <section className="landing-path" id="cycle">
          <div className="landing-path-inner">
            <p className="landing-path-kicker">The buyer path</p>
            <h2>One need. One acceptance. One payment.</h2>
            <div className="landing-path-stage-lane">
              {WORKORDER.map((s, i) => (
                <div key={s.num} className={`landing-path-stage${s.active ? ' is-active' : ''}`}>
                  <span className="landing-path-stage-num">{s.num}</span>
                  <div className="landing-path-stage-copy">
                    <span className="landing-path-stage-title">{s.title}</span>
                    <p className="landing-path-stage-detail">{s.detail}</p>
                  </div>
                  {i < WORKORDER.length - 1 && <span className="landing-path-stage-connector" />}
                </div>
              ))}
            </div>
            <p className="landing-path-note">Browser-local demo. Kibera Makerspace work order.</p>
          </div>
        </section>

        <section className="landing-cycle">
          <div className="landing-cycle-inner">
            <div className="landing-cycle-head">
              <p className="landing-cycle-kicker">Production grammar</p>
              <h2>Eight stages. Every cycle.</h2>
            </div>
            <div className="landing-cycle-ring">
              {CYCLE.map((s) => (
                <div key={s.num} className="landing-cycle-stage">
                  <div className="landing-cycle-stage-marker"><span>{s.num}</span></div>
                  <div className="landing-cycle-stage-copy">
                    <span className="landing-cycle-stage-title">{s.title}</span>
                    <p className="landing-cycle-stage-detail">{s.detail}</p>
                  </div>
                </div>
              ))}
              <div className="landing-cycle-center">
                <span className="landing-cycle-center-dot" />
                <span className="landing-cycle-center-label">The cycle repeats</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-structures" id="structures">
          <div className="landing-structures-inner">
            <div className="landing-structures-head">
              <p className="landing-structures-kicker">Shared ontology</p>
              <h2>Six structures, six boundaries. One graph.</h2>
            </div>
            <div className="landing-structures-ribbon">
              {STRUCTURES.map((s, i) => (
                <div key={s.id} className={`landing-structure-card accent-${s.accent}`}>
                  <p className="landing-structure-card-num">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{s.label}</h3>
                  <p>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-modules" id="modules">
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
            <h2>Build the productive network.</h2>
            <p>APT-LABS is infrastructure for making fragmented productive capacity visible,
            connectable, and governable. Deploy it where it matters.</p>
            <div className="landing-cta-actions">
              <Link className="landing-cta-primary" href="/investor-memo">Partner with us</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-footer-brand">APT-LABS</span>
        <p>Browser-local. No live institutional, payment, telemetry, or credential connections.</p>
      </footer>
    </div>
  );
}
