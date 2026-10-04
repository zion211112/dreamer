// lib/system.ts — RUNTIME SOURCE OF TRUTH for APT-LABS.
//
// Every route, node, product, register row, figure and tally on this site
// is minted here and nowhere else. A claim may only be added to this file
// if an evidence path exists for it — that is the whole point of the system.
//
// APT-LABS is a software company. It builds and sells products: management
// systems that run an institution's operations, MVPs commissioned against
// a named problem, and studios where a build happens in the open. That
// sentence is commercial and it is the reason the rest of this file
// exists: a company that sells software has to say what it has built,
// what it costs, who it is for, and what is not yet true — in that order,
// and without dressing a design up as a customer.
//
// THE EPISTEMIC CONTRACT, as code:
//
//   UNKNOWN       ≠ zero           → UNKNOWN is rendered, never omitted
//   PROTOTYPE     ≠ deployed       → no deployment, sale or outcome claim
//   TARGET        ≠ current        → targets are labelled, never results
//   PLANNED       ≠ built          → planned surfaces carry no figures
//   DEMONSTRATION ≠ real record    → invented data never wears a real
//                                     record's confidence, and never
//                                     counts as one
//   VERIFIED      needs a path     → every VERIFIED row names its source
//
// The two errors this file exists to prevent are the two that cost a
// company its credibility: claiming more than is built, and claiming a
// thing works before anyone has used it. Both are failures of category —
// a schema mistaken for a shipment, invented data mistaken for a
// customer — and they are why every figure below is either derived from
// an array in this file or carries the state that says it is not a
// measurement.

/* ---------------------------------------------------------------- */
/* EPISTEMIC CONTRACT                                                */
/* ---------------------------------------------------------------- */

/**
 * The six states. Structural, not decorative — the UI must not render
 * a claim without one, and must never upgrade one implicitly.
 *
 * DEMONSTRATION is the sixth and the newest, and it exists because its
 * absence was producing the worst error on the site.
 *
 * The console seeds itself. On first load, with empty local stores, it
 * writes ten named Kenyan schools, roughly 7,650 enrolments, a term of
 * assessment scores and a set of fee records (lib/proto-school.ts). That
 * data is good enough to demonstrate every module, and it is invented.
 *
 * The previous vocabulary had no word for invented-but-functional, so that
 * data was published under PROTOTYPE — which claims "built and running
 * locally, inspectable" — while /register simultaneously published "no
 * institutional record has been entered". Both statements were on the same
 * website, and they contradicted each other. An investor who opened the
 * console and then the register would find the contradiction in about
 * ninety seconds, and every other number on the site would become suspect
 * with it.
 *
 * So the state is declared, not implied. DEMONSTRATION means the surface
 * runs and the data in it is invented. It sits on the temperature scale
 * above PLANNED — brighter, because the surface genuinely runs — and
 * below TARGET's slot in the ramp. scripts/check-contrast.mjs asserts its
 * position, so the two can never be confused by colour.
 */
export type EvidenceState =
  | "VERIFIED"
  | "PROTOTYPE"
  | "TARGET"
  | "PLANNED"
  | "DEMONSTRATION"
  | "UNKNOWN";

export const EVIDENCE_STATES: readonly EvidenceState[] = [
  "VERIFIED",
  "PROTOTYPE",
  "TARGET",
  "PLANNED",
  "DEMONSTRATION",
  "UNKNOWN",
] as const;

/**
 * The six states in narrative order — settled, present, intended,
 * designed, demonstrated, unestablished.
 *
 * Declared once so the tally, the register band, the lattice canvas and
 * the state table cannot disagree about what comes first, and so a state
 * cannot be quietly promoted by being re-sorted somewhere downstream.
 * This is a different ordering from the temperature scale in
 * check-contrast.mjs, and deliberately: that one is a claim about light,
 * this one is a claim about the argument.
 */
export const STATE_ORDER: readonly EvidenceState[] = [
  "VERIFIED",
  "PROTOTYPE",
  "TARGET",
  "PLANNED",
  "DEMONSTRATION",
  "UNKNOWN",
] as const;

/* ---------------------------------------------------------------- */
/* THE CONSOLE BOUNDARY                                              */
/* ---------------------------------------------------------------- */

/**
 * Vocabulary that belongs to the console product, and which the
 * architecture's own routes must not borrow.
 *
 * The console is a shipped product. Its subject matter — fees, attendance,
 * marking, learners, a school timetable — is not a secret and not
 * embarrassing: it is what a school buys. A product page that refuses to
 * name what the product does is not being careful, it is hiding the buyer
 * and the use case from the person deciding whether to buy.
 *
 * So the ban is scoped rather than lifted. It binds the ARCHITECTURE
 * routes — /register, /intelligence, /control, /evidence, /lattice — which
 * describe the system abstractly and must not smuggle a claim about fee
 * collection, or about irregular attendance in named children, into a
 * register row. It does not bind /product, whose whole subject is the
 * product. See CONSOLE_VOCABULARY_SCOPED below.
 *
 * That was not a hypothetical either. Every one of those phrases reached
 * the public site through this file, and none of it was imported by the
 * console: the dependency runs the wrong way, so nothing kept it honest.
 * The console has its own vocabulary in lib/console.ts and never reads
 * this one.
 *
 * It is exported rather than written into the checker so that the
 * contract and the machine check read the same list. A banned word list
 * kept in two places is a fifth thing to keep in step, which is how a
 * vocabulary of twenty-nine terms became seven copies of a module count.
 * scripts/check-lexicon.mjs asserts against this, and reads the exemption
 * from CONSOLE_VOCABULARY_SCOPED below rather than carrying its own copy.
 *
 * Terms are console nouns only. Words the architecture borrows in its own
 * sense are deliberately absent — "absence" means a missing record in this
 * file and a missing register row on the site, and a checker that banned it
 * would have to be taught the difference, which is a ban that stops being
 * read and starts being worked around.
 */
export const CONSOLE_VOCABULARY: readonly string[] = [
  "fee",
  "fees",
  "collection rate",
  "invoice",
  "invoices",
  "payment",
  "payments",
  "pay statement",
  "admission number",
  "balance outstanding",
  "attendance",
  "roll call",
  "learner",
  "learners",
  "pupil",
  "pupils",
  "student",
  "students",
  "roster",
  "marking key",
  "weakness map",
  "submission",
  "submissions",
  "cohort",
  "staff",
  "teacher",
  "teachers",
  "timetable",
  "term report",
] as const;

/**
 * Where CONSOLE_VOCABULARY does and does not bind.
 *
 * Declared here and read by scripts/check-lexicon.mjs, so the scope is a
 * stated rule rather than a hole in the checker somebody has to infer.
 *
 *   BOUND     every public route. The architecture must not name the
 *             product's operating nouns inside a register row or an
 *             evidence claim, because there they read as a claim about a
 *             real institution's money, or about detecting irregular
 *             attendance in named children.
 *   EXEMPT    /product. That route's subject IS the product, and a page
 *             about a product that refuses to say what the product does
 *             is refusing to answer the buyer's question. It may name
 *             modules; it may not publish a figure, a customer or an
 *             outcome.
 *
 * The exemption is a route, not a person. Widening it means moving the
 * product's nouns onto another architecture route, which is the mistake
 * the ban was written to catch.
 */
export const CONSOLE_VOCABULARY_SCOPED = {
  bound: "every public route",
  exempt: ["/product"],
} as const;

/* ---------------------------------------------------------------- */
/* WHAT EACH STATE PERMITS                                          */
/* ---------------------------------------------------------------- */

/**
 * What each state legally permits a route to say. This is the enforcement
 * point: `permits` is a constraint on language, not a description of it.
 *
 * Every entry is written so a reader can hold a sentence against it. The
 * DEMONSTRATION rule is what earns the sixth state: it separates "the
 * product works" from "the data is real", which are two different claims
 * about one surface and the two most often run together.
 */
export const STATE_RULES: Record<EvidenceState, { permits: string; forbids: string }> = {
  VERIFIED: {
    permits: "A citable, inspectable evidence path exists in this repository or a named public record.",
    forbids: "Nothing is inferred beyond the evidence path itself.",
  },
  PROTOTYPE: {
    permits: "Built and running locally, inspectable by anyone who opens the route.",
    forbids: "Deployment, sale, adoption, or outcome at any customer. Invented data.",
  },
  TARGET: {
    permits: "A named intended outcome, stated as an intention, with the date and the measure of success named now.",
    forbids: "Current performance. A target is never rendered as a measurement.",
  },
  PLANNED: {
    permits: "Designed, not built. An architecture or a track can be described.",
    forbids: "Any figure, count, date or capability claim.",
  },
  DEMONSTRATION: {
    permits: "The surface runs and the data in it is invented, labelled as such wherever that data is described.",
    forbids: "Reading as a record of anything that happened. Demonstration data never counts as a customer, an outcome, or a real institution.",
  },
  UNKNOWN: {
    permits: "An explicit statement that the value is not established.",
    forbids: "Zero, blank, omission, or a neighbouring figure that implies a value.",
  },
};

/* ---------------------------------------------------------------- */
/* THE COMPANY                                                       */
/* ---------------------------------------------------------------- */

/**
 * APT-LABS is a software company that builds and sells products.
 *
 * Three things it makes, and they are three different commercial shapes
 * rather than three domains of one architecture:
 *
 *   MANAGEMENT SYSTEMS  the operating software an institution runs its
 *                       week on. Sold per institution, per term. The
 *                       School Console is one.
 *   MVPs                commissioned against one named problem. Scoped
 *                       and priced per build.
 *   STUDIOS             where a build happens in the open, with its
 *                       register published as it goes.
 *
 * The previous version of this file refused to say any of that. It called
 * the company a "control plane", named its one shipped product "The built
 * surface", gave its sector as "Field operations", and told the reader on
 * the homepage that the product was "an example · not the product".
 * Every one of those was a category error pointed the same way — away
 * from the buyer.
 *
 * The cost was concrete. A reader could not tell what the company sells,
 * who pays, or what the one working thing in the repository was for. And
 * the site had no noun for price, customer, contract, pipeline or team
 * anywhere — not because those are unknown, which is a legitimate thing
 * to publish, but because the register's grammar had nowhere to put them.
 */
export const COMPANY = {
  name: "APT-LABS",

  /** What kind of company this is, in the words a reader would use. */
  kind: "Systems company",

  /**
   * One sentence: what exists, and the order it exists in.
   *
   * It read "operational software for institutions that keep their own
   * records" — true, and a category rather than a company. That sentence
   * describes a school-administration vendor, which is the reading this
   * site then spent nine routes failing to correct. The company builds
   * one stack: the record layer an institution holds outright, then
   * identity, builds, infrastructure and allocation above it. This
   * sentence leads with the record layer because it is the built one,
   * and names the stack because the stack is the reason the record layer
   * is a floor rather than a product.
   */
  primary:
    "APT-LABS builds the record layer an institution owns outright — and the stack above it.",

  /**
   * The same claim at display size, pre-broken into two designed lines.
   *
   * "Operational software." said the category, at 181px, on the homepage
   * of a company whose whole subject is what a record is for. A reader
   * finished the first screen knowing which shelf the company sits on and
   * nothing about the argument. This one states the argument: the record
   * is the unit of authority — not the vendor, not the ministry, not the
   * company — which is the one idea the stack above it exists to extend,
   * and which the product's custody rule already makes literally true.
   *
   * "Sovereign" is a load-bearing word and it is defined in the sentence
   * immediately below this one: the record stays where it was written,
   * and no layer above it may overrule it. Defined, it is engineering;
   * undefined, it would be exactly the kind of word this site exists to
   * refuse. The definition is therefore not optional copy — it is part
   * of the hero, and the two are always rendered together.
   *
   * The break is stored rather than left to `text-wrap: balance`, for the
   * original reason: balance will orphan a single word on its own line at
   * display size, which is the ugliest thing a display setting can do.
   * The hero clamp in globals.css is derived from the width of the wider
   * stored line, so the designed break is always the one that fits.
   */
  mantra: "The record is sovereign.",
  mantraLines: ["The record", "is sovereign."],

  /**
   * What that means, cashed immediately. One sentence, two clauses: the
   * definition of the word the hero uses, then the state of the stack.
   *
   * It previously listed the three product kinds — management systems,
   * MVPs, studios — which is the catalogue, and the catalogue has its own
   * route. This line has a harder job: a word as large as "sovereign"
   * must be defined before it can be believed, and the definition has to
   * be a property the product actually has. It is: the record does not
   * leave the device, so nothing above it can overrule it. That is the
   * whole definition, and it fits in a sentence.
   *
   * This string is also the meta description and the share-card line, so
   * it carries the count as well: one layer of five is built.
   */
  supporting:
    "The record stays where it was written, and no layer above it can overrule it. One layer of five is built and openable; the rest are designed.",

  /**
   * Who buys. Named as a buyer, because a product page that will not name
   * its customer is not being careful — it is refusing to answer the
   * question. The first product is built for the first buyer below; the
   * MVP and studio tracks are designed for the second.
   */
  buyers: [
    {
      name: "Schools",
      what: "One institution's operating week: the roll, the money, the marks, the timetable, the parents.",
      state: "DEMONSTRATION" as EvidenceState,
      note: "The built product is made for this buyer and has been demonstrated end to end on invented data. No school runs it.",
    },
    {
      name: "Small firms",
      what: "The documents and the decisions a small business signs and keeps.",
      state: "PLANNED" as EvidenceState,
      note: "The MVP and studio tracks are designed for this buyer. No build has been commissioned and none is claimed.",
    },
  ] as const,

  /**
   * The geography, held at the state it actually carries.
   *
   * Kirinyaga is the county the company builds from and the region its
   * first product is made for. It is NOT an operating geography: no
   * customer, deployment or field presence is evidenced anywhere, and the
   * previous version rendered this value in a slot labelled "Operating
   * geography" — asserting exactly what the state tag beside it denied.
   * A county a company builds from is a fact about the company; a county
   * it operates in is a claim about customers, and only the first is true.
   *
   * "Where the company builds from" is the phrase, and it is deliberate:
   * true, unembarrassing, and not readable as a footprint.
   */
  geography: {
    value: "Kirinyaga, Kenya",
    /** What the value is. Not a market claim. */
    scope: "Where the company builds from",
    state: "PROTOTYPE" as EvidenceState,
    provenance:
      "Stated by the organisation as the place the company works from and the region the first product is made for. No customer, deployment or field presence is evidenced, so no operating claim is made anywhere on this site.",
  },

  /**
   * How to reach the company.
   *
   * Its absence was the most expensive omission on this site. A prototype
   * whose navigation rail says in effect "there is nothing here you can
   * act on" is not a pitch, it is an archive — and an organisation's
   * contact route is a diligence fact, not a research question. Filing
   * "Organisation registration and team" under UNKNOWN_FACTS beside
   * "population sizes" put a missing company in the same category as an
   * unmeasured cohort, which is how a company with no customers yet comes
   * to look like a research programme rather than a business that can be
   * wired.
   *
   * Stated as the organisation's own record. Nothing here is derived, and
   * nothing here is verified by this repository — which is why it is
   * PROTOTYPE and not VERIFIED.
   */
  contact: {
    email: "aptlabske@gmail.com",
    /** Free-text line under the address. Kept to what a reader needs. */
    note: "Demo access, pilot enquiries and investor diligence.",
    state: "PROTOTYPE" as EvidenceState,
    provenance:
      "Contact route stated by the organisation. Not verified by anything in this repository, and published as the organisation's own record rather than as a checked fact.",
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
    role: "The product's front door — the operator captures the institution's working week as it happens.",
    href: "/",
    state: "PROTOTYPE",
    holds: "What the operator would enter here. The capture interface is built; no institution has entered anything.",
    custody: "The institution",
    provenance:
      "Field entry runs on the operator's own device and the interface is built and openable. No institution has entered anything, so this node describes a stage rather than holding a record set.",
  },
  {
    ord: "02",
    key: "register",
    name: "Register",
    role: "Every material claim carries an id, a timestamp, a source and an evidence state.",
    href: "/register",
    state: "PROTOTYPE",
    holds: "The row grammar: identifier, timestamp, source, evidence state, provenance, and the route it can be inspected on. No institutional rows are published.",
    custody: "The local record",
    provenance:
      "The row grammar is implemented and enforced. Every institutional record set is intentionally empty: no row is published until its evidence is recorded. The console's own invented records are labelled DEMONSTRATION and are deliberately not in this set.",
  },
  {
    ord: "03",
    key: "intelligence",
    name: "Intelligence",
    role: "Patterns and derived signals, each traceable to the records it came from.",
    href: "/intelligence",
    state: "PROTOTYPE",
    holds: "Derived readings, each bound to the records it came from and the method that derived it. None is published.",
    custody: "The local record",
    provenance:
      "Three derivations are specified and two are implemented locally against entered data. None has been run against a real institution's records, so no reading here describes any person or any outcome.",
  },
  {
    ord: "04",
    key: "control",
    name: "Control",
    role: "Knowledge becomes action — the decision, and the work it turns into.",
    href: "/control",
    state: "PROTOTYPE",
    holds: "Decisions, the rule each was taken under, the records in front of it, and the execution that followed. The schema is defined; the archive is empty.",
    custody: "The institution",
    provenance:
      "The decision schema and its eligibility rules are defined in code. No institutional decision archive exists, so the record set starts empty.",
  },
  {
    ord: "05",
    key: "evidence",
    name: "Evidence",
    role: "The claim discipline itself — what each state permits, what it forbids, and what is not established.",
    href: "/evidence",
    state: "PROTOTYPE",
    holds: "The evidence state of every published claim, the rules each state obeys, and the questions not yet answered.",
    custody: "The institution",
    provenance:
      "This is the route being read. Its content is claims about this product's own state, which anyone can check by opening it — and that is deliberately the whole of its claim. The previous version of this field described itself as 'the only part of this system that is real in the strict sense' while its own state read PROTOTYPE: a self-upgrade smuggled into a provenance field, which is the one thing this contract forbids.",
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
  /**
   * Why this stage is or is not built. Carried on the stage itself rather
   * than composed by whoever draws it.
   *
   * The lattice used to mint this as a template at render time — "Stage 4
   * of the value chain. Custody: The institution." — which produced a
   * register-shaped sentence about a row that had never been in any
   * register. A provenance field generated by the diagram cannot be
   * checked against the thing it describes, and checkability is the one
   * property this system is built on.
   */
  provenance: string;
}

export const VALUE_CHAIN: readonly ChainStage[] = [
  {
    ord: "01",
    name: "Observe",
    what: "The institution's working week is captured as it happens, by the people present.",
    owner: "The institution",
    node: "field",
    provenance:
      "Specified and implemented in the product's field-entry screens: capture runs on the operator's own device, and an institution can enter its week. No institution has entered anything, so the stage is described rather than exercised.",
  },
  {
    ord: "02",
    name: "Record",
    what: "Each observation becomes a row: id, timestamp, source, state.",
    owner: "The institution",
    node: "register",
    provenance:
      "The row grammar is implemented and enforced in code. No institutional row is published on this site, so the stage is designed and the records it would hold are absent.",
  },
  {
    ord: "03",
    name: "Structure",
    what: "Rows become registers that can be queried, not only read.",
    owner: "The local record",
    node: "register",
    provenance:
      "Specified, and implemented against locally entered data. It needs records entered by an institution before it can structure anything, and none has been.",
  },
  {
    ord: "04",
    name: "Interpret",
    what: "Repeated records become patterns, each bound to its sources.",
    owner: "The local record",
    node: "intelligence",
    provenance:
      "Specified, and implemented in two of three forms against locally entered data. Never run against a real institution's records, so it has produced no reading about anyone.",
  },
  {
    ord: "05",
    name: "Decide",
    what: "A decision is taken against the derived intelligence, under an explicit rule.",
    owner: "The institution",
    node: "control",
    provenance:
      "The decision schema and its eligibility rules are defined in code. No decision has been taken through it, and no institutional decision archive exists.",
  },
  {
    ord: "06",
    name: "Execute",
    /* This described physical work in the field — the change itself, in
       the place the decision was about. It was the most commercially
       attractive sentence in the chain and the least implemented: nothing
       in this repository performs field work, and the console has no
       execution module at all. For a company selling software it was also
       a category error, describing a delivery operation rather than a
       capability in the product.

       What software actually does at this stage is turn a decision into
       the work the institution then carries out — the assignments, the
       exports, the messages it sends. The institution still does the
       physical part. The product is what makes the decision executable
       and the execution recordable. */
    what: "The decision becomes the institution's work: the assignments, exports and messages it carries out, recorded against the rule the decision was taken under.",
    owner: "The institution",
    node: "control",
    provenance:
      "Specified, not implemented. This is where the product would turn a decision into an institution's work, and nothing in this repository does it yet.",
  },
  {
    ord: "07",
    name: "Measure",
    what: "Execution is measured against the decision, and the measurement returns as records.",
    owner: "The local record",
    node: "evidence",
    provenance:
      "Specified, not implemented. Measurement against a decision requires a decision and a term of execution behind it; neither exists, so no measure is published.",
  },
] as const;

export const CHAIN_RETURN =
  "Measure feeds Observe — every product on this list closes the same loop.";
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
    name: "Observation Record",
    unit: "period",
    what: "One observation of a party's state at a stated interval, with the register it was taken in and the interval it belongs to.",
    href: "/register",
    state: "PROTOTYPE",
    provenance:
      "The record grammar and the interval key are defined. No observational register is published, because no institution has taken one: a device-local one is a reading about that device, not about a population.",
  },
  {
    ord: "05",
    name: "Derived Measure Record",
    unit: "measurement",
    what: "One measure taken against a stated criterion, the criterion itself, the derivation from it, and the artefact it was taken from.",
    href: "/intelligence",
    state: "PROTOTYPE",
    provenance:
      "The criterion-and-derivation grammar is defined and one derivation is implemented locally. No derived measure is published, because none has been measured against anything.",
  },
  {
    ord: "06",
    name: "Reconciliation Record",
    unit: "reconciliation",
    what: "Two independently sourced statements of one period, joined, with every unmatched entry recorded in both directions.",
    href: "/intelligence",
    state: "PROTOTYPE",
    provenance:
      "The join and its unmatched-entry report are specified. No reconciliation is published, because no second statement of any period exists to reconcile against the first.",
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
    name: "Criterion attribution",
    reading:
      "Which criterion a record failed, grouped by the criterion rather than by the subject — not a score, but the shape of what has not been met.",
    method:
      "Every lost unit is attributed to the criterion it belongs to, then aggregated across the records in one population.",
    /* Empty, and that is a correction rather than a gap. These rows used
       to cite source ids — ASSESSMENT-01, MARK-KEY-01, ATTENDANCE-01,
       FEE-01 — that exist nowhere in this repository, and were rendered on
       /intelligence as citation chips. RULE-05 makes an unsourced VERIFIED
       row a bug; this is the same failure wearing the other hat, a
       PROTOTYPE row asserting evidence that was never recorded. A row with
       no sources has to say so. */
    sources: [],
    state: "PROTOTYPE",
    provenance:
      "Specified and implemented locally against entered data. It has never run against a population the reader did not enter, so its output demonstrates a method rather than a finding about anyone.",
  },
  {
    id: "SIG-02",
    name: "Baseline departure",
    reading:
      "Records whose values depart from their own established baseline rather than from a population average — self-referenced, so they require a history before they mean anything.",
    method:
      "Derived by comparing each period against that subject's own prior periods over a stated window, then ranking by departure.",
    sources: [],
    state: "PROTOTYPE",
    provenance:
      "Specified and implemented locally against entered data. It needs a multi-period register before it can say anything, and none has been recorded.",
  },
  {
    id: "SIG-03",
    name: "Unmatched-record drift",
    reading:
      "Entries one statement carries that the register has no record of, and records the register holds that no statement carries — reported in both directions, so neither side can hide in the gap.",
    method:
      "Derived by joining two independently sourced statements of the same period on the fields both carry, then reporting every unmatched entry in both directions.",
    sources: [],
    state: "PLANNED",
    provenance:
      "Specified only. Not implemented, and no two-source join has been performed, so no drift count is published.",
  },
] as const;

/* ---------------------------------------------------------------- */
/* THE CURRENT CONSOLE — the first field implementation             */
/* ---------------------------------------------------------------- */

export const CONSOLE = {
  /* Named for what it is and sold as, which is the correction that matters
     most on this site.

     It was called "The built surface" and its sector was given as "Field
     operations", with a comment explaining that naming a real sector
     "makes the reader infer the product is that sector's system". That
     inference was correct, and it was the point: the product IS a school
     operations system. Hiding the sector did not protect the architecture
     from being read as a consultancy — it guaranteed it, by leaving the
     one working piece of software in the repository with no name, no
     buyer and no use case while the copy went on to insist it was "an
     example · not the product".

     So it is named. Its module list lives in lib/console.ts, which this
     file never imports (see CONSOLE_VOCABULARY_SCOPED). What the
     architecture needs to say about it is five things: what it is, that it
     runs, that its data is invented, what it costs, and that nobody has
     bought it. */
  name: "School Console",
  href: "/console",
  /** The product's category, in the words a buyer would use. */
  kind: "Management system",
  oneLine:
    "The operating software a school runs its week on — the roll, the money, the marks, the timetable and the parents — running entirely on the school's own device.",
  state: "PROTOTYPE" as EvidenceState,
  /**
   * The data state, declared separately from the product state on purpose.
   *
   * The console builds itself: on first load with empty stores it writes
   * ten named Kenyan schools, roughly 7,650 enrolments, a term of
   * assessment scores and fee records (lib/proto-school.ts). That data is
   * good enough to drive every module and entirely invented, which is
   * what DEMONSTRATION exists to say.
   *
   * The previous site published "no institutional record has been
   * entered" on /register while the console held ten of them. Both
   * sentences were on the same website. This field is what resolves it,
   * and `MEASURES` renders the module count beside it.
   */
  dataState: "DEMONSTRATION" as EvidenceState,
  dataNote:
    "The console fills itself with invented schools, learners and records on first load, so every module can be opened. None of it is a real institution and none of it describes a real person.",
  localFirst:
    "Records written on a device like this stay on the device that wrote them until the school exports them. Nothing is transmitted.",
  /** The commercial shape: what it costs and who decides. */
  commercial:
    "Sold per school, per term, to the school itself. The buyer is the head teacher or the proprietor rather than a ministry, because the record never leaves the device.",
  provenance:
    "Built and openable at /console. No school runs it: there is no deployment, no customer and no outcome record. The data inside it is invented and is labelled DEMONSTRATION wherever it is described.",
} as const;

/* ---------------------------------------------------------------- */
/* THE PRODUCTS — what the company sells                             */
/* ---------------------------------------------------------------- */

/**
 * A product is one thing APT-LABS sells, with a buyer and a price shape.
 *
 * The previous `Build` type was "one instantiation of the same chain over
 * one domain", and its six rows were Hospital Management, Procurement,
 * Agriculture, Language and Commerce. Four of those five are sectors the
 * company has no relationship with — not markets being entered, just
 * nouns. Rendered as a six-row grid headed "One grammar, six domains",
 * with the one real product renamed to "The built surface" and explicitly
 * labelled "an example · not the product", the whole thing read as a
 * platform with five verticals in market. That reading is false, and it
 * is the most expensive false thing on the site: it invites diligence on
 * four pipeline items that do not exist.
 *
 * What replaced it is a product catalogue with a `kind` per row, because
 * a software company sells three different things and an investor prices
 * them differently:
 *
 *   management-system  operating software an institution runs. Recurring,
 *                      per institution. The School Console is one.
 *   mvp                a commissioned build against one named problem.
 *                      Scoped, priced per build, delivered once.
 *   studio             a place where a build happens in the open, with its
 *                      register published as it goes.
 *
 * `href` is present only where a product resolves to a real surface. A
 * product without one is never rendered as a link: a node that looks like
 * a link and resolves to nothing is the one failure this grammar exists
 * to prevent.
 */
export interface Product {
  name: string;
  /** Which of the three commercial shapes this is. */
  kind: "management-system" | "mvp" | "studio";
  /** One line naming the buyer — the sentence that was missing. */
  buyer: string;
  /** What one row here is: a module, a commission, a build. */
  unit: string;
  /**
   * The plane node this product exercises most.
   *
   * A product is not a sixth node and does not belong in the menu: it is
   * an instance of the chain, so it hangs off the node carrying its
   * heaviest stage. The lattice uses this to say which part of the system
   * a product exercises.
   */
  node: PlaneNode["key"];
  /** reality → evidence-bound record → structure → decision */
  chain: string;
  state: EvidenceState;
  /** Present only when the product resolves to a real surface. */
  href?: string;
  /** Why this product's state is what it is. */
  provenance: string;
}

export const PRODUCTS: readonly Product[] = [
  {
    /* The one product with a surface, and therefore the only one whose
       name, sector and buyer appear anywhere on this site. It leads the
       catalogue because it is the only row that resolves — not because it
       is the most important thing this company will ever sell. */
    name: "School Console",
    kind: "management-system",
    buyer: "A school. Head teacher or proprietor.",
    unit: "module",
    node: "field",
    chain: "the week → records → patterns → decisions",
    state: "PROTOTYPE",
    href: "/console",
    provenance:
      "Built and openable in this repository, nine modules. No school runs it and none has bought it: there is no deployment, no customer and no outcome record. Its data is invented and labelled DEMONSTRATION.",
  },
  {
    /* The MVP track, stated as a track rather than as a pipeline of
       invented verticals. "Hospital Management" and "Commerce" were nouns
       for sectors with no relationship to this company; this row is the
       honest form — the service exists, no commission has been taken, and
       a service with no customer has nothing to quote. */
    name: "Commissioned MVP",
    kind: "mvp",
    buyer: "A small firm or institution with one named problem.",
    unit: "commission",
    node: "intelligence",
    chain: "their records → our build → a thing they can use",
    state: "PLANNED",
    provenance:
      "The track is designed and priced per build. No commission has been taken, no scope agreed and no figure published for any of it: a service with no customer has nothing to quote.",
  },
  {
    /* The studio track. This replaces the single row that was called
       "Language", whose chain string — speech → governed dataset →
       linguistic structure → model → service — described an AI product
       shape while its own provenance admitted there was no dataset and
       no model. */
    name: "Build Studio",
    kind: "studio",
    buyer: "Anyone who wants to watch a build and read its register.",
    unit: "build",
    node: "evidence",
    chain: "brief → register published → build → what it actually did",
    state: "PLANNED",
    provenance:
      "Designed as a public surface where a build is worked on with its register visible throughout. No studio is published and no build has been run in one.",
  },
] as const;

/** Back-compat alias. The lattice and both product grids read this name. */
export const BUILDS = PRODUCTS;
export type Build = Product;

/** The products that resolve to a surface. The rest are the tracks. */
export const LIVE_BUILDS: readonly Product[] = PRODUCTS.filter((p) => p.href);
export const PLANNED_BUILDS: readonly Product[] = PRODUCTS.filter((p) => !p.href);

/* ---------------------------------------------------------------- */
/* THE STACK — the layers above the record                           */
/* ---------------------------------------------------------------- */

/**
 * Five layers on one axis: how far a community's control over its own
 * record has been extended.
 *
 * This is the company's ontology, and its absence was the largest single
 * failure of the previous version of this site. That site described a
 * record grammar and one product built on it, so a reader concluded —
 * reasonably, from the only evidence on offer — that APT-LABS was a
 * school-software vendor with an unusual auditing habit. The company is
 * not that. It builds one stack, and the layers are ordered by
 * dependency rather than by ambition, because each layer runs on the
 * record the layer below it holds:
 *
 *   01 Record          what happened, entered where it happened
 *   02 Identity        who was there, and what they did — The Roll
 *   03 Build           the work done in the open — the Studio
 *   04 Infrastructure  power, water and connection — the Fab
 *   05 Allocation      what a community funds, by rules it can read
 *
 * The School Console is the first implementation of the first layer, and
 * the only layer with a surface. Presenting the console as the whole
 * company is how the site undersold itself; presenting the stack without
 * the console would be how it oversold — so the two are always shown
 * together, and each layer carries its own evidence state in the same
 * grammar as every other register here.
 *
 * Every field is a claim with a state:
 *
 *   holds       what lives in the layer
 *   built       what actually exists today, exactly
 *   settles     the evidence that would move the layer up the scale
 *   provenance  where it stands, and why
 *
 * A layer with nothing built carries no figure and no date anywhere:
 * `settles` names the evidence, never a schedule, because a date on an
 * unbuilt layer is a target wearing a deadline's clothes. The dates live
 * in TARGETS, at TARGET, where they can be read as intentions.
 */
export interface StackLayer {
  ord: string;
  key: "record" | "identity" | "build" | "infrastructure" | "allocation";
  name: string;
  /** The instrument's own name, where it has one. Empty where it does not. */
  alias: string;
  /** One clause: what the layer does for the layer below it. */
  role: string;
  holds: string;
  state: EvidenceState;
  built: string;
  settles: string;
  provenance: string;
}

export const STACK: readonly StackLayer[] = [
  {
    /* The floor, and the only layer with a surface. Its provenance is the
       strictest on the site because it is the one a reader can check:
       open the product and the claim is in front of you. */
    ord: "01",
    key: "record",
    name: "Record",
    alias: "",
    role: "What actually happened, entered where it happened, and held there.",
    holds:
      "Events, rows, seals, and the evidence state of every claim the institution makes from them.",
    state: "PROTOTYPE",
    built:
      "The register grammar is implemented and enforced, and the first product built on it is openable from this site now. No institution has entered a record.",
    settles: "One institution running the built product on its own records.",
    provenance:
      "Built and openable. Not deployed, not sold: there is no customer, no outcome record, and the data inside the product is invented and labelled DEMONSTRATION.",
  },
  {
    /* The Roll. Held at PLANNED for one reason, and the reason is the
       whole discipline of this file: parts of it exist as code in this
       repository, and nothing about it is in use. A register the site
       cannot open is a design, and a design is not a capability. */
    ord: "02",
    key: "identity",
    name: "Identity",
    alias: "The Roll",
    role: "Who was here, and what they have done — weight minted by work, never bought.",
    holds:
      "A local register of people, each row sealed by hash, and contribution weight earned through recorded work that never transfers and is never for sale.",
    state: "PLANNED",
    built:
      "Designed, with parts written: the register of people and its sealing are implemented in this repository and have no surface. No contribution record is in use and no selection has been run.",
    settles:
      "A first named group sealed in person, with contributions entered by the people who did the work.",
    provenance:
      "Held at PLANNED. The sealing is not the claim, being used is: until a group is on the roll with records behind them, this layer is a design.",
  },
  {
    /* The studio track, named as an instrument. It is the layer that
       makes the rest legible: a build performed with its register open. */
    ord: "03",
    key: "build",
    name: "Build",
    alias: "The Studio",
    role: "The work happening in the open, with its register published while it happens.",
    holds:
      "Builds: the brief, the decisions taken, the records they produced, and what each build actually did.",
    state: "PLANNED",
    built:
      "Designed as a track in the catalogue: builds worked on with the register public from brief to result. No build has been run in one.",
    settles: "One build carried from brief to result with its register public throughout.",
    provenance:
      "Held at PLANNED. A studio that has not published a build is a room — designed, and not yet a claim.",
  },
  {
    /* The kinetic layer. It is the one most likely to be claimed early
       and evidenced late, which is exactly why it carries no figure. */
    ord: "04",
    key: "infrastructure",
    name: "Infrastructure",
    alias: "The Fab",
    role: "Power, water and connection at the node — the layer software alone cannot reach.",
    holds:
      "Deployments and their meters: what was built, what it produced, what it consumed and what it cost.",
    state: "PLANNED",
    built: "Designed, not built. There is no site, no deployment and no meter record.",
    settles:
      "One site operating, with its output published as a register rather than as a press note.",
    provenance:
      "Held at PLANNED, and it carries no figure here for that reason: this is the layer every infrastructure company in the world describes in the future tense.",
  },
  {
    /* Allocation, by rule. The mechanism is the part that must not be
       rushed: an allocation rule that has not run is a hypothesis, and
       this site does not publish hypotheses as machinery. */
    ord: "05",
    key: "allocation",
    name: "Allocation",
    alias: "BenBen",
    role: "Where a community decides what to fund, under rules it can read before it decides.",
    holds:
      "Proposals, the thresholds that govern them, the decisions taken, and the work that followed each decision.",
    state: "PLANNED",
    built:
      "Designed as a board where proposals are posted, needs are stated, and decisions are taken under published rules. No pool, no round and no allocation has been run through it.",
    settles: "One funding round run end to end, with its rules, decisions and results published.",
    provenance:
      "Held at PLANNED. Nothing about this layer is claimed here — the contribution rules below are the design it will have to satisfy, not a description of it running.",
  },
] as const;

/** The layers with a surface. The figure the stack section leads with. */
export const BUILT_LAYERS: readonly StackLayer[] = STACK.filter(
  (layer) => layer.state === "PROTOTYPE"
);

/* ---------------------------------------------------------------- */
/* CONTRIBUTION — the four rules the identity layer must satisfy     */
/* ---------------------------------------------------------------- */

/**
 * The design rules for weight on The Roll, stated as constraints rather
 * than as features.
 *
 * Each row is written as `rule / means / never`, because a governance
 * mechanism is only as trustworthy as the thing it forbids. The fourth
 * row is the load-bearing one: every system of this shape publishes a
 * concentration threshold and a corrective action, and not one this
 * company has seen can be checked by a reader. The threshold is
 * deliberately NOT printed here — the rule that would give it meaning is
 * not running, so a number would be a slogan with a decimal point. The
 * register's own contract (PLANNED carries no figures) is what makes
 * that a principle rather than an omission.
 */
export const CONTRIBUTION: readonly {
  id: string;
  rule: string;
  means: string;
  never: string;
}[] = [
  {
    id: "C-01",
    rule: "Earned, not bought",
    means:
      "Weight is minted by recorded work — physical, digital or institutional — and every unit of it cites the record it came from.",
    never:
      "A vote that can be purchased. A purchasable vote is the mechanism this exists to replace.",
  },
  {
    id: "C-02",
    rule: "Bound, not traded",
    means:
      "A contribution mark is held by the person who did the work, seals to that person, and does not transfer, split or appreciate.",
    never:
      "A position. Anything that can be sold can be accumulated, and anything accumulated becomes a class.",
  },
  {
    id: "C-03",
    rule: "Drawn, not elected",
    means:
      "Where a decision needs a body, the body is drawn from contributors for that one decision and dissolves when it is taken.",
    never:
      "A standing committee. Ephemeral juries are the defence against a permanent governance class.",
  },
  {
    id: "C-04",
    rule: "Captured, then corrected",
    means:
      "Concentration is measured and published, and past a stated line a corrective rule fires — weights flatten until balance returns.",
    never:
      "A published threshold with nothing behind it. This site does not print one, because the rule that would give it meaning is not running yet.",
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

/**
 * The console's module count — typed here, CHECKED in
 * scripts/check-lexicon.mjs.
 *
 * Declared as a literal because MEASURES is a `const` array evaluated at
 * module load, and it cannot import lib/console.ts without inverting the
 * dependency the lexicon checker exists to keep one-way: the console must
 * never read the architecture's vocabulary, and this file must never read
 * the console's.
 *
 * So the number is typed here and verified there. The checker reads this
 * declaration, reads `CONSOLE_MODULES.length` out of lib/console.ts, and
 * fails the build if they disagree. That makes this the one figure on the
 * site that is a claim with a verification path — which is what RULE-05
 * asks for, and more than the previous version had, where the same count
 * was typed into six places with nothing keeping any of them in step.
 */
export const MEASURED_MODULE_COUNT = "9";

export const MEASURES: readonly Measure[] = [
  {
    /* The stack figure leads the band, and it is the one number that
       states what the company is rather than what it has sold: how much
       of its own architecture exists. Counted from STACK, so it is true
       by construction — add a layer with a surface and the figure
       follows. */
    figure: `${BUILT_LAYERS.length} / ${STACK.length}`,
    key: "layers of the stack built",
    note: "The record layer is built and openable; identity, builds, infrastructure and allocation are designed, not built.",
    state: "PROTOTYPE",
  },
  {
    /* Counted, not typed. Deriving these from the arrays above makes them
       true by construction: add a product row and the figure follows.

       This was `1 / builds with a surface`, which is honest but was a
       count of one set in the largest type on the page, beside a count of
       six. A reader takes two small numbers from that and infers a
       portfolio. It is still the first figure and still the true one; it
       is simply labelled as what it counts, which is now a product
       rather than a build. */
    figure: String(LIVE_BUILDS.length),
    key: "product you can open now",
    note: "Built and openable in this repository. No customer runs one.",
    state: "PROTOTYPE",
  },
  {
    figure: MEASURED_MODULE_COUNT,
    key: "modules in it",
    note: "Counted from the console's own module list and verified in CI, not typed by hand. Each one opens and works on invented data.",
    state: "DEMONSTRATION",
  },
  {
    figure: String(PRODUCTS.length),
    key: "products and tracks",
    note: "One management system with a surface, and two tracks — commissioned MVPs and the build studio — that are designed rather than built.",
    state: "PROTOTYPE",
  },
  {
    /* The figure a reader asks for first, and the one this site had no
       word for.

       It was previously rendered as `— / verified deployments / UNKNOWN`,
       which is a true statement about a number nobody was asking about.
       Customers is the number that decides whether this is a company, and
       it is genuinely zero — but this zero is a MEASUREMENT, not an
       absence: we know there are no customers because none has ever been
       sold, which is a different thing from not knowing. So it is a real
       zero with a real state, not a dash.

       This is the one figure on the site where a zero is the honest
       answer, and the distinction is the point: the previous version could
       not say "zero customers" without it reading as a missing number,
       because it had no state for "we measured this and it is zero". */
    figure: "0",
    key: "customers",
    note: "Measured, not assumed: no school has bought or run the product, and no commission has been taken. A zero, not a missing figure.",
    state: "PROTOTYPE",
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
    doesNotEqual: "Deployed, sold, or in use by a customer. No route implies anyone is running it.",
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
    /* The sixth rule, for the sixth state. Its `doesNotEqual` is the whole
       reason DEMONSTRATION was added rather than reusing PROTOTYPE:
       "it works" and "the data is real" are two claims, and the previous
       vocabulary had exactly one word for both. */
    id: "RULE-06",
    subject: "DEMONSTRATION",
    equals: "The surface runs, and the data in it is invented.",
    doesNotEqual: "A record of anything that happened. Demonstration data never counts as a customer, an outcome, or a real institution.",
  },
  {
    id: "RULE-05",
    subject: "VERIFIED",
    equals: "An identifiable evidence path exists.",
    doesNotEqual: "Asserted. A verified row without a source is a bug.",
  },
] as const;

/* ---------------------------------------------------------------- */
/* WHAT IS NOT ESTABLISHED — the diligence register                 */
/* ---------------------------------------------------------------- */

/**
 * The things a reader asks in the first meeting that are not established
 * here.
 *
 * Publishing them is still the point: an unknown that is named is an open
 * question, and one that is omitted reads as a zero and gets quoted as
 * one. What changed is the register's SUBJECT, and the change is the
 * correction.
 *
 * This was headed "Published unknowns" and read as a research programme's
 * account of its own gaps — the register a public-interest lab keeps so
 * nobody can accuse it of overclaiming. Its rows were "population sizes",
 * "performance of any kind" and "partnerships and procurement
 * relationships": a list of things a study has not measured.
 *
 * APT-LABS is not a study. It is a company that has not yet sold anything,
 * and the honest register of that is short and commercial — no customer, no
 * revenue, no contract, no team, no track record. Those are not research
 * unknowns to be published beneath a heading about evidence; they are the
 * first five questions, and naming them in the reader's own vocabulary is
 * the difference between a company with no customers yet and an
 * organisation whose existence is in question.
 *
 * UNK-05 previously carried "Organisation registration and team" — a
 * missing company, filed beside an unmeasured cohort. That is precisely the
 * category error this register exists to prevent, and it committed it. The
 * contact route now lives on COMPANY, and the row that remains is the
 * registration number itself, which is a filing fact rather than a
 * research finding.
 *
 * `since` is when the question became a question, not a measurement date.
 */
export const UNKNOWN_FACTS: readonly {
  id: string;
  what: string;
  why: string;
  since: string;
}[] = [
  {
    id: "UNK-01",
    what: "Customers",
    why: "None. No school has bought or run the product, and no MVP has been commissioned. This is a measured zero, published as a zero rather than as a missing figure.",
    since: "2026-09",
  },
  {
    id: "UNK-02",
    what: "Revenue and pricing",
    why: "No figure is published because none exists. The commercial shape is stated — per school, per term — but no price has been set and no invoice has been issued.",
    since: "2026-09",
  },
  {
    id: "UNK-03",
    what: "Outcome or performance evidence",
    why: "No customer has used the product long enough to produce one. A measure derived from a real institution's records cannot exist until a real institution is running it.",
    since: "2026-09",
  },
  {
    id: "UNK-04",
    what: "Contracts, partnerships and procurement",
    why: "No contract, tender record or partner agreement is documented in this repository.",
    since: "2026-09",
  },
  {
    id: "UNK-05",
    what: "Company registration number",
    why: "Not documented here. Names, contact and geography are published on this site as the organisation's own record; a registration number is a filing fact and is supplied on request rather than asserted without one.",
    since: "2026-09",
  },
] as const;

/* ---------------------------------------------------------------- */
/* TARGETS — what the company is trying to make true                */
/* ---------------------------------------------------------------- */

/**
 * Named intended outcomes, held at TARGET.
 *
 * The previous vocabulary defined TARGET, wrote a STATE_RULES clause for
 * it, gave it a slot in the temperature scale and asserted its warmth in
 * the contrast checker — and then used it zero times. Not on one row, on
 * any row, anywhere on the site.
 *
 * That is not a small omission. A company that cannot say what it is
 * trying to make true has nothing for a reader to fund toward: the raise
 * has no destination, and a site whose only figures are absences describes
 * a project rather than a plan. TARGET is what a pitch is for, and it is
 * the one state that may carry a number and a date without that number
 * being a measurement.
 *
 * Every row is an intention with a date and a stated measure of success,
 * and none of them is a result. That distinction is the entire reason
 * TARGET exists, and RULE-03 forbids rendering one as the other.
 */
export const TARGETS: readonly {
  id: string;
  what: string;
  /** How we would know it was met. Named now, so it cannot move later. */
  measure: string;
  by: string;
}[] = [
  {
    id: "TGT-01",
    what: "One school running the School Console for a full term, on its own records.",
    measure:
      "A named school, a start date, and that school confirming it used the product through one complete term.",
    by: "2027-Q1",
  },
  {
    id: "TGT-02",
    what: "First paid MVP commission, scoped against one named problem.",
    measure: "An agreed scope, a signed engagement and an invoice raised — not a conversation.",
    by: "2027-Q2",
  },
  {
    /* The stack's own target, and it is placed before the commercial
       count on purpose: three paying schools is a business milestone,
       and a layer above the record made real is the thing the business
       exists to reach. Both are TARGET — intentions, with a named
       measure and a date, never results. */
    id: "TGT-03",
    what: "The first layer above the record made real and published.",
    measure:
      "One named group on the roll with contributions entered by the people who did the work, or one build carried from brief to result with its register public — evidenced by the records themselves rather than by an announcement.",
    by: "2027-Q3",
  },
  {
    id: "TGT-04",
    what: "Three paying schools, which is the number at which this stops being one pilot.",
    measure:
      "Three distinct paying institutions, counted from contracts rather than from installations.",
    by: "2027-Q4",
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
 *
 * Takes records rather than bare states so the caller does not have to
 * re-derive the mapping at every call site — which is what happened when
 * this loop was written out inline in two other files, giving the site
 * three copies of one tally and a docstring claiming there was one.
 */
export function tally(records: readonly { state: EvidenceState }[]): {
  state: EvidenceState;
  count: number;
}[] {
  return EVIDENCE_STATES.map((state) => ({
    state,
    count: records.filter((r) => r.state === state).length,
  }));
}