import { useEffect, useState } from 'preact/hooks';
import { PageHead } from '../../components/PageHead';
import { WorkspaceLayout } from './WorkspaceLayout';
import {
  buildRecommendations,
  detectPatterns,
  forecastPilot,
  generateLearningOutputs,
  matchParticipants,
  type Forecast,
  type MatchCandidate,
  type Pattern,
  type Recommendation,
} from '@/lib/intelligence';
import { workItemsForPilot, PILOTS, type PilotKey } from '@/modules/workbench/data';

export function Intelligence() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [learning, setLearning] = useState<any[]>([]);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [recs, pats, lears] = await Promise.all([
          buildRecommendations(),
          detectPatterns(),
          generateLearningOutputs(),
        ]);
        if (cancelled) return;
        setRecommendations(recs);
        setPatterns(pats);
        setLearning(lears);

        const pilotKeys: PilotKey[] = PILOTS.map((p) => p.key);
        const forecasts = await Promise.all(pilotKeys.map((k) => forecastPilot(k)));
        if (cancelled) return;
        setForecasts(forecasts);

        // Match participants for undertakings still awaiting crew at pending_acceptance
        const items = PILOTS.flatMap((p) => workItemsForPilot(p.key));
        const pending = items.find((i) => i.gate === 'pending_acceptance');
        if (pending) {
          const result = await matchParticipants({
            undertakingId: pending.id,
            undertakingTitle: pending.title,
            requiredCapability: pending.discipline,
            pilot: pending.pilot,
            actor: 'steward',
          });
          if (!cancelled) setMatches(result);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Intelligence could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

        {/* Forecast strip */}
        <section className="intelligence-forecast" aria-label="Pilot capacity forecasts">
          <h2 className="intelligence-section-title">Capacity by pilot lane</h2>
          <div className="intelligence-forecast-grid">
            {forecasts.map((f) => (
              <article key={f.pilot} className="intelligence-forecast-card">
                <h3 className="intelligence-forecast-title">{f.pilot}</h3>
                <div className="intelligence-forecast-metrics">
                  <div className="intelligence-forecast-metric">
                    <span className="intelligence-forecast-value">{f.openCount}</span>
                    <span className="intelligence-forecast-label">Open</span>
                  </div>
                  <div className="intelligence-forecast-metric">
                    <span className="intelligence-forecast-value">{f.acceptedCount}</span>
                    <span className="intelligence-forecast-label">Accepted</span>
                  </div>
                  <div className="intelligence-forecast-metric">
                    <span className="intelligence-forecast-value">KES {f.totalCapital.toLocaleString()}</span>
                    <span className="intelligence-forecast-label">Committed</span>
                  </div>
                </div>
                <p className="intelligence-forecast-note">
                  {f.estimatedNextGate ? `Next gate: ${f.estimatedNextGate}` : 'No open work.'}
                  {' · '} Certainty: {f.uncertainty}.
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Matching */}
        <section className="intelligence-panels" aria-label="Intelligence capabilities">
          <article className="intelligence-panel intelligence-panel--matching">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">01</span>
              <h2 className="intelligence-card-title">Matching</h2>
            </header>
            <p className="intelligence-card-body">
              Matches productive participants to undertakings based on bounded claims,
              scoped credentials, and demonstrated capability. A match is a suggestion,
              not an assignment.
            </p>
            {matches.length > 0 ? (
              <div className="intelligence-match-list">
                <h4 className="intelligence-match-title">Suggested participants for open work</h4>
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
            ) : (
              <p className="intelligence-empty">No open undertakings awaiting crew at this time.</p>
            )}
          </article>

          <article className="intelligence-panel intelligence-panel--patterns">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">02</span>
              <h2 className="intelligence-card-title">Patterns</h2>
            </header>
            <p className="intelligence-card-body">
              Evidence-backed observations from recorded outcomes — where work repeatedly
              succeeds or stalls, so future undertakings can plan accordingly.
            </p>
            {patterns.length > 0 ? (
              <ul className="intelligence-pattern-list">
                {patterns.map((p) => (
                  <li key={p.id} className="intelligence-pattern-item">
                    <h4 className="intelligence-pattern-title">{p.title}</h4>
                    <p className="intelligence-pattern-desc">{p.description}</p>
                    <p className="intelligence-pattern-evidence">{p.evidence.join(' ')}</p>
                    <span className="intelligence-pattern-severity">{p.severity}</span>
                    <p className="intelligence-pattern-rec"><strong>Recommendation:</strong> {p.recommendation}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="intelligence-empty">No significant patterns detected yet.</p>
            )}
          </article>

          <article className="intelligence-panel intelligence-panel--learning">
            <header className="intelligence-card-head">
              <span className="intelligence-card-index">03</span>
              <h2 className="intelligence-card-title">Learning</h2>
            </header>
            <p className="intelligence-card-body">
              Accepted outcomes converted into reusable knowledge — lessons, designs,
              and criteria that feed Commons scoping and Workbench call sheets.
            </p>
            {learning.length > 0 ? (
              <ul className="intelligence-learning-list">
                {learning.map((l) => (
                  <li key={l.id} className="intelligence-learning-item">
                    <h4 className="intelligence-learning-title">{l.title}</h4>
                    <p className="intelligence-learning-lesson">{l.lesson}</p>
                    {l.reusableDesignId && <span className="intelligence-learning-design">Reusable design: {l.reusableDesignId}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="intelligence-empty">No learning captured yet.</p>
            )}
          </article>
        </section>

        {/* Decision support */}
        <section className="intelligence-recommendations" aria-label="Decision support">
          <h2 className="intelligence-section-title">Decision support</h2>
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

        {/* Boundaries */}
        <section className="intelligence-boundaries" aria-labelledby="int-bound-title">
          <header className="intelligence-card-head">
            <span className="intelligence-card-index">04</span>
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
          intelligence only — no coin behavior here.
        </p>
      </div>
    </WorkspaceLayout>
  );
}
