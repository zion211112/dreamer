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
  "local ownership",
  "offline resilience",
  "repairability",
  "open documentation",
  "local technical capacity",
  "reduced recurring technology cost",
  "community-owned infrastructure",
  "local economic participation",
  "technology independence",
  "reproducible infrastructure",
];

/** The central problem — one framing, never a generic "schools lack tech". */
export const PROBLEM =
  "Institutions increasingly depend on technology they cannot fully own, repair, reproduce or afford to maintain.";

/** The answer to the problem, in one sentence. */
export const RESPONSE =
  "APT-LABS converts locally available technical capacity into institutional systems that can be deployed, operated, repaired and reproduced locally.";

/** The scale loop. Every submission walks it in this order. */
export const OPERATING_LOOP: string[] = [
  "imported / subscription-dependent",
  "APT-LABS architecture",
  "bounded pilot",
  "measured cost / performance / adoption",
  "documented local production",
  "replication kit",
  "institutional scale",
];

export interface Face {
  key: "deploy" | "fab" | "studio" | "roll";
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
    "APT-LABS builds locally owned, offline-capable institutional infrastructure systems — software, hardware, creative-computing capacity, and the documentation layer that lets communities operate, repair, reproduce and improve them locally.",
  /** Must match the first paragraph of docs/EVIDENCE-PACK.md §1, word for word. */
  description:
    "APT-LABS is a Kenyan technology and infrastructure company building locally owned, resilient institutional systems for schools, training centres, creative facilities and other organizations operating under connectivity, cost and supply-chain constraints. It combines four capabilities: offline-first software, locally fabricated hardware, creative-computing infrastructure, and transparent technical documentation.",
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

/**
 * One company, four faces. `status` must equal the row in the status ledger
 * in docs/EVIDENCE-PACK.md §4 — audit-company.js compares them literally.
 */
export const FACES: Record<Face["key"], Face> = {
  deploy: {
    key: "deploy",
    name: "APT Deploy",
    oneLine: "Offline-capable institutional software.",
    description:
      "Administration, records, assessment and operational workflows for schools and training institutions — built to run where the network is a suggestion, on machines the institution owns, without a subscription that never ends.",
    status: "PROTOTYPE",
    route: "/deploy",
    appRoute: "/console",
    evidenceRefs: ["EVIDENCE-PACK.md §5"],
  },
  fab: {
    key: "fab",
    name: "APT Fab",
    oneLine: "Locally fabricated institutional equipment.",
    description:
      "Design, bill of materials, sourcing, fabrication, installation, repair and documentation — equipment an institution can maintain itself. Local where practical. Import where necessary. Document the difference.",
    status: "PLANNED",
    route: "/fab",
    evidenceRefs: ["EVIDENCE-PACK.md §6"],
  },
  studio: {
    key: "studio",
    name: "APT Studio",
    oneLine: "Local creative-computing infrastructure.",
    description:
      "Workstations, media production, animation, AI-assisted production where applicable, and the technical skills work that keeps them running — productive compute located in the community it serves.",
    status: "PLANNED",
    route: "/studio",
    evidenceRefs: ["EVIDENCE-PACK.md §7"],
  },
  roll: {
    key: "roll",
    name: "The Roll",
    oneLine: "One ledger. Two registers. Same evidence machinery.",
    description:
      "The people and asset interfaces share one seal, one hash model and one trust model. The current prototype is local-first; neither register is presented as a shared institutional database.",
    status: "PROTOTYPE",
    route: "/roll",
    evidenceRefs: ["EVIDENCE-PACK.md §8"],
  },
};

/** The registers beneath The Roll. */
export const REGISTERS = [
  {
    name: "People Register",
    route: "/ledger",
    summary:
      "Names, skills, credentials and seals in a local-first register interface. The current page is inspectable, but this is not a shared server-backed directory.",
    status: "PROTOTYPE" as EvidenceState,
  },
  {
    name: "Asset Register",
    route: "/roll/assets",
    summary:
      "What was designed, purchased, fabricated, installed, repaired, trained, tested, accepted and documented — with a state on every line.",
    status: "PROTOTYPE" as EvidenceState,
  },
];

/** The Floor is NOT a company face. It is where capability enters the system. */
export const INTAKE = {
  name: "BenBen / The Floor",
  role: "Intake layer",
  isFace: false,
  route: "/benben",
  summary:
    "Local capability, work, makers and ideas enter here, are reviewed on the device, then can move into APT Fab or APT Studio before evidence is recorded in The Roll.",
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
  { label: "People Register", href: "/ledger", state: "PROTOTYPE" as EvidenceState },
  { label: "Asset Register", href: "/roll/assets", state: "PROTOTYPE" as EvidenceState },
  { label: "Request repository access", href: "/contact", state: "UNKNOWN" as EvidenceState },
];

/** Status ledger rows — compared against docs/EVIDENCE-PACK.md §4. */
export const STATUS_LEDGER = [
  { face: "APT Deploy", status: "PROTOTYPE", route: "/deploy", appRoute: "/console" },
  { face: "APT Fab", status: "PLANNED", route: "/fab", appRoute: "—" },
  { face: "APT Studio", status: "PLANNED", route: "/studio", appRoute: "—" },
  { face: "The Roll", status: "PROTOTYPE", route: "/roll", appRoute: "/ledger, /roll/assets" },
];
