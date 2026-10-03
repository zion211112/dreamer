import type { EvidenceState } from "@/lib/system";
import { EVIDENCE_STATES } from "@/lib/system";

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
 *
 * Each cell also draws its count as a share of the largest count on that
 * surface, so the shape of the distribution is legible before the digits
 * are read. The bar is inside the aria-hidden list and duplicated in a
 * sentence for screen readers: a decorative channel that carries live
 * information is noise in a list, not redundancy. A zero still draws its
 * 1px stub — a missing bar would read as "not applicable", which is a
 * different statement from "none".
 */
export function Tally({
  records,
  caption,
}: {
  records: readonly { state: EvidenceState }[];
  /** What is being counted — names the unit, never implies more. */
  caption: string;
}) {
  const rows = EVIDENCE_STATES.map((state) => ({
    state,
    count: records.filter((r) => r.state === state).length,
  }));
  const total = records.length;
  const largest = Math.max(...rows.map((r) => r.count));

  return (
    <div>
      <p className="label" style={{ marginBottom: 10 }}>
        Inspection tally · {total} {caption}
      </p>

      <p className="sr-only">
        Evidence distribution across {total} {caption}:{" "}
        {rows.map((r) => `${r.count} ${r.state}`).join(", ")}.
      </p>

      <ul className="tally" aria-hidden="true">
        {rows.map(({ state, count }) => (
          <li className="tally-cell" data-state={state} key={state}>
            <div className="tally-count figure">{count}</div>
            <div className="tally-key">{state}</div>
            <div
              className="tally-bar"
              style={
                {
                  "--share": `${largest > 0 ? (count / largest) * 100 : 0}%`,
                } as React.CSSProperties
              }
            />
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