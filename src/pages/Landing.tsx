import { Link } from 'wouter';

const MODULES = [
  { id: 'workbench', label: 'Workbench', hint: 'Coordinate work across five pilot lanes', href: '/workspace/workbench', hero: true },
  { id: 'commons', label: 'Commons', hint: 'Record needs, offers, and opportunities', href: '/workspace/commons' },
  { id: 'network', label: 'Network', hint: 'Connect people, crews, and institutions', href: '/workspace/network' },
  { id: 'records', label: 'Records', hint: 'Review history and delivery evidence', href: '/workspace/records' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Match capacity and plan next steps', href: '/workspace/intelligence' },
];

const ONTOLOGY = [
  { id: 'actors', label: 'Actors', detail: 'People and institutions.' },
  { id: 'resources', label: 'Resources', detail: 'Skills, assets, capital.' },
  { id: 'intentions', label: 'Intentions', detail: 'Needs and proposals.' },
  { id: 'commitments', label: 'Commitments', detail: 'Agreements and roles.' },
  { id: 'activity', label: 'Activity', detail: 'Work and exchange.' },
  { id: 'knowledge', label: 'Knowledge', detail: 'Evidence and lessons.' },
];

const PATH = [
  { num: '01', title: 'Need defined' },
  { num: '02', title: 'Work coordinated' },
  { num: '03', title: 'Delivery evidenced' },
  { num: '04', title: 'Record retained' },
];

export function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-wordmark">aptlabs5.1</div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <h1 id="landing-title">Coordinate local producers from request to delivery.</h1>
            <p className="landing-hero-lede">
              For schools and cooperatives: coordinate producers, keep delivery evidence.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-hero-primary" href="/sign-in?next=%2Fworkspace">Explore the local demo</Link>
              <Link className="landing-hero-quiet" href="/investor-memo">Read the investor memo</Link>
            </div>
          </div>

          <div className="landing-path-strip">
            <h2 className="landing-path-strip-heading">How work moves</h2>
            <ol className="landing-path-strip-lane">
              {PATH.map((stage) => (
                <li key={stage.num} className="landing-path-strip-stage">
                  <span className="landing-path-strip-num">{stage.num}</span>
                  <span className="landing-path-strip-title">{stage.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="landing-fabric">
          <div className="landing-fabric-inner">
            <div className="landing-fabric-head">
              <h2>The six structures</h2>
              <p className="landing-fabric-lede">
                People, resources, needs, commitments, work and evidence stay connected.
              </p>
            </div>
            <div className="landing-fabric-body">
              <div className="landing-fabric-structures">
                {ONTOLOGY.map((structure) => (
                  <div key={structure.id} className="landing-fabric-structure">
                    <h3>{structure.label}</h3>
                    <p>{structure.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-modules">
          <div className="landing-modules-inner">
            <div className="landing-modules-head">
              <h2>Explore the tools</h2>
              <p className="landing-modules-lede">
                Five connected tools for planning, coordinating and recording productive work.
              </p>
            </div>
            <div className="landing-modules-grid">
              {MODULES.map((m) => (
                <div key={m.id} className={`landing-module-cell${m.hero ? ' landing-module-cell--hero' : ''}`}>
                  <div className="landing-module-copy">
                    <h3>{m.label}</h3>
                    <p>{m.hint}</p>
                  </div>
                  <Link href={m.href}>Open {m.label}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>See the workflow.</h2>
            <p>Open the local demo to follow a request through delivery and evidence.</p>
            <div className="landing-cta-actions">
              <Link className="landing-cta-primary" href="/sign-in?next=%2Fworkspace">Explore the local demo</Link>
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
