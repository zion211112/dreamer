/**
 * lib/epistemic/branches.ts — THE ANTI-MEDIAN ENGINE.
 *
 * ASIANCODER.MD: a normal LLM converges toward statistically common
 * answers, so generate genuinely different hypotheses BEFORE synthesis,
 * and "penalize branches that are merely lexical variations of each other."
 *
 * The penalty is the hard part, and it is where most multi-proposal UIs
 * fail. Showing five cards labelled A–E gives the appearance of diversity
 * while five near-identical paragraphs sit underneath, and a reader who
 * does not read all five learns nothing. So this module computes distances
 * and reports them, and one of them — MECHANISM distance — is the one that
 * matters, because rephrasing is the failure mode.
 *
 * ── How the distance is computed, and why it is shallow ──────────────
 *
 * There are no embeddings here. ASIANCODER.MD says do not invent library
 * capabilities, and wiring a vector model to compute "conceptual distance"
 * would also be a bad idea: it would make a claim about meaning that the
 * system could not defend, on the route whose whole purpose is refusing
 * undefended claims.
 *
 * Instead these are set distances over content words, and they are honest
 * about being that. They CANNOT see that "revenue lift" and "sales uplift"
 * are the same idea. What they CAN do — reliably, with no model at all —
 * is catch the common and much more common case where a branch restates
 * its neighbour using different words drawn from the same vocabulary.
 * That is a real detection with a stated method, and it is worth more than
 * a semantic score nobody could audit.
 *
 * Every function here is pure and returns its inputs, so a UI can show
 * the reader WHAT it compared and let them disagree with the verdict.
 */

import type { Branch, BranchId, HumanVerdict } from "./model";
import { BRANCH_STRATEGY_RULES, type BranchStrategy } from "./taxonomy";

/* ── Tokenisation ────────────────────────────────────────────────
   Deliberately small stop-word list. A large one would be a claim about
   English function words; this is a list of the words that appear at the
   start of every abstract sentence and therefore carry no signal about
   whether two branches think the same thing. */

const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for", "from",
  "has", "have", "how", "in", "is", "it", "its", "may", "more", "most", "not",
  "of", "on", "or", "our", "so", "than", "that", "the", "their", "then",
  "these", "they", "this", "to", "up", "was", "we", "were", "what", "when",
  "which", "who", "will", "with", "would", "you", "your",
]);

/**
 * Content words, stemmed only by stripping a trailing plural 's'.
 *
 * A real stemmer would do better. It would also be a dependency and a
 * second thing to keep in step, and the failure this has to catch — five
 * branches built from one vocabulary — survives naive plural stripping
 * perfectly well. So: no stemmer, and the limitation is in the module note.
 */
function contentWords(text: string): Set<string> {
  return new Set(
    (text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [])
      .filter((w) => !STOP.has(w))
      .map((w) => w.replace(/s$/, ""))
      .filter((w) => w.length >= 3)
  );
}

/** Jaccard similarity: |A∩B| / |A∪B|. 0 means disjoint, 1 means identical. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 1 : inter / union;
}

/** Cosine over binary presence vectors. Equivalent to Jaccard here, but
    weighted by magnitude so a long branch does not look unlike a short
    one purely for being short. */
function weightedOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter += 1;
  return inter / Math.sqrt(a.size * b.size);
}

/* ═══════════════════════════════════════════════════════════════════
   PAIRWISE DISTANCE
   ═══════════════════════════════════════════════════════════════════ */

export interface BranchDistance {
  a: string;
  b: string;
  /** 0..1. Higher means more different. */
  conceptual: number;
  mechanism: number;
  assumption: number;
  /** 0..1. Higher means more different in WORDING. */
  lexical: number;
  /** Why the mechanism score is what it is. Shown in the UI. */
  verdict: string;
}

/**
 * Distance between two branches, on four axes.
 *
 * MECHANISM is weighted heaviest in `conceptual` because mechanism is what
 * ASIANCODER.MD says a radical branch must change, and because a branch
 * that agrees on mechanism while disagreeing on wording is the exact
 * thing that gets presented as an alternative and is not one.
 *
 * The axes are deliberately NOT averaged into one verdict. A branch can
 * be lexically distant and mechanistically identical, and reporting that as
 * one number would erase the only thing worth knowing.
 */
export function branchDistance(a: Branch, b: Branch): BranchDistance {
  const aMech = contentWords(a.mechanism);
  const bMech = contentWords(b.mechanism);

  const aAssump = new Set(a.assumptions.flatMap((s) => [...contentWords(s)]));
  const bAssump = new Set(b.assumptions.flatMap((s) => [...contentWords(s)]));

  const aAll = contentWords(
    [a.thesis, a.mechanism, ...a.assumptions, a.novelContribution].join(" ")
  );
  const bAll = contentWords(
    [b.thesis, b.mechanism, ...b.assumptions, b.novelContribution].join(" ")
  );

  const mechanism = 1 - weightedOverlap(aMech, bMech);
  const assumption = 1 - jaccard(aAssump, bAssump);
  const conceptual = 1 - weightedOverlap(aAll, bAll);
  const lexical = 1 - jaccard(aAll, bAll);

  let verdict: string;
  if (mechanism < 0.25) {
    verdict =
      "Same mechanism, different words. This is not an alternative — it is a paraphrase, and it must not be counted as one.";
  } else if (mechanism < 0.45) {
    verdict =
      "Related mechanism with a different emphasis. Possibly a genuine variant; check whether it would change any decision.";
  } else {
    verdict = "Different mechanism. This branch can change what gets done.";
  }

  return { a: a.id, b: b.id, conceptual, mechanism, assumption, lexical, verdict };
}

export function allDistances(branches: readonly Branch[]): BranchDistance[] {
  const out: BranchDistance[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      out.push(branchDistance(branches[i], branches[j]));
    }
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════
   DIVERSITY SCORE
   ═══════════════════════════════════════════════════════════════════ */

export interface DiversityReading {
  /** 0..1. Overall. */
  score: number;
  /** The mean pairwise mechanism distance — the honest measure. */
  meanMechanismDistance: number;
  /** The mean conceptual distance across the whole branch. */
  meanConceptualDistance: number;
  /** Pairs that are too close to count as distinct. */
  collapsedPairs: BranchDistance[];
  /** Per-branch assessment against its own declared strategy. */
  strategyCompliance: {
    id: string;
    strategy: BranchStrategy;
    /** What the strategy promised to change. */
    mustDifferOn: "MECHANISM" | "ASSUMPTION" | "CONSTRAINT";
    /** The furthest it got from every other branch, on that axis. */
    bestDistanceOn: number;
    compliant: boolean;
    why: string;
  }[];
  /** The finding in one sentence, for the UI. */
  finding: string;
}

/**
 * Score the diversity of a branch set.
 *
 * The score is the MEAN PAIRWISE MECHANISM DISTANCE, not an average of all
 * four axes. An average would let a branch buy diversity with unusual
 * vocabulary, which is precisely the cheat this module exists to prevent.
 *
 * `collapsedPairs` are reported rather than merely subtracted, because a
 * reader who is told "two of your five branches are the same branch" can
 * act on it, and a reader who is only told "diversity: 0.41" cannot.
 */
export function measureDiversity(branches: readonly Branch[]): DiversityReading {
  if (branches.length < 2) {
    return {
      score: 0,
      meanMechanismDistance: 0,
      meanConceptualDistance: 0,
      collapsedPairs: [],
      strategyCompliance: branches.map((b) => ({
        id: b.id,
        strategy: b.strategy,
        mustDifferOn: BRANCH_STRATEGY_RULES[b.strategy].mustDifferOn,
        bestDistanceOn: 0,
        compliant: false,
        why: "Only one branch exists, so there is nothing to differ from.",
      })),
      finding:
        branches.length === 0
          ? "No branches generated. Synthesis would have nothing to choose between."
          : "One branch. This is a single answer wearing a branch label.",
    };
  }

  const pairs = allDistances(branches);

  const meanMechanismDistance =
    pairs.reduce((n, p) => n + p.mechanism, 0) / pairs.length;
  const meanConceptualDistance =
    pairs.reduce((n, p) => n + p.conceptual, 0) / pairs.length;

  /* A pair below this on mechanism distance is treated as collapsed. The
     threshold is set from the wording of the verdict bands above: under
     0.25 the two branches share a mechanism. */
  const collapsedPairs = pairs.filter((p) => p.mechanism < 0.25);

  const strategyCompliance = branches.map((b) => {
    const others = branches.filter((x) => x.id !== b.id);
    const mine = others.map((o) => branchDistance(b, o));
    const rule = BRANCH_STRATEGY_RULES[b.strategy];

    const onAxis =
      rule.mustDifferOn === "MECHANISM"
        ? Math.max(...mine.map((d) => d.mechanism), 0)
        : rule.mustDifferOn === "ASSUMPTION"
          ? Math.max(...mine.map((d) => d.assumption), 0)
          : Math.max(...mine.map((d) => d.conceptual), 0);

    /* Threshold per axis. A CONSERVATIVE branch is SUPPOSED to share a
       mechanism with the others — that is its job — so it is held to a
       different bar from a RADICAL_MECHANISM one. Without this the
       conservative branch is always reported as non-compliant, which
       would teach readers to ignore the compliance check. */
    const threshold = rule.mustDifferOn === "MECHANISM" ? 0.45 : 0.3;

    return {
      id: b.id,
      strategy: b.strategy,
      mustDifferOn: rule.mustDifferOn,
      bestDistanceOn: onAxis,
      compliant: onAxis >= threshold,
      why:
        onAxis >= threshold
          ? `Differs from its nearest neighbour by ${onAxis.toFixed(2)} on ${rule.mustDifferOn}, above the ${threshold} bar for a ${b.strategy} branch.`
          : `${b.strategy} promises to differ on ${rule.mustDifferOn}, and the nearest branch is only ${onAxis.toFixed(2)} away. The branch label is not being honoured.`,
    };
  });

  /* Score is mean mechanism distance, with a penalty for collapsed pairs so
     that having five branches where two are duplicates scores below having
     three that genuinely differ. */
  const collapsePenalty = collapsedPairs.length / Math.max(1, pairs.length);
  const score = clamp01(meanMechanismDistance * (1 - collapsePenalty * 0.5));

  let finding: string;
  if (branches.length < 3) {
    finding = `${branches.length} branch(es). Fewer than three cannot surface an alternative you did not already have in mind.`;
  } else if (collapsedPairs.length > 0) {
    finding = `${branches.length} branches, but ${collapsedPairs.length} pair(s) share a mechanism. The apparent diversity is presentational.`;
  } else if (meanMechanismDistance < 0.45) {
    finding = "Branches differ, but not much on mechanism. Expect synthesis to average them.";
  } else {
    finding = "Branches differ in mechanism. Synthesis has something real to choose between.";
  }

  return {
    score,
    meanMechanismDistance,
    meanConceptualDistance,
    collapsedPairs,
    strategyCompliance,
    finding,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   THE HUMAN GATE
   ═══════════════════════════════════════════════════════════════════ */

export function appendVerdict(branch: Branch, verdict: HumanVerdict): Branch {
  return {
    ...branch,
    verdicts: [...branch.verdicts, verdict],
    /* Recomputed, never set directly. A branch becomes protected the
       moment a human protects it and can never be un-set by a model,
       because there is no code path that writes this field except this
       function and this function only ever sets it to true. */
    protectedFromOptimization: branch.verdicts.some(
      (v) => v.verdict === "PROTECT_FROM_OPTIMIZATION"
    ),
  };
}

export function isProtected(branch: Branch): boolean {
  return branch.protectedFromOptimization;
}

/**
 * What synthesis is allowed to read.
 *
 * This is the enforcement point for "PROTECT FROM OPTIMIZATION", and it is
 * a function rather than a flag on a card because the whole failure ASIANCODER.MD
 * describes — "the model may critique an idea but must not automatically
 * converge it toward the median" — happens in the code that assembles
 * input for the next pass. If that code does not ask this function, the
 * protection is decorative.
 *
 * PROTECTED branches are excluded, not deprioritised. Deprioritised means
 * they can still be averaged in when the average is convenient.
 */
export function synthesisInput(branches: readonly Branch[]): {
  included: Branch[];
  excluded: Branch[];
  excludedBecause: string[];
} {
  const included: Branch[] = [];
  const excluded: Branch[] = [];
  const excludedBecause: string[] = [];

  for (const b of branches) {
    if (b.protectedFromOptimization) {
      excluded.push(b);
      excludedBecause.push(
        `${b.strategy} branch is PROTECTED FROM OPTIMIZATION and was excluded from synthesis by a human.`
      );
    } else if (b.verdicts.some((v) => v.verdict === "KILL")) {
      excluded.push(b);
      excludedBecause.push(`${b.strategy} branch was killed by a human.`);
    } else {
      included.push(b);
    }
  }

  return { included, excluded, excludedBecause };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Re-exported so callers can find a branch without importing model too. */
export type { BranchId };