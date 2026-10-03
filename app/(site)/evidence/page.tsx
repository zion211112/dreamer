import type { Metadata } from "next";
import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { Tally } from "@/components/site/Tally";
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
          <p className="section-kicker">{EVIDENCE_STATES.length} states · enforced in code</p>
        </div>

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
          have. The geography claim sits here in its own right: named,
          stated, and explicitly not evidenced. */}
      <section className="section" aria-labelledby="unknowns-heading">
        <div className="section-head">
          <h2 className="section-title" id="unknowns-heading">
            Published unknowns
          </h2>
          <p className="section-kicker">{UNKNOWN_FACTS.length} open questions</p>
        </div>

        <div className="register" role="table" aria-labelledby="unknowns-heading">
          <div className="register-head register--std" role="row">
            <span role="columnheader">Unknown</span>
            <span role="columnheader">Why it is not established</span>
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

        <div style={{ marginTop: "var(--s-4)" }}>
          <Tally records={UNKNOWN_FACTS.map((u) => ({ state: "UNKNOWN" as const }))} caption="open questions" />
        </div>
      </section>

      {/* The geography, in its true form: named as operating context,
          held at the state it actually carries. This is how a local
          thesis is expressed without decoration — as product context
          the system is accountable for, not as a claim it cannot
          yet support. */}
      <section className="section" aria-labelledby="geo-heading">
        <div className="section-head">
          <h2 className="section-title" id="geo-heading">
            Declared geography
          </h2>
          <StateTag state={COMPANY.geography.state} />
        </div>

        <div className="measure-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)" }}>
          <div className="measure-cell">
            <div className="measure-figure" style={{ fontSize: "clamp(18px,2vw,24px)" }}>
              {COMPANY.geography.value}
            </div>
            <div className="measure-key">Operating geography</div>
          </div>
          <div className="measure-cell">
            <div className="measure-note" style={{ marginTop: 0, maxWidth: "56ch" }}>
              {COMPANY.geography.provenance}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="action-row">
          <Link href="/" className="btn">
            Back to the control plane
          </Link>
          <Link href="/console" className="btn-ghost">
            Open the console
          </Link>
        </div>
      </section>
    </>
  );
}
