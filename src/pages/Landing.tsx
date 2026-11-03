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
              INVESTOR LENS / ECONOMIC LOGIC
            </p>
            <h2 id="economics-title">How the coordination fee compounds.</h2>
            <p className="landing-investor-thesis">
              The fee is not the business. The business is the data asset that
              makes the fee defensible: buyer-accepted outcomes, provider
              performance history, and community context — all recorded at the
              point of work.
            </p>
          </div>

          <div className="landing-investor-grid">
            <article className="landing-investor-card landing-investor-unit">
              <header>
                <p className="landing-micro-label">
                  <span>UNIT ECONOMICS</span>
                  <span>PER WORK PACKAGE</span>
                </p>
                <h3>Single-package arithmetic</h3>
              </header>
              <dl className="landing-economics-ledger">
                <div className="landing-ledger-row">
                  <dt><span>01</span> Work package value</dt>
                  <dd>$100,000</dd>
                </div>
                <div className="landing-ledger-row">
                  <dt><span>02</span> Delivery share (90%)</dt>
                  <dd>$90,000</dd>
                </div>
                <div className="landing-ledger-row">
                  <dt><span>03</span> Coordination fee (10%)</dt>
                  <dd>$10,000</dd>
                </div>
                <div className="landing-ledger-row landing-ledger-subtotal">
                  <dt><span>—</span> Gross margin on fee</dt>
                  <dd>~$7,000</dd>
                </div>
                <div className="landing-ledger-row landing-ledger-subtotal">
                  <dt><span>—</span> Estimated CAC (pilot)</dt>
                  <dd>~$3,000</dd>
                </div>
                <div className="landing-ledger-row landing-ledger-total">
                  <dt><span>04</span> Net contribution / package</dt>
                  <dd>$4,000</dd>
                </div>
              </dl>
              <p className="landing-economics-assumption">
                Assumes 30% operating cost on fee (infra, ops, compliance).
                CAC estimated for first 5 buyers via direct sales.
                No sales leverage, no renewal revenue, no expansion.
              </p>
            </article>

            <article className="landing-investor-card landing-investor-scale">
              <header>
                <p className="landing-micro-label">
                  <span>SCALE LOGIC</span>
                  <span>WHY THIS COMPOUNDS</span>
                </p>
                <h3>Network effects in coordination</h3>
              </header>
              <ul className="landing-scale-list">
                <li>
                  <strong>Buyer retention:</strong> Accepted outcomes create
                  switching cost — re-procurement requires re-verification.
                </li>
                <li>
                  <strong>Provider liquidity:</strong> Performance history
                  reduces search cost for next buyer; fee stays defensible.
                </li>
                <li>
                  <strong>Data moat:</strong> Community context + outcome
                  records = proprietary underwriting dataset for insurers
                  and financiers.
                </li>
                <li>
                  <strong>Fee expansion:</strong> 10% coordination → 15% with
                  insurance wrap → 20% with financing facilitation.
                </li>
              </ul>
            </article>

            <article className="landing-investor-card landing-investor-risks">
              <header>
                <p className="landing-micro-label">
                  <span>KEY RISKS</span>
                  <span>WHAT MUST BE PROVEN</span>
                </p>
                <h3>Gates to the next round</h3>
              </header>
              <dl className="landing-risk-list">
                <div className="landing-risk-row">
                  <dt>Procurement fit</dt>
                  <dd>Can buyers authorize via existing frameworks?</dd>
                </div>
                <div className="landing-risk-row">
                  <dt>Delivery density</dt>
                  <dd>Can local teams deliver repeatedly at quality?</dd>
                </div>
                <div className="landing-risk-row">
                  <dt>Payment timing</dt>
                  <dd>Net-30? Net-60? Working capital requirement?</dd>
                </div>
                <div className="landing-risk-row">
                  <dt>Regulatory</dt>
                  <dd>Public funds rules, labor classification, data sovereignty.</dd>
                </div>
              </dl>
            </article>
          </div>
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
