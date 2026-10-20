'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { RelationLink } from '@/lib/workbench/types';
import type { RelationPosition } from '@/lib/workbench/derive';

interface StudioNodeData extends Record<string, unknown> {
  title: string;
  subtitle: string;
  status: string | null;
  emphasis: 'focus' | 'related';
  isIllustrative: boolean;
  selectable: boolean;
}

type StudioNode = Node<StudioNodeData, 'studio'>;

function StudioRecordNode({ data }: NodeProps<StudioNode>) {
  return (
    <div className={`studio-graph-node studio-graph-node-${data.emphasis}`}>
      <Handle className="studio-graph-handle" isConnectable={false} position={Position.Left} type="target" />
      <span className="studio-graph-node-title">{data.title}</span>
      <span className="studio-graph-node-subtitle">{data.subtitle}</span>
      {data.status && <span className="studio-graph-node-status">{data.status}</span>}
      {data.isIllustrative && <span className="studio-graph-node-mark">ILLUSTRATIVE</span>}
      <Handle className="studio-graph-handle" isConnectable={false} position={Position.Right} type="source" />
    </div>
  );
}

const nodeTypes = { studio: StudioRecordNode };

export function StudioRelationsGraph({
  links,
  positions,
  onFocus,
}: {
  links: RelationLink[];
  positions: RelationPosition[];
  onFocus: (focus: string | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const positionByKey = useMemo(
    () => new Map(positions.map(position => [position.key, position])),
    [positions],
  );

  const nodes: StudioNode[] = useMemo(
    () => links.map(link => {
      const position = positionByKey.get(link.node.key);
      const selectable = link.node.kind !== 'blueprint' && link.node.kind !== 'crew';
      return {
        id: link.node.key,
        type: 'studio' as const,
        position: { x: position?.x ?? 0, y: position?.y ?? 0 },
        ariaLabel: `${link.node.title}. ${link.node.subtitle}. ${link.node.status ?? 'no status'}.`,
        data: {
          title: link.node.title,
          subtitle: link.node.subtitle,
          status: link.node.status,
          emphasis: link.node.emphasis,
          isIllustrative: link.node.isIllustrative,
          selectable,
        },
      };
    }),
    [links, positionByKey],
  );

  const edges: Edge[] = useMemo(
    () => links.map(link => ({
      id: link.edge.id,
      source: link.edge.from,
      target: link.edge.to,
      label: link.edge.label,
      className: 'studio-graph-edge',
      ariaLabel: `${link.edge.label}, ${link.edge.basis}`,
    })),
    [links],
  );

  const focusNode = useCallback((key: string) => {
    setSelected(key);
    onFocus(key);
  }, [onFocus]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const elements = Array.from(container.querySelectorAll<HTMLElement>('.react-flow__node'));
    if (!elements.length) return;
    const current = elements.findIndex(element => element === document.activeElement);
    if (event.key === 'Escape') {
      setSelected(null);
      onFocus(null);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      elements[Math.min(elements.length - 1, current + 1)]?.focus();
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      elements[Math.max(0, current - 1)]?.focus();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && current >= 0) {
      event.preventDefault();
      const key = elements[current].getAttribute('data-id');
      const data = nodes.find(node => node.id === key)?.data;
      if (key && data?.selectable) focusNode(key);
    }
  }, [focusNode, nodes, onFocus]);

  return (
    <div
      aria-label="Relations canvas"
      className="studio-graph"
      onKeyDown={handleKeyDown}
      ref={containerRef}
      role="group"
    >
      <ReactFlow
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        maxZoom={1.6}
        minZoom={0.3}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        onNodeClick={(_, node) => {
          const data = node.data as StudioNodeData;
          if (data.selectable) focusNode(node.id);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbbb9d" gap={18} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      <p className="studio-graph-caption">
        {selected
          ? `Selected: ${selected}`
          : 'Arrow keys move between nodes, Enter opens one, Escape clears. The list view carries the same relations.'}
      </p>
    </div>
  );
}
