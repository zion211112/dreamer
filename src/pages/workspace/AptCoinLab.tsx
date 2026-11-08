import { WorkspaceLayout } from './WorkspaceLayout';

const distinctions = [
  {
    term: 'Productive value',
    description: 'Comes from useful work, goods, knowledge, and services—not from minting units.',
  },
  {
    term: 'Evidence',
    description: 'The Roll records contributions and accepted outcomes. A coin cannot prove that work happened.',
  },
  {
    term: 'Rights and capital',
    description: 'A token can represent a specific, established right; it cannot create that right or the wealth behind it.',
  },
];

export function AptCoinLab() {
  return (
    <WorkspaceLayout currentContext="intelligence:coin-lab">
      <div className="apt-coin-lab-page">
        <header className="apt-coin-lab-header">
          <p className="apt-coin-lab-eyebrow">APT-LABS <span aria-hidden="true">/</span> RESEARCH</p>
          <h1>APT Coin Lab</h1>
          <p className="apt-coin-lab-intro">
            Explore whether a coin should have any role at all. No purpose has been selected;
            this is research, not a financial product.
          </p>
        </header>

        <section aria-labelledby="apt-coin-lab-boundary-title" className="apt-coin-lab-boundary">
          <div>
            <p className="apt-coin-lab-status">Research only · no live coin</p>
            <h2 id="apt-coin-lab-boundary-title">Outside operational work</h2>
          </div>
          <p>
            No coin balances or transfers; no token rewards or wages; no coin-gated access,
            voting, or work authorization.
            Project compensation and costs remain explicit ordinary-money terms
            (KES for a Kenya pilot).
          </p>
        </section>

        <section aria-labelledby="apt-coin-lab-distinctions-title" className="apt-coin-lab-distinctions">
          <h2 id="apt-coin-lab-distinctions-title">Keep the categories distinct</h2>
          <dl>
            {distinctions.map(({ term, description }) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
