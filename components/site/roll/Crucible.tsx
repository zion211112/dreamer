"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { CRUCIBLE_QS, PASS_MARK, tierFor } from "@/lib/ledger";
import {
  answeredCount,
  blankAnswers,
  scoreCrucible,
  type CrucibleResult,
} from "./record";

/**
 * The crucible — eight questions, a progress rule, and the reasoning
 * behind each answer once one is chosen.
 *
 * Two decisions carry the honesty of the whole surface:
 *
 *   The reasoning is shown whether the choice was right or wrong, and it
 *   is shown the moment the choice is made. A test whose reasoning appears
 *   only after the result is a gate, not a test.
 *   Nothing is scored until all eight are answered, and any change
 *   re-derives the tier from scratch. There is no stored "achieved" flag
 *   to fall back on, because there is nobody to have awarded it.
 */

// Every fieldset carries a browser groove and internal padding. The question
// is a ruled row on the page, not a framed control, so the frame comes off
// inline rather than by a class that does not exist in floor.css.
const Q_FRAME: CSSProperties = { border: 0, margin: 0, padding: 0 };

export function Crucible({
  result,
  onRecord,
}: {
  /** The reading stored beside the record, or null if it has not been taken. */
  result: CrucibleResult | null;
  onRecord: (next: CrucibleResult | null) => void;
}) {
  const [answers, setAnswers] = useState<number[]>(
    result ? [...result.answers] : blankAnswers(CRUCIBLE_QS.length)
  );

  const answered = answeredCount(answers);
  const complete = answered === CRUCIBLE_QS.length;
  const score = scoreCrucible(CRUCIBLE_QS, answers);
  const reading = complete ? tierFor(score) : null;
  const done = Math.round((answered / CRUCIBLE_QS.length) * 100);

  function choose(qIndex: number, oIndex: number) {
    const next = answers.slice();
    next[qIndex] = oIndex;
    setAnswers(next);

    const finished = next.every((a) => a >= 0);
    if (!finished) return;

    const s = scoreCrucible(CRUCIBLE_QS, next);
    onRecord({
      score: s,
      ...tierFor(s),
      answers: next,
      takenAt: result?.takenAt ?? Date.now()
    });
  }

  function startOver() {
    setAnswers(blankAnswers(CRUCIBLE_QS.length));
    onRecord(null);
  }

  return (
    <section className="section" aria-labelledby="crucible-heading">
      <div className="section-head">
        <h2 className="section-title" id="crucible-heading">
          The crucible
        </h2>
        <p className="section-kicker">
          {CRUCIBLE_QS.length} questions · {PASS_MARK} to clear ·{" "}
          {answered}/{CRUCIBLE_QS.length} answered
        </p>
      </div>

      <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
        <p>
          Each question is arithmetic you have already done in a real week: a
          bus load, desks in a classroom, a tank filling, fees clearing in
          instalments. Nothing is timed, nothing is looked up, and nothing is
          sent. Choose an answer and the reasoning appears under it — including
          when the answer was wrong, because a test you cannot learn from is
          only a gate.
        </p>
      </div>

      <div
        className="crucible-bar"
        style={{ "--done": `${done}%` } as CSSProperties}
        role="img"
        aria-label={`${answered} of ${CRUCIBLE_QS.length} questions answered`}
      />

      <div className="crucible" style={{ marginTop: "var(--s-4)" }}>
        {CRUCIBLE_QS.map((q, qi) => (
          <fieldset className="crucible-q" key={qi} style={Q_FRAME}>
            <legend>
              <span className="field-label" style={{ marginRight: 8 }}>
                Q{String(qi + 1).padStart(2, "0")}
              </span>
              {q.q}
            </legend>
            <div className="choices">
              {q.options.map((o, oi) => (
                <label
                  className="choice"
                  key={oi}
                  data-on={answers[qi] === oi ? "true" : "false"}
                >
                  <input
                    type="radio"
                    name={`crucible-q${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => choose(qi, oi)}
                  />
                  {o}
                </label>
              ))}
            </div>
            {answers[qi] >= 0 ? <p className="crucible-why">{q.why}</p> : null}
          </fieldset>
        ))}
      </div>

      <div style={{ marginTop: "var(--s-4)" }}>
        {reading ? (
          <div className="roll-card">
            <div className="action-row">
              <span className="tier-badge" data-pass={reading.pass ? "true" : "false"}>
                {reading.tier}
              </span>
              <span className="register-provenance">
                {score}/{CRUCIBLE_QS.length} correct ·{" "}
                {reading.pass ? "above the pass mark" : "below the pass mark"}
              </span>
            </div>

            <p className="register-provenance" style={{ marginTop: "var(--s-3)" }}>
              {reading.pass
                ? `Above the pass mark of ${PASS_MARK}/${CRUCIBLE_QS.length}. This tier is a reading of how you answered, derived in this tab from the answers above — not a status issued by anyone, not a certificate, not a membership of anything, and worth nothing on any other surface. Change one answer and it is derived again.`
                : `Below the pass mark of ${PASS_MARK}/${CRUCIBLE_QS.length}, so the seat this reading describes stays closed until you come back — ${reading.retryDays} days. That number is the reading's own arithmetic, not a lock: nothing on this device stops you taking it again today, and no one is told that you sat it.`}
            </p>
          </div>
        ) : (
          <div className="gate">
            {CRUCIBLE_QS.length - answered} question
            {CRUCIBLE_QS.length - answered === 1 ? "" : "s"} left. Nothing is
            scored until the last one is answered — there is no partial tier
            and no partial reading stored on your record.
          </div>
        )}
      </div>

      <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
        <button type="button" className="btn-ghost btn-sm" onClick={startOver}>
          Start the crucible over
        </button>
        <p className="hint" style={{ maxWidth: "44ch" }}>
          Clears the reading from your record and the answers from this tab.
          The questions do not change and nothing is kept server-side, because
          there is no server-side.
        </p>
      </div>
    </section>
  );
}