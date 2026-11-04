import { useEffect, useMemo, useState } from 'preact/hooks';
import { WORK_OPPORTUNITIES } from '../../lib/local-workbench';
import {
  expressLocalWorkInterest,
  readLocalWorkInterests,
  removeLocalWorkInterest,
  type LocalWorkInterest,
} from '../../lib/workbench-interest';
import { WorkbenchOpportunityBrowser, type WorkbenchFinderView } from '../../components/workbench/WorkbenchOpportunityBrowser';
import { WorkspaceLayout } from './WorkspaceLayout';

export function WorkbenchFinder() {
  const [view, setView] = useState<WorkbenchFinderView>('find');
  const [interests, setInterests] = useState<LocalWorkInterest[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(
    WORK_OPPORTUNITIES[0]?.id ?? null,
  );
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      setInterests(readLocalWorkInterests());
    } catch (loadError) {
      setError(loadError instanceof Error
        ? loadError.message
        : 'Saved local interest could not be read. Check browser storage and reload.');
    } finally {
      setLoading(false);
    }
  }, []);

  const matchingOpportunities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return WORK_OPPORTUNITIES;
    return WORK_OPPORTUNITIES.filter(opportunity => (
      `${opportunity.title} ${opportunity.context} ${opportunity.discipline}`
        .toLocaleLowerCase()
        .includes(normalized)
    ));
  }, [query]);

  function changeView(nextView: WorkbenchFinderView) {
    setView(nextView);
    setMobileDetailOpen(false);
    setError('');
    setNotice('');
    if (nextView === 'interest') {
      setSelectedOpportunityId(interests[0]?.opportunityId ?? null);
    } else {
      setSelectedOpportunityId(matchingOpportunities[0]?.id ?? null);
    }
  }

  function search(queryValue: string) {
    setQuery(queryValue);
    const normalized = queryValue.trim().toLocaleLowerCase();
    const matching = WORK_OPPORTUNITIES.filter(opportunity => (
      !normalized
      || `${opportunity.title} ${opportunity.context} ${opportunity.discipline}`
        .toLocaleLowerCase()
        .includes(normalized)
    ));
    setSelectedOpportunityId(matching[0]?.id ?? null);
    setMobileDetailOpen(false);
  }

  function selectOpportunity(opportunityId: string) {
    setSelectedOpportunityId(opportunityId);
    setMobileDetailOpen(true);
  }

  function expressInterest(opportunityId: string) {
    setError('');
    setNotice('');
    try {
      const saved = expressLocalWorkInterest(opportunityId);
      setInterests(saved);
      setNotice('Interest saved.');
    } catch (saveError) {
      setError(saveError instanceof Error
        ? saveError.message
        : 'Local interest could not be saved. Check browser storage and try again.');
    }
  }

  function removeInterest(opportunityId: string) {
    setError('');
    setNotice('');
    try {
      const remaining = removeLocalWorkInterest(opportunityId);
      setInterests(remaining);
      if (view === 'interest' && selectedOpportunityId === opportunityId) {
        setSelectedOpportunityId(remaining[0]?.opportunityId ?? null);
        setMobileDetailOpen(false);
      }
      setNotice('Interest removed.');
    } catch (removeError) {
      setError(removeError instanceof Error
        ? removeError.message
        : 'Local interest could not be removed. Check browser storage and try again.');
    }
  }

  return (
    <WorkspaceLayout currentContext="workbench">
      <div className="workbench-finder-page">
        <header className="workbench-finder-head">
          <div>
            <p className="eyebrow">WORKBENCH / BROWSER-LOCAL EXAMPLES</p>
            <h1>Find work</h1>
            <p>Explore work contexts and signal interest without committing to work.</p>
          </div>
        </header>
        {loading && <p className="workbench-finder-loading" role="status">Loading local interest…</p>}
        {!loading && (
          <WorkbenchOpportunityBrowser
            error={error}
            interests={interests}
            mobileDetailOpen={mobileDetailOpen}
            notice={notice}
            onBackToList={() => setMobileDetailOpen(false)}
            onExpressInterest={expressInterest}
            onRemoveInterest={removeInterest}
            onSearchChange={search}
            onSelectOpportunity={selectOpportunity}
            onViewChange={changeView}
            opportunities={WORK_OPPORTUNITIES}
            query={query}
            selectedOpportunityId={selectedOpportunityId}
            view={view}
          />
        )}
      </div>
    </WorkspaceLayout>
  );
}
