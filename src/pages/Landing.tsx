import { Link } from 'wouter';
import { BrandMark } from '../components/BrandMark';
import { OperatingMap } from '../components/landing/OperatingMap';

const MODULES = [
  { id: 'commons', label: 'Commons', hint: 'Field signals and steward decisions', href: '/workspace/commons' },
  { id: 'network', label: 'Network', hint: 'People, crews, assets, institutions and their relationships', href: '/workspace/network' },
  { id: 'workbench', label: 'Workbench', hint: 'Opportunities, applications, delivery and simulation', href: '/workspace/workbench' },
  { id: 'records', label: 'Records', hint: 'Canon, annals and the roll evidence ledger', href: '/workspace/records' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Research, assessment, attestations', href: '/workspace/intelligence' },
];

const STRUCTURES = [
  { id: 'actors', label: 'Actors', detail: 'People, crews, coordinators and institutions with persistent identity.' },
  { id: 'resources', label: 'Resources', detail: 'Assets, work and capabilities that actors steward or operate.' },
  { id: 'intentions', label: 'Intentions', detail: 'Proposed actions and recorded needs that initiate work.' },
  { id: 'commitments', label: 'Commitments', detail: 'Undertakings and packages that bind actors to scope and acceptance.' },
  { id: 'activity', label: 'Activity', detail: 'Recorded outcomes, evidence and hash-anchored roll entries.' },
  { id: 'knowledge', label: 'Knowledge', detail: 'Findings, attestations and instruments that institutions can act on.' },
];

const UBUNTU_GEOMETRY = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="120" cy="120" r="100" stroke="#b89a72" stroke-width="1" />
    <circle cx="120" cy="73" r="48" stroke="#40573d" stroke-width="2" />
    <circle cx="79" cy="145" r="48" stroke="#263d56" stroke-width="2" />
    <circle cx="161" cy="145" r="48" stroke="#bd863d" stroke-width="2" />
    <path d="M120 25V120M38 169L120 120M202 169L120 120" stroke="#b89a72" stroke-width="1.5" />
    <circle cx="120" cy="73" r="5" fill="#40573d" />
    <circle cx="79" cy="145" r="5" fill="#263d56" />
    <circle cx="161" cy="145" r="5" fill="#bd863d" />
    <circle cx="120" cy="120" r="13" fill="var(--cloak-forest)" />
    <circle cx="120" cy="120" r="4" fill="#fbf8ef" />
  </svg>
);

export function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <BrandMark size="md" href="/" />
        <Link className="landing-action landing-action--primary" href="/sign-in?next=%2Fworkspace">
          Start working
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <h1 id="landing-title">
                <span>Work.</span>
                <span className="landing-h1-em">Evidence.</span>
                <span>Acceptance.</span>
              </h1>
              <p className="landing-lede">
                APT Labs makes productive capacity visible, connectable and
                governable. Actors, resources, intentions, commitments,
                activity and knowledge share one ontology.
              </p>
              <div className="landing-actions">
                <Link className="landing-action landing-action--primary" href="/sign-in?next=%2Fworkspace">
                  Start working
                </Link>
                <Link className="landing-action landing-action--quiet" href="/investor-memo">
                  Read the memo
                </Link>
              </div>
            </div>
            <div className="landing-hero-anchor" aria-hidden="true">
              {UBUNTU_GEOMETRY}
            </div>
          </div>
        </section>

        <div className="landing-break landing-break--full" />

        <div className="landing-story" role="group" aria-label="How APT Labs coordinates work">
          <section className="landing-operating-map" aria-labelledby="landing-map-title">
            <div className="landing-operating-map-inner">
              <div className="landing-operating-map-copy">
                <h2 id="landing-map-title" className="landing-section-heading">
                  The buyer path
                </h2>
                <p className="landing-operating-map-lede">
                  One need. One acceptance. One payment.
                </p>
              </div>
              <OperatingMap />
            </div>
          </section>

          <section className="landing-what" aria-labelledby="landing-what-title">
            <div className="landing-what-inner">
              <div className="landing-what-copy">
                <h2 id="landing-what-title" className="landing-section-heading">
                  Six structures
                </h2>
                <p className="landing-what-lede">
                  Connected. None stands alone.
                </p>
              </div>
              <div className="landing-flow-map">
                <svg className="landing-flow-thread" viewBox="0 0 900 40" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M75 15C125 5 175 25 225 15S325 5 375 15S475 25 525 15S625 5 675 15S775 25 825 15" stroke="var(--cloak-sisal)" stroke-width="5" fill="none" />
                  <path d="M75 15C125 5 175 25 225 15S325 5 375 15S475 25 525 15S625 5 675 15S775 25 825 15" stroke="var(--cloak-indigo)" stroke-width="1.5" stroke-dasharray="2 9" fill="none" />
                </svg>
                <ol className="landing-flow" role="list" aria-label="Institutional structures in sequence">
                  {STRUCTURES.map((s, index) => (
                    <li key={s.id} className="landing-flow-item">
                      <div className="landing-flow-connector">
                        <span className="landing-flow-number">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="landing-flow-body">
                        <h3 className="landing-flow-title">{s.label}</h3>
                        <p className="landing-flow-detail">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className="landing-architecture" aria-labelledby="landing-architecture-title">
            <div className="landing-architecture-inner">
              <div className="landing-architecture-copy">
                <h2 id="landing-architecture-title" className="landing-section-heading">
                  Five boundaries
                </h2>
                <p className="landing-architecture-lede">
                  One system, shared across every action.
                </p>
              </div>
              <div className="landing-module-constellation">
                <svg className="landing-module-thread" viewBox="0 0 900 48" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M450 2C360 7 170 7 90 18M450 2C390 8 320 10 270 18M450 2V18M450 2C510 8 580 10 630 18M450 2C540 7 730 7 810 18" stroke="var(--cloak-forest)" stroke-width="1.5" fill="none" />
                  <circle cx="450" cy="3" r="4" fill="var(--cloak-forest)" />
                </svg>
                <div className="landing-module-field" role="list" aria-label="Institution modules">
                  {MODULES.map((m) => (
                    <div key={m.id} className="landing-module" role="listitem">
                      <h3 className="landing-module-title">{m.label}</h3>
                      <p className="landing-module-hint">{m.hint}</p>
                      <Link className="landing-module-link" href={m.href}>
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <p className="landing-why-line">Evidence you can trace. Outcomes that are accepted.</p>
        </div>
      </main>

      <footer className="landing-footer">
        <BrandMark size="sm" href="/" />
        <div className="landing-footer-copy">
          <p>
            Browser-local. No live institutional, payment, telemetry, or
            credential connections.
          </p>
        </div>
      </footer>
    </div>
  );
}
