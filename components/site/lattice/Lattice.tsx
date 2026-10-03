"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { LatticeCanvas, type CanvasApi } from "./LatticeCanvas";
import { EdgeSwatch } from "./LatticeEdges";
import { LatticeOpen } from "./LatticeNode";
import { StateTag } from "@/components/site/StateTag";
import {
  buildLattice,
  KIND_TITLE,
  latticeTally,
  type LatticeEdgeKind,
  type LatticeFlowEdge,
  type LatticeFlowNode,
  type LatticeKind,
  type LatticeNode,
} from "@/lib/lattice";

/**
 * The lattice surface — one selection, three views of it.
 *
 * The canvas, the record panel beside it and the register below it are
 * three renderings of a single selection held here. That is the whole
 * design: a graph is not a picture of a register, it is a way into the
 * same records, and the three views disagreeing about what is selected
 * would be the exact failure this system exists to prevent.
 *
 * Nothing on this surface is measured live. The two figures a control
 * room of this shape normally carries — uptime, capital routed — are not
 * here, because neither is established, and an unknown that is drawn as a
 * graph is more convincing than an unknown that is written down.
 */

const KIND_ORDER: readonly LatticeKind[] = ["plane", "stage", "build"];

/** The four edge kinds, stated as sentences. A legend drawn in glyphs
    teaches the reader a shape; one drawn in words teaches the claim. */
const EDGE_LEGEND: readonly [LatticeEdgeKind, string][] = [
  [
    "loop",
    "The control-plane flow, and the direction of travel. The brightest stroke on the surface, lit only on the edge leaving the node being read. It returns from Evidence to Field, which is what makes five stations a loop rather than a list.",
  ],
  [
    "chain",
    "The seven transformations, in order, returning from Measure to Observe. Always quiet: it is true everywhere at once, so lighting one segment of it would be a lie about the other six.",
  ],
  [
    "custody",
    "A stage crossing into the plane node it resolves to. Who holds custody at the far side is written on the card, in the record panel and in a register column below.",
  ],
  [
    "instance",
    "A build attached to the node it exercises — an instance of the chain, not a sixth node.",
  ],
];

export function Lattice() {
  const { nodes, edges, returns } = useMemo(() => buildLattice(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const api = useRef<CanvasApi | null>(null);

  const onReady = useCallback((next: CanvasApi) => {
    api.current = next;
  }, []);

  /**
   * `focus` is what separates the three ways in. A node chosen from the
   * register or the reading order may be off screen and must be brought
   * to; a node chosen on the canvas is by definition on screen, and
   * re-centring it there is a 400ms lurch for nothing. Pane click and the
   * clear control both pass false, because clearing should not move the
   * reader either.
   */
  const select = useCallback((id: string | null, focus = true) => {
    setSelectedId(id);
    if (id && focus) api.current?.focus(id);
  }, []);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const flowNodes = useMemo<LatticeFlowNode[]>(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "lattice" as const,
        position: node.position,
        /* `selected` on the node object, not only in `data`: the canvas is
           controlled, so the engine takes the card's selected state from
           here and never from its own store. Putting it in data alone
           lit the record panel and left all eighteen cards dark. */
        selected: node.id === selectedId,
        data: { ...node, onSelect: () => select(node.id, false) },
      })),
    [nodes, selectedId, select]
  );

  const flowEdges = useMemo<LatticeFlowEdge[]>(() => {
    const at = new Map(nodes.map((n) => [n.id, n.position]));
    return edges.map((edge) => {
      const from = at.get(edge.source);
      const to = at.get(edge.target);
      /* A loop-closing edge leaves and arrives on the same side of its
         column; everything else takes the dominant axis. Naming the
         handle is what makes a curve leave the boundary the reader can
         see instead of the card's centre. */
      const ends = edge.around
        ? { sourceHandle: "w" as const, targetHandle: "w" as const }
        : from && to
          ? sideOf(from, to)
          : { sourceHandle: "e" as const, targetHandle: "w" as const };
      return {
        id: edge.id,
        type: (edge.kind === "loop" || edge.kind === "chain" ? "flow" : "cross") as
          | "flow"
          | "cross",
        source: edge.source,
        target: edge.target,
        sourceHandle: ends.sourceHandle,
        targetHandle: ends.targetHandle,
        data: {
          kind: edge.kind,
          lit: edge.kind === "loop" && edge.source === selectedId,
          around: edge.around,
        },
      };
    });
  }, [nodes, edges, selectedId]);

  const tally = useMemo(() => latticeTally(nodes), [nodes]);
  const reading = nodes.filter((n) => n.kind === "plane");

  return (
    <div className="lattice">
      {/* ── Controls ───────────────────────────────────────────
          The reading order first, because on this surface knowing
          where you are is worth more than being able to move. */}
      <div className="lattice-controls">
        <div className="lattice-order-group">
          {/* Named, because the site already runs a compact spine
              directly above this one and two unlabelled rows of five
              station names is how a reader decides they are looking at a
              duplicate rather than at a control. */}
          <p className="index-group-key">Select a node</p>
          <nav className="lattice-order" aria-label="Select a node in the control plane">
            {reading.map((node) => (
              <button
                type="button"
                key={node.id}
                className="lattice-order-cell"
                data-selected={node.id === selectedId || undefined}
                aria-current={node.id === selectedId || undefined}
                onClick={() => select(node.id)}
              >
                <span className="lattice-order-ord figure" aria-hidden="true">
                  {node.ord}
                </span>
                <span className="lattice-order-name">{node.name}</span>
                <span
                  className={node.id === selectedId ? "port port--live" : "port"}
                  aria-hidden="true"
                />
              </button>
            ))}
          </nav>
        </div>

        <div className="lattice-tools">
          <button type="button" className="btn-ghost" onClick={() => api.current?.fit()}>
            Fit the whole topology
          </button>
          {selected ? (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => select(null)}
            >
              Clear selection
            </button>
          ) : null}
        </div>
      </div>

      <div className="lattice-stage">
        <div className="lattice-canvas">
          <LatticeCanvas
            nodes={flowNodes}
            edges={flowEdges}
            onSelect={setSelectedId}
            onReady={onReady}
          />
        </div>

        <RecordPanel node={selected} tally={tally} />
      </div>

      <p className="lattice-returns">
        <span className="lattice-returns-key">Both columns close</span>
        {returns}
      </p>

      <Register
        nodes={nodes}
        selectedId={selectedId}
        onSelect={select}
        edgeLegend={EDGE_LEGEND}
      />
    </div>
  );
}

/* Which side of each card an edge leaves from and arrives at, from the
   geometry rather than from the engine. Lives here because it needs
   positions that only exist once the lattice has been laid out. */
function sideOf(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "e" as const, targetHandle: "w" as const }
      : { sourceHandle: "w" as const, targetHandle: "e" as const };
  }
  return dy >= 0
    ? { sourceHandle: "s" as const, targetHandle: "n" as const }
    : { sourceHandle: "n" as const, targetHandle: "s" as const };
}

/* ═══════════════════════════════════════════════════════════════
   THE RECORD — what the selected node actually is
   ═══════════════════════════════════════════════════════════════ */

function RecordPanel({
  node,
  tally,
}: {
  node: LatticeNode | null;
  tally: readonly { state: LatticeNode["state"]; count: number }[];
}) {
  return (
    <aside className="lattice-record" aria-labelledby="lattice-record-heading">
      <h2 className="sr-only" id="lattice-record-heading">
        The selected node
      </h2>

      {/* One short status line, rather than a live region wrapping the
          whole panel. The panel is ~90 words; announcing all of it on
          every selection, on top of the button's own name and state, is
          three channels for one fact. */}
      <p className="lattice-status" role="status">
        {node
          ? `${node.name} selected, ${node.state}`
          : "Nothing selected. Choose a node on the canvas, in the reading order above, or in the register below."}
      </p>

      {node ? (
        <>
          <p className="index-group-key">
            {KIND_TITLE[node.kind]} · {node.ord}
          </p>
          <h3 className="record-name">{node.name}</h3>
          <p className="record-role">{node.role}</p>

          <dl className="record-fields">
            <div className="record-field">
              <dt>State</dt>
              <dd>
                <StateTag state={node.state} />
              </dd>
            </div>
            <div className="record-field">
              <dt>Custody</dt>
              <dd>{node.custody}</dd>
            </div>
            <div className="record-field">
              <dt>Holds</dt>
              <dd>{node.holds}</dd>
            </div>
          </dl>

          <div className="plane-record">
            <p className="index-group-key">Why this state</p>
            <p className="register-provenance">{node.provenance}</p>
          </div>

          <div className="action-row">
            {node.href ? (
              <LatticeOpen href={node.href} name={node.name} />
            ) : (
              <p className="register-provenance record-missing">
                {node.state === "PLANNED"
                  ? `Not built, so no route resolves to it. ${node.provenance}`
                  : "No route resolves to this node."}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="plane-record">
            <p className="index-group-key">What is on this canvas</p>
            <p className="register-provenance">
              Every card is derived from the site&apos;s own register. There
              is no uptime figure, no routed capital and no throughput
              number on it, because none of the three is established. A
              state that is absent stays absent here rather than being
              drawn as a zero.
            </p>
            <ul className="lattice-tally">
              {tally.map((row) => (
                <li key={row.state}>
                  <StateTag state={row.state} />
                  {/* An em dash, not a zero. "None of these on this
                      surface" and "this surface measures zero" are
                      different claims, and on UNKNOWN the second one is
                      the one the contract forbids. */}
                  <span className="lattice-tally-n figure">
                    {row.count > 0 ? row.count : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE REGISTER — the canvas with the picture taken away

   This is not a fallback. A canvas is a poor document and a good
   diagram; a register row is a good document and no diagram. Both
   exist, the register is never hidden behind a toggle, and the two
   are generated from one list, so they cannot fall out of step.
   ═══════════════════════════════════════════════════════════════ */

function Register({
  nodes,
  selectedId,
  onSelect,
  edgeLegend,
}: {
  nodes: readonly LatticeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  edgeLegend: readonly (readonly [LatticeEdgeKind, string])[];
}) {
  return (
    <section className="section" aria-labelledby="lattice-register">
      <div className="section-head">
        <h2 className="section-title" id="lattice-register">
          Every node on the canvas, as a register
        </h2>
        <p className="section-kicker">Three kinds, one derived list</p>
      </div>

      <div className="register" role="table" aria-labelledby="lattice-register">
        <div className="register-head register--lattice" role="row">
          <span role="columnheader">Ord</span>
          <span role="columnheader">Node</span>
          <span role="columnheader">Kind</span>
          <span role="columnheader">State</span>
          <span role="columnheader">Custody</span>
        </div>

        {KIND_ORDER.flatMap((kind) => {
          const group = nodes.filter((n) => n.kind === kind);
          return [
            <div className="register-band" key={`band-${kind}`} role="row">
              <span role="cell" data-field={KIND_TITLE[kind]}>
                {KIND_TITLE[kind]}
              </span>
            </div>,
            ...group.map((node) => (
              <div
                className="register-row register--lattice"
                role="row"
                key={node.id}
                data-selected={node.id === selectedId || undefined}
              >
                <div className="register-cell" role="cell" data-field="Ord">
                  <div className="register-id">{node.ord}</div>
                </div>
                <div className="register-cell" role="cell" data-field="Node">
                  <button
                    type="button"
                    className="register-name lattice-row-button"
                    aria-current={node.id === selectedId || undefined}
                    onClick={() => onSelect(node.id)}
                  >
                    {node.name}
                  </button>
                  <div className="register-provenance">{node.provenance}</div>
                </div>
                <div className="register-cell" role="cell" data-field="Kind">
                  <div className="register-date">{KIND_TITLE[node.kind]}</div>
                </div>
                <div className="register-cell" role="cell" data-field="State">
                  <StateTag state={node.state} />
                </div>
                <div className="register-cell" role="cell" data-field="Custody">
                  <div className="register-provenance">{node.custody}</div>
                </div>
              </div>
            )),
          ];
        })}
      </div>

      <div className="section-head section-head--tight">
        <h3 className="section-title section-title--minor">How to read the edges</h3>
      </div>

      <dl className="lattice-legend">
        {edgeLegend.map(([kind, what]) => (
          <div className="lattice-legend-row" key={kind}>
            <dt>
              <EdgeSwatch kind={kind} />
              {kind}
            </dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}