import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';

export function AptCoinLab() {
  return (
    <WorkspaceLayout currentContext="intelligence:coin-lab">
      <div className="apt-coin-lab-page">
        <PageHead
          eyebrow="Intelligence"
          title="Intelligence"
          subtitle="Declared placeholder — no interactive UI exists yet."
        />

        <section className="intelligence-placeholder">
          <h2>User job that must exist first</h2>
          <p>
            An institution needs to allocate a budget across crews with verified capability matches,
            and wants a ranked shortlist with evidence trails and conflict-of-interest flags.
          </p>

          <h2>Preconditions (all must be met before any UI is built)</h2>
          <ul className="intelligence-preconditions">
            <li>Unified cross-module event stream</li>
            <li>Authority model for matching and forecasting</li>
            <li>Matching engine with evidence trails</li>
            <li>Forecasting baseline</li>
            <li>Graph analysis capability</li>
          </ul>

          <h2>Conceptual sub-jobs today (no UI)</h2>
          <ul className="intelligence-subjobs">
            <li>Matching: capability ? work</li>
            <li>Forecasting: pipeline ? capacity</li>
            <li>Graph analysis: network ? structural gaps</li>
          </ul>

          <p className="intelligence-note">
            APT Coin Lab remains a static research sub-view at /workspace/intelligence/coin-lab.
            No coin balances, transfers, token rewards, wages, or coin-gated access exist.
          </p>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
