import type { CSSProperties } from "react";
import type { AxisReading } from "@/lib/epistemic/health";
import { HEALTH_AXIS_RULES } from "@/lib/epistemic/taxonomy";

/**
 * THE HEALTH VECTOR, ROW BY ROW.
 *
 * ASIANCODER.MD: "Do NOT create a simplistic overall 'AI quality score.'"
 * The domain model takes that further than a warning - `health.ts` contains
 * no aggregate function and explains the omission at length - so this
 * component must not reintroduce one by the back door.
 *
 * The tempting back doors, all refused here:
 *
 *   - a mean, median or weighted total of the nine axes. An average is a
 *     claim that a deficit in evidence and an excess in novelty are
 *     commensurable. They are not, and the number is what hides it.
 *   - a letter grade or a band ("B+"). Same defect, with a curve added.
 *   - a count dressed as a score ("6 of 9 axes healthy"). The count below is
 *     COVERAGE - how much of the vector anybody has looked at - and it is
 *     labelled as such. Six axes with no reading is not a middling vector;
 *     it is a mostly-unmeasured one, which is a different and worse thing.
 *
 * What each row carries instead: the axis name, the reading or an explicit
 * "not measured", the question the axis actually asks, the basis lines that
 * produced the number, what a high reading would mean, and what would raise
 * it. That is enough to satisfy the contract's bar - "Never produce 'Quality:
 * 92%' without explaining what that number means" - for a number whose
 * meaning is different on every row.
 *
 * `value: null` renders `not measured` and an empty track. Never `0`, never
 * a zero-length fill, never a dash a reader could mistake for a bottomed-out
 * bar. `health.ts` is explicit that an honest null "says where the system
 * has not looked", and this row is where that sentence has to survive
 * contact with a visual instrument.
 *
 * The `question` comes from the reading rather than from
 * `HEALTH_AXIS_RULES`, because the reading is what this row is about: a
 * caller may hand in an axis whose question has been restated for the
 * artifact in front of the reader. The two remaining rule fields are only
 * on the taxonomy, so they are read from there.
 */

export function HealthVector({ readings }: { readings: readonly AxisReading[] }) {
  const unmeasured = readings.filter((r) => r.value === null).length;

  return (
    <div className="ep-hv" role="group" aria-label="Epistemic health vector">
      {/* The refusal, stated on the surface rather than left to a comment
          in the domain model. A vector with no aggregate is a decision a
          reader is entitled to notice. */}
      <p>
        {readings.length} axes. There is no overall score and this component
        computes none: the axes disagree, and a single figure would resolve
        that disagreement by hiding it.{" "}
        {unmeasured === 0
          ? "Every axis carries a reading."
          : `${unmeasured} of ${readings.length} axes were not looked at - a statement about coverage, not a grade.`}
      </p>

      {readings.map((r) => {
        const value = r.value;
        const measured = value !== null;
        const rules = HEALTH_AXIS_RULES[r.axis];

        return (
          <div
            className="ep-hv-axis"
            key={r.axis}
            data-axis={r.axis}
            data-measured={measured ? "true" : "false"}
          >
            {/* Humanised, not the raw enum. `CATEGORY_INTEGRITY` in display
                type reads as a leaked constant rather than as an axis a
                person is responsible for, and this row is the one they
                are meant to act on. The machine-readable value stays on
                data-axis, so nothing is lost. */}
            <p>{r.axis.replace(/_/g, " ").toLowerCase()}</p>

            {measured ? (
              <p>{value.toFixed(2)}</p>
            ) : (
              <p className="ep-hv-null">not measured</p>
            )}

            {/* The track is rendered in both states. An axis with no reading
                gets an empty track rather than no track, because a missing
                bar is read as a broken component and an empty one is read
                as a bar that was never filled. `--v` is set on the track and
                on the fill so the stylesheet can drive the width from either
                node without the value having to be duplicated by hand. */}
            <div
              className="ep-hv-track"
              style={{ "--v": measured ? `${(value * 100).toFixed(1)}%` : "0%" } as CSSProperties}
              data-measured={measured ? "true" : "false"}
            >
              {measured ? (
                <span
                  className="ep-hv-fill"
                  style={{ "--v": `${(value * 100).toFixed(1)}%` } as CSSProperties}
                />
              ) : null}
            </div>

            <p>{r.question}</p>

            <div className="ep-hv-basis">
              {r.basis.length === 0 ? (
                /* Said in words, because an empty basis list renders as
                   nothing at all and a number with nothing under it is the
                   exact artefact this screen exists to prevent. */
                <p>
                  No basis is recorded for this reading. A figure with no
                  basis under it is what ASIANCODER.MD forbids.
                </p>
              ) : (
                <ul>
                  {r.basis.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>

            <p>A high reading means: {rules.highMeans}</p>

            <p>To raise it: {r.raise}</p>

            {/* Printed because it is the most useful sentence on the row
                and the easiest one to skip: every axis has a cheap way to
                look better that does not make it any truer. */}
            <p>It cannot be raised by: {rules.cannotBeIncreasedBy}</p>
          </div>
        );
      })}
    </div>
  );
}
