import { Link } from 'wouter';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { createConsoleSignalLink } from '../../../lib/local-workflows';
import type { ConsoleSnapshot, SchoolTenderDraft } from '../../../lib/school-console-storage';

interface TenderDraftViewProps {
  snapshot: ConsoleSnapshot;
  assetName: string;
  setAssetName: (value: string) => void;
  tenderNeed: string;
  setTenderNeed: (value: string) => void;
  assetBuildCost: string;
  setAssetBuildCost: (value: string) => void;
  createDraft: (event: Event) => Promise<void>;
  discardDraft: (draftId: string) => Promise<void>;
  canWrite: boolean;
}

export function TenderDraftView({
  snapshot,
  assetName,
  setAssetName,
  tenderNeed,
  setTenderNeed,
  assetBuildCost,
  setAssetBuildCost,
  createDraft,
  discardDraft,
  canWrite,
}: TenderDraftViewProps) {
  return (
    <section className="sc-module" aria-labelledby="sc-tenders-title">
      <div className="sc-module-head">
        <div>
          <p className="sc-eyebrow">SCHOOL OPERATIONS <span>/</span> PRIVATE DRAFTS</p>
          <h2 id="sc-tenders-title">Tender drafts</h2>
          <p className="sc-module-description">Record a school need for local review. Nothing is published or sent to the APT-LABS Workbench.</p>
        </div>
        <span className="sc-example-stamp">NOT PUBLISHED</span>
      </div>

      <form className="sc-tender-form" onSubmit={createDraft}>
        <div className="sc-form-heading"><div><span className="sc-eyebrow">NEW LOCAL RECORD</span><h3>Describe the need</h3></div><span className="sc-data-note">No learner details</span></div>
        <label className="sc-field sc-field-wide" htmlFor="sc-asset-name">Asset or need title
          <Input id="sc-asset-name" onChange={setAssetName} value={assetName} disabled={!canWrite} placeholder="e.g. Classroom desks for repair" />
        </label>
        <label className="sc-field sc-field-wide" htmlFor="sc-tender-need">Need and operating context
          <textarea id="sc-tender-need" disabled={!canWrite} onInput={event => setTenderNeed((event.currentTarget as HTMLTextAreaElement).value)} placeholder="Describe the service gap and the outcome needed. Avoid personal or learner information." value={tenderNeed} />
        </label>
        <label className="sc-field sc-field-cost" htmlFor="sc-build-cost">Estimated build cost <span>(KES · optional)</span>
          <Input id="sc-build-cost" min={0} step={0.01} onChange={setAssetBuildCost} value={assetBuildCost} disabled={!canWrite} placeholder="Leave blank if unknown" type="number" />
        </label>
        <div className="sc-form-actions">
          <Button disabled={!canWrite} type="submit">Save local draft <span aria-hidden="true">→</span></Button>
          <span className="sc-form-disclosure">Stored in this browser only</span>
        </div>
      </form>

      <div className="sc-results">
        <div className="sc-results-head">
          <div><span className="sc-eyebrow">THIS DEVICE</span><h3>Unpublished drafts</h3></div>
          <span><strong>{snapshot.tenderDrafts.length}</strong> {snapshot.tenderDrafts.length === 1 ? 'draft' : 'drafts'}</span>
        </div>
        {snapshot.tenderDrafts.length === 0
          ? <p className="sc-empty-state">No local tender drafts. A saved draft remains private and unpublished.</p>
          : <div className="sc-tender-list">{snapshot.tenderDrafts.map((draft: SchoolTenderDraft) => (
            <article className="sc-tender-row" id={`school-draft-${draft.id}`} key={draft.id}>
              <div className="sc-tender-row-copy">
                <span className="sc-draft-status">LOCAL DRAFT <i>/</i> UNPUBLISHED</span>
                <h4>{draft.assetName}</h4>
                <p>{draft.need}</p>
                <small>{draft.assetBuildCost ? `Estimated KES ${Number(draft.assetBuildCost).toLocaleString('en-KE')}` : 'Build cost not estimated'} <i>/</i> {new Date(draft.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="sc-tender-actions">
                <Link className="sc-review-commons" href={createConsoleSignalLink(draft.id)}>Review in Commons</Link>
                <Button className="sc-discard-button" disabled={!canWrite} onClick={() => void discardDraft(draft.id)} type="button" variant="ghost">Discard</Button>
              </div>
            </article>
          ))}</div>}
      </div>
    </section>
  );
}
