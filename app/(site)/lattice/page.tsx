import type { Metadata } from "next";
import Link from "next/link";
import { Lattice } from "@/components/site/lattice/Lattice";
import { StateTag } from "@/components/site/StateTag";
import { buildLattice, latticeTally } from "@/lib/lattice";
import { EVIDENCE_STATES, STATE_RULES } from "@/lib/system";

export const metadata: Metadata = {
  title: "Lattice",
  description:
    "The control plane and the value chain drawn as one walkable topology, derived entirely from the site's own register.",
};

/**
 * The lattice — the system's topology, walkable.
 *
 * Two claims on this route, and the second one is the load-bearing one:
 *
 *   1. Infrastructure is a graph. Five stages on a closed loop, seven
 *      transformations on a closed loop beside them, six builds hung off
 *      the stage each exercises.
 *   2. Every pixel of it is derived. Nothing on the canvas is typed in
 *      here — it is all computed from lib/system.ts at request time, so a
 *      claim cannot reach the canvas without already existing in the
 *      register.
 *
 * What this route deliberately does not have, because none of it is
 * established: node counts, uptime, capital routed, throughput, matched
 * pools. A control room of this shape normally carries three headline
 * figures, and all three would have been invented. An unknown drawn as a
 * node on a glowing graph is more persuasive than an unknown written
 * down as an em dash, which is precisely why it is not drawn.
 */
export default function LatticePage() {
  const { nodes } = buildLattice();
  const tally = latticeTally(nodes);
  const described = tally.filter((row) => row.count > 0);

  return (
    <>
      <p className="label">The lattice — derived topology</p>
      <h1 className="page-title">
        The topology, drawn from the register rather than from a diagram.
      </h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>
        Three columns, read left to right in the order the system claims
        things happen: the seven transformations produce, the five
        control-plane stages decide, the six builds realise. Both loops
        close on themselves — measure feeds observe, and evidence returns
        to the field. Pan, zoom and select; the record panel and the
        register below the canvas are the same selection, so the canvas
        never has to be the only way in.
      </p>

      <Lattice />

      {/* ── WHAT IS NOT ON IT ─────────────────────────────────
          The absence is the argument. Publishing what a system has
          not established is the whole point of the register, and
          this is the one route where the reader is most likely to
          assume a live deployment. */}
      <section className="section" aria-labelledby="absent-heading">
        <div className="section-head">
          <h2 className="section-title" id="absent-heading">
            What is not on this canvas
          </h2>
          <p className="section-kicker">
            {described.length} of {EVIDENCE_STATES.length} states present
          </p>
        </div>

        <div className="prose">
          <p>
            The figures a topology of this shape normally leads with are
            absent, and each is absent for the same reason: there is no
            evidence path for it. No institution is running the console, so
            there is no uptime. No cohort has been assessed, so there is no
            measured outcome. No payment data is held here, so there is no
            collection rate.
          </p>
          <p>
            What is here is narrower and checkable —{" "}
            {described
              .map((row) => `${row.count} ${row.state.toLowerCase()}`)
              .join(", ")}{" "}
            — computed from the register rather than typed beside it.
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="absent-heading">
          <div className="register-head register--quad" role="row">
            <span role="columnheader">State</span>
            <span role="columnheader">On this canvas</span>
            <span role="columnheader">It permits</span>
            <span role="columnheader">It forbids</span>
          </div>
          {EVIDENCE_STATES.map((state) => {
            const count = tally.find((row) => row.state === state)?.count ?? 0;
            return (
              <div className="register-row register--quad" role="row" key={state}>
                <div className="register-cell" role="cell" data-field="State">
                  <StateTag state={state} />
                </div>
                {/* A state with no node here is not a zero. globals.css is
                    explicit that UNKNOWN is rendered dashed and quiet,
                    never omitted and never as an empty cell, and this
                    route is the one place a reader is most likely to read
                    "0" as a measurement. So the figure is an em dash
                    beside the state tag, and the tag carries the state. */}
                <div className="register-cell" role="cell" data-field="Count">
                  {count > 0 ? (
                    <div className="register-figure figure">{count}</div>
                  ) : (
                    <div className="register-figure figure register-figure--unknown">
                      <StateTag state={state} />
                    </div>
                  )}
                </div>
                <div className="register-cell" role="cell" data-field="Permits">
                  <div className="register-provenance">
                    {STATE_RULES[state].permits}
                  </div>
                </div>
                <div className="register-cell" role="cell" data-field="Forbids">
                  <div className="register-provenance">
                    {STATE_RULES[state].forbids}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="action-row">
        <Link href="/evidence" className="btn">
          The evidence register
        </Link>
        <Link href="/" className="btn-ghost">
          Back to the loop
        </Link>
      </div>
    </>
  );
}