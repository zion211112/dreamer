import { useState } from 'preact/hooks';
import { Link, useParams } from 'wouter';
import { PageHead } from '@/components/PageHead';
import {
  pilotByKey,
  workItemsForPilot,
  type PilotKey,
  type GateState,
  type WorkItem,
  GATE_LABELS,
  GATE_COLORS,
  GATE_FORK,
  CALL_SHEET_STEP,
  ALL_GATE_STATES,
  NEXT_GATE,
} from '../data';
import '../styles/workbench.css';

function CrewInline({ crew }: { crew: WorkItem['crew'] }) {
  const tags: [string, string, string][] = [
    ['anchor', crew.anchor ?? '—', ''],
    ['builder', crew.builder ?? '—', 'wb-crew-tag--builder'],
    ['apprentice', crew.apprentice ?? '—', 'wb-crew-tag--apprentice'],
  ];
  return (
    <div className="wb-crew-inline">
      {tags.map(([role, name, extra]) => (
        <span key={role} className={`wb-crew-tag ${extra}`}>
          {role[0].toUpperCase()}·{name}
        </span>
      ))}
    </div>
  );
}

function DetailPanel({ item }: { item: WorkItem }) {
  const nextGate = NEXT_GATE[item.gate];
  return (
    <div className="wb-item-detail">
      <div className="wb-item-detail-grid">
        {/* Call sheet */}
        <div className="wb-detail-section">
          <h4 className="wb-detail-heading">Call Sheet</h4>
          {item.callSheet ? (
            <>
              <p className="wb-detail-note">{item.callSheet.scope}</p>
              <div>
                <span className="wb-detail-sub">BOM</span>
                <ul className="wb-detail-list">
                  {item.callSheet.bom.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              <div>
                <span className="wb-detail-sub">Acceptance</span>
                <ul className="wb-detail-list">
                  {item.callSheet.acceptance.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <p className="wb-detail-note">No call sheet yet.</p>
          )}
        </div>

        {/* Capital */}
        <div className="wb-detail-section">
          <h4 className="wb-detail-heading">Capital</h4>
          <div className="wb-capital-field">
            <span className="wb-capital-label">KES</span>
            <span className="wb-capital-value">
              {item.capital.financial.toLocaleString('en-KE')}
            </span>
          </div>
          {item.capital.materials.length > 0 && (
            <div className="wb-capital-field">
              <span className="wb-capital-label">Materials</span>
              <span className="wb-capital-value">{item.capital.materials.join(', ')}</span>
            </div>
          )}
          {item.capital.conditions.length > 0 && (
            <div className="wb-capital-field">
              <span className="wb-capital-label">Conditions</span>
              <span className="wb-capital-value">{item.capital.conditions.join('; ')}</span>
            </div>
          )}
          <div className="wb-capital-field">
            <span className="wb-capital-label">Deployed</span>
            <span
              className={`wb-capital-value ${item.capital.deployed ? 'wb-capital-value--deployed' : 'wb-capital-value--pending'}`}
            >
              {item.capital.deployed ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="wb-capital-field">
            <span className="wb-capital-label">Escrow</span>
            <span
              className={`wb-capital-value ${item.capital.escrowed ? 'wb-capital-value--deployed' : 'wb-capital-value--pending'}`}
            >
              {item.capital.escrowed ? 'Locked' : 'Open'}
            </span>
          </div>
        </div>

        {/* Verification */}
        <div className="wb-detail-section">
          <h4 className="wb-detail-heading">Verification</h4>
          {item.verification ? (
            <>
              <p className="wb-detail-note">
                {item.verification.telemetrySource || 'Attestation on file'}
              </p>
              <p className="wb-detail-note">
                Attestation: <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>{item.verification.attestationId}</span>
              </p>
              <Link to="/workspace/records/roll" className="wb-records-link">
                View in Records →
              </Link>
            </>
          ) : (
            <p className="wb-detail-note">Not yet verified.</p>
          )}
        </div>

        {/* Next step */}
        <div className="wb-detail-section">
          <h4 className="wb-detail-heading">Next Step</h4>
          {nextGate ? (
            <>
              <p className="wb-detail-note">
                Advance to <strong>{GATE_LABELS[nextGate]}</strong>
              </p>
              <button
                className="wb-gate-advance"
                onClick={(e) => e.stopPropagation()}
              >
                Advance to {GATE_LABELS[nextGate]}
              </button>
              {nextGate === 'in_review' && item.capital.escrowed && (
                <p className="wb-gate-advance-note">
                  Escrow active — capital locked until anchor authorization.
                </p>
              )}
            </>
          ) : (
            <p className="wb-detail-note wb-detail-note--done">
              Settled. No further gate transitions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Pilot() {
  const params = useParams<{ pilot: string }>();
  const key = (params.pilot as PilotKey) || 'benbenos';
  const pilot = pilotByKey(key);
  const allItems = pilot ? workItemsForPilot(key) : [];

  const [gateFilter, setGateFilter] = useState<GateState | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!pilot) {
    return (
      <div className="wb-root wb-page">
        <PageHead eyebrow="APT-LABS / WORKBENCH" title="Pilot not found" />
        <p className="wb-empty">No such pilot lane. Register it in the workbench to open it.</p>
      </div>
    );
  }

  const items = gateFilter === 'all' ? allItems : allItems.filter((i) => i.gate === gateFilter);
  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="wb-root">
      <div className="wb-page">
        <PageHead
          eyebrow={`Pilot ${pilot.location}`}
          title={pilot.label}
          subtitle={pilot.terms}
        />

        {/* Gate filter */}
        <div className="wb-gate-filter" role="tablist" aria-label="Filter undertakings by gate state">
          <button
            role="tab"
            aria-selected={gateFilter === 'all'}
            className={`wb-gate-filter-tab ${gateFilter === 'all' ? 'is-current' : ''}`}
            onClick={() => setGateFilter('all')}
          >
            All
            <span className="wb-gate-filter-count">{allItems.length}</span>
          </button>
          {ALL_GATE_STATES.map((gate) => {
            const count = allItems.filter((i) => i.gate === gate).length;
            if (count === 0) return null;
            return (
              <button
                key={gate}
                role="tab"
                aria-selected={gateFilter === gate}
                className={`wb-gate-filter-tab wb-gate-filter-tab--${GATE_COLORS[gate]} ${gateFilter === gate ? 'is-current' : ''}`}
                onClick={() => setGateFilter(gate)}
              >
                {GATE_LABELS[gate]}
                <span className="wb-gate-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Undertaking list */}
        <section className="wb-grid">
          <h2 className="wb-section-title">
            Undertakings
            {gateFilter !== 'all' && (
              <span className="wb-section-filter">
                {' '}{GATE_LABELS[gateFilter]} only · {items.length}
              </span>
            )}
          </h2>
          <div className="wb-paths">
            {items.map((item) => {
              const step = CALL_SHEET_STEP[item.gate];
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="wb-item-group">
                  <div
                    className={`wb-item-row ${isExpanded ? 'wb-item-row--expanded' : ''}`}
                    onClick={() => toggle(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${item.title} — ${GATE_LABELS[item.gate]}`}
                  >
                    {/* Col 1: main content */}
                    <div className="wb-item-main">
                      <h3 className="wb-item-title">{item.title}</h3>
                      <p className="wb-item-meta">
                        {item.discipline} · {item.location}
                      </p>
                      {item.callSheet && (
                        <p className="wb-call-sheet-brief">{item.callSheet.scope}</p>
                      )}
                      <CrewInline crew={item.crew} />
                    </div>

                    {/* Col 2: gate */}
                    <span className="wb-gate-group">
                      <span className={`wb-gate wb-gate--${GATE_COLORS[item.gate]}`}>
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

                    {/* Col 3: value */}
                    <span className="wb-value-group">
                      <span className="wb-item-value wb-item-value--published">
                        {item.publishedValue || '—'}
                      </span>
                      <span className="wb-escrow-state">
                        {item.capital.escrowed ? 'locked' : 'open'}
                      </span>
                    </span>

                    {/* Col 4: evidence */}
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

                    {/* Col 5: expand toggle */}
                    <span className="wb-item-expand" aria-hidden="true">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>

                  {/* Detail panel */}
                  {isExpanded && <DetailPanel item={item} />}
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="wb-empty">
                No undertakings in this lane{gateFilter !== 'all' ? ` at ${GATE_LABELS[gateFilter]}` : ''}.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
