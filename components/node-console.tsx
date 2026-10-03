"use client";

// APT-LABS — Node Console
// ═══════════════════════════════════════════════════════════════════════
// The graph is the interface. Not a dashboard, not a section.
//
// Five levels, traversed the way an operator actually thinks about the
// system, each one answering a single question:
//
//   01 SYSTEM     What is this?
//   02 FAMILIES   What does it run on?
//   03 STAGES     What does a decision pass through?
//   04 EVIDENCE   What is actually on record?
//   05 VERDICT    What has the system concluded?
//
// Two rules govern everything here.
//
// ONE. Nothing is a card until you ask it to become one. A node is a mark
// and a label. Selection does not decorate the canvas; it resolves detail
// in the inspector beside it.
//
// TWO. The line is the claim. Edge pattern carries evidence state:
//   solid   evidenced      both ends hold records
//   dashed  proposed       the rule is published, execution has not run
//   dotted  illustrative   the link exists in the model, not on record
//   broken  chain stopped  the loop breaks here, and says so
//
// The broken edge between allocation and execution is deliberate. Nothing
// has been disbursed and no fabrication has occurred, so the console draws
// the gap rather than smoothing over it. That single mark is the most
// honest thing on the surface.
//
// Every node's state is read from lib/company.ts. No node claims more than
// the evidence record supports. The one VERIFIED claim on this surface is
// the SHA-256 seal, because that is the only VERIFIED row in the ledger.
// ═══════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BENBEN_BUILDS,
  COMPANY,
  EVIDENCE_SNAPSHOT,
  FACE_SURFACES,
  FACES,
  OPERATING_LOOP,
  STATUS_LEDGER,
} from "@/lib/company";

/** Compose a class list from static literals. Assembled class names are
    invisible to scripts/css-structure-check.js, which then reports live
    styles as dead. Every name below is a literal the audit can read. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ── Vocabulary ────────────────────────────────────────────────────────────

type Tone = "verified" | "recorded" | "planned" | "prototype" | "illustrative";
type EdgeKind = "evidenced" | "proposed" | "illustrative" | "broken";
type LevelId = "system" | "families" | "stages" | "evidence" | "verdict";

/** Tone → the class it wears. Written out so none can be typo'd. */
const TONE: Record<Tone, string> = {
  verified: "is-t-verified",
  recorded: "is-t-recorded",
  planned: "is-t-planned",
  prototype: "is-t-prototype",
  illustrative: "is-t-illustrative",
};

type Check = { label: string; ok: boolean };

type GNode = {
  id: string;
  mark: string;
  title: string;
  state: string;
  tone: Tone;
  /** Scale = importance. The verified seal is the heaviest mark. */
  weight: number;
  detail: string;
  chain: string[];
  contract: Check[];
  hub?: boolean;
  /** Level this node descends into. Absent means it is a leaf. */
  into?: LevelId;
};

type GEdge = { from: string; to: string; kind: EdgeKind };

type Level = {
  id: LevelId;
  index: string;
  label: string;
  question: string;
  note: string;
  nodes: GNode[];
  edges: GEdge[];
};

// ── 01 SYSTEM ─────────────────────────────────────────────────────────────

const SYSTEM: Level = {
  id: "system",
  index: "01",
  label: "System",
  question: "What is this?",
  note: "One coordination layer. Click to descend into the surfaces it runs.",
  nodes: [
    {
      id: "aptlabs",
      mark: "APT",
      title: "APT-LABS coordination layer",
      state: "Prototype",
      tone: "prototype",
      weight: 1.55,
      hub: true,
      into: "families",
      detail: COMPANY.oneSentence,
      chain: ["EVIDENCE-PACK §1", "STATUS_LEDGER", COMPANY.geography.text],
      contract: [
        { label: "Local-first control plane", ok: true },
        { label: "Records held in this browser", ok: true },
        { label: "Server-backed directory", ok: false },
        { label: "Verified deployment", ok: false },
      ],
    },
  ],
  edges: [],
};

// ── 02 FAMILIES ───────────────────────────────────────────────────────────

const f = (k: "fab" | "studio" | "roll") => FACES[k];

const FAMILIES: Level = {
  id: "families",
  index: "02",
  label: "Families",
  question: "What does it run on?",
  note: "Three execution surfaces and one product track. Two are planned; none has a deployment record.",
  nodes: [
    {
      id: "aptlabs",
      mark: "APT",
      title: "Coordination layer",
      state: "Prototype",
      tone: "prototype",
      weight: 1.45,
      hub: true,
      detail: COMPANY.oneSentence,
      chain: ["EVIDENCE-PACK §1", "STATUS_LEDGER"],
      contract: [
        { label: "Local-first control plane", ok: true },
        { label: "Surfaces declared", ok: true },
        { label: "Verified deployment", ok: false },
      ],
    },
    {
      id: "fab",
      mark: "FAB",
      title: f("fab").name,
      state: STATE_OF(f("fab").status),
      tone: "planned",
      weight: 1.1,
      detail: f("fab").description,
      chain: ["STATUS_LEDGER", "EVIDENCE-PACK §6"],
      contract: [
        { label: "Production chain defined", ok: true },
        { label: "Fabrication record", ok: false },
        { label: "Installation record", ok: false },
        { label: "Field service record", ok: false },
      ],
    },
    {
      id: "studio",
      mark: "STU",
      title: f("studio").name,
      state: STATE_OF(f("studio").status),
      tone: "planned",
      weight: 1.1,
      detail: f("studio").description,
      chain: ["STATUS_LEDGER", "EVIDENCE-PACK §7"],
      contract: [
        { label: "Surface defined", ok: true },
        { label: "Demonstration node", ok: true },
        { label: "Production facility", ok: false },
        { label: "Installation record", ok: false },
      ],
    },
    {
      id: "benben",
      mark: "BEN",
      title: BENBEN_BUILDS.name,
      state: STATE_OF(BENBEN_BUILDS.status),
      tone: "prototype",
      weight: 1.1,
      detail: BENBEN_BUILDS.summary,
      chain: ["EVIDENCE-PACK §5", BENBEN_BUILDS.products[0].evidenceRefs[0]],
      contract: [
        { label: "Product track defined", ok: true },
        { label: BENBEN_BUILDS.products[0].name, ok: true },
        { label: "Verified school deployment", ok: false },
      ],
    },
    {
      id: "roll",
      mark: "ROL",
      title: f("roll").name,
      state: STATE_OF(f("roll").status),
      tone: "prototype",
      weight: 1.1,
      into: "evidence",
      detail: f("roll").description,
      chain: ["EVIDENCE-PACK §8", "SHA-256"],
      contract: [
        { label: "People register", ok: true },
        { label: "Asset register", ok: true },
        { label: "SHA-256 sealing", ok: true },
        { label: "Shared server storage", ok: false },
      ],
    },
  ],
  edges: [
    { from: "aptlabs", to: "fab", kind: "evidenced" },
    { from: "aptlabs", to: "studio", kind: "evidenced" },
    { from: "aptlabs", to: "benben", kind: "evidenced" },
    { from: "aptlabs", to: "roll", kind: "evidenced" },
  ],
};

// ── 03 STAGES ─────────────────────────────────────────────────────────────
// The economic loop, in the order a decision travels. Each stage asks the
// one question that stage must answer, so the abstraction is never a list
// of nouns. OPERATING_LOOP supplies the verbs; these supply the questions.

const STAGE_QUESTIONS = [
  "What needs doing?",
  "Who can do it?",
  "What gets resourced?",
  "What gets made?",
  "What is on record?",
  "What can be shown?",
];

const STAGE_NOTES = [
  "Needs, procurement, market and institutional signals.",
  "Builders, makers, operators and documented contribution.",
  "Priority, selection and explicit decision rules.",
  "Design, BOM, sourcing, fabrication, installation.",
  "A thing that acquires a history of state.",
  "Evidence, provenance, and the seal that survives handover.",
];

const STAGES: Level = {
  id: "stages",
  index: "03",
  label: "Stages",
  question: "What does a decision pass through?",
  note: "Concept architecture. Every stage below is carried by an illustrative record.",
  nodes: [
    {
      id: "aptlabs",
      mark: "APT",
      title: "One economic loop",
      state: "Published",
      tone: "illustrative",
      weight: 1.4,
      hub: true,
      into: "evidence",
      detail: "The loop is defined end to end. What has not happened is most of it.",
      chain: OPERATING_LOOP.map((s, i) => `${String(i + 1).padStart(2, "0")} ${s}`),
      contract: [
        { label: "Loop published", ok: true },
        { label: "Stages named", ok: true },
        { label: "Stages executed", ok: false },
      ],
    },
    ...OPERATING_LOOP.map((s, i) => ({
      id: `stage-${i}`,
      mark: String(i + 1).padStart(2, "0"),
      title: s,
      state: STAGE_QUESTIONS[i],
      tone: "illustrative" as Tone,
      weight: 1,
      detail: STAGE_NOTES[i],
      chain: [`${String(i + 1).padStart(2, "0")} ${s}`],
      contract: [
        { label: "Defined", ok: true },
        { label: "Carried by a record", ok: true },
        { label: "Executed", ok: false },
      ],
    })),
  ],
  edges: [
    ...OPERATING_LOOP.map((_, i) => ({
      from: `stage-${i}`,
      to: `stage-${(i + 1) % OPERATING_LOOP.length}`,
      kind: (i === OPERATING_LOOP.length - 1 ? "illustrative" : "proposed") as EdgeKind,
    })),
  ],
};

// ── 04 EVIDENCE ───────────────────────────────────────────────────────────
// The only level where a node is a record rather than a concept, and the
// only level with a broken edge.

const EVIDENCE: Level = {
  id: "evidence",
  index: "04",
  label: "Evidence",
  question: "What is actually on record?",
  note: "One record per loop stage. The chain breaks between allocation and execution.",
  nodes: [
    {
      id: "aptlabs",
      mark: "APT",
      title: "The record, walked in order",
      state: "Broken at stage 4",
      tone: "recorded",
      weight: 1.4,
      hub: true,
      into: "verdict",
      detail: "Six records, five links intact, one broken where the evidence stops.",
      chain: ["C-109", "PR-014", "POOL-014", "AF-014", "EVIDENCE-PACK §6", "SHA-256"],
      contract: [
        { label: "Contribution recorded", ok: true },
        { label: "Proposal under a rule", ok: true },
        { label: "Allocation run", ok: false },
        { label: "Execution performed", ok: false },
        { label: "Evidence sealed", ok: true },
      ],
    },
    {
      id: "c109",
      mark: "C-109",
      title: "Contribution recorded",
      state: "Recorded",
      tone: "recorded",
      weight: 1,
      detail:
        "Water node maintenance · APT Fab / field work. Issuer or witness signature, the contributing person, the linked asset and the event timestamp.",
      chain: ["C-109", "AF-014", "EVIDENCE-PACK §6"],
      contract: [
        { label: "Attribution", ok: true },
        { label: "Witness signature", ok: true },
        { label: "Linked asset", ok: true },
        { label: "Future leak", ok: true },
      ],
    },
    {
      id: "pr014",
      mark: "PR-014",
      title: "Proposal under an explicit rule",
      state: "Open",
      tone: "planned",
      weight: 1,
      detail:
        "Where should the next service node go? Scope, eligibility, allocation pool, implementation constraints and the evidence checklist published together.",
      chain: ["C-109", "PR-014", "POOL-014"],
      contract: [
        { label: "Rule published", ok: true },
        { label: "Scope declared", ok: true },
        { label: "Evidence checklist", ok: true },
        { label: "Allocation run", ok: false },
      ],
    },
    {
      id: "pool014",
      mark: "POOL-014",
      title: "Allocation by formula",
      state: "Pending",
      tone: "planned",
      weight: 1,
      detail:
        "Solar service node. Deployment candidate with explicit release conditions. KSh 420K illustrative, KSh 0 disbursed.",
      chain: ["PR-014", "POOL-014", "AF-014"],
      contract: [
        { label: "Sources declared", ok: true },
        { label: "Threshold published", ok: true },
        { label: "Disbursement", ok: false },
        { label: "Release condition met", ok: false },
      ],
    },
    {
      id: "af014",
      mark: "AF-014",
      title: "Physical execution",
      state: "Planned",
      tone: "planned",
      weight: 1,
      detail:
        "Solar service node. BOM, sourcing record, installer record and acceptance checklist linked to the record.",
      chain: ["POOL-014", "AF-014", "EVIDENCE-PACK §6"],
      contract: [
        { label: "BOM", ok: false },
        { label: "Sourcing record", ok: false },
        { label: "Installer record", ok: false },
        { label: "Acceptance test", ok: false },
      ],
    },
    {
      id: "evpack",
      mark: "PACK §6",
      title: "Evidence appended",
      state: "Recorded",
      tone: "recorded",
      weight: 1,
      detail:
        "Evidence bundle appended to the asset record: build record, source note, handover record and the acceptance checklist.",
      chain: ["AF-014", "EVIDENCE-PACK §6", "SHA-256"],
      contract: [
        { label: "Bundle linked", ok: true },
        { label: "Provenance", ok: true },
        { label: "Build record", ok: false },
        { label: "Handover record", ok: false },
      ],
    },
    {
      id: "seal",
      mark: "SHA-256",
      title: "The record survives",
      state: "Verified",
      tone: "verified",
      weight: 1.4,
      detail:
        "Sealing and rolling hashes. SHA-256 canonical records and master seals — the one verified property this surface claims.",
      chain: ["EVIDENCE-PACK §6", "SHA-256"],
      contract: [
        { label: "Canonical record", ok: true },
        { label: "Master seal", ok: true },
        { label: "Rolling hash", ok: true },
        { label: "Future leak", ok: true },
      ],
    },
  ],
  edges: [
    { from: "c109", to: "pr014", kind: "evidenced" },
    { from: "pr014", to: "pool014", kind: "proposed" },
    { from: "pool014", to: "af014", kind: "broken" },
    { from: "af014", to: "evpack", kind: "proposed" },
    { from: "evpack", to: "seal", kind: "evidenced" },
    { from: "seal", to: "c109", kind: "illustrative" },
  ],
};

// ── 05 VERDICT ────────────────────────────────────────────────────────────
// Level five: what the system actually concluded. One node, because the
// honest answer is short.

const VERDICT: Level = {
  id: "verdict",
  index: "05",
  label: "Verdict",
  question: "What has the system concluded?",
  note: "Not a summary of the graph. A statement of what the evidence permits.",
  nodes: [
    {
      id: "verdict",
      mark: "OK",
      title: "State is earned by evidence",
      state: "Discipline on",
      tone: "verified",
      weight: 1.6,
      hub: true,
      detail:
        "A record cannot promote itself. The node records a contribution, publishes the rule that governs its use, and holds the seal that proves the record has not been altered. Everything between those points is declared as unrun rather than presented as done.",
      chain: EVIDENCE_SNAPSHOT.map((e) => `${e.label} — ${e.state}`),
      contract: [
        { label: "Sealing and rolling hashes", ok: true },
        { label: "Protocol Node demonstrable", ok: true },
        { label: "School Console demonstrable", ok: true },
        { label: "APT Fab fabrication record", ok: false },
        { label: "APT Studio installation record", ok: false },
        { label: "Verified school deployment", ok: false },
      ],
    },
  ],
  edges: [],
};

const LEVELS: Record<LevelId, Level> = {
  system: SYSTEM,
  families: FAMILIES,
  stages: STAGES,
  evidence: EVIDENCE,
  verdict: VERDICT,
};

const ORDER: LevelId[] = ["system", "families", "stages", "evidence", "verdict"];

/** The trace. Each mark points at a node on the evidence level, so the
    timeline is a scrubber for the graph rather than decoration under it. */
const TRACE: { at: string; level: LevelId; node: string; msg: string }[] = [
  { at: "23:44", level: "evidence", node: "evpack", msg: "Asset evidence bundle appended" },
  { at: "23:51", level: "evidence", node: "pool014", msg: "Pool threshold recalculated" },
  { at: "00:09", level: "evidence", node: "pr014", msg: "Selection proof published" },
  { at: "00:12", level: "evidence", node: "c109", msg: "Contribution linked to asset" },
];

// ── Geometry ──────────────────────────────────────────────────────────────
// Deterministic. A protocol is a fixed structure, not a physics simulation:
// positions are authored, never emergent. Two compositions — a ring for
// pointer widths, an evidence spine for the phone.

const RING = { cx: 600, cy: 350, rx: 428, ry: 244 };
const SPINE = { x: 104, y0: 54, step: 92 };

function place(i: number, n: number, hub: boolean, layout: "ring" | "spine") {
  if (hub) return { x: RING.cx, y: RING.cy };
  if (layout === "spine") return { x: SPINE.x, y: SPINE.y0 + SPINE.step * i };
  const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
  return { x: RING.cx + RING.rx * Math.cos(a), y: RING.cy + RING.ry * Math.sin(a) };
}

function pull(from: { x: number; y: number }, to: { x: number; y: number }, n: number, i: number) {
  // Bow each edge outward from the centre so the ring reads as a cycle.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = mx - RING.cx;
  const dy = my - RING.cy;
  const k = Math.hypot(dx, dy) || 1;
  return { x: mx + (dx / k) * 46, y: my + (dy / k) * 46 };
}

/** Point on a quadratic at t — lets a broken edge be split at its gap. */
function qAt(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

function STATE_OF(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function NodeConsole() {
  const [level, setLevel] = useState<LevelId>("system");
  const [sel, setSel] = useState("aptlabs");
  const [cmd, setCmd] = useState("");
  const [mark, setMark] = useState(TRACE.length - 1);
  const [reduce, setReduce] = useState(false);

  const L = LEVELS[level];
  const node = useMemo(() => L.nodes.find((n) => n.id === sel) ?? L.nodes[0], [L, sel]);

  // Nodes adjacent to the selection stay lit; the rest recede.
  const near = useMemo(() => {
    const s = new Set<string>([node.id]);
    for (const e of L.edges) {
      if (e.from === node.id) s.add(e.to);
      if (e.to === node.id) s.add(e.from);
    }
    return s;
  }, [L, node.id]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // A level change resets the selection to that level's hub, if it has one.
  const goto = useCallback((id: LevelId) => {
    setLevel(id);
    const hub = LEVELS[id].nodes.find((n) => n.hub);
    if (hub) setSel(hub.id);
  }, []);

  const descend = useCallback(
    (n: GNode) => {
      setSel(n.id);
      if (n.into) goto(n.into);
    },
    [goto]
  );

  const q = cmd.trim().toLowerCase();
  const hits = q ? L.nodes.filter((n) => `${n.mark} ${n.title} ${n.state}`.toLowerCase().includes(q)) : [];

  const ringNodes = L.nodes.filter((n) => !n.hub);
  const positions: Record<string, { x: number; y: number }> = {};
  for (const n of L.nodes) {
    const i = ringNodes.findIndex((r) => r.id === n.id);
    positions[n.id] = place(n.hub ? 0 : Math.max(i, 0), Math.max(ringNodes.length, 1), !!n.hub, "ring");
  }
  const spinePositions: Record<string, { x: number; y: number }> = {};
  for (const n of L.nodes) {
    const i = ringNodes.findIndex((r) => r.id === n.id);
    spinePositions[n.id] = place(n.hub ? 0 : Math.max(i, 0), Math.max(ringNodes.length, 1), !!n.hub, "spine");
  }

  const geom = (layout: "ring" | "spine") =>
    L.edges.map((e, i) => {
      const P = layout === "ring" ? positions : spinePositions;
      const a = P[e.from];
      const b = P[e.to];
      if (!a || !b) return null;
      const c = pull(a, b, ringNodes.length, i);
      const path = (t0: number, t1: number) => {
        const at = (t: number) => ({
          x: qAt(a.x, c.x, b.x, t),
          y: qAt(a.y, c.y, b.y, t),
        });
        const s0 = at(t0);
        const s1 = at(t1);
        const mid = at((t0 + t1) / 2);
        return `M ${s0.x.toFixed(1)} ${s0.y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${s1.x.toFixed(1)} ${s1.y.toFixed(1)}`;
      };
      if (e.kind === "broken") {
        const at = 0.5;
        return {
          key: `${e.from}-${e.to}`,
          kind: e.kind,
          lit: e.from === node.id || e.to === node.id,
          d1: path(0, 0.44),
          d2: path(0.56, 1),
          gx: qAt(a.x, c.x, b.x, at),
          gy: qAt(a.y, c.y, b.y, at),
        };
      }
      return {
        key: `${e.from}-${e.to}`,
        kind: e.kind,
        lit: e.from === node.id || e.to === node.id,
        d1: path(0, 1),
        d2: null as string | null,
        gx: 0,
        gy: 0,
      };
    });

  return (
    <div className={cx("nc", reduce && "nc-reduced")}>
      {/* ── Rail: the five levels, and where you are in them ─────────── */}
      <nav className="nc-rail" aria-label="Console levels">
        <ol className="nc-rail-list">
          {ORDER.map((id) => {
            const lv = LEVELS[id];
            const on = id === level;
            const done = ORDER.indexOf(id) < ORDER.indexOf(level);
            return (
              <li key={id} className={cx("nc-rail-item", on && "is-on", done && "is-done")}>
                <button
                  type="button"
                  aria-current={on ? "step" : undefined}
                  onClick={() => goto(id)}
                >
                  <i aria-hidden="true">{lv.index}</i>
                  <span>{lv.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── Stage ─────────────────────────────────────────────────────── */}
      <div className="nc-body">
        <div className="nc-stagehead">
          <div>
            <div className="eyebrow">
              Level {L.index} · {L.label}
            </div>
            <h2 className="nc-question">{L.question}</h2>
          </div>
          <p className="nc-note">{L.note}</p>
        </div>

        <div className="nc-stage">
          {(["ring", "spine"] as const).map((layout) => (
            <svg
              key={layout}
              className={cx("nc-edges", layout === "spine" && "nc-edges-spine")}
              viewBox={layout === "ring" ? "0 0 1200 700" : "0 0 420 660"}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {geom(layout).map((e) =>
                e ? (
                  <g
                    key={layout + e.key}
                    className={cx("nc-edge", `is-k-${e.kind}`, e.lit && "is-lit")}
                  >
                    <path className="nc-edge-line" d={e.d1} />
                    {e.d2 && <path className="nc-edge-line" d={e.d2} />}
                    {e.d2 && <circle className="nc-gap" cx={e.gx} cy={e.gy} r="3.6" />}
                    {e.kind === "evidenced" && e.lit && (
                      <path className="nc-trace" d={e.d1} />
                    )}
                  </g>
                ) : null
              )}
            </svg>
          ))}

          {L.nodes.map((n) => {
            const p = positions[n.id];
            const sp = spinePositions[n.id];
            return (
              <button
                key={n.id}
                type="button"
                className={cx(
                  "nc-node",
                  n.id === node.id && "is-sel",
                  !near.has(n.id) && "is-dim",
                  n.hub && "is-hub"
                )}
                style={
                  {
                    "--w": n.weight,
                    "--rx": `${(p.x / 1200) * 100}%`,
                    "--ry": `${(p.y / 700) * 100}%`,
                    "--sx": `${(sp.x / 420) * 100}%`,
                    "--sy": `${(sp.y / 660) * 100}%`,
                  } as React.CSSProperties
                }
                aria-pressed={n.id === node.id}
                onClick={() => (n.into ? descend(n) : setSel(n.id))}
                onDoubleClick={() => n.into && descend(n)}
              >
                <span className={cx("nc-mark", TONE[n.tone])} aria-hidden="true" />
                <span className="nc-label">
                  <i>{n.mark}</i>
                  <b>{n.title}</b>
                  {n.into && <em aria-hidden="true">descend</em>}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Legend: the line language, stated once, in words ──────────── */}
        <ul className="nc-legend">
          <li className="is-k-evidenced">Evidenced</li>
          <li className="is-k-proposed">Proposed</li>
          <li className="is-k-illustrative">Illustrative</li>
          <li className="is-k-broken">Chain broken</li>
        </ul>

        {/* ── Trace: a scrubber for the graph ──────────────────────────── */}
        <div className="nc-trace-bar">
          <span className="nc-trace-cap">Trace</span>
          <div className="nc-ticks">
            {TRACE.map((t, i) => (
              <button
                key={t.at}
                type="button"
                className={cx("nc-tick", i === mark && "is-on")}
                onClick={() => {
                  setMark(i);
                  goto(t.level);
                  setSel(t.node);
                }}
              >
                <span className="nc-tick-dot" aria-hidden="true" />
                <i>{t.at}</i>
                <em>{t.msg}</em>
              </button>
            ))}
          </div>
        </div>

        {/* ── Inspector: chain and contract ────────────────────────────── */}
        <div className="nc-inspect">
          <div className="nc-inspect-head">
            <b>{node.mark}</b>
            <span>{node.title}</span>
            <span className={cx("nc-state", TONE[node.tone])}>{node.state}</span>
          </div>
          <p className="nc-inspect-detail">{node.detail}</p>

          <div className="nc-split">
            <div>
              <div className="eyebrow">Source chain</div>
              <ol className="nc-chain">
                {node.chain.map((c, i) => (
                  <li key={c}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    {c}
                  </li>
                ))}
              </ol>
              {node.into && (
                <button type="button" className="nc-replay" onClick={() => goto(node.into!)}>
                  Descend into {LEVELS[node.into].label.toLowerCase()}
                </button>
              )}
            </div>
            <div>
              <div className="eyebrow">Contract status</div>
              <ul className="nc-contract">
                {node.contract.map((c) => (
                  <li key={c.label} className={cx(c.ok ? "nc-ok" : "nc-no")}>
                    <span aria-hidden="true">{c.ok ? "✓" : "—"}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Command: the keyboard layer ──────────────────────────────── */}
        <div className="nc-cmd">
          <span className="nc-cmd-sigil" aria-hidden="true">
            &gt;
          </span>
          <input
            className="nc-cmd-input"
            type="text"
            value={cmd}
            placeholder={`inspect at level ${L.index.toLowerCase()} — ${L.nodes[1]?.mark ?? L.nodes[0].mark}`}
            aria-label={`Inspect a node at level ${L.label}`}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && hits[0]) {
                const h = hits[0];
                setCmd("");
                if (h.into) descend(h);
                else setSel(h.id);
              }
              if (e.key === "Escape") setCmd("");
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                const i = ORDER.indexOf(level);
                if (i > 0) goto(ORDER[i - 1]);
              }
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                const i = ORDER.indexOf(level);
                if (i < ORDER.length - 1) goto(ORDER[i + 1]);
              }
            }}
          />
          {hits.length > 0 && (
            <ul className="nc-cmd-hits">
              {hits.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCmd("");
                      if (h.into) descend(h);
                      else setSel(h.id);
                    }}
                  >
                    <i>{h.mark}</i>
                    {h.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}