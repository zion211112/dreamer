// lib/roll.ts — THE ROLL page data (Evidence methodology + public records)
//
// Constitutional truth (§05, §06):
//   The Roll is an evidence system, not a decorative dashboard.
//   9 categories: Costs, People, Assets, Technical Records, Milestones, Tests, Acceptance, Reconciliation, Provenance
//   Every entry: timestamp, author, hash, evidence state. State changes leave trail.
//   If no real public records exist, render a strong honest empty state.
//   Never generate fake ledger activity.

import type { EvidenceState } from "./system";
import { CONTRACT_RULES, STATE_RULES, STATE_ORDER, EVIDENCE_STATES, CONTRIBUTION, STACK } from "./system";

/**
 * The Roll — public evidence methodology and records
 */
export const ROLL = {
  name: "The Roll",
  tagline: "Evidence layer — every entry carries a state, every state change leaves a trail",
  description:
    "The Roll is the evidence/operational record layer of APT-LABS. It is not a dashboard — it is the discipline that makes every claim inspectable. Nine categories. Every entry: timestamp, author, hash, evidence state. State changes leave a trail.",

  // The 9 categories per Constitution §05
  categories: [
    {
      id: "costs",
      name: "Costs",
      description: "What it cost — materials, labour, overhead, recurring. Every figure traceable to a source document.",
      unit: "entry",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "people",
      name: "People",
      description: "Who was there, what role they held, what they contributed. Weight minted by work, never bought.",
      unit: "person",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "assets",
      name: "Assets",
      description: "Every asset's lifecycle — designed, procured, installed, tested, accepted — with a state per line.",
      unit: "asset",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "technical-records",
      name: "Technical Records",
      description: "Specifications, drawings, test results, maintenance logs — the technical memory of the institution.",
      unit: "record",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "milestones",
      name: "Milestones",
      description: "Gates passed: design review, factory acceptance, site acceptance, commissioning, handover.",
      unit: "milestone",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "tests",
      name: "Tests",
      description: "What was tested, against which criterion, by whom, with what result. Failed tests are not hidden.",
      unit: "test",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "acceptance",
      name: "Acceptance",
      description: "Formal acceptance: who signed, on what evidence, under which rule. The moment responsibility transfers.",
      unit: "acceptance",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "reconciliation",
      name: "Reconciliation",
      description: "Two independently sourced statements of one period, joined. Every unmatched entry recorded in both directions.",
      unit: "reconciliation",
      state: "PLANNED" as EvidenceState,
    },
    {
      id: "provenance",
      name: "Provenance",
      description: "Where every record came from, who entered it, when, and under what authority. The chain that cannot be broken.",
      unit: "provenance",
      state: "PLANNED" as EvidenceState,
    },
  ] as const,

  // Evidence methodology — the contract rules
  methodology: {
    states: EVIDENCE_STATES,
    stateOrder: STATE_ORDER,
    stateRules: STATE_RULES,
    contractRules: CONTRACT_RULES,
    description:
      "Every claim on this site — and every record in The Roll — carries one of six evidence states. The rules are not decorative: they are enforced by CI (check:epistemic) and rendered on every surface.",
  },

  // Contribution rules (weight on The Roll)
  contributionRules: CONTRIBUTION,

  // Public records — HONEST EMPTY STATE
  publicRecords: [] as const,

  emptyState: {
    title: "No public records yet",
    description:
      "The Roll records what happened, who did it, what it cost, what was tested, what was accepted, and what remains unknown — with an evidence state on every entry. When a real institution runs APT-LABS infrastructure and publishes its register, those records will appear here.",
    cta: "The first record will be a deployment. The first deployment starts with a conversation.",
    ctaHref: "/contact",
  },

  // Stack layer backing The Roll
  stackLayer: STACK.find((l) => l.key === "identity"),

  // Primitives that power The Roll (implementation infrastructure, not public features per §04)
  primitives: [
    "BenBen Protocol (SBTs, DIDs, ZK proofs, evidence anchoring, revocation)",
    "Immutable Ledger (append-only, merkle proofs, audit trail integrity)",
    "Governance Board (proposals, votes, resolutions, timelock)",
    "Audit System (evidence chains, tamper detection, compliance reporting)",
  ],
} as const;