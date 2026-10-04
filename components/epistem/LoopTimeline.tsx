import type { LoopOutcome, StageGate } from "@/lib/epistemic/adversarial";
import { nextStages, stageIndex } from "@/lib/epistemic/adversarial";
import { LOOP_STAGES, LOOP_STAGE_SPEC, type LoopStage } from "@/lib/epistemic/taxonomy";

/**
 * components/epistem/LoopTimeline.tsx -- THE ADVERSARIAL LOOP, AS A RECORD.
 *
 * ASIANCODER.MD names seven stages and then says the thing that decides
 * how they are drawn: capture structured artifacts, not hidden
 * reasoning. So this is a strip of ARTIFACT CONTRACTS, not a progress
 * bar. Each stage says what it must produce and the condition under
 * which it may be left, both quoted from LOOP_STAGE_SPEC rather than
 * restated here -- a second copy of those sentences would drift, and a
 * gate rule that has drifted from the gate is worse than no gate rule.
 *
 * -- Three things this component refuses to do ----------------------
 *
 *   1. Omit a stage. A stage the run never entered is a finding about
 *      the run, and a seven-cell strip with five cells drawn reads as a
 *      five-stage process. SKIPPED is a first-class cell with its own
 *      word.
 *
 *   2. Treat a missing gate as a passed gate. `gates` is optional
 *      because not every caller has evaluated it, so "no gate was
 *      supplied" is rendered as its own state. Absence of a check and
 *      a passed check are different claims, and collapsing them is how
 *      a pipeline comes to look like a process.
 *
 *   3. Draw the connector only forwards. `nextStages("CONVERGE")`
 *      returns INTUIT, and that edge is the difference between a cycle
 *      and a queue -- a loop that converged and then found the answer
 *      wrong must be able to start again. It is read from the function
 *      rather than typed into the markup, so it cannot be asserted here
 *      and contradicted there.
 *
 * Plain `div`s with list roles rather than `ol`/`li`: the stylesheet
 * that owns this surface resets no list markers, and an `ol` here would
 * ship decimal markers and 40px of padding inside a strip that is
 * supposed to read as an instrument. Roles carry the ordering to
 * assistive tech; the browser does not get to decorate.
 *
 * No `"use client"`: this surface has no state and no handlers. It is a
 * pure projection of `entered`, `gates` and `outcome`, so it renders in
 * a server component, in a test, or in a CLI inspector unchanged.
 */

export interface LoopTimelineProps {
  /** Stages the run actually entered. */
  entered?: readonly LoopStage[];
  /**
   * Gates by stage, as returned by `gateStage()`. This component never
   * authors a gate -- a blocker typed into a view is a blocker nobody
   * checked.
   */
  gates?: Partial<Record<LoopStage, StageGate>>;
  /** The whole run verdict, when one exists. Fills in `entered` and the blockers. */
  outcome?: LoopOutcome;
}

/* -- Presentation vocabulary --------------------------------------
   Four states, four words. The attribute drives the colour and the word
   carries the meaning, so a reader in monochrome, a reader with a
   colour filter, and a screen reader all get the same answer. */

type StageState = "entered" | "skipped" | "blocked" | "not-run";

const STATE_WORD: Record<StageState, string> = {
  entered: "ENTERED",
  skipped: "SKIPPED",
  blocked: "BLOCKED",
  "not-run": "NOT RUN",
};

/* Two-digit ordinals because this is an instrument: the register the
   site already uses is tabular, and a single-digit ordinal reads as a
   typo at a glance in a strip this narrow. */
function ordinal(stage: LoopStage): string {
  const i = stageIndex(stage);
  return i < 0 ? "--" : String(i + 1).padStart(2, "0");
}

export function LoopTimeline({ entered, gates, outcome }: LoopTimelineProps) {
  /* `outcome` is the fallback, never the override: a caller that passes
     `entered` explicitly is stating the run and must win over one
     derived from a trace. */
  const enteredStages = entered ?? outcome?.entered ?? [];

  /* Union blockers-from-the-run first, then caller-supplied gates over
     the top, so the more specific source wins a disagreement. */
  const gateByStage = new Map<LoopStage, StageGate>();
  for (const blocked of outcome?.blockedAt ?? []) {
    gateByStage.set(blocked.stage, blocked.gate);
  }
  for (const stage of LOOP_STAGES) {
    const gate = gates?.[stage];
    if (gate) gateByStage.set(stage, gate);
  }

  /* Blocked outranks entered. A stage that was entered and then could
     not be left is the most informative cell on the strip and `entered`
     would hide that behind a quieter state -- so the precedence is taken
     by the attribute, and the entered/skipped fact is printed in words
     inside the cell regardless, and nothing is lost by the choice. */
  const stateFor = (stage: LoopStage): StageState => {
    const gate = gateByStage.get(stage);
    if (gate && !gate.satisfied) return "blocked";
    if (enteredStages.includes(stage)) return "entered";
    if (enteredStages.length > 0) return "skipped";
    return "not-run";
  };

  const closes = nextStages("CONVERGE").includes("INTUIT");
  const converged = enteredStages.includes("CONVERGE");

  /* `changed` is nullable on purpose: null means the material-change
     test was never run, which is a different claim from "nothing
     changed". A system that prints NO for both is one that will
     eventually report a convergence it never measured, and that is
     exactly the CONVERGE stage's own test failing. */
  const changedReading =
    outcome === undefined || outcome.changed === null
      ? "NOT RUN - no loop outcome was supplied, so nothing here is a claim that the loop changed nothing."
      : outcome.changed
        ? "YES - the artifact differs from the one BOOTSTRAP produced."
        : "NO - the loop completed without materially changing the answer.";

  return (
    <div>
      <div
        className="ep-loop"
        role="list"
        aria-label="Adversarial loop stages"
      >
        {LOOP_STAGES.map((stage) => {
          const spec = LOOP_STAGE_SPEC[stage];
          const gate = gateByStage.get(stage);
          const state = stateFor(stage);

          return (
            <div
              className="ep-loop-stage"
              data-state={state}
              data-stage={stage}
              key={stage}
              role="listitem"
            >
              <p className="ep-loop-node">
                <span>{ordinal(stage)}</span>
                <span>{stage}</span>
                {/* Entered needs no word here: the absence of a state
                    word IS the entered state, and a seventh cell saying
                    ENTERED in the same place the blockers appear would
                    be one more thing to read. Every other state says
                    itself. */}
                {state === "entered" ? null : <span>{STATE_WORD[state]}</span>}
              </p>

              <p className="ep-loop-conn">
                <b>Produces </b>
                {spec.produces}
              </p>

              <p className="ep-loop-conn">
                <b>May leave when </b>
                {spec.mayProceedWhen}
              </p>

              {gate === undefined ? (
                /* The honest case, and the one a progress bar cannot
                   express: nobody checked. */
                <p className="ep-loop-conn">Gate NOT EVALUATED</p>
              ) : gate.satisfied ? (
                <p className="ep-loop-conn">Gate met</p>
              ) : (
                /* A stage that cannot be left is the point of the whole
                   module, so the blockers get their own box rather than
                   a line of small type among the stage copy. */
                <div className="ep-loop-gate" role="note">
                  <b>Blocked. </b>
                  This stage cannot be left until the conditions above are met.
                  <ul>
                    {gate.unmet.map((unmet) => (
                      <li key={unmet}>{unmet}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* The return edge. A seven-cell strip read left to right is a
          queue; without this the reader cannot tell that CONVERGE is a
          place the loop can come back through. */}
      <p className="ep-loop-conn">
        <b>Returns to INTUIT </b>
        {closes
          ? `after CONVERGE. ${
              converged
                ? "This run reached it."
                : "This run did not reach CONVERGE."
            }`
          : "CONVERGE does not return to INTUIT."}
      </p>

      {outcome ? (
        <p className="ep-loop-conn">
          <b>Material-change test </b>
          {changedReading} {outcome.summary}
        </p>
      ) : null}
    </div>
  );
}
