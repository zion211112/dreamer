'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEPARTMENTS, DEPARTMENT_COLORS, WORKSPACE_ROOT, FileNode } from '@/lib/ontology';
import type { NavItemId } from '@/components/TopNav';

export type ModuleSurfaceId = Extract<NavItemId, 'workspace' | 'foundation' | 'products' | 'design' | 'operations' | 'laboratory'>;

const MODULE_SURFACES: Record<ModuleSurfaceId, { title: string; icon: string; description: string }> = {
  workspace: {
    title: 'Dashboard',
    icon: '⬡',
    description: 'Overview of all modules and system status',
  },
  foundation: {
    title: 'SBT Kernel Node Graph',
    icon: '○',
    description: 'Visualize core primitives and their relationships',
  },
  products: {
    title: 'Builds Hub',
    icon: '▢',
    description: 'Manage product builds and deployment pipelines',
  },
  design: {
    title: 'Token Board',
    icon: '◇',
    description: 'Design tokens and system controls',
  },
  operations: {
    title: 'Ops Board',
    icon: '⬢',
    description: 'Infrastructure monitoring and delivery',
  },
  laboratory: {
    title: 'Lab Board',
    icon: '⬠',
    description: 'R&D experiments and prototypes',
  },
};

interface ModuleSurfaceProps {
  section: NavItemId;
}

export function ModuleSurface({ section }: ModuleSurfaceProps) {
  const surface = MODULE_SURFACES[section as ModuleSurfaceId];
  const color = section === 'workspace' ? undefined : DEPARTMENT_COLORS[section as string];

  // Special rendering for foundation section
  if (section === 'foundation') {
    return <FoundationSurface />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="glass border-t hairline flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-medium transition-transform duration-200`}
            style={{
              background: color ? `${color}22` : 'rgba(124,108,255,0.12)',
              color: color || 'var(--fg)',
              boxShadow: color ? `0 0 8px ${color}33` : undefined,
            }}
          >
            {surface.icon}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[16px] font-semibold text-[var(--fg)]">{surface.title}</span>
            <span className="text-[12px] text-[var(--fg-muted)]">{surface.description}</span>
          </div>
        </div>
        <div className="text-[11px] text-[var(--fg-faint)]">
          Last updated: just now
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* Module-specific content would go here */}
        <div className="text-[var(--fg-muted)] text-center py-12">
          Module surface for {surface.title}
          {/* Placeholder for actual module implementation */}
        </div>
      </div>
    </div>
  );
}

// Foundation Surface Component - Hand-rolled SVG in React-Flow visual language
function FoundationSurface() {
  type FileNode = {
    id: string;
    name: string;
    type: 'file' | 'dir';
    size?: number;
    modified?: Date;
    children?: FileNode[];
    parent?: string;
    path: string;
  };

  type NodeData = FileNode & {
    x: number;
    y: number;
  };

  type EdgeData = {
    source: string;
    target: string;
    path: string; // SVG path string for the edge
  };

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number>();

  // Convert ontology tree to our node structure
  useEffect(() => {
    const root = WORKSPACE_ROOT.children?.find(c => c.id === '/foundation') || WORKSPACE_ROOT.children?.[0] || WORKSPACE_ROOT;
    const nodesMap = new Map<string, NodeData>();
    const edgesList: EdgeData[] = [];

    // First pass: create nodes and assign temporary IDs
    function traverse(node: FileNode, parentId: string | null = null, depth: number = 0) {
      const nodeData: NodeData = {
        ...node,
        x: 0,
        y: 0,
      };
      nodesMap.set(node.id, nodeData);
      
      if (parentId !== null) {
        edgesList.push({
          source: parentId,
          target: node.id,
          path: '', // Will be set after positioning
        });
      }
      
      if (node.children) {
        for (const child of node.children) {
          traverse(child, node.id, depth + 1);
        }
      }
    }
    
    traverse(root);
    
    // Second pass: assign positions using a simple tree layout
    const nodeArray = Array.from(nodesMap.values());
    const rootNode = nodeArray.find(n => n.id === root.id);
    if (!rootNode) return;
    
    // Simple top-down layout
    const levelHeight = 120;
    const siblingSpacing = 80;
    
    function assignPositions(node: NodeData, depth: number, left: number, width: number) {
      node.x = left + width / 2;
      node.y = depth * levelHeight + 60; // Add some top margin
      
      if (node.children && node.children.length > 0) {
        const childWidth = width / node.children.length;
        let currentLeft = left;
        for (const child of node.children) {
          const childNode = nodesMap.get(child.id);
          if (childNode) {
            assignPositions(childNode, depth + 1, currentLeft, childWidth);
          }
          currentLeft += childWidth;
        }
      }
    }
    
    // Calculate total width needed
    function getLeafCount(node: FileNode): number {
      if (!node.children || node.children.length === 0) return 1;
      let count = 0;
      for (const child of node.children) {
        count += getLeafCount(child);
      }
      return count;
    }
    
    const totalLeaves = getLeafCount(root);
    const baseWidth = totalLeaves * 100; // 100px per leaf
    
    assignPositions(rootNode, 0, 0, baseWidth);
    
    // Update nodes with positions
    setNodes(Array.from(nodesMap.values()));
    
    // Update edges with SVG paths
    const updatedEdges: EdgeData[] = edgesList.map(edge => {
      const sourceNode = nodesMap.get(edge.source);
      const targetNode = nodesMap.get(edge.target);
      if (!sourceNode || !targetNode) return edge;
      
      // Create a cubic bezier curve from source to target
      const x1 = sourceNode.x;
      const y1 = sourceNode.y + 20; // Bottom of source node (node height is 40)
      const x2 = targetNode.x;
      const y2 = targetNode.y - 20; // Top of target node
      
      const controlX1 = x1;
      const controlY1 = (y1 + y2) / 2;
      const controlX2 = x2;
      const controlY2 = (y1 + y2) / 2;
      
      const path = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
      
      return {
        ...edge,
        path,
      };
    });
    
    setEdges(updatedEdges);
  }, []);

  // Animation loop for pulsing nodes and flowing edges
  useEffect(() => {
    const animate = () => {
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Handle mouse events for pan/zoom
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setTranslateX(translateX + dx);
    setTranslateY(translateY + dy);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  const handleMouseLeave = () => {
    setDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomFactor = 0.001; // Sensitivity
    const newScale = Math.min(3, Math.max(0.3, scale - delta * zoomFactor));
    setScale(newScale);
  };

  return (
    <div className="relative w-full h-full bg-[var(--bg)] overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 0 0, var(--fg-faint) 1px, transparent 1px),
            radial-gradient(circle at 0 0, var(--fg-faint) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}></div>
      </div>
      
      {/* SVG container */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        {/* Definitions for gradients and filters */}
        <defs>
          <radialGradient id="nodeGradient" cx="0%" cy="0%" r="50%">
            <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--fg)" stopOpacity="0" />
          </radialGradient>
          
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="var(--accent)" flood-opacity="0.5"/>
          </filter>
          
          {/* Pulse animation for nodes */}
          <style>
            {`
              @keyframes nodePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }

              .node {
                animation: nodePulse 4s ease-in-out infinite;
                transform-origin: center;
                transform-box: fill-box;
              }

              .node:hover {
                animation-play-state: paused;
                filter: url(#nodeGlow);
              }

              .edge {
                stroke-dasharray: 8, 4;
                animation: flow 3s linear infinite;
              }

              @keyframes flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -12; }
              }

              .node:hover ~ .edge,
              .edge:hover {
                stroke: var(--accent);
                stroke-width: 2;
              }
            `}
          </style>
        </defs>
        
        {/* Background rectangle for click-to-focus */}
        <rect width="100%" height="100%" fill="var(--bg)" />
        
        {/* Edges */}
        <g>
          {edges.map(edge => (
            <path
              key={edge.target}
              d={edge.path}
              stroke="var(--border)"
              strokeWidth="1.5"
              fill="none"
              className="edge"
            />
          ))}
        </g>
        
        {/* Nodes */}
        <g>
          {nodes.map(node => {
            const isFile = node.type === 'file';
            const icon = isFile ? '○' : '▸';
            
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {/* Node background */}
                <rect
                  x="-60"
                  y="-20"
                  width="120"
                  height="40"
                  rx="8"
                  ry="8"
                  fill="var(--surface)"
                  stroke="var(--border)"
                  strokeWidth="0.5"
                  className="node"
                />
                
                {/* Node icon */}
                <text
                  x="-50"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="var(--fg)"
                >
                  {icon}
                </text>
                
                {/* Node label */}
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="var(--fg)"
                  pointerEvents="none"
                >
                  {node.name.split('.')[0]} {/* Show filename without extension for brevity */}
                </text>
                
                {/* Handles for connection points (subtle) */}
                <circle
                  cx="0"
                  cy="-20"
                  r="3"
                  fill="var(--accent)"
                  opacity="0.3"
                />
                <circle
                  cx="0"
                  cy="20"
                  r="3"
                  fill="var(--accent)"
                  opacity="0.3"
                />
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Controls for reset view */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
            setScale(1);
            setTranslateX(0);
            setTranslateY(0);
          }}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--surface)] border hairline hover:border-[var(--border-strong)] transition-all"
          title="Reset view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
          </svg>
        </button>
      </div>
    </div>
  );
}