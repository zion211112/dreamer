/**
 * APT-LABS Epistemic Branches — Anti-median diversity measurement
 */

import { z } from "zod";
import type { StatementId } from "./model";

const brand = <T extends string>(schema: z.ZodString, _brand: string) =>
  schema.brand<T>();

export const BranchId = brand(z.string().min(1), "BranchId");
export type BranchId = z.infer<typeof BranchId>;

export const BranchSchema = z.object({
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

export function parseBranch(data: unknown): Branch {
  return BranchSchema.parse(data);
}

export const Branch = BranchSchema;

/* ═══════════════════════════════════════════════════════════════════
   Diversity Measurement — Compare branches by mechanism, not vocabulary
   ════════════════════════════════════════════════════════════════════ */

export interface DiversityResult {
  score: number;
  meanMechanismDistance: number;
  collapsedPairs: Array<{ a: string; b: string; reason: string }>;
  finding: string;
  strategyCompliance: Array<{ strategy: string; compliant: boolean; reason: string }>;
}

/**
 * Measures diversity between branches by comparing mechanisms.
 * Collapses pairs that have the same mechanism (near-duplicates).
 */
export function measureDiversity(branches: Branch[]): DiversityResult {
  const collapsedPairs: Array<{ a: string; b: string; reason: string }> = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i];
      const b = branches[j];

      // Check if mechanisms are the same (near-duplicate)
      if (a.mechanism === b.mechanism) {
        collapsedPairs.push({
          a: a.id,
          b: b.id,
          reason: "Identical mechanism text",
        });
      }
      // Check if mechanisms are synonyms (semantic similarity)
      else if (areSynonyms(a.mechanism, b.mechanism)) {
        collapsedPairs.push({
          a: a.id,
          b: b.id,
          reason: "Synonymous mechanisms",
        });
      }
    }
  }

  const uniqueMechanisms = new Set(branches.map((b) => b.mechanism)).size;
  const score = branches.length > 0 ? uniqueMechanisms / branches.length : 1;

  // Compute mean mechanism distance (Jaccard distance between mechanisms)
  let totalDistance = 0;
  let pairCount = 0;
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      totalDistance += 1 - jaccardSimilarity(branches[i].mechanism, branches[j].mechanism);
      pairCount++;
    }
  }
  const meanMechanismDistance = pairCount > 0 ? totalDistance / pairCount : 0;

  // Strategy compliance: CONSERVATIVE should share mechanisms, RADICAL_MECHANISM should differ
  const strategyCompliance: Array<{ strategy: string; compliant: boolean; reason: string }> = [];
  for (const branch of branches) {
    if (branch.strategy === "CONSERVATIVE") {
      // CONSERVATIVE is compliant if it shares a mechanism with another branch
      const sharesMechanism = branches.some(
        (b) => b.id !== branch.id && (b.mechanism === branch.mechanism || areSynonyms(b.mechanism, branch.mechanism))
      );
      strategyCompliance.push({
        strategy: branch.strategy,
        compliant: sharesMechanism,
        reason: sharesMechanism ? "Conservative branch shares mechanism as expected" : "Conservative branch has unique mechanism",
      });
    } else if (branch.strategy === "RADICAL_MECHANISM") {
      // RADICAL_MECHANISM is compliant if it has a unique mechanism
      const hasUniqueMechanism = !branches.some(
        (b) => b.id !== branch.id && (b.mechanism === branch.mechanism || areSynonyms(b.mechanism, branch.mechanism))
      );
      strategyCompliance.push({
        strategy: branch.strategy,
        compliant: hasUniqueMechanism,
        reason: hasUniqueMechanism ? "Radical mechanism is distinct as expected" : "Radical mechanism duplicates another branch",
      });
    }
  }

  let finding = "";
  if (collapsedPairs.length > 0) {
    finding = `${collapsedPairs.length} pair(s) collapsed — same or synonymous mechanism`;
  } else {
    finding = "All branches have distinct mechanisms";
  }

  return { score, meanMechanismDistance, collapsedPairs, finding, strategyCompliance };
}

/**
 * Jaccard similarity between two tokenized strings
 */
function jaccardSimilarity(a: string, b: string): number {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "so",
    "then",
    "than",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "their",
    "there",
    "here",
    "where",
    "when",
    "why",
    "how",
    "what",
    "who",
    "which",
  ]);

  const tokenize = (text: string) =>
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Simple synonym detection — checks if two mechanisms share significant keywords
 * after removing common words. This is intentionally conservative.
 */
function areSynonyms(a: string, b: string): boolean {
  return jaccardSimilarity(a, b) > 0.7;
}

/* ════════════════════════════════════════════════════════════════════
   Branch Operations — Verdicts and synthesis
   ════════════════════════════════════════════════════════════════════ */

export interface Verdict {
  id: string;
  verdict: "PROTECT_FROM_OPTIMIZATION" | "KILL" | "PROMOTE" | "DEFER";
  actorId: string;
  at: string;
  rationale: string;
  protectionReason?: string;
}

export interface BranchWithVerdicts {
  id: BranchId;
  strategy: "RADICAL_MECHANISM" | "CONSERVATIVE" | "INCREMENTAL";
  thesis: string;
  assumptions: string[];
  mechanism: string;
  failureMode: string;
  novelContribution: string;
  differsBecause: string;
  verdicts: Verdict[];
  protectedFromOptimization: boolean;
}

/**
 * Append a verdict to a branch
 */
export function appendVerdict(branch: Branch, verdict: Verdict): BranchWithVerdicts {
  return {
    ...branch,
    verdicts: [...(branch.verdicts as unknown as Verdict[]), verdict],
  };
}

/**
 * Synthesis input — filter branches by protection status
 */
export interface SynthesisInputResult {
  included: BranchWithVerdicts[];
  excluded: BranchWithVerdicts[];
  excludedBecause: Array<{ id: string; reason: string }>;
}

export function synthesisInput(branches: BranchWithVerdicts[]): SynthesisInputResult {
  const included: BranchWithVerdicts[] = [];
  const excluded: BranchWithVerdicts[] = [];
  const excludedBecause: Array<{ id: string; reason: string }> = [];

  for (const branch of branches) {
    const hasProtection = branch.verdicts.some((v) => v.verdict === "PROTECT_FROM_OPTIMIZATION");
    const hasKill = branch.verdicts.some((v) => v.verdict === "KILL");

    if (hasProtection) {
      included.push(branch);
      excludedBecause.push({ id: branch.id, reason: "PROTECT_FROM_OPTIMIZATION verdict" });
    } else if (hasKill) {
      excluded.push(branch);
      excludedBecause.push({ id: branch.id, reason: "KILL verdict" });
    } else {
      included.push(branch);
    }
  }

  return { included, excluded, excludedBecause };
}