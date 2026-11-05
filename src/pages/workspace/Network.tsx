import { useState } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { NetworkMap } from '../../components/NetworkMap';
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
          eyebrow="APT-LABS / NETWORK"
          title="People Network"
          subtitle="Force-directed graph of 31 entities, 34 relationships across 17 kinds. Entity-type colors: teal=Person, lime=Crew, amber=Asset, coral=Institution, mono=Work, dim=Evidence."
          metrics={metrics}
          quietActions={[
            { label: 'Export portable record', onClick: () => {} },
            { label: 'Import record', onClick: () => {} },
          ]}
        />

        <div className="network-toolbar" style={{
          display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)',
          alignItems: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-3)',
          background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="network-search" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', letterSpacing: '0.05em' }}>Search</span>
              <input
                id="network-search"
                type="search"
                placeholder="Filter by name, role, capability, ID…"
                value={searchQuery}
                onChange={(e: Event) => setSearchQuery((e.target as HTMLInputElement).value)}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: '12px', fontFamily: 'var(--mono)',
                  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px',
                  color: 'var(--fg)',
                }}
                aria-label="Search entities"
              />
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', letterSpacing: '0.05em' }}>Filter</span>
              <select
                value={activeFilter}
                onChange={(e: Event) => handleRelationshipFilter((e.target as HTMLSelectElement).value as RelationshipKind | 'all')}
                style={{
                  padding: '6px 10px', fontSize: '11px', fontFamily: 'var(--mono)',
                  background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px',
                  color: 'var(--fg)', minWidth: '160px',
                }}
                aria-label="Filter by relationship kind"
              >
                {RELATIONSHIP_KINDS.map(kind => (
                  <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', letterSpacing: '0.05em' }}>Time</span>
              <input
                type="range"
                min="0"
                max="100"
                value={timeScrubberValue}
                onChange={(e: Event) => setTimeScrubberValue(Number((e.target as HTMLInputElement).value))}
                disabled
                style={{ width: '150px', accentColor: 'var(--state-caution)' }}
                aria-label="Evidence as of (disabled — requires Annals event stream)"
              />
              <span style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>(disabled)</span>
            </label>
          </div>
        </div>

        <div className="network-main" style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
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

          <aside className="network-sidebar" style={{
            width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'
          }}>
            <section style={{
              background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px',
              padding: 'var(--space-3)', maxHeight: '300px', overflow: 'auto'
            }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg)' }}>
                  Entity Types ({filteredEntities.length})
                </strong>
              </header>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ENTITY_TYPES.map(type => (
                  <li key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: `var(--state-${type.id === 'person' ? 'canon' : type.id === 'crew' ? 'proposed' : type.id === 'asset' ? 'caution' : type.id === 'institution' ? 'risk' : type.id === 'work' ? 'muted' : 'dim'})`,
                      border: '1px solid var(--line)', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '11px', color: 'var(--fg)', flex: 1, textTransform: 'capitalize' }}>
                      {type.label}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--dim)', fontVariantNumeric: 'tabular-nums' }}>
                      {type.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {selectedEntity && (
              <section style={{
                background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px',
                padding: 'var(--space-3)', maxHeight: '300px', overflow: 'auto'
              }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg)' }}>
                    Selected Entity
                  </strong>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                    aria-label="Clear selection"
                  >
                    ×
                  </button>
                </header>
                <div style={{ fontSize: '11px', color: 'var(--fg)' }}>
                  <div style={{ fontFamily: 'var(--l1-font)', fontSize: '14px', marginBottom: '4px', color: `var(--state-${selectedEntity.type === 'person' ? 'canon' : selectedEntity.type === 'crew' ? 'proposed' : selectedEntity.type === 'asset' ? 'caution' : selectedEntity.type === 'institution' ? 'risk' : selectedEntity.type === 'work' ? 'muted' : 'dim'})` }}>
                    {selectedEntity.name}
                  </div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {selectedEntity.type.toUpperCase()} · {selectedEntity.id}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '11px' }}>
                    {selectedEntity.summary}
                  </div>
                  {selectedEntity.location && (
                    <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '8px' }}>
                      📍 {selectedEntity.location}
                    </div>
                  )}
                  {selectedEntity.capabilities.length > 0 && (
                    <div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>CAPABILITIES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {selectedEntity.capabilities.slice(0, 8).map((cap, i) => (
                          <span key={i} style={{
                            background: 'var(--bg)', border: '1px solid var(--line)',
                            borderRadius: '3px', padding: '2px 6px', fontSize: '9px'
                          }}>
                            {cap}
                          </span>
                        ))}
                        {selectedEntity.capabilities.length > 8 && (
                          <span style={{ fontSize: '9px', color: 'var(--dim)' }}>
                            +{selectedEntity.capabilities.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section style={{
              background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px',
              padding: 'var(--space-3)'
            }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg)' }}>
                  Relationship Kinds
                </strong>
                <button
                  onClick={() => setLegendOpen(!legendOpen)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}
                  aria-label={legendOpen ? 'Collapse' : 'Expand'}
                >
                  {legendOpen ? '−' : '+'}
                </button>
              </header>
              {legendOpen && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {RELATIONSHIP_KINDS.filter(k => k !== 'all').map(kind => (
                    <button
                      key={kind}
                      onClick={() => handleRelationshipFilter(kind)}
                      style={{
                        background: activeFilter === kind ? 'var(--state-canon)' : 'var(--bg)',
                        border: `1px solid ${activeFilter === kind ? 'var(--state-canon)' : 'var(--line)'}`,
                        borderRadius: '3px', padding: '2px 6px', fontSize: '9px',
                        color: activeFilter === kind ? 'var(--bg)' : 'var(--fg)',
                        cursor: 'pointer', textTransform: 'capitalize',
                      }}
                    >
                      {KIND_LABELS[kind]}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section style={{
              background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px',
              padding: 'var(--space-3)'
            }}>
              <strong style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dim)' }}>
                Cross-module paths
              </strong>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                <li style={{ color: 'var(--text-muted)' }}>
                  Entity → <span style={{ color: 'var(--state-proposed)' }}>Annals events</span> → Roll evidence
                </li>
                <li style={{ color: 'var(--text-muted)' }}>
                  Roll entry → <span style={{ color: 'var(--state-caution)' }}>Annals timeline</span> → Canon state
                </li>
                <li style={{ color: 'var(--text-muted)' }}>
                  Annals event → <span style={{ color: 'var(--state-risk)' }}>Roll evidence</span> → Entity profile
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceLayout>
  );
}