import { Link } from 'wouter';
import { PageHead } from '@/components/PageHead';
import { PILOTS } from '../data';
import '../styles/workbench.css';

export function Workbench() {
  return (
    <div className="wb-root">
      <PageHead
        eyebrow="APT-LABS / WORKBENCH"
        title="Workbench"
        subtitle="Five pilot lanes. Published rates in KES; local stewardship, work stays in the community."
      />

      <section className="wb-pilots">
        <h2 className="wb-section-title">Pilot lanes</h2>
        <div className="wb-paths">
          {PILOTS.map((pilot) => (
            <Link key={pilot.key} href={pilot.href} className="wb-path-card" aria-label={pilot.label}>
              <h3 className="wb-path-title">{pilot.label}</h3>
              <p className="wb-path-summary">{pilot.summary}</p>
              <span className="wb-path-meta">{pilot.location} · {pilot.character}</span>
              <span className="wb-path-action">{pilot.action}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wb-terms">
        <p className="wb-terms-line">
          Every lane publishes its rates in KES before work is claimed. Stewards set their own terms;
          the workbench coordinates delivery, never extracts.
        </p>
      </section>
    </div>
  );
}
