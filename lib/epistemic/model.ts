/**
 * APT-LABS Epistemic Model — Core types for evidence statements
 */

import { z } from "zod";
import type {
  Category,
  ChainStage,
  Support,
  SourceQuality,
  SourceOrigin,
  Warrant,
} from "./taxonomy";

/* ═══════════════════════════════════════════════════════════════════
   ID Brands — Opaque string types for entity identification
   ════════════════════════════════════════════════════════════════════ */

const brand = <T extends string>(schema: z.ZodString, _brand: string) =>
  schema.brand<T>();

export const StatementId = brand(z.string().min(1), "StatementId");
export type StatementId = z.infer<typeof StatementId>;

export const SourceId = brand(z.string().min(1), "SourceId");
export type SourceId = z.infer<typeof SourceId>;

export const EvidenceId = brand(z.string().min(1), "EvidenceId");
export type EvidenceId = z.infer<typeof EvidenceId>;

export const AssumptionId = brand(z.string().min(1), "AssumptionId");
export type AssumptionId = z.infer<typeof AssumptionId>;

export const InferenceId = brand(z.string().min(1), "InferenceId");
export type InferenceId = z.infer<typeof InferenceId>;

export const EventId = brand(z.string().min(1), "EventId");
export type EventId = z.infer<typeof EventId>;

export const TraceId = brand(z.string().min(1), "TraceId");
export type TraceId = z.infer<typeof TraceId>;

export const BranchId = brand(z.string().min(1), "BranchId");
export type BranchId = z.infer<typeof BranchId>;

/* ═══════════════════════════════════════════════════════════════════
   Base Statement — Common fields for all epistemic statements
   ════════════════════════════════════════════════════════════════════ */

const ConfidenceFactorSchema = z.object({
  factor: z.enum([
    "DIRECT_MEASUREMENT",
    "DIRECT_PRIMARY_SOURCE",
    "INDEPENDENT_CORROBORATION",
    "RECENT",
    "EXPERT_CONSENSUS",
    "HISTORICAL_CONSISTENCY",
  ]),
  basis: z.string(),
  because: z.string(),
});

export type ConfidenceFactor = z.infer<typeof ConfidenceFactorSchema>;

const ConfidenceSchema = z.object({
  factors: z.array(ConfidenceFactorSchema),
});

export type Confidence = z.infer<typeof ConfidenceSchema>;

const BaseStatementSchema = z.object({
  kind: z.enum(["CLAIM", "INFERENCE", "ASSUMPTION", "COUNTERFACTUAL"]),
  id: StatementId,
  text: z.string().min(1),
  category: z.enum(["FACT", "INFERENCE", "ASSUMPTION", "COUNTERFACTUAL", "UNKNOWN"]),
  chainStage: z.enum(["OBSERVED", "INFERRED", "PROJECTED", "UNKNOWN"]),
  support: z.enum(["SUPPORTED", "WEAKLY_SUPPORTED", "UNTESTED", "UNKNOWN"]),
  provenance: z.object({
    author: z.string(),
    timestamp: z.string(),
    tool: z.string().optional(),
  }),
  confidence: ConfidenceSchema,
  transitions: z.array(z.string()),
  guards: z.array(z.string()),
  unknowns: z.array(z.string()),
  parentIds: z.array(StatementId),
  createdAt: z.string(),
});

export type BaseStatement = z.infer<typeof BaseStatementSchema>;

/* ════════════════════════════════════════════════════════════════════
   Claim — A statement asserted as fact with evidence
   ════════════════════════════════════════════════════════════════════ */

const ClaimSchema = BaseStatementSchema.extend({
  kind: z.literal("CLAIM"),
  category: z.enum(["FACT", "INFERENCE", "ASSUMPTION", "COUNTERFACTUAL", "UNKNOWN"]),
  evidenceIds: z.array(EvidenceId),
  sourceIds: z.array(SourceId),
  independentSupports: z.number().int().min(0),
  contradicting: z.array(StatementId),
});

export type Claim = z.infer<typeof ClaimSchema>;

/* ════════════════════════════════════════════════════════════════════
   Inference — A derived statement from premises via a warrant
   ════════════════════════════════════════════════════════════════════ */

const InferenceSchema = BaseStatementSchema.extend({
  kind: z.literal("INFERENCE"),
  category: z.literal("INFERENCE"),
  premises: z.array(StatementId),
  rule: z.string(),
  warrant: z.enum(["DEDUCTIVE", "INDUCTIVE", "ABDUCTIVE", "ANALOGICAL"]),
});

export type Inference = z.infer<typeof InferenceSchema>;

/* ═════════════════════════════════════════════════════════════════════
   Assumption — An uncarried premise that must be tracked
   ════════════════════════════════════════════════════════════════════ */

const AssumptionSchema = BaseStatementSchema.extend({
  kind: z.literal("ASSUMPTION"),
  category: z.literal("ASSUMPTION"),
  chainStage: z.literal("UNKNOWN"),
  support: z.literal("UNTESTED"),
  ifFalse: z.string(),
  verified: z.boolean(),
});

export type Assumption = z.infer<typeof AssumptionSchema>;

/* ═════════════════════════════════════════════════════════════════════
   Counterfactual — A what-if statement for scenario planning
   ════════════════════════════════════════════════════════════════════ */

const CounterfactualSchema = BaseStatementSchema.extend({
  kind: z.literal("COUNTERFACTUAL"),
  category: z.literal("COUNTERFACTUAL"),
  condition: z.string(),
  consequence: z.string(),
});

export type Counterfactual = z.infer<typeof CounterfactualSchema>;

/* ════════════════════════════════════════════════════════════════════
   Source — An identifiable information origin
   ════════════════════════════════════════════════════════════════════ */

const SourceSchema = z.object({
  id: SourceId,
  locator: z.string(),
  originator: z.string(),
  publishedAt: z.string(),
  opened: z.boolean(),
  quality: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),
  independenceGroup: z.string(),
  retrievedAt: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

/* ═════════════════════════════════════════════════════════════════════
   Evidence — A piece of evidence linking source to claim
   ════════════════════════════════════════════════════════════════════ */

const EvidenceSchema = z.object({
  id: EvidenceId,
  claimId: StatementId,
  sourceId: SourceId,
  text: z.string(),
  extractedAt: z.string(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

/* ═════════════════════════════════════════════════════════════════════
   Guard Event — A detected epistemic violation
   ════════════════════════════════════════════════════════════════════ */

const GuardEventSchema = z.object({
  event: z.enum([
    "CAUSALITY_OVERREACH",
    "ASSUMPTION_LEAKAGE",
    "SOURCE_DECAY",
    "CORROBORATION_FAILURE",
    "CONTRADICTION",
    "CONSENSUS_CLAIM_UNSUPPORTED",
    "SOURCE_CLAIM_FACT_COLLAPSE",
    "CONSENSUS_AMPLIFICATION",
    "FLUENCY_EVIDENCE_GAP",
  ]),
  severity: z.enum(["ERROR", "WARNING", "INFO"]),
  message: z.string(),
  observed: z.string().optional(),
  evidence: z.string(),
  acknowledged: z.boolean().optional(),
  acknowledgedBy: z.string().optional(),
  id: z.string().optional(),
});

export type GuardEvent = z.infer<typeof GuardEventSchema>;

/* ═════════════════════════════════════════════════════════════════════
   Event — Trace event for reasoning chains
   ════════════════════════════════════════════════════════════════════ */

export const EventKind = {
  INTUIT: "INTUIT",
  BOOTSTRAP: "BOOTSTRAP",
  ATTACK: "ATTACK",
  REPLACE: "REPLACE",
  STAGE_COMPLETED: "STAGE_COMPLETED",
} as const;

export type EventKind = (typeof EventKind)[keyof typeof EventKind];

const EventSchema = z.object({
  id: EventId,
  at: z.string(),
  kind: z.enum(["INTUIT", "BOOTSTRAP", "ATTACK", "REPLACE", "STAGE_COMPLETED"]),
  actor: z.object({
    type: z.enum(["SYSTEM", "HUMAN", "MODEL"]),
    component: z.string().optional(),
  }),
  stage: z.string(),
  summary: z.string(),
  refs: z.array(z.string()),
  guards: z.array(z.string()),
  metrics: z.record(z.string(), z.unknown()),
});

export type Event = z.infer<typeof EventSchema>;

/* ════════════════════════════════════════════════════════════════════
   Trace — Reasoning chain trace
   ════════════════════════════════════════════════════════════════════ */

const TraceSchema = z.object({
  id: TraceId,
  task: z.string(),
  model: z.string(),
  generation: z.object({ temperature: z.number() }),
  tools: z.array(z.string()),
  retrieval: z.array(z.string()),
  events: z.array(EventSchema),
  annotations: z.array(z.string()),
});

export type Trace = z.infer<typeof TraceSchema>;

export const Trace = TraceSchema;

export function parseTrace(data: unknown): Trace {
  return TraceSchema.parse(data);
}

/* ════════════════════════════════════════════════════════════════════
   Statement Union & Parsers
   ════════════════════════════════════════════════════════════════════ */

export const Statement = z.discriminatedUnion("kind", [
  ClaimSchema,
  InferenceSchema,
  AssumptionSchema,
  CounterfactualSchema,
]);

export type Statement = z.infer<typeof Statement>;

// Export schemas with .parse for the test script
export const Claim = ClaimSchema;
export const Inference = InferenceSchema;
export const Assumption = AssumptionSchema;
export const Counterfactual = CounterfactualSchema;
export const Source = SourceSchema;
export const Evidence = EvidenceSchema;
export const GuardEvent = GuardEventSchema;
export const Event = EventSchema;

// Also export parse functions
export function parseStatement(data: unknown): Statement {
  return Statement.parse(data);
}

export function parseClaim(data: unknown): Claim {
  return ClaimSchema.parse(data);
}

export function parseInference(data: unknown): Inference {
  return InferenceSchema.parse(data);
}

export function parseAssumption(data: unknown): Assumption {
  return AssumptionSchema.parse(data);
}

export function parseSource(data: unknown): Source {
  return SourceSchema.parse(data);
}

export function parseEvidence(data: unknown): Evidence {
  return EvidenceSchema.parse(data);
}

export function parseGuardEvent(data: unknown): GuardEvent {
  return GuardEventSchema.parse(data);
}

export function parseEvent(data: unknown): Event {
  return EventSchema.parse(data);
}

/* ════════════════════════════════════════════════════════════════════
   Provenance Derivation — Determine authorship from action chain
   ═══════════════════════════════════════════════════════════════════ */

export type ProvenanceActor =
  | { type: "HUMAN"; actorId: string }
  | { type: "MODEL"; capability: "FAST" | "DEEP" };

export interface ProvenanceEntry {
  at: string;
  actor: ProvenanceActor;
  action: "GENERATED" | "EDITED" | "REVIEWED" | "CHALLENGED" | "APPROVED";
}

export type ProvenanceKind =
  | "HUMAN_AUTHORED"
  | "MODEL_AUTHORED"
  | "HUMAN_MODIFIED"
  | "JOINT"
  | "UNRESOLVED";

export function deriveProvenanceKind(input: { entries: ProvenanceEntry[] }): ProvenanceKind {
  const { entries } = input;
  if (entries.length === 0) return "UNRESOLVED";

  const first = entries[0];
  const last = entries[entries.length - 1];

  // If last action is CHALLENGED by human, it's unresolved
  if (last.action === "CHALLENGED" && last.actor.type === "HUMAN") {
    return "UNRESOLVED";
  }

  // If model generated then human edited
  if (
    first.actor.type === "MODEL" &&
    entries.some((e) => e.actor.type === "HUMAN" && e.action === "EDITED")
  ) {
    return "HUMAN_MODIFIED";
  }

  // If human generated then model edited
  if (
    first.actor.type === "HUMAN" &&
    entries.some((e) => e.actor.type === "MODEL" && e.action === "EDITED")
  ) {
    return "JOINT";
  }

  // If only model
  if (entries.every((e) => e.actor.type === "MODEL")) {
    return "MODEL_AUTHORED";
  }

  // If only human
  if (entries.every((e) => e.actor.type === "HUMAN")) {
    return "HUMAN_AUTHORED";
  }

  return "JOINT";
}

/* ════════════════════════════════════════════════════════════════════
   Branch — Anti-median diversity tracking
   ═══════════════════════════════════════════════════════════════════ */

const BranchSchema = z.object({
  id: BranchId,
  strategy: z.enum(["RADICAL_MECHANISM", "CONSERVATIVE", "INCREMENTAL"]),
  thesis: z.string(),
  assumptions: z.array(z.string()),
  mechanism: z.string(),
  failureMode: z.string(),
  novelContribution: z.string(),
  differsBecause: z.string(),
  verdicts: z.array(z.string()),
  protectedFromOptimization: z.boolean(),
});

export type Branch = z.infer<typeof BranchSchema>;

export const Branch = BranchSchema;

export function parseBranch(data: unknown): Branch {
  return BranchSchema.parse(data);
}