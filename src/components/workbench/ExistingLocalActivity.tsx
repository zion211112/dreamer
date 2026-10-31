import type { LocalWorkApplication } from '../../lib/local-workbench';
import type { WorkBriefDraft } from '../../lib/local-workflows';

export function ExistingLocalActivity({
  briefs,
  applications,
}: {
  briefs: readonly WorkBriefDraft[];
  applications: readonly LocalWorkApplication[];
}) {
  return (
    <details className="workbench-sim-legacy">
      <summary>Existing local activity <span>{briefs.length + applications.length}</span></summary>
      {briefs.length === 0 && applications.length === 0 ? (
        <p>No saved briefs or applications.</p>
      ) : (
        <div className="workbench-sim-legacy-list">
          {briefs.map(brief => (
            <article key={brief.id}>
              <span>WORK BRIEF · READ ONLY</span>
              <strong>{brief.title || 'Untitled brief'}</strong>
              <small>Updated {new Date(brief.updatedAt).toLocaleDateString()}</small>
            </article>
          ))}
          {applications.map(application => (
            <article key={application.id}>
              <span>APPLICATION · READ ONLY</span>
              <strong>{application.opportunityId}</strong>
              <small>{application.status.replace('_', ' ')} · {new Date(application.updatedAt).toLocaleDateString()}</small>
            </article>
          ))}
        </div>
      )}
    </details>
  );
}
