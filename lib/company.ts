import { CONSOLE_MODULES, CONSOLE_TOOLS } from "./console";

// lib/company.ts — RUNTIME SOURCE OF TRUTH for public company identity.
//
// Every public route reads its company-level copy from here. It is the only
// place a claim about APT-LABS may be minted, and a claim may only be minted
// here if docs/EVIDENCE-PACK.md already carries its evidence.
//
// docs/EVIDENCE-PACK.md is the *human* evidence record.
// scripts/audit-company.js cross-checks the two and fails CI on disagreement:
//       runtime truth ←— audit —→ evidence record
//
// Unknown ≠ zero. Planned ≠ completed. Prototype ≠ deployed.
// Demonstration data ≠ impact data. Intention ≠ evidence.

/** The states every published figure or claim must carry. */
export type EvidenceState =
  | "VERIFIED"
  | "DEMONSTRATION"
  | "PROTOTYPE"
  | "TARGET"
  | "PLANNED"
  | "UNKNOWN"
  | "DECLARED";

export const EVIDENCE_STATES: EvidenceState[] = [
  "VERIFIED",
  "DEMONSTRATION",
  "PROTOTYPE",
  "TARGET",
  "PLANNED",
  "UNKNOWN",
  "DECLARED",
];

/** Legal states for the asset register. The order is the handoff order. */
export const ASSET_STATES = [
  "PLANNED",
  "PROTOTYPE",
  "FABRICATED",
  "INSTALLED",
  "TESTED",
  "ACCEPTED",
  "VERIFIED",
  "UNVERIFIED",
] as const;

export type AssetState = (typeof ASSET_STATES)[number];

/** Wording that is allowed to describe APT-LABS in public. */
export const VOCABULARY_ALLOWLIST: string[] = [
  "local-first control plane",
  "opt-in civic infrastructure",
  "auditable allocation",
  "explicit eligibility rules",
  "bounded influence",
  "verifiable evidence",
  "local execution surfaces",
  "reproducible records",
  "contribution before claim",
  "records that survive handover",
];

/** The central problem — one framing, never a generic "schools lack tech". */
export const PROBLEM =
  "Institutions make collective decisions, move shared resources and build durable assets — yet the records that show who was eligible, which rule applied, where the resources went, and what evidence supports the outcome are usually missing, locked away, or unverifiable.";

/** The answer to the problem, in one sentence. */
export const RESPONSE =
  "APT-LABS runs a local-first protocol node that closes the loop — person, contribution, proposal, allocation, execution, and evidence — so an independent observer can reconstruct what happened without asking anyone involved.";

/** The scale loop. Every submission walks it in this order. */
export const OPERATING_LOOP: string[] = [
  "contribution recorded",
  "proposal under explicit rule",
  "allocation by formula",
  "physical execution",
  "evidence appended",
  "the record survives",
];

export interface Face {
  key: "fab" | "studio" | "roll";
  name: string;
  oneLine: string;
  description: string;
  status: EvidenceState;
  route: string;
  /** Where the working software lives, when it differs from `route`. */
  appRoute?: string;
  evidenceRefs: string[];
}

export const COMPANY = {
  name: "APT-LABS",
  /** One sentence. Used as the site description and the first line of any proposal. */
  oneSentence:
    "APT-LABS builds a local-first protocol node — a control plane that connects contribution, collective decisions, resource allocation, physical execution and verifiable evidence, so that what a community decides, builds and learns is inspectable by anyone who comes after.",
  /** Must match the first paragraph of docs/EVIDENCE-PACK.md §1, word for word. */
  description:
    "APT-LABS is a Kenyan technology company building local-first civic infrastructure. It operates a protocol node that connects contributions, collective decisions, allocation, physical execution and verifiable evidence across its execution surfaces.",
  problem: PROBLEM,
  response: RESPONSE,
  externalVocabulary: VOCABULARY_ALLOWLIST,
  geography: { text: "Kirinyaga, Kenya", state: "DECLARED" as EvidenceState },
  /** UNKNOWN until documented. Never invent a registration status. */
  legalStatus: { text: "Not published", state: "UNKNOWN" as EvidenceState },
  contact: {
    email: "aptlabske@gmail.com",
    whatsapp: "+254 704 260 906",
    whatsappUrl: "https://wa.me/254704260906",
  },
  repository: { label: "Source repository", value: "Access on request", state: "UNKNOWN" as EvidenceState },
} as const;

export const FACE_SURFACES = {
  fab: {
    eyebrow: "DOCUMENTED HARDWARE",
    title: "From design note to repairable record.",
    body: "The production chain is defined. No verified fabrication, installation or field-service record is published yet.",
    stages: [
      { label: "01", value: "DESIGN" },
      { label: "02", value: "BOM" },
      { label: "03", value: "SOURCE" },
      { label: "04", value: "MAKE" },
      { label: "05", value: "REPAIR" },
      { label: "06", value: "RECORD" },
    ],
    action: { href: "/evidence", label: "Inspect the evidence boundary" },
  },
  studio: {
    eyebrow: "CREATIVE COMPUTING",
    title: "Compute that stays close to the work.",
    body: "APT Studio is the planned creative-computing face of the system. The Mwea Animation Box is a demonstration node, not a claimed production facility.",
    stages: [
      { label: "Input", value: "NOTES / MEDIA" },
      { label: "Process", value: "FRAME / TIMELINE" },
      { label: "Compute", value: "LOCAL WORKSTATION" },
      { label: "Output", value: "DOCUMENTED ASSET" },
    ],
    action: { href: "/evidence", label: "See what is known" },
  },
  roll: {
    eyebrow: "TRUST LAYER",
    title: "People and assets, separately recorded.",
    body: "The Roll is one sealing discipline with two registers. A hash detects changes to a record; it does not manufacture truth or shared storage.",
    stages: [
      { label: "Register A", value: "PEOPLE" },
      { label: "Register B", value: "ASSETS" },
      { label: "State", value: "EXPLICIT" },
      { label: "Seal", value: "SHA-256" },
    ],
    action: { href: "/roll/assets", label: "Open the Asset Register" },
  },
} as const;

export const ORGANIZATION_RECORD = [
  { label: "Operating geography", value: COMPANY.geography.text, state: COMPANY.geography.state },
  { label: "Legal registration", value: COMPANY.legalStatus.text, state: COMPANY.legalStatus.state },
  { label: "Founder / team record", value: "Not published", state: "UNKNOWN" as EvidenceState },
  { label: "Pilot partner", value: "None documented", state: "UNKNOWN" as EvidenceState },
  { label: "Verified school deployment", value: "None on record", state: "UNKNOWN" as EvidenceState },
] as const;

export const SUSTAINABILITY_RECORD = [
  { label: "Unit economics", value: "Not yet measured", state: "UNKNOWN" as EvidenceState },
  { label: "Recorded local procurement", value: "None on record", state: "UNKNOWN" as EvidenceState },
  { label: "Recurring-cost comparison", value: "Not yet measured", state: "UNKNOWN" as EvidenceState },
] as const;

export const EVIDENCE_SNAPSHOT = [
  { label: "Sealing and rolling hashes", value: "SHA-256 canonical records and master seals", state: "VERIFIED" as EvidenceState },
  { label: "Protocol Node", value: "Local-first control plane, nine views, in-browser demonstration", state: "PROTOTYPE" as EvidenceState },
  { label: "BenBen Builds · School Console", value: `${CONSOLE_MODULES.length} modules and ${CONSOLE_TOOLS.length} tools in a local prototype`, state: "PROTOTYPE" as EvidenceState },
  { label: "APT Fab", value: "Execution surface defined; no fabrication record", state: "PLANNED" as EvidenceState },
  { label: "APT Studio", value: "Execution surface defined; no installation record", state: "PLANNED" as EvidenceState },
  { label: "The Roll", value: "Substrate: people and asset registers, same seal", state: "PROTOTYPE" as EvidenceState },
] as const;

export const FACE_SURFACE_CLASS: Record<Face["key"], string> = {
  fab: "face-surface--fab",
  studio: "face-surface--studio",
  roll: "face-surface--roll",
};

/**
 * One company, one product, three levels. The Protocol Node is the product;
 * APT Fab and APT Studio are execution surfaces; The Roll is the substrate.
 *
 * `status` must equal the row in the status ledger in docs/EVIDENCE-PACK.md §4
 * — audit-company.js compares them literally.
 *
 * There is deliberately no Deploy face. Products are built on the BenBen
 * Builds track (see BENBEN_BUILDS); the company site never presents a
 * product prototype as a company pillar.
 */
export const FACES: Record<Face["key"], Face> = {
  fab: {
    key: "fab",
    name: "APT Fab",
    oneLine: "The node's physical execution surface.",
    description:
      "Where a matched allocation becomes procurement, BOM, fabrication, installation, acceptance test, maintenance and appended evidence. The chain a proposal opens, Fab closes.",
    status: "PLANNED",
    route: "/",
    evidenceRefs: ["EVIDENCE-PACK.md §6"],
  },
  studio: {
    key: "studio",
    name: "APT Studio",
    oneLine: "The node's local compute surface.",
    description:
      "Credential issuance and verification, ZK proofs, local model workloads, node operations, training runs and recovery paths — the node keeping its own house in order, on the hardware it serves.",
    status: "PLANNED",
    route: "/",
    evidenceRefs: ["EVIDENCE-PACK.md §7"],
  },
  roll: {
    key: "roll",
    name: "The Roll",
    oneLine: "The node's substrate — one ledger, two registers.",
    description:
      "The record the node runs on: people, assets, evidence and audit, sealed with the same trust model. A node is a first-class record in this register — its operators, its evidence, its provenance.",
    status: "PROTOTYPE",
    route: "/roll",
    evidenceRefs: ["EVIDENCE-PACK.md §8"],
  },
};

/** The registers beneath The Roll. Presented as sections of /roll. */
export const REGISTERS = [
  {
    name: "People Register",
    route: "/roll",
    summary:
      "Makers, builders, creators and contributors in a local-first register interface. The current record is inspectable, but this is not a shared server-backed directory.",
    status: "PROTOTYPE" as EvidenceState,
  },
  {
    name: "Asset Register",
    route: "/roll",
    summary:
      "What was designed, purchased, fabricated, installed, repaired, trained, tested, accepted and documented — with a state on every line.",
    status: "PROTOTYPE" as EvidenceState,
  },
];

/** BenBen Builds is the track where the node's products ship. */
export const BENBEN_BUILDS = {
  name: "BenBen Builds",
  role: "Product build track",
  isFace: false,
  route: "/",
  summary:
    "Where the protocol node's products are built, on the node's own evidence rules. Its current product is the School Console: a local-first operating console, a local prototype — not a deployment.",
  status: "PROTOTYPE" as EvidenceState,
  products: [
    {
      name: "School Console",
      oneLine: "A local-first operating console for teacher and school work, built on the node's evidence discipline.",
      route: "/console",
      floorRoute: "/benben",
      status: "PROTOTYPE" as EvidenceState,
      boundary: "No verified school deployment",
      evidenceRefs: ["EVIDENCE-PACK.md §5"],
    },
  ],
} as const;

/** The Floor is NOT a company face. It is where capability enters the node. */
export const INTAKE = {
  name: "BenBen / The Floor",
  role: "Intake layer",
  isFace: false,
  route: "/benben",
  summary:
    "Local capability, work, makers and ideas enter here, are reviewed on the device, then move into BenBen Builds products before evidence is recorded in The Roll.",
  status: "PROTOTYPE" as EvidenceState,
};

/** Published metrics. Every one carries a state and a provenance string. */
export interface Metric {
  id: string;
  label: string;
  value: string;
  state: EvidenceState;
  provenance: string;
}

export const METRICS: Metric[] = [
  {
    id: "people-register",
    label: "Public server-backed people register",
    value: "Not published",
    state: "UNKNOWN",
    provenance:
          "The current register is local-first and starts without seeded records. A device-local count is a runtime reading, not a public directory or beneficiary claim.",
  },
];

/** Linkable evidence. Everything the site points at for verification. */
export const EVIDENCE_LINKS = [
  { label: "Core Evidence Pack", href: "/evidence", state: "VERIFIED" as EvidenceState },
  { label: "People Register", href: "/roll", state: "PROTOTYPE" as EvidenceState },
  { label: "Asset Register", href: "/roll/assets", state: "PROTOTYPE" as EvidenceState },
  { label: "Request repository access", href: "/contact", state: "UNKNOWN" as EvidenceState },
];

/** Status ledger rows — compared against docs/EVIDENCE-PACK.md §4. */
export const STATUS_LEDGER = [
  { face: "APT Fab", status: "PLANNED", route: "/", appRoute: "—" },
  { face: "APT Studio", status: "PLANNED", route: "/", appRoute: "—" },
  { face: "The Roll", status: "PROTOTYPE", route: "/roll", appRoute: "/" },
];
