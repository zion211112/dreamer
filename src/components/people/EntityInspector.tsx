import {
  ENTITY_TYPES,
  isPrimaryEntity,
  type NetworkEntity,
  type NetworkRelationship,
} from '../../lib/people-network';

interface EntityInspectorProps {
  entity: NetworkEntity | null;
  mobileOpen: boolean;
  entities: NetworkEntity[];
  relationships: NetworkRelationship[];
  recordScope: 'sample' | 'imported';
  onSelect: (entity: NetworkEntity) => void;
  onClose: () => void;
}

export function EntityInspector({ entity, mobileOpen, entities, relationships: allRelationships, recordScope, onSelect, onClose }: EntityInspectorProps) {
  if (!entity) {
    return (
      <aside className="people-inspector people-inspector--empty" aria-label="Network details">
        <p>Select a person, crew, or asset to see its relationships.</p>
      </aside>
    );
  }

  const typeLabel = ENTITY_TYPES.find((type) => type.id === entity.type)?.label ?? entity.type;
  const entityById = new Map(entities.map((item) => [item.id, item]));
  const relationships = allRelationships.flatMap((relationship) => {
    if (relationship.sourceId !== entity.id && relationship.targetId !== entity.id) return [];
    const isSource = relationship.sourceId === entity.id;
    const related = entityById.get(isSource ? relationship.targetId : relationship.sourceId);
    if (!related) return [];
    return [{
      id: relationship.id,
      entity: related,
      verb: relationship.verb,
      direction: isSource ? '→' : '←',
    }];
  });
  const connections = relationships.filter((item) => isPrimaryEntity(item.entity));

  const contextById = new Map<string, { entity: NetworkEntity; detail: string }>();
  for (const relationship of relationships.filter((item) => !isPrimaryEntity(item.entity))) {
    contextById.set(relationship.entity.id, {
      entity: relationship.entity,
      detail: relationship.direction === '→'
        ? `→ ${relationship.verb}`
        : `← ${relationship.verb}`,
    });

    for (const supporting of allRelationships) {
      if (supporting.sourceId !== relationship.entity.id && supporting.targetId !== relationship.entity.id) continue;
      const supportingId = supporting.sourceId === relationship.entity.id ? supporting.targetId : supporting.sourceId;
      const supportingEntity = entityById.get(supportingId);
      if (!supportingEntity || isPrimaryEntity(supportingEntity) || supportingEntity.id === entity.id) continue;
      const direction = supporting.sourceId === relationship.entity.id ? '→' : '←';
      const detail = `${direction} ${supporting.verb} · via ${relationship.entity.name}`;
      if (!contextById.has(supportingEntity.id)) {
        contextById.set(supportingEntity.id, { entity: supportingEntity, detail });
      }
    }
  }

  const context = [...contextById.values()].sort((a, b) => (
    a.entity.type.localeCompare(b.entity.type) || a.entity.name.localeCompare(b.entity.name)
  ));

  return (
    <aside className={`people-inspector${mobileOpen ? '' : ' is-mobile-closed'}`} aria-label={`${typeLabel} details`}>
      <header className="people-inspector-header">
        <div className="people-inspector-heading">
          <span className={`people-type-mark people-type-mark--${entity.type}`} aria-hidden="true" />
          <div>
            <p className="people-inspector-eyebrow">{typeLabel} · record scope</p>
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
          <div className="people-context-tags">
            {entity.location && <span className="people-context-tag">{entity.location}</span>}
            <span className="people-context-tag people-context-tag--signal">
              {recordScope === 'sample' ? 'Shared sample registry' : 'Imported portable record'}
            </span>
            {entity.assetReference && (
              <span className="people-context-tag">Sample register · {entity.assetReference}</span>
            )}
            {entity.recordBasis && (
              <span className="people-context-tag">
                {entity.recordBasis === 'illustrative' ? 'Illustrative example'
                  : entity.recordBasis === 'local-profile' ? 'Local profile'
                    : 'Project-reported'}
              </span>
            )}
            {entity.commonsContribution && <span className="people-context-tag people-context-tag--commons">Commons contribution</span>}
          </div>
        </section>

        <section className="people-inspector-section" aria-labelledby="people-capability-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-capability-heading">Current work</h3>
          </div>
          <div className="people-capability-list">
            {entity.capabilities.map((capability) => (
              <span className="people-capability" key={capability}>{capability}</span>
            ))}
          </div>
        </section>

        <section className="people-inspector-section" aria-labelledby="people-connections-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-connections-heading">Workflow</h3>
            <span>{connections.length.toString().padStart(2, '0')}</span>
          </div>
          {connections.length ? (
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
            <p className="people-no-connections">No active workflow links.</p>
          )}
        </section>

        {context.length > 0 && (
          <section className="people-inspector-section people-inspector-context" aria-labelledby="people-context-heading">
            <div className="people-inspector-section-heading">
              <h3 id="people-context-heading">Work &amp; provenance</h3>
              <span>{context.length.toString().padStart(2, '0')}</span>
            </div>
            <ul className="people-context-list">
              {context.map(({ entity: related, detail }) => (
                <li key={related.id}>
                  <span>{related.type}</span>
                  <strong>{related.name}</strong>
                  <small>{detail}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="people-inspector-footer">
        <span className="people-sample-indicator" />
        {recordScope === 'sample' ? 'Shared example · not live activity' : 'User-selected portable record'}
      </footer>
    </aside>
  );
}
