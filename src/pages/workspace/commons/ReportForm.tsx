import type { RefObject } from 'preact';

interface CommonsReportFormProps {
  onSubmit: (event: Event) => void;
  onCancel: () => void;
  institutionNames: Record<string, string>;
  sourceConsoleDraftId: string | null;
  reportTitle: string;
  reportDetails: string;
  onReportTitleChange: (value: string) => void;
  onReportDetailsChange: (value: string) => void;
  reportInstitutionRef: RefObject<HTMLSelectElement>;
}

export function CommonsReportForm({
  onSubmit,
  onCancel,
  institutionNames,
  sourceConsoleDraftId,
  reportTitle,
  reportDetails,
  onReportTitleChange,
  onReportDetailsChange,
  reportInstitutionRef,
}: CommonsReportFormProps) {
  return (
    <form className="signal-report-form" onSubmit={onSubmit}>
      <div className="signal-form-heading">
        <div>
          <p className="eyebrow">NEW SIGNAL</p>
          <h2>What did you notice?</h2>
        </div>
      </div>
      <div className="signal-form-grid">
        <label>Institution
          <select name="institution" ref={reportInstitutionRef} required>
            <option value="">Select a registered institution</option>
            {Object.entries(institutionNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>Asset or place
          <input name="asset" placeholder="Optional · select or describe if known" />
        </label>
        <label>Location
          <input name="location" placeholder="Town, site, or building" />
        </label>
        <label className="signal-form-wide">Signal headline
          <input maxLength={120} name="title" onInput={event => onReportTitleChange((event.currentTarget as HTMLInputElement).value)} placeholder="Describe what you noticed" required value={reportTitle} />
        </label>
        <label className="signal-form-wide">What happened?
          <textarea maxLength={1200} minLength={12} name="details" onInput={event => onReportDetailsChange((event.currentTarget as HTMLTextAreaElement).value)} placeholder="Share what you saw. Keep observation separate from possible cause." required rows={3} value={reportDetails} />
        </label>
        <label>Attention
          <select name="urgency">
            <option value="routine">Routine</option>
            <option value="soon">Needs attention</option>
            <option value="urgent">Urgent · needs human review</option>
          </select>
        </label>
      </div>
      <div className="signal-form-footer">
        <span>{sourceConsoleDraftId ? 'Review and edit this observation before saving; the Console draft remains unchanged.' : 'Urgency is a reporter’s note, not an automated priority.'}</span>
        <div>
          <button className="signal-quiet-action" onClick={onCancel} type="button">Cancel</button>
          <button className="signal-primary-action" type="submit">Save signal</button>
        </div>
      </div>
    </form>
  );
}
