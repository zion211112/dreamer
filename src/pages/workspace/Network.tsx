import { useState } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { NetworkMap } from '../../components/NetworkMap';
import { ForkGlyph } from '../../components/ForkGlyph';
import { RingedEvidenceMarker } from '../../components/RingedEvidenceMarker';
import { PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS, type NetworkEntity, type RelationshipKind } from '../../lib/people-network';

const ENTITY_TYPES = [
  { id: 'person' as const, label: 'People', count: PEOPLE_NETWORK.filter(e => e.type === 'person').length },
  { id: 'crew' as const, label: 'Crews', count: PEOPLE_NETWORK.filter(e => e.type === 'crew').length },
  { id: 'asset' as const, label: 'Assets', count: PEOPLE_NETWORK.filter(e => e.type === 'asset').length },
  { id: 'work' as const, label: 'Work', count: PEOPLE_NETWORK.filter(e => e.type === 'work').length },
  { id: 'institution' as const, label: 'Institutions', count: PEOPLE_NETWORK.filter(e => e.type === 'institution').length },
  { id: 'evidence' as const, label: 'Evidence', count: PEOPLE_NETWORK.filter(e => e.type === 'evidence').length },
];

const RELATIONSHIP_KINDS: (RelationshipKind | 'all')[] = [
  'all',
  'membership', 'affiliation', 'work', 'stewardship', 'contribution',
  'evidence', 'owns', 'operates', 'stewards', 'funds',
  'contributes_to', 'attests', 'issues',
];

const KIND_LABELS: Record<RelationshipKind | 'all', string> = {
  all: 'All',
  membership: 'Membership',
  affiliation: 'Affiliation',
  work: 'Work',
  stewardship: 'Stewardship',
  contribution: 'Contribution',
  evidence: 'Evidence',
  owns: 'Owns',
  operates: 'Operates',
  stewards: 'Stewards',
  funds: 'Funds',
  contributes_to: 'Contributes to',
  attests: 'Attests',
  issues: 'Issues',
};

export function Network() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelationshipKind | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const [timeScrubberValue, setTimeScrubberValue] = useState(0);
  const [legendOpen, setLegendOpen] = useState(true);

  const filteredEntities = PEOPLE_NETWORK.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.capabilities.some(c => c.toLowerCase().includes(q));
  });

  const metrics: PageHeadMetric[] = [
    { label: 'Entities', value: filteredEntities.length, state: 'canon' },
    { label: 'Relationships', value: PEOPLE_RELATIONSHIPS.length, state: 'proposed' },
    { label: 'Kinds', value: RELATIONSHIP_KINDS.length - 1, state: 'caution' },
  ];

  function handleEntitySelect(entity: NetworkEntity | null) {
    setSelectedEntity(entity);
  }

  function handleRelationshipFilter(kind: RelationshipKind | 'all') {
    setActiveFilter(kind);
  }

  return (
    <WorkspaceLayout currentContext="network:capabilities">
      <div className="network-page">
        <PageHead
          eyebrow="Network"
          title="People Network"
          subtitle="Force-directed graph of 31 entities, 34 relationships across 17 kinds. Entity-type colors: teal=Person, lime=Crew, amber=Asset, coral=Institution, mono=Work, dim=Evidence."
          metrics={metrics}
          quietActions={[
            { label: 'Export portable record', onClick: () => {} },
            { label: 'Import record', onClick: () => {} },
          ]}
        />

        <div className="network-toolbar">
          <div className="network-toolbar-search">
            <label className="network-toolbar-search-label" htmlFor="network-search">
              <span className="network-toolbar-caption">Search</span>
              <input
                id="network-search"
                type="search"
                placeholder="Filter by name, role, capability, ID…"
                value={searchQuery}
                onChange={(e: Event) => setSearchQuery((e.target as HTMLInputElement).value)}
                className="network-search-input"
                aria-label="Search entities"
              />
            </label>
          </div>

          <div className="network-toolbar-filters">
            <label className="network-filter-label">
              <span className="network-toolbar-caption">Filter</span>
              <select
                value={activeFilter}
                onChange={(e: Event) => handleRelationshipFilter((e.target as HTMLSelectElement).value as RelationshipKind | 'all')}
                className="network-filter-select"
                aria-label="Filter by relationship kind"
              >
                {RELATIONSHIP_KINDS.map(kind => (
                  <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                ))}
              </select>
            </label>

            <label className="network-time-label">
              <span className="network-toolbar-caption">Time</span>
              <input
                type="range"
                min="0"
                max="100"
                value={timeScrubberValue}
                onChange={(e: Event) => setTimeScrubberValue(Number((e.target as HTMLInputElement).value))}
                disabled
                className="network-time-input"
                aria-label="Evidence as of (disabled — requires Annals event stream)"
              />
              <span className="network-time-disabled">(disabled)</span>
            </label>
          </div>
        </div>

        <div className="network-main">
          <div className="network-map-wrapper">
            <NetworkMap
              entities={filteredEntities}
              relationships={PEOPLE_RELATIONSHIPS}
              onEntitySelect={handleEntitySelect}
              onRelationshipFilter={handleRelationshipFilter}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
              width={Math.max(600, window.innerWidth - 400)}
              height={Math.max(400, window.innerHeight - 250)}
            />
          </div>

          <aside className="network-sidebar">
            <section className="network-sidebar-section">
              <header className="network-section-header">
                <strong className="network-section-title">
                  Entity Types ({filteredEntities.length})
                </strong>
              </header>
              <ul className="network-entity-list">
                {ENTITY_TYPES.map(type => (
                  <li key={type.id} className="network-entity-item">
                    <span
                      className="network-entity-dot"
                      style={{
                        background: `var(--state-${type.id === 'person' ? 'canon' : type.id === 'crew' ? 'proposed' : type.id === 'asset' ? 'caution' : type.id === 'institution' ? 'risk' : type.id === 'work' ? 'muted' : 'dim'})`,
                      }}
                    />
                    {type.id === 'evidence' && <RingedEvidenceMarker size={10} color="var(--state-dim)" />}
                    <span className="network-entity-label">{type.label}</span>
                    <span className="network-entity-count">{type.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            {selectedEntity && (
              <section className="network-sidebar-section-compact">
                <header className="network-section-header">
                  <strong className="network-section-title">Selected Entity</strong>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="network-clear-selection-btn"
                    aria-label="Clear selection"
                  >
                    ×
                  </button>
                </header>
                <div className="network-selected-entity">
                  <div
                    className="network-selected-entity-name"
                    style={{
                      color: `var(--state-${selectedEntity.type === 'person' ? 'canon' : selectedEntity.type === 'crew' ? 'proposed' : selectedEntity.type === 'asset' ? 'caution' : selectedEntity.type === 'institution' ? 'risk' : selectedEntity.type === 'work' ? 'muted' : 'dim'})`,
                    }}
                  >
                    {selectedEntity.name}
                  </div>
                  <div className="network-selected-entity-type">
                    {selectedEntity.type} / {selectedEntity.id}
                    {selectedEntity.recordBasis === 'illustrative' && (
                      <span style={{ marginLeft: '6px', opacity: 0.6 }}>
                        <ForkGlyph size={10} />
                      </span>
                    )}
                  </div>
                  <div className="network-selected-entity-summary">
                    {selectedEntity.summary}
                  </div>
                  {selectedEntity.location && (
                    <div className="network-selected-entity-location">
                      {selectedEntity.location}
                    </div>
                  )}
                  {selectedEntity.capabilities.length > 0 && (
                    <div>
                      <div className="network-capabilities-title">Capabilities</div>
                      <div className="network-capabilities-list">
                        {selectedEntity.capabilities.slice(0, 8).map((cap, i) => (
                          <span key={i} className="network-capability-chip">
                            {cap}
                          </span>
                        ))}
                        {selectedEntity.capabilities.length > 8 && (
                          <span className="network-capability-more">
                            +{selectedEntity.capabilities.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="network-sidebar-section-compact">
              <header className="network-section-header">
                <strong className="network-section-title">Relationship Kinds</strong>
                <button
                  onClick={() => setLegendOpen(!legendOpen)}
                  className="network-legend-toggle"
                  aria-label={legendOpen ? 'Collapse' : 'Expand'}
                >
                  {legendOpen ? '−' : '+'}
                </button>
              </header>
              {legendOpen && (
                <div className="network-relationship-tags">
                  {RELATIONSHIP_KINDS.filter(k => k !== 'all').map(kind => (
                    <button
                      key={kind}
                      onClick={() => handleRelationshipFilter(kind)}
                      className={`network-relationship-tag ${activeFilter === kind ? 'is-active' : ''}`}
                    >
                      {KIND_LABELS[kind]}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="network-sidebar-section-compact">
              <strong className="network-section-title">Cross-module paths</strong>
              <ul className="network-cross-module-list">
                <li className="network-cross-module-item">
                  Entity then Annals events then Roll evidence
                </li>
                <li className="network-cross-module-item">
                  Roll entry then Annals timeline then Canon state
                </li>
                <li className="network-cross-module-item">
                  Annals event then Roll evidence then Entity profile
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

