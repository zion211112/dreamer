import type { Differential, DifferentialLane } from "@/lib/epistemic/health";

/**
 * THE EPISTEMIC DIFFERENTIAL.
 *
 * ASIANCODER.MD calls this "one of the most important screens" and gives
 * the reason: it "prevents narrative completion from being mistaken for
 * knowledge". The whole layout follows from that reason.
 *
 * Four lanes, four rows, never merged and never a diff. A diff would show
 * the two texts as a pair of changed lines and invite the reader to treat
 * them as the same kind of thing at different wording. They are not the
 * same kind of thing at all: one is a sentence, one is what the record
 * bears on it, one is what this system checked, and one is what is still
 * open. Four rows is the minimum that keeps those apart, and the order is
 * not cosmetic - it is the argument, running from what was said to what is
 * not known.
 *
 * The divergences get more ink than the lanes because they are the
 * instrument. The lanes are the material; the comparison between lanes is
 * what has no counterpart anywhere else in the system. ASIANCODER.MD's
 * example: the model said "because of migration", the evidence established
 * "population increased", the system can verify the increase occurred, and
 * the causal contribution is UNKNOWN. A reader who sees four rows and stops
 * reading has still learned that three of the four are silent, which is
 * most of the warning - but only a reader who reads the divergences learns
 * WHICH clause travelled alone.
 *
 * Every lane is rendered even when it is empty, because an empty lane is a
 * claim about the record and the most consequential lanes are the ones that
 * are often empty. Emptiness is stated in words and never left as a blank
 * box: a box with nothing in it reads as a rendering fault, and a reader
 * who assumes a fault will not go looking for what the emptiness means.
 *
 * The refs line is rendered verbatim because it is the only path from this
 * screen back to the statements themselves. Quality-bar item 7 asks whether
 * a reader can reconstruct why the system reached a conclusion, and a lane
 * that shows its own text but not the ids it came from cannot be followed.
 */

const LANE_GLOSS: Record<DifferentialLane, string> = {
  MODEL_SAID:
    "What the model wrote. A sentence is not a finding, and this lane carries no evidence of its own.",
  EVIDENCE_SUPPORTS:
    "What the recorded observations and facts bear on this claim.",
  VERIFIABLE:
    "What this system checked itself, from a named evidence path, at a derived confidence of 0.70 or above. Verified here is not true.",
  UNKNOWN:
    "What remains open. Rendered rather than omitted, because an unknown nobody can see is a hidden zero.",
};

const EMPTY_LANE =
  "Nothing is recorded in this lane. That is an absence of work in this system, not a fact about the world.";

export function Differential({ differential }: { differential: Differential }) {
  /* Rendered in the order the builder emits them, not re-sorted here. The
     builder already writes the four lanes in the order of the argument, and
     a second ordering in the view would be a second place for that sequence
     to drift out of step with the computation that explains it. */
  const rows = differential.rows;
  const divergences = differential.divergences;

  return (
    <div className="ep-diff" role="group" aria-label="Epistemic differential">
      <dl>
        {rows.map((row) => {
          const empty = row.text.trim().length === 0;

          return (
            <div
              className="ep-diff-lane"
              key={row.lane}
              data-lane={row.lane}
              data-empty={empty || undefined}
            >
              <dt className="ep-diff-lane-key">{row.lane}</dt>
              <dd className="ep-diff-lane-val">
                {/* An empty lane gets words, never an empty box. */}
                <p>{empty ? EMPTY_LANE : row.text}</p>
                <p>{LANE_GLOSS[row.lane]}</p>
                {/* Refs are printed, not counted. A count would say how many
                    and a reader would still not be able to open one. */}
                {row.refs.length > 0 ? <p>Backing: {row.refs.join(", ")}</p> : null}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* The divergences, as findings.

          Rendered as findings, each with its own ordinal. The ordinal is
          not decoration: it makes "this is one of three" legible at a
          glance, and it means the list can be referred to unambiguously by
          a reviewer writing a comment against this screen. */}
      <div data-section="divergences">
        <p className="ep-diff-lane-key">Divergences - {divergences.length}</p>

        {divergences.length === 0 ? (
          /* Not "no problems". An empty divergence list means this
             comparison found nothing it can name, which is a fact about the
             comparison: it can only find what the record already contains.
             Saying it in these words is the difference between an honest
             quiet surface and a green tick that was never earned. */
          <p>
            No divergence is recorded against this claim. That is a statement
            about this comparison, not about the claim: the differential can
            only find what the record already holds.
          </p>
        ) : (
          divergences.map((d, i) => (
            <div
              className="ep-diff-div"
              key={`${d.kind}-${i}`}
              data-kind={d.kind}
              data-ordinal={i + 1}
            >
              {/* The kind is rendered with its underscores opened into
                  spaces and kept verbatim on the container as
                  `data-kind`, so the enum token survives for anything
                  reading the DOM while the reader sees prose. */}
              <p className="ep-diff-lane-key">
                {String(i + 1).padStart(2, "0")} - {d.kind.replace(/_/g, " ")}
              </p>
              <p className="ep-diff-lane-val">{d.detail}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
