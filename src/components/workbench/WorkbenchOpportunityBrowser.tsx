import { Link } from 'wouter';
import type { WorkOpportunity } from '../../lib/local-workbench';
import type { LocalWorkInterest } from '../../lib/workbench-interest';

export type WorkbenchFinderView = 'find' | 'interest';

interface WorkbenchOpportunityBrowserProps {
  view: WorkbenchFinderView;
  opportunities: readonly WorkOpportunity[];
  interests: readonly LocalWorkInterest[];
  selectedOpportunityId: string | null;
  query: string;
  error: string;
  notice: string;
  mobileDetailOpen: boolean;
  onViewChange: (view: WorkbenchFinderView) => void;
  onSearchChange: (query: string) => void;
  onSelectOpportunity: (opportunityId: string) => void;
  onExpressInterest: (opportunityId: string) => void;
  onRemoveInterest: (opportunityId: string) => void;
  onBackToList: () => void;
}

function localExampleTitle(opportunity: WorkOpportunity | undefined): string {
  return opportunity?.title ?? 'Unavailable local example';
}

export function WorkbenchOpportunityBrowser({
  view,
  opportunities,
  interests,
  selectedOpportunityId,
  query,
  error,
  notice,
  mobileDetailOpen,
  onViewChange,
  onSearchChange,
  onSelectOpportunity,
  onExpressInterest,
  onRemoveInterest,
  onBackToList,
}: WorkbenchOpportunityBrowserProps) {
  const selectedOpportunity = opportunities.find(item => item.id === selectedOpportunityId);
  const selectedInterest = interests.find(item => item.opportunityId === selectedOpportunityId);
  const visibleOpportunities = opportunities.filter(opportunity => {
    const normalized = query.trim().toLocaleLowerCase();
    return !normalized
      || `${opportunity.title} ${opportunity.context} ${opportunity.discipline}`
        .toLocaleLowerCase()
        .includes(normalized);
  });

  return (
    <section className="workbench-finder">
      <nav aria-label="Workbench destinations" className="workbench-finder-nav">
        <div role="group" aria-label="Workbench views">
          <button
            aria-pressed={view === 'find'}
            onClick={() => onViewChange('find')}
            type="button"
          >Find work</button>
          <button
            aria-pressed={view === 'interest'}
            onClick={() => onViewChange('interest')}
            type="button"
          >My interest <span>{interests.length}</span></button>
        </div>
        <Link className="workbench-finder-simulation-link" href="/workspace/workbench/simulate">
          Create / simulate
        </Link>
      </nav>

      {error && <p className="workbench-finder-feedback is-error" role="alert">{error}</p>}
      {notice && <p className="workbench-finder-feedback" role="status">{notice}</p>}

      <div className={`workbench-finder-browser${mobileDetailOpen ? ' is-detail-open' : ''}`}>
        <section aria-label={view === 'find' ? 'Local work examples' : 'Your local interest'} className="workbench-finder-list">
          <header className="workbench-finder-list-head">
            <div>
              <p className="workbench-finder-kicker">{view === 'find' ? 'LOCAL EXAMPLES' : 'THIS BROWSER ONLY'}</p>
              <h2>{view === 'find' ? 'Available examples' : 'My interest'}</h2>
            </div>
            <span>{view === 'find' ? visibleOpportunities.length : interests.length}</span>
          </header>
          {view === 'find' && (
            <label className="workbench-finder-search">
              <span className="visually-hidden">Search examples by title, context, or discipline</span>
              <input
                onInput={event => onSearchChange(event.currentTarget.value)}
                placeholder="Search examples"
                type="search"
                value={query}
              />
            </label>
          )}
          {view === 'find' ? (
            visibleOpportunities.length > 0 ? (
              <ul>
                {visibleOpportunities.map(opportunity => (
                  <li key={opportunity.id}>
                    <button
                      aria-pressed={selectedOpportunityId === opportunity.id}
                      className="workbench-finder-result"
                      onClick={() => onSelectOpportunity(opportunity.id)}
                      type="button"
                    >
                      <span className="workbench-finder-kicker">LOCAL EXAMPLE · NOT LIVE</span>
                      <strong>{opportunity.title}</strong>
                      <span>{opportunity.context} · {opportunity.discipline}</span>
                      <small>{interests.some(item => item.opportunityId === opportunity.id)
                        ? 'Interest saved in this browser'
                        : 'Terms may be incomplete'}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="workbench-finder-empty">No local examples match that search.</p>
            )
          ) : interests.length > 0 ? (
            <ul>
              {interests.map(interest => {
                const opportunity = opportunities.find(item => item.id === interest.opportunityId);
                return (
                  <li key={interest.id}>
                    <button
                      aria-pressed={selectedOpportunityId === interest.opportunityId}
                      className="workbench-finder-result"
                      onClick={() => onSelectOpportunity(interest.opportunityId)}
                      type="button"
                    >
                      <span className="workbench-finder-kicker">LOCAL INTEREST · NOT SENT</span>
                      <strong>{localExampleTitle(opportunity)}</strong>
                      <span>{opportunity ? `${opportunity.context} · ${opportunity.discipline}` : 'This example is no longer available.'}</span>
                      <small>Saved {new Date(interest.createdAt).toLocaleDateString()}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : error ? (
            <p className="workbench-finder-empty">Saved interest could not be shown.</p>
          ) : (
            <p className="workbench-finder-empty">No interest saved in this browser.</p>
          )}
        </section>

        <section aria-label="Selected work example details" className="workbench-finder-detail">
          <button
            className="workbench-finder-back"
            onClick={onBackToList}
            type="button"
          >← Back to {view === 'find' ? 'examples' : 'interest'}</button>
          {selectedOpportunity ? (
            <>
              <p className="workbench-finder-kicker">LOCAL EXAMPLE · NOT A LIVE OPPORTUNITY</p>
              <h2>{selectedOpportunity.title}</h2>
              <p className="workbench-finder-context">{selectedOpportunity.context} · {selectedOpportunity.discipline}</p>
              <p className="workbench-finder-summary">{selectedOpportunity.summary}</p>
              <div className="workbench-finder-before-start">
                <strong>Before work starts</strong>
                <p>Final scope and terms must be agreed by both sides, then the institution must explicitly authorize the start.</p>
              </div>
              <details className="workbench-finder-full-details">
                <summary>View full details and open terms</summary>
                <section><h3>Scope</h3><p>{selectedOpportunity.scope}</p></section>
                <section><h3>Expected deliverables</h3><ul>{selectedOpportunity.deliverables.map(item => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Capabilities</h3><ul>{selectedOpportunity.capability.map(item => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Terms to confirm</h3><p>{selectedOpportunity.terms}</p><p>{selectedOpportunity.payment}</p><p>{selectedOpportunity.acceptance}</p></section>
              </details>
              <p className="workbench-finder-local-note">Interest is non-binding. This example and any interest are saved only in this browser; no one is contacted.</p>
              {selectedInterest ? (
                <button
                  className="workbench-finder-secondary"
                  onClick={() => onRemoveInterest(selectedOpportunity.id)}
                  type="button"
                >Remove my local interest</button>
              ) : (
                <button
                  className="workbench-finder-primary"
                  onClick={() => onExpressInterest(selectedOpportunity.id)}
                  type="button"
                >Express interest</button>
              )}
            </>
          ) : selectedInterest ? (
            <>
              <p className="workbench-finder-kicker">UNRESOLVED LOCAL EXAMPLE</p>
              <h2>Unavailable local example</h2>
              <p>The saved interest refers to an example no longer in this browser’s list. It was not submitted or accepted.</p>
              <p className="workbench-finder-local-note">This local record has not contacted anyone.</p>
              <button
                className="workbench-finder-secondary"
                onClick={() => onRemoveInterest(selectedInterest.opportunityId)}
                type="button"
              >Remove my local interest</button>
            </>
          ) : (
            <div className="workbench-finder-detail-empty">
              <p className="workbench-finder-kicker">{view === 'find' ? 'SELECT AN EXAMPLE' : 'NO LOCAL INTEREST SELECTED'}</p>
              <h2>{view === 'find' ? 'Choose work to inspect.' : 'Your saved interest stays here.'}</h2>
              <p>Local examples are not live listings. Interest is non-binding and is not sent to an institution.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
