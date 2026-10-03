import type { EvidenceState } from "@/lib/system";
import { EVIDENCE_STATES, tally } from "@/lib/system";

/**
 * The inspection tally — the FIELD STATION's count of what a surface
 * actually holds, by evidence state.
 *
 * Counts are computed from the records rendered on the page, not typed
 * in by hand. A tally that disagrees with its rows is a bug, so the two
 * are always derived from one array.
 *
 * Markup is a real list: a screen reader hears "0, VERIFIED" per item
 * under a labelled group, which is exactly the reading a sighted user
 * gets. (An earlier role="table" here was invalid ARIA — cells with no
 * rows — and announced a table that did not exist.)
 *
 * Every state is shown, including the zeros: "0 VERIFIED" is a statement
 * about this surface, and hiding it would let the reader assume the
 * column was not applicable.
 */
export function Tally({
  records,
  caption,
}: {
  records: readonly { state: EvidenceState }[];
  /** What is being counted — names the unit, never implies more. */
  caption: string;
}) {
  const rows = tally(records.map((r) => r.state));
  const total = records.length;

  return (
    <div>
      <p className="label" style={{ marginBottom: 10 }}>
        Inspection tally · {total} {caption}
      </p>
      <ul
        className="tally"
        aria-label={`Evidence distribution across ${total} ${caption}`}
      >
        {rows.map(({ state, count }) => (
          <li className="tally-cell" key={state}>
            <div className="tally-count">{count}</div>
            <div className="tally-key">{state}</div>
          </li>
        ))}
      </ul>
      <p className="register-provenance" style={{ marginTop: 10 }}>
        Counted from the {total} {caption} listed on this surface.{" "}
        {EVIDENCE_STATES.length} states are tracked; a zero means none of this
        state appears here.
      </p>
    </div>
  );
}