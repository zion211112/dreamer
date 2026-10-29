import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readFieldSignals } from '../../lib/local-workflows';

const institutions = [
  {
    id: 'mwea-school',
    name: 'Mwea Community School',
    kind: 'School',
    location: 'Mwea, Kenya',
    summary: 'A school profile used to explore how local needs connect to accountable work.',
  },
  {
    id: 'mwea-water',
    name: 'Mwea Water Cooperative',
    kind: 'Community infrastructure',
    location: 'Mwea, Kenya',
    summary: 'A cooperative stewarding shared water infrastructure.',
  },
  {
    id: 'lake-basin-cold-store',
    name: 'Lake Basin Cold Store',
    kind: 'Enterprise',
    location: 'Kisumu, Kenya',
    summary: 'A cold-storage operation with equipment maintenance needs.',
  },
] as const;

const filters = ['All', 'School', 'Community infrastructure', 'Enterprise'] as const;

export function Institutions() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      const signals = readFieldSignals();
      const counts: Record<string, number> = {};
      for (const signal of signals) {
        counts[signal.institutionId] = (counts[signal.institutionId] ?? 0) + 1;
      }
      setSignalCounts(counts);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Local field signals could not be read.');
    }
  }, []);

  const results = useMemo(() => institutions.filter(institution =>
    (filter === 'All' || institution.kind === filter)
    && `${institution.name} ${institution.kind} ${institution.location} ${institution.summary}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase())
  ), [filter, query]);

  return (
    <WorkspaceLayout currentContext="institutions">
      <main className="institution-page">
        <header className="institution-page-head">
          <div>
            <p className="eyebrow">INSTITUTIONS / LOCAL INDEX</p>
            <h1>Places that hold the work.</h1>
            <p>One profile for each institution. No valuation unless its basis is evidenced.</p>
          </div>
          <span className="demo-stamp">ILLUSTRATIVE PROFILES</span>
        </header>

        <div className="institution-toolbar">
          <div aria-label="Filter institutions by type" className="institution-filters" role="group">
            {filters.map(item => (
              <button
                aria-pressed={filter === item}
                className={`institution-filter${filter === item ? ' is-active' : ''}`}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <label className="institution-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search institutions"
              onInput={event => setQuery((event.currentTarget as HTMLInputElement).value)}
              placeholder="Name, type, or place"
              value={query}
            />
          </label>
        </div>

        <p aria-live="polite" className="institution-result-count">
          {results.length.toString().padStart(2, '0')} illustrative profiles
        </p>

        <section aria-label="Illustrative institution profiles" className="institution-list">
          {results.map((institution, index) => (
            <article className="institution-row" key={institution.id}>
              <span className="institution-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="institution-copy">
                <div className="institution-name-line">
                  <h2>{institution.name}</h2>
                  <span className="institution-demo-tag">SCENARIO</span>
                </div>
                <p>{institution.summary}</p>
              </div>
              <div className="institution-meta">
                <span>{institution.kind}</span>
                <span>{institution.location}</span>
                <span>{signalCounts[institution.id] ?? 0} local signals</span>
              </div>
              <button
                className="institution-open"
                onClick={() => navigate(`/workspace/commons?institution=${encodeURIComponent(institution.id)}`)}
                type="button"
              >
                Open signals <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
          {results.length === 0 && (
            <div className="institution-empty">
              <p className="eyebrow">NO MATCHES</p>
              <h2>Try another name or place.</h2>
            </div>
          )}
        </section>

        {storageError && <p className="local-data-warning" role="alert">{storageError}</p>}
        <p className="local-data-note">Demo only. Example profiles and signal counts are stored in this browser; no institutions are connected.</p>
      </main>
    </WorkspaceLayout>
  );
}
