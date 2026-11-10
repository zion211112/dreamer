import { CSSProperties } from 'preact';
import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';

const pillarStyle: CSSProperties = {
  border: '1px solid var(--muted)',
  borderRadius: 'var(--radius-1)',
  padding: 'var(--space-6)',
};

const headingStyle: CSSProperties = {
  color: 'var(--fg)',
  fontFamily: 'var(--serif)',
  fontSize: 'var(--step-2)',
  margin: '0 0 var(--space-3) 0',
};

const bodyStyle: CSSProperties = {
  color: 'var(--muted)',
  fontSize: 'var(--step-0)',
  lineHeight: '1.5',
  margin: 0,
};

export function AptCoinLab() {
  return (
    <WorkspaceLayout currentContext="intelligence:coin-lab">
      <div className="apt-coin-lab-page">
        <PageHead
          eyebrow="Intelligence"
          title="Intelligence"
          subtitle="Trust and economic intelligence — identity, attestation, and economic interaction. Research-only: no balances, transfers, rewards, or coin-gated access."
        />

        <section
          className="intelligence-pillars"
          style={{
            display: 'grid',
            gap: 'var(--space-5)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
            marginTop: 'var(--space-8)',
          }}
        >
          <article className="intelligence-pillar" style={pillarStyle}>
            <h3 style={headingStyle}>APT Passport — attestations</h3>
            <p style={bodyStyle}>
              Bounded, scoped claims about a participant's productive reality — issued by an issuer,
              scoped, consent-based, portable. Not a reputation score; not authority, credit, or
              ownership.
            </p>
          </article>

          <article className="intelligence-pillar" style={pillarStyle}>
            <h3 style={headingStyle}>APT Coin — economic instrument</h3>
            <p style={bodyStyle}>
              A defined arrangement for economic interaction: purpose, terms, participants,
              settlement rules. Conditional — purpose undecided until a real coordination problem is
              evidenced.
            </p>
          </article>

          <article className="intelligence-pillar" style={pillarStyle}>
            <h3 style={headingStyle}>Intelligence Engine — findings</h3>
            <p style={bodyStyle}>
              Interprets relationships between identity, credentials, productive activity,
              institutional records, and economic interactions. The engine assesses; the authorized
              party decides.
            </p>
          </article>
        </section>

        <section className="intelligence-relationship" style={{ marginTop: 'var(--space-10)' }}>
          <h2 style={headingStyle}>Central relationship</h2>
          <p style={{ ...bodyStyle, fontFamily: 'var(--sans)', fontSize: 'var(--step-1)' }}>
            <strong>Identity → Contribution → Attestation → Economic interaction.</strong> Each
            transition has its own rules; none is automatic.
          </p>
        </section>

        <section
          className="intelligence-boundaries"
          style={{
            marginTop: 'var(--space-10)',
            borderTop: '1px solid var(--muted)',
            paddingTop: 'var(--space-6)',
          }}
        >
          <h2 style={headingStyle}>Boundaries</h2>
          <ul
            style={{
              ...bodyStyle,
              fontFamily: 'var(--sans)',
              fontSize: 'var(--step-0)',
              paddingLeft: 'var(--space-4)',
              margin: 0,
            }}
          >
            <li>
              Credentials are not custody — participants retain and present them.
            </li>
            <li>
              No coin balances, transfers, token rewards, wages, or coin-gated access.
            </li>
            <li>
              No universal reputation score; a credential is not authority, credit, or ownership.
            </li>
            <li>
              The engine recommends; the authorized financing party decides.
            </li>
          </ul>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
