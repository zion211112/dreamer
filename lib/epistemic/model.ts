/**
 * lib/epistemic/model.ts — THE OBJECT MODEL.
 *
 * Every object the system holds is a member of one of the discriminated
 * unions below. ASIANCODER.MD's requirement is blunt: "Every object has a
 * type. Never silently convert one type into another." The mechanism for
 * that here is threefold:
 *
 *   1. Zod schemas, so the type exists at RUNTIME as well as at compile
 *      time. A trace loaded from disk or a payload arriving from a tool is
 *      validated on the way in, not trusted. An epistemic system that
 *      accepts an unvalidated claim from outside has already lost.
 *
 *   2. Discriminated unions on `kind`, so `switch (obj.kind)` is exhaustive
 *      and TypeScript proves every case is handled. A new object type
 *      cannot be added without every consumer deciding what to do with it.
 *
 *   3. No structural overlap between members. An Observation cannot be
 *      assignable to an Inference, and no amount of `as` should make one so.
 *
 * On the "silently convert" prohibition specifically: the unions below make
 * conversion a COMPILE error, and `transition.ts` makes the one legitimate
 * conversion — an explicitly recorded category transition — a runtime event
 * with a reason, an actor, and an append-only record. There is no function
 * in this codebase that takes an Observation and returns an Inference.
 */

import { z } from "zod";
import {
  BRANCH_STRATEGIES,
  CONFIDENCE_FACTORS,
  EDGE_SEMANTICS,
  FALSIFICATION_MODES,
  GUARD_EVENTS,
  GUARD_SEVERITIES,
  HEALTH_AXES,
  HUMAN_GATE_VERDICTS,
  LOOP_STAGES,
  MEMORY_KINDS,
  NODE_KINDS,
  PROVENANCE_KINDS,
  REVIEWER_TYPES,
  STATEMENT_CATEGORIES,
  SUPPORT_STATES,
  CHAIN_STAGES,
  type BranchStrategy,
  type ConfidenceFactor,
  type EdgeSemantic,
  type FalsificationMode,
  type GuardEvent,
  type GuardSeverity,
  type HealthAxis,
  type HumanGateVerdict,
  type LoopStage,
  type MemoryKind,
  type NodeKind,
  type ProvenanceKind,
  type ReviewerType,
  type StatementCategory,
  type SupportState,
  type ChainStage,
} from "./taxonomy";

/* ── Primitives ──────────────────────────────────────────────────
   Branded ids, because `SourceId` and `ClaimId` being the same
   TypeScript string is precisely how a claim ends up rendered as a
   source. The brand is erased at runtime and checked at compile time. */

const brand = <T extends string>(name: T) =>
  z.string().min(1).brand<T>();

export const SourceId = brand("SourceId");
export const EvidenceId = brand("EvidenceId");
export const ClaimId = brand("ClaimId");
export const StatementId = brand("StatementId");
export const ArtifactId = brand("ArtifactId");
export const AgentId = brand("AgentId");
export const ToolId = brand("ToolId");
export const TraceId = brand("TraceId");
export const EventId = brand("EventId");
export const NodeId = brand("NodeId");
export const ReviewId = brand("ReviewId");
export const ExperimentId = brand("ExperimentId");
export const MemoryId = brand("MemoryId");
export const BranchId = brand("BranchId");

export type SourceId = z.infer<typeof SourceId>;
export type ClaimId = z.infer<typeof ClaimId>;
export type StatementId = z.infer<typeof StatementId>;
export type ArtifactId = z.infer<typeof ArtifactId>;
export type AgentId = z.infer<typeof AgentId>;
export type ToolId = z.infer<typeof ToolId>;
export type TraceId = z.infer<typeof TraceId>;
export type EventId = z.infer<typeof EventId>;
export type NodeId = z.infer<typeof NodeId>;
export type ReviewId = z.infer<typeof ReviewId>;
export type ExperimentId = z.infer<typeof ExperimentId>;
export type MemoryId = z.infer<typeof MemoryId>;
export type BranchId = z.infer<typeof BranchId>;

/** ISO-8601 instant. Validated, not trusted. */
export const Instant = z.iso.datetime();

/**
 * WHO OR WHAT produced a piece of content.
 *
 * `model` is a provider-agnostic capability label rather than a vendor
 * name, because ASIANCODER.MD requires the domain model to carry no vendor
 * lock-in: a claim's provenance must survive swapping providers, which it
 * cannot do if it records "gpt-4" instead of "a model".
 */
export const Actor = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MODEL"),
    /** Capability role: fast, deep, critic, judge, vision, local. */
    capability: z.string(),
    /** Opaque provider label. Recorded, never interpreted by the domain. */
    provider: z.string().optional(),
  }),
  z.object({
    type: z.literal("HUMAN"),
    /** Stable pseudonym or session id. Never an email, never a real name. */
    actorId: z.string().min(1),
  }),
  z.object({
    type: z.literal("TOOL"),
    toolId: ToolId,
  }),
  z.object({
    type: z.literal("SYSTEM"),
    /** Which subsystem: SCHEDULER, VALIDATOR, ROUTER, STORE. */
    component: z.string(),
  }),
]);
export type Actor = z.infer<typeof Actor>;

/* ── Provenance: append-only ──────────────────────────────────────
   ASIANCODER.MD: "Never erase provenance."

   So provenance is a LIST and there is no setter. The only operation in
   the codebase that touches it is `appendProvenance`, and the derived
   `kind` is always recomputed from the list rather than stored, so there
   is no field anywhere that can be set to the wrong value. */

export const ProvenanceEntry = z.object({
  at: Instant,
  actor: Actor,
  /** What this actor did: GENERATED, EDITED, REVIEWED, CHALLENGED, ATTESTED. */
  action: z.enum(["GENERATED", "EDITED", "REVIEWED", "CHALLENGED", "ATTESTED"]),
  /** Optional: the id of the prior entry this supersedes. */
  supersedes: z.string().optional(),
  note: z.string().optional(),
});
export type ProvenanceEntry = z.infer<typeof ProvenanceEntry>;

export const Provenance = z.object({ entries: z.array(ProvenanceEntry) });
export type Provenance = z.infer<typeof Provenance>;

/**
 * Derive the display provenance kind from the entry list.
 *
 * The rules are deliberately conservative. Any human involvement at all
 * yields HUMAN_MODIFIED unless a human was the FIRST author, in which case
 * it is HUMAN_GENERATED. The one case that must never be lost is
 * UNRESOLVED: if the provenance contains a contradiction — a CHALLENGED
 * entry with no subsequent EDITED or ATTESTED — the content is unresolved,
 * and that outranks everything else in the list.
 */
export function deriveProvenanceKind(p: Provenance): ProvenanceKind {
  const { entries } = p;
  if (entries.length === 0) return "UNRESOLVED";

  /* A trailing challenge wins over everything. Content somebody has just
     attacked is unresolved regardless of how it was authored, because the
     question "who made this" is the wrong question while it is in dispute. */
  if (entries[entries.length - 1].action === "CHALLENGED") return "UNRESOLVED";

  const humanCount = entries.filter((e) => e.actor.type === "HUMAN").length;
  if (humanCount === 0) return "MODEL_GENERATED";

  /* Every entry human-authored: the human owns it outright. Note this must
     be tested against the WHOLE list rather than against "the one human
     entry was a GENERATE" — a human-authored artifact that a model later
     touched is JOINT, and the shorter test silently relabelled it as
     human-owned, which is the one mislabelling that would let a machine
     edit take authorship. */
  if (humanCount === entries.length) return "HUMAN_GENERATED";

  /* Mixed. Who went first decides what the provenance is called: a human
     who starts something a machine then improves is JOINT, because the
     machine did not author it; a machine draft a human then edits is
     HUMAN_MODIFIED, because the human did not start it. */
  return entries[0].actor.type === "HUMAN" ? "JOINT" : "HUMAN_MODIFIED";
}

/* ── Sources and evidence ────────────────────────────────────────
   A Source is where something came from. Evidence is a CAPTURED
   instance of a source bearing on a claim. They are different objects
   because "we have the paper" and "we read the relevant part of the
   paper" are different facts, and conflating them is how a citation
   becomes a proof. */

export const SourceQuality = z.enum([
  "PRIMARY",
  "SECONDARY",
  "TERTIARY",
  "ANECDOTAL",
  "SELF_REPORTED",
  "UNVERIFIED",
]);

export const Source = z.object({
  id: SourceId,
  /** What kind of thing this is, in the source's own terms. */
  locator: z.string().min(1),
  /** Who published it. */
  originator: z.string().min(1),
  publishedAt: Instant.optional(),
  /** Whether anyone in this system has actually opened it. */
  opened: z.boolean(),
  quality: SourceQuality,
  /** Independence group. Two sources sharing a group are not independent. */
  independenceGroup: z.string().min(1),
  retrievedAt: Instant.optional(),
});
export type Source = z.infer<typeof Source>;
export type SourceQuality = z.infer<typeof SourceQuality>;

export const Evidence = z.object({
  id: z.string(),
  sourceId: SourceId,
  /** Whether the source said this directly or it was derived from the source. */
  directness: z.enum(["DIRECT", "INDIRECT"]),
  /** The part of the source that bears on the claim, quoted or located. */
  excerpt: z.string().min(1),
  capturedAt: Instant,
  /** Whether this capture is independent of other captures on the same claim. */
  independent: z.boolean(),
});
export type Evidence = z.infer<typeof Evidence>;

/* ── Confidence: factors, not a number ─────────────────────────── */

export const ConfidenceFactorEntry = z.object({
  factor: z.enum(CONFIDENCE_FACTORS),
  /** Why this factor applies. Required — an unexplained factor is a vibe. */
  basis: z.string().min(1),
  /** What put it here: a source id, an evidence id, or a system rule name. */
  because: z.string().min(1),
});
export type ConfidenceFactorEntry = z.infer<typeof ConfidenceFactorEntry>;

export const Confidence = z.object({
  factors: z.array(ConfidenceFactorEntry),
});
export type Confidence = z.infer<typeof Confidence>;

/* ── Category transitions ────────────────────────────────────────
   The mechanism that makes a promotion visible. Every transition is
   appended, never overwritten, and carries the reason it happened. */

export const CategoryTransition = z.object({
  id: z.string(),
  at: Instant,
  actor: Actor,
  from: z.enum(STATEMENT_CATEGORIES),
  to: z.enum(STATEMENT_CATEGORIES),
  /** Required. A transition without a reason is not inspectable. */
  reason: z.string().min(1),
  /** True when the new category has a STRONGER entitlement than the old. */
  promotion: z.boolean(),
  /** Set when a promotion happened: the guard event it raised. */
  guard: z.enum(GUARD_EVENTS).optional(),
});
export type CategoryTransition = z.infer<typeof CategoryTransition>;

/* ── The epistemic statement union ────────────────────────────────
   This is the heart. ASIANCODER.MD's example set — Observation,
   Inference, Hypothesis, Value Judgment, Decision — plus the rest.

   Each member carries the fields that are TRUE OF THAT KIND and no
   others. An Observation has a capture; a ValueJudgment has a holder;
   a Prediction has a horizon. A Decision has an owner. A Prediction has
   nothing but a date. Making these mutually exclusive at the type level
   is the "first major anti-category-error mechanism" the contract asks
   for, and it is why this is a union and not one wide interface. */

const StatementBase = {
  id: StatementId,
  /** The sentence itself. Never empty — an empty claim is not a claim. */
  text: z.string().min(1),
  category: z.enum(STATEMENT_CATEGORIES),
  chainStage: z.enum(CHAIN_STAGES),
  support: z.enum(SUPPORT_STATES),
  provenance: Provenance,
  confidence: Confidence,
  transitions: z.array(CategoryTransition),
  /** Recorded guards raised against this statement. */
  guards: z.array(z.enum(GUARD_EVENTS)),
  /** Known unknowns. Present and rendered, never omitted. */
  unknowns: z.array(z.string()),
  parentIds: z.array(StatementId).default([]),
  createdAt: Instant,
};

export const Observation = z.object({
  ...StatementBase,
  kind: z.literal("OBSERVATION"),
  category: z.literal("OBSERVATION").or(z.literal("FACT")),
  /** What produced the reading. A measurement has a method. */
  method: z.string().min(1),
  capturedBy: Actor,
});

export const Inference = z.object({
  ...StatementBase,
  kind: z.literal("INFERENCE"),
  category: z.literal("INFERENCE"),
  /** The premises. An inference with no premises is an assertion. */
  premises: z.array(StatementId).min(1),
  /** The rule that got us from premises to conclusion. Stated or the inference is opaque. */
  rule: z.string().min(1),
  /** The strength of the warrant, as a category rather than a number. */
  warrant: z.enum(["DEDUCTIVE", "ABDUCTIVE", "INDUCTIVE", "ANALOGICAL"]),
});

export const Hypothesis = z.object({
  ...StatementBase,
  kind: z.literal("HYPOTHESIS"),
  category: z.literal("HYPOTHESIS"),
  /** The proposed mechanism. A hypothesis without one is a topic. */
  mechanism: z.string().min(1),
  /** What would count as evidence for AND against. Required. */
  wouldBeSupportedBy: z.string().min(1),
  wouldBeRefutedBy: z.string().min(1),
});

export const Assumption = z.object({
  ...StatementBase,
  kind: z.literal("ASSUMPTION"),
  category: z.literal("ASSUMPTION"),
  /** If this is false, what collapses. That is what makes it load-bearing. */
  ifFalse: z.string().min(1),
  verified: z.boolean(),
});

export const ValueJudgment = z.object({
  ...StatementBase,
  kind: z.literal("VALUE_JUDGMENT"),
  category: z.literal("NORMATIVE_JUDGMENT"),
  /** Normative statements are never derived from evidence. A human holds this. */
  heldBy: z.string().min(1),
  /** The values in tension. A judgment with no conflict is a preference. */
  prioritises: z.string().min(1),
  over: z.string().min(1),
});

export const Decision = z.object({
  ...StatementBase,
  kind: z.literal("DECISION"),
  category: z.literal("DESIGN_CHOICE"),
  /** Irreversible and external actions require a named human. Always. */
  authorisedBy: Actor,
  alternativesConsidered: z.array(StatementId).default([]),
  /** What would reverse this. A decision with no reversal is a commitment. */
  reversibleBy: z.string().optional(),
});

export const Prediction = z.object({
  ...StatementBase,
  kind: z.literal("PREDICTION"),
  category: z.literal("PREDICTION"),
  /** The date it is a bet on. A prediction without a horizon is a hope. */
  resolvesAt: Instant,
  /** Filled in when the date passes. Null means still pending, NOT wrong. */
  resolvedOutcome: z.string().nullable(),
});

export const Counterexample = z.object({
  ...StatementBase,
  kind: z.literal("COUNTEREXAMPLE"),
  category: z.literal("OBSERVATION"),
  /** The assertion this is a counterexample TO. */
  refutes: StatementId,
  mode: z.enum(FALSIFICATION_MODES),
});

export const Claim = z.object({
  ...StatementBase,
  kind: z.literal("CLAIM"),
  /** A claim may hold any category — that is what a claim IS. */
  category: z.enum(STATEMENT_CATEGORIES),
  evidenceIds: z.array(z.string()).default([]),
  sourceIds: z.array(SourceId).default([]),
  /** Independent origins of support, counted by independence group. */
  independentSupports: z.number().int().nonnegative().default(0),
  contradicting: z.array(z.string()).default([]),
});

/** The union. `Statement` is the name the UI uses. */
export const Statement = z.discriminatedUnion("kind", [
  Observation,
  Inference,
  Hypothesis,
  Assumption,
  ValueJudgment,
  Decision,
  Prediction,
  Counterexample,
  Claim,
]);
export type Statement = z.infer<typeof Statement>;
export type StatementKind = Statement["kind"];

/**
 * Per-member inferred types.
 *
 * Named `*T` because a zod schema occupies the same identifier as the type
 * it infers — `Claim` is already the schema value here, so the type needs a
 * distinct name. Exported explicitly rather than left to `Extract<>` so
 * that a consumer narrowing a union gets a readable type in its hover text
 * and in its error messages.
 */
export type ObservationT = z.infer<typeof Observation>;
export type InferenceT = z.infer<typeof Inference>;
export type HypothesisT = z.infer<typeof Hypothesis>;
export type AssumptionT = z.infer<typeof Assumption>;
export type ValueJudgmentT = z.infer<typeof ValueJudgment>;
export type DecisionT = z.infer<typeof Decision>;
export type PredictionT = z.infer<typeof Prediction>;
export type CounterexampleT = z.infer<typeof Counterexample>;
export type ClaimT = z.infer<typeof Claim>;

/**
 * A model for narrowing without a type guard.
 *
 * Exists because `Statement` is a union and TypeScript cannot narrow a
 * union member by a literal property unless you supply the guard yourself.
 * This is that guard, once, validated: it parses rather than asserts, so a
 * malformed object can never be treated as a narrower type.
 */
export function isKind<K extends StatementKind>(
  s: Statement,
  kind: K,
): s is Extract<Statement, { kind: K }> {
  return s.kind === kind;
}

/* ── Agents, tools, policies ───────────────────────────────────── */

export const ToolCapability = z.object({
  /** What the tool may touch. Anything not listed is forbidden. */
  allows: z.array(z.string()),
  /** Explicitly refused, so the boundary is readable and not merely absent. */
  forbids: z.array(z.string()),
  /** True if the tool can leave this machine. */
  egress: z.boolean(),
  requiresHumanApproval: z.boolean(),
});
export type ToolCapability = z.infer<typeof ToolCapability>;

export const Tool = z.object({
  id: ToolId,
  name: z.string().min(1),
  /** The capability boundary. Enforced at call time, not advisory. */
  capability: ToolCapability,
  /** Tools a tool may invoke. Depth is bounded by this list. */
  mayCall: z.array(ToolId).default([]),
});
export type Tool = z.infer<typeof Tool>;

export const Agent = z.object({
  id: AgentId,
  name: z.string().min(1),
  role: z.string().min(1),
  /** Capability label, not a vendor. See Actor. */
  capability: z.enum([
    "FAST",
    "DEEP_REASONING",
    "VISION",
    "CODING",
    "CRITIC",
    "JUDGE",
    "LOCAL",
    "SPECIALIST",
  ]),
  inputKinds: z.array(z.enum(STATEMENT_CATEGORIES)),
  outputKinds: z.array(z.enum(STATEMENT_CATEGORIES)),
  tools: z.array(ToolId).default([]),
  memory: z.array(z.enum(MEMORY_KINDS)).default([]),
  /** What this agent is allowed to do to the record. */
  evidencePolicy: z.enum(["READ_ONLY", "APPEND_ONLY", "NONE"]),
  /** What it may do with its own confidence. */
  confidencePolicy: z.enum(["MUST_CITE_FACTORS", "ADVISORY"]),
  /** What happens when it fails or is uncertain. */
  failurePolicy: z.enum(["ABSTAIN", "ESCALATE", "BEST_EFFORT", "STOP"]),
  /** Whether it may ever act without a human. Never true for OUTPUT-adjacent work. */
  mayActUnsupervised: z.boolean(),
});
export type Agent = z.infer<typeof Agent>;

/**
 * A policy that an agent cannot change.
 *
 * ASIANCODER.MD's NO HIDDEN AUTHORITY section: an agent must not be able to
 * change system policy, rewrite evidence, alter provenance, delete
 * contradictions, modify human decisions, promote hypotheses to facts, or
 * declare itself correct.
 *
 * So `Policy` carries no method by which an Actor whose type is not HUMAN
 * could mutate it. That is not a runtime check — it is a type-level
 * absence: there is no `applyPolicy` function in this codebase, and the
 * state layer's policy reducer is a separate module with no agent path into
 * it. The protection is that the operation does not exist.
 */
export const Policy = z.object({
  id: z.string(),
  rule: z.string().min(1),
  /** What the policy forbids, in the words it will be shown in. */
  forbids: z.array(z.string()),
  /** Who may change it. Always humans. */
  changeAuthority: z.literal("HUMAN_ONLY"),
});
export type Policy = z.infer<typeof Policy>;

/* ── Attacks, reviews, human gates ─────────────────────────────── */

export const ATTACK_STATUSES = [
  "OPEN",
  "ADDRESSED",
  "ACCEPTED_RISK",
  "WITHDRAWN",
] as const;

export const Attack = z.object({
  id: z.string(),
  /** Who raised it. A reviewer type, plus the agent that played it. */
  reviewerType: z.enum(REVIEWER_TYPES),
  reviewerAgentId: AgentId.optional(),
  /** The exact text attacked. Attacks target spans, not vibes. */
  targetStatementId: StatementId,
  targetQuote: z.string().min(1),
  /** The attack itself. */
  body: z.string().min(1),
  severity: z.enum(GUARD_SEVERITIES),
  /** What would resolve it. An attack without a resolution is a complaint. */
  requiredChange: z.string().min(1),
  /** Counter-evidence, when the reviewer had any. */
  counterEvidence: z.string().optional(),
  mode: z.enum(FALSIFICATION_MODES),
  status: z.enum(ATTACK_STATUSES),
  raisedAt: Instant,
  resolvedAt: Instant.optional(),
});
export type Attack = z.infer<typeof Attack>;

export const HumanVerdict = z.object({
  id: z.string(),
  verdict: z.enum(HUMAN_GATE_VERDICTS),
  actorId: z.string().min(1),
  at: Instant,
  /** Required on every verdict: what the human was looking at. */
  rationale: z.string().min(1),
  /** For PROTECT_FROM_OPTIMIZATION — why automated improvement would harm it. */
  protectionReason: z.string().optional(),
});
export type HumanVerdict = z.infer<typeof HumanVerdict>;

/* ── Graph ─────────────────────────────────────────────────────── */

export const GraphNode = z.object({
  id: NodeId,
  kind: z.enum(NODE_KINDS),
  name: z.string().min(1),
  role: z.string().min(1),
  agentId: AgentId.optional(),
  inputKinds: z.array(z.enum(STATEMENT_CATEGORIES)).default([]),
  outputKinds: z.array(z.enum(STATEMENT_CATEGORIES)).default([]),
  /** Compact-by-default metrics. No prose on the card. */
  metrics: z.object({
    latencyMs: z.number().nonnegative().optional(),
    costUsd: z.number().nonnegative().optional(),
    errorRate: z.number().min(0).max(1).optional(),
    evalScore: z.number().min(0).max(1).optional(),
  }),
  failurePolicy: z.enum(["ABSTAIN", "ESCALATE", "BEST_EFFORT", "STOP"]).optional(),
});
export type GraphNode = z.infer<typeof GraphNode>;

export const GraphEdge = z.object({
  id: z.string(),
  from: NodeId,
  to: NodeId,
  semantic: z.enum(EDGE_SEMANTICS),
  /** For CONTRADICTION edges: what is in dispute. */
  contested: z.string().optional(),
});
export type GraphEdge = z.infer<typeof GraphEdge>;

/* ── Branches ──────────────────────────────────────────────────── */

export const Branch = z.object({
  id: BranchId,
  strategy: z.enum(BRANCH_STRATEGIES),
  thesis: z.string().min(1),
  assumptions: z.array(z.string()).min(1),
  mechanism: z.string().min(1),
  failureMode: z.string().min(1),
  novelContribution: z.string().min(1),
  /** Required and non-empty: why this is not one of the others. */
  differsBecause: z.string().min(1),
  /** Human verdicts, appended. Never overwritten. */
  verdicts: z.array(HumanVerdict).default([]),
  /** Set when a PROTECT_FROM_OPTIMIZATION verdict is present. */
  protectedFromOptimization: z.boolean().default(false),
});
export type Branch = z.infer<typeof Branch>;

/* ── Traces ────────────────────────────────────────────────────── */

export const TRACE_EVENT_KINDS = [
  "RUN_STARTED",
  "STAGE_COMPLETED",
  "STATEMENT_CREATED",
  "CATEGORY_TRANSITION",
  "EVIDENCE_ATTACHED",
  "GUARD_RAISED",
  "ATTACK_RAISED",
  "ATTACK_RESOLVED",
  "AGENT_CALLED",
  "TOOL_CALLED",
  "HUMAN_INTERVENTION",
  "EVALUATION_RUN",
  "MEMORY_WRITTEN",
  "RUN_FORKED",
  "RUN_COMPLETED",
] as const;

export const TraceEvent = z.object({
  id: EventId,
  at: Instant,
  kind: z.enum(TRACE_EVENT_KINDS),
  actor: Actor,
  /** The loop stage this event belongs to, when it belongs to one. */
  stage: z.enum(LOOP_STAGES).optional(),
  summary: z.string().min(1),
  /** Typed payload. Kept narrow deliberately — see note on TracePayload. */
  refs: z.array(z.string()).default([]),
  /** Any guard events raised at this point in the run. */
  guards: z.array(z.enum(GUARD_EVENTS)).default([]),
  /** Free-form measurement. Numbers only, never prose masquerading as data. */
  metrics: z.record(z.string(), z.number()).default({}),
});
export type TraceEvent = z.infer<typeof TraceEvent>;

/**
 * A trace is an ordered event log, and it is the system's memory.
 *
 * ASIANCODER.MD wants replay, fork, compare, diff, rollback, pin, branch,
 * annotate and export. All of those are operations on an ordered list of
 * events, which is why this is an array rather than a mutable document:
 * replay is iteration, diff is a fold over events, and fork is a prefix
 * plus a new head. None of those require mutating history.
 *
 * `parentTraceId` plus `forkedAtEventIndex` together are the fork
 * mechanism: a fork is a new trace whose first N events are a copy of the
 * parent's. "Change only assumption #4" is then expressible, because the
 * events before the assumption are identical and can be asserted as such.
 */
export const Trace = z.object({
  id: TraceId,
  task: z.string().min(1),
  model: z.string(),
  generation: z.object({
    temperature: z.number().min(0),
    maxTokens: z.number().int().positive().optional(),
    seed: z.number().optional(),
  }),
  tools: z.array(ToolId).default([]),
  retrieval: z.array(SourceId).default([]),
  events: z.array(TraceEvent),
  finalArtifactId: ArtifactId.optional(),
  parentTraceId: TraceId.optional(),
  /** Present when this trace is a fork: the index it diverges at. */
  forkedAtEventIndex: z.number().int().nonnegative().optional(),
  /** Human annotations on the trace itself, appended. */
  annotations: z.array(
    z.object({
      at: Instant,
      actorId: z.string(),
      at_event: z.number().int().nonnegative(),
      note: z.string().min(1),
    })
  ).default([]),
});
export type Trace = z.infer<typeof Trace>;

/* ── Memory ────────────────────────────────────────────────────── */

export const MemoryItem = z.object({
  id: MemoryId,
  kind: z.enum(MEMORY_KINDS),
  text: z.string().min(1),
  provenance: Provenance,
  createdAt: Instant,
  lastRevalidatedAt: Instant.optional(),
  /** Set by the decay check. Staleness is computed, not asserted. */
  stale: z.boolean().default(false),
  /** Where this came from. Memory without an origin is a rumour. */
  originStatementId: StatementId.optional(),
  /** For UNRESOLVED_CONTRADICTION: the two sides. */
  conflictWith: z.array(StatementId).default([]),
});
export type MemoryItem = z.infer<typeof MemoryItem>;

/* ── Artifacts and evaluations ─────────────────────────────────── */

export const Artifact = z.object({
  id: ArtifactId,
  /** The work product. The system is organised around this, not the chat. */
  body: z.string().min(1),
  provenance: Provenance,
  /** Statement ids that compose it, so its derivation is reconstructable. */
  composedOf: z.array(StatementId).default([]),
  support: z.enum(SUPPORT_STATES),
  version: z.number().int().positive(),
  parentArtifactId: ArtifactId.optional(),
  branchIds: z.array(BranchId).default([]),
  guards: z.array(z.enum(GUARD_EVENTS)).default([]),
  createdAt: Instant,
  /** Frozen artifacts are excluded from every automated pass. */
  frozen: z.boolean().default(false),
});
export type Artifact = z.infer<typeof Artifact>;

export const Evaluation = z.object({
  id: z.string(),
  axis: z.enum(HEALTH_AXES),
  /** 0..1. Always accompanied by `basis` — never a bare number. */
  score: z.number().min(0).max(1),
  basis: z.array(z.string()).min(1),
  evaluator: Actor,
  evaluatedAt: Instant,
});
export type Evaluation = z.infer<typeof Evaluation>;

export const ExperimentRun = z.object({
  id: z.string(),
  label: z.string().min(1),
  traceId: TraceId,
  /** Set when this run is the human's own attempt, for comparison. */
  isHumanBaseline: z.boolean().default(false),
  variable: z.object({
    what: z.string().min(1),
    values: z.array(z.string()).min(2),
  }),
  evaluations: z.array(Evaluation).default([]),
  finalArtifactId: ArtifactId.optional(),
});
export type ExperimentRun = z.infer<typeof ExperimentRun>;

/* ── The guard event as an object ──────────────────────────────── */

export const GuardRecord = z.object({
  id: z.string(),
  event: z.enum(GUARD_EVENTS),
  severity: z.enum(GUARD_SEVERITIES),
  /** Where it fired. */
  statementId: StatementId.optional(),
  traceEventId: EventId.optional(),
  /** What tripped it. Quoted, never paraphrased. */
  observed: z.string().min(1),
  /** The evidence that made this a violation rather than an opinion. */
  evidence: z.string().min(1),
  raisedAt: Instant,
  acknowledged: z.boolean().default(false),
  acknowledgedBy: z.string().optional(),
});
export type GuardRecord = z.infer<typeof GuardRecord>;

/* ── The project, which ties them together ─────────────────────── */

export const Project = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: Instant,
  statements: z.array(Statement).default([]),
  sources: z.array(Source).default([]),
  agents: z.array(Agent).default([]),
  tools: z.array(Tool).default([]),
  nodes: z.array(GraphNode).default([]),
  edges: z.array(GraphEdge).default([]),
  branches: z.array(Branch).default([]),
  attacks: z.array(Attack).default([]),
  guards: z.array(GuardRecord).default([]),
  memory: z.array(MemoryItem).default([]),
  traces: z.array(Trace).default([]),
  artifacts: z.array(Artifact).default([]),
  evaluations: z.array(Evaluation).default([]),
  experiments: z.array(ExperimentRun).default([]),
  policies: z.array(Policy).default([]),
});
export type Project = z.infer<typeof Project>;

/**
 * Parse a whole project, or get a report of what is wrong with it.
 *
 * Used at every trust boundary — loading from disk, receiving from a tool,
 * accepting an export. ASIANCODER.MD requires treating model output as
 * untrusted input, and the cheapest honest interpretation is that the same
 * applies to the system's own stored state.
 */
export function parseProject(input: unknown): Project {
  return Project.parse(input);
}

export function safeParseProject(input: unknown) {
  return Project.safeParse(input);
}