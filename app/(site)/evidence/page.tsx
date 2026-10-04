import type { Metadata } from "next";
import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { StateTag } from "@/components/site/StateTag";
import {
  COMPANY,
  CONTRACT_RULES,
  EVIDENCE_STATES,
  STATE_RULES,
  UNKNOWN_FACTS,
} from "@/lib/system";

export const metadata: Metadata = {
  title: "Evidence",
  description:
    "The five evidence states, what each one permits and forbids, and everything APT-LABS does not yet know.",
};

export default function EvidencePage() {
  return (
    <>
      <p className="label">Node 05 · Evidence — the loop closes</p>
      <h1 className="page-title">
        What this system knows, what it can do, and what it has not established.
      </h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>This is the route where the system is most likely to lie, so it is
          written as a register of limits rather than a page of claims. Five
          states, each with what it permits and what it forbids. A claim
          without a state is not publishable, and a state without a source is
          not a state at all.</p>

      <div style={{ marginTop: "var(--s-4)" }}>
        <StatusBand />
      </div>

      {/* The five states, each with its constraint. "Forbids" is the
          more important column: it is what stops a state from being
          quietly upgraded into a stronger one somewhere downstream. */}
      <section className="section" aria-labelledby="states-heading">
        <div className="section-head">
          <h2 className="section-title" id="states-heading">
            The evidence states
          </h2>
          <p className="section-kicker">
            {EVIDENCE_STATES.length} states · typed once, checked in CI
          </p>
        </div>

        {/* The old kicker here said "enforced in code". That was a claim
            about something no code enforced: the TypeScript union makes a
            state tag well-typed, and scripts/check-contrast.mjs checks the
            temperature scale, but nothing checked whether a given sentence
            obeyed its own state's `permits` clause. RULE-06 was worse
            still — the union had five members and six rules.

            The narrower claim below is the true one, and it is worth more
            than the broad one was: the state vocabulary is declared once,
            the CI asserts the things a machine can actually assert, and a
            sentence that breaks its rule is a review problem rather than a
            build failure. Saying that plainly is what a register is for. */}

        <div className="register" role="table" aria-labelledby="states-heading">
          {EVIDENCE_STATES.map((state) => (
            <div
              className="register-row" role="row"
              key={state}
              style={{ gridTemplateColumns: "132px minmax(0,1fr) minmax(0,1fr)" }}
            >
              <div className="register-cell register-cell--id" role="cell">
                <StateTag state={state} />
              </div>
              <div className="register-cell" role="cell" data-field="Permits">
                <p style={{ margin: 0 }}>{STATE_RULES[state].permits}</p>
              </div>
              <div className="register-cell" role="cell" data-field="Forbids">
                <p style={{ margin: 0 }} className="register-provenance">
                  {STATE_RULES[state].forbids}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The five contract rules as a register — the same information in
          the same visual language as everything else, so the rules
          look like records rather than like policy. */}
      <section className="section" aria-labelledby="rules-heading">
        <div className="section-head">
          <h2 className="section-title" id="rules-heading">
            The epistemic contract
          </h2>
          <p className="section-kicker">{CONTRACT_RULES.length} rules</p>
        </div>

        <div className="register" role="table" aria-labelledby="rules-heading">
          <div className="register-head register--std" role="row">
            <span role="columnheader">Rule</span>
            <span role="columnheader">Equals</span>
            <span role="columnheader">Never</span>
            <span role="columnheader">State</span>
          </div>
          {CONTRACT_RULES.map((r) => (
            <div className="register-row register--std" role="row" key={r.id}>
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-id">{r.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {r.subject}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Equals">
                <div>{r.equals}</div>
              </div>
              <div className="register-cell" role="cell" data-field="Never">
                <div className="register-provenance" style={{ maxWidth: "46ch" }}>
                  {r.doesNotEqual}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="State">
                <StateTag state={r.subject} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Everything the system is commonly asked for and does not
          have. No inspection tally under this table: every row is
          UNKNOWN by construction, so a distribution here would only
          restate the count already in the kicker and the state tag
          on each row. */}
      <section className="section" aria-labelledby="unknowns-heading">
        <div className="section-head">
          {/* This heading was "Published unknowns", which is the title a
              research programme gives its register of gaps. Every company
              has this register; the difference is what it is filed under.
              Filing a missing customer, a missing revenue figure and a
              missing company registration beneath a heading about published
              unknowns is what made the previous version of this site read
              as a study rather than as a business — and it put a missing
              company in the same category as an unmeasured cohort. */}
          <h2 className="section-title" id="unknowns-heading">
            What is not established
          </h2>
          <p className="section-kicker">
            {UNKNOWN_FACTS.length} open questions · none is a measurement
          </p>
        </div>

        <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
          <p>
            A gap that is named is a question. A gap that is omitted reads as
            a zero and gets quoted as one. These five are the first things a
            reader asks and none of them has an answer yet.
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="unknowns-heading">
          <div className="register-head register--std" role="row">
            <span role="columnheader">Not established</span>
            <span role="columnheader">Why</span>
            <span role="columnheader">Open since</span>
            <span role="columnheader">State</span>
          </div>
          {UNKNOWN_FACTS.map((u) => (
            <div className="register-row register--std" role="row" key={u.id}>
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-id">{u.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {u.what}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Why unknown">
                <div className="register-provenance" style={{ maxWidth: "54ch" }}>
                  {u.why}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Open since">
                <div className="register-date">{u.since}</div>
              </div>
              <div className="register-cell" role="cell" data-field="State">
                <StateTag state="UNKNOWN" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The geography, in its true form.

          This was labelled "Operating geography" above the value, with a
          StateTag reading UNKNOWN beside it and a note conceding "no field
          presence is evidenced". The label asserted a market claim that the
          note withdrew three lines lower, and the contradiction was the
          whole visible content of the section: a reader could take either
          half and neither was wrong on its own.

          Kirinyaga is a fact about where the company builds from and the
          region the first product is made for. That is true, it is not
          embarrassing, and it cannot be read as a footprint — so it is
          labelled that way and the operating claim is not made at all. */}
      <section className="section" aria-labelledby="geo-heading">
        <div className="section-head">
          <h2 className="section-title" id="geo-heading">
            Where this is built
          </h2>
          <StateTag state={COMPANY.geography.state} />
        </div>

        <div className="measure-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)" }}>
          <div className="measure-cell">
            <div className="measure-figure" style={{ fontSize: "clamp(18px,2vw,24px)" }}>
              {COMPANY.geography.value}
            </div>
            <div className="measure-key">{COMPANY.geography.scope}</div>
          </div>
          <div className="measure-cell">
            <div className="measure-note" style={{ marginTop: 0, maxWidth: "56ch" }}>
              {COMPANY.geography.provenance}
            </div>
          </div>
        </div>
      </section>

      {/* The next action is the control plane, not a capability. A bare
          link to /console at the foot of this route would let a reader
          reach the built surface without reading the evidence state that
          governs it, which is the one thing this route exists to prevent.
          The built surface's own provenance is published on its route. */}
      <section className="section">
        <div className="action-row">
          <Link href="/" className="btn">
            Back to the control plane
          </Link>
        </div>
      </section>
    </>
  );
}
