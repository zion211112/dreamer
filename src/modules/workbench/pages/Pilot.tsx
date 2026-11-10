import { useParams } from 'wouter';
import { PageHead } from '@/components/PageHead';
import {
  pilotByKey,
  workItemsForPilot,
  type PilotKey,
  GATE_LABELS,
  GATE_COLORS,
  GATE_FORK,
} from '../data';
import '../styles/workbench.css';

export function Pilot() {
  const params = useParams<{ pilot: string }>();
  const key = (params.pilot as PilotKey) || 'benbenos';
  const pilot = pilotByKey(key);
  const items = pilot ? workItemsForPilot(key) : [];

  if (!pilot) {
    return (
      <div className="wb-root wb-page">
        <PageHead eyebrow="APT-LABS / WORKBENCH" title="Pilot not found" />
        <p className="wb-empty">No such pilot lane. Register it in the workbench to open it.</p>
      </div>
    );
  }

  const proposedCount = items.filter((i) => i.gate === 'proposed').length;
  const authorizedCount = items.filter((i) => i.gate === 'authorized').length;
  const inExecutionCount = items.filter((i) => i.gate === 'in_execution').length;

  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow={`Pilot · ${pilot.location}`}
          title={pilot.label}
          subtitle={pilot.terms}
          metrics={[
            { label: 'Proposed', value: proposedCount, state: 'proposed' },
            { label: 'Authorized', value: authorizedCount, state: 'canon' },
            { label: 'In execution', value: inExecutionCount, state: 'canon' },
          ]}
        />

        <section className="wb-grid">
          <h2 className="wb-section-title">Undertakings</h2>
          <div className="wb-paths">
            {items.map((item) => (
              <div key={item.id} className="wb-item-row">
                <div>
                  <h3 className="wb-item-title">{item.title}</h3>
                  <p className="wb-item-meta">
                    {item.discipline} · {item.location}
                  </p>
                </div>
                <span
                  className={`wb-gate wb-gate--${GATE_COLORS[item.gate]}`}
                >
                  {GATE_FORK[item.gate] ? '└─ ' : ''}
                  {GATE_LABELS[item.gate]}
                </span>
                <span className="wb-item-value wb-item-value--published">
                  {item.publishedValue || '—'}
                </span>
                <span className="wb-evidence">
                  {item.evidence.map((layer) => (
                    <span
                      key={layer}
                      className={`wb-evidence-ring wb-evidence-ring--${layer}`}
                    />
                  ))}
                </span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="wb-empty">No undertakings in this lane yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
