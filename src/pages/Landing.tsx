import { Link } from 'wouter';
import { BrandMark } from '../components/BrandMark';
import { OperatingMap } from '../components/landing/OperatingMap';

export function Landing() {
  return (
    <div className="site-shell landing-shell">
      <header className="landing-header">
        <BrandMark size="md" />
        <Link
          className="landing-demo-link"
          href="/sign-in?next=%2Fworkspace%2Fpeople"
        >
          Open the workspace <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              LOCAL WORK / HUMAN-AUTHORIZED MODEL
            </p>
            <h1 id="landing-title">
              From institutional need to{' '}
              <em>accepted local work.</em>
            </h1>
            <p className="landing-lede">
              APT-LABS coordinates institutional needs, local delivery teams,
              community context, and accountable records in one workflow.
            </p>
            <div className="landing-hero-actions">
              <a className="landing-primary-link" href="#model">
                Trace the model <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <OperatingMap />
        </section>

        <section
          className="landing-audiences"
          id="audiences"
          aria-labelledby="audiences-title"
        >
          <div className="landing-section-heading">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              ONE SYSTEM / FOUR ENTRY POINTS
            </p>
            <h2 id="audiences-title">Choose your role.</h2>
          </div>
          <div className="landing-audience-list">
            <article className="landing-audience-row">
              <span className="landing-audience-index">01 / BUYERS</span>
              <div>
                <h3>Institutions</h3>
                <p>
                  Define needs, authorize scope, accept outcomes.
                </p>
              </div>
              <Link
                className="landing-audience-link"
                href="/sign-in?next=%2Fworkspace%2Finstitutions"
              >
                Open Institutions <span aria-hidden="true">↗</span>
              </Link>
            </article>
            <article className="landing-audience-row">
              <span className="landing-audience-index">02 / DELIVERY</span>
              <div>
                <h3>Local teams</h3>
                <p>
                  Browse capabilities, claim work, submit evidence.
                </p>
              </div>
              <Link
                className="landing-audience-link"
                href="/sign-in?next=%2Fworkspace%2Fpeople"
              >
                Open People <span aria-hidden="true">↗</span>
              </Link>
            </article>
            <article className="landing-audience-row">
              <span className="landing-audience-index">03 / STEWARDSHIP</span>
              <div>
                <h3>Community stewards</h3>
                <p>
                  Record observations, steward decisions, maintain context.
                </p>
              </div>
              <Link
                className="landing-audience-link"
                href="/sign-in?next=%2Fworkspace%2Fcommons"
              >
                Open Commons <span aria-hidden="true">↗</span>
              </Link>
            </article>
            <article className="landing-audience-row">
              <span className="landing-audience-index">
                04 / CAPITAL &amp; DELIVERY PARTNERS
              </span>
              <div>
                <h3>Investors and partners</h3>
                <p>
                  Inspect the Tender → Roll simulation and its assumptions.
                </p>
              </div>
              <Link
                className="landing-audience-link"
                href="/sign-in?next=%2Fworkspace%2Ffield-desk"
              >
                Open Field Desk <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </div>
        </section>

        <section className="landing-evidence" id="evidence" aria-labelledby="evidence-title">
          <div className="landing-section-heading">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              EVIDENCE / WHAT EXISTS
            </p>
            <h2 id="evidence-title">Working surfaces. Proposed model. Unproven economics.</h2>
          </div>
          <div className="landing-evidence-grid">
            <article className="landing-evidence-item landing-evidence-built">
              <p>IN THE WORKSPACE</p>
              <h3>Working local surfaces</h3>
              <ul>
                <li>People, Institutions, Commons, Workbench, and a local simulation.</li>
              </ul>
            </article>
            <article className="landing-evidence-item landing-evidence-proposed">
              <p>PROPOSED OPERATING MODEL</p>
              <h3>Human-reviewed work</h3>
              <ul>
                <li>Buyer-scoped work, qualified providers, acceptance before payment.</li>
              </ul>
            </article>
            <article className="landing-evidence-item landing-evidence-validate">
              <p>TO PROVE</p>
              <h3>Commercial viability</h3>
              <ul>
                <li>Buyer demand, procurement fit, repeat orders, positive unit economics.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="landing-investor-band" id="pilot-economics" aria-labelledby="economics-title">
          <div className="landing-investor-intro">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              INVESTOR LENS / SCENARIO
            </p>
            <h2 id="economics-title">Illustrative transaction economics.</h2>
          </div>
          <aside className="landing-economics" aria-labelledby="economics-example-title">
            <div className="landing-economics-heading">
              <p className="landing-micro-label">
                <span>HYPOTHETICAL PACKAGE</span>
                <span>ASSUMPTION / 01</span>
              </p>
              <h3 id="economics-example-title">Illustrative transaction economics</h3>
            </div>
            <dl className="landing-economics-ledger">
              <div className="landing-ledger-row">
                <dt><span>01</span> Work package</dt>
                <dd>$100,000</dd>
              </div>
              <div className="landing-ledger-row">
                <dt><span>02</span> Delivery share</dt>
                <dd>$90,000</dd>
              </div>
              <div className="landing-ledger-row landing-ledger-total">
                <dt><span>03</span> Example coordination fee</dt>
                <dd>$10,000</dd>
              </div>
            </dl>
            <p className="landing-economics-assumption">
              One $100K package, 10% coordination fee. Arithmetic only —
              not revenue, traction, forecast, or margin. Excludes costs,
              taxes, procurement, sales cycle, working capital.
            </p>
          </aside>
        </section>

        <section
          className="landing-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div>
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              CONTACT / PILOT
            </p>
            <h2 id="contact-title">Start with one real work category.</h2>
            <p>
              Discuss a bounded pilot and its approval and acceptance criteria.
            </p>
          </div>
          <a
            className="landing-contact-link"
            href="https://wa.me/254704260906?text=Hello%20APT-LABS%2C%20I%27d%20like%20to%20discuss%20a%20pilot."
            target="_blank"
            rel="noopener noreferrer"
          >
            Discuss a pilot on WhatsApp <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="landing-footer">
        <BrandMark size="sm" />
        <p>
          Browser-local workspace. No live institutional, payment, telemetry,
          or credential connections.
        </p>
      </footer>
    </div>
  );
}
