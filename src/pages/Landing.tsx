import { Link } from 'wouter';
import { BrandMark } from '../components/BrandMark';

const deliveryStages = [
  {
    number: '01',
    title: 'Find a real need',
    detail:
      'Start with an asset record, a field inspection, or a sensor signal where it is useful. Telemetry flags work for review; it never commissions work on its own.',
  },
  {
    number: '02',
    title: 'Authorize a defined scope',
    detail:
      'The institution sets the budget, safety requirements, and acceptance criteria before any provider is matched.',
  },
  {
    number: '03',
    title: 'Match the right labor',
    detail:
      'A pilot could offer supervised, paid, low-risk tasks as an entry path for unemployed youth. Licensed and experienced contractors retain specialist, regulated, and safety-critical scopes; the roles complement, not replace, each other.',
  },
  {
    number: '04',
    title: 'Verify the work',
    detail:
      'A dated evidence trail and buyer acceptance connect the original need to completed work. Access to sensitive site data should be limited to delivery needs and governed by retention rules.',
  },
  {
    number: '05',
    title: 'Settle, then record',
    detail:
      'The buyer authorizes payment after acceptance. A credential could record demonstrated work only with worker consent and a trusted issuer; portable W3C Verifiable Credentials are a design direction, not a live service. SBTs are not the default.',
  },
];

export function Landing() {
  return (
    <div className="site-shell landing-shell">
      <header className="landing-header">
        <BrandMark size="md" />
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#pilot-economics">Pilot model</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link
          className="landing-demo-link"
          href="/sign-in?next=%2Fworkspace%2Fpeople"
        >
          Open the local demo <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              FIELD SYSTEM / OPERATING THESIS
            </p>
            <h1 id="landing-title">
              Move overlooked institutional work into{' '}
              <em>verified local delivery.</em>
            </h1>
            <p className="landing-lede">
              The proposed model connects approved institutional needs with
              local teams and ties payment to accepted work. It would earn a
              coordination fee on delivery—not a seat license or a new
              debt-financed build.
            </p>
            <div className="landing-hero-actions">
              <a className="landing-primary-link" href="#pilot-economics">
                See the pilot model <span aria-hidden="true">↓</span>
              </a>
              <p>
                Prototype only. No live institutional, telemetry, payment, or
                credential connections.
              </p>
            </div>
          </div>

          <aside
            className="landing-economics"
            id="pilot-economics"
            aria-labelledby="economics-title"
          >
            <div className="landing-economics-heading">
              <p className="landing-micro-label">
                <span>WORKED EXAMPLE</span>
                <span>ASSUMPTIONS / 01</span>
              </p>
              <h2 id="economics-title">Illustrative pilot economics</h2>
            </div>
            <dl className="landing-economics-ledger">
              <div className="landing-ledger-row">
                <dt>
                  <span>01</span> Institutional work routed
                </dt>
                <dd>$100,000</dd>
              </div>
              <div className="landing-ledger-row">
                <dt>
                  <span>02</span> Paid to delivery teams
                </dt>
                <dd>$90,000</dd>
              </div>
              <div className="landing-ledger-row landing-ledger-total">
                <dt>
                  <span>03</span> APT coordination fee
                </dt>
                <dd>$10,000</dd>
              </div>
            </dl>
            <p className="landing-economics-assumption">
              Assumes one $100K work package and a 10% fee included in that
              package; the remaining 90% goes to delivery. This is illustrative
              arithmetic—not APT-LABS revenue, traction, a forecast, or a
              margin claim. It excludes operating costs, taxes, and procurement
              constraints.
            </p>
          </aside>
        </section>

        <section className="landing-flow-section" aria-labelledby="flow-title">
          <div className="landing-section-heading">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              THE DELIVERY LOOP
            </p>
            <h2 id="flow-title">From physical signal to accountable work.</h2>
            <p>
              A human-authorized chain—not an automated jump from sensor
              reading to labor assignment.
            </p>
          </div>

          <ol className="landing-flow">
            {deliveryStages.map((stage) => (
              <li className="landing-flow-step" key={stage.number}>
                <span className="landing-flow-number">{stage.number}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="landing-thesis"
          id="about"
          aria-labelledby="thesis-title"
        >
          <div className="landing-thesis-intro">
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              THE 2030 BET / TO BE PROVEN
            </p>
            <h2 id="thesis-title">
              The arbitrage is coordination—not cheaper labor.
            </h2>
            <p>
              Working thesis: institutional leakage is the gap between
              budgeted need and locally delivered, accepted work. APT-LABS
              proposes to close that gap by reducing discovery, verification,
              and coordination friction—not by replacing procurement, SaaS, or
              public finance. The size of that gap is unmeasured.
            </p>
          </div>
          <div className="landing-thesis-points">
            <article>
              <span>01 / REVENUE</span>
              <h3>Fee on accepted work</h3>
              <p>
                In the proposed model, revenue would follow buyer-accepted
                delivery. A 10% fee is an example to test with buyers, not an
                established rate.
              </p>
            </article>
            <article>
              <span>02 / DISTRIBUTION</span>
              <h3>Start with repeatable needs</h3>
              <p>
                The wedge is a defined buyer and recurring work category. Local
                providers and repeat orders could compound supply and evidence;
                no partnerships or network effects are claimed today.
              </p>
            </article>
            <article>
              <span>03 / DEFENSIBILITY</span>
              <h3>Proof, not a token</h3>
              <p>
                The potential advantage is accepted work history and lower
                coordination friction—not an unproven credential or blockchain
                label.
              </p>
            </article>
          </div>
          <p className="landing-proof-gate">
            <strong>What a pilot must prove:</strong> buyer-approved scopes,
            compliant provider selection, on-time accepted work, local payment,
            repeat orders, and positive unit economics after delivery and
            operating costs.
          </p>
        </section>

        <section
          className="landing-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div>
            <p className="landing-kicker">
              <span className="landing-kicker-rule" aria-hidden="true" />
              CONTACT / PILOT PARTNERS
            </p>
            <h2 id="contact-title">Start with one real work category.</h2>
            <p>
              Discuss a bounded pilot, its buyer approvals, delivery partners,
              and acceptance criteria. The link opens WhatsApp; nothing is sent
              until you choose to send the message.
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
          APT-LABS is a browser-local prototype. Figures above are illustrative
          assumptions; workflows are not connected to live institutions,
          payments, telemetry, or credential issuers.
        </p>
      </footer>
    </div>
  );
}
