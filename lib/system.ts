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

  /**
   * The same claim, compressed to a size a display setting can carry,
   * and pre-broken.
   *
   * This is a restatement of `primary` and of STATE_RULES, not a new
   * claim: the register refuses to publish a figure that has no source
   * (RULE-05), so what it publishes is assertions it can cite. It
   * exists because `primary` is a 62-character sentence and the hero is
   * a 15ch measure at 181px — a sentence that cannot be set at display
   * size is a sentence that was never designed to be the largest thing
   * on the page. The full sentence stays on the page immediately below
   * it, so the compression never replaces the claim, only introduces it.
   *
   * The break is stored rather than left to the browser. `text-wrap:
   * balance` will happily produce "Records, / not / assertions." with
   * one word orphaned on its own line, which is the ugliest thing a
   * display setting can do. Storing the two lines makes the lockup
   * identical on every viewport, and the hero's size clamp in
   * globals.css is then derived from the width of "Records, not" — the
   * wider of the two — so the designed break is always the one that
   * fits.
   */
  mantra: "Records, not assertions.",
  mantraLines: ["Records, not", "assertions."],

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
  /** What one record in this node is. The inspector's primary line. */
  holds: string;
  /** Who holds custody of the record at this stage. */
  custody: string;
  /** Why this node's evidence state is what it is. */
  provenance: string;
}

export const PLANE: readonly PlaneNode[] = [
  {
    ord: "01",
    key: "field",
    name: "Field",
    role: "Reality occurs — events, people, assets, attendance, payments and decisions exist before the system interprets them.",
    href: "/",
    state: "PROTOTYPE",
    holds: "Events, people, assets, attendance, payments and decisions, recorded at the moment they occur.",
    custody: "The institution",
    provenance:
      "Field entry runs on the operator's own device. No institution has entered anything, so this node describes a stage rather than holding a record set.",
  },
  {
    ord: "02",
    key: "register",
    name: "Register",
    role: "Reality is recorded — every material claim carries an id, a timestamp, a source and an evidence state.",
    href: "/register",
    state: "PROTOTYPE",
    holds: "One row per material claim: identifier, timestamp, source, evidence state, provenance, and the route it can be inspected on.",
    custody: "The local record",
    provenance:
      "The row grammar is implemented and enforced. Every record set is intentionally empty: no institutional row is published until its evidence is recorded.",
  },
  {
    ord: "03",
    key: "intelligence",
    name: "Intelligence",
    role: "Records become structure — patterns and derived signals, each traceable to the records it came from.",
    href: "/intelligence",
    state: "PROTOTYPE",
    holds: "Derived readings, each bound to the records it came from and the method that derived it.",
    custody: "The local record",
    provenance:
      "Three derivations are specified and two are implemented locally against entered data. None has been run against a real cohort, so no reading describes any person.",
  },
  {
    ord: "04",
    key: "control",
    name: "Control",
    role: "Knowledge becomes action — contribution, decision, allocation, execution.",
    href: "/control",
    state: "PROTOTYPE",
    holds: "Decisions, the rule each was taken under, the records in front of it, and the execution that followed.",
    custody: "The institution",
    provenance:
      "The decision schema and its eligibility rules are defined in code. No institutional decision archive exists, so the record set starts empty.",
  },
  {
    ord: "05",
    key: "evidence",
    name: "Evidence",
    role: "Action generates new records, and the loop closes back into the field.",
    href: "/evidence",
    state: "PROTOTYPE",
    holds: "The evidence state of every published claim, and the register of what is not established.",
    custody: "The institution",
    provenance:
      "This is the route being read: it is the only part of this system that is real in the strict sense, because its content is only claims about the system's own state.",
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
/* THE BUILDS — the grammar, instantiated in a domain               */
/* ---------------------------------------------------------------- */

/**
 * A build is one instantiation of the same chain over one domain.
 *
 * This is the load-bearing reframe of the whole system: the School
 * Console is not the product, it is *an example of the product*. It is
 * the only build that exists, and it is listed first because it is the
 * only one with a route — not because it is the most important domain.
 *
 * `href` is present only where a build actually resolves to a surface.
 * A build without one is rendered in the planned annex, never as a
 * link: a node that looks like a link and resolves to nothing is the
 * one failure this system's grammar exists to prevent.
 *
 * `state` is the whole story of each row. PROTOTYPE means built and
 * openable; PLANNED means designed, and carries no figure, no count and
 * no date, because a planned surface has none.
 */
export interface Build {
  name: string;
  /** The domain this build runs in. One noun. */
  domain: string;
  /**
   * The plane node this build exercises most.
   *
   * A build is not a sixth node and it does not belong in the menu: it
   * is an instance of the chain, so it hangs off the field that carries
   * its heaviest stage. Six builds map onto the five fields, and the
   * lattice uses this to say which part of the system a build exercises.
   *
   * It was introduced for the build floor and briefly removed with it.
   * The fact belongs to the register rather than to either route: which
   * stage a build exercises is a property of the build, and a route is
   * not a place for facts to live.
   */
  node: PlaneNode["key"];
  /** reality → evidence-bound record → structure → decision */
  chain: string;
  state: EvidenceState;
  /** Present only when the build resolves to a real surface. */
  href?: string;
  /** Why this build's state is what it is. */
  provenance: string;
}

export const BUILDS: readonly Build[] = [
  {
    name: "School Console",
    domain: "School operations",
    node: "field",
    chain: "attendance → records → patterns → decisions",
    state: "PROTOTYPE",
    href: "/console",
    provenance:
      "Nine modules and ten tools, running in this repository and openable by anyone. No institution runs it: there is no deployment, adoption or outcome record.",
  },
  {
    name: "Hospital Management",
    domain: "Clinical administration",
    node: "register",
    chain: "encounters → records → outcomes → protocols",
    state: "PLANNED",
    provenance:
      "Designed against the same seven stages and the same custody boundary. Not built: there is no code, no schema and no clinical data in this repository, so this row carries no figure of any kind.",
  },
  {
    name: "Procurement",
    domain: "Public and institutional buying",
    node: "intelligence",
    chain: "tenders → records → buyer patterns → opportunity intelligence",
    state: "PLANNED",
    provenance:
      "The join from tender register to buyer pattern is specified. Nothing is implemented and no tender data is held here.",
  },
  {
    name: "Agriculture",
    domain: "Farm operations",
    node: "control",
    chain: "farm events → records → patterns → operational recommendations",
    state: "PLANNED",
    provenance:
      "Designed to run on events already recorded at the farm. No farm, no season and no dataset is documented.",
  },
  {
    name: "Language",
    domain: "Speech and text",
    node: "evidence",
    chain: "speech → governed dataset → linguistic structure → model → service",
    state: "PLANNED",
    provenance:
      "The governance step is the load-bearing one and is specified before the model step. No dataset exists and no model has been trained.",
  },
  {
    name: "Commerce",
    domain: "Local trade",
    node: "control",
    chain: "transactions → records → market structure → decision intelligence",
    state: "PLANNED",
    provenance:
      "Specified only. No transaction data is held in this repository, so no market structure can be claimed.",
  },
] as const;

/** The builds that resolve to a surface. The rest are architectures. */
export const LIVE_BUILDS: readonly Build[] = BUILDS.filter((b) => b.href);
export const PLANNED_BUILDS: readonly Build[] = BUILDS.filter((b) => !b.href);

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