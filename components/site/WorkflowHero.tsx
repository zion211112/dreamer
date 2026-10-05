"use client";

import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { StateTag } from "@/components/site/StateTag";
import { COMPANY, STACK, type StackLayer } from "@/lib/system";

type LayerNodeData = { layer: StackLayer; vertical: boolean };
type LayerNode = Node<LayerNodeData, "layer">;

const initialNodes: LayerNode[] = STACK.map((layer, index) => ({
  id: layer.key,
  type: "layer",
  position: { x: index * 246, y: 160 },
  data: { layer, vertical: false },
  draggable: false,
  selectable: true,
}));

const initialEdges = STACK.slice(0, -1).map((layer, index) => ({
  id: `${layer.key}-${STACK[index + 1].key}`,
  source: layer.key,
  target: STACK[index + 1].key,
  type: "smoothstep" as const,
  animated: false,
  style: { stroke: "var(--rule-3)", strokeWidth: 1.5 },
}));
const prototypeCount = STACK.filter((layer) => layer.state === "PROTOTYPE").length;
const plannedCount = STACK.filter((layer) => layer.state === "PLANNED").length;

function SystemNode({ data, selected }: NodeProps<LayerNode>) {
  const { layer, vertical } = data;
  const live = layer.state === "PROTOTYPE";

  return (
    <>
      <Handle type="target" position={vertical ? Position.Top : Position.Left} isConnectable={false} />
      <article className="workflow-node" data-selected={selected || undefined} data-live={live}>
        <div className="workflow-node-meta">
          <span>{layer.ord} / {layer.key}</span>
          <span className="workflow-node-port" data-live={live} aria-label={live ? "Prototype exists" : "Planned"} />
        </div>
        <h3>{layer.name}</h3>
        <p>{layer.role}</p>
        <div className="workflow-node-state"><StateTag state={layer.state} /></div>
      </article>
      <Handle type="source" position={vertical ? Position.Bottom : Position.Right} isConnectable={false} />
    </>
  );
}

const nodeTypes = { layer: SystemNode } satisfies NodeTypes;

function WorkflowSurface() {
  const [selectedKey, setSelectedKey] = useState(STACK[0].key);
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const { fitView } = useReactFlow<LayerNode, Edge>();
  const selectedLayer = STACK.find((layer) => layer.key === selectedKey) ?? STACK[0];
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1050px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fitView({ padding: 0.24, minZoom: 0.4, maxZoom: 0.8 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [compact, fitView]);
  const visibleLayers = useMemo(
    () => STACK.filter((layer) => `${layer.name} ${layer.key} ${layer.role}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const nodes = useMemo(
    () => initialNodes.map((node, index) => ({
      ...node,
      position: compact ? { x: 0, y: 64 + index * 184 } : node.position,
      data: { ...node.data, vertical: compact },
      selected: node.id === selectedKey,
    })),
    [compact, selectedKey]
  );

  return (
    <section className="workflow-shell" aria-label="APT-LABS system canvas">
      <div className="workflow-toolbar">
        <Link className="workflow-project" href="/" aria-label="APT-LABS home">
          <span className="workflow-project-mark" aria-hidden="true">A</span>
          <span><strong>APT-LABS</strong><small>{COMPANY.mantra}</small></span>
        </Link>
        <div className="workflow-toolbar-links">
          <span className="workflow-save-state" title="The architecture is derived from the evidence register."><i aria-hidden="true" /> NOTHING GETS PROMOTED BY DRAGGING</span>
          <Link href="/lattice">Open full register <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="workflow-workspace">
        <nav className="workflow-rail" aria-label="Workspace sections">
          <span className="workflow-rail-active" aria-label="System map">⌘</span>
          <Link href="/stack" aria-label="Infrastructure">▤</Link>
          <Link href="/product" aria-label="Product">◫</Link>
          <Link href="/evidence" aria-label="Evidence">◎</Link>
          <span className="workflow-rail-spacer" />
          <span className="workflow-rail-avatar" aria-label="APT-LABS">A</span>
        </nav>

        <div className="workflow-canvas" aria-label="Five connected system layers">
          <div className="workflow-canvas-caption">
            <span>SOVEREIGN SYSTEM / {COMPANY.mantra.toUpperCase()}</span>
            <span><i aria-hidden="true" /> {String(prototypeCount).padStart(2, "0")} PROTOTYPE / {String(plannedCount).padStart(2, "0")} PLANNED</span>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedKey(node.id as StackLayer["key"])}
            onPaneClick={() => setSelectedKey(STACK[0].key)}
            defaultViewport={{ x: 32, y: 80, zoom: 0.75 }}
            minZoom={0.35}
            maxZoom={1.35}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            fitView
            fitViewOptions={{ padding: 0.24, minZoom: 0.4, maxZoom: 0.8 }}
            proOptions={{ hideAttribution: false }}
            ariaLabelConfig={{ "node.a11yDescription.keyboardDisabled": "Select a system layer from the node list beside the canvas." }}
          >
            <Background variant={BackgroundVariant.Lines} gap={28} size={1} color="var(--grid)" />
            <MiniMap
              position="top-right"
              pannable
              zoomable
              nodeColor={(node) => (node as LayerNode).data.layer.state === "PROTOTYPE" ? "var(--signal-dim)" : "var(--rule-3)"}
              maskColor="rgba(4, 6, 10, 0.62)"
              className="workflow-minimap"
            />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>

          <aside className="workflow-inspector" aria-live="polite" aria-label={`${selectedLayer.name} details`}>
            <div className="workflow-inspector-head">
              <span>INSPECT / {selectedLayer.ord}.{selectedLayer.key}</span>
              <span>{selectedLayer.ord}</span>
            </div>
            <h2>{selectedLayer.name}{selectedLayer.alias ? <small> / {selectedLayer.alias}</small> : null}</h2>
            <p>{selectedLayer.role}</p>
            <div className="workflow-inspector-state"><span>Evidence state</span><StateTag state={selectedLayer.state} /></div>
            <p className="workflow-inspector-built">{selectedLayer.built}</p>
            <Link href="/stack">Open layer record <span aria-hidden="true">↗</span></Link>
          </aside>
        </div>

        <aside className="workflow-nodes" aria-label="System explorer">
          <div className="workflow-nodes-heading"><h2>EXPLORER</h2><span>{String(STACK.length).padStart(2, "0")} LAYERS</span></div>
          <label className="workflow-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a layer" aria-label="Search layers" />
          </label>
          <p className="workflow-group-label"><span aria-hidden="true">▾</span> SYSTEM /</p>
          <ul>
            {visibleLayers.map((layer) => (
              <li key={layer.key}>
                <button type="button" data-active={selectedKey === layer.key} onClick={() => setSelectedKey(layer.key)}>
                  <span className="workflow-list-port" data-live={layer.state === "PROTOTYPE"} aria-hidden="true" />
                  <span className="workflow-file-icon" aria-hidden="true" />
                  <span className="workflow-file-name">{layer.name}<small>.layer</small></span>
                  <span className="workflow-list-state">{layer.ord}</span>
                </button>
              </li>
            ))}
          </ul>
          {visibleLayers.length === 0 ? <p className="workflow-empty">No matching layers.</p> : null}
          <div className="workflow-nodes-foot">{COMPANY.supporting}</div>
        </aside>
      </div>
    </section>
  );
}

export function WorkflowHero() {
  return (
    <ReactFlowProvider>
      <WorkflowSurface />
    </ReactFlowProvider>
  );
}