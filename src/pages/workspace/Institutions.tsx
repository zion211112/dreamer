import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readFieldSignals } from '../../lib/local-workflows';

interface InstitutionRecord {
  id: string;
  name: string;
  kind: string;
  recordType: 'Institution' | 'Asset';
  location: string;
  summary: string;
  value: string;
  role: string;
  tags: string[];
  action?: false;
}

const institutions: InstitutionRecord[] = [
  {
    id: 'mwea-school',
    name: 'Mwea Community School',
    kind: 'School',
    recordType: 'Institution',
    location: 'Mwea, Kenya',
    summary: 'A school coordinates service needs and the assets under its care, creating recurring, locally accountable work.',
    value: 'Service demand + asset stewardship',
    role: 'Service operator',
    tags: ['Education', 'Maintenance', 'Local trust'],
  },
  {
    id: 'mwea-water',
    name: 'Mwea Water Cooperative',
    kind: 'Cooperative',
    recordType: 'Institution',
    location: 'Mwea, Kenya',
    summary: 'A cooperative stewards public utility assets and turns local service issues into accountable work packages.',
    value: 'Shared asset control + community coordination',
    role: 'Asset steward',
    tags: ['Water', 'Shared assets', 'Governance'],
  },
  {
    id: 'lake-basin-cold-store',
    name: 'Lake Basin Cold Store',
    kind: 'Enterprise',
    recordType: 'Institution',
    location: 'Kisumu, Kenya',
    summary: 'An enterprise with operational continuity needs, maintenance, and auditable work proof.',
    value: 'Asset uptime + operations + compliance',
    role: 'Execution engine',
    tags: ['Cold chain', 'Operations', 'Proof of work'],
  },
  {
    id: 'asset-kemetos1',
    name: 'Kemetos1',
    kind: 'Asset',
    recordType: 'Asset',
    location: 'Distributed',
    summary: 'An AGI systems asset with reusable inference, research, and agent infrastructure.',
    value: 'Reusable systems capability + technical work',
    role: 'Systems asset',
    tags: ['AGI systems', 'Inference', 'Agent infrastructure'],
  },
  {
    id: 'asset-school-management-console',
    name: 'School Management Console',
    kind: 'Operations platform',
    recordType: 'Asset',
    location: 'Mwea, Kenya',
    summary: 'A local-first teaching and school operations prototype for daily planning, practice marking, and private need drafts. Records stay in this browser and are not shared with the APT-LABS network.',
    value: 'Teaching tools + private school-need drafts',
    role: 'Local operations prototype',
    tags: ['Education', 'Teaching', 'Local records', 'Need drafts'],
  },
  {
    id: 'asset-thiba-hydro-project',
    name: 'Thiba Hydro Project',
    kind: 'Asset',
    recordType: 'Asset',
    location: 'Location to confirm',
    summary: 'An infrastructure project asset for coordinating stewardship, work packages, and evidence.',
    value: 'Infrastructure scope + accountable execution',
    role: 'Infrastructure asset',
    tags: ['Hydropower', 'Infrastructure', 'Project stewardship'],
  },
  {
    id: 'asset-fikra-api',
    name: 'Fikra API',
    kind: 'Inference service',
    recordType: 'Asset',
    location: 'Service infrastructure',
    summary: 'An inference API asset for backend capabilities such as Commons discovery and school-console automarking.',
    value: 'Model access + application infrastructure',
    role: 'Inference service asset',
    tags: ['Inference', 'Commons discovery', 'School operations'],
    action: false,
  },
];

const filters = ['All', 'Institution', 'Asset'] as const;

export function Institutions() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const requestedQuery = new URLSearchParams(window.location.search).get('q');
    if (requestedQuery) setQuery(requestedQuery);
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
    (filter === 'All' || institution.recordType === filter)
    && `${institution.name} ${institution.kind} ${institution.location} ${institution.summary} ${institution.value} ${institution.tags.join(' ')}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase())
  ), [filter, query]);

  return (
    <WorkspaceLayout currentContext="institutions">
      <main className="institution-page">
        <header className="institution-page-head">
          <div>
            <p className="eyebrow">APT-LABS / FIELD REGISTER</p>
            <h1>Institutions <span aria-hidden="true">/</span> Assets</h1>
          </div>
          <span className="institution-page-index">{String(results.length).padStart(2, '0')} RECORDS</span>
        </header>

        <div className="institution-toolbar">
          <div aria-label="Filter records" className="institution-filters" role="group">
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
                aria-label="Search institutions and assets"
              onInput={event => setQuery((event.currentTarget as HTMLInputElement).value)}
                placeholder="Name, type, or place…"
              value={query}
            />
          </label>
        </div>

        <p aria-live="polite" className="institution-result-count">
          {String(results.length).padStart(2, '0')} matching records
        </p>

        <section aria-label="Institutions and assets" className="institution-records">
          {results.map((institution, index) => (
            <article className={`institution-record institution-record--${institution.recordType.toLowerCase()}`} key={institution.id}>
              <span className="institution-record-mark" aria-hidden="true" />
              <span className="institution-record-index">{String(index + 1).padStart(2, '0')}</span>

              <div className="institution-record-main">
                <div className="institution-record-meta">
                  <span>{institution.recordType}</span>
                  <span>{institution.kind}</span>
                  <span>{institution.location}</span>
                </div>
                <h2>{institution.name}</h2>
                <p>{institution.summary}</p>
              </div>

              <div className="institution-record-function">
                <span>NETWORK ROLE</span>
                <strong>{institution.role}</strong>
                {institution.recordType === 'Institution' && (
                  <small>{signalCounts[institution.id] ?? 0} local signals</small>
                )}
              </div>

              {institution.action === false ? (
                <span className="institution-static-note">PROFILE ONLY</span>
              ) : (
                <Link
                  aria-label={institution.recordType === 'Asset'
                    ? institution.name === 'School Management Console' ? 'Open School Console' : `Open asset work for ${institution.name}`
                    : `Open signals for ${institution.name}`}
                  className="institution-open"
                  href={institution.recordType === 'Asset'
                    ? institution.name === 'School Management Console'
                      ? '/workspace/institutions/school-console'
                      : `/workspace/workbench?asset=${encodeURIComponent(institution.name)}`
                    : `/workspace/commons?institution=${encodeURIComponent(institution.id)}`}
                >
                  {institution.recordType === 'Asset'
                    ? institution.name === 'School Management Console'
                      ? 'Open console'
                      : 'Plan work'
                    : 'Open signals'}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
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
        <p className="local-data-note">These profiles are local-first and portable. They can persist outside the current site while remaining anchored to an APT-LABS record structure.</p>
      </main>
    </WorkspaceLayout>
  );
}
