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
  { id: 'actors', label: 'Actors', detail: 'People, crews, enterprises, institutions with persistent identity', accent: 'olive' },
  { id: 'resources', label: 'Resources', detail: 'Skills, assets, capital, knowledge that actors steward or operate', accent: 'sage' },
  { id: 'intentions', label: 'Intentions', detail: 'Proposed actions and recorded needs that initiate work', accent: 'clay' },
  { id: 'commitments', label: 'Commitments', detail: 'Undertakings and packages that bind actors to scope and acceptance', accent: 'brass' },
  { id: 'activity', label: 'Activity', detail: 'Recorded outcomes, evidence, and hash-anchored roll entries', accent: 'umber' },
  { id: 'knowledge', label: 'Knowledge', detail: 'Findings, attestations, and instruments institutions can act on', accent: 'olive' },
];

const FACTORY_STAGES = [
  { num: '01', title: 'Intake', detail: 'Receive and structure demand' },
  { num: '02', title: 'Diagnose', detail: 'Understand the actual problem' },
  { num: '03', title: 'Compose', detail: 'Design the solution and resources' },
  { num: '04', title: 'Authorise', detail: 'Establish authority and commitments' },
  { num: '05', title: 'Produce', detail: 'Coordinate and execute work' },
  { num: '06', title: 'Inspect', detail: 'Test against defined requirements' },
  { num: '07', title: 'Settle', detail: 'Resolve obligations and exchange' },
  { num: '08', title: 'Learn', detail: 'Preserve evidence and improve' },
];

const DEMO_WORKORDER = {
  title: 'Kibera workshop bench set',
  meta: [
    ['Institution', 'Kibera Makerspace'],
    ['Work kind', 'Physical-asset'],
    ['Build cost', 'KES 85,000'],
    ['Annual yield', 'KES 120,000'],
    ['Local spend', '78%'],
  ],
  total: ['Net contribution', 'KES 35,000'],
  stages: [
    { num: '01', title: 'Need recorded', detail: 'Buyer defines scope and criteria. Workshop bench set, four tops, two cabinets.', active: true },
    { num: '02', title: 'Work accepted', detail: 'Buyer reviews evidence — photos, receipts, crew sign-off — and accepts.' },
    { num: '03', title: 'Payment released', detail: 'Payment releases on acceptance. 90% to local crew, 10% coordination fee.' },
    { num: '04', title: 'Evidence anchored', detail: 'SHA-256 hash of canonical record. Roll entry created. SBT attestations minted.' },
  ],
};

export function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <BrandMark size="md" href="/" />
        <nav className="landing-nav" aria-label="Primary">
          <Link href="#model">The model</Link>
          <Link href="#structures">Structures</Link>
          <Link href="#modules">Modules</Link>
          <Link href="/investor-memo">Memo</Link>
          <Link className="landing-nav-cta" href="/sign-in?next=%2Fworkspace">Start working</Link>
        </nav>
      </header>

      <main>
        {/* 1: Hero — Operating Floor */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-hero-kicker">APT-LABS · WORKSPACE</p>
            <h1>Productive capacity,<br className="landing-hero-break" />legible on its own terms.</h1>
            <p className="landing-hero-lede">
              African communities already hold practical knowledge, informal coordination,
              and institutional memory. What is missing is legibility — the ability to
              discover, verify, connect, and build upon it. APT-LABS makes the
              relationships between people, crews, institutions, assets, skills, needs,
              opportunities, work, and evidence actionable so real economic activity can
              be organised and repeatedly activated.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-hero-primary" href="/sign-in?next=%2Fworkspace">
                Enter the workspace
              </Link>
              <Link className="landing-hero-quiet" href="/investor-memo">Read the memo</Link>
            </div>
          </div>
          <div className="landing-hero-figure">
            <div className="landing-hero-rule" />
          </div>
        </section>

        {/* 2: Live Demo Strip */}
        <section className="landing-demo-strip" id="model">
          <div className="landing-demo-inner">
            <div className="landing-demo-copy">
              <p className="landing-demo-kicker">The buyer path</p>
              <h2>One need. One acceptance. One payment.</h2>
              <p className="landing-demo-lede">
                A work order from Kibera Makerspace, rendered live in your browser.
                Click through the stages — no server, no live transactions.
              </p>
            </div>
            <div className="landing-workorder">
              <div className="landing-workorder-meta">
                <p className="landing-workorder-meta-label">Work order</p>
                <h3>{DEMO_WORKORDER.title}</h3>
                <dl>
                  {DEMO_WORKORDER.meta.map(([dt, dd]) => (
                    <div key={dt} className="landing-workorder-row">
                      <dt>{dt}</dt>
                      <dd>{dd}</dd>
                    </div>
                  ))}
                  <div className="landing-workorder-row landing-workorder-total">
                    <dt>{DEMO_WORKORDER.total[0]}</dt>
                    <dd>{DEMO_WORKORDER.total[1]}</dd>
                  </div>
                </dl>
              </div>
              <div className="landing-workorder-stages">
                {DEMO_WORKORDER.stages.map((s) => (
                  <div key={s.num} className={`landing-workorder-stage${s.active ? ' active' : ''}`}>
                    <p className="landing-workorder-stage-num">{s.num}</p>
                    <h4>{s.title}</h4>
                    <p className="landing-workorder-stage-detail">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="landing-demo-note">
            Browser-local demo. No live institutional, payment, telemetry, or credential connections.
          </p>
        </section>

        {/* 3: Factory Grammar */}
        <section className="landing-factory" id="factory">
          <div className="landing-factory-inner">
            <div className="landing-factory-head">
              <p className="landing-factory-kicker">Production grammar</p>
              <h2>Eight stages. Every cycle.</h2>
              <p className="landing-factory-lede">
                Not every stage runs in every cycle. The grammar names what each stage
                does when it runs — across physical, digital, creative, institutional,
                and service production.
              </p>
            </div>
            <div className="landing-factory-timeline">
              {FACTORY_STAGES.map((s) => (
                <div key={s.num} className="landing-factory-stage">
                  <div className="landing-factory-stage-marker">
                    <span>{s.num}</span>
                  </div>
                  <div className="landing-factory-stage-copy">
                    <h3>{s.title}</h3>
                    <p>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4: Six Structures */}
        <section className="landing-structures" id="structures">
          <div className="landing-structures-inner">
            <div className="landing-structures-head">
              <p className="landing-structures-kicker">Shared ontology</p>
              <h2>Six structures. None stands alone.</h2>
              <p className="landing-structures-lede">
                Every product, sector, and workflow in APT-LABS expresses the same six
                underlying structures. They overlap and interpenetrate; none is forced
                into a single rigid role.
              </p>
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

        {/* 5: Six Modules */}
        <section className="landing-modules" id="modules">
          <div className="landing-modules-inner">
            <div className="landing-modules-head">
              <p className="landing-modules-kicker">One shared graph</p>
              <h2>Six boundaries. One system.</h2>
              <p className="landing-modules-lede">
                Each module has one job. They share one underlying graph — actors,
                resources, intentions, commitments, activity, knowledge — so work done
                in one becomes evidence in another.
              </p>
            </div>
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

        {/* 6: CTA */}
        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>This is a working model.</h2>
            <p>Three seeded scenarios. Browser-local. No signup to explore.</p>
            <div className="landing-cta-actions">
              <Link className="landing-cta-primary" href="/sign-in?next=%2Fworkspace">Enter the workspace</Link>
              <Link className="landing-cta-secondary" href="/investor-memo">Read the memo</Link>
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
