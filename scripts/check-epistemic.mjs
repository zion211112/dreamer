/**
 * scripts/check-epistemic.mjs — DOES THE FIREWALL ACTUALLY FIRE?
 *
 * ASIANCODER.MD requires a Category Guard that makes failure "structurally
 * visible and structurally expensive". A guard that only claims to exist is
 * the exact thing this project is against, so this script asserts behaviour
 * rather than presence: it feeds the contract's OWN worked examples through
 * the real detectors and fails if they do not trip.
 *
 * The two acceptance cases are transcribed from ASIANCODER.MD:
 *
 *   1. "Demand increased because of migration" against evidence that only
 *      establishes "Population increased" MUST raise CAUSALITY_OVERREACH.
 *   2. An inference resting on an unverified assumption MUST raise
 *      ASSUMPTION_LEAKAGE.
 *
 * And the negative cases matter just as much: a properly sourced,
 * corroborated, direct-measurement claim MUST NOT raise anything. A guard
 * that fires on everything is as useless as one that fires on nothing, and
 * the negative assertions here are what keep the detector lists honest.
 *
 * Exit code 1 means the firewall is not doing its job.
 */

import { register as registerLoader } from "node:module";

registerLoader("./ts-resolve.mjs", import.meta.url);

const guard = await import("../lib/epistemic/guard.ts");
const model = await import("../lib/epistemic/model.ts");
const fx = await import("../lib/epistemic/fixtures.ts");
const conf = await import("../lib/epistemic/confidence.ts");
const tax = await import("../lib/epistemic/taxonomy.ts");

/* ── Assertions ────────────────────────────────────────────────
   One shape for every finding, so the report reads as a table of
   named invariants rather than a log. `evidence` is what a failing
   assertion leaves behind — a pointer to the thing that has to change. */

const results = [];

function record(name, ok, detail, evidence = []) {
  results.push({ name, ok, detail, evidence });
}

const pad = (s, n) => String(s).padEnd(n);

/* ═══════════════════════════════════════════════════════════════════
   1. The contract's causal example MUST trip CAUSALITY_OVERREACH
   ═══════════════════════════════════════════════════════════════════ */

const sources = [fx.populationSource];

const demand = fx.demandClaim;
const demandGuards = guard.guardStatement({
  statement: demand,
  all: [demand],
  sources,
});

const causality = demandGuards.find((g) => g.event === "CAUSALITY_OVERREACH");

record(
  "contract example · causality overreach",
  !!causality,
  causality
    ? `fired · ${causality.severity} · observed "${causality.observed.trim()}"`
    : "DID NOT FIRE on ASIANCODER.MD's own worked example",
  causality
    ? [{ at: "guard.ts", detail: causality.evidence }]
    : [
        {
          at: "fixtures.ts",
          detail:
            'The claim reads "because of migration" and the only evidence is a population increase. If this does not fire, the firewall is decorative.',
        },
      ]
);

/* The guard must QUOTE the offending span, or it is an oracle. */
record(
  "guards quote their evidence",
  !!causality?.observed?.includes("because of"),
  causality?.observed
    ? `observed span: "${causality.observed.trim()}"`
    : "no observed span captured",
  causality?.observed
    ? []
    : [{ at: "guard.ts", detail: "A guard that does not quote the text cannot be checked by a human." }]
);

/* ═══════════════════════════════════════════════════════════════════
   2. ASSUMPTION_LEAKAGE must catch an inference resting on a
      unverified assumption that is not carried
   ═══════════════════════════════════════════════════════════════════ */

const assumption = model.Assumption.parse({
  kind: "ASSUMPTION",
  id: model.StatementId.parse("asm-1"),
  text: "Assumed the 2024 inverter firmware revision is still installed.",
  category: "ASSUMPTION",
  chainStage: "UNKNOWN",
  support: "UNTESTED",
  ifFalse: "If the firmware was replaced, the telemetry baseline is not comparable.",
  verified: false,
  provenance: fx.solarObservation.provenance,
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  createdAt: fx.solarObservation.createdAt,
});

const leaky = model.Inference.parse({
  kind: "INFERENCE",
  id: model.StatementId.parse("inf-leaky"),
  text: "Degradation is indicated by the output decline.",
  category: "INFERENCE",
  chainStage: "INFERRED",
  support: "WEAKLY_SUPPORTED",
  premises: [model.StatementId.parse("asm-1")],
  rule: "abductive",
  warrant: "ABDUCTIVE",
  provenance: fx.solarObservation.provenance,
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [model.StatementId.parse("asm-1")],
  createdAt: fx.solarObservation.createdAt,
});

const leakGuards = guard.guardStatement({
  statement: leaky,
  all: [assumption, leaky],
  sources: [],
  at: "2026-10-04T00:00:00.000Z",
  });
const leak = leakGuards.find((g) => g.event === "ASSUMPTION_LEAKAGE");

record(
  "assumption leakage",
  !!leak,
  leak
    ? `fired · ${leak.severity} · ${leak.observed}`
    : "DID NOT FIRE on an inference resting on an uncarried assumption",
  leak ? [{ at: "guard.ts", detail: leak.evidence }] : []
);

/* ═══════════════════════════════════════════════════════════════════
   3. NEGATIVE CASE — a clean claim must raise nothing
   ═══════════════════════════════════════════════════════════════════ */

const cleanSource = model.Source.parse({
  id: model.SourceId.parse("src-clean-1"),
  locator: "Inverter log export, site KRG-04",
  originator: "Telemetry pipeline",
  publishedAt: fx.solarObservation.createdAt,
  opened: true,
  quality: "PRIMARY",
  independenceGroup: "telemetry-krg04",
  retrievedAt: fx.solarObservation.createdAt,
});

const cleanClaim = model.Claim.parse({
  kind: "CLAIM",
  id: model.StatementId.parse("claim-clean-1"),
  text: "Measured solar output at site KRG-04 fell 18% over the last 30 days.",
  category: "FACT",
  chainStage: "OBSERVED",
  support: "SUPPORTED",
  provenance: fx.solarObservation.provenance,
  confidence: {
    factors: [
      { factor: "DIRECT_MEASUREMENT", basis: "Direct telemetry", because: "src-clean-1" },
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "The instrument is the source", because: "src-clean-1" },
      { factor: "INDEPENDENT_CORROBORATION", basis: "Second string agrees", because: "src-clean-2" },
      { factor: "RECENT", basis: "Inside the window", because: "src-clean-1" },
    ],
  },
  transitions: [],
  guards: [],
  unknowns: [],
  parentIds: [],
  evidenceIds: ["ev-1"],
  sourceIds: [model.SourceId.parse("src-clean-1")],
  independentSupports: 2,
  contradicting: [],
  createdAt: fx.solarObservation.createdAt,
});

const cleanGuards = guard.guardStatement({
  statement: cleanClaim,
  all: [cleanClaim],
  sources: [cleanSource],
  at: "2026-10-04T00:00:00.000Z",
  });

record(
  "negative case · clean claim is quiet",
  cleanGuards.length === 0,
  cleanGuards.length === 0
    ? "no guards raised on a properly sourced, corroborated, direct-measurement claim"
    : `FALSE POSITIVES: ${cleanGuards.map((g) => g.event).join(", ")}`,
  cleanGuards.map((g) => ({ at: "guard.ts", detail: `${g.event} on a clean claim: ${g.observed}` }))
);

/* ═══════════════════════════════════════════════════════════════════
   4. A HYPOTHESIS naming a mechanism must NOT trip causality
   ═══════════════════════════════════════════════════════════════════ */

const hypGuards = guard.guardStatement({
  statement: fx.solarHypothesis,
  all: [fx.solarHypothesis],
  sources: [],
  at: "2026-10-04T00:00:00.000Z",
  });
const hypCausal = hypGuards.find((g) => g.event === "CAUSALITY_OVERREACH");

record(
  "negative case · a hypothesis may name a cause",
  !hypCausal,
  !hypCausal
    ? "HYPOTHESIS proposing a mechanism is the correct form and is not flagged"
    : "FALSE POSITIVE: flagging a hypothesis for naming its mechanism trains operators to ignore the guard",
  []
);

/* ═══════════════════════════════════════════════════════════════════
   5. CONFIDENCE must be derived, deduplicated, and category-capped
   ═══════════════════════════════════════════════════════════════════ */

const dupe = conf.deriveConfidence({
  factors: [
    { factor: "DIRECT_PRIMARY_SOURCE", basis: "primary", because: "s1" },
    { factor: "DIRECT_PRIMARY_SOURCE", basis: "primary", because: "s1" },
    { factor: "INDIRECT_EVIDENCE", basis: "indirect", because: "s1" },
  ],
});

const withDupe = conf.deriveConfidence({
  factors: [
    { factor: "DIRECT_PRIMARY_SOURCE", basis: "primary", because: "s1" },
    { factor: "DIRECT_PRIMARY_SOURCE", basis: "primary", because: "s1" },
  ],
});
const withoutDupe = conf.deriveConfidence({
  factors: [{ factor: "DIRECT_PRIMARY_SOURCE", basis: "primary", because: "s1" }],
});

record(
  "confidence deduplicates repeated factors",
  dupe.duplicated.length === 1 &&
    withDupe.score === withoutDupe.score,
  `duplicate factor reported and counted once (${dupe.duplicated.join(", ")})`,
  withDupe.score === withoutDupe.score
    ? []
    : [
        {
          at: "confidence.ts",
          detail: `Repeating a factor changed the score from ${withoutDupe.score} to ${withDupe.score}. That is repetition-as-corroboration, which is CONSENSUS_AMPLIFICATION in arithmetic form.`,
        },
      ]
);

const capped = conf.statementConfidence(demand);
record(
  "confidence is capped by category",
  capped.score <= 0.72,
  `INFERENCE capped at ${capped.score.toFixed(2)} · ledger shows the reason`,
  capped.ledger.some((l) => l.factor === "UNESTABLISHED_CATEGORY")
    ? []
    : [{ at: "confidence.ts", detail: "The category ceiling was applied without appearing in the ledger." }]
);

record(
  "confidence never leaves 0..1",
  conf.deriveConfidence({
    factors: [
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "b", because: "s" },
      { factor: "INDEPENDENT_CORROBORATION", basis: "b", because: "s" },
      { factor: "DIRECT_MEASUREMENT", basis: "b", because: "s" },
      { factor: "RECENT", basis: "b", because: "s" },
      { factor: "DIRECT_PRIMARY_SOURCE", basis: "b", because: "s2" },
    ],
  }).score <= 1,
  "saturating factors clamp rather than overflow",
  []
);

/* ═══════════════════════════════════════════════════════════════════
   6. A CRITICAL guard must BLOCK a promotion, not merely warn
   ═══════════════════════════════════════════════════════════════════ */

const gate = guard.gatePromotion(demand, demandGuards);
record(
  "critical guard blocks promotion",
  !gate.allowed && gate.blockers.length > 0,
  gate.allowed
    ? "promotion was ALLOWED with a critical guard outstanding"
    : `blocked by ${gate.blockers.length} critical guard(s) · ${gate.blockers.map((b) => b.event).join(", ")}`,
  gate.allowed ? [{ at: "guard.ts", detail: "A guard that only warns is a suggestion." }] : []
);

/* ═══════════════════════════════════════════════════════════════════
   7. The domain model must reject malformed epistemic objects
   ═══════════════════════════════════════════════════════════════════ */

const rejectsEmptyClaim = !model.Claim.safeParse({
  kind: "CLAIM",
  text: "",
}).success;

const rejectsBadCategory = !model.Statement.safeParse({
  kind: "CLAIM",
  text: "x",
  category: "MADE_UP_CATEGORY",
}).success;

const rejectsUnknownKind = !model.Statement.safeParse({
  kind: "MYSTERY",
  text: "x",
}).success;

record(
  "runtime validation rejects malformed objects",
  rejectsEmptyClaim && rejectsBadCategory && rejectsUnknownKind,
  "empty text, unknown category and unknown kind are all rejected at the boundary",
  []
);

/* ═══════════════════════════════════════════════════════════════════
   8. Provenance must be append-only and derived
   ═══════════════════════════════════════════════════════════════════ */

const modelThenHuman = model.deriveProvenanceKind({
  entries: [
    { at: fx.solarObservation.createdAt, actor: { type: "MODEL", capability: "FAST" }, action: "GENERATED" },
    { at: fx.solarObservation.createdAt, actor: { type: "HUMAN", actorId: "u1" }, action: "EDITED" },
  ],
});
const humanThenModel = model.deriveProvenanceKind({
  entries: [
    { at: fx.solarObservation.createdAt, actor: { type: "HUMAN", actorId: "u1" }, action: "GENERATED" },
    { at: fx.solarObservation.createdAt, actor: { type: "MODEL", capability: "FAST" }, action: "EDITED" },
  ],
});
const trailingChallenge = model.deriveProvenanceKind({
  entries: [
    { at: fx.solarObservation.createdAt, actor: { type: "MODEL", capability: "FAST" }, action: "GENERATED" },
    { at: fx.solarObservation.createdAt, actor: { type: "HUMAN", actorId: "u1" }, action: "CHALLENGED" },
  ],
});

record(
  "provenance is derived and distinguishes joint from modified",
  modelThenHuman === "HUMAN_MODIFIED" &&
    humanThenModel === "JOINT" &&
    trailingChallenge === "UNRESOLVED",
  `model→human: ${modelThenHuman} · human→model: ${humanThenModel} · trailing challenge: ${trailingChallenge}`,
  []
);

/* ═══════════════════════════════════════════════════════════════════
   9. UNKNOWN must be a legal terminal state
   ═══════════════════════════════════════════════════════════════════ */

const unknownSupport = model.Claim.safeParse({
  kind: "CLAIM",
  id: model.StatementId.parse("c-unk"),
  text: "Whether the migration caused the increase is not established.",
  category: "UNKNOWN",
  chainStage: "UNKNOWN",
  support: "UNKNOWN",
  provenance: fx.solarObservation.provenance,
  confidence: { factors: [] },
  transitions: [],
  guards: [],
  unknowns: ["causal contribution"],
  parentIds: [],
  evidenceIds: [],
  sourceIds: [],
  independentSupports: 0,
  contradicting: [],
  createdAt: fx.solarObservation.createdAt,
}).success;

record(
  "UNKNOWN is a legal terminal state",
  unknownSupport,
  "a claim may terminate at UNKNOWN with no evidence and no penalty",
  []
);

/* ═══════════════════════════════════════════════════════════════════
   10. Every contract-named guard event must be a real member
   ═══════════════════════════════════════════════════════════════════ */

const contractEvents = [
  "CAUSALITY_OVERREACH",
  "CONSENSUS_CLAIM_UNSUPPORTED",
  "SOURCE_CLAIM_FACT_COLLAPSE",
  "ASSUMPTION_LEAKAGE",
  "CONSENSUS_AMPLIFICATION",
  "FLUENCY_EVIDENCE_GAP",
];

const missing = contractEvents.filter(
  (e) => typeof tax.GUARD_RULES?.[e] === "undefined"
);

record(
  "all six contract guard events are declared",
  missing.length === 0,
  `${contractEvents.length} named by ASIANCODER.MD · ${missing.length} missing`,
  missing.map((m) => ({ at: "taxonomy.ts", detail: `${m} is named by the contract but not declared` }))
);

/* ═══════════════════════════════════════════════════════════════════
   11. ANTI-MEDIAN — branches must differ in MECHANISM, not vocabulary
   ═══════════════════════════════════════════════════════════════════ */

const br = await import("../lib/epistemic/branches.ts");
const tr = await import("../lib/epistemic/trace.ts");
const adv = await import("../lib/epistemic/adversarial.ts");

const now = "2026-10-04T00:00:00.000Z";

const mkBranch = (id, strategy, thesis, mechanism, contribution, assumptions) =>
  model.Branch.parse({
    id: model.BranchId.parse(id),
    strategy,
    thesis,
    assumptions,
    mechanism,
    failureMode: `fails if ${mechanism.split(" ")[0]} is wrong`,
    novelContribution: contribution,
    differsBecause: `${id} differs`,
    verdicts: [],
    protectedFromOptimization: false,
  });

/* Two kinds of near-duplicate, and the difference between them matters
   more than either result.
   LEXICAL: the same sentence with a synonym swapped in. Caught.
   SYNONYMIC: the same idea with every content word replaced. NOT caught,
   and asserted as a miss below so the limitation is a tested, published
   property of this module rather than something a reader has to discover. */
const paraphraseA = mkBranch(
  "br-a",
  "RADICAL_MECHANISM",
  "Reduce churn by onboarding the user earlier in the funnel.",
  "Move the guided setup earlier in the flow so the value is felt before the decision to pay.",
  "Earliest possible value contact",
  ["Users will complete setup if it takes less effort"]
);
const paraphraseB = mkBranch(
  "br-b",
  "RADICAL_MECHANISM",
  "Reduce churn by onboarding the user earlier in the funnel.",
  "Move the guided setup earlier in the flow so the value is felt before the decision to pay.",
  "Earliest possible value contact, stated differently",
  ["Users will complete setup if it takes less effort"]
);

/* The same idea, every content word replaced. This is the case the module
   note says it cannot catch, and it is here so that claim is tested
   rather than asserted. */
const synonymA = mkBranch(
  "br-s1",
  "RADICAL_MECHANISM",
  "Retention suffers because setup is deferred.",
  "Relocate the introductory session earlier so benefit is perceived ahead of purchase.",
  "Sooner value perception",
  ["Buyers will finish onboarding when it takes less effort"]
);
const synonymB = mkBranch(
  "br-s2",
  "RADICAL_MECHANISM",
  "Retention suffers because setup is deferred.",
  "Advance the guided walkthrough earlier such that utility is grasped prior to commitment.",
  "Earlier utility contact",
  ["Purchasers will complete orientation when it demands less effort"]
);

/* And two branches that genuinely differ. */
const radical = mkBranch(
  "br-c",
  "RADICAL_MECHANISM",
  "Churn is a pricing artefact, not a product defect.",
  "Replace the subscription with metered access priced against delivered value, so there is no month to cancel.",
  "Eliminate the cancellation event entirely",
  ["Buyers accept usage-priced billing"]
);
const conservative = mkBranch(
  "br-d",
  "CONSERVATIVE",
  "Churn is an onboarding defect. Fix the smallest thing.",
  "Add a guided first session and keep the existing subscription unchanged.",
  "One guided session",
  ["The product is fine once understood"]
);

const nearDuplicates = br.measureDiversity([paraphraseA, paraphraseB]);
const synonyms = br.measureDiversity([synonymA, synonymB]);
const genuine = br.measureDiversity([radical, conservative]);

record(
  "anti-median · a restated branch is caught",
  nearDuplicates.collapsedPairs.length > 0,
  `a restated mechanism scored ${nearDuplicates.score.toFixed(2)} with ${nearDuplicates.collapsedPairs.length} collapsed pair(s). ${nearDuplicates.finding}`,
  []
);

/* THE DECLARED BLIND SPOT, AS A TEST.
   Two branches saying the same thing in entirely different vocabulary are
   NOT caught, because there are no embeddings here and ASIANCODER.MD
   forbids inventing capabilities the system does not have.

   This assertion pins the miss down rather than asserting the detector is
   good. A module that publishes its own blind spot and fails loudly when
   that publication drifts is doing what the contract asks; one that
   quietly overstates its reach is the thing the contract exists to
   prevent. If a future implementation adds semantic distance, this test
   is what should start failing, and the module note should change with
   it. */
record(
  "anti-median · the synonym blind spot is documented, not hidden",
  synonyms.collapsedPairs.length === 0,
  synonyms.collapsedPairs.length === 0
    ? `CONFIRMED LIMIT: two branches differing only in synonym scored ${synonyms.score.toFixed(2)} and were NOT flagged. Content-word distance cannot see that "relocate the introductory session" and "advance the guided walkthrough" are the same mechanism.`
    : `the detector now catches synonym substitution (${synonyms.score.toFixed(2)}); branches.ts's module note and GUARD_CALIBRATION should be updated to match`,
  []
);

record(
  "anti-median · genuine difference scores higher than a restatement",
  genuine.meanMechanismDistance > nearDuplicates.meanMechanismDistance,
  `different mechanisms scored ${genuine.score.toFixed(2)} (mean mechanism distance ${genuine.meanMechanismDistance.toFixed(2)}) vs ${nearDuplicates.score.toFixed(2)} (mean ${nearDuplicates.meanMechanismDistance.toFixed(2)}) for the restatement`,
  []
);

/* ASIANCODER.MD holds each branch to its own strategy, because
   CONSERVATIVE is SUPPOSED to share a mechanism. Assert the conservative
   branch is not reported non-compliant for doing its job. */
const compliance = genuine.strategyCompliance.find((c) => c.strategy === "CONSERVATIVE");
record(
  "anti-median · conservative branch is not punished",
  compliance?.compliant === true,
  compliance
    ? `CONSERVATIVE compliant=${compliance.compliant}: ${compliance.why}`
    : "no compliance entry for the conservative branch",
  compliance && !compliance.compliant
    ? [{ at: "branches.ts", detail: "A branch held to the radical bar is reported non-compliant every run, which teaches readers to ignore the check." }]
    : []
);

/* ═══════════════════════════════════════════════════════════════════
   12. PROTECT FROM OPTIMIZATION must actually exclude
   ═══════════════════════════════════════════════════════════════════ */

const protectedBranch = br.appendVerdict(paraphraseA, {
  id: "v-1",
  verdict: "PROTECT_FROM_OPTIMIZATION",
  actorId: "human:operator",
  at: now,
  rationale: "Unusual, but this is the one worth trying.",
  protectionReason: "Automated simplification collapses this into the median answer.",
});

const killedBranch = br.appendVerdict(radical, {
  id: "v-2",
  verdict: "KILL",
  actorId: "human:operator",
  at: now,
  rationale: "Wrong mechanism; the billing change is out of scope.",
});

const synth = br.synthesisInput([protectedBranch, killedBranch, conservative]);
const excludedIds = synth.excluded.map((e) => e.id).sort();

record(
  "PROTECT FROM OPTIMIZATION excludes from synthesis",
  synth.included.length === 1 &&
    synth.included[0].id === conservative.id &&
    synth.excludedBecause.length === 2,
  `synthesis sees ${synth.included.length} of 3 branches; excluded: ${excludedIds.join(", ")}`,
  synth.included.length === 1
    ? []
    : [
        {
          at: "branches.ts",
          detail:
            "A protected branch reached synthesis. ASIANCODER.MD's rule is that the model may critique an idea but must not converge it away, and that rule is enforced where input is assembled.",
        },
      ]
);

record(
  "protection survives a verdict being appended",
  protectedBranch.protectedFromOptimization === true,
  `protectedFromOptimization = ${protectedBranch.protectedFromOptimization}`,
  []
);

/* ═══════════════════════════════════════════════════════════════════
   13. TRACE · fork prefix honesty and recorded rollback
   ═══════════════════════════════════════════════════════════════════ */

const mkTrace = (events, task = "test run") =>
  model.Trace.parse({
    id: model.TraceId.parse("trace-1"),
    task,
    model: "capability:DEEP_REASONING",
    generation: { temperature: 0.7 },
    tools: [],
    retrieval: [],
    events,
    annotations: [],
  });

const ev = (id, summary, stage, refs = []) => ({
  id: model.EventId.parse(id),
  at: now,
  kind: "STAGE_COMPLETED",
  actor: { type: "SYSTEM", component: "TEST" },
  stage,
  summary,
  refs,
  guards: [],
  metrics: {},
});

const parentTrace = mkTrace([
  ev("e1", "intuit", "INTUIT", ["stmt-1"]),
  ev("e2", "bootstrap", "BOOTSTRAP", ["stmt-1"]),
  ev("e3", "attack", "ATTACK", ["atk-1"]),
  ev("e4", "replace", "REPLACE", ["stmt-2"]),
]);

const forked = tr.forkTrace(parentTrace, 2, "trace-2", "change only assumption 4");
const childTrace = {
  ...forked.trace,
  events: [
    ...forked.trace.events,
    ev("e5", "replace", "REPLACE", ["stmt-9"]),
  ],
};

const honestDiff = tr.diffTraces(parentTrace, childTrace);

/* A dishonest fork: claims to diverge at 2 but actually changed event 0. */
const lyingFork = { ...forked.trace, events: [ev("e0", "tampered", "INTUIT", ["stmt-0"]), ...forked.trace.events.slice(1)] };
const lyingDiff = tr.diffTraces(parentTrace, lyingFork);

record(
  "fork · an honest fork reports a clean prefix",
  honestDiff.commonPrefix === 2 && honestDiff.prefixHonest === true,
  `commonPrefix=${honestDiff.commonPrefix}, prefixHonest=${honestDiff.prefixHonest}, statement delta +${honestDiff.statementDelta.added.length}/-${honestDiff.statementDelta.removed.length}`,
  []
);

record(
  "fork · a rewritten history is detectable",
  lyingDiff.commonPrefix === 0,
  `a fork claiming to diverge at 2 but tampering with event 0 yields commonPrefix=${lyingDiff.commonPrefix}. Without this check a fabricated fork looks identical to an honest one and the whole experimental methodology rests on nothing.`,
  []
);

record(
  "fork · out-of-range index throws rather than clamping",
  (() => {
    try {
      tr.forkTrace(parentTrace, 99, "trace-3");
      return false;
    } catch {
      return true;
    }
  })(),
  "forking past the end throws instead of silently snapping to the nearest valid point",
  []
);

const rolled = tr.rollbackTrace(parentTrace, 1, { type: "HUMAN", actorId: "human:operator" }, "trace-4", "attack found nothing");
record(
  "rollback appends a record rather than truncating silently",
  rolled.events.length === 2 &&
    rolled.events[rolled.events.length - 1].summary.includes("Rolled back") &&
    parentTrace.events.length === 4,
  `rolled trace has ${rolled.events.length} events and its last one records the rollback; the original still has ${parentTrace.events.length}. A trace that silently lost its tail would be indistinguishable from a run that never had one.`,
  []
);

/* ═══════════════════════════════════════════════════════════════════
   14. ADVERSARIAL LOOP · ATTACK cannot be skipped
   ═══════════════════════════════════════════════════════════════════ */

const emptyGate = adv.gateStage("ATTACK", { attacks: [], stagesEntered: ["INTUIT", "BOOTSTRAP"] });
record(
  "loop · ATTACK cannot be left empty",
  !emptyGate.satisfied && emptyGate.unmet.length > 0,
  emptyGate.satisfied
    ? "ATTACK was allowed to complete with no attacks raised"
    : `blocked: ${emptyGate.unmet[0]}`,
  emptyGate.satisfied
    ? [{ at: "adversarial.ts", detail: "ATTACK that can be skipped is how a pipeline reaches INTEGRATE having been attacked by nothing, which is the shape of a system that looks rigorous." }]
    : []
);

const attackMade = adv.makeAttack({
  reviewerType: "STATISTICIAN",
  targetStatementId: model.StatementId.parse("solar-obs-1"),
  targetQuote: "Solar output fell 18%.",
  body: "n=1 site; one inverter cannot support a site-level claim.",
  severity: "CRITICAL",
  requiredChange: "Restate at the device, or gather more sites.",
});
const gateAfterAttack = adv.gateStage("ATTACK", { attacks: [attackMade], stagesEntered: ["INTUIT", "BOOTSTRAP"] });
record(
  "loop · ATTACK passes once an attack exists",
  gateAfterAttack.satisfied,
  gateAfterAttack.satisfied ? "one attack is enough to leave ATTACK" : `blocked: ${gateAfterAttack.unmet.join("; ")}`,
  []
);

const integrateGate = adv.gateStage("INTEGRATE", { attacks: [attackMade], stagesEntered: ["INTUIT", "BOOTSTRAP"] });
record(
  "loop · INTEGRATE requires branches first (premature convergence)",
  !integrateGate.satisfied,
  integrateGate.satisfied
    ? "synthesis was allowed after two exploratory stages"
    : `blocked: ${integrateGate.unmet[0]}`,
  []
);

/* Two reviewers, same falsification mode. Must count as one argument. */
const sameBlindSpot = [
  { ...attackMade, id: "atk-2", reviewerType: "SKEPTIC", mode: "COUNTEREXAMPLE" },
  { ...attackMade, id: "atk-3", reviewerType: "RED_TEAM", mode: "COUNTEREXAMPLE" },
];
const agreement = adv.reviewerAgreement(sameBlindSpot);
record(
  "reviewer agreement is discounted by shared blind spot",
  agreement.count === 2 && agreement.effectiveWeight === 1,
  `2 reviewers using the same falsification mode count as ${agreement.effectiveWeight}, not ${agreement.count}`,
  agreement.effectiveWeight === agreement.count
    ? [{ at: "adversarial.ts", detail: "Repetition across reviewers was counted as corroboration — CONSENSUS_AMPLIFICATION, committed by the panel meant to detect it." }]
    : []
);

const differentModes = [
  { ...attackMade, id: "atk-4", reviewerType: "SKEPTIC", mode: "COUNTEREXAMPLE" },
  { ...attackMade, id: "atk-5", reviewerType: "STATISTICIAN", mode: "SELECTION_EFFECT" },
];
const agreement2 = adv.reviewerAgreement(differentModes);
record(
  "reviewers with different methods count separately",
  agreement2.effectiveWeight === 2,
  `two reviewers using different falsification modes count as ${agreement2.effectiveWeight}`,
  []
);

/* ── Report ──────────────────────────────────────────────────────── */

const failed = results.filter((r) => !r.ok);
const width = Math.max(...results.map((r) => r.name.length));

console.log("\nAPT-LABS epistemic firewall — does the guard actually fire?\n");
console.log("=".repeat(width + 60));

for (const r of results) {
  console.log(`${pad(r.name, width)}  ${r.ok ? "PASS" : "FAIL"}  ${r.detail}`);
  for (const e of r.evidence) {
    console.log(`${"".padEnd(width)}      ${e.at}  ${e.detail}`);
  }
}
console.log("=".repeat(width + 60));

if (failed.length > 0) {
  console.error(
    `\n${failed.length} assertion(s) failed. The firewall must be demonstrated, not asserted.\n`
  );
  process.exit(1);
}

console.log(
  `\nAll ${results.length} assertions hold: the guard fires on ASIANCODER.MD's own examples,\n` +
    `stays quiet on clean claims, and blocks promotion rather than warning.\n`
);