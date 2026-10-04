/**
 * lib/epistemic/guard.ts — THE CATEGORY GUARD.
 *
 * ASIANCODER.MD: "These are first-class system events." So this is not a
 * lint pass and not a warning list. Every function here returns
 * `GuardRecord[]`, which is a union member of the domain model, and a
 * CRITICAL record is a thing that can block a transition rather than a
 * thing that gets logged.
 *
 * The detection is genuinely computed, not simulated. There are two kinds
 * of detector and the distinction matters:
 *
 *   LEXICAL detectors look at the words a statement uses. Causal verbs,
 *   consensus language, digits with no citation. This is the only way to
 *   catch CAUSALITY_OVERREACH reliably, because the error IS in the verb.
 *   The limits are stated in CALIBRATION below and are not hidden.
 *
 *   STRUCTURAL detectors read the graph, not the sentence. An assumption
 *   that is a premise of a conclusion which does not carry it; two agents
 *   restating one claim; a synthesis performed before branches existed.
 *   These are exact, because the type system has made them representable.
 *
 * WHY LEXICAL DETECTION IS HONEST HERE BUT WOULD NOT BE IN A CHATBOT
 * --------------------------------------------------------------
 * A word list is a heuristic, and in a chat product you would hide the
 * heuristic and show a verdict. Here the opposite is required, so every
 * lexical match carries its matched span as evidence, and the UI is
 * expected to render the quote. A guard that says "causality overreach"
 * without showing the words it caught is an oracle, and oracles are the
 * thing this system exists to replace.
 *
 * The word lists are therefore kept SMALL and HIGH-PRECISION on purpose.
 * A broad list would fire constantly and the operator would learn to
 * ignore it, and a guard that is habitually ignored is worse than no guard
 * because it manufactures false confidence — the exact failure the whole
 * project is against. Precision over recall, deliberately.
 */

import type {
  ClaimT,
  GuardRecord,
  MemoryItem,
  Source,
  Statement,
  StatementId,
} from "./model";
import {
  CATEGORY_RANK,
  GUARD_CONTRACT_EVENTS,
  GUARD_RULES,
  type GuardEvent,
  type GuardSeverity,
} from "./taxonomy";
import { deriveConfidence } from "./confidence";

/* ── Lexical detectors ─────────────────────────────────────────────
   Kept deliberately narrow. Every entry is a phrase whose presence is
   itself the problem, not a word whose presence is merely suspicious. */

const CAUSAL_VERBS = [
  "caused",
  "causes",
  "causing",
  "led to",
  "leads to",
  "resulted in",
  "results in",
  "due to",
  "because of",
  "responsible for",
  "drives",
  "driven by",
  "produces",
  "gave rise to",
  "is the cause",
  "causal",
];

/* Correlation language is not a violation — it is the correct thing to say.
   It is here so CAUSALITY_OVERREACH can quote what the evidence actually
   supports alongside what the text actually claims. */
const CORRELATION_LANGUAGE = [
  "correlat",
  "associated with",
  "co-occur",
  "alongside",
  "together with",
  "covaries",
];

const CONSENSUS_LANGUAGE = [
  "experts agree",
  "experts say",
  "consensus",
  "widely accepted",
  "generally agreed",
  "it is well known",
  "it's well known",
  "common knowledge",
  "studies show",
  "research shows",
  "everyone knows",
  "standard practice",
  "best practice",
];

/* Words that promise a mechanism without supplying one. */
const ANALOGY_MARKERS = [
  "like a",
  "as if",
  "much like",
  "similar to a",
  "think of it as",
  "akin to",
  "just as a",
];

const SPECIFICITY_PATTERN =
  /\b\d[\d,.]*\s*(%|percent|x|×|ms|s\b|seconds?|minutes?|hours?|days?|weeks?|months?|years?|[kmg]b\b|[kmg]b\b)/i;

/* ── Construction ───────────────────────────────────────────────── */

let counter = 0;
function rec(
  event: GuardEvent,
  severity: GuardSeverity | undefined,
  observed: string,
  evidence: string,
  statementId?: StatementId,
): GuardRecord {
  counter += 1;
  return {
    id: `guard-${counter}`,
    event,
    severity: severity ?? GUARD_RULES[event].severityDefault,
    statementId,
    observed,
    evidence,
    raisedAt: new Date().toISOString(),
    acknowledged: false,
  };
}

/* ── Narrowing ──────────────────────────────────────────────────
   Source backing lives on Claim and NOWHERE ELSE in the union.

   That is not an accident of the schema. An Observation has a METHOD, a
   Hypothesis has a MECHANISM, an Assumption has `ifFalse`, and none of
   them has a citation list — so a hypothesis cannot structurally present
   itself as sourced, and every detector below that needs `sourceIds` has
   to narrow first. The compiler is enforcing the boundary the contract
   asks for, rather than the checker discovering it at runtime. */

function asClaim(s: Statement): ClaimT | null {
  return s.kind === "CLAIM" ? s : null;
}

function firstMatch(text: string, phrases: readonly string[]): string | null {
  const lower = text.toLowerCase();
  for (const p of phrases) {
    const i = lower.indexOf(p);
    if (i >= 0) return text.slice(Math.max(0, i - 30), i + p.length + 30);
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   THE SIX CONTRACT GUARDS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * CAUSALITY_OVERREACH.
 *
 * Fires when the text asserts cause and the epistemic state does not
 * support it. The two halves are both necessary:
 *
 *   · the TEXT claims causation, AND
 *   · the claim is not a HYPOTHESIS (a hypothesis proposing a cause is the
 *     correct way to talk about a mechanism you have not established), AND
 *   · there is no MECHANISM-level backing — measured support, or a
 *     corroborated independent origin.
 *
 * Without the second condition this would fire on every hypothesis in the
 * system, and a guard that fires on correct behaviour trains people to
 * ignore it.
 */
export function detectCausalityOverreach(s: Statement): GuardRecord[] {
  const causal = firstMatch(s.text, CAUSAL_VERBS);
  if (!causal) return [];

  /* A hypothesis naming a mechanism is the honest form of a causal claim. */
  if (s.kind === "HYPOTHESIS") return [];
  if (s.category === "HYPOTHESIS") return [];

  /* Direct measurement or two independent origins earns causal language. */
  const conf = deriveConfidence(s.confidence);
  const measured = conf.factors.includes("DIRECT_MEASUREMENT");
  const corroborated = conf.factors.includes("INDEPENDENT_CORROBORATION");
  const direct = conf.factors.includes("DIRECT_PRIMARY_SOURCE");

  if (measured && (corroborated || direct) && s.support === "SUPPORTED") return [];

  const whatEvidenceSays = firstMatch(s.text, CORRELATION_LANGUAGE);
  const evidence = whatEvidenceSays
    ? `Text asserts causation; the only correlation language present is "${whatEvidenceSays.trim()}".`
    : `Text asserts causation with no correlation or mechanism language to support it. Support is ${s.support}, category is ${s.category}.`;

  return [
    rec(
      "CAUSALITY_OVERREACH",
      undefined,
      causal.trim(),
      evidence,
      s.id
    ),
  ];
}

/**
 * CONSENSUS_CLAIM_UNSUPPORTED.
 *
 * Fires on consensus language when the independent-origin count does not
 * justify it. This is the guard against the most fluent and most empty
 * sentence a model produces: "experts agree that X" with two citations
 * that are both the same study, or both quote the same source.
 *
 * Independence is counted by INDEPENDENCE GROUP, not by citation count.
 * Two sources sharing an independence group are one source cited twice,
 * and treating them as corroboration is the entire failure being guarded.
 */
export function detectConsensusClaimUnsupported(
  s: Statement,
  sources: readonly Source[]
): GuardRecord[] {
  const match = firstMatch(s.text, CONSENSUS_LANGUAGE);
  if (!match) return [];

  /* Consensus language is asserted about evidence, so only a Claim can
     carry evidence — and a Hypothesis that says "experts agree" cannot even
     record who they were, which is the point. */
  const claim = asClaim(s);
  const sourceIds = claim?.sourceIds ?? [];

  const groups = new Set(
    sourceIds
      .map((id) => sources.find((src) => src.id === id)?.independenceGroup)
      .filter((g): g is string => typeof g === "string")
  );
  const independent = groups.size;

  if ((claim?.independentSupports ?? 0) >= 2 && independent >= 2) return [];

  const evidence =
    independent === 0
      ? `Consensus language with ${sourceIds.length} citation(s) resolving to 0 distinct independence groups.`
      : `Consensus language with ${independent} distinct independence group(s); the claim asserts agreement, which needs at least 2.`;

  return [rec("CONSENSUS_CLAIM_UNSUPPORTED", undefined, match.trim(), evidence, s.id)];
}

/**
 * SOURCE_CLAIM_FACT_COLLAPSE.
 *
 * Fires when a relayed third-party assertion is presented as something
 * this system verified. Two ways that happens, both checked:
 *
 *   1. The statement is a FACT but its sources are unopened. Nobody read
 *      the paper, yet the row says the paper says it.
 *   2. The statement is a FACT or OBSERVATION but it is a relay — it has
 *      parents and no capture of its own. "Our source says X" rendered as
 *      "X", where nothing observed X.
 *
 * The second is the one that actually happens, and it is invisible to
 * anyone reading the sentence, because the sentence looks fine.
 */
export function detectSourceClaimFactCollapse(
  s: Statement,
  sources: readonly Source[]
): GuardRecord[] {
  if (s.category !== "FACT" && s.category !== "OBSERVATION") return [];

  const claim = asClaim(s);
  const sourceIds = claim?.sourceIds ?? [];
  const out: GuardRecord[] = [];

  const unopened = sourceIds.filter((id) => {
    const src = sources.find((x) => x.id === id);
    return src && !src.opened;
  });
  if (unopened.length > 0) {
    out.push(
      rec(
        "SOURCE_CLAIM_FACT_COLLAPSE",
        undefined,
        `${s.category} resting on ${unopened.length} unopened source(s)`,
        `Source ids ${unopened.join(", ")} are recorded as FACT support but have not been opened by anyone in this system.`,
        s.id
      )
    );
  }

  const isRelay = s.kind !== "OBSERVATION" && s.parentIds.length > 0;
  const hasOwnCapture = s.kind === "OBSERVATION";
  if (isRelay && !hasOwnCapture && sourceIds.length > 0) {
    out.push(
      rec(
        "SOURCE_CLAIM_FACT_COLLAPSE",
        undefined,
        `${s.category} with no capture of its own, derived from ${s.parentIds.length} parent(s)`,
        `A relayed statement cannot be a FACT: this system did not observe it. It is SOURCE_CLAIM at best. Parents: ${s.parentIds.join(", ")}.`,
        s.id
      )
    );
  }

  return out;
}

/**
 * ASSUMPTION_LEAKAGE.
 *
 * An inference names its premises. If one of those premises is an
 * ASSUMPTION, and the inference does not carry it into its own unknowns,
 * then the assumption has entered the conclusion silently.
 *
 * This is purely structural and therefore exact. It is also the single
 * most common real-world error in analytical work, and it is invisible to
 * the person making it, because nothing about the conclusion looks wrong.
 */
export function detectAssumptionLeakage(
  s: Statement,
  byId: ReadonlyMap<string, Statement>
): GuardRecord[] {
  if (s.kind !== "INFERENCE" && s.kind !== "CLAIM") return [];

  const premiseAssumptions = s.parentIds
    .map((id) => byId.get(id))
    .filter((p): p is Statement => !!p && p.kind === "ASSUMPTION");

  if (premiseAssumptions.length === 0) return [];

  /* Carried if it is listed as a known unknown, or if the claim already
     sits in a category weak enough to admit it. */
  const carriedText = [...s.unknowns, s.text].join(" ").toLowerCase();
  const uncarried = premiseAssumptions.filter(
    (a) => !carriedText.includes(a.text.slice(0, 40).toLowerCase())
  );

  if (uncarried.length === 0) return [];

  return [
    rec(
      "ASSUMPTION_LEAKAGE",
      undefined,
      `${uncarried.length} unverified assumption(s) inside the premises`,
      `Premises include ${uncarried.map((a) => `"${a.text}"`).join("; ")}, and none is carried into this statement's unknowns. The conclusion holds only if these do, and the reader cannot see that.`,
      s.id
    ),
  ];
}

/**
 * CONSENSUS_AMPLIFICATION.
 *
 * Multiple agents restating one unsupported claim inflates its apparent
 * support. The count must be of DISTINCT ORIGINS, not statements, and the
 * confidence derivation in confidence.ts deliberately deduplicates for the
 * same reason. Here we also count provenance: if three agents produced the
 * same text, that is one claim stated three times.
 *
 * ASIANCODER.MD asks "can agents converge on the same mediocre idea?"
 * This is where that becomes a measurable finding rather than a worry.
 */
export function detectConsensusAmplification(
  s: Statement,
  siblings: readonly Statement[]
): GuardRecord[] {
  if (s.category === "FACT") return [];

  const sameText = siblings.filter(
    (x) => x.text.trim().toLowerCase() === s.text.trim().toLowerCase()
  );
  if (sameText.length < 2) return [];

  const producers = new Set(
    sameText.map((x) => x.provenance.entries[0]?.actor.type ?? "UNKNOWN")
  );
  /* Two or more distinct producers is where it stops being one agent
     repeating itself and becomes apparent agreement between parties. */
  if (producers.size < 2) return [];

  const conf = deriveConfidence(s.confidence);
  const corroborated = conf.factors.includes("INDEPENDENT_CORROBORATION");

  if (corroborated) return [];

  return [
    rec(
      "CONSENSUS_AMPLIFICATION",
      undefined,
      `${sameText.length} statements share this text, from ${producers.size} distinct producer types`,
      `The claim reads as widely held because ${sameText.length} agents stated it, but its confidence carries no INDEPENDENT_CORROBORATION factor. Repetition across agents is not corroboration.`,
      s.id
    ),
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   THE TWELVE DIAGNOSTICS
   ═══════════════════════════════════════════════════════════════════ */

/** A digit with a unit and no source is unsupported specificity. */
export function detectUnsupportedSpecificity(
  s: Statement,
  sources: readonly Source[]
): GuardRecord[] {
  const m = SPECIFICITY_PATTERN.exec(s.text);
  if (!m) return [];

  /* An observation's digits come from its own method, not from a citation. */
  if (s.kind === "OBSERVATION") return [];

  const cited = (asClaim(s)?.sourceIds ?? []).filter((id) =>
    sources.some((src) => src.id === id)
  );
  if (cited.length > 0) return [];

  return [
    rec(
      "UNSUPPORTED_SPECIFICITY",
      undefined,
      m[0].trim(),
      `The text carries the quantity "${m[0].trim()}" with no source attached and no method behind it. A number with no origin is the most persuasive kind of wrong.`,
      s.id
    ),
  ];
}

/** More citations than distinct origins, or citations nobody opened. */
export function detectCitationInflation(
  s: Statement,
  sources: readonly Source[]
): GuardRecord[] {
  const sourceIds = asClaim(s)?.sourceIds ?? [];
  if (sourceIds.length === 0) return [];

  const resolved = sourceIds
    .map((id) => sources.find((src) => src.id === id))
    .filter((x): x is Source => !!x);
  if (resolved.length === 0) return [];

  const unopened = resolved.filter((src) => !src.opened).length;
  const groups = new Set(resolved.map((src) => src.independenceGroup));

  const out: GuardRecord[] = [];
  if (unopened > 0) {
    out.push(
      rec(
        "CITATION_INFLATION",
        undefined,
        `${unopened} of ${resolved.length} citations never opened`,
        `Cited sources ${resolved
          .filter((x) => !x.opened)
          .map((x) => x.id)
          .join(", ")} were never read. An unopened citation is decoration.`,
        s.id
      )
    );
  }
  if (groups.size < resolved.length) {
    out.push(
      rec(
        "CITATION_INFLATION",
        undefined,
        `${resolved.length} citations across ${groups.size} independence group(s)`,
        `Distinct sources share an independence group. Presenting one origin as several sources is the arithmetic of false consensus.`,
        s.id
      )
    );
  }
  return out;
}

/** A recorded category transition that promoted without raising a guard. */
export function detectCategoryDrift(s: Statement): GuardRecord[] {
  const promotions = s.transitions.filter((t) => t.promotion);
  const unguarded = promotions.filter((t) => !t.guard);

  if (promotions.length === 0) return [];

  return promotions.map((t) =>
    rec(
      "CATEGORY_DRIFT",
      unguarded.includes(t) ? "MATERIAL" : "ADVISORY",
      `${t.from} → ${t.to} by ${t.actor.type}`,
      unguarded.includes(t)
        ? `A promotion from ${t.from} to ${t.to} was recorded without raising a guard. Reason given: "${t.reason}". If the promotion is legitimate the guard should still have fired and been acknowledged.`
        : `Promotion ${t.from} → ${t.to} raised ${t.guard}, which is the correct behaviour. Recorded for the audit trail.`,
      s.id
    )
  );
}

/** An unknown that exists somewhere in the premises but not in the claim. */
export function detectUnknownSuppression(
  s: Statement,
  byId: ReadonlyMap<string, Statement>
): GuardRecord[] {
  const premiseUnknowns = s.parentIds.flatMap((id) => byId.get(id)?.unknowns ?? []);
  if (premiseUnknowns.length === 0) return [];

  const carried = s.unknowns.join(" | ").toLowerCase();
  const dropped = premiseUnknowns.filter((u) => !carried.includes(u.toLowerCase()));

  if (dropped.length === 0) return [];

  return [
    rec(
      "UNKNOWN_SUPPRESSION",
      "MATERIAL",
      `${dropped.length} unknown(s) dropped on the way up`,
      `These were recorded as unknown in a premise and do not appear in this statement's unknowns: ${dropped.join("; ")}. Omitting an unknown as the reasoning gets more confident is the failure mode this whole system exists to catch.`,
      s.id
    ),
  ];
}

/** An analogy standing in for an argument. */
export function detectAnalogySubstitution(s: Statement): GuardRecord[] {
  const match = firstMatch(s.text, ANALOGY_MARKERS);
  if (!match) return [];

  const hasMechanism =
    s.kind === "HYPOTHESIS" ||
    s.kind === "INFERENCE" ||
    /because|therefore|so that|which means|leads to|causes/i.test(s.text);

  if (hasMechanism) return [];

  return [
    rec(
      "ANALOGY_SUBSTITUTION",
      undefined,
      match.trim(),
      "The statement argues by analogy and supplies no mechanism. A resemblance is being asked to do the work of a derivation.",
      s.id
    ),
  ];
}

/** Stated confidence higher than the factors justify. */
export function detectConfidenceInflation(s: Statement): GuardRecord[] {
  const derived = deriveConfidence(s.confidence);
  if (derived.duplicated.length === 0) return [];

  return [
    rec(
      "CONFIDENCE_INFLATION",
      "MATERIAL",
      `${derived.duplicated.length} factor(s) supplied twice`,
      `Factors ${derived.duplicated.join(", ")} appear more than once in the confidence basis and were counted once. If they had been counted twice the confidence would have read higher than the evidence supports.`,
      s.id
    ),
  ];
}

/** Scope in the text exceeds the scope the evidence covers. */
export function detectScopeCreep(s: Statement): GuardRecord[] {
  const universal = /\b(all|every|always|never|no one|nobody|everyone|any)\b/i.exec(
    s.text
  );
  if (!universal) return [];

  const conf = deriveConfidence(s.confidence);
  const weak = conf.factors.includes("INCOMPLETE_SAMPLE");
  if (!weak) return [];

  return [
    rec(
      "SCOPE_CREEP",
      undefined,
      universal[0].toLowerCase(),
      `The claim is universal ("${universal[0]}") while its basis carries INCOMPLETE_SAMPLE. A claim about all of something cannot rest on part of it.`,
      s.id
    ),
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   THE COMPOSITE CHECK
   ═══════════════════════════════════════════════════════════════════ */

export interface GuardInput {
  statement: Statement;
  all: readonly Statement[];
  sources: readonly Source[];
}

/**
 * Run every detector against one statement.
 *
 * Deterministic and side-effect free apart from the id counter, so the same
 * input always produces the same set — which is what makes a guard
 * trustworthy. A detector that occasionally missed things for reasons
 * nobody could name would be worse than no detector.
 */
export function guardStatement(input: GuardInput): GuardRecord[] {
  const byId = new Map(input.all.map((s) => [s.id as string, s]));
  const { statement: s, all, sources } = input;

  return [
    ...detectCausalityOverreach(s),
    ...detectConsensusClaimUnsupported(s, sources),
    ...detectSourceClaimFactCollapse(s, sources),
    ...detectAssumptionLeakage(s, byId),
    ...detectConsensusAmplification(s, all),
    ...detectUnsupportedSpecificity(s, sources),
    ...detectCitationInflation(s, sources),
    ...detectCategoryDrift(s),
    ...detectUnknownSuppression(s, byId),
    ...detectAnalogySubstitution(s),
    ...detectConfidenceInflation(s),
    ...detectScopeCreep(s),
  ];
}

export function guardAll(
  statements: readonly Statement[],
  sources: readonly Source[]
): GuardRecord[] {
  return statements.flatMap((s) =>
    guardStatement({ statement: s, all: statements, sources })
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAN A GUARD BLOCK A TRANSITION?
   ═══════════════════════════════════════════════════════════════════ */

/**
 * ASIANCODER.MD: make failure "structurally expensive".
 *
 * A guard that only warns is a suggestion. So: a CRITICAL guard on a
 * statement makes promotion impossible without an explicit human
 * acknowledgement, and this function is the gate. It returns the decision
 * rather than performing it, because the caller is the UI and the UI must
 * show WHY it was blocked.
 */
export interface PromotionGate {
  allowed: boolean;
  /** CRITICAL guards that block. Empty when allowed. */
  blockers: GuardRecord[];
  /** What a human would have to do to unblock. */
  unblockBy: string | null;
}

export function gatePromotion(
  statement: Statement,
  guards: readonly GuardRecord[]
): PromotionGate {
  const mine = guards.filter((g) => g.statementId === statement.id);
  const blocking = mine.filter(
    (g) => g.severity === "CRITICAL" && !g.acknowledged
  );

  if (blocking.length === 0) {
    return { allowed: true, blockers: [], unblockBy: null };
  }

  return {
    allowed: false,
    blockers: blocking,
    unblockBy:
      "A human must acknowledge each CRITICAL guard. Acknowledging records the " +
      "decision in the trace; it does not remove the finding.",
  };
}

/* ═══════════════════════════════════════════════════════════════════
   MEMORY CONTAMINATION
   ═══════════════════════════════════════════════════════════════════ */

/**
 * ASIANCODER.MD asks "can memory become contaminated?"
 *
 * The contamination vector is a claim that entered memory without passing
 * the guard. This checks it, and note what it does: it does not delete the
 * memory, it marks it and names the guard. Deleting is exactly the
 * authority ASIANCODER.MD forbids — "delete contradictions" is on the
 * forbidden list — and a system that removes contaminated memory is a
 * system that removes the evidence of its own contamination.
 */
export function detectMemoryContamination(
  memory: readonly MemoryItem[],
  guards: readonly GuardRecord[]
): MemoryItem[] {
  const criticalByStatement = new Set(
    guards.filter((g) => g.severity === "CRITICAL").map((g) => g.statementId)
  );

  return memory.map((item) => {
    if (!item.originStatementId) return item;
    if (!criticalByStatement.has(item.originStatementId)) return item;
    /* Marked, never removed. The conflict is preserved. */
    return {
      ...item,
      stale: true,
      conflictWith: [...item.conflictWith],
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   CALIBRATION — the limits of this file, stated
   ═══════════════════════════════════════════════════════════════════ */

/**
 * What these detectors do not catch. Published, because a guard whose
 * blind spots are undocumented is indistinguishable from a guard that has
 * no blind spots.
 *
 * KNOWN LIMITS:
 *   · Lexical detectors are English-only and will miss a causal claim made
 *     in another language, or made by circumlocution ("which is what
 *     brought about the decline").
 *   · "caused" is legitimate in a hypothesis and a reported finding; this
 *     file distinguishes those structurally, but it cannot tell whether the
 *     mechanism named in a hypothesis is coherent.
 *   · CONSENSUS_AMPLIFICATION compares exact normalised text. Paraphrase
 *     across agents defeats it. Semantic clustering would catch more and
 *     would also produce more false positives, which is the trade this
 *     file resolves in favour of not manufacturing false confidence.
 *   · Nothing here evaluates whether an argument is SOUND. Every detector
 *     checks form, provenance and support — never the truth of a claim.
 *     That is not a gap in this file, it is the boundary of the discipline.
 */
export const GUARD_CALIBRATION = {
  lexicalOnly: "english",
  paraphraseBlind: true,
  evaluatesSoundness: false,
  precisionOverRecall: true,
} as const;

/** The six the contract requires by name, for the UI to assert coverage of. */
export { GUARD_CONTRACT_EVENTS };
export type { GuardSeverity };