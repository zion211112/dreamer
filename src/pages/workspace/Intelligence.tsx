import { useEffect, useState } from 'preact/hooks';
import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';
import { Button } from '@/components/ui/Button';
import { buildRecommendations, matchParticipants, type Recommendation, type MatchCandidate } from '@/lib/intelligence';

export function Intelligence() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const recs = await buildRecommendations();
        setRecommendations(recs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Recommendations could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleMatch() {
    setLoading(true);
    setError('');
    try {
      const result = await matchParticipants({
        undertakingId: 'undertaking-match-demo',
        undertakingTitle: 'Sample undertaking',
        requiredCapability: 'Fabrication',
        pilot: 'minihydro' as const,
        actor: 'steward',
      });
      setMatches(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching could not be run.');
    } finally {
      setLoading(false);
    }
  }

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

        {error && <p className="intelligence-error" role="alert">{error}</p>}

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
            <div className="intelligence-matching-actions">
              <Button
                onClick={handleMatch}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Matching…' : 'Run participant match'}
              </Button>
              {matches.length > 0 && (
                <div className="intelligence-match-list">
                  <h4 className="intelligence-match-title">Matched participants (suggestions only)</h4>
                  <ul className="intelligence-match-items">
                    {matches.map((m) => (
                      <li key={m.entityId} className="intelligence-match-item">
                        <span className="intelligence-match-name">{m.name}</span>
                        <span className="intelligence-match-role">{m.role}</span>
                        <span className="intelligence-match-score">{m.score}</span>
                        <span className="intelligence-match-reason">{m.reason}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="intelligence-match-note">
                    A match is a suggestion, not an assignment. The authorized party decides.
                  </p>
                </div>
              )}
            </div>
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

        <section className="intelligence-recommendations" aria-label="Recommendations">
          <h2 className="intelligence-section-title">Recommendations</h2>
          {loading && <p className="intelligence-loading">Computing recommendations…</p>}
          {recommendations.length === 0 && !loading && (
            <p className="intelligence-empty">No active recommendations at this time.</p>
          )}
          {recommendations.map((rec) => (
            <article key={rec.id} className="intelligence-recommendation">
              <h3 className="intelligence-rec-title">{rec.title}</h3>
              <p className="intelligence-rec-what"><strong>What:</strong> {rec.what}</p>
              <p className="intelligence-rec-why"><strong>Why:</strong> {rec.why}</p>
              <p className="intelligence-rec-based"><strong>Based on:</strong> {rec.basedOn.join(', ')}</p>
              <p className="intelligence-rec-certainty"><strong>Certainty:</strong> {rec.certainty}</p>
              <p className="intelligence-rec-decides"><strong>Who decides:</strong> {rec.whoDecides}</p>
              {rec.alternatives.length > 0 && (
                <p className="intelligence-rec-alternatives"><strong>Alternatives:</strong> {rec.alternatives.join('; ')}</p>
              )}
              {rec.counterEvidence.length > 0 && (
                <p className="intelligence-rec-counter"><strong>Counter-evidence:</strong> {rec.counterEvidence.join('; ')}</p>
              )}
              <p className="intelligence-rec-note">
                The engine recommends; the authorized party decides. No universal score, no coin behavior, no custody.
              </p>
            </article>
          ))}
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