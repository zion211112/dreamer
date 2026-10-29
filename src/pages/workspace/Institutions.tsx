import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readFieldSignals } from '../../lib/local-workflows';

const institutions = [
  {
    id: 'kenya',
    name: 'Kenya',
    kind: 'Sovereign',
    recordType: 'Jurisdiction context',
    location: 'East Africa',
    summary: 'A sovereign jurisdiction that anchors public mandates, institutions, infrastructure, and cross-border work.',
    value: 'Jurisdiction + public mandate context',
    role: 'Sovereign context',
    tags: ['Public service', 'Procurement', 'Institutional capacity'],
  },
  {
    id: 'uganda',
    name: 'Uganda',
    kind: 'Sovereign',
    recordType: 'Jurisdiction context',
    location: 'East Africa',
    summary: 'A sovereign jurisdiction for locating institutions, infrastructure, and work relationships across the region.',
    value: 'Jurisdiction + regional operating context',
    role: 'Sovereign context',
    tags: ['Utilities', 'Enterprise demand', 'Local operations'],
  },
  {
    id: 'tanzania',
    name: 'Tanzania',
    kind: 'Sovereign',
    recordType: 'Jurisdiction context',
    location: 'East Africa',
    summary: 'A sovereign jurisdiction that can contextualize future institutional onboarding and accountable regional work.',
    value: 'Jurisdiction + future coordination context',
    role: 'Sovereign context',
    tags: ['Growth market', 'Asset operations', 'Work orchestration'],
  },
  {
    id: 'mwea-school',
    name: 'Mwea Community School',
    kind: 'School',
    recordType: 'Operating institution',
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
    recordType: 'Operating institution',
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
    recordType: 'Operating institution',
    location: 'Kisumu, Kenya',
    summary: 'An enterprise with operational continuity needs, maintenance, and auditable work proof.',
    value: 'Asset uptime + operations + compliance',
    role: 'Execution engine',
    tags: ['Cold chain', 'Operations', 'Proof of work'],
  },
] as const;

const filters = ['All', 'Sovereign', 'School', 'Cooperative', 'Enterprise'] as const;

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
    && `${institution.name} ${institution.kind} ${institution.location} ${institution.summary} ${institution.value}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase())
  ), [filter, query]);

  return (
    <WorkspaceLayout currentContext="institutions">
      <main className="institution-page">
        <header className="institution-page-head">
          <div>
            <p className="eyebrow">INSTITUTIONS / OPERATING LAYER</p>
            <h1>Institutions coordinate work.</h1>
            <p>Operators and stewards organize mandates, assets, and recurring needs. Jurisdictions anchor where they act; they are not assets.</p>
          </div>
          <span className="demo-stamp">LOCAL-FIRST MODE</span>
        </header>

        <section className="institution-banner">
          <div className="institution-banner-copy">
            <p className="eyebrow">OPERATING MODEL</p>
            <h2>Institutions create and govern work. Assets are what they steward. Countries define the jurisdiction around both.</h2>
          </div>
          <div className="institution-banner-meta">
            <span>Institution</span>
            <strong>Mandate + governance</strong>
            <span>Asset / work</span>
            <strong>Stewardship + accountable execution</strong>
          </div>
        </section>

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
          {results.length.toString().padStart(2, '0')} operating profiles
        </p>

        <section aria-label="Institution profiles" className="institution-grid">
          {results.map((institution, index) => (
            <article className="institution-card" key={institution.id}>
              <div className="institution-card-top">
                <span className="institution-card-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="institution-card-role">{institution.role}</span>
              </div>

              <div className="institution-card-body">
                <h2>{institution.name}</h2>
                <p>{institution.summary}</p>
              </div>

              <div className="institution-card-meta">
                <span>{institution.recordType}</span>
                <span>{institution.kind}</span>
                <span>{institution.location}</span>
                <span>{signalCounts[institution.id] ?? 0} local signals</span>
              </div>

              <div className="institution-card-value">
                <span>Value shape</span>
                <strong>{institution.value}</strong>
              </div>

              <div className="institution-chips">
                {institution.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
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
        <p className="local-data-note">These profiles are local-first and portable. They can persist outside the current site while remaining anchored to an APT-LABS record structure.</p>
      </main>
    </WorkspaceLayout>
  );
}
