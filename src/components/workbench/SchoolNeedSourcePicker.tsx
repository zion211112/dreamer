import type { SchoolNeedDraft } from '../../lib/workbench-simulation';

export function SchoolNeedSourcePicker({
  drafts,
  selectedId,
  onSelect,
}: {
  drafts: readonly SchoolNeedDraft[];
  selectedId: string;
  onSelect: (draft: SchoolNeedDraft) => void;
}) {
  if (drafts.length === 0) {
    return (
      <section aria-labelledby="school-need-picker-title" className="workbench-sim-source-picker">
        <p className="workbench-sim-kicker">01 / SOURCE</p>
        <h2 id="school-need-picker-title">Choose a school need</h2>
        <p>No eligible need drafts are available. Create a titled, non-learner need in School Console, then return here.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="school-need-picker-title" className="workbench-sim-source-picker">
      <p className="workbench-sim-kicker">01 / SOURCE</p>
      <h2 id="school-need-picker-title">Choose a school need</h2>
      <p>Only the selected title, need, and optional cost enter this simulation.</p>
      <div className="workbench-sim-source-list">
        {drafts.map(draft => (
          <button
            aria-pressed={draft.id === selectedId}
            className={draft.id === selectedId ? 'is-selected' : ''}
            key={draft.id}
            onClick={() => onSelect(draft)}
            type="button"
          >
            <span className="workbench-sim-source-title">{draft.assetName}</span>
            <span className="workbench-sim-source-need">{draft.need}</span>
            <span className="workbench-sim-source-cost">
              {draft.assetBuildCost ? `Console estimate · KES ${Number(draft.assetBuildCost).toLocaleString('en-KE')}` : 'No cost estimate'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
