import { BrandMark } from '../components/BrandMark';

/**
 * APT-LABS Investment Memorandum
 * Read top to bottom. No navigation chrome. Every line earns its place.
 */

const memo = {
  title: 'APT-LABS',
  subtitle: 'Investment Memorandum',
  classification: 'CONFIDENTIAL — FOR QUALIFIED INVESTORS ONLY',
  date: 'November 2026',
  version: 'v0.1 / DRAFT',

  thesis: `APT-LABS records buyer-accepted outcomes at the point of work. Each acceptance compounds a dataset — provider performance, community context, scope evidence — that underwrites insurance, enables financing, and creates switching costs for both buyers and providers. The 10% coordination fee is the entry price; the data moat is the durable margin.`,

  unitEconomics: [
    { line: 'Work package value', amount: '$100,000', basis: 'Median pilot scope' },
    { line: 'Delivery share (90%)', amount: '$90,000', basis: 'Paid to local teams' },
    { line: 'Coordination fee (10%)', amount: '$10,000', basis: 'APT-LABS revenue' },
    { line: 'Operating cost (30% of fee)', amount: '($3,000)', basis: 'Infra, ops, compliance' },
    { line: 'Gross margin on fee', amount: '$7,000', basis: '70% gross margin' },
    { line: 'CAC (pilot, direct sales)', amount: '($3,000)', basis: 'First 5 buyers' },
    { line: 'Net contribution / package', amount: '$4,000', basis: 'Before overhead', highlight: true },
  ],

  scenarios: [
    { case: 'Base (20 packages/yr, 10% fee)', annual: '$80,000', payback: '18 mo' },
    { case: 'Fee expansion (20 packages/yr, 15%)', annual: '$170,000', payback: '9 mo' },
    { case: 'Density (50 packages/yr, 10% fee)', annual: '$200,000', payback: '7 mo' },
    { case: 'Full stack (50 packages, fee+insurance+financing)', annual: '$500,000+', payback: '4 mo' },
  ],

  scaleLogic: [
    {
      title: 'Buyer retention via outcome lock-in',
      mechanism: 'Accepted outcomes create switching cost — re-procurement requires re-verification of scope, criteria, and evidence. The buyer\'s acceptance history becomes the procurement standard.',
      proof: 'Unproven — requires 3+ buyers transacting repeatedly',
    },
    {
      title: 'Provider liquidity via performance history',
      mechanism: 'Completed work with buyer-accepted evidence builds a verifiable track record. Next buyer searches less, decides faster. Fee defensibility increases as search cost approaches zero.',
      proof: 'Unproven — requires >60% provider repeat rate',
    },
    {
      title: 'Data moat: proprietary underwriting dataset',
      mechanism: 'Community context + outcome records + provider performance = dataset insurers and financiers cannot replicate. Enables fee expansion: coordination (10%) → insurance wrap (15%) → financing facilitation (20%+).',
      proof: 'Hypothesis — requires 3+ underwriting partners by Year 2',
    },
    {
      title: 'Fee expansion pathway',
      mechanism: 'Layer 1: Coordination (10%) — scope, acceptance, recording. Layer 2: Risk wrap (+5%) — milestone insurance, performance bonds. Layer 3: Capital facilitation (+5–10%) — invoice factoring, equipment financing, working capital lines.',
      proof: 'Hypothesis — requires blended take rate >15% by Year 3',
    },
  ],

  risks: [
    {
      category: 'Procurement Fit',
      severity: 'Critical',
      risk: 'Public procurement rules require competitive tender, fixed scopes, predefined criteria — incompatible with dynamic need-scoping.',
      mitigation: 'Pilot with buyers holding delegated authority (maintenance budgets, emergency works, innovation sandboxes). Document workaround patterns.',
      gate: '3 buyers transacting via existing delegated authority',
    },
    {
      category: 'Delivery Density',
      severity: 'Critical',
      risk: 'Informal sector fragmentation, skill gaps, and coordination overhead prevent consistent buyer-accepted outcomes.',
      mitigation: 'Curate provider pool via capability verification. Start with certified trades (electrical, plumbing, HVAC).',
      gate: '>70% first-time acceptance across 20+ packages',
    },
    {
      category: 'Payment Timing & Working Capital',
      severity: 'High',
      risk: 'Public buyers pay Net-60 to Net-90. Providers need weekly cash flow. APT-LABS sits in the middle — working capital scales with volume.',
      mitigation: 'Invoice factoring partnership from Day 1. Build financing facilitation into fee stack (Layer 3). Model 45-day CCC.',
      gate: 'Factoring facility committed; 45-day CCC proven',
    },
    {
      category: 'Regulatory & Competitive Response',
      severity: 'High',
      risk: 'Public funds rules (PFMA/MFMA), labor classification, data sovereignty (POPIA/GDPR). Incumbents add acceptance workflows — low switching cost if only feature parity.',
      mitigation: 'Legal opinion per jurisdiction. Structure as procurement enablement, not employer of record. Data moat compounds faster than incumbents replicate dataset.',
      gate: 'Legal opinion clean; >500 accepted outcomes before Series A',
    },
  ],

  milestones: [
    { phase: 'Pilot (0–6 mo)', capital: '$250K', targets: '3 buyers · 20 packages · 70% acceptance · Legal clean', valuation: 'Pre-seed / SAFE' },
    { phase: 'Validation (6–18 mo)', capital: '$750K', targets: '10 buyers · 100 packages · 80% retention · Factoring live', valuation: 'Seed ($5–8M cap)' },
    { phase: 'Scale (18–36 mo)', capital: '$3M', targets: '50 buyers · 500 packages · Blended take >15% · Insurance partner', valuation: 'Series A ($20–30M)' },
    { phase: 'Expansion (36+ mo)', capital: '$10M+', targets: 'Multi-jurisdiction · Full stack live · Data licensing revenue', valuation: 'Growth' },
  ],

  ask: {
    raise: '$250,000',
    instrument: 'SAFE — MFN, 20% discount, $8M cap',
    useOfFunds: [
      { category: 'Product & simulation', amount: '$100K', pct: 40 },
      { category: 'Pilot execution (3 buyers)', amount: '$75K', pct: 30 },
      { category: 'Legal & regulatory', amount: '$50K', pct: 20 },
      { category: 'Operations & compliance', amount: '$25K', pct: 10 },
    ],
    contact: '+254 704 260 906',
  },
};

export function InvestorMemo() {
  return (
    <div className="investor-memo">
      <header className="investor-memo-header">
        <div className="investor-memo-header-inner">
          <div className="investor-memo-brand">
            <BrandMark size="lg" />
            <span className="investor-memo-classification">{memo.classification}</span>
          </div>
        </div>
        <div className="investor-memo-title-block">
          <p className="investor-memo-meta">
            <span>{memo.title}</span>
            <span>{memo.date}</span>
            <span>{memo.version}</span>
          </p>
          <h1 className="investor-memo-title">{memo.subtitle}</h1>
        </div>
      </header>

      <main className="investor-memo-main">
        <section className="investor-memo-section investor-memo-thesis">
          <p>{memo.thesis}</p>
        </section>

        <section className="investor-memo-section investor-memo-unit-economics">
          <header className="investor-memo-section-header">
            <h2>Unit Economics</h2>
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
              {memo.unitEconomics.map((row, i) => (
                <tr key={i} className={row.highlight ? 'investor-memo-table-total' : (i >= 3 ? 'investor-memo-table-derived' : '')}>
                  <td>{row.line}</td>
                  <td className="num">{row.amount}</td>
                  <td>{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="investor-memo-table investor-memo-scenarios">
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col" className="num">Annual Net Contribution</th>
                <th scope="col" className="num">Payback</th>
              </tr>
            </thead>
            <tbody>
              {memo.scenarios.map((row, i) => (
                <tr key={i} className={i === 0 ? 'investor-memo-table-base' : ''}>
                  <td>{row.case}</td>
                  <td className="num">{row.annual}</td>
                  <td className="num">{row.payback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="investor-memo-section investor-memo-scale-logic">
          <header className="investor-memo-section-header">
            <h2>Scale Logic</h2>
          </header>
          <div className="investor-memo-scale-grid">
            {memo.scaleLogic.map((item, i) => (
              <article key={i} className="investor-memo-scale-card">
                <header>
                  <span className="investor-memo-scale-index">{i + 1}</span>
                  <h3>{item.title}</h3>
                </header>
                <p className="investor-memo-scale-mechanism">{item.mechanism}</p>
                <p className="investor-memo-scale-proof">{item.proof}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="investor-memo-section investor-memo-risks">
          <header className="investor-memo-section-header">
            <h2>Risks & Gates</h2>
          </header>
          <div className="investor-memo-risk-grid">
            {memo.risks.map((risk, i) => (
              <article key={i} className="investor-memo-risk-card">
                <header>
                  <h3>{risk.category}</h3>
                  <span className={`investor-memo-severity investor-memo-severity-${risk.severity.toLowerCase()}`}>{risk.severity}</span>
                </header>
                <div className="investor-memo-risk-field">
                  <p className="investor-memo-risk-risk">{risk.risk}</p>
                </div>
                <div className="investor-memo-risk-field">
                  <p className="investor-memo-risk-mitigation"><strong>Mitigation:</strong> {risk.mitigation}</p>
                </div>
                <div className="investor-memo-risk-gate">
                  <p><strong>Gate:</strong> {risk.gate}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="investor-memo-section investor-memo-milestones">
          <header className="investor-memo-section-header">
            <h2>Milestones & Capital Plan</h2>
          </header>
          <table className="investor-memo-table investor-memo-milestones-table">
            <thead>
              <tr>
                <th scope="col">Phase</th>
                <th scope="col" className="num">Capital</th>
                <th scope="col">Key Targets</th>
                <th scope="col">Valuation Marker</th>
              </tr>
            </thead>
            <tbody>
              {memo.milestones.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.phase}</strong></td>
                  <td className="num">{m.capital}</td>
                  <td>{m.targets}</td>
                  <td>{m.valuation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="investor-memo-section investor-memo-ask">
          <header className="investor-memo-section-header">
            <h2>The Ask</h2>
          </header>
          <div className="investor-memo-ask-grid">
            <article className="investor-memo-ask-card">
              <header>
                <p className="investor-memo-ask-raise">{memo.ask.raise}</p>
                <p className="investor-memo-ask-instrument">{memo.ask.instrument}</p>
              </header>
              <table className="investor-memo-table investor-memo-use-funds">
                <thead>
                  <tr>
                    <th scope="col">Use of Funds</th>
                    <th scope="col" className="num">Amount</th>
                    <th scope="col" className="num">%</th>
                  </tr>
                </thead>
                <tbody>
                  {memo.ask.useOfFunds.map((u, i) => (
                    <tr key={i}>
                      <td>{u.category}</td>
                      <td className="num">{u.amount}</td>
                      <td className="num">{u.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
            <article className="investor-memo-ask-contact">
              <a href={`https://wa.me/254704260906?text=Hello%20APT-LABS%2C%20I%27d%20like%20to%20discuss%20the%20investment%20memo.`}
                target="_blank" rel="noopener noreferrer" className="investor-memo-contact-link">
                Open WhatsApp → {memo.ask.contact}
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="investor-memo-footer">
        <div className="investor-memo-footer-inner">
          <BrandMark size="sm" />
          <p>APT-LABS — Sovereign Coordination Engine</p>
          <p className="investor-memo-disclaimer">
            For discussion only. Not an offer or solicitation. All figures illustrative;
            no live transactions, buyer commitments, or revenue claimed. Prototype
            performance does not indicate future results.
          </p>
        </div>
      </footer>

      <a href="/sign-in?next=%2Fworkspace%2Ffield-desk" className="investor-memo-cta">
        Open the Field Desk simulation →
      </a>
    </div>
  );
}