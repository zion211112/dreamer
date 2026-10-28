import { useEffect, useRef } from 'preact/hooks';
import {
  ENTITY_TYPES,
  ENTITY_BY_ID,
  PEOPLE_RELATIONSHIPS,
  type EntityType,
  type NetworkEntity,
  type RelationshipKind,
} from '../../lib/people-network';

interface PositionedEntity {
  entity: NetworkEntity;
  depth: number;
  x: number;
  y: number;
}

interface PositionedRelationship {
  id: string;
  source: PositionedEntity;
  target: PositionedEntity;
  verb: string;
  kind: RelationshipKind;
  curve: number;
}

interface NetworkMapProps {
  rootId: string;
  selectedId: string;
  query: string;
  relationshipKind: RelationshipKind | null;
  onSelect: (entity: NetworkEntity) => void;
}

const CENTER = { x: 500, y: 318 };
const ROOT_RADIUS = { x: 145, y: 118 };
const OUTER_RADIUS = { x: 265, y: 215 };

function getVisibleEntities(rootId: string, relationshipKind: RelationshipKind | null) {
  const depths = new Map<string, number>([[rootId, 0]]);
  let frontier = [rootId];

  for (let depth = 1; depth <= 2; depth += 1) {
    const next = new Set<string>();
    for (const edge of PEOPLE_RELATIONSHIPS) {
      if (relationshipKind && edge.kind !== relationshipKind) continue;
      if (frontier.includes(edge.sourceId) && !depths.has(edge.targetId)) next.add(edge.targetId);
      if (frontier.includes(edge.targetId) && !depths.has(edge.sourceId)) next.add(edge.sourceId);
    }
    frontier = [...next].sort();
    frontier.forEach((id) => depths.set(id, depth));
  }

  const layers = [1, 2].map((depth) => (
    [...depths.entries()]
      .filter(([, entityDepth]) => entityDepth === depth)
      .map(([id]) => ENTITY_BY_ID.get(id))
      .filter((entity): entity is NetworkEntity => Boolean(entity))
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
  ));
  const root = ENTITY_BY_ID.get(rootId);
  if (!root) return [];

  const positioned: PositionedEntity[] = [{ entity: root, depth: 0, ...CENTER }];
  layers.forEach((entities, layerIndex) => {
    const radius = layerIndex === 0 ? ROOT_RADIUS : OUTER_RADIUS;
    entities.forEach((entity, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(entities.length, 1);
      positioned.push({
        entity,
        depth: layerIndex + 1,
        x: CENTER.x + Math.cos(angle) * radius.x,
        y: CENTER.y + Math.sin(angle) * radius.y,
      });
    });
  });
  return positioned;
}

function getRelationships(
  positionedEntities: PositionedEntity[],
  relationshipKind: RelationshipKind | null,
): PositionedRelationship[] {
  const positions = new Map(positionedEntities.map((item) => [item.entity.id, item]));
  return PEOPLE_RELATIONSHIPS
    .filter((edge) => !relationshipKind || edge.kind === relationshipKind)
    .flatMap((edge, index) => {
      const source = positions.get(edge.sourceId);
      const target = positions.get(edge.targetId);
      if (!source || !target) return [];
      return [{
        id: edge.id,
        source,
        target,
        verb: edge.verb,
        kind: edge.kind,
        curve: ((index % 3) - 1) * 18,
      }];
    });
}

function shapeFor(type: EntityType, x: number, y: number, selected: boolean) {
  const className = `people-node-shape${selected ? ' is-selected' : ''}`;
  switch (type) {
    case 'person':
      return <circle className={className} cx={x} cy={y} r={22} />;
    case 'crew':
      return <path className={className} d={`M ${x - 26} ${y - 14} L ${x - 14} ${y - 25} L ${x + 14} ${y - 25} L ${x + 26} ${y - 14} L ${x + 26} ${y + 14} L ${x + 14} ${y + 25} L ${x - 14} ${y + 25} L ${x - 26} ${y + 14} Z`} />;
    case 'asset':
      return <path className={className} d={`M ${x} ${y - 27} L ${x + 27} ${y} L ${x} ${y + 27} L ${x - 27} ${y} Z`} />;
    case 'work':
      return <rect className={className} x={x - 39} y={y - 23} width={78} height={46} rx={10} />;
    case 'institution':
      return <path className={className} d={`M ${x - 27} ${y - 13} L ${x} ${y - 28} L ${x + 27} ${y - 13} L ${x + 27} ${y + 23} L ${x - 27} ${y + 23} Z`} />;
    case 'evidence':
      return <path className={className} d={`M ${x - 22} ${y - 26} L ${x + 8} ${y - 26} L ${x + 22} ${y - 12} L ${x + 22} ${y + 26} L ${x - 22} ${y + 26} Z M ${x + 8} ${y - 26} L ${x + 8} ${y - 12} L ${x + 22} ${y - 12}`} />;
  }
}

function relationshipPath(edge: PositionedRelationship) {
  const midpointX = (edge.source.x + edge.target.x) / 2;
  const midpointY = (edge.source.y + edge.target.y) / 2;
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (-dy / length) * edge.curve;
  const offsetY = (dx / length) * edge.curve;
  return `M ${edge.source.x} ${edge.source.y} Q ${midpointX + offsetX} ${midpointY + offsetY} ${edge.target.x} ${edge.target.y}`;
}

function relationshipLabelPoint(edge: PositionedRelationship) {
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;
  const length = Math.hypot(dx, dy) || 1;
  const midpointX = (edge.source.x + edge.target.x) / 2;
  const midpointY = (edge.source.y + edge.target.y) / 2;
  return {
    x: midpointX + (-dy / length) * edge.curve * 0.5,
    y: midpointY + (dx / length) * edge.curve * 0.5,
  };
}

export function NetworkMap({
  rootId,
  selectedId,
  query,
  relationshipKind,
  onSelect,
}: NetworkMapProps) {
  const panRef = useRef<HTMLDivElement>(null);
  const positionedEntities = getVisibleEntities(rootId, relationshipKind);
  const visibleRelationships = getRelationships(positionedEntities, relationshipKind);
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
          <span className="people-map-kicker">RELATIONSHIP ATLAS</span>
          <span className="people-map-focus">
            Focus / {rootEntity ? `${rootEntity.type} · ${rootEntity.name}` : 'Network'}
          </span>
        </div>
        <span className="people-map-hint">Select a node to trace its connections</span>
      </div>

      <div className="people-map-pan" ref={panRef} tabIndex={0} role="region" aria-label="Pan relationship map horizontally">
        <svg
          className="people-map"
          viewBox="0 0 1000 640"
          role="group"
          aria-label="Connected people, crews, assets, work, institutions, and evidence"
        >
        <defs>
          <pattern id="people-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" className="people-map-grid-line" />
          </pattern>
          <radialGradient id="people-map-atmosphere">
            <stop offset="0%" stopColor="var(--terrain)" stopOpacity=".09" />
            <stop offset="100%" stopColor="var(--bg-term)" stopOpacity="0" />
          </radialGradient>
          <marker id="people-map-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 6 3.5 L 0 7 Z" className="people-map-arrowhead" />
          </marker>
        </defs>
        <rect width="1000" height="640" className="people-map-ground" />
        <rect width="1000" height="640" fill="url(#people-map-grid)" className="people-map-grid" />
        <circle cx={CENTER.x} cy={CENTER.y} r="300" fill="url(#people-map-atmosphere)" />

        <g aria-hidden="true">
          {visibleRelationships.map((edge) => {
            const touchesRoot = edge.source.entity.id === rootId || edge.target.entity.id === rootId;
            const sourceMatches = !normalizedQuery || edge.source.entity.name.toLowerCase().includes(normalizedQuery);
            const targetMatches = !normalizedQuery || edge.target.entity.name.toLowerCase().includes(normalizedQuery);
            const labelPoint = relationshipLabelPoint(edge);
            const showLabel = touchesRoot || relationshipKind !== null;
            const labelWidth = Math.max(62, edge.verb.length * 5.8 + 18);

            return (
              <g key={edge.id} className={`people-relationship people-relationship--${edge.kind}${normalizedQuery && !sourceMatches && !targetMatches ? ' is-muted' : ''}`}>
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
          {positionedEntities.map(({ entity, depth, x, y }) => {
            const selected = entity.id === selectedId;
            const matches = !normalizedQuery || entity.name.toLowerCase().includes(normalizedQuery)
              || entity.role.toLowerCase().includes(normalizedQuery)
              || entity.capabilities.some((capability) => capability.toLowerCase().includes(normalizedQuery));
            const typeLabel = ENTITY_TYPES.find((type) => type.id === entity.type)?.label ?? entity.type;
            const visibleName = entity.name.length > 21 ? `${entity.name.slice(0, 19)}…` : entity.name;

            return (
              <g
                key={entity.id}
                className={`people-node people-node--${entity.type}${selected ? ' is-selected' : ''}${matches ? ' is-match' : ' is-dimmed'}${depth === 0 ? ' is-root' : ''}`}
                role="button"
                tabIndex={0}
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
        <span>{positionedEntities.length} connected records · {visibleRelationships.length} explicit relationships</span>
      </div>
    </div>
  );
}
