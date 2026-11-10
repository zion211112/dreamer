import { Link } from 'wouter';
import { PageHead } from '@/components/PageHead';
import { PILOTS, homeMetrics } from '../data';
import '../styles/workbench.css';

export function Workbench() {
  const metrics = homeMetrics();
  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow="APT-LABS / Workbench"
          title="Workbench"
          subtitle="Five pilot lanes. Published rates in KES; local stewardship, work stays in the community."
        />

        <div className="wb-metrics">
          <div className="wb-metric">
            <span className="wb-metric-label">Published Lanes</span>
            <span className="wb-metric-value wb-metric-value--canon">
              {metrics.publishedLanes}
            </span>
          </div>
          <div className="wb-metric">
            <span className="wb-metric-label">Total Capital Committed</span>
            <span className="wb-metric-value wb-metric-value--proposed">
              KES {metrics.totalCapital.toLocaleString('en-KE')}
            </span>
          </div>
          <div className="wb-metric">
            <span className="wb-metric-label">Active Undertakings</span>
            <span className="wb-metric-value wb-metric-value--caution">
              {metrics.activeCount}
            </span>
          </div>
        </div>

        <section>
          <h2 className="wb-section-title">Pilot lanes</h2>
          <div className="wb-paths">
            {PILOTS.map((pilot) => (
              <Link
                key={pilot.key}
                href={pilot.href}
                className="wb-path-row"
                aria-label={pilot.label}
              >
                <div>
                  <h3 className="wb-path-label">{pilot.label}</h3>
                  <p className="wb-path-character">{pilot.character}</p>
                </div>
                <span className="wb-path-meta">{pilot.location}</span>
                <span className={`wb-path-status ${pilot.status === 'published' ? 'wb-path-status--authorized' : 'wb-path-status--caution'}`}>
                  {pilot.status === 'published' ? 'Published' : 'Illustrative'}
                </span>
                <span className="wb-path-action">
                  {pilot.status === 'published' ? 'Open lane' : 'Register pilot'}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="wb-terms">
          <p className="wb-terms-line">
            Published rates in KES before work is claimed. Stewards set their own terms;
            the workbench coordinates delivery, never extracts.
          </p>
        </section>
      </div>
    </div>
  );
}
