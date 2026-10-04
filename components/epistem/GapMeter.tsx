import type { CSSProperties } from "react";
import type { FluencyReading, GapReading } from "@/lib/epistemic/health";

/**
 * THE FLUENCY / EPISTEMIC GAP INSTRUMENT.
 *
 * ASIANCODER.MD asks for a prominent gap meter and then, immediately,
 * removes the reading everybody would have wanted from it: "This is not a
 * quality score. It is a danger signal." So this instrument is built to
 * refuse three readings at once.
 *
 * 1. THE NUMBER IS A DISTANCE, NOT A SCORE. The gap is a subtraction of two
 *    unrelated quantities. A large one means the prose is outrunning the
 *    evidence; a small one means the two are close, which is NOT the same
 *    as the artifact being good. A document that says almost nothing and
 *    supports almost nothing has a gap of zero and is worthless. So the
 *    status line never says "good", "bad", "pass" or "fail", and the signed
 *    figure is always stated as a relation between two named measures.
 *
 * 2. THE FLUENCY NUMBER IS A DECLARED PROXY. `measureFluency` measures
 *    sentence length, type-token ratio, connective density and hedge rate,
 *    and nothing else. Its `method` string and its four signals are printed
 *    verbatim, in full, rather than summarised, because the whole risk here
 *    is a reader who sees 0.94 and assumes a judgement of the writing. The
 *    signal rows exist so that anyone can see the proxy is shallow in the
 *    four statistics it actually counted.
 *
 * 3. SUPPORT IS NOT AVERAGEED. `supportBasis` carries the two axes support
 *    is drawn from, each with its own value and its own reason, so the
 *    support bar is never a number standing alone.
 *
 * The warning is written out in the contract's own words and carries its
 * own negation on the same line, because a flag that says only
 * "FLUENCY > EVIDENCE" gets screenshotted, pasted into a status update and
 * read as a quality verdict within a day. The sentence next to it is the
 * part that has to travel with it.
 *
 * Both bars share one 0 to 1 scale and are drawn from `reading`, not from a
 * second local calculation: the gap arithmetic in `measureGap` is the
 * authority on these two figures, and `fluency` is passed in only because
 * the reading carries no method text of its own.
 */

/** Per-status reading. None of these is ever an approval. */
const STATUS_GLOSS: Record<GapReading["status"], string> = {
  FLUENCY_ABOVE_SUPPORT:
    "The prose is outrunning the evidence behind it. Either the register rises or the evidence does; the contract's own response is to lower one of them, not to average them.",
  BALANCED:
    "The two measures are close. Balance is not accuracy: two low measures still agree with each other, and a document that states nothing measures close to nothing.",
  FLUENCY_BELOW_SUPPORT:
    "The prose is doing less work than the evidence is. A smaller gap is not a safer artifact; it is also what a document that asserts nothing looks like.",
  NOT_MEASURED:
    "There is nothing on the other side of the scale yet. An unmeasured axis is not a zero, and a document with no evidence behind it does not read as a document with a fluency problem.",
};

export function GapMeter({
  reading,
  fluency,
}: {
  reading: GapReading;
  /** The same call's `FluencyReading`, for the method and the four signals. */
  fluency: FluencyReading;
}) {
  const danger = reading.status === "FLUENCY_ABOVE_SUPPORT";
  const unmeasured = reading.status === "NOT_MEASURED";
  const gap = reading.gap === null ? "not established" : signed(reading.gap);

  return (
    <div className="ep-gap" data-status={reading.status}>
      {/* The flag exists only in the danger case. A meter that shows this
          row at all times has trained every reader to ignore it. */}
      {danger ? (
        <p className="ep-gap-flag">
          <span>FLUENCY &gt; EVIDENCE</span>{" "}
          <span>this is a danger signal, not a quality score</span>
        </p>
      ) : null}

      {/* Status and distance in one line, before the bars, because the
          bars are the evidence for this sentence rather than the headline. */}
      <p className="ep-gap-status">
        STATUS {reading.status} | GAP {gap} | fluency sits {relation(reading.gap ?? 0)}{" "}
        support on one shared 0.00 to 1.00 scale. A distance between two
        measures, not a score, and neither good nor bad on its own.
      </p>

      <div className="ep-gap-bars">
        <div
          className="ep-gap-bar"
          data-bar="FLUENCY"
          data-proxy="true"
          style={{ "--v": pct(reading.fluency) } as CSSProperties}
        >
          <span>FLUENCY - PROXY</span>
          <span>{reading.fluency.toFixed(2)}</span>
        </div>
        <div
          className="ep-gap-bar"
          data-bar="SUPPORT"
          style={
            { "--v": reading.support === null ? "0%" : pct(reading.support) } as CSSProperties
          }
          data-measured={reading.support === null ? "false" : "true"}
        >
          <span>EVIDENCE SUPPORT</span>
          {/* An unmeasured support is an EMPTY bar with a word, never a
              zero-width bar with a number. A bar at zero reads as a
              measurement of nothing; a bar with nothing in it reads as
              nobody having looked. */}
          <span>{reading.support === null ? "not measured" : reading.support.toFixed(2)}</span>
        </div>
      </div>

      {/* Verbatim. A paraphrase of the method would be the one place on
          this instrument where the wording could quietly improve the
          proxy's apparent reach, which is exactly the laundering it exists
          to prevent. */}
<p>METHOD: {fluency.method}</p>

      <dl>
        <dt>WHAT THE PROXY COUNTED</dt>
        {fluency.signals.map((s) => (
          <dd key={s.name}>
            {s.name} - {s.value.toFixed(2)} - {s.what}
          </dd>
        ))}
      </dl>

      <dl>
        <dt>WHERE SUPPORT CAME FROM</dt>
        {reading.supportBasis.map((b) => (
          <dd key={b.axis}>
            {b.axis} - {b.value === null ? "not measured" : b.value.toFixed(2)} -{" "}
            {b.why}
          </dd>
        ))}
      </dl>

      <p>{STATUS_GLOSS[reading.status]}</p>
    </div>
  );
}

/**
 * The gap as a signed figure.
 *
 * Anything inside half a hundredth prints as a flat `0.00`. A minus sign in
 * front of a displayed zero asserts that something was found below zero,
 * and a reader who spots that loses trust in the other eight digits.
 */
function signed(n: number): string {
  if (Math.abs(n) < 0.005) return "0.00";
  return `${n > 0 ? "+" : "-"}${Math.abs(n).toFixed(2)}`;
}

/** The same number in words, so the sign is never carried by the glyph. */
function relation(n: number): string {
  if (Math.abs(n) < 0.005) return "level with";
  return n > 0 ? "above" : "below";
}

/**
 * A 0..1 reading as a track width.
 *
 * Clamped here because a hand-built or deserialised `GapReading` is not
 * forced through `measureGap`, and a bar at `-30%` or `NaN%` is a bar that
 * lies about its own value more visibly than the numeral beside it does.
 */
function pct(n: number): string {
  if (Number.isNaN(n)) return "0%";
  return `${(Math.min(1, Math.max(0, n)) * 100).toFixed(1)}%`;
}
