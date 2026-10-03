// lib/system.ts — RUNTIME SOURCE OF TRUTH for the APT-LABS control plane.
//
// Every route, node, chain stage, register row and tally in the site is
// minted here and nowhere else. A claim may only be added to this file if
// an evidence path exists for it — that is the whole point of the system.
//
// The epistemic contract, as code:
//
//   UNKNOWN    ≠ zero       → UNKNOWN is always rendered, never omitted
//   PROTOTYPE  ≠ deployed   → no deployment, adoption or outcome claim
//   TARGET     ≠ current    → targets are labelled TARGET, never as results
//   PLANNED    ≠ built      → planned surfaces carry no figures
//   VERIFIED   needs a path → every VERIFIED row names its source
//
// The system records reality. If reality is not established, the
// uncertainty is preserved rather than resolved in the system's favour.

/* ---------------------------------------------------------------- */
/* EPISTEMIC CONTRACT                                                */
/* ---------------------------------------------------------------- */

/**
 * The five states. Structural, not decorative — the UI must not render
 * a claim without one, and must never upgrade one implicitly.
 */
export type EvidenceState =
  | "VERIFIED"
  | "PROTOTYPE"
  | "TARGET"
  | "PLANNED"
  | "UNKNOWN";

export const EVIDENCE_STATES: readonly EvidenceState[] = [
  "VERIFIED",
  "PROTOTYPE",
  "TARGET",
  "PLANNED",
  "UNKNOWN",
] as const;

/**
 * What each state legally permits a route to say. This is the enforcement
 * point: `permits` is a constraint on language, not a description of it.
 */
export const STATE_RULES: Record<EvidenceState, { permits: string; forbids: string }> = {
  VERIFIED: {
    permits: "A citable, inspectable evidence path exists in this repository or a named public record.",
    forbids: "Nothing is inferred beyond the evidence path itself.",
  },
  PROTOTYPE: {
    permits: "Built and running locally, inspectable by anyone who opens the route.",
    forbids: "Deployment, adoption, coverage, or outcome at any institution.",
  },
  TARGET: {
    permits: "A named intended outcome, stated as an intention.",
    forbids: "Current performance. A target is never rendered as a measurement.",
  },
  PLANNED: {
    permits: "Designed, not built. An architecture can be described.",
    forbids: "Any figure, count, date or capability claim.",
  },
  UNKNOWN: {
    permits: "An explicit statement that the value is not established.",
    forbids: "Zero, blank, omission, or a neighbouring figure that implies a value.",
  },
};

/* ---------------------------------------------------------------- */
/* THE MEMORY TARGET                                                 */
/* ---------------------------------------------------------------- */

export const COMPANY = {
  name: "APT-LABS",

  /** The sentence that must survive the first viewport. */
  primary: "APT-LABS records reality — and builds intelligence from it.",

  /** The line that scopes what kind of system it is. */
  supporting:
    "Local-first systems for evidence-bound records, operational decisions, and inspectable intelligence.",

  /**
   * The geography is declared product context, not marketing decoration.
   * Stated by the organisation; no field presence is yet evidenced.
   */
  geography: {
    value: "Kirinyaga, Kenya",
    state: "UNKNOWN" as EvidenceState,
    provenance:
      "Named as the operating geography by the organisation. No field presence, installation or partner record is documented, so the state stays UNKNOWN rather than DECLARED.",
  },
} as const;

/* ---------------------------------------------------------------- */
/* CONTROL PLANE — the nodes of the system                           */
/* ---------------------------------------------------------------- */

export interface PlaneNode {
  /** Two-digit ordinal. Position in the system, not menu order. */
  ord: string;
  key: string;
  name: string;
  /** One clause: what this node does to reality. */
  role: string;
  /** The live route. There are no dead nodes in this file by design. */
  href: string;
  state: EvidenceState;
}

export const PLANE: readonly PlaneNode[] = [
  {
    ord: "01",
    key: "field",
    name: "Field",
    role: "Reality occurs — events, people, assets, attendance, payments and decisions exist before the system interprets them.",
    href: "/",
    state: "PROTOTYPE",
  },
  {
    ord: "02",
    key: "register",
    name: "Register",
    role: "Reality is recorded — every material claim carries an id, a timestamp, a source and an evidence state.",
    href: "/register",
    state: "PROTOTYPE",
  },
  {
    ord: "03",
    key: "intelligence",
    name: "Intelligence",
    role: "Records become structure — patterns and derived signals, each traceable to the records it came from.",
    href: "/intelligence",
    state: "PROTOTYPE",
  },
  {
    ord: "04",
    key: "control",
    name: "Control",
    role: "Knowledge becomes action — contribution, decision, allocation, execution.",
    href: "/control",
    state: "PROTOTYPE",
  },
  {
    ord: "05",
    key: "evidence",
    name: "Evidence",
    role: "Action generates new records, and the loop closes back into the field.",
    href: "/evidence",
    state: "PROTOTYPE",
  },
] as const;

/* ---------------------------------------------------------------- */
/* VALUE CHAIN — the transformation primitive                        */
/* ---------------------------------------------------------------- */

export interface ChainStage {
  ord: string;
  name: string;
  /** What this stage does, in one clause. */
  what: string;
  /**
   * Who controls the transition. Local-first is a claim about custody:
   * the institution keeps its record, and the intelligence is derived
   * from a record it still holds.
   */
  owner: string;
  /** The plane node this stage resolves to, when it resolves to one. */
  node?: string;
}

export const VALUE_CHAIN: readonly ChainStage[] = [
  {
    ord: "01",
    name: "Observe",
    what: "Field reality is captured as it happens, by the people present.",
    owner: "The institution",
    node: "field",
  },
  {
    ord: "02",
    name: "Record",
    what: "Each observation becomes a row: id, timestamp, source, state.",
    owner: "The institution",
    node: "register",
  },
  {
    ord: "03",
    name: "Structure",
    what: "Rows become registers that can be queried, not only read.",
    owner: "The local record",
    node: "register",
  },
  {
    ord: "04",
    name: "Interpret",
    what: "Repeated records become patterns, each bound to its sources.",
    owner: "The local record",
    node: "intelligence",
  },
  {
    ord: "05",
    name: "Decide",
    what: "A decision is taken against the derived intelligence, under an explicit rule.",
    owner: "The institution",
    node: "control",
  },
  {
    ord: "06",
    name: "Execute",
    what: "The decision becomes work in the field: a lesson, a mark, a payment, a repair.",
    owner: "The institution",
    node: "control",
  },
  {
    ord: "07",
    name: "Measure",
    what: "Execution is measured against the decision, and the measurement returns as records.",
    owner: "The local record",
    node: "evidence",
  },
] as const;

export const CHAIN_RETURN =
  "Measure feeds Observe — the loop is the product.";
/* ---------------------------------------------------------------- */
/* REGISTERS — what the system records                              */
/* ---------------------------------------------------------------- */

export interface RegisterSpec {
  ord: string;
  name: string;
  /** What one row in this register is. */
  unit: string;
  what: string;
  href: string;
  state: EvidenceState;
  provenance: string;
}

export const REGISTERS: readonly RegisterSpec[] = [
  {
    ord: "01",
    name: "People Register",
    unit: "person",
    what: "The people the institution is accountable to, and the role each holds in a decision.",
    href: "/register",
    state: "PROTOTYPE",
    provenance:
      "The register interface exists and accepts local records. No public server-backed directory exists, so no population figure is published.",
  },
  {
    ord: "02",
    name: "Asset Register",
    unit: "asset",
    what: "Every asset's lifecycle — designed, procured, installed, tested, accepted — with a state per line.",
    href: "/register",
    state: "PROTOTYPE",
    provenance:
      "The lifecycle state machine exists in code. The asset record set is intentionally empty: no historical asset is asserted until its evidence is recorded.",
  },
  {
    ord: "03",
    name: "Decision Record",
    unit: "decision",
    what: "Who decided, under which rule, on what evidence, and what execution followed.",
    href: "/control",
    state: "PROTOTYPE",
    provenance:
      "The decision schema and its eligibility rules are defined. No institutional decision archive is published, so the record set starts empty.",
  },
  {
    ord: "04",
    name: "Attendance Record",
    unit: "day",
    what: "Daily presence per learner per class, with the register it was taken in.",
    href: "/console",
    state: "PROTOTYPE",
    provenance:
      "Attendance is recorded and bulk-registered on-device in the console. Records live in the browser until exported; nothing is transmitted.",
  },
  {
    ord: "05",
    name: "Assessment Record",
    unit: "submission",
    what: "Marks, the marking key, the weakness map derived from them, and the source paper.",
    href: "/console",
    state: "PROTOTYPE",
    provenance:
      "The marking engine and weakness-map derivation run locally. No learner performance figure is published because no assessment has been recorded in this repository.",
  },
  {
    ord: "06",
    name: "Fee Record",
    unit: "invoice",
    what: "Invoices raised, payments reconciled against the pay statement, and balances outstanding.",
    href: "/console",
    state: "PROTOTYPE",
    provenance:
      "Invoice and reconciliation logic exist locally. No payment data is held in this repository, so no collection rate is claimed.",
  },
] as const;
/* ---------------------------------------------------------------- */
/* DERIVED SIGNALS — intelligence, bound to source records          */
/* ---------------------------------------------------------------- */

/**
 * An intelligence artefact must never be a number without its sources.
 * `sources` is required (not optional) so an unbacked derived signal is a
 * type error rather than something found in review.
 */
export interface Signal {
  id: string;
  name: string;
  /** The derived statement, in the system's own terms. */
  reading: string;
  /** How the reading was derived from the source records. */
  method: string;
  /** The records this reading rests on. */
  sources: readonly string[];
  state: EvidenceState;
  provenance: string;
}

export const SIGNALS: readonly Signal[] = [
  {
    id: "SIG-01",
    name: "Assessment weakness map",
    reading:
      "Where a submission lost marks, grouped by the objective it was testing — not a score, but the shape of what is not yet learned.",
    method:
      "Derived per submission from the marking key: every lost mark is attributed to the objective it belongs to, then aggregated across the submissions in a class.",
    sources: ["ASSESSMENT-01", "MARK-KEY-01"],
    state: "PROTOTYPE",
    provenance:
      "The derivation runs in the console against locally entered data. It has never been run against a real school cohort, so its output demonstrates the method rather than a finding about learners.",
  },
  {
    id: "SIG-02",
    name: "Attendance irregularity",
    reading:
      "Learners whose absence clusters on particular weekdays or particular classes, rather than dispersing at random.",
    method:
      "Derived from the attendance register by grouping absence days by weekday and class over a term, then ranking by deviation from each learner's own baseline.",
    sources: ["ATTENDANCE-01"],
    state: "PROTOTYPE",
    provenance:
      "The grouping exists locally. With no multi-week register recorded, no learner-level finding can be stated — the signal is a method awaiting records.",
  },
  {
    id: "SIG-03",
    name: "Fee reconciliation drift",
    reading:
      "Payments that appear in a pay statement but match no invoice raised for that admission number.",
    method:
      "Derived by joining reconciled statement lines against the fee register on admission number and amount, reporting unmatched lines in both directions.",
    sources: ["FEE-01"],
    state: "PLANNED",
    provenance:
      "The join is specified. It has not been implemented against a real statement, and no drift count is published.",
  },
] as const;

/* ---------------------------------------------------------------- */
/* THE CURRENT CONSOLE — the first field implementation             */
/* ---------------------------------------------------------------- */

export const CONSOLE = {
  name: "School Console",
  href: "/console",
  oneLine:
    "A local-first operating console for teacher and school work — the first concrete field implementation of this architecture.",
  state: "PROTOTYPE" as EvidenceState,
  localFirst:
    "The session, favourites and records live on this device. Nothing entered in the console leaves the browser.",
  modules: [
    "Content Studio",
    "Auto-Marking",
    "My Day",
    "Timetable",
    "Roster",
    "Reports",
    "Fees",
    "Inspection",
    "Comms",
  ] as const,
  provenance:
    "Nine modules and ten tools, running in this repository and inspectable by opening the route. No institution is running it: there is no deployment, adoption or outcome record.",
} as const;
/* ---------------------------------------------------------------- */
/* FUTURE FIELD STATIONS — same grammar, other domains              */
/* ---------------------------------------------------------------- */

/**
 * These are architectures, not products. Each is stated as a chain over
 * the same transformation, so extending the system changes the domain and
 * nothing else. No stage below is built; all are PLANNED.
 */
export interface FieldStation {
  name: string;
  /** reality → evidence-bound record → intelligence → decision */
  chain: string;
  state: EvidenceState;
}

export const FIELD_STATIONS: readonly FieldStation[] = [
  {
    name: "Procurement",
    chain: "tenders → records → buyer patterns → opportunity intelligence",
    state: "PLANNED",
  },
  {
    name: "Agriculture",
    chain: "farm events → records → patterns → operational recommendations",
    state: "PLANNED",
  },
  {
    name: "Language",
    chain: "speech → governed dataset → linguistic structure → model → service",
    state: "PLANNED",
  },
  {
    name: "Commerce",
    chain: "transactions → records → market structure → decision intelligence",
    state: "PLANNED",
  },
] as const;

/* ---------------------------------------------------------------- */
/* MEASURES — figures that appear in the first viewport              */
/* ---------------------------------------------------------------- */

export interface Measure {
  figure: string;
  key: string;
  note: string;
  state: EvidenceState;
}

export const MEASURES: readonly Measure[] = [
  {
    figure: "9",
    key: "console modules",
    note: "Ten tools, running locally. No institution is running them.",
    state: "PROTOTYPE",
  },
  {
    figure: "6",
    key: "record classes",
    note: "People, assets, decisions, attendance, assessment, fees.",
    state: "PROTOTYPE",
  },
  {
    figure: "—",
    key: "verified deployments",
    note: "Not established. Held as unknown rather than rendered as zero.",
    state: "UNKNOWN",
  },
  {
    figure: "1",
    key: "evidence path per claim",
    note: "A VERIFIED row must name the record that supports it.",
    state: "VERIFIED",
  },
] as const;
/* ---------------------------------------------------------------- */
/* THE EPISTEMIC CONTRACT AS A REGISTER — inspectable rules          */
/* ---------------------------------------------------------------- */

export const CONTRACT_RULES: readonly {
  id: string;
  subject: EvidenceState;
  equals: string;
  doesNotEqual: string;
}[] = [
  {
    id: "RULE-01",
    subject: "UNKNOWN",
    equals: "The value is not established.",
    doesNotEqual: "Zero. An unknown is rendered, never omitted, never blank.",
  },
  {
    id: "RULE-02",
    subject: "PROTOTYPE",
    equals: "Built, running locally, inspectable.",
    doesNotEqual: "Deployed. No route implies an institution is running it.",
  },
  {
    id: "RULE-03",
    subject: "TARGET",
    equals: "A named intended outcome.",
    doesNotEqual: "Current performance. Never rendered as a measurement.",
  },
  {
    id: "RULE-04",
    subject: "PLANNED",
    equals: "Designed, not built.",
    doesNotEqual: "Implemented. Planned surfaces carry no figures.",
  },
  {
    id: "RULE-05",
    subject: "VERIFIED",
    equals: "An identifiable evidence path exists.",
    doesNotEqual: "Asserted. A verified row without a source is a bug.",
  },
] as const;

/* ---------------------------------------------------------------- */
/* PUBLISHED UNKNOWNS — the register of what is not established      */
/* ---------------------------------------------------------------- */

/**
 * Things a system in this field is normally asked for, which are not
 * established here. Publishing them is the point: an unknown that is
 * named is an open question, while an unknown that is omitted reads as a
 * zero and gets quoted as one.
 *
 * `since` is when the question became established as a question, not a
 * measurement date — there is no measurement.
 */
export const UNKNOWN_FACTS: readonly {
  id: string;
  what: string;
  why: string;
  since: string;
}[] = [
  {
    id: "UNK-01",
    what: "Institutions running this system",
    why: "No deployment has taken place. The console is a local prototype and no school record is documented.",
    since: "2026-09",
  },
  {
    id: "UNK-02",
    what: "Learner and staff counts",
    why: "No institution register is held in this repository. A device-local count is a runtime reading, not a population figure.",
    since: "2026-09",
  },
  {
    id: "UNK-03",
    what: "Learning outcomes",
    why: "No cohort has been assessed through the console. The weakness map has never run against real submissions, so no outcome can be stated.",
    since: "2026-09",
  },
  {
    id: "UNK-04",
    what: "Fee collection performance",
    why: "No payment data is held here. A collection rate without a denominator and a statement would be a guess presented as a figure.",
    since: "2026-09",
  },
  {
    id: "UNK-05",
    what: "Partnerships and procurement relationships",
    why: "No contract, tender record or partner agreement is documented in this repository.",
    since: "2026-09",
  },
  {
    id: "UNK-06",
    what: "Organisation registration and team",
    why: "Legal status and team members are not documented. Names, titles and registration numbers are not published until recorded with evidence.",
    since: "2026-09",
  },
] as const;

/* ---------------------------------------------------------------- */
/* TALLY — counted from the records actually rendered                */
/* ---------------------------------------------------------------- */

/**
 * Evidence distribution for a surface. Computed from the records on that
 * surface — never hard-coded, never rounded toward a friendlier number.
 * States with a count of zero are still returned: a zero here means "none
 * on this surface", which is a different statement from "not applicable".
 */
export function tally(states: readonly EvidenceState[]): {
  state: EvidenceState;
  count: number;
}[] {
  return EVIDENCE_STATES.map((state) => ({
    state,
    count: states.filter((s) => s === state).length,
  }));
}