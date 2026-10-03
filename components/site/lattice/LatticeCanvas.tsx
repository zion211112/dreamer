"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { edgeTypes } from "./LatticeEdges";
import { nodeTypes } from "./LatticeNode";
import type { LatticeFlowEdge, LatticeFlowNode } from "@/lib/lattice";

/**
 * The canvas.
 *
 * Three decisions here are load-bearing, and all three are refusals:
 *
 * 1. Nodes are not draggable. The topology is a claim about the system,
 *    derived from the register; letting a reader drag a card off its
 *    ring would draw a system that is not the one being described, with
 *    no way back. The reset control restores the derived layout because
 *    there is nothing else to restore.
 * 2. Nodes are not connectable, and there is no connection line. The
 *    edges here are not links between things a reader composes; they
 *    are the custody and ordering the system already asserts. An edge a
 *    reader can draw is an edge the register does not know about.
 * 3. Nothing animates, and the attribution stays. A moving dash pattern
 *    reads as live traffic, and there is no live traffic; the xyflow
 *    attribution stays because removing it is licensed, not free.
 */

const FIT = { padding: 0.16, minZoom: 0.28, maxZoom: 1 } as const;

interface PaneProps {
  nodes: LatticeFlowNode[];
  edges: LatticeFlowEdge[];
  /** Pane click clears the selection without moving the viewport. */
  onSelect: (id: string | null) => void;
  /** Lets the toolbar above the canvas drive the viewport. */
  onReady: (api: CanvasApi) => void;
}

export interface CanvasApi {
  fit: () => void;
  focus: (id: string, zoom?: number) => void;
}

function Pane({ nodes, edges, onSelect, onReady }: PaneProps) {
  const instance = useReactFlow<LatticeFlowNode, LatticeFlowEdge>();
  const fit = instance.fitView;
  const setCenter = instance.setCenter;

  /* Selection is owned by the surface, not by the canvas, because the
     register below and the record beside it are the same selection. The
     engine still has to be told a node was clicked, or its internal state
     drifts from ours; a select change is the only change this canvas can
     ever produce, and a removal request is deliberately dropped rather
     than honoured. */
  const onNodesChange = useCallback(
    (changes: NodeChange<LatticeFlowNode>[]) => {
      for (const change of changes) {
        if (change.type === "select" && change.selected) onSelect(change.id);
      }
    },
    [onSelect]
  );

  useEffect(() => {
    onReady({
      fit: () => void fit(FIT),
      focus: (id, zoom = 1) => {
        const node = instance.getNode(id);
        if (!node) return;
        void setCenter(node.position.x, node.position.y, { zoom, duration: 420 });
      },
    });
  }, [fit, setCenter, instance, onReady]);

  return (
    <ReactFlow<LatticeFlowNode, LatticeFlowEdge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onPaneClick={() => onSelect(null)}
      onInit={(api: ReactFlowInstance<LatticeFlowNode, LatticeFlowEdge>) => void api.fitView(FIT)}
      nodeOrigin={[0.5, 0.5]}
      colorMode="dark"
      fitView
      fitViewOptions={FIT}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable
      elevateNodesOnSelect={false}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      panOnScroll={false}
      zoomOnDoubleClick={false}
      minZoom={0.2}
      maxZoom={1.6}
      proOptions={{ hideAttribution: false }}
      ariaLabelConfig={{
        /* Nodes are not focusable, so this is the string the engine
           actually attaches to every node as its description. It has to
           be true: traversal is off, and every node here is a row in the
           register immediately below the canvas. */
        "node.a11yDescription.keyboardDisabled":
          "Keyboard traversal of the canvas is off. Every node on it is also a row in the register below.",
      }}
    >
      {/* Two grids, because the site is ruled on 32px and a workspace on
          a 20px rule reads as a different system. Dots, not lines: a
          lined grid competes with the edges, which are the only
          structure on this surface that means something. */}
      <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="var(--grid)" />

      {/* Zoom is the one control the surface cannot do without. Fit puts
          the whole topology on screen at a size where a card's name is
          about 8px, so reading anything on a card means zooming — and a
          zoom with no visible control is a gesture a reader has to guess.
          Locked at the current viewport: this topology is derived and
          cannot be edited, so pan and zoom are the whole interaction and
          the fit button above already covers framing. */}
      <Controls showInteractive={false} position="top-right" />
    </ReactFlow>
  );
}

export function LatticeCanvas(props: PaneProps) {
  return (
    <ReactFlowProvider>
      <Pane {...props} />
    </ReactFlowProvider>
  );
}