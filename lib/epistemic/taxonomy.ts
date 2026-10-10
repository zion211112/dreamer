/**
 * APT-LABS Epistemic Taxonomy — Category system for evidence statements
 */

export const CATEGORY = {
  FACT: "FACT",
  INFERENCE: "INFERENCE",
  ASSUMPTION: "ASSUMPTION",
  COUNTERFACTUAL: "COUNTERFACTUAL",
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export const CHAIN_STAGE = {
  OBSERVED: "OBSERVED",
  INFERRED: "INFERRED",
  PROJECTED: "PROJECTED",
  UNKNOWN: "UNKNOWN",
} as const;

export type ChainStage = (typeof CHAIN_STAGE)[keyof typeof CHAIN_STAGE];

export const SUPPORT = {
  SUPPORTED: "SUPPORTED",
  WEAKLY_SUPPORTED: "WEAKLY_SUPPORTED",
  UNTESTED: "UNTESTED",
} as const;

export type Support = (typeof SUPPORT)[keyof typeof SUPPORT];

export const SOURCE_QUALITY = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  TERTIARY: "TERTIARY",
} as const;

export type SourceQuality = (typeof SOURCE_QUALITY)[keyof typeof SOURCE_QUALITY];

export const SOURCE_ORIGIN = {
  HUMAN_OBSERVATION: "HUMAN_OBSERVATION",
  INSTRUMENT: "INSTRUMENT",
  DOCUMENT: "DOCUMENT",
  COMPUTATION: "COMPUTATION",
  MODEL: "MODEL",
} as const;

export type SourceOrigin = (typeof SOURCE_ORIGIN)[keyof typeof SOURCE_ORIGIN];

export const GUARD_EVENT = {
  CAUSALITY_OVERREACH: "CAUSALITY_OVERREACH",
  CONSENSUS_CLAIM_UNSUPPORTED: "CONSENSUS_CLAIM_UNSUPPORTED",
  SOURCE_CLAIM_FACT_COLLAPSE: "SOURCE_CLAIM_FACT_COLLAPSE",
  ASSUMPTION_LEAKAGE: "ASSUMPTION_LEAKAGE",
  CONSENSUS_AMPLIFICATION: "CONSENSUS_AMPLIFICATION",
  FLUENCY_EVIDENCE_GAP: "FLUENCY_EVIDENCE_GAP",
  SOURCE_DECAY: "SOURCE_DECAY",
  CORROBORATION_FAILURE: "CORROBORATION_FAILURE",
  CONTRADICTION: "CONTRADICTION",
} as const;

export type GuardEvent = (typeof GUARD_EVENT)[keyof typeof GUARD_EVENT];

export const GUARD_RULES: Record<GuardEvent, string> = {
  CAUSALITY_OVERREACH: "A claim asserts causation without evidence establishing a causal mechanism",
  CONSENSUS_CLAIM_UNSUPPORTED: "A claim cites consensus without naming the experts or the process",
  SOURCE_CLAIM_FACT_COLLAPSE: "A claim's source does not support the claim's category",
  ASSUMPTION_LEAKAGE: "An inference depends on an untested assumption not carried as UNKNOWN",
  CONSENSUS_AMPLIFICATION: "Repeated citations of the same source inflate confidence",
  FLUENCY_EVIDENCE_GAP: "Fluent language masks missing evidence",
  SOURCE_DECAY: "A source exceeds its freshness window for its quality tier",
  CORROBORATION_FAILURE: "A high-stakes claim lacks independent corroboration",
  CONTRADICTION: "A claim contradicts another claim in the same context",
} as const;

export const CONFIDENCE_FACTOR = {
  DIRECT_MEASUREMENT: "DIRECT_MEASUREMENT",
  DIRECT_PRIMARY_SOURCE: "DIRECT_PRIMARY_SOURCE",
  INDEPENDENT_CORROBORATION: "INDEPENDENT_CORROBORATION",
  RECENT: "RECENT",
  EXPERT_CONSENSUS: "EXPERT_CONSENSUS",
  HISTORICAL_CONSISTENCY: "HISTORICAL_CONSISTENCY",
} as const;

export type ConfidenceFactor = (typeof CONFIDENCE_FACTOR)[keyof typeof CONFIDENCE_FACTOR];

export const WARRANT = {
  DEDUCTIVE: "DEDUCTIVE",
  INDUCTIVE: "INDUCTIVE",
  ABDUCTIVE: "ABDUCTIVE",
  ANALOGICAL: "ANALOGICAL",
} as const;

export type Warrant = (typeof WARRANT)[keyof typeof WARRANT];