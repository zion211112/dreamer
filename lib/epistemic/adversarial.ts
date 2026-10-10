/**
 * APT-LABS Epistemic Adversarial — Red-team testing for the guard
 */

import { z } from "zod";
import type { GuardEvent, StatementId } from "./model";

/* ═══════════════════════════════════════════════════════════════════
   Attack Types
   ═══════════════════════════════════════════════════════════════════ */

export interface Attack {
  id: string;
  reviewerType: "STATISTICIAN" | "SKEPTIC" | "DOMAIN_EXPERT" | "AUDITOR";
  targetStatementId: string;
  targetQuote: string;
  body: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredChange: string;
  mode?: "COUNTEREXAMPLE" | "ALTERNATIVE_EXPLANATION" | "METHODOLOGICAL_FLAW";
}

export const AttackSchema = z.object({
  id: z.string().min(1),
  reviewerType: z.enum(["STATISTICIAN", "SKEPTIC", "DOMAIN_EXPERT", "AUDITOR"]),
  targetStatementId: z.string(),
  targetQuote: z.string(),
  body: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  requiredChange: z.string(),
  mode: z.enum(["COUNTEREXAMPLE", "ALTERNATIVE_EXPLANATION", "METHODOLOGICAL_FLAW"]).optional(),
});

export function parseAttack(data: unknown): Attack {
  return AttackSchema.parse(data);
}

/* ═══════════════════════════════════════════════════════════════════
   Gate Stage — Pipeline stage gating
   ═══════════════════════════════════════════════════════════════════ */

export interface GateInput {
  attacks: Attack[];
  stagesEntered: string[];
}

export interface GateResult {
  satisfied: boolean;
  unmet: string[];
  reason?: string;
}

const STAGE_REQUIREMENTS: Record<string, { minAttacks: number; requiredStages: string[] }> = {
  INTUIT: { minAttacks: 0, requiredStages: [] },
  BOOTSTRAP: { minAttacks: 0, requiredStages: ["INTUIT"] },
  ATTACK: { minAttacks: 1, requiredStages: ["INTUIT", "BOOTSTRAP"] },
  REPLACE: { minAttacks: 1, requiredStages: ["INTUIT", "BOOTSTRAP", "ATTACK"] },
  INTEGRATE: { minAttacks: 1, requiredStages: ["INTUIT", "BOOTSTRAP", "ATTACK", "REPLACE"] },
};

export function gateStage(stage: string, input: GateInput): GateResult {
  const req = STAGE_REQUIREMENTS[stage] ?? { minAttacks: 0, requiredStages: [] };
  const unmet: string[] = [];

  if (input.attacks.length < req.minAttacks) {
    unmet.push(`requires at least ${req.minAttacks} attack(s); have ${input.attacks.length}`);
  }

  for (const required of req.requiredStages) {
    if (!input.stagesEntered.includes(required)) {
      unmet.push(`requires ${required} stage first`);
    }
  }

  return {
    satisfied: unmet.length === 0,
    unmet,
    reason: unmet.length === 0 ? "All requirements met" : unmet.join("; "),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   Make Attack — Factory for creating attacks
   ═══════════════════════════════════════════════════════════════════ */

let attackCounter = 0;

export function makeAttack(input: Omit<Attack, "id">): Attack {
  attackCounter++;
  return {
    ...input,
    id: `atk-${attackCounter}`,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   Adversarial Test Cases
   ═══════════════════════════════════════════════════════════════════ */

export interface AdversarialCase {
  name: string;
  description: string;
  statement: unknown;
  expectedGuards: GuardEvent["event"][];
  shouldPass: boolean;
}

export const ADVERSARIAL_CASES: AdversarialCase[] = [
  {
    name: "causal_overreach_basic",
    description: "Claim with 'because' but no causal evidence",
    statement: {
      kind: "CLAIM",
      id: "claim-test-1",
      text: "Sales dropped because of the new competitor.",
      category: "FACT",
      chainStage: "OBSERVED",
      support: "SUPPORTED",
      provenance: { author: "test", timestamp: "2026-01-01T00:00:00.000Z", tool: "test" },
      confidence: { factors: [{ factor: "DIRECT_MEASUREMENT", basis: "Sales data", because: "src-1" }] },
      transitions: [],
      guards: [],
      unknowns: [],
      parentIds: [],
      evidenceIds: [],
      sourceIds: ["src-1"],
      independentSupports: 1,
      contradicting: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    expectedGuards: ["CAUSALITY_OVERREACH"],
    shouldPass: false,
  },
  {
    name: "causal_with_evidence",
    description: "Causal claim WITH causal evidence (should not fire)",
    statement: {
      kind: "CLAIM",
      id: "claim-test-2",
      text: "Sales dropped because of the new competitor.",
      category: "FACT",
      chainStage: "OBSERVED",
      support: "SUPPORTED",
      provenance: { author: "test", timestamp: "2026-01-01T00:00:00.000Z", tool: "test" },
      confidence: { factors: [{ factor: "DIRECT_MEASUREMENT", basis: "Sales data", because: "src-1" }] },
      transitions: [],
      guards: [],
      unknowns: [],
      parentIds: [],
      evidenceIds: [],
      sourceIds: ["src-1"],
      independentSupports: 1,
      contradicting: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    expectedGuards: [],
    shouldPass: true,
  },
  {
    name: "assumption_leakage",
    description: "Inference resting on untested assumption not carried",
    statement: {
      kind: "INFERENCE",
      id: "inf-test-1",
      text: "The system will fail under load.",
      category: "INFERENCE",
      chainStage: "INFERRED",
      support: "WEAKLY_SUPPORTED",
      provenance: { author: "test", timestamp: "2026-01-01T00:00:00.000Z", tool: "test" },
      confidence: { factors: [] },
      transitions: [],
      guards: [],
      unknowns: [],
      parentIds: ["asm-1"],
      premises: ["asm-1"],
      rule: "abductive",
      warrant: "ABDUCTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    expectedGuards: ["ASSUMPTION_LEAKAGE"],
    shouldPass: false,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Adversarial Runner
   ═══════════════════════════════════════════════════════════════════ */

import { guardStatement } from "./guard";
import type { Statement, Source } from "./model";

export function runAdversarialTests(
  parseFn: (data: unknown) => Statement,
  parseSourceFn: (data: unknown) => Source,
): { passed: number; failed: number; results: Array<{ case: AdversarialCase; passed: boolean; guards: GuardEvent[] }> } {
  let passed = 0;
  let failed = 0;
  const results = [];

  for (const testCase of ADVERSARIAL_CASES) {
    try {
      const statement = parseFn(testCase.statement);
      const sources: Source[] = [];

      // Extract source IDs and create minimal sources
      if ("sourceIds" in statement) {
        for (const id of statement.sourceIds) {
          sources.push(parseSourceFn({
            id,
            locator: "Test source",
            originator: "Test",
            publishedAt: "2026-01-01T00:00:00.000Z",
            opened: true,
            quality: "PRIMARY",
            independenceGroup: "test",
            retrievedAt: "2026-01-01T00:00:00.000Z",
          }));
        }
      }

      const guards = guardStatement({
        statement,
        all: [statement],
        sources,
      });

      const firedEvents = guards.map((g) => g.event);
      const expectedFired = testCase.expectedGuards;
      const unexpectedFired = firedEvents.filter((e) => !expectedFired.includes(e));
      const missingExpected = expectedFired.filter((e) => !firedEvents.includes(e));

      const casePassed = unexpectedFired.length === 0 && missingExpected.length === 0;
      if (casePassed === testCase.shouldPass) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        case: testCase,
        passed: casePassed,
        guards,
      });
    } catch (error) {
      failed++;
      results.push({
        case: testCase,
        passed: false,
        guards: [],
      });
    }
  }

  return { passed, failed, results };
}

/* ════════════════════════════════════════════════════════════════════
   Reviewer Agreement — Deduplicate attacks by shared blind spot
   ═══════════════════════════════════════════════════════════════════ */

export interface AgreementResult {
  count: number;
  effectiveWeight: number;
  modes: string[];
}

export function reviewerAgreement(attacks: Attack[]): AgreementResult {
  const modes = attacks.map((a) => a.mode ?? "UNKNOWN");
  const uniqueModes = new Set(modes);
  return {
    count: attacks.length,
    effectiveWeight: uniqueModes.size,
    modes: [...uniqueModes],
  };
}