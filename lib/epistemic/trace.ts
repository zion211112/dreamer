/**
 * APT-LABS Epistemic Trace — Provenance chain tracking
 */

import { z } from "zod";
import { TraceId, EventId, Event, EventKind } from "./model";

/* ═══════════════════════════════════════════════════════════════════
   Trace Schema (matches test script expectations)
   ═══════════════════════════════════════════════════════════════════ */

export const TraceSchema = z.object({
  id: TraceId,
  task: z.string(),
  model: z.string(),
  generation: z.object({ temperature: z.number() }),
  tools: z.array(z.string()),
  retrieval: z.array(z.string()),
  events: z.array(Event),
  annotations: z.array(z.string()),
});

export type Trace = z.infer<typeof TraceSchema>;

export function parseTrace(data: unknown): Trace {
  return TraceSchema.parse(data);
}

export const Trace = TraceSchema;

/* ═══════════════════════════════════════════════════════════════════
   Trace Operations
   ═══════════════════════════════════════════════════════════════════ */

export interface ForkResult {
  trace: Trace;
  forkPoint: number;
  reason: string;
}

export interface DiffResult {
  commonPrefix: number;
  prefixHonest: boolean;
  divergedAt: number;
  added: Event[];
  removed: Event[];
  statementDelta: { added: string[]; removed: string[] };
}

/**
 * Fork a trace at a given event index
 */
export function forkTrace(
  parent: Trace,
  forkIndex: number,
  newId: string,
  reason: string,
): ForkResult {
  if (forkIndex < 0 || forkIndex > parent.events.length) {
    throw new Error(`Invalid fork index: ${forkIndex}`);
  }

  const newEvents = [...parent.events.slice(0, forkIndex)];
  const newTrace: Trace = {
    ...parent,
    id: TraceId.parse(newId),
    events: newEvents,
  };

  return {
    trace: newTrace,
    forkPoint: forkIndex,
    reason,
  };
}

/**
 * Diff two traces
 */
export function diffTraces(parent: Trace, child: Trace): DiffResult {
  let commonPrefix = 0;
  const minLen = Math.min(parent.events.length, child.events.length);

  for (let i = 0; i < minLen; i++) {
    if (eventsEqual(parent.events[i], child.events[i])) {
      commonPrefix++;
    } else {
      break;
    }
  }

  const prefixHonest = commonPrefix > 0;

  const added = child.events.slice(commonPrefix);
  const removed = parent.events.slice(commonPrefix);

  // Extract statement IDs from refs
  const addedStmtIds = new Set<string>();
  const removedStmtIds = new Set<string>();

  for (const e of added) {
    for (const ref of e.refs) {
      addedStmtIds.add(ref);
    }
  }
  for (const e of removed) {
    for (const ref of e.refs) {
      removedStmtIds.add(ref);
    }
  }

  return {
    commonPrefix,
    prefixHonest,
    divergedAt: commonPrefix,
    added,
    removed,
    statementDelta: {
      added: [...addedStmtIds].sort(),
      removed: [...removedStmtIds].sort(),
    },
  };
}

/**
 * Rollback a trace to a given event index
 */
export function rollbackTrace(
  parent: Trace,
  rollbackIndex: number,
  actor: { type: "HUMAN" | "MODEL"; actorId?: string; component?: string },
  newId: string,
  reason: string,
): Trace {
  if (rollbackIndex < 0 || rollbackIndex > parent.events.length) {
    throw new Error(`Invalid rollback index: ${rollbackIndex}`);
  }

  const newEvents = [...parent.events.slice(0, rollbackIndex)];
  const rollbackEvent = {
    id: EventId.parse(`evt-rollback-${Date.now()}`),
    at: new Date().toISOString(),
    kind: EventKind.STAGE_COMPLETED,
    actor: { type: actor.type, component: actor.component ?? "TRACE" },
    stage: "ROLLBACK",
    summary: `Rolled back to event ${rollbackIndex}: ${reason}`,
    refs: [],
    guards: [],
    metrics: {},
  };

  newEvents.push(rollbackEvent);

  const newTrace: Trace = {
    ...parent,
    id: TraceId.parse(newId),
    events: newEvents,
  };

  return newTrace;
}

function eventsEqual(a: Event, b: Event): boolean {
  return (
    a.kind === b.kind &&
    a.summary === b.summary &&
    a.stage === b.stage &&
    JSON.stringify(a.refs) === JSON.stringify(b.refs)
  );
}