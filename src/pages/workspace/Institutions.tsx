import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { readFieldSignals } from '../../lib/local-workflows';
import { PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS, type NetworkEntity } from '../../lib/people-network';

type RecordType = 'Institution' | 'Asset';
type RecordFilter = 'All' | 'Institutions' | 'Assets';

interface InstitutionRecord {
  entity: NetworkEntity;
  recordType: RecordType;
  location: string;
  relationships: string[];
}

const entityById = new Map(PEOPLE_NETWORK.map(entity => [entity.id, entity]));
const relationshipsByEntity = new Map<string, string[]>();

for (const relationship of PEOPLE_RELATIONSHIPS) {
  const source = entityById.get(relationship.sourceId);
  const target = entityById.get(relationship.targetId);
  if (!source || !target) continue;

  const label = `${source.name} ${relationship.verb} ${target.name}`;
  for (const id of [source.id, target.id]) {
    const relationships = relationshipsByEntity.get(id) ?? [];
    relationships.push(label);
    relationshipsByEntity.set(id, relationships);
  }
}

const records: InstitutionRecord[] = PEOPLE_NETWORK.flatMap(entity => {
  if (entity.type !== 'institution' && entity.type !== 'asset') return [];
  return [{
    entity,
    recordType: entity.type === 'institution' ? 'Institution' : 'Asset',
    location: entity.location?.trim() || 'Not recorded',
    relationships: relationshipsByEntity.get(entity.id) ?? [],
  }];
});

const filters: RecordFilter[] = ['All', 'Institutions', 'Assets'];

function basisLabel(basis: NetworkEntity['recordBasis']): string {
  if (!basis) return 'Not recorded';
  return basis === 'local-profile'
    ? 'Local profile'
    : basis === 'project-reported'
      ? 'Project-reported'
      : 'Illustrative';
}

function recordMatches(record: InstitutionRecord, query: string): boolean {
  const entity = record.entity;
  const searchable = [
    entity.name,
    entity.type,
    entity.role,
    entity.summary,
    record.location,
    entity.context,
    entity.assetReference,
    entity.recordBasis,
    ...entity.capabilities,
    ...record.relationships,
  ].filter(Boolean).join(' ');
  return searchable.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

export function Institutions() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<RecordFilter>('All');
  const [query, setQuery] = useState('');
  const [requestedRecordId, setRequestedRecordId] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRecord = params.get('record') ?? '';
    const initialQuery = params.get('q') ?? '';
    setRequestedRecordId(requestedRecord);
    setSelectedRecordId(requestedRecord);
    setQuery(initialQuery);

    const matchingRecord = records.find(record => record.entity.id === requestedRecord);
    if (matchingRecord) setFilter(matchingRecord.recordType === 'Asset' ? 'Assets' : 'Institutions');

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

  const results = useMemo(() => records.filter(record => requestedRecordId
    ? record.entity.id === requestedRecordId
    : (filter === 'All' || record.recordType === (filter === 'Assets' ? 'Asset' : 'Institution'))
      && recordMatches(record, query)
  ), [filter, query, requestedRecordId]);
  const selectedRecord = results.find(record => record.entity.id === selectedRecordId) ?? results[0];
  const institutionCount = records.filter(record => record.recordType === 'Institution').length;
  const assetCount = records.length - institutionCount;

  function chooseFilter(nextFilter: RecordFilter) {
    setRequestedRecordId('');
    setFilter(nextFilter);
    setSelectedRecordId('');
    navigate('/workspace/institutions');
  }

  return (
    <WorkspaceLayout currentContext="network:institutions">
      <div className="institution-page">
        <header className="institution-page-head">
          <div className="institution-heading">
            <p className="eyebrow">APT-LABS <span aria-hidden="true">/</span> STARTER NETWORK REGISTER</p>
            <h1>Institutions <span aria-hidden="true">/</span> Assets</h1>
            <p className="institution-page-intro">
              A considered index of selected organisations and resources. A record tells you what is on file—not
              whether something is operating, available, authorised, or ready to use.
            </p>
          </div>
          <div aria-label={`${records.length} records in the starter network`} className="institution-page-index">
            <span className="institution-index-number">{String(records.length).padStart(2, '0')}</span>
            <span>records<br />in this register</span>
          </div>
        </header>

        <div className="institution-reading-note">
          <span className="institution-note-mark" aria-hidden="true">i</span>
          <p><strong>Unknown is a useful answer.</strong> Basis describes the record’s source, not verification; links describe context, not ownership or authority.</p>
        </div>

        <section aria-label="Find a register record" className="institution-controls">
          <div aria-label="Filter records" className="institution-filters" role="group">
            {filters.map(item => {
              const count = item === 'All'
                ? records.length
                : item === 'Institutions' ? institutionCount : assetCount;
              return (
                <button
                  aria-pressed={filter === item}
                  className={`institution-filter${filter === item ? ' is-active' : ''}`}
                  key={item}
                  onClick={() => chooseFilter(item)}
                  type="button"
                >
                  {item}<span>{String(count).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
          <label className="institution-search">
            <span aria-hidden="true" className="institution-search-icon">⌕</span>
            <span className="visually-hidden">Search institutions and assets</span>
            <input
              onInput={event => {
                setRequestedRecordId('');
                setSelectedRecordId('');
                setQuery((event.currentTarget as HTMLInputElement).value);
                navigate('/workspace/institutions');
              }}
              placeholder="Search name, place, function…"
              type="search"
              value={query}
            />
          </label>
        </section>

        <div aria-live="polite" className="institution-result-count">
          <span>{results.length === 1 ? '01 RECORD' : `${String(results.length).padStart(2, '0')} RECORDS`}</span>
          <span>{query && !requestedRecordId ? `MATCHING “${query.trim()}”` : 'STARTER NETWORK'}</span>
        </div>

        <div className={`institution-workspace${selectedRecord ? '' : ' is-empty'}`}>
          <section aria-label="Institutions and assets" className="institution-index">
            <header className="institution-index-head">
              <span>Index</span>
              <span>Name <i aria-hidden="true">·</i> Record basis</span>
              <span>Place</span>
            </header>
            {results.length > 0 ? (
              <ul className="institution-records">
                {results.map((record, index) => {
                  const entity = record.entity;
                  const active = selectedRecord?.entity.id === entity.id;
                  return (
                    <li
                      className={`institution-record${active ? ' is-selected' : ''}`}
                      id={`institution-record-${entity.id}`}
                      key={entity.id}
                    >
                      <button
                        aria-current={active ? 'true' : undefined}
                        aria-label={`Inspect ${entity.name}, ${record.recordType}`}
                        className={`institution-record-select institution-record--${record.recordType.toLowerCase()}`}
                        onClick={() => {
                          setSelectedRecordId(entity.id);
                          navigate(`/workspace/institutions?record=${encodeURIComponent(entity.id)}`);
                        }}
                        type="button"
                      >
                        <span className="institution-record-index">{String(index + 1).padStart(2, '0')}</span>
                        <span aria-hidden="true" className="institution-record-mark" />
                        <span className="institution-record-main">
                          <span className="institution-record-meta">
                            <span>{record.recordType}</span>
                            <span>{entity.role}</span>
                            <span>{basisLabel(entity.recordBasis)}</span>
                          </span>
                          <span className="institution-record-name">{entity.name}</span>
                          <span className="institution-record-summary">{entity.summary}</span>
                        </span>
                        <span className="institution-record-place">{record.location}</span>
                        <span aria-hidden="true" className="institution-record-arrow">{active ? '↗' : '→'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="institution-empty" role="status">
                <span className="eyebrow">NO MATCHES</span>
                <h2>Nothing in this register answers that search.</h2>
                <p>Try a different name, place, or recorded function.</p>
              </div>
            )}
          </section>

          {selectedRecord && (
            <aside aria-labelledby="institution-inspector-title" className="institution-inspector">
              <div className="institution-inspector-topline">
                <span>Record {String(records.findIndex(item => item.entity.id === selectedRecord.entity.id) + 1).padStart(2, '0')}</span>
                <span>{selectedRecord.recordType}</span>
              </div>
              <div className={`institution-inspector-symbol institution-inspector-symbol--${selectedRecord.recordType.toLowerCase()}`} aria-hidden="true">
                <span />
              </div>
              <p className="institution-inspector-role">{selectedRecord.entity.role}</p>
              <h2 id="institution-inspector-title">{selectedRecord.entity.name}</h2>
              <p className="institution-inspector-summary">{selectedRecord.entity.summary}</p>

              <dl className="institution-facts">
                <div>
                  <dt>Record basis</dt>
                  <dd>{basisLabel(selectedRecord.entity.recordBasis)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{selectedRecord.location}</dd>
                </div>
                {selectedRecord.recordType === 'Asset' && (
                  <>
                    <div><dt>Condition</dt><dd>Not recorded</dd></div>
                    <div><dt>Availability</dt><dd>Not established</dd></div>
                  </>
                )}
              </dl>

              {selectedRecord.entity.context && (
                <p className="institution-record-context">{selectedRecord.entity.context}</p>
              )}

              <section aria-labelledby="institution-relationships-title" className="institution-relationships">
                <h3 id="institution-relationships-title">
                  Recorded links <span>{String(selectedRecord.relationships.length).padStart(2, '0')}</span>
                </h3>
                {selectedRecord.relationships.length > 0 ? (
                  <ul>
                    {selectedRecord.relationships.map((relationship, index) => (
                      <li key={`${selectedRecord.entity.id}-${index}`}>{relationship}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No explicit relationships are recorded for this entry.</p>
                )}
              </section>

              {selectedRecord.recordType === 'Institution' && (
                <Link
                  className="institution-context-link"
                  href={`/workspace/commons?institution=${encodeURIComponent(selectedRecord.entity.id)}`}
                >
                  <span>
                    <small>COMMONS CONTEXT</small>
                    <strong>{signalCounts[selectedRecord.entity.id] ?? 0} local signals</strong>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
              {selectedRecord.entity.id === 'asset-school-management-console' && (
                <Link className="institution-context-link" href="/workspace/institutions/school-console">
                  <span>
                    <small>LOCAL-FIRST PROTOTYPE</small>
                    <strong>Open School Console</strong>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </aside>
          )}
        </div>

        {storageError && <p className="local-data-warning" role="alert">{storageError}</p>}
        <footer className="institution-page-footer">
          <span>APT-LABS <i aria-hidden="true">/</i> RECORDS, NOT ASSUMPTIONS</span>
          <span>This register reads the bundled starter set; it does not alter imported People records.</span>
          <a className="institution-network-link" href="/workspace/institutions/network">
            <span>Open Capability Directory</span>
            <span aria-hidden="true">→</span>
          </a>
        </footer>
      </div>
    </WorkspaceLayout>
  );
}
