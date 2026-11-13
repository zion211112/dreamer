import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';

export function AptCoinLab() {
  return (
    <WorkspaceLayout currentContext="intelligence:coin-lab">
      <div className="apt-coin-lab-page">
        <div className="apt-coin-lab-header">
          <PageHead
            eyebrow="Intelligence"
            title="Coin Lab"
            subtitle="Trust and economic intelligence — identity, attestation, and economic interaction. Research-only: no balances, transfers, rewards, or coin-gated access."
          />
        </div>

        <section className="coin-lab-section">
          <div className="coin-lab-section-rule">
            <span className="coin-lab-section-label">Pillars</span>
            <h2 className="coin-lab-section-title">Three pillars <small>/ Intelligence Engine research</small></h2>
          </div>
          <div className="coin-lab-pillars">
            <article className="coin-lab-pillar">
              <span className="coin-lab-pillar-ordinal">1 / Attestation</span>
              <h3>APT Passport — attestations</h3>
              <p>
                Bounded, scoped claims about a participant&rsquo;s productive reality &mdash; issued by an issuer,
                scoped, consent-based, portable. Not a reputation score; not authority, credit, or ownership.
              </p>
              <div className="coin-lab-pillar-rule">PB · SBT-style credential · portable</div>
            </article>
            <article className="coin-lab-pillar">
              <span className="coin-lab-pillar-ordinal">2 / Instrument</span>
              <h3>APT Coin — economic instrument</h3>
              <p>
                A defined arrangement for economic interaction: purpose, terms, participants,
                settlement rules. Conditional &mdash; purpose undecided until a real coordination problem is
                evidenced.
              </p>
              <div className="coin-lab-pillar-rule">Proposed · conditional · no balances</div>
            </article>
            <article className="coin-lab-pillar">
              <span className="coin-lab-pillar-ordinal">3 / Finding</span>
              <h3>Intelligence Engine — findings</h3>
              <p>
                Interprets relationships between identity, credentials, productive activity,
                institutional records, and economic interactions. The engine assesses; the authorized
                party decides.
              </p>
              <div className="coin-lab-pillar-rule">Assesses · recommends · never decides</div>
            </article>
          </div>
        </section>

        <section className="coin-lab-section">
          <div className="coin-lab-section-rule">
            <span className="coin-lab-section-label">Central relationship</span>
            <h2 className="coin-lab-section-title">Identity &rarr; Contribution &rarr; Attestation &rarr; Economic interaction</h2>
          </div>
          <p className="coin-lab-relationship-note">
            <strong>Identity &rarr; Contribution &rarr; Attestation &rarr; Economic interaction.</strong> Each
            transition has its own rules; none is automatic.
          </p>
          <div className="coin-lab-relationship">
            <div className="coin-lab-relation-node">
              <span className="coin-lab-relation-node-index">01</span>
              <span className="coin-lab-relation-node-name">Identity</span>
              <span className="coin-lab-relation-node-rule">Participant holds &amp; presents credentials</span>
            </div>
            <div className="coin-lab-relation-node">
              <span className="coin-lab-relation-node-index">02</span>
              <span className="coin-lab-relation-node-name">Contribution</span>
              <span className="coin-lab-relation-node-rule">Attributed productive activity, bounded scope</span>
            </div>
            <div className="coin-lab-relation-node">
              <span className="coin-lab-relation-node-index">03</span>
              <span className="coin-lab-relation-node-name">Attestation</span>
              <span className="coin-lab-relation-node-rule">Issuer-bound claim, consent-based, scoped</span>
            </div>
            <div className="coin-lab-relation-node">
              <span className="coin-lab-relation-node-index">04</span>
              <span className="coin-lab-relation-node-name">Economic interaction</span>
              <span className="coin-lab-relation-node-rule">Conditional instrument; party decides</span>
            </div>
          </div>
        </section>

        <section className="coin-lab-section">
          <div className="coin-lab-section-rule">
            <span className="coin-lab-section-label">Boundaries</span>
            <h2 className="coin-lab-section-title">What Intelligence is not</h2>
          </div>
          <div className="coin-lab-boundaries">
            <div className="coin-lab-boundary-item">
              <span className="coin-lab-boundary-term">Credentials are not custody</span>
              <span className="coin-lab-boundary-desc">Participants retain and present them.</span>
            </div>
            <div className="coin-lab-boundary-item">
              <span className="coin-lab-boundary-term">No coin balances or transfers</span>
              <span className="coin-lab-boundary-desc">No transfers, token rewards, wages, or coin-gated access.</span>
            </div>
            <div className="coin-lab-boundary-item">
              <span className="coin-lab-boundary-term">No universal reputation score</span>
              <span className="coin-lab-boundary-desc">A credential is not authority, credit, or ownership.</span>
            </div>
            <div className="coin-lab-boundary-item">
              <span className="coin-lab-boundary-term">The engine recommends</span>
              <span className="coin-lab-boundary-desc">The authorized financing party decides.</span>
            </div>
          </div>
        </section>

        <p className="coin-lab-footer-note">
          Browser-local demo. Synthetic records stay in this browser. No coin balances, transfers, rewards,
          wages, or coin-gated access exist here.
        </p>
      </div>
    </WorkspaceLayout>
  );
}
