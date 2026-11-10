import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { NetworkMap } from '../../components/NetworkMap';
import {
  RELATIONSHIP_KINDS, KIND_LABELS,
  type NetworkEntity, type RelationshipKind,
} from '../../lib/people-network';
import {
  readPeopleNetworkRecord, createPortablePeopleRecord, importPortablePeopleRecord,
} from '../../lib/people-network';

const ENTITY_TYPES = [
  { id: 'person' as const, label: 'People' },
  { id: 'crew' as const, label: 'Crews' },
  { id: 'asset' as const, label: 'Assets' },
  { id: 'work' as const, label: 'Work' },
  { id: 'institution' as const, label: 'Institutions' },
  { id: 'evidence' as const, label: 'Evidence' },
];

export function Network() {
  const [record, setRecord] = useState(() => readPeopleNetworkRecord());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelationshipKind | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(320);

  const entities = record.entities;
  const relationships = record.relationships;
  const entityById = new Map(entities.map(entity => [entity.id, entity]));

  useLayoutEffect(() => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;
    const resizeObserver = new ResizeObserver(() => setMapWidth(wrapper.clientWidth));
    resizeObserver.observe(wrapper);
    setMapWidth(wrapper.clientWidth);
    return () => resizeObserver.disconnect();
  }, []);

  const filteredEntities = entities.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [e.id, e.type, e.name, e.role, e.summary, e.location, e.context, e.assetReference, e.recordBasis, ...e.capabilities]
      .some(value => value?.toLowerCase().includes(q));
  });

  const filteredRelationships = activeFilter === 'all' ? relationships : relationships.filter(r => r.kind === activeFilter);

  const metrics: PageHeadMetric[] = [
    { label: 'Entities', value: filteredEntities.length, state: 'canon' },
    { label: 'Relationships', value: relationships.length, state: 'proposed' },
    { label: 'Kinds', value: RELATIONSHIP_KINDS.length - 1, state: 'caution' },
  ];

  function handleExport() {
    const json = createPortablePeopleRecord(record);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aptlabs-people-network-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          importPortablePeopleRecord(reader.result as string);
          setRecord(readPeopleNetworkRecord());
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Import failed.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleSelect(entity: NetworkEntity | null) {
    setSelectedEntity(entity);
  }

  return (
    <WorkspaceLayout currentContext="network:capabilities">
      <div className="network-page">
        <PageHead
          eyebrow="Network"
          title="Network"
          subtitle="Discover who exists, understand what they can do, and see how they connect."
          metrics={metrics}
          quietActions={[
            { label: 'Export portable record', onClick: handleExport },
            { label: 'Import record', onClick: handleImport },
          ]}
        />

        <div className="network-toolbar">
          <div className="network-toolbar-search">
            <label className="network-toolbar-search-label" htmlFor="network-search">
              <span className="network-toolbar-caption">Search</span>
              <input
                id="network-search"
                type="search"
                placeholder="Filter by name, role, capability, ID..."
                value={searchQuery}
                onChange={(e: Event) => setSearchQuery((e.target as HTMLInputElement).value)}
                className="network-search-input"
                aria-label="Search entities"
              />
            </label>
          </div>
          <div className="network-toolbar-filters">
            <label className="network-filter-label">
              <span className="network-toolbar-caption">Relationships</span>
              <select
                value={activeFilter}
                onChange={(e: Event) => setActiveFilter((e.target as HTMLSelectElement).value as RelationshipKind | 'all')}
                className="network-filter-select"
                aria-label="Filter by relationship kind"
              >
                {RELATIONSHIP_KINDS.map(kind => (
                  <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="network-main">
          {!selectedEntity && (
            <aside className="network-sidebar">
              <section className="network-sidebar-section">
                <header className="network-section-header">
                  <strong className="network-section-title">Entity types</strong>
                </header>
                <ul className="network-entity-list">
                  {ENTITY_TYPES.map(type => {
                    const count = entities.filter(e => e.type === type.id).length;
                    return (
                      <li key={type.id} className="network-entity-item">
                        <span className={`network-entity-dot network-entity-dot--${type.id}`} />
                        <span className="network-entity-label">{type.label}</span>
                        <span className="network-entity-count">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </aside>
          )}

          <div className="network-map-wrapper" ref={mapWrapperRef}>
            <NetworkMap
              entities={filteredEntities}
              relationships={filteredRelationships}
              onEntitySelect={handleSelect}
              onRelationshipFilter={setActiveFilter}
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              width={mapWidth}
              height={Math.max(400, window.innerHeight - 260)}
            />
          </div>

          {selectedEntity && (
            <aside className="network-profile-sidecar is-open" aria-label="Entity profile">
              <button type="button" className="network-profile-close" onClick={() => handleSelect(null)} aria-label="Close profile">
                ×
              </button>
              <div className="network-profile-body">
                <header className="network-profile-header">
                  <div className={`network-profile-name network-profile-name--${selectedEntity.type}`}>{selectedEntity.name}</div>
                  <div className="network-profile-type">{selectedEntity.type.toUpperCase()} · {selectedEntity.id}</div>
                  <p className="network-profile-summary">{selectedEntity.summary}</p>
                  {selectedEntity.location && <div className="network-profile-location">{selectedEntity.location}</div>}
                  {(selectedEntity.context || selectedEntity.assetReference || selectedEntity.recordBasis) && (
                    <section className="network-profile-section">
                      <div className="network-section-title">Record context</div>
                      {selectedEntity.context && <p className="network-profile-summary">{selectedEntity.context}</p>}
                      {selectedEntity.assetReference && <div className="network-profile-type">Reference: {selectedEntity.assetReference}</div>}
                      {selectedEntity.recordBasis && (
                        <div className="network-profile-type">
                          Basis: {selectedEntity.recordBasis === 'local-profile' ? 'Local profile'
                            : selectedEntity.recordBasis === 'project-reported' ? 'Project reported' : 'Illustrative'}
                        </div>
                      )}
                    </section>
                  )}
                </header>

                <section className="network-profile-section">
                  <div className="network-section-title">Capabilities</div>
                  <div className="network-capability-list">
                    {selectedEntity.capabilities.map(cap => (
                      <span key={cap} className="network-capability-chip">{cap}</span>
                    ))}
                    {selectedEntity.capabilities.length === 0 && <span className="network-capability-empty">No capabilities recorded.</span>}
                  </div>
                </section>

                <section className="network-profile-section">
                  <div className="network-section-title">Relationships</div>
                  <div className="network-relationship-list">
                    {relationships
                      .filter(r => r.sourceId === selectedEntity.id || r.targetId === selectedEntity.id)
                      .map(r => {
                        const related = entityById.get(r.sourceId === selectedEntity.id ? r.targetId : r.sourceId);
                        if (!related) return null;
                        const dir = r.sourceId === selectedEntity.id ? '→' : '←';
                        return (
                          <div key={r.id} className="network-connection-row">
                            <span className="network-connection-verb">{r.verb}</span>
                            <span className="network-connection-arrow">{dir}</span>
                            <span className="network-connection-name">{related.name}</span>
                            <span className="network-connection-type">{related.type}</span>
                          </div>
                        );
                      })}
                  </div>
                </section>

                <section className="network-profile-section">
                  <div className="network-section-title">Availability</div>
                  <div className="network-profile-availability">
                    {selectedEntity.location ? `Active in ${selectedEntity.location}` : 'Availability not stated.'}
                  </div>
                </section>

                <footer className="network-profile-footer">
                  Connections and evidence are explicit, declared relationships—not assumptions of authority or worth.
                </footer>
              </div>
            </aside>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
