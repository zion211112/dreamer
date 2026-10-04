/**
 * lib/epistemic/trace.ts — THE TRACE SYSTEM.
 *
 * ASIANCODER.MD: "Every run produces a trace... Make the trace replayable.
 * Think debugger, not chat transcript." And: replay, fork, compare, diff,
 * rollback, pin, branch, annotate, export.
 *
 * All nine are operations on an ordered event list, which is why `Trace`
 * is an array and not a mutable document. Replay is iteration. Diff is a
 * fold. Fork is a prefix plus a new head. None of them needs to rewrite
 * what happened, so none of them does.
 *
 * WHY THIS IS NOT A CHAT TRANSCRIPT
 * ---------------------------------
 * A transcript records what was SAID. A trace records what was DONE and
 * what STATE it changed. The distinction shows up in the first event
 * below: a transcript starts with a user message, and this starts with
 * the generation settings, because those are the thing that explains the
 * rest. There is no mechanism here for recording hidden reasoning, and
 * that is by design rather than by omission — ASIANCODER.MD asks for
 * structured artifacts, not chain-of-thought, and an epistemic system that
 * stored raw model reasoning would be storing the one part of the pipeline
 * it cannot audit.
 *
 * FORK IS THE INTERESTING ONE
 * ---------------------------
 * "Change only assumption #4" is expressible here because a fork records
 * `forkedAtEventIndex`, so the prefix is provably identical and the diff
 * between the two runs is exactly the change that was requested. `diffTraces`
 * below returns that difference, so a forked run can prove it only touched
 * what it said it touched.
 */

import type { Actor, Trace, TraceEvent } from "./model";
import { TRACE_EVENT_KINDS } from "./model";
import type { LoopStage } from "./taxonomy";
import { EventId, TraceId } from "./model";

/* ═══════════════════════════════════════════════════════════════════
   APPENDING
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Append an event. The ONLY mutation `Trace` supports.
 *
 * Every other operation is derived. There is no `updateTrace`, no
 * `deleteEvent`, no `reorder` — because the value of a trace is that it
 * is append-only, and an API that permits edits cannot be trusted to have
 * been used correctly by a caller. If a caller needs to record that
 * something changed, it records the change.
 */
export function appendEvent(
  trace: Trace,
  event: Omit<TraceEvent, "id"> & { id?: string }
): Trace {
  return {
    ...trace,
    events: [
      ...trace.events,
      { ...event, id: (event.id ?? EventId.parse(`ev-${trace.events.length + 1}`)) as TraceEvent["id"] },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════
   REPLAY
   ═══════════════════════════════════════════════════════════════════ */

export interface ReplayFrame {
  index: number;
  at: string;
  /** What the run was doing at this point, for the scrubber. */
  label: string;
  kind: string;
  /** Events of each kind seen up to and including this frame. */
  runningCount: Record<string, number>;
  guardsSoFar: number;
  humanInterventions: number;
}

/**
 * Replay as a timeline.
 *
 * The running counts are the point. A trace scrubber that shows only "step
 * 7 of 23" is a video player; one that shows how many guards had fired by
 * step 7 and how many times a human had intervened lets a reviewer see
 * WHERE the run went wrong, which is the entire use of a debugger-shaped
 * trace.
 */
export function replay(trace: Trace): ReplayFrame[] {
  const runningCount: Record<string, number> = {};
  let guardsSoFar = 0;
  let humanInterventions = 0;

  return trace.events.map((e, index) => {
    runningCount[e.kind] = (runningCount[e.kind] ?? 0) + 1;
    if (e.guards.length > 0) guardsSoFar += e.guards.length;
    if (e.kind === "HUMAN_INTERVENTION") humanInterventions += 1;

    return {
      index,
      at: e.at,
      label: e.summary,
      kind: e.kind,
      runningCount: { ...runningCount },
      guardsSoFar,
      humanInterventions,
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   FORK
   ═══════════════════════════════════════════════════════════════════ */

export interface ForkResult {
  trace: Trace;
  /** Where it diverged. Asserted, not assumed. */
  divergedAt: number;
}

/**
 * Fork a trace at an event index.
 *
 * The prefix is copied verbatim and `forkedAtEventIndex` records where.
 * That is what lets `diffTraces` prove a fork changed only what it claimed
 * to change, which is the property that makes forking useful for research
 * rather than merely available.
 *
 * Throws rather than clamping when the index is out of range: a fork that
 * silently snapped to the nearest valid point would produce a trace that
 * looks correct and diverges somewhere other than where the caller asked,
 * and the diff would then be reading as a lie.
 */
export function forkTrace(
  trace: Trace,
  atIndex: number,
  newId: string,
  label?: string
): ForkResult {
  if (atIndex < 0 || atIndex > trace.events.length) {
    throw new Error(
      `Cannot fork ${trace.id} at event ${atIndex}: the trace has ${trace.events.length} events (valid range 0..${trace.events.length}).`
    );
  }

  const forked: Trace = {
    ...trace,
    id: TraceId.parse(newId),
    task: label ? `${label}` : trace.task,
    /* The prefix keeps its original event ids. Duplicated ids across
       traces are fine — a trace id plus an event index is the address, and
       keeping them identical is what makes the prefix verifiable. */
    events: trace.events.slice(0, atIndex),
    parentTraceId: trace.id,
    forkedAtEventIndex: atIndex,
    finalArtifactId: undefined,
    annotations: [],
  };

  return { trace: forked, divergedAt: atIndex };
}

/* ═══════════════════════════════════════════════════════════════════
   DIFF
   ═══════════════════════════════════════════════════════════════════ */

export interface TraceDiff {
  commonPrefix: number;
  added: { index: number; event: TraceEvent }[];
  removed: { index: number; event: TraceEvent }[];
  /** Events that occupy the same slot but differ in content. */
  changed: { index: number; from: TraceEvent; to: TraceEvent }[];
  /** True when the fork's prefix is byte-identical to its parent's. */
  prefixHonest: boolean;
  /** Statement-level differences, which is what a reviewer usually wants. */
  statementDelta: { added: string[]; removed: string[] };
}

/**
 * Diff two traces.
 *
 * `prefixHonest` is the assertion that matters. If a fork claims to have
 * diverged at index N and the two traces differ at index M < N, the fork
 * has rewritten history and the diff says so. Without that field a
 * fabricated fork — one that quietly re-ran earlier steps — would be
 * indistinguishable from an honest one, and the entire experimental
 * methodology would rest on nothing.
 */
export function diffTraces(parent: Trace, child: Trace): TraceDiff {
  const limit = Math.min(parent.events.length, child.events.length);

  let commonPrefix = 0;
  while (
    commonPrefix < limit &&
    eventsEqual(parent.events[commonPrefix], child.events[commonPrefix])
  ) {
    commonPrefix += 1;
  }

  const added: TraceDiff["added"] = [];
  const removed: TraceDiff["removed"] = [];
  const changed: TraceDiff["changed"] = [];

  for (let i = commonPrefix; i < limit; i++) {
    if (eventsEqual(parent.events[i], child.events[i])) continue;
    removed.push({ index: i, event: parent.events[i] });
    added.push({ index: i, event: child.events[i] });
    changed.push({ index: i, from: parent.events[i], to: child.events[i] });
  }
  for (let i = limit; i < child.events.length; i++) {
    added.push({ index: i, event: child.events[i] });
  }
  for (let i = limit; i < parent.events.length; i++) {
    removed.push({ index: i, event: parent.events[i] });
  }

  const parentRefs = new Set(parent.events.flatMap((e) => e.refs));
  const childRefs = new Set(child.events.flatMap((e) => e.refs));

  return {
    commonPrefix,
    added,
    removed,
    changed,
    prefixHonest: child.forkedAtEventIndex === undefined ||
      child.forkedAtEventIndex === commonPrefix ||
      commonPrefix >= (child.forkedAtEventIndex ?? 0),
    statementDelta: {
      added: [...childRefs].filter((r) => !parentRefs.has(r)),
      removed: [...parentRefs].filter((r) => !childRefs.has(r)),
    },
  };
}

/**
 * Event equality for the fork-prefix check.
 *
 * The first version compared only `kind`, `summary`, `stage` and `refs`.
 * Those are the cosmetic fields. A fork that rewrote `actor` from MODEL to
 * HUMAN, dropped a `guards` array containing a CRITICAL finding, and
 * rewrote a metric diffed as a byte-identical prefix with
 * `prefixHonest: true`.
 *
 * That defeats the entire purpose of `prefixHonest`. The field exists to
 * prove a fork changed only what it claimed to change, and a child that
 * erases a finding and steals authorship is precisely the case it has to
 * catch. Comparing the fields that carry the epistemics is not a stricter
 * policy; it is the only version of the comparison that means anything.
 */
function eventsEqual(a: TraceEvent, b: TraceEvent): boolean {
  return (
    a.kind === b.kind &&
    a.summary === b.summary &&
    a.stage === b.stage &&
    a.actor.type === b.actor.type &&
    /* Authorship is compared by value, not just by type: two events both
       typed MODEL but credited to different actors are not the same event. */
    actorKey(a.actor) === actorKey(b.actor) &&
    a.guards.length === b.guards.length &&
    a.guards.every((g, i) => g === b.guards[i]) &&
    /* `metrics` is a Record, so it has no `.length` — comparing it that way
       silently returns undefined === 0, i.e. false, for EVERY event pair
       including two references to the same object. */
    Object.keys(a.metrics).length === Object.keys(b.metrics).length &&
    Object.entries(a.metrics).every(([k, v]) => b.metrics[k] === v) &&
    a.refs.length === b.refs.length &&
    a.refs.every((r, i) => r === b.refs[i])
  );
}

function actorKey(a: Actor): string {
  switch (a.type) {
    case "MODEL":
      return `MODEL:${a.capability}:${a.provider ?? "unset"}`;
    case "HUMAN":
      return `HUMAN:${a.actorId}`;
    case "TOOL":
      return `TOOL:${a.toolId}`;
    case "SYSTEM":
      return `SYSTEM:${a.component}`;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   ROLLBACK
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Roll back to an event index.
 *
 * Implemented as a NEW trace whose events are the truncated prefix, with
 * the truncation itself recorded as an event. It does not mutate the
 * original, because "undo" in a system whose trace is its memory must
 * leave a mark: the fact that a run was rolled back, and where, is
 * information. A trace that silently lost its tail would be
 * indistinguishable from a run that never had one.
 */
export function rollbackTrace(
  trace: Trace,
  toIndex: number,
  actor: Actor,
  newId: string,
  reason: string
): Trace {
  if (toIndex < 0 || toIndex >= trace.events.length) {
    throw new Error(
      `Cannot roll ${trace.id} back to ${toIndex}: the trace has ${trace.events.length} events.`
    );
  }

  const truncated = trace.events.slice(0, toIndex);

  const rolled: Trace = {
    ...trace,
    id: TraceId.parse(newId),
    parentTraceId: trace.id,
    events: [
      ...truncated,
      {
        id: EventId.parse(`ev-rollback-${toIndex}`) as TraceEvent["id"],
        at: new Date().toISOString(),
        kind: "RUN_FORKED",
        actor,
        summary: `Rolled back to event ${toIndex}: ${reason}`,
        refs: [],
        guards: [],
        metrics: { rolledBackFrom: trace.events.length, rolledBackTo: toIndex },
      },
    ],
    finalArtifactId: undefined,
    annotations: [],
  };

  return rolled;
}

/* ═══════════════════════════════════════════════════════════════════
   PIN, ANNOTATE, EXPORT
   ═══════════════════════════════════════════════════════════════════ */

/** Pin an event. Appends; there is no unpin that erases the fact. */
export function pinEvent(
  trace: Trace,
  eventIndex: number,
  note: string
): Trace {
  return {
    ...trace,
    annotations: [
      ...trace.annotations,
      {
        at: new Date().toISOString(),
        actorId: "local",
        at_event: eventIndex,
        note: `[pin] ${note}`,
      },
    ],
  };
}

export function annotateTrace(
  trace: Trace,
  eventIndex: number,
  actorId: string,
  note: string
): Trace {
  return {
    ...trace,
    annotations: [
      ...trace.annotations,
      { at: new Date().toISOString(), actorId, at_event: eventIndex, note },
    ],
  };
}

/**
 * Export as JSON.
 *
 * The domain model is zod-validated, so an exported trace is re-parseable
 * on the way back in. That round-trip is the property that makes export
 * worth having: without it an export is a screenshot of a belief.
 */
export function exportTrace(trace: Trace): string {
  return JSON.stringify(
    {
      format: "aptlabs.trace.v1",
      exportedAt: new Date().toISOString(),
      trace,
    },
    null,
    2
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUMMARIES
   ═══════════════════════════════════════════════════════════════════ */

export interface TraceSummary {
  id: string;
  task: string;
  events: number;
  /** Which loop stages were actually entered, in order. */
  stagesEntered: string[];
  /** Stages skipped. Silence is a finding, not an absence. */
  stagesSkipped: string[];
  guardsRaised: number;
  guardsCritical: number;
  humanInterventions: number;
  isFork: boolean;
  parent: string | null;
  durationMs: number | null;
}

/**
 * Summarise a trace for a list.
 *
 * `stagesSkipped` is the field worth having. An adversarial loop that goes
 * straight to INTEGRATE without ever calling ATTACK has produced a
 * synthesis with nothing attacking it, and a list that only reports which
 * stages ran would not show that. The gaps are the finding.
 */
export function summariseTrace(trace: Trace, allStages: readonly string[]): TraceSummary {
  const entered = trace.events
    .map((e) => e.stage)
    .filter((s): s is LoopStage => s !== undefined);
  const unique: string[] = [...new Set<string>(entered)];

  const first = trace.events[0]?.at;
  const last = trace.events[trace.events.length - 1]?.at;
  const durationMs =
    first && last ? new Date(last).getTime() - new Date(first).getTime() : null;

  const guardTotal = trace.events.reduce((n, e) => n + e.guards.length, 0);

  return {
    id: trace.id,
    task: trace.task,
    events: trace.events.length,
    stagesEntered: unique,
    stagesSkipped: allStages.filter((s) => !unique.includes(s)),
    guardsRaised: guardTotal,
    guardsCritical: trace.events
      .flatMap((e) => e.guards)
      .length,
    humanInterventions: trace.events.filter((e) => e.kind === "HUMAN_INTERVENTION").length,
    isFork: trace.parentTraceId !== undefined,
    parent: trace.parentTraceId ?? null,
    durationMs,
  };
}