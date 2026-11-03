import { BrandMark } from '../components/BrandMark';

/**
 * APT-LABS Investor Memo
 * A proper investment memorandum — not a landing page section.
 * Designed to be read like a document, not browsed like a website.
 */

const memoHeader = {
  title: 'APT-LABS',
  subtitle: 'Investment Memorandum',
  classification: 'CONFIDENTIAL — FOR ACCREDITED INVESTORS ONLY',
  date: 'November 2026',
  version: 'v0.1 / DRAFT',
};

const thesis = {
  statement: 'The coordination fee is not the business. The business is the data asset that makes the fee defensible: buyer-accepted outcomes, provider performance history, and community context — all recorded at the point of work.',
  implication: 'Every accepted work package compounds the dataset. The dataset underwrites insurance, enables financing, and creates switching costs for both buyers and providers. The 10% coordination fee is the entry price; the data moat is the durable margin.',
};

const unitEconomics = {
  assumptions: [
    { label: 'Work package value', value: '$100,000', note: 'Median pilot scope' },
    { label: 'Delivery share (90%)', value: '$90,000', note: 'Paid to local teams' },
    { label: 'Coordination fee (10%)', value: '$10,000', note: 'APT-LABS revenue' },
    { label: 'Operating cost (30% of fee)', value: '($3,000)', note: 'Infra, ops, compliance' },
    { label: 'Gross margin on fee', value: '$7,000', note: '70% gross margin' },
    { label: 'CAC (pilot, direct sales)', value: '($3,000)', note: 'First 5 buyers' },
    { label: 'Net contribution / package', value: '$4,000', note: 'Before overhead' },
  ],
  sensitivity: [
    { scenario: 'Base case', packagesPerYear: 20, netContribution: '$80,000', paybackMonths: 18 },
    { scenario: 'Fee expansion (15%)', packagesPerYear: 20, netContribution: '$170,000', paybackMonths: 9 },
    { scenario: 'Density (50 packages)', packagesPerYear: 50, netContribution: '$200,000', paybackMonths: 7 },
    { scenario: 'Full stack (fee + insurance + financing)', packagesPerYear: 50, netContribution: '$500,000+', paybackMonths: 4 },
  ],
};

const scaleLogic = [
  {
    title: 'Buyer retention via outcome lock-in',
    mechanism: 'Accepted outcomes create switching cost — re-procurement requires re-verification of scope, criteria, and evidence. The buyer\'s acceptance history becomes the procurement standard.',
    metric: 'Target: >80% buyer retention at 12 months',
    status: 'Unproven',
  },
  {
    title: 'Provider liquidity via performance history',
    mechanism: 'Completed work with buyer-accepted evidence builds a verifiable track record. Next buyer searches less, decides faster. Fee defensibility increases as search cost approaches zero.',
    metric: 'Target: >60% provider repeat rate',
    status: 'Unproven',
  },
  {
    title: 'Data moat: proprietary underwriting dataset',
    mechanism: 'Community context + outcome records + provider performance = dataset insurers and financiers cannot replicate. Enables fee expansion: coordination (10%) → insurance wrap (15%) → financing facilitation (20%+).',
    metric: 'Target: 3+ underwriting partners by Year 2',
    status: 'Hypothesis',
  },
  {
    title: 'Fee expansion pathway',
    mechanism: 'Layer 1: Coordination (10%) — scope, acceptance, recording. Layer 2: Risk wrap (+5%) — milestone insurance, performance bonds. Layer 3: Capital facilitation (+5-10%) — invoice factoring, equipment financing, working capital lines.',
    metric: 'Target: Blended take rate >15% by Year 3',
    status: 'Hypothesis',
  },
];

const risks = [
  {
    category: 'Procurement Fit',
    risk: 'Buyers cannot authorize work via existing frameworks. Public procurement rules require competitive tender, fixed scopes, predefined criteria — incompatible with dynamic need-scoping.',
    mitigation: 'Pilot with buyers who have delegated authority (maintenance budgets, emergency works, innovation sandboxes). Document workaround patterns.',
    gate: '3 buyers transacting via existing delegated authority',
    status: '🔴 Critical',
  },
  {
    category: 'Delivery Density',
    risk: 'Local teams cannot deliver repeatedly at quality. Informal sector fragmentation, skill gaps, and coordination overhead prevent consistent buyer-accepted outcomes.',
    mitigation: 'Curate provider pool via capability verification. Start with trade categories that have existing certification (electrical, plumbing, HVAC).',
    gate: '>70% first-time acceptance rate across 20+ packages',
    status: '🔴 Critical',
  },
  {
    category: 'Payment Timing & Working Capital',
    risk: 'Public buyers pay Net-60 to Net-90. Providers need weekly cash flow. APT-LABS sits in the middle — working capital requirement scales with volume.',
    mitigation: 'Invoice factoring partnership from Day 1. Build financing facilitation into fee stack (Layer 3). Model 45-day cash conversion cycle.',
    gate: 'Factoring facility committed; 45-day CCC proven',
    status: '🟡 High',
  },
  {
    category: 'Regulatory & Data Sovereignty',
    risk: 'Public funds rules (PFMA, MFMA), labor classification (employee vs contractor), data localization (POPIA/GDPR), procurement audit requirements.',
    mitigation: 'Legal opinion per jurisdiction. Structure as procurement enablement platform, not employer of record. Data residency by default.',
    gate: 'Legal opinion clean for pilot jurisdiction',
    status: '🟡 High',
  },
  {
    category: 'Competitive Response',
    risk: 'Incumbents (procurement portals, ERP vendors, marketplaces) add acceptance workflows. Low switching cost if only feature-parity.',
    mitigation: 'Data moat is the moat — not the workflow. Compound outcome records faster than incumbents can replicate the dataset.',
    gate: '>500 accepted outcomes in dataset before Series A',
    status: '🟢 Monitor',
  },
];

const milestones = [
  { phase: 'Pilot (0–6 mo)', capital: '$250K', targets: ['3 buyers', '20 packages', '70% acceptance', 'Legal clean'], valuation: 'Pre-seed / SAFE' },
  { phase: 'Validation (6–18 mo)', capital: '$750K', targets: ['10 buyers', '100 packages', '80% retention', 'Factoring live'], valuation: 'Seed (~$5-8M cap)' },
  { phase: 'Scale (18–36 mo)', capital: '$3M', targets: ['50 buyers', '500 packages', 'Blended take >15%', 'Insurance partner'], valuation: 'Series A (~$20-30M)' },
  { phase: 'Expansion (36+ mo)', capital: '$10M+', targets: ['Multi-jurisdiction', 'Full stack live', 'Data licensing revenue'], valuation: 'Growth' },
];

const ask = {
  raise: '$250,000',
  instrument: 'SAFE (MFN, 20% discount, $8M cap)',
  useOfFunds: [
    { category: 'Product & simulation', amount: '$100K', pct: 40 },
    { category: 'Pilot execution (3 buyers)', amount: '$75K', pct: 30 },
    { category: 'Legal & regulatory', amount: '$50K', pct: 20 },
    { category: 'Operations & compliance', amount: '$25K', pct: 10 },
  ],
  contact: 'WhatsApp: +254 704 260 906',
};

export function InvestorMemo() {
  return (
    <div className="investor-memo">
      <header className="investor-memo-header">
        <div className="investor-memo-header-inner">
          <div className="investor-memo-brand">
            <BrandMark size="lg" />
            <span className="investor-memo-classification">{memoHeader.classification}</span>
          </div>
          <nav className="investor-memo-nav" aria-label="Memo sections">
            <a href="#thesis">Thesis</a>
            <a href="#unit-economics">Unit Economics</a>
            <a href="#scale-logic">Scale Logic</a>
            <a href="#risks">Risks</a>
            <a href="#milestones">Milestones</a>
            <a href="#ask">The Ask</a>
          </nav>
        </div>
        <div className="investor-memo-title-block">
          <p className="investor-memo-meta">
            <span>{memoHeader.title}</span>
            <span>{memoHeader.date}</span>
            <span>{memoHeader.version}</span>
          </p>
          <h1 className="investor-memo-title">{memoHeader.subtitle}</h1>
        </div>
      </header>

      <main className="investor-memo-main">
        <section id="thesis" className="investor-memo-section investor-memo-thesis">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">01</span>
            <h2>Investment Thesis</h2>
          </header>
          <blockquote className="investor-memo-thesis-quote">
            <p>{thesis.statement}</p>
          </blockquote>
          <p className="investor-memo-thesis-implication">{thesis.implication}</p>
        </section>

        <section id="unit-economics" className="investor-memo-section investor-memo-unit-economics">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">02</span>
            <h2>Unit Economics</h2>
          </header>

          <article className="investor-memo-table-card">
            <header>
              <h3>Single-Package P&L</h3>
              <p className="investor-memo-table-caption">Assumptions: $100K median package, 10% fee, 30% op cost, direct-sales CAC</p>
            </header>
            <table className="investor-memo-table">
              <thead>
                <tr>
                  <th scope="col">Line Item</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">Basis</th>
                </tr>
              </thead>
              <tbody>
                {unitEconomics.assumptions.map((row, i) => (
                  <tr key={i} className={i >= 3 ? 'investor-memo-table-derived' : ''}>
                    <td>{row.label}</td>
                    <td className="num">{row.value}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="investor-memo-table-card">
            <header>
              <h3>Sensitivity Scenarios</h3>
              <p className="investor-memo-table-caption">Annual net contribution at varying volume and fee structures</p>
            </header>
            <table className="investor-memo-table">
              <thead>
                <tr>
                  <th scope="col">Scenario</th>
                  <th scope="col" className="num">Packages / yr</th>
                  <th scope="col" className="num">Net Contribution</th>
                  <th scope="col" className="num">Payback</th>
                </tr>
              </thead>
              <tbody>
                {unitEconomics.sensitivity.map((row, i) => (
                  <tr key={i} className={i === 0 ? 'investor-memo-table-base' : ''}>
                    <td>{row.scenario}</td>
                    <td className="num">{row.packagesPerYear}</td>
                    <td className="num">{row.netContribution}</td>
                    <td className="num">{row.paybackMonths}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>

        <section id="scale-logic" className="investor-memo-section investor-memo-scale-logic">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">03</span>
            <h2>Scale Logic — Why This Compounds</h2>
          </header>
          <div className="investor-memo-scale-grid">
            {scaleLogic.map((item, i) => (
              <article key={i} className="investor-memo-scale-card">
                <header>
                  <span className="investor-memo-scale-index">{i + 1}</span>
                  <h3>{item.title}</h3>
                  <span className="investor-memo-scale-status">{item.status}</span>
                </header>
                <p className="investor-memo-scale-mechanism">{item.mechanism}</p>
                <p className="investor-memo-scale-metric">{item.metric}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="risks" className="investor-memo-section investor-memo-risks">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">04</span>
            <h2>Key Risks — Gates to the Next Round</h2>
          </header>
          <div className="investor-memo-risk-grid">
            {risks.map((risk, i) => (
              <article key={i} className="investor-memo-risk-card">
                <header>
                  <h3>{risk.category}</h3>
                  <span className="investor-memo-risk-status">{risk.status}</span>
                </header>
                <div className="investor-memo-risk-field">
                  <span className="investor-memo-risk-label">Risk</span>
                  <p>{risk.risk}</p>
                </div>
                <div className="investor-memo-risk-field">
                  <span className="investor-memo-risk-label">Mitigation</span>
                  <p>{risk.mitigation}</p>
                </div>
                <div className="investor-memo-risk-field investor-memo-risk-gate">
                  <span className="investor-memo-risk-label">Gate</span>
                  <p>{risk.gate}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="milestones" className="investor-memo-section investor-memo-milestones">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">05</span>
            <h2>Milestones & Capital Plan</h2>
          </header>
          <table className="investor-memo-table investor-memo-milestones-table">
            <thead>
              <tr>
                <th scope="col">Phase</th>
                <th scope="col">Capital</th>
                <th scope="col">Key Targets</th>
                <th scope="col">Valuation Marker</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.phase}</strong></td>
                  <td className="num">{m.capital}</td>
                  <td>
                    <ul>
                      {m.targets.map((t, j) => <li key={j}>{t}</li>)}
                    </ul>
                  </td>
                  <td>{m.valuation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="ask" className="investor-memo-section investor-memo-ask">
          <header className="investor-memo-section-header">
            <span className="investor-memo-section-number">06</span>
            <h2>The Ask</h2>
          </header>
          <div className="investor-memo-ask-grid">
            <article className="investor-memo-ask-card investor-memo-ask-primary">
              <header>
                <h3>Raise</h3>
                <p className="investor-memo-ask-amount">{ask.raise}</p>
                <p className="investor-memo-ask-instrument">{ask.instrument}</p>
              </header>
              <div className="investor-memo-use-funds">
                <h4>Use of Funds</h4>
                <table className="investor-memo-table">
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col" className="num">Amount</th>
                      <th scope="col" className="num">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ask.useOfFunds.map((u, i) => (
                      <tr key={i}>
                        <td>{u.category}</td>
                        <td className="num">{u.amount}</td>
                        <td className="num">{u.pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="investor-memo-ask-card investor-memo-ask-contact">
              <header>
                <h3>Next Step</h3>
              </header>
              <p>Review the pilot simulation in the workspace. Then let's discuss the bounded pilot design.</p>
              <a href="https://wa.me/254704260906?text=Hello%20APT-LABS%2C%20I%27d%20like%20to%20discuss%20the%20investor%20memo%20and%20pilot%20design."
                target="_blank" rel="noopener noreferrer" className="investor-memo-contact-link">
                Open WhatsApp <span aria-hidden="true">→</span>
              </a>
              <p className="investor-memo-contact-detail">{ask.contact}</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="investor-memo-footer">
        <div className="investor-memo-footer-inner">
          <BrandMark size="sm" />
          <p>APT-LABS — Sovereign Coordination Engine</p>
          <p className="investor-memo-disclaimer">
            This memorandum is for discussion purposes only and does not constitute
            an offer or solicitation. All figures are illustrative; no live transactions,
            buyer commitments, or revenue are claimed. Past performance of the prototype
            does not indicate future results.
          </p>
        </div>
      </footer>

      <a href="/sign-in?next=%2Fworkspace%2Ffield-desk" className="investor-memo-cta">
        Open the Field Desk simulation <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}