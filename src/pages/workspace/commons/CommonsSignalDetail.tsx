import type { FieldSignal, SignalStatus } from '../../../lib/local-workflows';

function formatSignalDate(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function signalPlace(signal: FieldSignal): string {
  const assetName = signal.assetName?.trim();
  return assetName && !assetName.toLocaleLowerCase().startsWith(signal.institutionName.toLocaleLowerCase())
    ? assetName
    : signal.institutionName;
}

function signalContext(signal: FieldSignal): string {
  const place = signalPlace(signal);
  if (place !== signal.institutionName) return `${signal.institutionName} · ${place}`;
  const location = signal.location.trim();
  return location && location !== 'Site not specified'
    ? `${signal.institutionName} · ${location}`
    : signal.institutionName;
}

const statusLabels: Record<SignalStatus, string> = {
  new: 'New',
  triaged: 'Being checked',
  brief: 'Work planning',
  resolved: 'Closed',
};

interface CommonsSignalDetailProps {
  selected: FieldSignal | null;
  isSteward: boolean;
  approvedProposal: { id: string } | null;
  onChangeStatus: (status: SignalStatus) => void;
  onOpenWorkbench: () => void;
  onOpenWorkBrief: (proposalId: string) => void;
  onSetCommonsView: (view: 'signals' | 'opportunities' | 'decisions') => void;
  onAddNote: (event: Event) => void;
  note: string;
  setNote: (note: string) => void;
}

export function CommonsSignalDetail({
  selected,
  isSteward,
  approvedProposal,
  onChangeStatus,
  onOpenWorkbench,
  onOpenWorkBrief,
  onSetCommonsView,
  onAddNote,
  note,
  setNote,
}: CommonsSignalDetailProps) {
  if (!selected) return null;

  const statusLabel = statusLabels[selected.status];

  return (
    <article className="signal-detail">
      <header className="signal-detail-head">
        <div>
          <div className="signal-detail-kickers">
            <span className={`signal-status-label signal-status-${selected.status}`}>{statusLabel}</span>
            {selected.scenario && <span className="signal-scenario-label">EXAMPLE SIGNAL</span>}
          </div>
          <h2>{selected.title}</h2>
          <p>{signalContext(selected)}</p>
          {selected.sourceConsoleDraftId && (
            <button
              className="signal-source-console-link"
              onClick={onOpenWorkbench}
              type="button"
            >
              Go to Workbench
            </button>
          )}
        </div>
        <span className="signal-updated">{selected.scenario ? 'ILLUSTRATIVE' : `UPDATED ${formatSignalDate(selected.updatedAt).toUpperCase()}`}</span>
      </header>
      <section className="signal-observation">
        <p className="eyebrow">OBSERVATION</p>
        <p>{selected.details}</p>
        {selected.scenario && <small>Illustrative record · not live or verified.</small>}
      </section>
      {selected.scenario && (
        <details aria-label="Example evidence and review boundary" className="signal-scenario-evidence">
          <summary>Evidence checks</summary>
          <dl>
            <div><dt>Suspected cause</dt><dd>{selected.suspectedCause ?? 'Unknown; not assessed.'}</dd></div>
            <div><dt>Verified priority</dt><dd>{selected.verifiedPriority === 'not-assessed' ? 'Not assessed' : 'Unknown'}</dd></div>
            <div><dt>Evidence on hand</dt><dd>{selected.evidenceOnHand?.join(' ') ?? 'No evidence attached.'}</dd></div>
            <div><dt>Missing checks</dt><dd>{selected.missingChecks?.join(' · ') ?? 'No checks documented.'}</dd></div>
          </dl>
        </details>
      )}
      <section className="signal-next-step">
        <div>
          <p className="eyebrow">NEXT STEP</p>
          <strong>
            {selected.scenario ? selected.suggestedNextStep ?? 'Review evidence with an authorized person.' :
              selected.status === 'new' ? 'Review the observation' :
              selected.status === 'triaged' ? 'Steward review before work' :
                selected.status === 'brief' ? 'Approved work brief' : 'Observation closed'}
          </strong>
          <span>{selected.scenario
            ? 'Example only · no work authorized.'
            : selected.status === 'brief' && !approvedProposal
              ? 'No approved work brief is linked.'
              : 'Steward decision required before work.'}</span>
        </div>
        {!selected.scenario && selected.status === 'new' && <button className="signal-secondary-action" onClick={() => onChangeStatus('triaged')} type="button">Move to triage</button>}
        {!selected.scenario && selected.status === 'triaged' && <button className="signal-primary-action" onClick={() => onSetCommonsView('decisions')} type="button">Open decision register</button>}
        {!selected.scenario && selected.status === 'brief' && approvedProposal && <button className="signal-primary-action" onClick={() => onOpenWorkBrief(approvedProposal.id)} type="button">Open approved work brief</button>}
        {!selected.scenario && selected.status !== 'resolved' && isSteward && <button className="signal-quiet-action" onClick={() => onChangeStatus('resolved')} type="button">Close observation</button>}
        {!selected.scenario && selected.status === 'resolved' && <button className="signal-secondary-action" onClick={() => onChangeStatus('new')} type="button">Reopen</button>}
      </section>
      <details className="signal-history">
        <summary className="signal-history-heading"><span>Activity &amp; notes</span><span>{selected.updates.length.toString().padStart(2, '0')}</span></summary>
        {selected.scenario
          ? <p className="signal-scenario-readonly">Example history is not editable.</p>
          : (
            <form className="signal-note-form" onSubmit={onAddNote}>
              <input
                aria-label="Record a work note"
                maxLength={280}
                onInput={event => setNote((event.currentTarget as HTMLInputElement).value)}
                placeholder="Evidence, next step, or open question"
                value={note}
              />
              <button className="signal-secondary-action" disabled={!note.trim()} type="submit">Add note</button>
            </form>
          )}
        <ol className="signal-update-list">
          {selected.updates.map(update => (
            <li key={update.id}>
              <time dateTime={update.createdAt}>{formatSignalDate(update.createdAt)}</time>
              <span>{update.text}</span>
            </li>
          ))}
        </ol>
      </details>
    </article>
  );
}
