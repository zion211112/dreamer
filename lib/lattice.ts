// lib/lattice.ts — the topology, derived. No data is declared here.
//
// This file answers one question: what does the system actually look like
// if you draw only what it can prove? Everything it emits is computed from
// lib/system.ts, so a claim cannot appear on the canvas that does not
// already exist in the register — and if the register changes, the canvas
// changes with it.
//
// Three node kinds, four meanings of an edge:
//
//   plane   the five control-plane stages. A closed loop: field ? register
//           ? intelligence ? control ? evidence ? field.
//   stage   the seven value-chain transformations. Also a closed loop,
//           beside the plane's, because Measure feeds Observe and not the
//           other way round.
//   build   an instantiation of the same chain in a domain, hung off the
//           plane node it exercises most.
//
// The edges are the argument, so each kind carries a different claim and
// is drawn differently — dash pattern, not hue, is what tells them apart:
//
//   loop     the flow. Lit on the edge leaving the node being read, dark
//            everywhere else, so the reader can see where they are.
//   chain    the transformation order. Always quiet; it is a scale, not a
//            route, and lighting one segment of it would be a lie about
//            the other six.
//   custody  a stage crossing into the plane node it resolves to. Drawn
//            only where VALUE_CHAIN declares a node — the other stages
//            have no plane node and inventing one is a lie.
//   instance a build attached to the node it exercises. Drawn, because a
//            build is an instance of the chain rather than a sixth node.

import {
  BUILDS,
  CHAIN_RETURN,
  EVIDENCE_STATES,
  PLANE,
  VALUE_CHAIN,
  type EvidenceState,
} from "@/lib/system";

export type LatticeKind = "plane" | "stage" | "build";
export type LatticeEdgeKind = "loop" | "chain" | "custody" | "instance";

/** The noun each kind gets in prose. Declared once so the card, the
    register band and the record panel cannot drift apart on it. */
export const KIND_TITLE: Record<LatticeKind, string> = {
  plane: "Control plane",
  stage: "Chain stage",
  build: "Instantiation",
};

export type LatticeNode = {
  id: string;
  kind: LatticeKind;
  ord: string;
  name: string;
  /** One clause: what this thing does to reality. */
  role: string;
  /** What one record here is. */
  holds: string;
  /** Who holds custody. Never empty: an unestablished custody is stated,
      not left blank, because a blank cell reads as a zero. */
  custody: string;
  /** Why this node's evidence state is what it is. */
  provenance: string;
  state: EvidenceState;
  /** Present only where the node resolves to a real route. */
  href?: string;
  position: { x: number; y: number };
};

export type LatticeEdge = {
  id: string;
  kind: LatticeEdgeKind;
  source: string;
  target: string;
  /**
   * This edge closes a loop inside one column and must be routed around
   * the cards rather than through them. Only the two edges that return
   * to the first node of their column carry it.
   */
  around?: boolean;
};

/* ?? The xyflow binding ?????????????????????????????????????????
   `LatticeNode` is the record; these are the same record in the
   shape the canvas engine takes. Kept here rather than in the
   component so the geometry above and the handles below are derived
   from one description of the topology and cannot disagree.
   ????????????????????????????????????????????????????????????????? */

/**
 * `onSelect` is the one function allowed into the payload, because the
 * card is a real button and a button with no handler is a decoration.
 * It takes nothing: the id is already in scope at the call site, and an
 * argument the caller ignores is an argument two encodings can drift on.
 */
export type LatticeFlowNode = import("@xyflow/react").Node<
  LatticeNode & { onSelect?: () => void },
  "lattice"
>;

export type LatticeFlowEdge = import("@xyflow/react").Edge<
  { kind: LatticeEdgeKind; lit?: boolean; around?: boolean },
  "flow" | "cross"
>;

/** The eight handle ids a card exposes, one per side. */
export type LatticeSide = "n" | "e" | "s" | "w";

export const LATTICE_SIDES: readonly LatticeSide[] = ["n", "e", "s", "w"];

/* ?? Geometry ????????????????????????????????????????????????????
   Three columns, left to right, in the order the system claims
   things happen: the seven transformations produce, the five stages
   decide, the six builds realise. Reading direction and causal
   direction are the same direction.

   Concentric rings were tried first and abandoned. A ring is the
   better picture of a loop, and it is the worse diagram: with seven
   cards at a 160px radius the chord between neighbours is 139px
   against a 200px card, so every card overlaps its own ring and the
   centre of the canvas becomes a smear.

   A column is legible at fit, which is the only zoom that matters.
   Fit is width-bound here — the canvas pane is narrower than the
   diagram is wide — so the horizontal spread is the number to watch.
   Every coordinate below is a multiple of 4, and every pitch is
   PITCH, which is one card height plus one gap: no card in a column
   can overlap another. That is the invariant, and it is checkable by
   reading five numbers.
   ????????????????????????????????????????????????????????????????? */

/** Card centre to card centre. A card is ~131px tall; 13px of clear. */
const PITCH = 144;
const X_CHAIN = 0;    // value chain — produces
const X_PLANE = 380;  // control plane — decides
const X_BUILD = 780;  // instantiations — realise

/** The chain is the tallest column, so it sets the height of everything. */
const chainY = (i: number) => i * PITCH;

/**
 * The plane has five nodes against the chain's seven, so it is centred
 * on the same middle and occupies the middle five slots. Node *i* of the
 * plane therefore sits one half-pitch below node *i* of the chain, which
 * is why a stage's custody edge to its node is a short diagonal rather
 * than a long crossing.
 */
const planeY = (i: number) => (i + 1) * PITCH;

/**
 * Builds are laid out on their own even pitch, not on their parent
 * node's row. Two builds hang off Control, and sharing Control's row
 * would put one of them on top of a different build's card. An even
 * pitch cannot collide: the gap between consecutive builds is PITCH
 * whatever their parents are. The instance edge is what says which node
 * a build belongs to, so nothing is lost by laying them out evenly
 * instead.
 */
const buildY = (i: number) => i * PITCH;

/**
 * How far left of a column the loop-closing stroke bows, so the return
 * edge never lies on the cards' own left border.
 */
export const RETURN_LANE = 56;

/** xyflow positions are centres here — the canvas mounts with
    `nodeOrigin={[0.5, 0.5]}` so a card lands on its own coordinate
    whatever height it renders at. */
function place(x: number, y: number) {
  return { x, y };
}

export type Lattice = {
  nodes: LatticeNode[];
  edges: LatticeEdge[];
  /** The one sentence that closes both loops. */
  returns: string;
};

export function buildLattice(): Lattice {
  const nodes: LatticeNode[] = [];
  const edges: LatticeEdge[] = [];

  /* ?? The plane ??????????????????????????????????????????????? */
  PLANE.forEach((node, i) => {
    nodes.push({
      id: `plane:${node.key}`,
      kind: "plane",
      ord: node.ord,
      name: node.name,
      role: node.role,
      holds: node.holds,
      custody: node.custody,
      provenance: node.provenance,
      state: node.state,
      href: node.href,
      position: place(X_PLANE, planeY(i)),
    });
  });

  /* The return edge is the reason the last node's role is phrased as an
     action, so it is drawn as a real stroke that bows clear of the cards
     rather than as a rule on their border. Evidence ? Field is the edge
     that makes it a loop. */
  PLANE.forEach((_, i) => {
    const from = PLANE[i];
    const to = PLANE[(i + 1) % PLANE.length];
    edges.push({
      id: `loop:${from.key}?${to.key}`,
      kind: "loop",
      source: `plane:${from.key}`,
      target: `plane:${to.key}`,
      /* Evidence is the last plane node and Field the first, so this is
         the only plane edge that runs the full height of its column. */
      around: to.key === PLANE[0].key,
    });
  });

  /* ?? The chain ??????????????????????????????????????????????? */
  VALUE_CHAIN.forEach((stage, i) => {
    nodes.push({
      id: `stage:${stage.ord}`,
      kind: "stage",
      ord: stage.ord,
      name: stage.name,
      role: stage.what,
      holds: stage.what,
      custody: stage.owner,
      provenance: `Stage ${stage.ord} of the value chain. Custody: ${stage.owner}.`,
      /* The chain is a specification, and a specification is PROTOTYPE
         here in the system's own sense: built, inspectable, deployed
         nowhere. It is not VERIFIED, because no record has passed through
         all seven stages. */
      state: "PROTOTYPE",
      position: place(X_CHAIN, chainY(i)),
    });
  });

  VALUE_CHAIN.forEach((stage, i) => {
    const from = stage;
    const to = VALUE_CHAIN[(i + 1) % VALUE_CHAIN.length];
    edges.push({
      id: `chain:${from.ord}?${to.ord}`,
      kind: "chain",
      source: `stage:${from.ord}`,
      target: `stage:${to.ord}`,
      /* Measure is the last chain stage and Observe the first, so this is
         the only chain edge that runs the full height of its column. */
      around: to.ord === VALUE_CHAIN[0].ord,
    });
  });

  /* Custody crossings, drawn only where the data declares a boundary. */
  VALUE_CHAIN.forEach((stage) => {
    if (!stage.node) return;
    edges.push({
      id: `custody:${stage.ord}?${stage.node}`,
      kind: "custody",
      source: `stage:${stage.ord}`,
      target: `plane:${stage.node}`,
    });
  });

  /* ?? The builds ?????????????????????????????????????????????? */
  BUILDS.forEach((build, i) => {
    nodes.push({
      id: `build:${build.domain}`,
      kind: "build",
      ord: String(i + 1).padStart(2, "0"),
      name: build.name,
      role: build.chain,
      holds: `${build.domain} — an instantiation of the same chain over one domain.`,
      /* Custody is stated, never blank. A build with no route has no
         recorded institution holding its records, and "not established"
         is a different statement from "nobody holds them" — the first is
         this system's UNKNOWN, the second would be a measurement. */
      custody: build.href ? "Not yet recorded" : "Not established",
      provenance: build.provenance,
      state: build.state,
      href: build.href,
      position: place(X_BUILD, buildY(i)),
    });
    edges.push({
      id: `instance:${build.domain}?${build.node}`,
      kind: "instance",
      source: `build:${build.domain}`,
      target: `plane:${build.node}`,
    });
  });

  return { nodes, edges, returns: CHAIN_RETURN };
}

/* ?? What the canvas is allowed to claim ??????????????????????????
   Every node on the lattice is either PROTOTYPE (built, openable here)
   or PLANNED (designed, no figures). That distribution is not a styling
   decision: it is the tally of the nodes actually rendered, computed
   rather than asserted, and it is what the tally strip beside the canvas
   prints. The order comes from EVIDENCE_STATES rather than being restated
   here, because the same ordering governs the tags, the tally bars and the
   measure cells and a second copy of it would be a second thing to keep
   in step.
   ????????????????????????????????????????????????????????????????? */

export function latticeTally(nodes: readonly LatticeNode[]): {
  state: EvidenceState;
  count: number;
}[] {
  return EVIDENCE_STATES.map((state) => ({
    state,
    count: nodes.filter((n) => n.state === state).length,
  }));
}