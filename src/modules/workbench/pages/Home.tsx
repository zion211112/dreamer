import { Link } from 'wouter';
import { PageHead } from '@/components/PageHead';
import { PILOTS, homeMetrics, totalCommittedCapital, workItemsForPilot } from '../data';

export function Workbench() {
  const m = homeMetrics();
  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow="APT-LABS / Workbench"
          title="Workbench"
          subtitle="Demo lanes with example rates, stewards, and work. The bench coordinates — never extracts."
        />

        <div className="wb-metrics">
          <div className="wb-metric">
            <span className="wb-metric-label">Illustrative metrics</span>
            <span className="wb-metric-value wb-metric-value--canon">{m.publishedLanes}</span>
          </div>
          <div className="wb-metric wb-metric--hero">
            <span className="wb-metric-label">Illustrative capital</span>
            <span className="wb-metric-value wb-metric-value--proposed">
              KES&nbsp;{m.totalCapital.toLocaleString('en-KE')}
            </span>
          </div>
          <div className="wb-metric">
            <span className="wb-metric-label">Example undertakings</span>
            <span className="wb-metric-value wb-metric-value--caution">{m.activeCount}</span>
          </div>
        </div>

        <section>
          <h2 className="wb-section-title">Lanes</h2>
          <div className="wb-paths">
            {PILOTS.map((pilot) => {
              const items = workItemsForPilot(pilot.key);
              const open = items.filter((w) => w.gate !== 'accepted');
              const totalCap = totalCommittedCapital(open);
              const hasOpen = open.length > 0;
              const isIllustrative = pilot.status === 'illustrative';

              return (
                <Link
                  key={pilot.key}
                  href={pilot.href}
                  className={`wb-path-row ${isIllustrative ? 'wb-path-row--open' : ''}`}
                  aria-label={pilot.label}
                >
                  <div className="wb-path-main">
                    <h3 className="wb-path-label">{pilot.label}</h3>
                    <p className="wb-path-character">
                      {pilot.character} · {pilot.location}
                      {hasOpen && (
                        <span className="wb-path-live">
                          {' '}· {open.length} open{totalCap > 0 && ` · KES ${totalCap.toLocaleString('en-KE')}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`wb-path-status ${isIllustrative ? 'wb-path-status--illustrative' : 'wb-path-status--published'}`}
                  >
                    {isIllustrative ? 'Illustrative example' : 'Published-state example'}
                  </span>
                  <span className="wb-path-action">
                    {isIllustrative ? 'View example →' : 'Enter example →'}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="wb-terms-line">
          Illustrative terms and rates need steward confirmation before work is claimed. The bench keeps the record, never the surplus.
        </p>
      </div>
    </div>
  );
}
