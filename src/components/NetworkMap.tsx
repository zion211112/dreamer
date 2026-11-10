import { useEffect, useRef, useState, useMemo, useCallback } from 'preact/hooks';
import {
  ENTITY_TYPES,
  PRIMARY_ENTITY_TYPES,
  isPrimaryEntity,
  type NetworkEntity,
  type NetworkRelationship,
  type PrimaryEntityType,
  type EntityType,
  type RelationshipKind,
} from '../lib/people-network';

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
  entities: NetworkEntity[];
  relationships: NetworkRelationship[];
  // Fixed-layout mode (People.tsx)
  rootId?: string;
  selectedId?: string;
  query?: string;
  onSelect?: (entity: NetworkEntity) => void;
  // Simulation mode (Network.tsx)
  onEntitySelect?: (entity: NetworkEntity | null) => void;
  onRelationshipFilter?: (kind: RelationshipKind | 'all') => void;
  searchQuery?: string;
  activeFilter?: RelationshipKind | 'all';
  width?: number;
  height?: number;
}

const CENTER = { x: 500, y: 318 };
const COLUMN_X: Record<PrimaryEntityType, number> = {
  person: 170,
  crew: 500,
  asset: 830,
};

const ENTITY_COLORS: Record<EntityType, string> = {
  person: 'var(--state-canon)',
  crew: 'var(--state-proposed)',
  asset: 'var(--state-caution)',
  institution: 'var(--state-risk)',
  work: 'var(--muted)',
  evidence: 'var(--dim)',
  project: 'var(--brass)',
};

const ENTITY_RADIUS: Record<EntityType, number> = {
  person: 8,
  crew: 10,
  asset: 7,
  institution: 9,
  work: 6,
  evidence: 5,
  project: 7,
};

const RELATIONSHIP_KINDS: RelationshipKind[] = [
  'membership', 'affiliation', 'work', 'stewardship', 'contribution',
  'evidence', 'owns', 'operates', 'stewards', 'funds',
  'contributes_to', 'attests', 'issues',
];

const KIND_LABELS: Record<RelationshipKind, string> = {
  membership: 'Member of',
  affiliation: 'Affiliated with',
  work: 'Works on',
  stewardship: 'Stewardship',
  contribution: 'Contribution',
  evidence: 'Evidenced by',
  owns: 'Owns',
  operates: 'Operates',
  stewards: 'Stewards',
  funds: 'Funds',
  contributes_to: 'Contributes to',
  attests: 'Attests',
  issues: 'Issues',
};

/* ─── Fixed-layout helpers (People.tsx mode) ─── */

function getVisibleEntities(entities: NetworkEntity[], rootId: string) {
  return PRIMARY_ENTITY_TYPES.flatMap((type) => {
    const laneEntities = entities.filter(isPrimaryEntity).filter((entity) => entity.type === type);
    const rowGap = Math.min(64, 500 / Math.max(1, laneEntities.length - 1));
    const rootIndex = laneEntities.findIndex((entity) => entity.id === rootId);
    if (rootIndex >= 0) {
      return laneEntities.map((entity, index) => {
        if (index === rootIndex) return { entity, x: COLUMN_X[type], y: CENTER.y };
        const peerIndex = index < rootIndex ? index : index - 1;
        const direction = peerIndex % 2 === 0 ? -1 : 1;
        const step = Math.ceil((peerIndex + 1) / 2);
        return { entity, x: COLUMN_X[type], y: CENTER.y + direction * step * rowGap };
      });
    }
    const firstY = CENTER.y - ((laneEntities.length - 1) * rowGap) / 2;
    return laneEntities.map((entity, index) => ({
      entity,
      x: COLUMN_X[type],
      y: firstY + index * rowGap,
    }));
  });
}

function getRelationships(
  positionedEntities: PositionedEntity[],
  entities: NetworkEntity[],
  relationships: NetworkRelationship[],
): PositionedRelationship[] {
  const positions = new Map(positionedEntities.map((item) => [item.entity.id, item]));
  const entityById = new Map(entities.map((entity) => [entity.id, entity]));
  return relationships.flatMap((edge, index) => {
    const sourceEntity = entityById.get(edge.sourceId);
    const targetEntity = entityById.get(edge.targetId);
    if (!sourceEntity || !targetEntity || !isPrimaryEntity(sourceEntity) || !isPrimaryEntity(targetEntity)) return [];
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

/* ─── Simulation helpers (Network.tsx mode) ─── */

interface SimNode extends NetworkEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  verb: string;
  source: SimNode;
  target: SimNode;
}

export function NetworkMap({
  entities,
  relationships,
  rootId,
  selectedId,
  query,
  onSelect,
  onEntitySelect,
  onRelationshipFilter,
  searchQuery = '',
  activeFilter = 'all',
  width = 800,
  height = 500,
}: NetworkMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const [hoveredEntity, setHoveredEntity] = useState<NetworkEntity | null>(null);
  const [hoveredId, setHoveredId] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  const normalizedQuery = (query || searchQuery || '').trim().toLowerCase();

  /* ── Fixed-layout mode (when rootId is provided) ── */
  if (rootId) {
    const positionedEntities = useMemo(() => getVisibleEntities(entities, rootId), [entities, rootId]);
    const visibleRelationships = useMemo(() => getRelationships(positionedEntities, entities, relationships), [positionedEntities, entities, relationships]);
    const focusId = hoveredId || selectedId || rootId;
    const rootEntity = entities.find((entity) => entity.id === rootId);
    const focusEntityIds = new Set([focusId]);
    visibleRelationships.forEach((edge) => {
      if (edge.source.entity.id === focusId) focusEntityIds.add(edge.target.entity.id);
      if (edge.target.entity.id === focusId) focusEntityIds.add(edge.source.entity.id);
    });

    useEffect(() => {
      const mapViewport = panRef.current;
      if (!mapViewport || !window.matchMedia('(max-width: 760px)').matches) return;
      const rootType = entities.find((entity) => entity.id === rootId)?.type;
      if (!rootType || !PRIMARY_ENTITY_TYPES.includes(rootType as PrimaryEntityType)) return;
      const mapScale = (mapViewport.querySelector('svg')?.getBoundingClientRect().width ?? 1000) / 1000;
      const focusX = COLUMN_X[rootType as PrimaryEntityType] * mapScale;
      mapViewport.scrollLeft = Math.max(0, Math.min(
        mapViewport.scrollWidth - mapViewport.clientWidth,
        focusX - mapViewport.clientWidth / 2,
      ));
    }, [entities, rootId]);

    const handleSelect = useCallback((entity: NetworkEntity) => {
      onSelect?.(entity);
      onEntitySelect?.(entity);
    }, [onSelect, onEntitySelect]);

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
            <pattern id="people-map-grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 H 0 V 28" fill="none" stroke="rgba(195, 212, 188, .045)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1" fill="rgba(195, 212, 188, .12)" />
            </pattern>
            <marker id="people-map-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 6 3.5 L 0 7 Z" className="people-map-arrowhead" />
            </marker>
          </defs>
          <rect width="1000" height="640" className="people-map-ground" />
          <rect width="1000" height="640" className="people-map-grid" />
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
              const touchesFocus = edge.source.entity.id === focusId || edge.target.entity.id === focusId;
              const sourceMatches = !normalizedQuery || edge.source.entity.name.toLowerCase().includes(normalizedQuery);
              const targetMatches = !normalizedQuery || edge.target.entity.name.toLowerCase().includes(normalizedQuery);
              const labelPoint = relationshipLabelPoint(edge);
              const showLabel = touchesFocus;
              const labelWidth = Math.max(62, edge.verb.length * 5.8 + 18);

              return (
                <g key={edge.id} className={`people-relationship${touchesFocus ? ' is-focus-link' : ''}${normalizedQuery && !sourceMatches && !targetMatches ? ' is-muted' : ''}`}>
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
              const visibleName = entity.name.length > 19 ? `${entity.name.slice(0, 17)}…` : entity.name;
              const isRoot = entity.id === rootId;
              const labelX = x > CENTER.x ? x - 38 : x + 38;
              const labelAnchor = x > CENTER.x ? 'end' : 'start';

              return (
                <g
                  key={entity.id}
                  className={`people-node people-node--${entity.type}${selected ? ' is-selected' : ''}${matches ? ' is-match' : ' is-dimmed'}${isRoot ? ' is-root' : ''}${focusEntityIds.has(entity.id) ? ' is-neighbor' : ' is-unrelated'}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${typeLabel}: ${entity.name}, ${entity.role}`}
                  aria-pressed={selected}
                  onMouseEnter={() => setHoveredId(entity.id)}
                  onMouseLeave={() => setHoveredId('')}
                  onFocus={() => setHoveredId(entity.id)}
                  onBlur={() => setHoveredId('')}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelect(entity);
                  }}
                  onKeyDown={(event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelect(entity);
                    }
                  }}
                >
                  <title>{`${typeLabel}: ${entity.name} — ${entity.role}`}</title>
                  {entity.id === focusId && <circle className="people-node-halo" cx={x} cy={y} r="42" />}
                  {shapeFor(entity.type, x, y, selected)}
                  <circle className="people-node-core" cx={x} cy={y} r="3" />
                  <text className="people-node-type" x={x} y={y + 4} textAnchor="middle">{typeLabel.toUpperCase()}</text>
                  <text className="people-node-label" x={labelX} y={y + 4} textAnchor={labelAnchor}>{visibleName}</text>
                </g>
              );
            })}
          </g>
          </svg>
        </div>

        <div className="people-map-footer">
          <span className="people-map-legend" aria-label="Entity types">
            {PRIMARY_ENTITY_TYPES.map((type) => (
              <span className="people-map-legend-item" key={type}>
                <i className={`people-map-legend-mark people-map-legend-mark--${type}`} />
                {ENTITY_TYPES.find((entityType) => entityType.id === type)?.plural}
              </span>
            ))}
          </span>
          <span>{positionedEntities.length} primary records · {visibleRelationships.length} direct links</span>
        </div>
      </div>
    );
  }

  /* ── Simulation mode (default, Network.tsx) ── */

  const [simulation, setSimulation] = useState<{
    nodes: SimNode[];
    links: SimLink[];
    alpha: number;
  } | null>(null);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;
    const q = searchQuery.toLowerCase();
    return entities.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.capabilities.some((c: string) => c.toLowerCase().includes(q))
    );
  }, [entities, searchQuery]);

  const filteredRelationships = useMemo(() => {
    if (activeFilter === 'all') return relationships;
    return relationships.filter(r => r.kind === activeFilter);
  }, [relationships, activeFilter]);

  const entityMap = useMemo(() => {
    const map = new Map<string, SimNode>();
    filteredEntities.forEach(e => {
      map.set(e.id, { ...e, x: width / 2 + (Math.random() - 0.5) * 200, y: height / 2 + (Math.random() - 0.5) * 200, vx: 0, vy: 0 });
    });
    return map;
  }, [filteredEntities, width, height]);

  const links = useMemo(() => {
    return filteredRelationships
      .map(r => {
        const source = entityMap.get(r.sourceId);
        const target = entityMap.get(r.targetId);
        if (!source || !target) return null;
        return { ...r, source, target };
      })
      .filter((l): l is SimLink => l !== null);
  }, [filteredRelationships, entityMap]);

  const nodes = useMemo(() => Array.from(entityMap.values()), [entityMap]);

  useEffect(() => {
    if (!svgRef.current) return;

    const simNodes = nodes;
    const simLinks = links;

    let alpha = 1;
    const alphaDecay = 0.02;
    const alphaMin = 0.001;
    const velocityDecay = 0.4;
    const linkDistance = 120;
    const linkStrength = 0.1;
    const chargeStrength = -300;
    const centerX = width / 2;
    const centerY = height / 2;
    const centerStrength = 0.01;

    const tick = () => {
      alpha -= alphaDecay;
      if (alpha < alphaMin) {
        setSimulation(prev => prev ? { ...prev, alpha: 0 } : null);
        return;
      }

      for (const link of simLinks) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - linkDistance) * linkStrength * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      }

      for (const node of simNodes) {
        for (const other of simNodes) {
          if (node === other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (chargeStrength / (dist * dist)) * alpha;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      for (const node of simNodes) {
        if (node.fx != null || node.fy != null) continue;
        const cx = (centerX - node.x) * centerStrength * alpha;
        const cy = (centerY - node.y) * centerStrength * alpha;
        node.vx += cx;
        node.vy += cy;
      }

      for (const node of simNodes) {
        node.vx *= velocityDecay;
        node.vy *= velocityDecay;
        if (node.fx == null) node.x += node.vx;
        if (node.fy == null) node.y += node.vy;
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      }

      setSimulation(prev => prev ? { nodes: simNodes, links: simLinks, alpha } : null);
      requestAnimationFrame(tick);
    };

    setSimulation({ nodes: simNodes, links: simLinks, alpha: 1 });
    requestAnimationFrame(tick);
  }, [nodes, links, width, height]);

  function handleCanvasClick() {
    setSelectedEntity(null);
    onEntitySelect?.(null);
  }

  if (!simulation) {
    return (
      <svg ref={svgRef} width={width} height={height} className="network-map" viewBox={`0 0 ${width} ${height}`}>
        <rect width="100%" height="100%" fill="var(--panel)" />
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--muted)" fontFamily="var(--mono)" fontSize="12">Initializing graph…</text>
      </svg>
    );
  }

  const { nodes: simNodes, links: simLinks } = simulation;

  return (
    <div className="network-map-container" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="network-map"
        viewBox={`0 0 ${width} ${height}`}
        onClick={handleCanvasClick}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L9,3.5 Z" fill="var(--line)" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="var(--bg)" />

        {simLinks.map((link, i) => {
          const isFiltered = activeFilter !== 'all' && link.kind !== activeFilter;
          const isHighlighted = hoveredEntity &&
            (link.source.id === hoveredEntity.id || link.target.id === hoveredEntity.id);
          const isSelected = selectedEntity &&
            (link.source.id === selectedEntity.id || link.target.id === selectedEntity.id);
          return (
            <line
              key={i}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke={isSelected ? 'var(--state-canon)' : isHighlighted ? 'var(--state-proposed)' : isFiltered ? 'var(--line-faint)' : 'var(--line)'}
              strokeWidth={isSelected || isHighlighted ? 2 : 1}
              strokeDasharray={isFiltered ? '4,4' : 'none'}
              markerEnd={isSelected || isHighlighted ? 'url(#arrowhead)' : 'none'}
              opacity={isFiltered ? 0.3 : isHighlighted ? 0.8 : 0.5}
              className="network-link"
            />
          );
        })}

        {simNodes.map(node => {
          const isSelected = selectedEntity?.id === node.id;
          const isHovered = hoveredEntity?.id === node.id;
          const isSearchMatch = !normalizedQuery || [node.id, node.type, node.name, node.role, node.summary, node.location, node.context, node.assetReference, node.recordBasis, ...node.capabilities]
            .some(value => value?.toLowerCase().includes(normalizedQuery));
          const color = ENTITY_COLORS[node.type];
          const radius = ENTITY_RADIUS[node.type];
          return (
            <g
              key={node.id}
              className={`network-node${isSelected || isHovered ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${node.type}: ${node.name}, ${node.role}`}
              aria-pressed={isSelected}
              onMouseEnter={() => setHoveredEntity(node)}
              onMouseLeave={() => setHoveredEntity(null)}
              onFocus={() => setHoveredEntity(node)}
              onBlur={() => setHoveredEntity(null)}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedEntity(node);
                onEntitySelect?.(node);
              }}
              onKeyDown={(event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedEntity(node);
                  onEntitySelect?.(node);
                }
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? radius + 3 : isHovered ? radius + 2 : radius}
                fill={color}
                stroke={isSelected ? 'var(--fg)' : 'var(--panel)'}
                strokeWidth={isSelected ? 2 : 1.5}
                opacity={isSearchMatch || !searchQuery ? 1 : 0.3}
              />
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 6}
                  fill="none"
                  stroke="var(--state-canon)"
                  strokeWidth={1.5}
                  strokeDasharray="4,4"
                />
              )}
            </g>
          );
        })}
      </svg>

      {selectedEntity && !onEntitySelect && (
        <div className="network-map-inspector">
          <div className="network-inspector-card">
            <div className="network-inspector-header">
              <strong className="network-inspector-name" style={{ color: ENTITY_COLORS[selectedEntity.type] }}>
                {selectedEntity.name}
              </strong>
              <button
                onClick={() => setSelectedEntity(null)}
                className="network-inspector-close-btn"
                aria-label="Close inspector"
              >
                ×
              </button>
            </div>
            <div className="network-inspector-type-id">
              {selectedEntity.type.toUpperCase()} · {selectedEntity.id}
            </div>
            <div className="network-inspector-summary">
              {selectedEntity.summary}
            </div>
            {selectedEntity.location && (
              <div className="network-inspector-location">
                📍 {selectedEntity.location}
              </div>
            )}
            {selectedEntity.capabilities.length > 0 && (
              <div className="network-inspector-capabilities">
                <div className="network-inspector-capabilities-label">CAPABILITIES</div>
                <div className="network-inspector-capability-list">
                  {selectedEntity.capabilities.slice(0, 6).map((cap: string, i: number) => (
                    <span key={i} className="network-inspector-capability-chip">
                      {cap}
                    </span>
                  ))}
                  {selectedEntity.capabilities.length > 6 && (
                    <span className="network-inspector-capability-more">
                      +{selectedEntity.capabilities.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="network-inspector-relationships">
              <div className="network-inspector-relationships-label">RELATIONSHIPS</div>
              <button
                onClick={() => onRelationshipFilter?.('all')}
                className="network-inspector-show-all-btn"
              >
                Show all connections
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="network-legend">
        <div className="network-legend-header">
          <strong className="network-legend-title">Legend</strong>
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className="network-legend-toggle-btn"
            aria-label={legendOpen ? 'Collapse legend' : 'Expand legend'}
          >
            {legendOpen ? '−' : '+'}
          </button>
        </div>
        {legendOpen && (
          <>
            <div className="network-legend-entity-types">
              <div className="network-legend-entity-types-label">ENTITY TYPES</div>
              {(Object.entries(ENTITY_COLORS) as [EntityType, string][]).map(([type, color]) => (
                <div key={type} className="network-legend-entity-type">
                  <span className="network-legend-color-dot" style={{ background: color }} />
                  <span className="network-legend-entity-type-name">{type}</span>
                </div>
              ))}
            </div>
            <div className="network-legend-relationship-kinds">
              <div className="network-legend-relationship-kinds-label">RELATIONSHIP KINDS</div>
              <div className="network-legend-relationship-kind-list">
                {RELATIONSHIP_KINDS.map(kind => (
                  <button
                    key={kind}
                    onClick={() => onRelationshipFilter?.(kind)}
                    className={`network-legend-relationship-kind ${activeFilter === kind ? 'is-active' : ''}`}
                  >
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
