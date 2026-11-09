import { useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { EntityInspector } from '../../components/people/EntityInspector';
import { PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS, type NetworkEntity, type RelationshipKind } from '../../lib/people-network';

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

export type PeopleView = 'people' | 'crews' | 'network';

export function People() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelationshipKind | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);

  const filteredEntities = PEOPLE_NETWORK.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.capabilities.some(c => c.toLowerCase().includes(q));
  });

  function handleEntitySelect(entity: NetworkEntity | null) {
    setSelectedEntity(entity);
  }

  function handleRelationshipFilter(kind: RelationshipKind | 'all') {
    setActiveFilter(kind);
  }

  return (
    <WorkspaceLayout currentContext="network:people">
      <div className="people-page">
        <header className="people-page-header">
          <div className="people-page-title">
            <h1>People</h1>
            <span className="people-page-divider" aria-hidden="true">/</span>
            <span className="people-page-caption">Find capability, services, and collaborators</span>
          </div>
          <div className="people-page-status">
            <span className="people-page-status-dot" />
            <span>Shared examples Â· not live records</span>
          </div>
        </header>

        <p className="people-capability-shortcut">
          <span>Looking for a capability directory?</span>
          <Link href="/workspace/network/capabilities">Browse capabilities <span aria-hidden="true">â†’</span></Link>
        </p>

        <div className="people-workbench" aria-label="People capability directory and network">
          <div className="people-directory-panel">
            <div className="people-directory-controls">
              <div className="people-directory-search">
                <span className="people-directory-search-icon" aria-hidden="true">&#8226;</span>
                <input
                  type="search"
                  placeholder="Filter by name, role, capability, IDâ€¦"
                  value={searchQuery}
                  onChange={(e: Event) => setSearchQuery((e.target as HTMLInputElement).value)}
                  className="people-directory-search-input"
                  aria-label="Search entities"
                />
              </div>
              <div className="people-directory-filters">
                {RELATIONSHIP_KINDS.filter(k => k !== 'all').map(kind => (
                  <button
                    key={kind}
                    onClick={() => handleRelationshipFilter(kind)}
                    className={`network-relationship-tag ${activeFilter === kind ? 'is-active' : ''}`}
                    type="button"
                  >
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>
            </div>

            <div className="people-directory-summary">
              <span>{filteredEntities.length} of {PEOPLE_NETWORK.length} entities</span>
              <span>/</span>
              <span>{PEOPLE_RELATIONSHIPS.length} relationships</span>
            </div>

            <ul className="people-directory-list" role="list">
              {filteredEntities.map(entity => (
                <li key={entity.id} className="people-directory-row" onClick={() => handleEntitySelect(entity)}>
                  <span
                    className={`people-type-mark people-type-mark--${entity.type}`}
                    aria-hidden="true"
                  />
                  <div className="people-directory-main">
                    <div className="people-directory-identity">
                      <strong>{entity.name}</strong>
                      <small>{entity.id}</small>
                    </div>
                    <div className="people-directory-role">{entity.role}</div>
                    {entity.capabilities.length > 0 && (
                      <div className="people-directory-capabilities">
                        {entity.capabilities.slice(0, 4).map(cap => (
                          <span key={cap} className="people-directory-capabilities-span">{cap}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="people-directory-open" aria-hidden="true">â†’</span>
                </li>
              ))}
              {filteredEntities.length === 0 && (
                <li className="people-directory-empty">No entities match your filter.</li>
              )}
            </ul>
          </div>

          {selectedEntity && (
            <EntityInspector
              entity={selectedEntity}
              directoryEntry={undefined}
              profiles={[]}
              profileOwnerId=""
              profileStoreReady={true}
              mobileOpen={false}
              entities={PEOPLE_NETWORK}
              relationships={PEOPLE_RELATIONSHIPS}
              recordScope="sample"
              onSelect={handleEntitySelect}
              onClose={() => handleEntitySelect(null)}
              onSaveProfile={() => {}}
            />
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
