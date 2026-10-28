import { useEffect, useRef } from 'preact/hooks';
import {
  ENTITY_TYPES,
  ENTITY_BY_ID,
  PEOPLE_NETWORK,
  PEOPLE_RELATIONSHIPS,
  PRIMARY_ENTITY_TYPES,
  isPrimaryEntity,
  type NetworkEntity,
  type PrimaryEntityType,
} from '../../lib/people-network';

interface PositionedEntity {
  entity: NetworkEntity;
  x: number;
  y: number;
}

interface PositionedRelationship {
  id: string;
  source: PositionedEntity;
  target: PositionedEntity;
  verb: string;
  curve: number;
}

interface NetworkMapProps {
  rootId: string;
  selectedId: string;
  query: string;
  onSelect: (entity: NetworkEntity) => void;
}

const CENTER = { x: 500, y: 318 };
const COLUMN_X: Record<PrimaryEntityType, number> = {
  person: 170,
  crew: 500,
  asset: 830,
};

const PRIMARY_RELATIONSHIPS = PEOPLE_RELATIONSHIPS.filter((relationship) => {
  const source = ENTITY_BY_ID.get(relationship.sourceId);
  const target = ENTITY_BY_ID.get(relationship.targetId);
  return Boolean(source && target && isPrimaryEntity(source) && isPrimaryEntity(target));
});

function getVisibleEntities() {
  return PRIMARY_ENTITY_TYPES.flatMap((type) => {
    const entities = PEOPLE_NETWORK.filter(isPrimaryEntity).filter((entity) => entity.type === type);
    const rowGap = 82;
    const firstY = CENTER.y - ((entities.length - 1) * rowGap) / 2;
    return entities.map((entity, index) => ({
      entity,
      x: COLUMN_X[type],
      y: firstY + index * rowGap,
    }));
  });
}

function getRelationships(positionedEntities: PositionedEntity[]): PositionedRelationship[] {
  const positions = new Map(positionedEntities.map((item) => [item.entity.id, item]));
  return PRIMARY_RELATIONSHIPS.flatMap((edge, index) => {
    const source = positions.get(edge.sourceId);
    const target = positions.get(edge.targetId);
    if (!source || !target) return [];
    return [{
      id: edge.id,
      source,
      target,
      verb: edge.verb,
      curve: ((index % 3) - 1) * 18,
    }];
  });
}

function shapeFor(type: PrimaryEntityType, x: number, y: number, selected: boolean) {
  const className = `people-node-shape${selected ? ' is-selected' : ''}`;
  switch (type) {
    case 'person':
      return <circle className={className} cx={x} cy={y} r={22} />;
    case 'crew':
      return <path className={className} d={`M ${x - 26} ${y - 14} L ${x - 14} ${y - 25} L ${x + 14} ${y - 25} L ${x + 26} ${y - 14} L ${x + 26} ${y + 14} L ${x + 14} ${y + 25} L ${x - 14} ${y + 25} L ${x - 26} ${y + 14} Z`} />;
    case 'asset':
      return <path className={className} d={`M ${x} ${y - 27} L ${x + 27} ${y} L ${x} ${y + 27} L ${x - 27} ${y} Z`} />;
  }
}

function relationshipPath(edge: PositionedRelationship) {
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;
  const length = Math.hypot(dx, dy) || 1;
  const inset = 31;
  const sourceX = edge.source.x + (dx / length) * inset;
  const sourceY = edge.source.y + (dy / length) * inset;
  const targetX = edge.target.x - (dx / length) * inset;
  const targetY = edge.target.y - (dy / length) * inset;
  const midpointX = (sourceX + targetX) / 2;
  const midpointY = (sourceY + targetY) / 2;
  const offsetX = (-dy / length) * edge.curve;
  const offsetY = (dx / length) * edge.curve;
  return `M ${sourceX} ${sourceY} Q ${midpointX + offsetX} ${midpointY + offsetY} ${targetX} ${targetY}`;
}

function relationshipLabelPoint(edge: PositionedRelationship) {
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;
  const length = Math.hypot(dx, dy) || 1;
  const sourceX = edge.source.x + (dx / length) * 31;
  const sourceY = edge.source.y + (dy / length) * 31;
  const targetX = edge.target.x - (dx / length) * 31;
  const targetY = edge.target.y - (dy / length) * 31;
  const midpointX = (sourceX + targetX) / 2;
  const midpointY = (sourceY + targetY) / 2;
  return {
    x: midpointX + (-dy / length) * edge.curve * 0.5,
    y: midpointY + (dx / length) * edge.curve * 0.5,
  };
}

export function NetworkMap({
  rootId,
  selectedId,
  query,
  onSelect,
}: NetworkMapProps) {
  const panRef = useRef<HTMLDivElement>(null);
  const positionedEntities = getVisibleEntities();
  const visibleRelationships = getRelationships(positionedEntities);
  const normalizedQuery = query.trim().toLowerCase();
  const rootEntity = ENTITY_BY_ID.get(rootId);

  useEffect(() => {
    const mapViewport = panRef.current;
    if (mapViewport && window.matchMedia('(max-width: 760px)').matches) {
      mapViewport.scrollLeft = (mapViewport.scrollWidth - mapViewport.clientWidth) / 2;
    }
  }, [rootId]);

  return (
    <div className="people-map-frame">
      <div className="people-map-topline">
        <div>
          <span className="people-map-kicker">NETWORK</span>
          <span className="people-map-focus">
            {rootEntity ? `${rootEntity.type} · ${rootEntity.name}` : 'Network'}
          </span>
        </div>
        <span className="people-map-hint">Select a node to trace its connections</span>
      </div>

      <div className="people-map-pan" ref={panRef} tabIndex={0} role="region" aria-label="Pan relationship map horizontally">
        <svg
          className="people-map"
          viewBox="0 0 1000 640"
          role="group"
          aria-label="People, crews, and assets connected by explicit relationships"
        >
        <defs>
          <radialGradient id="people-map-atmosphere">
            <stop offset="0%" stopColor="var(--terrain)" stopOpacity=".09" />
            <stop offset="100%" stopColor="var(--bg-term)" stopOpacity="0" />
          </radialGradient>
          <marker id="people-map-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 6 3.5 L 0 7 Z" className="people-map-arrowhead" />
          </marker>
        </defs>
        <rect width="1000" height="640" className="people-map-ground" />
        <circle cx={CENTER.x} cy={CENTER.y} r="300" fill="url(#people-map-atmosphere)" />
        <path d="M 335 38 V 606 M 665 38 V 606" className="people-map-divider" />
        <g className="people-map-lanes" aria-hidden="true">
          {PRIMARY_ENTITY_TYPES.map((type) => {
            const count = positionedEntities.filter((item) => item.entity.type === type).length;
            const label = ENTITY_TYPES.find((item) => item.id === type)?.plural ?? type;
            return (
              <g key={type}>
                <text x={COLUMN_X[type]} y="54" textAnchor="middle">{label.toUpperCase()}</text>
                <text x={COLUMN_X[type]} y="72" textAnchor="middle">{count.toString().padStart(2, '0')} RECORDS</text>
              </g>
            );
          })}
        </g>

        <g aria-hidden="true">
          {visibleRelationships.map((edge) => {
            const touchesRoot = edge.source.entity.id === rootId || edge.target.entity.id === rootId;
            const sourceMatches = !normalizedQuery || edge.source.entity.name.toLowerCase().includes(normalizedQuery);
            const targetMatches = !normalizedQuery || edge.target.entity.name.toLowerCase().includes(normalizedQuery);
            const labelPoint = relationshipLabelPoint(edge);
            const showLabel = touchesRoot;
            const labelWidth = Math.max(62, edge.verb.length * 5.8 + 18);

            return (
              <g key={edge.id} className={`people-relationship${normalizedQuery && !sourceMatches && !targetMatches ? ' is-muted' : ''}`}>
                <path d={relationshipPath(edge)} markerEnd="url(#people-map-arrow)" />
                {showLabel && (
                  <g className="people-relationship-label" transform={`translate(${labelPoint.x}, ${labelPoint.y})`}>
                    <rect x={-labelWidth / 2} y="-10" width={labelWidth} height="20" rx="10" />
                    <text textAnchor="middle" dominantBaseline="central">{edge.verb}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        <g>
          {positionedEntities.map(({ entity, x, y }) => {
            const selected = entity.id === selectedId;
            const matches = !normalizedQuery || entity.name.toLowerCase().includes(normalizedQuery)
              || entity.role.toLowerCase().includes(normalizedQuery)
              || entity.capabilities.some((capability) => capability.toLowerCase().includes(normalizedQuery));
            const typeLabel = ENTITY_TYPES.find((type) => type.id === entity.type)?.label ?? entity.type;
            const visibleName = entity.name.length > 21 ? `${entity.name.slice(0, 19)}…` : entity.name;

            return (
              <g
                key={entity.id}
                className={`people-node people-node--${entity.type}${selected ? ' is-selected' : ''}${matches ? ' is-match' : ' is-dimmed'}${entity.id === rootId ? ' is-root' : ''}`}
                role="button"
                tabindex={0}
                aria-label={`${typeLabel}: ${entity.name}`}
                aria-pressed={selected}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(entity);
                }}
                onKeyDown={(event: KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(entity);
                  }
                }}
              >
                <title>{`${typeLabel}: ${entity.name} — ${entity.role}`}</title>
                {selected && <circle className="people-node-halo" cx={x} cy={y} r="42" />}
                {shapeFor(entity.type, x, y, selected)}
                <circle className="people-node-core" cx={x} cy={y} r="3" />
                <text className="people-node-type" x={x} y={y + 4} textAnchor="middle">{typeLabel.toUpperCase()}</text>
                <text className="people-node-label" x={x} y={y + 47} textAnchor="middle">{visibleName}</text>
              </g>
            );
          })}
        </g>
        </svg>
      </div>

      <div className="people-map-footer">
        <span><span className="people-map-live-dot" /> Illustrative network · local sample</span>
        <span>Roll = verified deployment · future SBT needs evidence + asset-owner/qualified-peer attestations · no token mining or SBT issuance</span>
      </div>
    </div>
  );
}
