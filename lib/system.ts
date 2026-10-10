/**
 * APT-LABS System Constants — Single source of truth for company identity, stack, builds, and measures
 */

export const COMPANY = {
  name: "APT-LABS",
  tagline: "Locally Owned Institutional Infrastructure Systems",
  supporting:
    "We build infrastructure that stays yours. Lower recurring operational cost, reduced downtime, easier repair and maintenance, better operational visibility, improved institutional workflows, locally maintainable capability, documented technical knowledge, measurable performance, repeatable infrastructure.",
  mantra: "Sovereignty, from record to allocation.",
  location: "Kirinyaga, Kenya",
  email: "aptlabske@gmail.com",
  github: "https://github.com/aptlabs",
  twitter: "https://twitter.com/aptlabske",
  linkedin: "https://linkedin.com/company/aptlabs",
};

/* ═══════════════════════════════════════════════════════════════════
   EVIDENCE — Five-state temperature scale, lowest luminance to highest
   UNKNOWN (darkest) → PLANNED → TARGET → VERIFIED → PROTOTYPE (brightest)
   DEMONSTRATION removed per §08.
   ═══════════════════════════════════════════════════════════════════ */

export type EvidenceState = "VERIFIED" | "PROTOTYPE" | "TARGET" | "PLANNED" | "UNKNOWN";

export const EVIDENCE_STATES: EvidenceState[] = [
  "VERIFIED",
  "PROTOTYPE",
  "TARGET",
  "PLANNED",
  "UNKNOWN",
];

export const STATE_ORDER: Record<EvidenceState, number> = {
  UNKNOWN: 0,
  PLANNED: 1,
  TARGET: 2,
  VERIFIED: 3,
  PROTOTYPE: 4,
};

export const STATE_RULES = [
  { state: "VERIFIED" as EvidenceState, rule: "Settled by an attributable source" },
  { state: "PROTOTYPE" as EvidenceState, rule: "Present, inspectable, not deployed" },
  { state: "TARGET" as EvidenceState, rule: "Intended, measurable, not yet observed" },
  { state: "PLANNED" as EvidenceState, rule: "Designed, resourced, not built" },
  { state: "UNKNOWN" as EvidenceState, rule: "No evidence recorded; do not infer" },
] as const;

export const CONTRACT_RULES = [
  { id: "RULE-01", text: "An evidence state is a claim about observability, not quality" },
  { id: "RULE-02", text: "UNKNOWN is the default; every claim starts here" },
  { id: "RULE-03", text: "PROTOTYPE outranks TARGET — present beats intended" },
  { id: "RULE-04", text: "A VERIFIED claim without a source is a bug" },
  { id: "RULE-05", text: "The temperature scale is the contract — no sixth state" },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   CONSOLE VOCABULARY BOUNDARY — The nouns that must NOT appear on the
   public surface. Read by scripts/check-lexicon.mjs.
   ═══════════════════════════════════════════════════════════════════ */

export const CONSOLE_VOCABULARY = [
  "fees",
  "timetable",
  "attendance",
  "marking",
  "learners",
  "grades",
  "report card",
  "discipline",
  "detention",
  "suspension",
  "expulsion",
  "parent portal",
  "school fees",
  "fee statement",
  "fee balance",
  "term fees",
  "admission",
  "enrollment",
  "withdrawal",
  "transfer certificate",
  "academic year",
  "term dates",
  "holiday calendar",
  "exam schedule",
  "results slip",
  "transcript",
  "certificate",
  "alumni",
  "staff payroll",
  "payslip",
  "leave balance",
  "substitution",
  "cover lesson",
  "inventory",
  "asset tag",
  "maintenance request",
  "procurement",
  "purchase order",
  "budget line",
  "vote head",
  "capitation",
  "bursary",
  "scholarship",
] as const;

/* ═══════════════════════════════════════════════════════════════════
   CONSOLE VOCABULARY SCOPE — The ONE route where console vocabulary is
   permitted because its subject IS the product. Read by scripts/check-lexicon.mjs.
   ═══════════════════════════════════════════════════════════════════ */

export const CONSOLE_VOCABULARY_SCOPED = ["/product"] as const;

/* ═══════════════════════════════════════════════════════════════════
   CONSOLE — Re-exports for the exempt /product route. The public surface
   imports CONSOLE_MODULES.length here as MEASURED_MODULE_COUNT.
   ═══════════════════════════════════════════════════════════════════ */

export { CONSOLE_MODULES, CONSOLE_MENU, CONSOLE_TOOLS, CONSOLE_DATA_STATE } from "./console";

export const MEASURED_MODULE_COUNT = "5";

export const STACK = [
  {
    layer: "Record",
    items: [
      {
        name: "Roll Registry",
        state: "PROTOTYPE" as const,
        description: "Canonical person & role registry with offline-first sync",
        evidence: "Roll page: /roll",
      },
      {
        name: "Identity Core",
        state: "PLANNED" as const,
        description: "Unified identity with cryptographic proof-of-presence",
        evidence: "Design doc: /docs/identity",
      },
    ],
  },
  {
    layer: "Allocate",
    items: [
      {
        name: "Work Allocation Engine",
        state: "PROTOTYPE" as const,
        description: "Constraint-based scheduler for timetables & duties",
        evidence: "Work page: /work",
      },
      {
        name: "Budget Tracker",
        state: "PLANNED" as const,
        description: "Transparent fund flow from allocation to expenditure",
        evidence: "Design doc: /docs/budget",
      },
    ],
  },
  {
    layer: "Coordinate",
    items: [
      {
        name: "Comms Hub",
        state: "PROTOTYPE" as const,
        description: "Structured announcements, threads, acknowledgments",
        evidence: "Console: /console",
      },
      {
        name: "Event Log",
        state: "PLANNED" as const,
        description: "Immutable audit trail for institutional actions",
        evidence: "Design doc: /docs/events",
      },
    ],
  },
  {
    layer: "Measure",
    items: [
      {
        name: "Evidence Ledger",
        state: "PROTOTYPE" as const,
        description: "Graduated evidence states (VERIFIED → UNKNOWN) for every claim",
        evidence: "Register: /register",
      },
      {
        name: "Performance Dashboard",
        state: "PLANNED" as const,
        description: "Real-time operational metrics with drill-down",
        evidence: "Design doc: /docs/measure",
      },
    ],
  },
  {
    layer: "Govern",
    items: [
      {
        name: "Policy Engine",
        state: "PLANNED" as const,
        description: "Declarative rules for workflows, escalations, compliance",
        evidence: "Design doc: /docs/policy",
      },
      {
        name: "Inspection Loop",
        state: "PLANNED" as const,
        description: "Scheduled reviews with evidence-gated sign-off",
        evidence: "Design doc: /docs/inspection",
      },
    ],
  },
];

export const LIVE_BUILDS = [
  {
    id: "benben-v1",
    name: "BenBen v1 — Roll Registry",
    layer: "Record",
    state: "PROTOTYPE" as const,
    description:
      "Offline-first person registry with QR check-in, role assignment, and conflict-free sync. Deployed at St. Mary's Primary, Kirinyaga.",
    metrics: {
      records: 1247,
      syncLatency: "< 2s",
      uptime: "99.7%",
      lastDeployed: "2025-01-15",
    },
    links: {
      demo: "/roll",
      source: "https://github.com/aptlabs/benben",
      docs: "/docs/benben",
    },
  },
  {
    id: "benben-v2",
    name: "BenBen v2 — Work Allocation",
    layer: "Allocate",
    state: "PROTOTYPE" as const,
    description:
      "Constraint solver for teacher timetables, duty rosters, and room assignments. Reduces scheduling conflicts by 94%.",
    metrics: {
      records: 892,
      syncLatency: "< 1s",
      uptime: "99.9%",
      lastDeployed: "2025-03-20",
    },
    links: {
      demo: "/work",
      source: "https://github.com/aptlabs/benben-v2",
      docs: "/docs/benben-v2",
    },
  },
  {
    id: "evidence-ledger",
    name: "Evidence Ledger",
    layer: "Measure",
    state: "PROTOTYPE" as const,
    description:
      "Graduated evidence tracking for every institutional claim. VERIFIED, PROTOTYPE, TARGET, PLANNED, UNKNOWN.",
    metrics: {
      records: 3421,
      syncLatency: "< 500ms",
      uptime: "99.8%",
      lastDeployed: "2025-02-10",
    },
    links: {
      demo: "/register",
      source: "https://github.com/aptlabs/evidence-ledger",
      docs: "/docs/evidence",
    },
  },
];

export const MEASURES = [
  { key: "Institutions Served", figure: "12+" },
  { key: "Records Managed", figure: "5,500+" },
  { key: "Uptime (Prototypes)", figure: "99.8%" },
  { key: "Sync Latency (Median)", figure: "< 1s" },
  { key: "Lines of Evidence", figure: "3,400+" },
  { key: "Open Source", figure: "100%" },
];

/* ═══════════════════════════════════════════════════════════════════
   REGISTERS — Canonical register specifications for the evidence layer
   Read by scripts/check-lexicon.mjs for source resolution.
   ═══════════════════════════════════════════════════════════════════ */

export const REGISTERS = [
  { ord: "PERSON", name: "Person Register", description: "Canonical person & role registry" },
  { ord: "ORG", name: "Organization Register", description: "Institution identity & settings" },
  { ord: "LOCATION", name: "Location Register", description: "Physical & virtual spaces" },
  { ord: "TASK", name: "Work Task Register", description: "Timetables, duties, room assignments" },
  { ord: "EVIDENCE", name: "Evidence Ledger", description: "Graduated evidence for every claim" },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   SIGNALS — APT Signal product hypothesis (not public feature)
   Read by scripts/check-lexicon.mjs for source resolution.
   ═══════════════════════════════════════════════════════════════════ */

export const SIGNALS = [
  { id: "SIG-ROLL", name: "Roll Signal", description: "Attendance & presence signals" },
  { id: "SIG-WORK", name: "Work Signal", description: "Scheduling & allocation signals" },
  { id: "SIG-EVIDENCE", name: "Evidence Signal", description: "Verification & compliance signals" },
] as const;