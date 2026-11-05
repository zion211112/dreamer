import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';

export interface RecordSelection {
  id: string;
  type: string;
  label: string;
  module: string;
}

export interface EvidenceGap {
  id: string;
  label: string;
  severity: 'caution' | 'risk';
  description: string;
}

export interface ContextAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
}

export interface GateStatus {
  label: string;
  state: 'pass' | 'fail' | 'pending' | 'blocked';
  detail?: string;
}

export interface RecordInspectorProps {
  selection: RecordSelection | null;
  relationships: Array<{ label: string; target: string; type: string }>;
  evidenceGaps: EvidenceGap[];
  contextActions: ContextAction[];
  gateStatus: GateStatus[];
  renderRelationships?: (relationships: Array<{ label: string; target: string; type: string }>) => ComponentChildren;
  renderEvidenceGaps?: (gaps: EvidenceGap[]) => ComponentChildren;
  renderContextActions?: (actions: ContextAction[]) => ComponentChildren;
  renderGateStatus?: (gates: GateStatus[]) => ComponentChildren;
}

export function RecordInspector({
  selection,
  relationships,
  evidenceGaps,
  contextActions,
  gateStatus,
  renderRelationships,
  renderEvidenceGaps,
  renderContextActions,
  renderGateStatus,
}: RecordInspectorProps) {
  if (!selection) return null;

  useEffect(() => {
    document.body.classList.add('has-record-inspector');
    return () => document.body.classList.remove('has-record-inspector');
  }, [selection]);

  return (
    <aside className="field-studio-inspector" aria-label={`Record inspector: ${selection.label}`}>
      <header className="field-studio-pane-heading">
        <span>INSPECTOR</span>
        <span>{selection.module.toUpperCase()}</span>
      </header>
      <p className="field-studio-pane-kicker">APT-LABS / RECORD</p>
      <h2>{selection.label}</h2>
      <p className="field-studio-pane-type">{selection.type} · {selection.id}</p>

      {relationships.length > 0 && (
        <section className="field-inspector-section">
          <span className="field-studio-section-label">RELATIONSHIPS</span>
          {renderRelationships
            ? renderRelationships(relationships)
            : (
              <ul className="field-inspector-relationships">
                {relationships.map((rel, i) => (
                  <li key={i}>
                    <span className="field-inspector-rel-type">{rel.type}</span>
                    <span className="field-inspector-rel-label">{rel.label}</span>
                    <span className="field-inspector-rel-target">{rel.target}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}

      {evidenceGaps.length > 0 && (
        <section className="field-inspector-section">
          <span className="field-studio-section-label">EVIDENCE GAPS</span>
          {renderEvidenceGaps
            ? renderEvidenceGaps(evidenceGaps)
            : (
              <ul className="field-inspector-gaps">
                {evidenceGaps.map((gap, i) => (
                  <li key={i} className={`field-inspector-gap ${gap.severity}`}>
                    <span className="field-inspector-gap-badge">{gap.severity.toUpperCase()}</span>
                    <span className="field-inspector-gap-label">{gap.label}</span>
                    <span className="field-inspector-gap-desc">{gap.description}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}

      {gateStatus.length > 0 && (
        <section className="field-inspector-section">
          <span className="field-studio-section-label">GATE STATUS</span>
          {renderGateStatus
            ? renderGateStatus(gateStatus)
            : (
              <ul className="field-inspector-gates">
                {gateStatus.map((gate, i) => (
                  <li key={i} className={`field-inspector-gate ${gate.state}`}>
                    <span className="field-inspector-gate-state">{gate.state}</span>
                    <span className="field-inspector-gate-label">{gate.label}</span>
                    {gate.detail && <span className="field-inspector-gate-detail">{gate.detail}</span>}
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}

      {contextActions.length > 0 && (
        <section className="field-inspector-section">
          <span className="field-studio-section-label">CONTEXT ACTIONS</span>
          {renderContextActions
            ? renderContextActions(contextActions)
            : (
              <div className="field-inspector-actions">
                {contextActions.map((action, i) => (
                  <button
                    key={i}
                    className={`field-inspector-action ${action.variant || 'quiet'} ${action.disabled ? 'disabled' : ''}`}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
        </section>
      )}

      {(relationships.length === 0 && evidenceGaps.length === 0 && gateStatus.length === 0 && contextActions.length === 0) && (
        <p className="field-inspector-empty">No inspector data for this record.</p>
      )}
    </aside>
  );
}