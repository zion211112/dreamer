import { useParams } from 'wouter';
import { PageHead } from '@/components/PageHead';
import {
  pilotByKey,
  workItemsForPilot,
  type PilotKey,
  GATE_LABELS,
  GATE_COLORS,
  GATE_FORK,
  CALL_SHEET_STEP,
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
  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow={`Pilot ${pilot.location}`}
          title={pilot.label}
          subtitle={pilot.terms}
        />

        <section className="wb-grid">
          <h2 className="wb-section-title">Undertakings</h2>
          <div className="wb-paths">
            {items.map((item) => {
              const step = CALL_SHEET_STEP[item.gate];
              return (
                <div key={item.id} className="wb-item-row">
                  <div>
                    <h3 className="wb-item-title">{item.title}</h3>
                    <p className="wb-item-meta">
                      {item.discipline} {item.location}
                    </p>
                    {item.callSheet && (
                      <p className="wb-call-sheet-brief">{item.callSheet.scope}</p>
                    )}
                  </div>
                  <span className="wb-gate-group">
                    <span
                      className={`wb-gate wb-gate--${GATE_COLORS[item.gate]}`}
                    >
                      <span className="wb-step">{step.step}</span>
                      {GATE_FORK[item.gate] ? '└─ ' : ''}
                      {GATE_LABELS[item.gate]}
                    </span>
                    {item.callSheet && (
                      <span className="wb-tag wb-tag--call-sheet">CS</span>
                    )}
                    {item.credential && (
                      <span className="wb-tag wb-tag--credential">{item.credential}</span>
                    )}
                  </span>
                  <span className="wb-value-group">
                    <span className="wb-item-value wb-item-value--published">
                      {item.publishedValue || '—'}
                    </span>
                    {item.capital.escrowed !== undefined && (
                      <span className="wb-escrow-state">
                        {item.capital.escrowed ? 'locked' : 'open'}
                      </span>
                    )}
                  </span>
                  <span className="wb-evidence-group">
                    <span className="wb-evidence">
                      {item.evidence.map((layer) => (
                        <span
                          key={layer}
                          className={`wb-evidence-ring wb-evidence-ring--${layer}`}
                        />
                      ))}
                    </span>
                    {item.verification && (
                      <span className="wb-verification-state">
                        {item.verification.attestationId}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="wb-empty">No undertakings in this lane yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

