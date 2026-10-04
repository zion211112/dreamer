/**
 * lib/epistemic/taxonomy.ts — THE CLOSED VOCABULARIES.
 *
 * Every categorical axis in this system is declared here, exactly once, and
 * nowhere else. This file contains no behaviour and imports nothing: it is
 * the vocabulary, and behaviour is written against it.
 *
 * Why closed vocabularies, declared centrally, are the load-bearing
 * decision of this whole design:
 *
 * ASIANCODER.MD opens with the claim that LLMs are excellent at fluent
 * output and unreliable at "category boundaries". An open vocabulary cannot
 * enforce a boundary — it can only suggest one. If "INFERENCE" and "GUESS"
 * are both strings a model may emit, nothing anywhere can notice when one
 * becomes the other. The boundary has to be a type in a union, and the union
 * has to have a fixed number of members, or the firewall is a suggestion.
 *
 * That is why every list below is a `const` tuple with a derived union type
 * rather than a hand-written union plus a hand-written array. Those drift:
 * you add a member to one, forget the other, and the check that was supposed
 * to catch the omission now passes because the omission is not in its input.
 * Deriving one from the other makes that failure impossible to express.
 *
 * These types are the domain model. They must not import React, the
 * filesystem, or anything in `components/` — ASIANCODER.MD requires the
 * domain model to stay independent of the UI, and the practical reason is
 * that a trace, a claim, or a confidence derivation must be computable in a
 * test, a CLI, or a future worker without a renderer.
 */

/* ═══════════════════════════════════════════════════════════════════
   THE EPISTEMIC FIREWALL

   Eleven categories, and the whole point is the ORDER.

   These are not a flat bag of labels. They are ranked by how much
   entitlement the statement has to be believed, and that ranking is the
   firewall: a statement may only ever move DOWN the ladder, and every
   downward move must be a recorded, inspectable transition.

   The failure mode this prevents is the single most common one in
   LLM output: "we observed X, therefore Y is true" — a category
   promotion with no work done in between. Because OBSERVATION sits at
   rank 1 and FACT at rank 0, promoting one to the other is a
   detectable, typed event rather than an invisible rhetorical move.
   ═══════════════════════════════════════════════════════════════════ */

export const STATEMENT_CATEGORIES = [
  "FACT",
  "OBSERVATION",
  "SOURCE_CLAIM",
  "INFERENCE",
  "HYPOTHESIS",
  "PREDICTION",
  "ASSUMPTION",
  "NORMATIVE_JUDGMENT",
  "DESIGN_CHOICE",
  "SPECULATION",
  "UNKNOWN",
] as const;

export type StatementCategory = (typeof STATEMENT_CATEGORIES)[number];

/**
 * Entitlement rank: how much a claim of this category is owed belief.
 *
 * Lower is stronger. FACT is 0 and UNKNOWN is 10.
 *
 * `FACT` is last, deliberately, and this ordering is the single most
 * debatable thing in the file. A FACT here means: something this system
 * verified itself, from a named evidence path, in this repository. It does
 * NOT mean "true about the world" — that is not something a TypeScript
 * program can hold, and a type named FACT that implied truth would be the
 * exact category error ASIANCODER.MD is built to prevent.
 *
 * So the strongest thing this system can say is "we checked this and it
 * held", never "this is true". The distinction is load-bearing and it is
 * why SOURCE_CLAIM sits BELOW OBSERVATION: an observation the system
 * captured itself outranks a claim some third party made, because at least
 * the observation has a capture path.
 */
export const CATEGORY_RANK: Record<StatementCategory, number> = {
  FACT: 0,
  OBSERVATION: 1,
  SOURCE_CLAIM: 2,
  INFERENCE: 3,
  HYPOTHESIS: 4,
  PREDICTION: 5,
  SPECULATION: 6,
  ASSUMPTION: 7,
  NORMATIVE_JUDGMENT: 8,
  DESIGN_CHOICE: 9,
  UNKNOWN: 10,
};

/**
 * What each category is, and the test that decides whether a sentence
 * belongs in it.
 *
 * The `test` field is the operational content. ASIANCODER.MD's first
 * anti-category-error mechanism is that "the UI must visually distinguish"
 * these — but distinguishing them in the UI is trivial and nearly useless
 * unless there is a decidable rule for putting a sentence in one. So each
 * category carries the question a reviewer must answer to justify the
 * classification, and the classifier in `classify.ts` is written against
 * these tests rather than against the labels.
 */
export const CATEGORY_RULES: Record<
  StatementCategory,
  { rank: number; test: string; entitles: string; doesNotEntitle: string }
> = {
  FACT: {
    rank: 0,
    test: "Did THIS system verify it, from a named evidence path, itself?",
    entitles: "A statement about what this system checked.",
    doesNotEntitle: "Truth about the world. 'Verified here' is not 'true'.",
  },
  OBSERVATION: {
    rank: 1,
    test: "Was this captured by a sensor, a log, or a direct reading?",
    entitles: "A statement that the measurement occurred.",
    doesNotEntitle: "Any explanation of why it occurred.",
  },
  SOURCE_CLAIM: {
    rank: 2,
    test: "Did a named third party assert this, and am I relaying it?",
    entitles: "A statement that the source said it.",
    doesNotEntitle: "The truth of the content. Relay is not endorsement.",
  },
  INFERENCE: {
    rank: 3,
    test: "Does it follow from named observations under a stated rule?",
    entitles: "A defeasible conclusion from a recorded basis.",
    doesNotEntitle: "Certainty. Inferences are revisable by construction.",
  },
  HYPOTHESIS: {
    rank: 4,
    test: "Is it a candidate explanation that has not been tested?",
    entitles: "Something to go and test.",
    doesNotEntitle: "Being the likely answer. Untested means untested.",
  },
  PREDICTION: {
    rank: 5,
    test: "Does it assert what will happen, on a stated horizon?",
    entitles: "Being checked later against what happened.",
    doesNotEntitle: "Certainty now. A prediction is a future debt.",
  },
  SPECULATION: {
    rank: 6,
    test: "Is it unconstrained reasoning with no committed basis?",
    entitles: "Being labelled as unconstrained.",
    doesNotEntitle: "Anything at all. This is the honesty bin.",
  },
  ASSUMPTION: {
    rank: 7,
    test: "Is the conclusion true only IF this holds, unverified?",
    entitles: "Naming a dependency of a conclusion.",
    doesNotEntitle: "Being quietly absorbed into the conclusion.",
  },
  NORMATIVE_JUDGMENT: {
    rank: 8,
    test: "Does it assert what SHOULD be, rather than what is?",
    entitles: "Being owned by a human. Never derivable from evidence.",
    doesNotEntitle: "Empirical support. There is no fact about ought.",
  },
  DESIGN_CHOICE: {
    rank: 9,
    test: "Did a human pick it, among options, on grounds of taste?",
    entitles: "Being attributed to a named human.",
    doesNotEntitle: "Being optimal. A choice is a preference.",
  },
  UNKNOWN: {
    rank: 10,
    test: "Is this the honest answer, or is the answer not yet established?",
    entitles: "Being rendered rather than omitted.",
    doesNotEntitle: "Anything. UNKNOWN is a valid terminal state.",
  },
};

/**
 * The semantic chain, as ASIANCODER.MD specifies it.
 *
 * OBSERVED -> INTERPRETED -> INFERRED -> HYPOTHESIZED -> TESTED -> terminal
 *
 * `CHAIN_ORDER` is the legal path. `CATEGORY_TRANSITIONS` is the mapping
 * from a chain stage to the category a statement must hold at that stage —
 * and it is deliberately not the identity function, because "you observed
 * it" and "it is a fact" are different claims at the same moment. A
 * transition that tries to move a statement to a category with a stronger
 * rank than its stage permits is a promotion, and `guard.ts` treats every
 * promotion as an event.
 */
export const CHAIN_STAGES = [
  "OBSERVED",
  "INTERPRETED",
  "INFERRED",
  "HYPOTHESIZED",
  "TESTED",
  "ACCEPTED",
  "REJECTED",
  "UNKNOWN",
] as const;

export type ChainStage = (typeof CHAIN_STAGES)[number];

export const CHAIN_ORDER: Record<ChainStage, number> = {
  OBSERVED: 0,
  INTERPRETED: 1,
  INFERRED: 2,
  HYPOTHESIZED: 3,
  TESTED: 4,
  ACCEPTED: 5,
  REJECTED: 5,
  UNKNOWN: 5,
};

/** Terminal stages have no successor. Every other stage does. */
export const TERMINAL_CHAIN_STAGES: readonly ChainStage[] = [
  "ACCEPTED",
  "REJECTED",
  "UNKNOWN",
];

/**
 * The category a statement must carry at each chain stage.
 *
 * ACCEPTED is absent on purpose. Acceptance is not an epistemic category —
 * it is a status of a hypothesis, and mapping it onto FACT is exactly the
 * "promote hypotheses to facts" operation that ASIANCODER.MD's NO HIDDEN
 * AUTHORITY section forbids. An accepted hypothesis stays a HYPOTHESIS with
 * an acceptance record attached, and the UI renders that difference.
 */
export const STAGE_CATEGORY: Record<ChainStage, StatementCategory | null> = {
  OBSERVED: "OBSERVATION",
  INTERPRETED: "INFERENCE",
  INFERRED: "INFERENCE",
  HYPOTHESIZED: "HYPOTHESIS",
  TESTED: "HYPOTHESIS",
  ACCEPTED: null,
  REJECTED: null,
  UNKNOWN: "UNKNOWN",
};

/* ═══════════════════════════════════════════════════════════════════
   THE CATEGORY GUARD

   First-class system events, not lint warnings. ASIANCODER.MD lists six
   and calls them "first-class system events", so they get a union with
   severity rather than a string in a log.

   The six named in the contract come first and are marked `contract: true`,
   because those exact six are what ASIANCODER.MD requires by name. The
   remaining twelve are the diagnostics it lists in the fluency-counter
   section, which the contract also requires — they are grouped in one
   union because a diagnostic and a guard violation have identical shape
   and identical response requirements, and splitting them would have been
   a distinction without a difference.
   ═══════════════════════════════════════════════════════════════════ */

export const GUARD_EVENTS = [
  // The six ASIANCODER.MD names explicitly.
  "CAUSALITY_OVERREACH",
  "CONSENSUS_CLAIM_UNSUPPORTED",
  "SOURCE_CLAIM_FACT_COLLAPSE",
  "ASSUMPTION_LEAKAGE",
  "CONSENSUS_AMPLIFICATION",
  "FLUENCY_EVIDENCE_GAP",

  // The diagnostics ASIANCODER.MD lists under the fluency counter.
  "UNSUPPORTED_SPECIFICITY",
  "CITATION_INFLATION",
  "CATEGORY_DRIFT",
  "PREMATURE_CONVERGENCE",
  "FALSE_CONSENSUS",
  "SCOPE_CREEP",
  "UNKNOWN_SUPPRESSION",
  "ANALOGY_SUBSTITUTION",
  "CONFIDENCE_INFLATION",
  "MEDIAN_ANSWER_COLLAPSE",
] as const;

export type GuardEvent = (typeof GUARD_EVENTS)[number];

export const GUARD_SEVERITIES = ["ADVISORY", "MATERIAL", "CRITICAL"] as const;
export type GuardSeverity = (typeof GUARD_SEVERITIES)[number];

/**
 * The six ASIANCODER.MD names explicitly.
 *
 * Declared first and marked `contract: true` below, because those exact six
 * are what the contract requires by name — which is why the one without a
 * detector is a finding and not a detail (see FLUENCY_EVIDENCE_GAP below).
 */
export const GUARD_CONTRACT_EVENTS: readonly GuardEvent[] = [
  "CAUSALITY_OVERREACH",
  "CONSENSUS_CLAIM_UNSUPPORTED",
  "SOURCE_CLAIM_FACT_COLLAPSE",
  "ASSUMPTION_LEAKAGE",
  "CONSENSUS_AMPLIFICATION",
  "FLUENCY_EVIDENCE_GAP",
];

/**
 * Whether a declared event has a detector behind it.
 *
 * This exists because the UI previously claimed "the rest are checked and
 * did not fire on this project" about a set of events where four had no
 * detector at all. A coverage claim on the panel whose job is honest
 * coverage is the single most expensive place on the site to be wrong, and
 * it was wrong in the direction of sounding thorough.
 *
 * Declared here rather than inferred, because inference would have to
 * introspect the detector set, and a typo in that introspection would
 * report coverage that does not exist. A hand-maintained flag can also be
 * wrong, but it is wrong VISIBLY, which an inferred flag is not.
 *
 * scripts/check-epistemic.mjs asserts that every event declared here as
 * detected really is reachable from guardStatement, and that every event
 * NOT so declared is one the contract named — so adding a vocabulary member
 * without a detector is a build failure, not a silent gap.
 */
export const GUARD_IMPLEMENTED: Record<GuardEvent, boolean> = {
  CAUSALITY_OVERREACH: true,
  CONSENSUS_CLAIM_UNSUPPORTED: true,
  SOURCE_CLAIM_FACT_COLLAPSE: true,
  ASSUMPTION_LEAKAGE: true,
  CONSENSUS_AMPLIFICATION: true,
  /* Declared by ASIANCODER.MD and NOT yet detected. It is a cross-document
     measurement — it needs the prose and the evidence together, which is
     what measureGap does for one artefact and what nothing yet does across
     a project. Declared unimplemented rather than quietly omitted. */
  FLUENCY_EVIDENCE_GAP: false,
  UNSUPPORTED_SPECIFICITY: true,
  CITATION_INFLATION: true,
  CATEGORY_DRIFT: true,
  /* Stage- and set-level conditions, not per-statement detectors. */
  PREMATURE_CONVERGENCE: false,
  FALSE_CONSENSUS: false,
  SCOPE_CREEP: true,
  UNKNOWN_SUPPRESSION: true,
  ANALOGY_SUBSTITUTION: true,
  CONFIDENCE_INFLATION: true,
  MEDIAN_ANSWER_COLLAPSE: false,
};

export function guardEventsImplemented(): GuardEvent[] {
  return GUARD_EVENTS.filter((e) => GUARD_IMPLEMENTED[e]);
}

export function guardEventsDeclaredOnly(): GuardEvent[] {
  return GUARD_EVENTS.filter((e) => !GUARD_IMPLEMENTED[e]);
}

/**
 * What each event means, what triggers it, and what the system is required
 * to do about it.
 *
 * `severityDefault` is a starting point, not a verdict — `guard.ts` may
 * escalate or downgrade on evidence, and it does. But an event with no
 * declared default has no floor, and a guard that can silently drop a
 * CRITICAL finding is not a guard.
 */
export const GUARD_RULES: Record<
  GuardEvent,
  {
    severityDefault: GuardSeverity;
    /** The question a reviewer must answer to justify raising this. */
    test: string;
    /** The required response. A guard that cannot be ignored is a rule. */
    response: string;
    contract: boolean;
  }
> = {
  CAUSALITY_OVERREACH: {
    severityDefault: "CRITICAL",
    test: "Does the text assert cause where the evidence path shows only co-occurrence?",
    response: "Downgrade to correlation and record the missing mechanism, or find the mechanism.",
    contract: true,
  },
  CONSENSUS_CLAIM_UNSUPPORTED: {
    severityDefault: "CRITICAL",
    test: "Does the text assert that sources agree, with no independent sources attached?",
    response: "Attach the agreeing sources, or delete the word 'agree'.",
    contract: true,
  },
  SOURCE_CLAIM_FACT_COLLAPSE: {
    severityDefault: "CRITICAL",
    test: "Is a relayed third-party assertion rendered in this system as something it verified?",
    response: "Restore the SOURCE_CLAIM category and name the originator.",
    contract: true,
  },
  ASSUMPTION_LEAKAGE: {
    severityDefault: "MATERIAL",
    test: "Does a conclusion depend on an assumption that is not carried with it?",
    response: "Attach the assumption to the claim, or weaken the claim to the assumption's support.",
    contract: true,
  },
  CONSENSUS_AMPLIFICATION: {
    severityDefault: "MATERIAL",
    test: "Do multiple agents restate one unsupported claim, inflating its apparent support?",
    response: "Deduplicate to the single origin and recount support.",
    contract: true,
  },
  FLUENCY_EVIDENCE_GAP: {
    severityDefault: "MATERIAL",
    test: "Does prose quality rise faster than the evidence supporting it?",
    response: "Reduce the register of the prose, or raise the evidence. Both are legitimate.",
    contract: true,
  },
  UNSUPPORTED_SPECIFICITY: {
    severityDefault: "MATERIAL",
    test: "Does the text carry a number, date or quantity with no evidence path behind the digit?",
    response: "Cite the figure or remove it.",
    contract: false,
  },
  CITATION_INFLATION: {
    severityDefault: "MATERIAL",
    test: "Are there more citations than distinct sources, or citations not opened?",
    response: "Deduplicate to distinct sources and verify each was read.",
    contract: false,
  },
  CATEGORY_DRIFT: {
    severityDefault: "MATERIAL",
    test: "Has the statement's category changed without a recorded transition?",
    response: "Record the transition with its reason, or restore the prior category.",
    contract: false,
  },
  PREMATURE_CONVERGENCE: {
    severityDefault: "ADVISORY",
    test: "Did synthesis begin before the alternatives were generated and compared?",
    response: "Generate the branches first. Convergence is a stage, not a shortcut.",
    contract: false,
  },
  FALSE_CONSENSUS: {
    severityDefault: "MATERIAL",
    test: "Is agreement being inferred from repetition rather than independence?",
    response: "Count independent origins, not repetitions.",
    contract: false,
  },
  SCOPE_CREEP: {
    severityDefault: "ADVISORY",
    test: "Has the claim's scope grown beyond the population its evidence covers?",
    response: "Restate the claim at the scope the evidence supports.",
    contract: false,
  },
  UNKNOWN_SUPPRESSION: {
    severityDefault: "MATERIAL",
    test: "Is an established unknown being omitted, softened or rendered as zero?",
    response: "Render the unknown. Omission is the most dangerous failure here.",
    contract: false,
  },
  ANALOGY_SUBSTITUTION: {
    severityDefault: "MATERIAL",
    test: "Is an analogy standing in for an argument that was never made?",
    response: "Make the argument, or mark it as an analogy.",
    contract: false,
  },
  CONFIDENCE_INFLATION: {
    severityDefault: "MATERIAL",
    test: "Does the stated confidence exceed what its factors justify?",
    response: "Derive the confidence from its factors. See confidence.ts.",
    contract: false,
  },
  MEDIAN_ANSWER_COLLAPSE: {
    severityDefault: "ADVISORY",
    test: "Did the branches converge on the statistically common answer?",
    response: "Generate a branch that differs in MECHANISM, not vocabulary.",
    contract: false,
  },
};

/* ═══════════════════════════════════════════════════════════════════
   FALSIFICATION STATES
   ═══════════════════════════════════════════════════════════════════ */

/**
 * ASIANCODER.MD is explicit that a claim "survives only if it survives
 * attempted falsification" and that this "does not pretend this proves
 * truth". The terminal state is UNKNOWN.
 *
 * Note there is no SUPPORTED_STRONGLY and no CONFIRMED. That absence is the
 * design: a system that can be certain has stopped testing. SUPPORTED means
 * "nothing I tried broke it", which is a statement about the search, not
 * about the world.
 */
export const SUPPORT_STATES = [
  "SUPPORTED",
  "WEAKLY_SUPPORTED",
  "CONTESTED",
  "UNTESTED",
  "REFUTED",
  "UNKNOWN",
] as const;

export type SupportState = (typeof SUPPORT_STATES)[number];

/**
 * Falsification attempts, from ASIANCODER.MD's counterexample engine.
 * Each is a different WAY a strong assertion can fail, which is why they
 * are a union rather than a free-text note: a search that only tries one of
 * these is not a search, and the union makes an incomplete search
 * representable rather than invisible.
 */
export const FALSIFICATION_MODES = [
  "COUNTEREXAMPLE",
  "BOUNDARY_CONDITION",
  "FAILURE_REGIME",
  "CONFOUNDER",
  "ALTERNATIVE_MECHANISM",
  "SELECTION_EFFECT",
  "MEASUREMENT_PROBLEM",
  "DISTRIBUTION_SHIFT",
] as const;

export type FalsificationMode = (typeof FALSIFICATION_MODES)[number];

/* ═══════════════════════════════════════════════════════════════════
   HOSTILE REVIEWERS
   ═══════════════════════════════════════════════════════════════════ */

export const REVIEWER_TYPES = [
  "DOMAIN_EXPERT",
  "STATISTICIAN",
  "SYSTEMS_ENGINEER",
  "RED_TEAM",
  "SKEPTIC",
  "OUTSIDER",
  "USER_ADVOCATE",
  "SECURITY_REVIEWER",
  "CAUSAL_INFERENCE_REVIEWER",
  "EPISTEMIC_AUDITOR",
] as const;

export type ReviewerType = (typeof REVIEWER_TYPES)[number];

/**
 * What each reviewer is FOR, and what it is structurally bad at.
 *
 * The second field is the one that matters. Ten reviewers with only
 * descriptions would be ten copies of the same critique with different
 * labels — which is precisely the CONSENSUS_AMPLIFICATION failure the
 * contract forbids, committed by the very system meant to detect it. Each
 * entry therefore declares its blind spot, so the orchestration layer can
 * refuse to treat ten agreeing reviewers as ten independent votes.
 */
export const REVIEWER_PROFILES: Record<
  ReviewerType,
  { target: string; blindSpot: string; falsifiesVia: FalsificationMode[] }
> = {
  DOMAIN_EXPERT: {
    target: "Whether the mechanism is real in this domain.",
    blindSpot: "Cannot see the case where the domain itself is the wrong frame.",
    falsifiesVia: ["ALTERNATIVE_MECHANISM", "BOUNDARY_CONDITION"],
  },
  STATISTICIAN: {
    target: "Sample, independence, measurement and the validity of the comparison.",
    blindSpot: "Will not rule on whether the question is worth asking.",
    falsifiesVia: ["SELECTION_EFFECT", "MEASUREMENT_PROBLEM", "CONFOUNDER"],
  },
  SYSTEMS_ENGINEER: {
    target: "Whether it holds under load, failure and partial states.",
    blindSpot: "Indifferent to whether it should exist.",
    falsifiesVia: ["FAILURE_REGIME", "BOUNDARY_CONDITION"],
  },
  RED_TEAM: {
    target: "The cheapest way to make this fail in production.",
    blindSpot: "Optimises for destruction; will discard a sound artifact.",
    falsifiesVia: ["FAILURE_REGIME", "ALTERNATIVE_MECHANISM"],
  },
  SKEPTIC: {
    target: "Whether the burden of proof has actually been met.",
    blindSpot: "Refuses everything, including the trivially true.",
    falsifiesVia: ["COUNTEREXAMPLE", "MEASUREMENT_PROBLEM"],
  },
  OUTSIDER: {
    target: "The assumption the whole field shares and nobody states.",
    blindSpot: "Lacks the vocabulary to be precise about what it finds.",
    falsifiesVia: ["ALTERNATIVE_MECHANISM", "DISTRIBUTION_SHIFT"],
  },
  USER_ADVOCATE: {
    target: "Whether the person forced to live with it can.",
    blindSpot: "Optimistic about adoption; ignores maintenance cost.",
    falsifiesVia: ["BOUNDARY_CONDITION", "FAILURE_REGIME"],
  },
  SECURITY_REVIEWER: {
    target: "Trust boundaries, capability escalation and exfiltration paths.",
    blindSpot: "Treats a usability problem as a security problem.",
    falsifiesVia: ["ALTERNATIVE_MECHANISM", "FAILURE_REGIME"],
  },
  CAUSAL_INFERENCE_REVIEWER: {
    target: "Direction of effect, confounding and the difference between a trend and a cause.",
    blindSpot: "Will not accept a purely descriptive finding as a result.",
    falsifiesVia: ["CONFOUNDER", "ALTERNATIVE_MECHANISM", "SELECTION_EFFECT"],
  },
  EPISTEMIC_AUDITOR: {
    target: "Whether each category is earned, and whether any unknown was suppressed.",
    blindSpot: "Does not judge the technical merit of the content.",
    falsifiesVia: ["COUNTEREXAMPLE", "SELECTION_EFFECT", "MEASUREMENT_PROBLEM"],
  },
};

/* ═══════════════════════════════════════════════════════════════════
   THE ADVERSARIAL LOOP
   ═══════════════════════════════════════════════════════════════════ */

export const LOOP_STAGES = [
  "INTUIT",
  "BOOTSTRAP",
  "ATTACK",
  "REPLACE",
  "STEELMAN",
  "INTEGRATE",
  "CONVERGE",
] as const;

export type LoopStage = (typeof LOOP_STAGES)[number];

/**
 * What each stage must PRODUCE — an artifact shape, never hidden reasoning.
 *
 * ASIANCODER.MD is unambiguous: capture structured artifacts, not internal
 * chain-of-thought. So `produces` is a contract on the output, and the type
 * system is what enforces it: a stage cannot be recorded as complete
 * without an artifact of the declared shape.
 *
 * Note ATTACK produces attacks and CONVERGE produces a change record, not a
 * verdict. CONVERGE's job is the "material-change test" — did the loop
 * actually change anything? A loop that ends unchanged is a valid result
 * and is recorded as one, because a loop that always reports convergence
 * is not measuring change.
 */
export const LOOP_STAGE_SPEC: Record<
  LoopStage,
  { produces: string; mayProceedWhen: string }
> = {
  INTUIT: {
    produces: "A one-sentence first-principles hypothesis.",
    mayProceedWhen: "The sentence names a mechanism, not a topic.",
  },
  BOOTSTRAP: {
    produces: "A minimal viable answer, cheap and unpolished.",
    mayProceedWhen: "It is complete enough to be attacked. Not complete enough to be right.",
  },
  ATTACK: {
    produces: "Named vulnerabilities, each with a target and a severity.",
    mayProceedWhen: "At least one reviewer has produced at least one attack.",
  },
  REPLACE: {
    produces: "A revised answer that answers the surviving attacks.",
    mayProceedWhen: "Every MATERIAL and CRITICAL attack has a response.",
  },
  STEELMAN: {
    produces: "The strongest objection to the revision, argued by its advocate.",
    mayProceedWhen: "The objection is one the revision cannot cheaply dismiss.",
  },
  INTEGRATE: {
    produces: "A synthesis, with an explicit list of what it dropped and why.",
    mayProceedWhen: "Every dropped objection is accounted for.",
  },
  CONVERGE: {
    produces: "A material-change record: what changed from BOOTSTRAP, and what did not.",
    mayProceedWhen: "The record states plainly whether the loop changed anything.",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   PROVENANCE — never erased
   ═══════════════════════════════════════════════════════════════════ */

export const PROVENANCE_KINDS = [
  "MODEL_GENERATED",
  "HUMAN_GENERATED",
  "HUMAN_MODIFIED",
  "JOINT",
  "UNRESOLVED",
] as const;

export type ProvenanceKind = (typeof PROVENANCE_KINDS)[number];

/**
 * ASIANCODER.MD: "Never erase provenance."
 *
 * So provenance is not a field that can be overwritten — it is an append-
 * only list, and `kind` is always DERIVED from the list. There is no code
 * path in this codebase that can set a JOINT artifact back to
 * MODEL_GENERATED, because there is no field to set. The only operation is
 * append.
 */
export const HUMAN_GATE_VERDICTS = [
  "KEEP",
  "KILL",
  "INCUBATE",
  "COMBINE",
  "DISTORT",
  "PROTECT_FROM_OPTIMIZATION",
] as const;

export type HumanGateVerdict = (typeof HUMAN_GATE_VERDICTS)[number];

export const HUMAN_GATE_RULES: Record<
  HumanGateVerdict,
  { means: string; effect: string; protected: boolean }
> = {
  KEEP: {
    means: "This is right. Carry it forward unchanged.",
    effect: "Pinned to the next synthesis input.",
    protected: false,
  },
  KILL: {
    means: "This is wrong or worthless. Do not carry it.",
    effect: "Removed from synthesis input; kept in memory as a failed idea.",
    protected: false,
  },
  INCUBATE: {
    means: "Premature. Park it with a re-review condition.",
    effect: "Held out of synthesis until the stated condition is met.",
    protected: false,
  },
  COMBINE: {
    means: "This should merge with another branch.",
    effect: "Flagged for merge; the parts are both retained until merged.",
    protected: false,
  },
  DISTORT: {
    means: "The core is worth keeping, deformed.",
    effect: "Sent back as a transform request, explicitly not a rewrite.",
    protected: false,
  },
  PROTECT_FROM_OPTIMIZATION: {
    means:
      "This looks improvable and is not. Optimising it would destroy it, and automated convergence is exactly the failure this exists to prevent.",
    effect:
      "Excluded from every automated synthesis and simplification pass, permanently, until a human releases it.",
    protected: true,
  },
};

/* ═══════════════════════════════════════════════════════════════════
   ANTI-MEDIAN BRANCHES
   ═══════════════════════════════════════════════════════════════════ */

/**
 * The five strategies ASIANCODER.MD names. These are strategies, not
 * templates: nothing in this system generates a branch from a strategy name
 * alone, and `branches.ts` measures whether a generated branch actually
 * differs on the axis its strategy claims to differ on.
 */
export const BRANCH_STRATEGIES = [
  "CONSERVATIVE",
  "INVERSION",
  "RADICAL_MECHANISM",
  "OUTSIDER_MODEL",
  "CONSTRAINT_BREAKING",
] as const;

export type BranchStrategy = (typeof BRANCH_STRATEGIES)[number];

export const BRANCH_STRATEGY_RULES: Record<
  BranchStrategy,
  { mandate: string; mustDifferOn: "MECHANISM" | "ASSUMPTION" | "CONSTRAINT" }
> = {
  CONSERVATIVE: {
    mandate: "The smallest change that could work. No new assumptions.",
    mustDifferOn: "CONSTRAINT",
  },
  INVERSION: {
    mandate: "Invert the premise. What if the obvious framing is backwards?",
    mustDifferOn: "ASSUMPTION",
  },
  RADICAL_MECHANISM: {
    mandate: "Replace the causal mechanism entirely, not its inputs.",
    mustDifferOn: "MECHANISM",
  },
  OUTSIDER_MODEL: {
    mandate: "Explain it the way a field that has never seen this problem would.",
    mustDifferOn: "MECHANISM",
  },
  CONSTRAINT_BREAKING: {
    mandate: "Remove a constraint everyone treats as fixed, then rebuild.",
    mustDifferOn: "CONSTRAINT",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   THE AGENT GRAPH
   ═══════════════════════════════════════════════════════════════════ */

export const NODE_KINDS = [
  "SOURCE",
  "RETRIEVER",
  "INTERPRETER",
  "CLASSIFIER",
  "REASONER",
  "CRITIC",
  "SIMULATOR",
  "DOMAIN_AGENT",
  "MEMORY",
  "EVALUATOR",
  "HUMAN_REVIEW",
  "DECISION",
  "OUTPUT",
] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

/**
 * Typed edge semantics. ASIANCODER.MD: "Do not use generic arrows for
 * everything." Every edge declares which of these it is.
 *
 * CONTRADICTION deserves its own edge kind because it is the one an
 * ordinary pipeline erases. Two nodes that disagree are not a data flow and
 * not a review — they are in conflict, and rendering that as an arrow loses
 * the only information that matters.
 */
export const EDGE_SEMANTICS = [
  "DATA",
  "EVIDENCE",
  "CONTROL",
  "CONTEXT",
  "UNCERTAINTY",
  "REVIEW",
  "OVERRIDE",
  "CONTRADICTION",
] as const;

export type EdgeSemantic = (typeof EDGE_SEMANTICS)[number];

export const EDGE_SEMANTIC_RULES: Record<
  EdgeSemantic,
  { carries: string; forbids: string }
> = {
  DATA: {
    carries: "A value, from producer to consumer.",
    forbids: "Carrying an entitlement. Data flow implies nothing about belief.",
  },
  EVIDENCE: {
    carries: "A source path that supports the target's category.",
    forbids: "Carrying a source without its provenance and capture time.",
  },
  CONTROL: {
    carries: "An instruction that changes what runs next.",
    forbids: "Being authored by a model without a human in the loop.",
  },
  CONTEXT: {
    carries: "Background the receiver needs. Carries no claim of truth.",
    forbids: "Being counted as support for the target.",
  },
  UNCERTAINTY: {
    carries: "Explicit doubt: a confidence, a range, or a known unknown.",
    forbids: "Being dropped in transit. Uncertainty that is not carried is lost.",
  },
  REVIEW: {
    carries: "An attack, a challenge, or a verdict about an artifact.",
    forbids: "Being an approval by default. Silence is not review.",
  },
  OVERRIDE: {
    carries: "A human decision that supersedes a machine output.",
    forbids: "Being reversible by the machine that was overridden.",
  },
  CONTRADICTION: {
    carries: "A live disagreement between two artifacts.",
    forbids: "Being resolved by deletion. A contradiction is data.",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   EPISTEMIC HEALTH — a vector, never a score
   ═══════════════════════════════════════════════════════════════════ */

/**
 * ASIANCODER.MD: "Do NOT create a simplistic overall 'AI quality score.'"
 *
 * So there are no weights and no aggregate here, and no function in this
 * codebase combines these axes into one number. The nine axes are the
 * report. Two artifacts can have the same average and be completely
 * different in kind, and an aggregate would hide exactly that.
 */
export const HEALTH_AXES = [
  "EVIDENCE",
  "CALIBRATION",
  "CATEGORY_INTEGRITY",
  "CAUSAL_INTEGRITY",
  "ADVERSARIAL_ROBUSTNESS",
  "NOVELTY",
  "DIVERSITY",
  "TRACEABILITY",
  "HUMAN_OWNERSHIP",
] as const;

export type HealthAxis = (typeof HEALTH_AXES)[number];

export const HEALTH_AXIS_RULES: Record<
  HealthAxis,
  { question: string; highMeans: string; cannotBeIncreasedBy: string }
> = {
  EVIDENCE: {
    question: "Is there an evidence path behind each consequential claim?",
    highMeans: "Consequential claims are individually backed.",
    cannotBeIncreasedBy: "More sources, if they are not independent.",
  },
  CALIBRATION: {
    question: "Does stated confidence match what the factors justify?",
    highMeans: "Confidence is earned and its errors are visible.",
    cannotBeIncreasedBy: "Hedging everywhere. Uniform doubt is not calibration.",
  },
  CATEGORY_INTEGRITY: {
    question: "Is every statement in a category it actually earns?",
    highMeans: "No promotions happened without recorded transitions.",
    cannotBeIncreasedBy: "Labelling. A label applied without a test is decoration.",
  },
  CAUSAL_INTEGRITY: {
    question: "Is cause asserted only where the evidence path supports it?",
    highMeans: "Direction of effect is earned, not narrated.",
    cannotBeIncreasedBy: "Adding mechanism words. Causal verbs are the failure.",
  },
  ADVERSARIAL_ROBUSTNESS: {
    question: "What happened when ten reviewers tried to break this?",
    highMeans: "It survived real attacks and the attacks are recorded.",
    cannotBeIncreasedBy: "Fewer reviewers, or reviewers that agree.",
  },
  NOVELTY: {
    question: "Does it contain something not already the common answer?",
    highMeans: "It contributes something that was not predicted.",
    cannotBeIncreasedBy: "Unusual vocabulary. Surprising wording is not novelty.",
  },
  DIVERSITY: {
    question: "Did the branches differ in mechanism, not phrasing?",
    highMeans: "Genuine alternatives were generated and compared.",
    cannotBeIncreasedBy: "More branches that are lexical variants of each other.",
  },
  TRACEABILITY: {
    question: "Can the derivation be reconstructed from what is stored?",
    highMeans: "Every claim has a replayable path to its inputs.",
    cannotBeIncreasedBy: "Logging more. Logs are not a derivation path.",
  },
  HUMAN_OWNERSHIP: {
    question: "Is a human the authority over the things that need one?",
    highMeans: "Values, direction and irreversible calls are human-owned.",
    cannotBeIncreasedBy: "A human clicking approve without reading. That is a rubber stamp.",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   MEMORY
   ═══════════════════════════════════════════════════════════════════ */

export const MEMORY_KINDS = [
  "FACT",
  "TASK",
  "PREFERENCE",
  "HYPOTHESIS",
  "FAILED_IDEA",
  "OPEN_QUESTION",
  "VERIFIED_KNOWLEDGE",
  "UNRESOLVED_CONTRADICTION",
] as const;

export type MemoryKind = (typeof MEMORY_KINDS)[number];

/**
 * How long a memory of each kind stays current without revalidation.
 *
 * FAILED_IDEA and UNRESOLVED_CONTRADICTION do not decay — they are not
 * facts about the world and staleness is meaningless for them. A failed idea
 * that quietly expired would be a system that forgets it was wrong, which
 * is the opposite of the point. Only the world-facing kinds have a TTL.
 */
export const MEMORY_KIND_RULES: Record<
  MemoryKind,
  { decays: boolean; revalidateAfterDays: number | null; why: string }
> = {
  FACT: {
    decays: true,
    revalidateAfterDays: 30,
    why: "The world moves and a stored fact does not move with it.",
  },
  TASK: {
    decays: true,
    revalidateAfterDays: 14,
    why: "A task's shape depends on constraints that expire.",
  },
  PREFERENCE: {
    decays: true,
    revalidateAfterDays: 180,
    why: "Human preferences drift slowly but they do drift.",
  },
  HYPOTHESIS: {
    decays: true,
    revalidateAfterDays: 30,
    why: "An untested hypothesis past its window is not pending, it is abandoned.",
  },
  FAILED_IDEA: {
    decays: false,
    revalidateAfterDays: null,
    why: "Never forget what was wrong. Staleness does not apply to a refutation.",
  },
  OPEN_QUESTION: {
    decays: false,
    revalidateAfterDays: null,
    why: "An unanswered question stays a question however long it waits.",
  },
  VERIFIED_KNOWLEDGE: {
    decays: true,
    revalidateAfterDays: 90,
    why: "Verification is a timestamp, and old verification is weaker verification.",
  },
  UNRESOLVED_CONTRADICTION: {
    decays: false,
    revalidateAfterDays: null,
    why: "A live contradiction is the most important thing not to lose.",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   CONFIDENCE
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Confidence is DERIVED. ASIANCODER.MD: "Confidence is not a free text
 * property."
 *
 * So there is no `confidence: number` anywhere in the domain model. There is
 * a list of weighted factors and a function that combines them, and the
 * factors are inspectable, individually weighted, individually signed, and
 * individually sourced. A confidence you cannot decompose is a vibe.
 */
export const CONFIDENCE_FACTORS = [
  "DIRECT_PRIMARY_SOURCE",
  "INDIRECT_EVIDENCE",
  "INDEPENDENT_CORROBORATION",
  "RECENT",
  "DIRECT_MEASUREMENT",
  "CONTRADICTED_BY_PRIMARY",
  "SINGLE_SOURCE",
  "INCOMPLETE_SAMPLE",
  "STALE",
  "UNVERIFIED",
  "UNESTABLISHED_CATEGORY",
] as const;

export type ConfidenceFactor = (typeof CONFIDENCE_FACTORS)[number];

export const CONFIDENCE_FACTOR_RULES: Record<
  ConfidenceFactor,
  { weight: number; sign: "SUPPORTS" | "UNDERMINES"; question: string }
> = {
  DIRECT_PRIMARY_SOURCE: {
    weight: 0.22,
    sign: "SUPPORTS",
    question: "Did the primary source say this directly?",
  },
  INDIRECT_EVIDENCE: {
    weight: -0.14,
    sign: "UNDERMINES",
    question: "Is this inferred rather than measured?",
  },
  INDEPENDENT_CORROBORATION: {
    weight: 0.18,
    sign: "SUPPORTS",
    question: "Does a source with its own origin agree?",
  },
  RECENT: {
    weight: 0.1,
    sign: "SUPPORTS",
    question: "Is the evidence inside its revalidation window?",
  },
  DIRECT_MEASUREMENT: {
    weight: 0.16,
    sign: "SUPPORTS",
    question: "Was it measured rather than asserted?",
  },
  CONTRADICTED_BY_PRIMARY: {
    weight: -0.3,
    sign: "UNDERMINES",
    question: "Does a primary source say otherwise?",
  },
  SINGLE_SOURCE: {
    weight: -0.12,
    sign: "UNDERMINES",
    question: "Is everything traceable to one origin?",
  },
  INCOMPLETE_SAMPLE: {
    weight: -0.16,
    sign: "UNDERMINES",
    question: "Is the population smaller than the claim's scope?",
  },
  STALE: {
    weight: -0.18,
    sign: "UNDERMINES",
    question: "Has the evidence passed its revalidation window?",
  },
  UNVERIFIED: {
    weight: -0.2,
    sign: "UNDERMINES",
    question: "Has anyone actually opened the source?",
  },
  UNESTABLISHED_CATEGORY: {
    weight: -0.24,
    sign: "UNDERMINES",
    question: "Is the statement in a category it has not earned?",
  },
};