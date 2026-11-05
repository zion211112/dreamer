import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import type { NetworkEntity, NetworkRelationship, EntityType, RelationshipKind } from '../lib/people-network';

export interface NetworkMapProps {
  entities: NetworkEntity[];
  relationships: NetworkRelationship[];
  onEntitySelect?: (entity: NetworkEntity | null) => void;
  onRelationshipFilter?: (kind: RelationshipKind | 'all') => void;
  searchQuery?: string;
  activeFilter?: RelationshipKind | 'all';
  width?: number;
  height?: number;
}

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
  stewardship: 'Stewards',
  contribution: 'Contributes to',
  evidence: 'Evidenced by',
  owns: 'Owns',
  operates: 'Operates',
  stewards: 'Stewards',
  funds: 'Funds',
  contributes_to: 'Contributes to',
  attests: 'Attests',
  issues: 'Issues',
};

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
  onEntitySelect,
  onRelationshipFilter,
  searchQuery = '',
  activeFilter = 'all',
  width = 800,
  height = 500,
}: NetworkMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<{
    nodes: SimNode[];
    links: SimLink[];
    alpha: number;
  } | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<NetworkEntity | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

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

  function handleEntityClick(entity: NetworkEntity, event: MouseEvent) {
    event.stopPropagation();
    const isSelected = selectedEntity?.id === entity.id;
    setSelectedEntity(isSelected ? null : entity);
    onEntitySelect?.(isSelected ? null : entity);
  }

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
          const isSearchMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
          const color = ENTITY_COLORS[node.type];
          const radius = ENTITY_RADIUS[node.type];
          return (
            <g
              key={node.id}
              className="network-node"
              onClick={e => handleEntityClick(node, e)}
              onMouseEnter={() => setHoveredEntity(node)}
              onMouseLeave={() => setHoveredEntity(null)}
              style={{ cursor: 'pointer', filter: isSelected || isHovered ? 'url(#glow)' : 'none' }}
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

      {selectedEntity && (
        <div className="network-map-inspector" style={{ position: 'absolute', right: 16, top: 16, maxWidth: 280 }}>
          <div className="network-inspector-card" style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '11px',
            fontFamily: 'var(--mono)',
            color: 'var(--fg)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontFamily: 'var(--l1-font)', fontSize: '14px', color: ENTITY_COLORS[selectedEntity.type] }}>
                {selectedEntity.name}
              </strong>
              <button
                onClick={() => { setSelectedEntity(null); onEntitySelect?.(null); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                  fontSize: '16px', lineHeight: 1, padding: '0 4px'
                }}
                aria-label="Close inspector"
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {selectedEntity.type.toUpperCase()} · {selectedEntity.id}
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '11px' }}>
              {selectedEntity.summary}
            </div>
            {selectedEntity.location && (
              <div style={{ marginBottom: '8px', fontSize: '10px', color: 'var(--dim)' }}>
                📍 {selectedEntity.location}
              </div>
            )}
            {selectedEntity.capabilities.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>CAPABILITIES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedEntity.capabilities.slice(0, 6).map((cap: string, i: number) => (
                    <span key={i} style={{
                      background: 'var(--bg)', border: '1px solid var(--line)',
                      borderRadius: '3px', padding: '2px 6px', fontSize: '9px'
                    }}>
                      {cap}
                    </span>
                  ))}
                  {selectedEntity.capabilities.length > 6 && (
                    <span style={{ fontSize: '9px', color: 'var(--dim)' }}>
                      +{selectedEntity.capabilities.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '8px', marginTop: '8px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4px' }}>RELATIONSHIPS</div>
              <button
                onClick={() => onRelationshipFilter?.('all')}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  color: 'var(--fg)', fontSize: '10px', fontFamily: 'var(--mono)',
                  padding: '4px 0', cursor: 'pointer'
                }}
              >
                Show all connections
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="network-legend" style={{
        position: 'absolute', left: 16, bottom: 16, zIndex: 10,
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: '4px', padding: '12px', fontSize: '10px',
        fontFamily: 'var(--mono)', color: 'var(--fg)',
        minWidth: '160px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</strong>
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}
            aria-label={legendOpen ? 'Collapse legend' : 'Expand legend'}
          >
            {legendOpen ? '−' : '+'}
          </button>
        </div>
        {legendOpen && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>ENTITY TYPES</div>
              {(Object.entries(ENTITY_COLORS) as [EntityType, string][]).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: color, border: '1px solid var(--line)',
                    flexShrink: 0,
                  }} />
                  <span style={{ textTransform: 'capitalize', fontSize: '10px' }}>{type}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px' }}>RELATIONSHIP KINDS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {RELATIONSHIP_KINDS.map(kind => (
                  <button
                    key={kind}
                    onClick={() => onRelationshipFilter?.(kind)}
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
            </div>
          </>
        )}
      </aside>
    </div>
  );
}