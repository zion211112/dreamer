import { Link } from 'wouter';
import { PageHead } from '@/components/PageHead';
import { PILOTS, homeMetrics, workItemsForPilot } from '../data';

export function Workbench() {
  const m = homeMetrics();
  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow="APT-LABS / Workbench"
          title="Workbench"
          subtitle="Five lanes. Real rates, real stewards, real work. The bench coordinates — never extracts."
        />

        <div className="wb-metrics">
          <div className="wb-metric">
            <span className="wb-metric-label">Lanes live</span>
            <span className="wb-metric-value wb-metric-value--canon">{m.publishedLanes}</span>
          </div>
          <div className="wb-metric wb-metric--hero">
            <span className="wb-metric-label">Capital on the bench</span>
            <span className="wb-metric-value wb-metric-value--proposed">
              KES&nbsp;{m.totalCapital.toLocaleString('en-KE')}
            </span>
          </div>
          <div className="wb-metric">
            <span className="wb-metric-label">Undertakings open</span>
            <span className="wb-metric-value wb-metric-value--caution">{m.activeCount}</span>
          </div>
        </div>

        <section>
          <h2 className="wb-section-title">Lanes</h2>
          <div className="wb-paths">
            {PILOTS.map((pilot) => {
              const items = workItemsForPilot(pilot.key);
              const open = items.filter((w) => w.gate !== 'accepted');
              const totalCap = open.reduce((s, w) => s + w.capital.financial, 0);
              const hasLive = open.length > 0;
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
                      {hasLive && (
                        <span className="wb-path-live">
                          {' '}· {open.length} open{totalCap > 0 && ` · KES ${totalCap.toLocaleString('en-KE')}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`wb-path-status ${isIllustrative ? 'wb-path-status--illustrative' : 'wb-path-status--published'}`}
                  >
                    {isIllustrative ? 'Register' : 'Live'}
                  </span>
                  <span className="wb-path-action">
                    {isIllustrative ? 'Open slot →' : 'Enter →'}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="wb-terms-line">
          Rates published before work is claimed. Stewards set terms; the bench keeps the record, never the surplus.
        </p>
      </div>
    </div>
  );
}
