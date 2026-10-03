import type { EvidenceState } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * One row of a register.
 *
 * The row is the layout primitive of this system, so it carries the full
 * evidence contract on a single line: what the record is, what it says,
 * when it was recorded, what state its evidence is in, and the source
 * reference that makes the state inspectable. Provenance is not optional
 * — a row cannot render without it.
 *
 * On mobile the row recomposes into a definition list (see
 * `.register--std` in globals.css), because a four-column table at 360px
 * is not a responsive table, it is an unreadable one.
 */
export function RegisterRow({
  id,
  name,
  what,
  recorded,
  state,
  source,
  provenance,
}: {
  id: string;
  name: string;
  what: string;
  recorded: string;
  state: EvidenceState;
  /** The citable path — a route, a repository path, or both. */
  source: { label: string; href?: string };
  provenance: string;
}) {
  return (
    <div className="register-row register--std">
      <div className="register-cell register-cell--id">
        <div className="register-id">{id}</div>
        <div className="register-name" style={{ marginTop: 4 }}>
          {name}
        </div>
      </div>
      <div className="register-cell" data-field="Records">
        <div>{what}</div>
        <div className="register-provenance" style={{ marginTop: 8 }}>
          {provenance}
        </div>
      </div>
      <div className="register-cell" data-field="Recorded">
        <div className="register-date">{recorded}</div>
      </div>
      <div className="register-cell" data-field="State">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <StateTag state={state} title={provenance} />
          <div className="register-source">
            {source.href ? (
              <a href={source.href}>{source.label}</a>
            ) : (
              source.label
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The column headers for a standard register. */
export function RegisterHead() {
  return (
    <div className="register-head register--std" aria-hidden="true">
      <span>Record</span>
      <span>What it holds</span>
      <span>Recorded</span>
      <span>State</span>
    </div>
  );
}