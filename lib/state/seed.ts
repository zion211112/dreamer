/**
 * lib/state/seed.ts — THE SEEDED PROJECT.
 *
 * Every object here is built through the zod schemas, so an invalid seed
 * fails at module load rather than at the moment a component reads it. That
 * matters more than it sounds: a seed that parses is a seed that has been
 * through the same validation as anything arriving from a tool or from
 * storage, so the demo cannot show a shape the system would reject.
 *
 * ── Why this dataset and not a pretty one ───────────────────────────
 *
 * The seed is the contract's own worked example plus the failures that
 * example is designed to expose. It is NOT a success story:
 *
 *   · one claim asserts causation its evidence does not support
 *   · one inference rests on an unverified assumption it does not carry
 *   · one FACT rests on a source nobody opened
 *   · one claim repeats a consensus phrase with zero independent origins
 *   · two branches are near-restatements of each other
 *   · one human verdict protects a branch from optimisation
 *
 * A seed that made every guard pass would misrepresent the system, and a
 * reviewer who opened the demo, saw everything green, and then saw the
 * contract's example fail would conclude the guard was decorative. The
 * demo should look like the thing it is: an instrument that finds things.
 */

import {
  Attack,
  Branch,
  MemoryItem,
  Source,
  StatementId,
  Trace,
  TraceEvent,
  Claim,
  Inference,
  Hypothesis,
  Observation,
  Assumption,
  ValueJudgment,
  type Statement,
} from "@/lib/epistemic/model";

const T = "2026-10-04T09:00:00.000Z";

/**
 * When this project's guard findings were evaluated.
 *
 * Fixed rather than read from the clock, and the reason is the one that
 * matters rather than the one that is convenient: a wall-clock read at store
 * construction puts a different timestamp in the finding on the server than
 * in the browser, which breaks hydration AND makes the timestamp record
 * when the module loaded rather than when the claims were evaluated. Both
 * are worse than one exported constant.
 */
export const SEED_EVALUATED_AT = "2026-10-04T09:05:00.000Z";

const prov = (actor: "SYSTEM" | "MODEL", note?: string) => ({
  entries: [
    {
      at: T,
      actor:
        actor === "MODEL"
          ? ({ type: "MODEL" as const, capability: "DEEP_REASONING", provider: "adapter:unconfigured" })
          : ({ type: "SYSTEM" as const, component: "SEED" }),
      action: "GENERATED" as const,
      note,
    },
  ],
});

/* ── Sources ────────────────────────────────────────────────────────
   Three, deliberately sharing independence groups so the ledger can show
   that three citations are not three independent supports. That is the
   most common citation failure and it is invisible if every source in a
   demo has a unique group. */

export const SOURCES = [
  Source.parse({
    id: "src-bulletin-1" as never,
    locator: "District statistical bulletin 2026-Q3",
    originator: "District Statistics Office",
    publishedAt: T,
    opened: true,
    quality: "PRIMARY",
    independenceGroup: "district-statistics-office",
    retrievedAt: T,
  }),
  Source.parse({
    id: "src-news-1" as never,
    locator: "Regional business weekly, 12 Sept 2026",
    originator: "Regional Business Weekly",
    publishedAt: "2026-09-12T06:00:00.000Z",
    opened: true,
    quality: "SECONDARY",
    /* Same origin as the bulletin: it cites the bulletin. Two citations,
       one source. */
    independenceGroup: "district-statistics-office",
    retrievedAt: T,
  }),
  Source.parse({
    id: "src-vendor-1" as never,
    locator: "Inverter vendor bulletin, firmware 4.2 release notes",
    originator: "Vendor Technical",
    publishedAt: "2026-06-01T00:00:00.000Z",
    /* Never opened. A claim resting on this is a claim resting on nothing. */
    opened: false,
    quality: "PRIMARY",
    independenceGroup: "vendor-technical",
  }),
] as const;

/* ── Statements ─────────────────────────────────────────────────────
   The chain from ASIANCODER.MD, then the claims that break it. */

const obs = Observation.parse({
  kind: "OBSERVATION",
  id: StatementId.parse("solar-obs-1"),
  text: "Solar output fell 18% across the 30-day window.",
  category: "OBSERVATION",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  method: "Inverter telemetry, daily aggregate, site KRG-04",
  capturedBy: { type: "TOOL", toolId: "tool-telemetry" as never },
  provenance: prov("SYSTEM", "captured from the seeded telemetry store"),
  confidence: {
    factors: [
      { factor: "DIRECT_MEASUREMENT", basis: "Inverter telemetry, not a report", because: "solar-obs-1" },
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "The instrument is the source", because: "solar-obs-1" },
      { factor: "RECENT", basis: "Inside the 30-day window", because: "solar-obs-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: ["No second site has been measured in this window."],
  parentIds: [],
  createdAt: T,
});

const assumption = Assumption.parse({
  kind: "ASSUMPTION",
  id: StatementId.parse("asm-firmware"),
  text: "Assumed the 2024 inverter firmware revision is still installed on site KRG-04.",
  category: "ASSUMPTION",
  chainStage: "UNKNOWN",
  support: "UNTESTED",
  ifFalse:
    "If the firmware was replaced, the telemetry baseline is not comparable and the decline may be an artefact of a firmware change.",
  verified: false,
  provenance: prov("MODEL"),
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  createdAt: T,
});

/* The leaky inference. Its premise is the assumption above and it does not
   carry it — which is ASSUMPTION_LEAKAGE, structurally, not by matching. */
const leakyInference = Inference.parse({
  kind: "INFERENCE",
  id: StatementId.parse("solar-inf-leaky"),
  text: "Degradation is indicated by the output decline.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "WEAKLY_SUPPORTED",
  premises: [StatementId.parse("asm-firmware"), StatementId.parse("solar-obs-1")],
  rule: "abductive: an unexplained decline in a system believed healthy invites degradation",
  warrant: "ABDUCTIVE",
  provenance: prov("MODEL"),
  confidence: {
    factors: [
      { factor: "INDIRECT_EVIDENCE", basis: "No mechanism was measured", because: "solar-inf-leaky" },
      { factor: "UNVERIFIED", basis: "The firmware assumption is unchecked", because: "asm-firmware" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [StatementId.parse("asm-firmware"), StatementId.parse("solar-obs-1")],
  createdAt: T,
});

const hypothesis = Hypothesis.parse({
  kind: "HYPOTHESIS",
  id: StatementId.parse("solar-hyp-dust"),
  text: "The primary cause is dust accumulation on the array.",
  category: "HYPOTHESIS",
  chainStage: "HYPOTHESIZED",
  support: "UNTESTED",
  mechanism:
    "Dust on the glass raises cell temperature and lowers conversion efficiency at the same irradiance.",
  wouldBeSupportedBy:
    "A measured temperature rise on the affected strings that tracks the dust level.",
  wouldBeRefutedBy:
    "Cleaning the glass with no measurable change in output.",
  provenance: prov("MODEL"),
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: ["Dust level has never been measured at this site."],
  parentIds: [StatementId.parse("solar-inf-leaky")],
  createdAt: T,
});

/* ASIANCODER.MD's differential example, verbatim. */
const causalClaim = Claim.parse({
  kind: "CLAIM",
  id: StatementId.parse("demand-claim-1"),
  text: "Demand increased because of migration.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "CONTESTED",
  provenance: prov("MODEL"),
  confidence: {
    factors: [
      { factor: "INDIRECT_EVIDENCE", basis: "Migration was never measured as a driver", because: "demand-claim-1" },
      { factor: "SINGLE_SOURCE", basis: "Both citations resolve to one bulletin", because: "src-bulletin-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [StatementId.parse("pop-obs-1")],
  evidenceIds: ["ev-pop-1"],
  sourceIds: ["src-bulletin-1" as never, "src-news-1" as never],
  independentSupports: 1,
  contradicting: [],
  createdAt: T,
});

const popObservation = Observation.parse({
  kind: "OBSERVATION",
  id: StatementId.parse("pop-obs-1"),
  text: "District population increased 6.1% year on year.",
  category: "OBSERVATION",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  method: "District statistical bulletin, table 3",
  capturedBy: { type: "TOOL", toolId: "tool-bulletin" as never },
  provenance: prov("SYSTEM"),
  confidence: {
    factors: [
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "The statistics office is the source", because: "src-bulletin-1" },
      { factor: "INDEPENDENT_CORROBORATION", basis: "A second string in the array agrees", because: "src-news-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: ["The causal contribution of migration is not established."],
  parentIds: [],
  createdAt: T,
});

/* A FACT resting on a source nobody opened. SOURCE_CLAIM_FACT_COLLAPSE. */
const unopenedFact = Claim.parse({
  kind: "CLAIM",
  id: StatementId.parse("fact-unopened"),
  text: "The vendor bulletin confirms the firmware revision was not changed.",
  category: "FACT",
  chainStage: "OBSERVED",
  support: "UNTESTED",
  provenance: prov("MODEL"),
  confidence: {
    factors: [{ factor: "UNVERIFIED", basis: "The vendor bulletin was never opened", because: "src-vendor-1" }],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: [],
  sourceIds: ["src-vendor-1" as never],
  independentSupports: 0,
  contradicting: [],
  createdAt: T,
});

/* Consensus language with zero independent origins. */
const consensusClaim = Claim.parse({
  kind: "CLAIM",
  id: StatementId.parse("claim-consensus"),
  text: "Experts agree that panel cleaning has no measurable effect on output.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "CONTESTED",
  provenance: prov("MODEL"),
  confidence: { factors: [{ factor: "SINGLE_SOURCE", basis: "One bulletin, one origin", because: "src-bulletin-1" }] },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: [],
  sourceIds: ["src-bulletin-1" as never, "src-news-1" as never],
  independentSupports: 1,
  contradicting: [],
  createdAt: T,
});

/* A human's value judgment. Never derivable from evidence, and that is the
   point of it being in the seed: the system has to be able to hold a
   normative statement without trying to score it. */
const valueJudgment = ValueJudgment.parse({
  kind: "VALUE_JUDGMENT",
  id: StatementId.parse("val-reliability"),
  text: "Reliability should take priority over minimum installation cost.",
  category: "NORMATIVE_JUDGMENT",
  chainStage: "UNKNOWN",
  support: "UNKNOWN",
  heldBy: "human:facilities-owner",
  prioritises: "uptime of the generation asset",
  over: "lowest-installation-cost",
  provenance: {
    entries: [
      { at: T, actor: { type: "HUMAN" as const, actorId: "facilities-owner" }, action: "GENERATED" as const },
    ],
  },
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  createdAt: T,
});

/* A claim that correctly terminates at UNKNOWN. Present so the health
   vector and the calibration axis have a non-zero good case to point at. */
const unknownClaim = Claim.parse({
  kind: "CLAIM",
  id: StatementId.parse("claim-unknown"),
  text: "Whether migration caused the demand increase is not established.",
  category: "UNKNOWN",
  chainStage: "UNKNOWN",
  support: "UNKNOWN",
  provenance: prov("SYSTEM"),
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: ["causal contribution of migration"],
  parentIds: [StatementId.parse("demand-claim-1")],
  evidenceIds: [],
  sourceIds: [],
  independentSupports: 0,
  contradicting: [],
  createdAt: T,
});

export const STATEMENTS = [
  obs,
  popObservation,
  assumption,
  leakyInference,
  hypothesis,
  causalClaim,
  unopenedFact,
  consensusClaim,
  valueJudgment,
  unknownClaim,
] as const;

/* ── Branches ───────────────────────────────────────────────────────
   A and B are near-restatements. The diversity score is supposed to
   notice, and the BranchBoard is supposed to show it noticing. */

const branch = (
  id: string,
  strategy: "CONSERVATIVE" | "INVERSION" | "RADICAL_MECHANISM" | "OUTSIDER_MODEL" | "CONSTRAINT_BREAKING",
  thesis: string,
  mechanism: string,
  contribution: string,
  assumptions: string[]
) =>
  Branch.parse({
    id: id as never,
    strategy,
    thesis,
    assumptions,
    mechanism,
    failureMode: `fails if the mechanism is wrong, i.e. if "${mechanism.split(" ")[0]}" does not hold`,
    novelContribution: contribution,
    differsBecause: contribution,
    verdicts: [],
    protectedFromOptimization: false,
  });

export const BRANCHES = [
  branch(
    "br-degrade",
    "CONSERVATIVE",
    "The decline is degradation. Replace the affected strings.",
    "Add string-level voltage monitoring to identify which strings have degraded, then replace those strings.",
    "String-level telemetry before any replacement decision",
    ["The decline is real and not a firmware artefact", "Strings fail independently"]
  ),
  branch(
    "br-dust",
    "RADICAL_MECHANISM",
    "The decline is dust, not degradation. Clean before replacing anything.",
    "Dust on the glass raises cell temperature; cleaning reverses it without capital cost, so the replacement programme is premature.",
    "Cleaning as the instrumented first step rather than an afterthought",
    ["Dust accumulates within a term in this climate"]
  ),
  branch(
    "br-measure",
    "INVERSION",
    "The decline may be a measurement artefact rather than a physical loss.",
    "Firmware change altered the telemetry baseline, so the decline is in the instrument rather than the array. Verify the firmware revision before touching hardware.",
    "Questioning the measurement before the measurement target",
    ["The firmware revision can be verified from the device"]
  ),
] as const;

/* ── Attacks ────────────────────────────────────────────────────────
   Two reviewers, same falsification mode, on the same target. The
   agreement readout must count this as one argument, not two. */

export const ATTACKS = [
  Attack.parse({
    id: "atk-1",
    reviewerType: "STATISTICIAN",
    targetStatementId: StatementId.parse("solar-inf-leaky"),
    targetQuote: "Degradation is indicated by the output decline.",
    body: "One site and one 30-day window cannot indicate anything. n=1 with no baseline from the same firmware revision.",
    severity: "CRITICAL",
    requiredChange: "Restate at the device level, or gather a second site and a pre-change baseline.",
    mode: "SELECTION_EFFECT",
    status: "OPEN",
    raisedAt: T,
  }),
  Attack.parse({
    id: "atk-2",
    reviewerType: "SKEPTIC",
    targetStatementId: StatementId.parse("demand-claim-1"),
    targetQuote: "Demand increased because of migration.",
    body: "Population increase and demand increase are two observations. Nothing here connects them causally.",
    severity: "CRITICAL",
    requiredChange: "Restate as co-occurrence, or produce a mechanism and a design that could support the causal reading.",
    mode: "SELECTION_EFFECT",
    status: "OPEN",
    raisedAt: T,
  }),
  Attack.parse({
    id: "atk-3",
    reviewerType: "EPISTEMIC_AUDITOR",
    targetStatementId: StatementId.parse("fact-unopened"),
    targetQuote: "The vendor bulletin confirms the firmware revision was not changed.",
    body: "This is a FACT resting on a source nobody in this system has opened.",
    severity: "CRITICAL",
    requiredChange: "Open the source, or demote to SOURCE_CLAIM and name the vendor as the originator.",
    mode: "COUNTEREXAMPLE",
    status: "ADDRESSED",
    raisedAt: T,
    resolvedAt: T,
  }),
] as const;

/* ── Memory ─────────────────────────────────────────────────────────
   Includes a FAILED_IDEA that must never go stale. A system that forgets
   what it already got wrong will make the same mistake again, and the
   decay rules exist to prevent exactly that. */

export const MEMORY = [
  MemoryItem.parse({
    id: "mem-failed-dust-clean" as never,
    kind: "FAILED_IDEA",
    text: "Cleaning the array as a diagnostic step. Abandoned: it costs a crane crew and produced no measurable change in output.",
    provenance: prov("HUMAN" as never),
    createdAt: "2025-04-11T00:00:00.000Z",
    stale: false,
    conflictWith: [],
  }),
  MemoryItem.parse({
    id: "mem-fact-telemetry" as never,
    kind: "FACT",
    text: "Site KRG-04 reports string-level voltage on a 15-minute cadence.",
    provenance: prov("SYSTEM" as never),
    createdAt: "2025-11-02T00:00:00.000Z",
    lastRevalidatedAt: "2025-11-02T00:00:00.000Z",
    stale: false,
    conflictWith: [],
  }),
  MemoryItem.parse({
    id: "mem-open-baseline" as never,
    kind: "OPEN_QUESTION",
    text: "Was the firmware revision changed on KRG-04 before the measurement window opened?",
    provenance: prov("SYSTEM" as never),
    createdAt: T,
    stale: false,
    conflictWith: [StatementId.parse("asm-firmware")],
  }),
  MemoryItem.parse({
    id: "mem-hyp-dust" as never,
    kind: "HYPOTHESIS",
    text: "Dust accumulation is the primary cause of the observed decline.",
    provenance: prov("MODEL" as never),
    createdAt: T,
    originStatementId: StatementId.parse("solar-hyp-dust"),
    stale: false,
    conflictWith: [],
  }),
] as const;

/* ── A trace ────────────────────────────────────────────────────────
   Deliberately incomplete: ATTACK is entered, INTEGRATE is skipped, and
   CONVERGE is never reached. The loop summary has to show the gap, and a
   demo trace that completed all seven stages would not exercise that. */

const ev = (
  id: string,
  at: string,
  kind: TraceEvent["kind"],
  stage: TraceEvent["stage"],
  summary: string,
  refs: string[] = [],
  guards: TraceEvent["guards"] = []
): TraceEvent =>
  ({
    id: id as never,
    at,
    kind,
    actor: { type: "MODEL", capability: "DEEP_REASONING", provider: "adapter:unconfigured" },
    stage,
    summary,
    refs,
    guards,
    metrics: {},
  }) as TraceEvent;

export const TRACES = [
  Trace.parse({
    id: "trace-seed-1" as never,
    task: "Diagnose the 18% output decline at site KRG-04.",
    model: "capability:DEEP_REASONING",
    generation: { temperature: 0.7, maxTokens: 4096, seed: 41 },
    tools: ["tool-telemetry" as never],
    retrieval: ["src-bulletin-1" as never],
    events: [
      ev("ev-1", "2026-10-04T09:00:00.000Z", "RUN_STARTED", undefined, "Run opened against 4 sources."),
      ev("ev-2", "2026-10-04T09:00:02.000Z", "STAGE_COMPLETED", "INTUIT", "Intuit: the decline is a measurement artefact rather than a physical loss.", ["solar-inf-leaky"]),
      ev("ev-3", "2026-10-04T09:00:05.000Z", "STAGE_COMPLETED", "BOOTSTRAP", "Bootstrap: verify the firmware revision before touching hardware.", ["asm-firmware"]),
      ev("ev-4", "2026-10-04T09:00:07.000Z", "GUARD_RAISED", "BOOTSTRAP", "ASSUMPTION_LEAKAGE raised on the bootstrap conclusion.", ["solar-inf-leaky"], ["ASSUMPTION_LEAKAGE"]),
      ev("ev-5", "2026-10-04T09:00:11.000Z", "ATTACK_RAISED", "ATTACK", "Statistician: n=1 with no same-revision baseline.", ["atk-1"], ["CAUSALITY_OVERREACH"]),
      ev("ev-6", "2026-10-04T09:00:19.000Z", "HUMAN_INTERVENTION", "ATTACK", "Operator: the cleaning idea was already tried and abandoned.", ["mem-failed-dust-clean"]),
    ],
    annotations: [],
  }),
] as const;

export const SEED = {
  statements: STATEMENTS,
  sources: SOURCES,
  branches: BRANCHES,
  attacks: ATTACKS,
  memory: MEMORY,
  traces: TRACES,
} as const;

export function seedProject() {
  return {
    projectId: "proj-krg04",
    statements: [...STATEMENTS] as Statement[],
    sources: [...SOURCES],
  };
}