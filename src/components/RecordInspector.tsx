import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { Link } from 'wouter';

export interface RecordSelection {
  id: string;
  type: string;
  label: string;
  module: string;
  href?: string;
  provenance?: {
    label: string;
    detail?: string;
    href?: string;
  } | null;
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
  relationships?: Array<{ label: string; target: string; type: string }>;
  evidenceGaps?: EvidenceGap[];
  contextActions?: ContextAction[];
  gateStatus?: GateStatus[];
  renderRelationships?: (relationships: Array<{ label: string; target: string; type: string }>) => ComponentChildren;
  renderEvidenceGaps?: (gaps: EvidenceGap[]) => ComponentChildren;
  renderContextActions?: (actions: ContextAction[]) => ComponentChildren;
  renderGateStatus?: (gates: GateStatus[]) => ComponentChildren;
  onDismiss: () => void;
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
  onDismiss,
}: RecordInspectorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreCloseRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const viewport = window.matchMedia('(max-width: 1279px)');
    const syncPresentation = () => {
      const modal = viewport.matches;
      if (!dialog.open) {
        if (modal) dialog.showModal();
        else dialog.show();
        return;
      }

      if (modal === dialog.matches(':modal')) return;
      ignoreCloseRef.current = true;
      dialog.close();
      if (modal) dialog.showModal();
      else dialog.show();
    };

    syncPresentation();
    viewport.addEventListener('change', syncPresentation);
    return () => {
      viewport.removeEventListener('change', syncPresentation);
      if (dialog.open) {
        ignoreCloseRef.current = true;
        dialog.close();
      }
    };
  }, [selection?.id]);

  useEffect(() => {
    if (!selection) return;
    document.body.classList.add('has-record-inspector');
    return () => document.body.classList.remove('has-record-inspector');
  }, [selection]);

  if (!selection) return null;

  return (
    <dialog
      aria-label={`Record details: ${selection.label}`}
      className="field-studio-inspector"
      id="record-inspector"
      onCancel={event => {
        event.preventDefault();
        onDismissRef.current();
      }}
      onClose={() => {
        if (ignoreCloseRef.current) {
          ignoreCloseRef.current = false;
          return;
        }
        onDismissRef.current();
      }}
      onClick={event => {
        if (event.target === event.currentTarget && event.currentTarget.matches(':modal')) {
          onDismissRef.current();
        }
      }}
      ref={dialogRef}
    >
      <header className="field-studio-pane-heading">
        <span>Record details</span>
        <button aria-label="Close record details" className="field-studio-inspector-close" onClick={onDismiss} type="button">
          Close
        </button>
      </header>
      <p className="field-studio-pane-kicker">{selection.module} · {selection.type}</p>
      <h2>{selection.label}</h2>
      <p className="field-studio-pane-type">Record ID: {selection.id}</p>
      {selection.href && (
        <Link className="field-studio-record-link" href={selection.href}>Open full record</Link>
      )}

      <section className="field-inspector-section">
        <h3 className="field-studio-section-label">Provenance</h3>
        {selection.provenance === undefined
          ? <p className="field-inspector-empty">Not available.</p>
          : selection.provenance === null
            ? <p className="field-inspector-empty">None recorded.</p>
            : (
              <p className="field-inspector-provenance">
                {selection.provenance.href
                  ? <Link href={selection.provenance.href}>{selection.provenance.label}</Link>
                  : selection.provenance.label}
                {selection.provenance.detail && <span>{selection.provenance.detail}</span>}
              </p>
            )}
      </section>

      <section className="field-inspector-section">
        <h3 className="field-studio-section-label">Relationships</h3>
        {relationships === undefined || relationships.length === 0
          ? <p className="field-inspector-empty">{relationships === undefined ? 'Not available.' : 'None recorded.'}</p>
          : renderRelationships
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

      <section className="field-inspector-section">
        <h3 className="field-studio-section-label">Evidence gaps</h3>
        {evidenceGaps === undefined || evidenceGaps.length === 0
          ? <p className="field-inspector-empty">{evidenceGaps === undefined ? 'Not available.' : 'None recorded.'}</p>
          : renderEvidenceGaps
            ? renderEvidenceGaps(evidenceGaps)
            : (
              <ul className="field-inspector-gaps">
                {evidenceGaps.map(gap => (
                  <li key={gap.id} className={`field-inspector-gap ${gap.severity}`}>
                    <span className="field-inspector-gap-badge">{gap.severity}</span>
                    <span className="field-inspector-gap-label">{gap.label}</span>
                    <span className="field-inspector-gap-desc">{gap.description}</span>
                  </li>
                ))}
              </ul>
            )}
      </section>

      <section className="field-inspector-section">
        <h3 className="field-studio-section-label">Gate status</h3>
        {gateStatus === undefined || gateStatus.length === 0
          ? <p className="field-inspector-empty">{gateStatus === undefined ? 'Not available.' : 'None recorded.'}</p>
          : renderGateStatus
            ? renderGateStatus(gateStatus)
            : (
              <ul className="field-inspector-gates">
                {gateStatus.map(gate => (
                  <li key={`${gate.label}-${gate.state}`} className={`field-inspector-gate ${gate.state}`}>
                    <span className="field-inspector-gate-state">{gate.state}</span>
                    <span className="field-inspector-gate-label">{gate.label}</span>
                    {gate.detail && <span className="field-inspector-gate-detail">{gate.detail}</span>}
                  </li>
                ))}
              </ul>
            )}
      </section>

      <section className="field-inspector-section">
        <h3 className="field-studio-section-label">Available actions</h3>
        {contextActions === undefined || contextActions.length === 0
          ? <p className="field-inspector-empty">{contextActions === undefined ? 'Not available.' : 'No actions were provided for this record.'}</p>
          : renderContextActions
            ? renderContextActions(contextActions)
            : (
              <div className="field-inspector-actions">
                {contextActions.map(action => (
                  <button
                    key={action.label}
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
    </dialog>
  );
}