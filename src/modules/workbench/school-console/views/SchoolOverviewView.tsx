// School overview: principal-level dashboard, tender drafts, fee notes,
// activity summary. Local-only, no fabricated data.
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';

interface SchoolOverviewViewProps {
  snapshot: ConsoleSnapshot;
  canWrite: boolean;
}

export function SchoolOverviewView({
  snapshot,
}: SchoolOverviewViewProps) {
  const markedCount = snapshot.markedPapers.length;
  const averageMark = markedCount
    ? Math.round(
        snapshot.markedPapers.reduce(
          (sum, paper) => sum + (paper.score / paper.maximum) * 100,
          0,
        ) / markedCount,
      )
    : null;
  const totalFeeKes = snapshot.feeNotes.reduce(
    (sum, note) => sum + note.amountKes,
    0,
  );

  return (
    <section className="sc-module" aria-labelledby="sc-school-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-school-title">School Overview</h2>
          <p className="sc-description">
            Institutional view · tender drafts · fee notes · marking activity
          </p>
        </div>
      </div>

      <p className="sc-state-line">
        Local records only · nothing published or shared
      </p>

      <div className="sc-metric-grid">
        <div className="sc-metric">
          <span className="sc-metric-label">Marking activity</span>
          <b className="sc-metric-value">{markedCount}</b>
          <small className="sc-metric-sub">{averageMark === null ? 'No papers yet' : `${averageMark}% average`}</small>
        </div>
        <div className="sc-metric">
          <span className="sc-metric-label">Tender drafts</span>
          <b className="sc-metric-value">{snapshot.tenderDrafts.length}</b>
          <small className="sc-metric-sub">Unpublished · local only</small>
        </div>
        <div className="sc-metric">
          <span className="sc-metric-label">Fee notes</span>
          <b className="sc-metric-value">{snapshot.feeNotes.length}</b>
          <small className="sc-metric-sub">KES {totalFeeKes.toLocaleString('en-KE')} total</small>
        </div>
        <div className="sc-metric">
          <span className="sc-metric-label">Completed tasks</span>
          <b className="sc-metric-value">{snapshot.completedTasks.length}</b>
          <small className="sc-metric-sub">Teacher checklist items</small>
        </div>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Tender drafts</h3>
          </div>
          <span className="sc-data-note">{snapshot.tenderDrafts.length} unpublished</span>
        </div>

        {snapshot.tenderDrafts.length === 0 ? (
          <p className="sc-empty-state">
            No local tender drafts. Create one in Tender Drafts.
          </p>
        ) : (
          <div className="sc-tender-list">
            {snapshot.tenderDrafts.map((draft) => (
              <article className="sc-tender-row" key={draft.id}>
                <div className="sc-tender-row-copy">
                  <h4>{draft.assetName}</h4>
                  <p>{draft.need}</p>
                  <small>
                    {draft.assetBuildCost
                      ? `Est. KES ${Number(draft.assetBuildCost).toLocaleString('en-KE')}`
                      : 'Build cost not estimated'
                    } / {new Date(draft.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Fee notes</h3>
          </div>
          <span className="sc-data-note">Local fee records</span>
        </div>

        {snapshot.feeNotes.length === 0 ? (
          <p className="sc-empty-state">
            No fee notes recorded.
          </p>
        ) : (
          <div className="sc-fee-list">
            {snapshot.feeNotes.map((note) => (
              <div className="sc-fee-row" key={note.id}>
                <span>{note.description}</span>
                <b>KES {note.amountKes.toLocaleString('en-KE')}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Recent marking</h3>
          </div>
          <span className="sc-data-note">{markedCount} paper{markedCount === 1 ? '' : 's'}</span>
        </div>

        {markedCount === 0 ? (
          <p className="sc-empty-state">
            No marked papers yet. Teachers can mark in Kenyan Marking.
          </p>
        ) : (
          <div className="sc-result-list">
            {snapshot.markedPapers.slice(0, 5).map((paper, index) => (
              <div className="sc-result-row" key={`${paper.student}-${index}`}>
                <strong>{paper.student}</strong>
                <span>{paper.marksByQuestion.map((m, i) => `Q${i + 1}: ${m}`).join(', ')}</span>
                <b className="sc-result-score">{paper.score}<i> / {paper.maximum}</i></b>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
