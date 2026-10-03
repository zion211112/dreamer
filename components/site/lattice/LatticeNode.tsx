"use client";

import Link from "next/link";
import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { StateTag } from "@/components/site/StateTag";
import { KIND_TITLE, LATTICE_SIDES, type LatticeSide } from "@/lib/lattice";

/**
 * The card. One component for all three kinds, because the three kinds
 * differ in what they have to say and not in how they are made — three
 * near-identical components is how a set of nodes starts to drift.
 *
 * What is on a card is a P0–P2 cut and nothing else:
 *
 *   P0  the name and the evidence state, on the top row. If a reader gets
 *       nothing else, they must still know what this is and whether it is
 *       real.
 *   P1  the ordinal and the custody line. Who holds this, stated once, and
 *       given the card's full width so it never has to elide.
 *   P2  the role clause, clamped to three lines.
 *   P3  holds, provenance, the route, and the node's kind. Not here — those
 *       are in the record panel beside the canvas and in the register below
 *       it, because a card carrying its own provenance has to be twice as
 *       tall and the column stops being legible at fit.
 *
 * A P3 fact given P0 weight is the defect this layout exists to avoid.
 *
 * The card is a real button and owns its own focus, rather than leaning on
 * the engine's node wrapper: one tab stop, one action, in the same order
 * the register below it uses. Keyboard traversal of the canvas is off, and
 * the canvas says so in its own description rather than leaving a reader to
 * discover it.
 */

const SIDE_POSITION: Record<LatticeSide, Position> = {
  n: Position.Top,
  e: Position.Right,
  s: Position.Bottom,
  w: Position.Left,
};

/** The card. Selects; it never navigates. Navigation is the record's job. */
export function LatticeCard({ data, selected }: NodeProps<import("@/lib/lattice").LatticeFlowNode>) {
  const { ord, name, role, custody, state, kind, href, onSelect } = data;

  /* The accessible name is bounded to what the card actually shows. The
     default is the whole subtree, which means a screen reader reads the
     full role clause on all eighteen cards while a sighted reader gets
     three clamped lines — a disagreement between the two renderings of
     one node, on a route whose subject is not misrepresenting a node. */
  const label = `${ord}, ${KIND_TITLE[kind]}, ${name}. Evidence state ${state}. Custody: ${custody}.`;

  return (
    <>
      {/* Eight handles, one per side, invisible. They exist so an edge can
          name the boundary it leaves from; without them the engine falls
          back to the card's centre and the route reads as a spoke. */}
      {LATTICE_SIDES.map((side) => (
        <Handle
          key={`t-${side}`}
          id={side}
          type="target"
          position={SIDE_POSITION[side]}
          isConnectable={false}
          className="lattice-handle"
        />
      ))}
      {LATTICE_SIDES.map((side) => (
        <Handle
          key={`s-${side}`}
          id={side}
          type="source"
          position={SIDE_POSITION[side]}
          isConnectable={false}
          className="lattice-handle"
        />
      ))}

      <button
        type="button"
        className="lattice-card"
        data-kind={kind}
        data-state={state}
        data-selected={selected || undefined}
        aria-label={label}
        aria-current={selected || undefined}
        onClick={onSelect}
      >
        <span className="lattice-card-port" aria-hidden="true" data-live={Boolean(href)} />

        <span className="lattice-card-top">
          <span className="lattice-card-ord figure" aria-hidden="true">
            {ord}
          </span>
          {/* The evidence state sits on the top row beside the ordinal, not
              in the footer beside custody. State is the P0 fact on this
              card and the eye lands on the top row first; in the footer it
              was competing for width with custody and won, which elided
              the party holding the record down to "The local…". */}
          <span aria-hidden="true">
            <StateTag state={state} />
          </span>
        </span>

        <span className="lattice-card-name">{name}</span>

        <span className="lattice-card-role" aria-hidden="true">
          {role}
        </span>

        <span className="lattice-card-foot" aria-hidden="true">
          {/* Custody, named in the record panel and in the register's own
              column. Given the card's full width it fits without eliding:
              the longest value on the surface is "The institution". */}
          <span className="lattice-card-custody">{custody}</span>
        </span>
      </button>
    </>
  );
}

/**
 * A build or a plane node that resolves to a route carries its own way
 * in, drawn as a link rather than as a second target on the card — so a
 * card always means exactly one thing, which is "read this record".
 * Never rendered for a node without an href: a control that looks open
 * and resolves to nothing is the one failure this grammar prevents.
 */
export function LatticeOpen({ href, name }: { href: string; name: string }) {
  return (
    <Link href={href} className="lattice-open">
      Open {name}
    </Link>
  );
}

/* v12 warns when the type map is rebuilt on a render, so it is declared
   once at module scope and never inside a component. */
export const nodeTypes = { lattice: LatticeCard } satisfies NodeTypes;