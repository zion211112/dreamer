import {
  ENTITY_BY_ID,
  ENTITY_TYPES,
  PEOPLE_RELATIONSHIPS,
  type NetworkEntity,
} from '../../lib/people-network';

interface EntityInspectorProps {
  entity: NetworkEntity | null;
  onSelect: (entity: NetworkEntity) => void;
  onClose: () => void;
}

export function EntityInspector({ entity, onSelect, onClose }: EntityInspectorProps) {
  if (!entity) {
    return (
      <aside className="people-inspector people-inspector--empty" aria-label="Entity details">
        <div className="people-inspector-empty-mark" aria-hidden="true">+</div>
        <p>Choose any point in the network to inspect the work and relationships around it.</p>
      </aside>
    );
  }

  const typeLabel = ENTITY_TYPES.find((type) => type.id === entity.type)?.label ?? entity.type;
  const connections = PEOPLE_RELATIONSHIPS.flatMap((relationship) => {
    if (relationship.sourceId !== entity.id && relationship.targetId !== entity.id) return [];
    const isSource = relationship.sourceId === entity.id;
    const otherId = isSource ? relationship.targetId : relationship.sourceId;
    const other = ENTITY_BY_ID.get(otherId);
    if (!other) return [];
    return [{
      id: relationship.id,
      entity: other,
      kind: relationship.kind,
      verb: relationship.verb,
      direction: isSource ? '→' : '←',
    }];
  });

  return (
    <aside className="people-inspector" aria-label={`${typeLabel} details`}>
      <header className="people-inspector-header">
        <div className="people-inspector-heading">
          <span className={`people-type-mark people-type-mark--${entity.type}`} aria-hidden="true" />
          <div>
            <p className="people-inspector-eyebrow">{typeLabel} / illustrative record</p>
            <h2>{entity.name}</h2>
          </div>
        </div>
        <button className="people-inspector-close" type="button" onClick={onClose} aria-label="Close details">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="people-inspector-content">
        <section className="people-inspector-summary">
          <span className="people-inspector-role">{entity.role}</span>
          <p>{entity.summary}</p>
          {(entity.location || entity.context) && (
            <div className="people-context-tags">
              {entity.location && <span className="people-context-tag">{entity.location}</span>}
              {entity.context && <span className="people-context-tag">{entity.context}</span>}
              {entity.commonsContribution && <span className="people-context-tag people-context-tag--commons">Commons contribution</span>}
            </div>
          )}
        </section>

        <section className="people-inspector-section" aria-labelledby="people-capability-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-capability-heading">Capability</h3>
            <span>{entity.capabilities.length.toString().padStart(2, '0')}</span>
          </div>
          <div className="people-capability-list">
            {entity.capabilities.map((capability) => (
              <span className="people-capability" key={capability}>{capability}</span>
            ))}
          </div>
        </section>

        <section className="people-inspector-section" aria-labelledby="people-connections-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-connections-heading">Connected through</h3>
            <span>{connections.length.toString().padStart(2, '0')}</span>
          </div>
          {connections.length > 0 ? (
            <ul className="people-connection-list">
              {connections.map((connection) => {
                const connectedType = ENTITY_TYPES.find((type) => type.id === connection.entity.type)?.label ?? connection.entity.type;
                return (
                  <li key={connection.id}>
                    <button
                      type="button"
                      className="people-connection"
                      onClick={() => onSelect(connection.entity)}
                      aria-label={`${connection.direction === '→' ? connection.verb : `is ${connection.verb} by`} ${connectedType}: ${connection.entity.name}`}
                    >
                      <span className={`people-connection-mark people-connection-mark--${connection.entity.type}`} aria-hidden="true" />
                      <span className="people-connection-copy">
                        <span className="people-connection-verb">
                          {connection.direction === '→' ? `${connection.verb} →` : `← ${connection.verb}`}
                        </span>
                        <span className="people-connection-name">{connection.entity.name}</span>
                      </span>
                      <span className="people-connection-type">{connectedType}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="people-no-connections">No sample relationships are attached to this record.</p>
          )}
        </section>
      </div>

      <footer className="people-inspector-footer">
        <span className="people-sample-indicator" />
        Illustrative record · not a live profile
      </footer>
    </aside>
  );
}
