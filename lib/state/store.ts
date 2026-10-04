/**
 * lib/state/store.ts — THE STORE.
 *
 * One seeded project. Every action here is a real state transition that
 * changes derived output, and every selector is a function rather than
 * stored state.
 *
 * ── Why nothing derived is stored ──────────────────────────────────
 *
 * The first draft of this file cached the health vector and the gap in
 * state and recomputed them on write. That is the classic bug and it is
 * the exact failure class this system exists to catch: a cached score
 * drifts from the inputs it was computed from, and then the system
 * displays a confident number that no longer corresponds to anything.
 *
 * So `selectGap`, `selectHealth` and the rest read the CURRENT state and
 * compute. They cost nothing — these are reductions over a few dozen
 * in-memory objects — and they cannot go stale, because there is no
 * interval during which they could.
 *
 * ── What the store is allowed to do ────────────────────────────────
 *
 * It calls the domain and records outcomes. It contains no detector
 * logic, no scoring, and no rule about what a category permits. Those all
 * live in `lib/epistemic/`, where they can be tested without a renderer.
 * The store is the thing that remembers; the domain is the thing that
 * decides.
 */

"use client";

import { create } from "zustand";
import {
  type Attack,
  type Branch,
  type BranchId,
  type CategoryTransition,
  type GuardRecord,
  type HumanVerdict,
  type MemoryItem,
  type Statement,
  type StatementId,
  type Trace,
} from "@/lib/epistemic/model";
import {
  CATEGORY_RANK,
  type GuardEvent,
  type StatementCategory,
} from "@/lib/epistemic/taxonomy";
import { guardAll, guardStatement, gatePromotion } from "@/lib/epistemic/guard";
import { buildDifferential, healthVector, measureGap, type AxisReading, type Differential, type GapReading } from "@/lib/epistemic/health";
import {
  appendVerdict,
  measureDiversity,
  synthesisInput,
  type DiversityReading,
} from "@/lib/epistemic/branches";
import { appendEvent, forkTrace, rollbackTrace } from "@/lib/epistemic/trace";
import { memorySurface, type MemorySurface } from "@/lib/epistemic/memory";
import { SEED, SEED_EVALUATED_AT, seedProject } from "@/lib/state/seed";

export interface PromotionResult {
  ok: boolean;
  /** Set when blocked. The UI must render these, not a generic failure. */
  blockers: GuardRecord[];
  unblockBy: string | null;
}

interface StoreShape {
  projectId: string;
  statements: Statement[];
  sources: import("@/lib/epistemic/model").Source[];
  guards: GuardRecord[];
  branches: Branch[];
  attacks: Attack[];
  memory: MemoryItem[];
  traces: Trace[];

  /** Recompute every guard from the current statements and sources. */
  runGuards: () => GuardRecord[];

  /**
   * Acknowledge a guard.
   *
   * Sets a flag and records WHO looked. It does not remove the finding,
   * because a CRITICAL guard that has been seen is still true and ASIANCODER.MD's
   * forbidden-authority list includes deleting contradictions.
   */
  acknowledgeGuard: (id: string, actorId: string) => void;

  /**
   * Attempt a category transition.
   *
   * Returns the decision instead of throwing, because the caller is a UI
   * and the UI has to show the blockers. When blocked, NOTHING changes —
   * which is asserted by the test that a blocked promotion leaves the
   * transition list untouched.
   */
  attemptPromotion: (
    statementId: StatementId,
    to: StatementCategory,
    reason: string,
    actorId: string
  ) => PromotionResult;

  addVerdict: (branchId: BranchId, verdict: HumanVerdict) => void;
  resolveAttack: (id: string, status: Attack["status"]) => void;
  runAttack: (reviewerType: string, statementId: StatementId, body: string, severity: Attack["severity"], requiredChange: string) => void;
  forkRun: (traceId: string, atIndex: number, newId: string) => void;
  rollbackRun: (traceId: string, toIndex: number, reason: string, actorId: string) => void;
  logHumanIntervention: (traceId: string, summary: string, actorId: string) => void;
}

const initial = seedProject();

export const useEpistem = create<StoreShape>()((set, get) => ({
  projectId: initial.projectId,
  statements: initial.statements,
  sources: initial.sources,
  guards: guardAll(initial.statements, initial.sources, SEED_EVALUATED_AT),
  branches: [...SEED.branches],
  attacks: [...SEED.attacks],
  memory: [...SEED.memory],
  traces: [...SEED.traces],

  runGuards: () => {
    const { statements, sources } = get();
    const next = guardAll(statements, sources, SEED_EVALUATED_AT);
    set({ guards: next });
    return next;
  },

  acknowledgeGuard: (id, actorId) => {
    set((s) => ({
      guards: s.guards.map((g) =>
        g.id === id ? { ...g, acknowledged: true, acknowledgedBy: actorId } : g
      ),
    }));
  },

  attemptPromotion: (statementId, to, reason, actorId) => {
    const { statements, guards } = get();
    const statement = statements.find((s) => s.id === statementId);
    if (!statement) {
      return {
        ok: false,
        blockers: [],
        unblockBy: `No statement with id ${statementId}.`,
      };
    }

    const gate = gatePromotion(statement, guards);
    if (!gate.allowed) {
      /* Nothing changes. The transition is not recorded even as refused,
         because a record of a refused promotion would suggest the system
         considered it. */
      return { ok: false, blockers: gate.blockers, unblockBy: gate.unblockBy };
    }

    const from = statement.category;
    const promotion = CATEGORY_RANK[to] < CATEGORY_RANK[from];

    const transition: CategoryTransition = {
      id: `tr-${statementId}-${statement.transitions.length + 1}`,
      at: new Date().toISOString(),
      actor: { type: "HUMAN", actorId },
      from,
      to,
      reason,
      promotion,
      guard: promotion ? "CATEGORY_DRIFT" : undefined,
    };

    const updated = statements.map((s) =>
      s.id === statementId
        ? ({ ...s, category: to, transitions: [...s.transitions, transition] } as Statement)
        : s
    );

    set({ statements: updated });
    /* Guards are recomputed because a promotion can create or clear a
       finding, and leaving the old guard set in place would mean the UI
       shows a verdict about the old category. */
    set({ guards: guardAll(updated, get().sources, SEED_EVALUATED_AT) });

    return { ok: true, blockers: [], unblockBy: null };
  },

  addVerdict: (branchId, verdict) => {
    set((s) => ({
      branches: s.branches.map((b) =>
        b.id === branchId ? appendVerdict(b, verdict) : b
      ),
    }));
  },

  resolveAttack: (id, status) => {
    set((s) => ({
      attacks: s.attacks.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              resolvedAt: status === "OPEN" ? undefined : new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  runAttack: (reviewerType, statementId, body, severity, requiredChange) => {
    const id = `atk-${get().attacks.length + 1}`;
    set((s) => ({
      attacks: [
        ...s.attacks,
        {
          id,
          reviewerType: reviewerType as Attack["reviewerType"],
          targetStatementId: statementId,
          targetQuote:
            s.statements.find((st) => st.id === statementId)?.text.slice(0, 160) ?? "",
          body,
          severity,
          requiredChange,
          mode: "COUNTEREXAMPLE",
          status: "OPEN",
          raisedAt: new Date().toISOString(),
        },
      ],
    }));
  },

  forkRun: (traceId, atIndex, newId) => {
    const { traces } = get();
    const parent = traces.find((t) => t.id === traceId);
    if (!parent) return;
    const { trace } = forkTrace(parent, atIndex, newId);
    set((s) => ({ traces: [...s.traces, trace] }));
  },

  rollbackRun: (traceId, toIndex, reason, actorId) => {
    const { traces } = get();
    const parent = traces.find((t) => t.id === traceId);
    if (!parent) return;
    const rolled = rollbackTrace(parent, toIndex, { type: "HUMAN", actorId }, `${traceId}-rb`, reason);
    set((s) => ({ traces: [...s.traces, rolled] }));
  },

  logHumanIntervention: (traceId, summary, actorId) => {
    set((s) => ({
      traces: s.traces.map((t) =>
        t.id === traceId
          ? appendEvent(t, {
              at: new Date().toISOString(),
              kind: "HUMAN_INTERVENTION",
              actor: { type: "HUMAN", actorId },
              summary,
              refs: [],
              guards: [],
              metrics: {},
            })
          : t
      ),
    }));
  },
}));

/* ═══════════════════════════════════════════════════════════════════
   SELECTORS

   Functions, not stored values. See the module note: a cached score
   drifts from its inputs, and then the system displays a confident
   number that corresponds to nothing.

   ── Why they take slices rather than `get()` ──────────────────────

   The first version took the whole store through `get()`, which reads
   everything on every call. That is not merely wasteful: it makes the
   component's dependency array unanalyzable, because a selector that
   touches the entire store cannot be reasoned about from its
   arguments — and a memo whose dependencies are a guess is exactly the
   bug this system exists to catch.

   So every selector below names the slices it reads, which makes the
   `useMemo` dependency array in each component correct BY CONSTRUCTION
   rather than by discipline. If a selector needs another slice, adding it
   to the signature is a compile error at every call site.
   ═══════════════════════════════════════════════════════════════════ */

export function selectGap(
  statements: readonly Statement[],
  guards: readonly GuardRecord[],
  text: string
): GapReading {
  return measureGap({ text, statements, guards });
}

export function selectHealth(input: {
  statements: readonly Statement[];
  guards: readonly GuardRecord[];
  branches: readonly Branch[];
  traceEventCount: number | undefined;
  memory: readonly MemoryItem[];
}): AxisReading[] {
  return healthVector({
    statements: input.statements,
    guards: input.guards,
    branches: input.branches.length,
    protectedBranches: input.branches.filter((b) => b.protectedFromOptimization).length,
    traceEventCount: input.traceEventCount,
    memory: input.memory,
    humanVerdicts: input.branches.reduce((n, b) => n + b.verdicts.length, 0),
  });
}

export function selectDifferential(
  statements: readonly Statement[],
  guards: readonly GuardRecord[],
  id: StatementId
): Differential | null {
  const statement = statements.find((s) => s.id === id);
  if (!statement) return null;
  return buildDifferential(statement, statements, guards);
}

export function selectDiversity(branches: readonly Branch[]): DiversityReading {
  return measureDiversity(branches);
}

export function selectSynthesisInput(branches: readonly Branch[]) {
  return synthesisInput(branches);
}

export function selectMemorySurface(memory: readonly MemoryItem[], now: Date): MemorySurface {
  return memorySurface(memory, now);
}

export function selectGuardsFor(
  guards: readonly GuardRecord[],
  id: StatementId
): GuardRecord[] {
  return guards.filter((g) => g.statementId === id);
}

/** Non-empty set of guard events currently outstanding, for the top bar. */
export function selectOpenGuardSummary(guards: readonly GuardRecord[]): {
  critical: number;
  material: number;
  advisory: number;
  unacknowledged: number;
  events: GuardEvent[];
} {
  const events = [...new Set(guards.map((g) => g.event))];
  return {
    critical: guards.filter((g) => g.severity === "CRITICAL").length,
    material: guards.filter((g) => g.severity === "MATERIAL").length,
    advisory: guards.filter((g) => g.severity === "ADVISORY").length,
    unacknowledged: guards.filter((g) => !g.acknowledged).length,
    events,
  };
}