import { useEffect, useRef, useState } from 'preact/hooks';
import { EntityInspector } from '../../components/people/EntityInspector';
import { NetworkMap } from '../../components/people/NetworkMap';
import {
  importPortablePeopleRecord,
  isPrimaryEntity,
  PEOPLE_NETWORK,
  PEOPLE_RELATIONSHIPS,
  PEOPLE_ROOT_LENSES,
  readPeopleNetworkRecord,
  ROOT_ENTITY_BY_TYPE,
  type NetworkEntity,
  type PeopleNetworkRecord,
  type PrimaryEntityType,
} from '../../lib/people-network';
import { WorkspaceLayout } from './WorkspaceLayout';

export function People() {
  const [networkRecord, setNetworkRecord] = useState<PeopleNetworkRecord>({
    entities: PEOPLE_NETWORK,
    relationships: PEOPLE_RELATIONSHIPS,
  });
  const [rootId, setRootId] = useState(ROOT_ENTITY_BY_TYPE.person);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [inspectorDismissed, setInspectorDismissed] = useState(false);
  const [recordStatus, setRecordStatus] = useState('');
  const importInput = useRef<HTMLInputElement>(null);
  const entityById = new Map(networkRecord.entities.map((entity) => [entity.id, entity]));
  const rootEntity = entityById.get(rootId);
  const selectedEntity = selectedId
    ? entityById.get(selectedId) ?? null
    : inspectorDismissed ? null : rootEntity ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntities = networkRecord.entities.filter(isPrimaryEntity);
  const searchResults = normalizedQuery
    ? visibleEntities.filter((entity) => (
      entity.name.toLowerCase().includes(normalizedQuery)
      || entity.role.toLowerCase().includes(normalizedQuery)
      || entity.capabilities.some((capability) => capability.toLowerCase().includes(normalizedQuery))
    )).slice(0, 5)
    : [];

  useEffect(() => {
    try {
      const savedRecord = readPeopleNetworkRecord();
      setNetworkRecord(savedRecord);
      if (!savedRecord.entities.some((entity) => entity.id === ROOT_ENTITY_BY_TYPE.person)) {
        const firstPrimary = savedRecord.entities.find(isPrimaryEntity);
        if (firstPrimary) setRootId(firstPrimary.id);
      }
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Saved People record could not be read.');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedId(null);
        setInspectorDismissed(true);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImport = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      importPortablePeopleRecord(await file.text());
      const importedRecord = readPeopleNetworkRecord();
      setNetworkRecord(importedRecord);
      const firstPrimary = importedRecord.entities.find(isPrimaryEntity);
      setRootId(firstPrimary?.id ?? '');
      setSelectedId(firstPrimary?.id ?? null);
      setInspectorDismissed(!firstPrimary);
      setRecordStatus('Portable record imported locally.');
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Record could not be imported.');
    } finally {
      input.value = '';
    }
  };

  const chooseEntity = (entity: NetworkEntity) => {
    if (!isPrimaryEntity(entity)) return;
    setRootId(entity.id);
    setSelectedId(entity.id);
    setInspectorDismissed(false);
    setQuery('');
  };

  const chooseRootType = (type: PrimaryEntityType) => {
    const nextRootId = networkRecord.entities.find((entity) => entity.type === type)?.id;
    if (!nextRootId) return;
    setRootId(nextRootId);
    setSelectedId(nextRootId);
    setInspectorDismissed(false);
    setQuery('');
  };

  return (
    <WorkspaceLayout currentContext="people">
      <div className="people-page">
        <header className="people-page-header">
          <div className="people-page-title">
            <h1>People</h1>
            <span className="people-page-divider" aria-hidden="true">/</span>
            <span className="people-page-caption">Capability, crews, shared assets</span>
          </div>
          <div className="people-page-status">
            <span className="people-page-status-dot" />
            APT-LABS record
            <input
              ref={importInput}
              accept="application/json"
              aria-label="Import portable People record"
              className="people-import-input"
              onChange={(event) => void handleImport(event)}
              type="file"
            />
            <button className="people-import-trigger" onClick={() => importInput.current?.click()} type="button">
              Import record
            </button>
          </div>
        </header>

        <section className="people-controls" aria-label="Explore the network">
          <div className="people-root-lenses" role="group" aria-label="Network lenses">
            {PEOPLE_ROOT_LENSES.map(({ id, label }) => {
              const isActive = rootEntity?.type === id;
              const count = visibleEntities.filter((entity) => entity.type === id).length;
              return (
                <button
                  type="button"
                  key={id}
                  className={`people-root-lens${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => chooseRootType(id)}
                >
                  <span className={`people-type-mark people-type-mark--${id}`} aria-hidden="true" />
                  <span>{label}</span>
                  <span className="people-root-lens-count">{count.toString().padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>

          <div className="people-search-wrap">
            <label className="people-search-control">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" />
                <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Find a person, crew, project, or asset"
                value={query}
                onInput={(event) => setQuery(event.currentTarget.value)}
                autoComplete="off"
                aria-label="Find a person, crew, project, or asset"
                aria-controls="people-search-results"
              />
              {query && (
                <button
                  className="people-search-clear"
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>
            {normalizedQuery && (
              <div className="people-search-results" id="people-search-results" role="listbox" aria-label="Network matches">
                {searchResults.length ? searchResults.map((entity) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={entity.id === rootId}
                    key={entity.id}
                    onClick={() => chooseEntity(entity)}
                  >
                    <span className={`people-type-mark people-type-mark--${entity.type}`} aria-hidden="true" />
                    <span className="people-search-result-copy">
                      <strong>{entity.name}</strong>
                      <small>{entity.role}</small>
                    </span>
                    <span className="people-search-result-type">{entity.type}</span>
                  </button>
                )) : (
                  <p className="people-search-empty">No matching people, crews, or assets.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="people-workbench" aria-label="People, crews, projects, and assets relationship map">
          <NetworkMap
            rootId={rootId}
            selectedId={selectedEntity?.id ?? ''}
            query={query}
            entities={networkRecord.entities}
            relationships={networkRecord.relationships}
            onSelect={chooseEntity}
          />
          <EntityInspector
            entity={selectedEntity}
            mobileOpen={selectedId !== null}
            entities={networkRecord.entities}
            relationships={networkRecord.relationships}
            onSelect={chooseEntity}
            onClose={() => {
              setSelectedId(null);
              setInspectorDismissed(true);
            }}
          />
        </section>
        {recordStatus && <p className="people-record-status" role="status">{recordStatus}</p>}
      </div>
    </WorkspaceLayout>
  );
}
