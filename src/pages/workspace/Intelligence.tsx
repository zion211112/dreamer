import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';

export function Intelligence() {
  return (
    <WorkspaceLayout currentContext="intelligence">
      <div className="intelligence-page">
        <div className="intelligence-header">
          <PageHead
            eyebrow="Intelligence"
            title="Intelligence"
            subtitle="Agents, matching, forecasting, analytics. The engine assesses and recommends; the authorized party decides. No universal reputation score."
          />
        </div>

        <section className="intelligence-role" aria-labelledby="int-role-title">
          <article className="intelligence-role-card">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">01</span>
              <h2 id="int-role-title" className="intelligence-card-title">Engine role</h2>
            </header>
            <p className="intelligence-card-body">
              The Intelligence Engine interprets relationships between identity, credentials,
              productive activity, institutional records, and economic interactions. It issues
              findings. It does not hold custody, set balances, transfer value, pay wages, or
              gate access. A credential is not authority, credit, or ownership.
            </p>
            <p className="intelligence-card-note">
              <strong>Who decides.</strong> The authorized financing party makes the capital
              deployment decision. The engine recommends; the party decides.
            </p>
          </article>
        </section>

        <section className="intelligence-panels" aria-label="Intelligence capabilities">
          <article className="intelligence-panel intelligence-panel--matching">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">02</span>
              <h2 className="intelligence-card-title">Matching</h2>
            </header>
            <p className="intelligence-card-body">
              Matches productive participants to undertakings and institutions based on bounded
              claims, scoped credentials, and demonstrated capability. A match is a suggestion,
              not an assignment.
            </p>
          </article>
          <article className="intelligence-panel intelligence-panel--forecasting">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">03</span>
              <h2 className="intelligence-card-title">Forecasting</h2>
            </header>
            <p className="intelligence-card-body">
              Projects load, capacity, and timing across pilot lanes from recorded contributions
              and attested outcomes. A forecast is a planning input, not a commitment.
            </p>
          </article>
          <article className="intelligence-panel intelligence-panel--analytics">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">04</span>
              <h2 className="intelligence-card-title">Analytics · research</h2>
            </header>
            <p className="intelligence-card-body">
              Research notes on reading attestation, contribution, and instrument state
              across undertakings — surfacing gaps and patterns without reducing a
              participant to a single score. No live charts are rendered yet.
            </p>
          </article>
        </section>

        <section className="intelligence-boundaries" aria-labelledby="int-bound-title">
          <header className="intelligence-card-head">
            <span className="intelligence-card-index">05</span>
            <h2 id="int-bound-title" className="intelligence-card-title">Boundaries</h2>
          </header>
          <ul className="intelligence-boundary-list">
            <li className="intelligence-boundary-item">
              <span className="intelligence-boundary-term">No universal score</span>
              <span className="intelligence-boundary-desc">A credential is not authority, credit, or ownership.</span>
            </li>
            <li className="intelligence-boundary-item">
              <span className="intelligence-boundary-term">No coin behavior</span>
              <span className="intelligence-boundary-desc">No balances, transfers, rewards, wages, or coin-gated access.</span>
            </li>
            <li className="intelligence-boundary-item">
              <span className="intelligence-boundary-term">No custody</span>
              <span className="intelligence-boundary-desc">Participants retain and present their credentials.</span>
            </li>
            <li className="intelligence-boundary-item">
              <span className="intelligence-boundary-term">No unilateral decision</span>
              <span className="intelligence-boundary-desc">The engine recommends; the authorized financing party decides.</span>
            </li>
          </ul>
        </section>

        <p className="intelligence-footer-note">
          Browser-local demo. Synthetic records stay in this browser. Research and operational
          intelligence only &mdash; no coin behavior here.
        </p>
      </div>
    </WorkspaceLayout>
  );
}
