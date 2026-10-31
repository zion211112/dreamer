import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readFieldSignals } from '../../lib/local-workflows';
import { PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS, type NetworkEntity } from '../../lib/people-network';

interface InstitutionRecord {
  id: string;
  name: string;
  kind: string;
  recordType: 'Institution' | 'Asset';
  location: string;
  summary: string;
  role: string;
  tags: string[];
  assetReference?: string;
  association?: string;
  recordBasis?: NetworkEntity['recordBasis'];
  action?: false;
}

const entityById = new Map(PEOPLE_NETWORK.map(entity => [entity.id, entity]));
const associationsByAsset = new Map<string, string[]>();

for (const relationship of PEOPLE_RELATIONSHIPS) {
  const source = entityById.get(relationship.sourceId);
  const target = entityById.get(relationship.targetId);
  if (source?.type !== 'asset' || target?.type !== 'institution' || relationship.kind !== 'affiliation') continue;
  const associations = associationsByAsset.get(source.id) ?? [];
  associations.push(`${relationship.verb}: ${target.name}`);
  associationsByAsset.set(source.id, associations);
}

const institutions: InstitutionRecord[] = PEOPLE_NETWORK.flatMap(entity => {
  if (entity.type !== 'institution' && entity.type !== 'asset') return [];
  return [{
    id: entity.id,
    name: entity.name,
    kind: entity.role,
    recordType: entity.type === 'institution' ? 'Institution' : 'Asset',
    location: entity.location ?? (entity.type === 'asset' ? 'Site not specified' : 'Location not specified'),
    summary: entity.summary,
    role: entity.type === 'asset' ? 'Asset profile' : 'Institution profile',
    tags: [...entity.capabilities, entity.context ?? '', entity.assetReference ?? ''],
    assetReference: entity.assetReference,
    association: associationsByAsset.get(entity.id)?.join(' · '),
    recordBasis: entity.recordBasis,
    action: entity.id === 'asset-fikra-api' ? false : undefined,
  }];
});

const filters = ['All', 'Institution', 'Asset'] as const;

export function Institutions() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const requestedRecordId = new URLSearchParams(window.location.search).get('record');
    if (requestedRecordId) {
      setSelectedRecordId(requestedRecordId);
      const requestedRecord = institutions.find(record => record.id === requestedRecordId);
      if (requestedRecord) setFilter(requestedRecord.recordType);
    }
    const requestedQuery = new URLSearchParams(window.location.search).get('q');
    if (requestedQuery) setQuery(requestedQuery);
    try {
      const signals = readFieldSignals();
      const counts: Record<string, number> = {};
      for (const signal of signals.filter(item => !item.scenario)) {
        counts[signal.institutionId] = (counts[signal.institutionId] ?? 0) + 1;
      }
      setSignalCounts(counts);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Local field signals could not be read.');
    }
  }, []);

  const results = useMemo(() => institutions.filter(institution => selectedRecordId
    ? institution.id === selectedRecordId
    : (filter === 'All' || institution.recordType === filter)
      && `${institution.name} ${institution.kind} ${institution.location} ${institution.summary} ${institution.association ?? ''} ${institution.tags.join(' ')}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase())
  ), [filter, query, selectedRecordId]);

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
                onClick={() => { setSelectedRecordId(''); setFilter(item); }}
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
              onInput={event => { setSelectedRecordId(''); setQuery((event.currentTarget as HTMLInputElement).value); }}
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
            <article className={`institution-record institution-record--${institution.recordType.toLowerCase()}`} id={`institution-record-${institution.id}`} key={institution.id}>
              <span className="institution-record-mark" aria-hidden="true" />
              <span className="institution-record-index">{String(index + 1).padStart(2, '0')}</span>

              <div className="institution-record-main">
                <div className="institution-record-meta">
                  <span>{institution.recordType}</span>
                  <span>{institution.kind}</span>
                  <span>{institution.location}</span>
                  {institution.recordBasis && <span>{institution.recordBasis}</span>}
                </div>
                <h2>{institution.name}</h2>
                <p>{institution.summary}</p>
                {institution.assetReference && (
                  <span className="institution-sample-reference">Sample register · {institution.assetReference}</span>
                )}
                {institution.association && (
                  <span className="institution-association">{institution.association}</span>
                )}
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
