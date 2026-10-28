import { useEffect, useState } from 'preact/hooks';
import { EntityInspector } from '../../components/people/EntityInspector';
import { NetworkMap } from '../../components/people/NetworkMap';
import {
  ENTITY_BY_ID,
  ENTITY_TYPES,
  PEOPLE_NETWORK,
  RELATIONSHIP_KINDS,
  ROOT_ENTITY_BY_TYPE,
  type EntityType,
  type NetworkEntity,
  type RelationshipKind,
} from '../../lib/people-network';
import { WorkspaceLayout } from './WorkspaceLayout';

export function People() {
  const [rootId, setRootId] = useState(ROOT_ENTITY_BY_TYPE.person);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [relationshipKind, setRelationshipKind] = useState<RelationshipKind | null>(null);
  const selectedEntity = selectedId ? ENTITY_BY_ID.get(selectedId) ?? null : null;
  const rootEntity = ENTITY_BY_ID.get(rootId);
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? PEOPLE_NETWORK.filter((entity) => (
      entity.name.toLowerCase().includes(normalizedQuery)
      || entity.role.toLowerCase().includes(normalizedQuery)
      || entity.capabilities.some((capability) => capability.toLowerCase().includes(normalizedQuery))
    )).slice(0, 6)
    : [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const chooseEntity = (entity: NetworkEntity) => {
    setRootId(entity.id);
    setSelectedId(entity.id);
  };

  const chooseRootType = (type: EntityType) => {
    const nextRootId = ROOT_ENTITY_BY_TYPE[type];
    setRootId(nextRootId);
    setSelectedId(nextRootId);
  };

  return (
    <WorkspaceLayout currentContext="people">
      <div className="people-page">
        <header className="people-page-header">
          <div className="people-page-title">
            <div className="people-page-overline">
              <span className="people-page-overline-mark" />
              FIELD DESK <span>/</span> PEOPLE
            </div>
            <h1>People, in relation.</h1>
            <p>Start anywhere. See the work, capability, and shared ground around it.</p>
          </div>
          <div className="people-page-status">
            <span className="people-page-status-dot" />
            <span><strong>Local sample</strong><small>Illustrative records only</small></span>
          </div>
        </header>

        <section className="people-root-section" aria-labelledby="people-root-heading">
          <div className="people-section-label">
            <h2 id="people-root-heading">Explore from</h2>
            <span>01 — 06</span>
          </div>
          <div className="people-root-lenses" role="group" aria-label="Choose a network root">
            {ENTITY_TYPES.map(({ id, label }) => {
              const isActive = rootEntity?.type === id;
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
                  {isActive && <span className="people-root-lens-index">ACTIVE</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="people-tools" aria-label="Search and filter relationships">
          <div className="people-search-wrap">
            <label className="people-search-label" htmlFor="people-search">Find a person, place, or capability</label>
            <div className="people-search-control">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" />
                <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="people-search"
                type="search"
                placeholder="Search the sample network"
                value={query}
                onInput={(event) => setQuery(event.currentTarget.value)}
                autoComplete="off"
                aria-controls="people-search-results"
              />
              {query && (
                <button className="people-search-clear" type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  Clear
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="people-search-results" id="people-search-results" role="listbox" aria-label="Matching sample records">
                {searchResults.map((entity) => {
                  const label = ENTITY_TYPES.find((type) => type.id === entity.type)?.label ?? entity.type;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={entity.id === rootId}
                      key={entity.id}
                      onClick={() => chooseEntity(entity)}
                    >
                      <span className={`people-type-mark people-type-mark--${entity.type}`} aria-hidden="true" />
                      <span className="people-search-result-copy"><strong>{entity.name}</strong><small>{entity.role}</small></span>
                      <span className="people-search-result-type">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {normalizedQuery && searchResults.length === 0 && (
              <p className="people-search-empty">No sample records match “{query.trim()}”.</p>
            )}
          </div>

          <div className="people-filter-wrap">
            <span className="people-search-label">Relationship lens</span>
            <div className="people-filter-list" role="group" aria-label="Filter by relationship">
              <button
                type="button"
                className={`people-filter${relationshipKind === null ? ' is-active' : ''}`}
                aria-pressed={relationshipKind === null}
                onClick={() => setRelationshipKind(null)}
              >
                All
              </button>
              {RELATIONSHIP_KINDS.map(({ id, label }) => (
                <button
                  type="button"
                  key={id}
                  className={`people-filter${relationshipKind === id ? ' is-active' : ''}`}
                  aria-pressed={relationshipKind === id}
                  onClick={() => setRelationshipKind(relationshipKind === id ? null : id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="people-workbench" aria-label="People relationship atlas">
          <NetworkMap
            rootId={rootId}
            selectedId={selectedId ?? ''}
            query={query}
            relationshipKind={relationshipKind}
            onSelect={chooseEntity}
          />
          <EntityInspector
            entity={selectedEntity}
            onSelect={chooseEntity}
            onClose={() => setSelectedId(null)}
          />
        </section>
      </div>
    </WorkspaceLayout>
  );
}
