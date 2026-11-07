import { useState } from 'preact/hooks';
import { KIRINYAGA_CAPACITY_SCENARIO } from '../../lib/workbench-capacity';
import type { WorkbenchCapacityDraftInput } from '../../lib/workbench-capacity-drafts';

export interface CapacityDraftFormProps {
  candidateIds: readonly string[];
  onSave(input: WorkbenchCapacityDraftInput): void;
  onBack(): void;
  saving: boolean;
  saveError: string;
}

export function CapacityDraftForm({
  candidateIds,
  onSave,
  onBack,
  saving,
  saveError,
}: CapacityDraftFormProps) {
  const need = KIRINYAGA_CAPACITY_SCENARIO.need;
  const [title, setTitle] = useState(`${need.title} — work plan`);
  const [targetVolume, setTargetVolume] = useState(String(need.quantity));
  const [startDate, setStartDate] = useState(need.startDate);
  const [endDate, setEndDate] = useState(need.endDate);
  const candidates = candidateIds
    .map(id => KIRINYAGA_CAPACITY_SCENARIO.candidates.find(candidate => candidate.id === id))
    .filter(candidate => candidate !== undefined);
  const missingEvidence = candidates.filter(candidate => candidate.evidence.length === 0).length;
  const unknownAvailability = candidates.filter(candidate => candidate.availability === 'unknown').length;

  function submit(event: Event) {
    event.preventDefault();
    onSave({
      title,
      targetVolume: Number(targetVolume),
      startDate,
      endDate,
      candidateIds: [...candidateIds],
    });
  }

  return (
    <section aria-labelledby="capacity-draft-title" className="capacity-draft-form-panel">
      <header className="capacity-draft-heading">
        <div>
          <p className="capacity-kicker">LOCAL DRAFT / NOT AUTHORIZED</p>
          <h2 id="capacity-draft-title">Shape the work plan</h2>
        </div>
        <button className="capacity-back-button" onClick={onBack} type="button">← Back to matching</button>
      </header>
      <p className="capacity-draft-context">
        {need.title} · {need.location} · {need.quantity} {need.unit} needed
      </p>

      <ul aria-label="Shortlisted candidates" className="capacity-draft-candidates">
        {candidates.map(candidate => <li key={candidate.id}>{candidate.name}</li>)}
      </ul>

      <div className="capacity-draft-checks" role="status">
        <strong>Resolve before any real commitment</strong>
        <span>{unknownAvailability} availability {unknownAvailability === 1 ? 'check' : 'checks'} open</span>
        <span>{missingEvidence} evidence {missingEvidence === 1 ? 'gap' : 'gaps'}</span>
      </div>

      {saveError && <p className="capacity-form-error" role="alert">{saveError}</p>}

      <form className="capacity-draft-form" onSubmit={submit}>
        <label className="capacity-form-wide">
          Work plan title
          <input
            autoComplete="off"
            maxLength={120}
            onInput={event => setTitle(event.currentTarget.value)}
            required
            value={title}
          />
        </label>
        <label>
          Target volume <span>({need.unit})</span>
          <input
            inputMode="decimal"
            min="0.01"
            onInput={event => setTargetVolume(event.currentTarget.value)}
            required
            step="any"
            type="number"
            value={targetVolume}
          />
        </label>
        <label>
          Start date
          <input onInput={event => setStartDate(event.currentTarget.value)} required type="date" value={startDate} />
        </label>
        <label>
          End date
          <input onInput={event => setEndDate(event.currentTarget.value)} required type="date" value={endDate} />
        </label>
        <div className="capacity-form-actions capacity-form-wide">
          <p>Saved in this browser only. Saving does not authorize, fund, or schedule work.</p>
          <button disabled={saving || candidateIds.length === 0} type="submit">
            {saving ? 'Saving…' : 'Save local draft'}
          </button>
        </div>
      </form>
    </section>
  );
}
