"use client";

import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";
import { RETURN_LANE, type LatticeEdgeKind, type LatticeFlowEdge } from "@/lib/lattice";

/**
 * Two edge components, four edge kinds.
 *
 * The kinds are not decoration — each one asserts a different thing, so
 * each is drawn differently and a reader can tell them apart with the
 * colour removed, because the stroke patterns are carried in the legend
 * swatches as the same SVG the canvas draws:
 *
 *   loop       the control-plane flow, and the direction of travel. Solid
 *              and the brightest stroke on the surface, lit only on the
 *              edge leaving the node being read.
 *   chain      the seven transformations in order. Always quiet, because
 *              it is a scale and not a route: it is true everywhere at
 *              once, so lighting one segment would be a lie about the
 *              other six.
 *   custody    a stage crossing into the plane node it resolves to.
 *   instance   a build attached to the node it exercises. The tightest
 *              dash of the four, because an instance is a weaker
 *              relationship than a route and should not be drawn as one.
 *
 * No edge carries a text label. An earlier pass named every custody
 * crossing with the party holding custody, and at fit zoom the five labels
 * collapsed into one unreadable band across the gutter between the columns
 * — a label that cannot be read is not a redundant channel, it is a second
 * thing competing with the first. Custody is on every card, in the record
 * panel and in a register column, so the edges stay lines and the words
 * live where they can be read.
 *
 * Nothing here animates. A moving dash pattern reads as live traffic, and
 * there is no live traffic in this system.
 */

/** The lane a loop-closing edge bows through, clear of the cards. */
function bowLeft(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
) {
  /* Written out rather than delegated to `getBezierPath`, which is what
     this was doing before and why it produced a straight vertical rule.
     Both ends of a column-closing edge share an x by construction, and a
     bezier's control offset is a function of the x-difference between its
     endpoints — at zero difference every control point lands on the
     endpoint and the curve degenerates to a segment. That segment sat on
     the exact left border of every card it existed to route around, which
     is the one place the return stroke cannot be allowed to look. */
  const lane = Math.min(sourceX, targetX) - RETURN_LANE;
  return [
    `M ${sourceX},${sourceY} C ${lane},${sourceY} ${lane},${targetY} ${targetX},${targetY}`,
    (lane + targetX) / 2,
    (sourceY + targetY) / 2,
  ] as const;
}

/** Loop and chain: the two columns. */
function LatticeRingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<LatticeFlowEdge>) {
  const around = Boolean(data?.around);
  const path = around
    ? bowLeft(sourceX, sourceY, targetX, targetY)[0]
    : getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature: 0.22,
      })[0];

  return (
    <BaseEdge
      id={id}
      path={path}
      className="lattice-edge"
      data-kind={data?.kind ?? "loop"}
      data-lit={data?.lit || undefined}
      data-return={around || undefined}
    />
  );
}

/** Custody and instance: the crossings. Stepped, because a crossing is a
    change of column and a curve would pretend the two are continuous. */
function LatticeCrossEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<LatticeFlowEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 2,
    offset: 12,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      className="lattice-edge"
      data-kind={data?.kind ?? "custody"}
    />
  );
}

export const edgeTypes = {
  flow: LatticeRingEdge,
  cross: LatticeCrossEdge,
} satisfies EdgeTypes;

/**
 * The legend swatch for each kind — the same stroke, the same dash, drawn
 * as inline SVG rather than described by a CSS border. A CSS border cannot
 * express a dasharray, so two of the four kinds used to render identically
 * in the one place the surface promises they can be told apart.
 */
export function EdgeSwatch({ kind }: { kind: LatticeEdgeKind }) {
  return (
    <svg
      className="lattice-legend-svg"
      viewBox="0 0 40 10"
      width={40}
      height={10}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 0 5 L 40 5"
        fill="none"
        data-kind={kind}
        strokeWidth={kind === "loop" ? 2 : 1}
        strokeDasharray={
          kind === "loop"
            ? undefined
            : kind === "chain"
              ? "3 5"
              : kind === "custody"
                ? "6 4"
                : "2 4"
        }
      />
    </svg>
  );
}