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

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          This is the route where the system is most likely to lie, so it is
          written as a register of limits rather than a page of claims. Five
          states, each with what it permits and what it forbids. A claim
          without a state is not publishable, and a state without a source is
          not a state at all.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
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
          <p className="label">{EVIDENCE_STATES.length} states · enforced in code</p>
        </div>

        <div className="register">
          {EVIDENCE_STATES.map((state) => (
            <div
              className="register-row"
              key={state}
              style={{ gridTemplateColumns: "132px minmax(0,1fr) minmax(0,1fr)" }}
            >
              <div className="register-cell register-cell--id">
                <StateTag state={state} />
              </div>
              <div className="register-cell" data-field="Permits">
                <p style={{ margin: 0 }}>{STATE_RULES[state].permits}</p>
              </div>
              <div className="register-cell" data-field="Forbids">
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
          <p className="label">{CONTRACT_RULES.length} rules</p>
        </div>

        <div className="register">
          <div className="register-head register--std" aria-hidden="true">
            <span>Rule</span>
            <span>Equals</span>
            <span>Never</span>
            <span>State</span>
          </div>
          {CONTRACT_RULES.map((r) => (
            <div className="register-row register--std" key={r.id}>
              <div className="register-cell register-cell--id">
                <div className="register-id">{r.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {r.subject}
                </div>
              </div>
              <div className="register-cell" data-field="Equals">
                <div>{r.equals}</div>
              </div>
              <div className="register-cell" data-field="Never">
                <div className="register-provenance" style={{ maxWidth: "46ch" }}>
                  {r.doesNotEqual}
                </div>
              </div>
              <div className="register-cell" data-field="State">
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
          <p className="label">{UNKNOWN_FACTS.length} open questions</p>
        </div>

        <div className="register">
          <div className="register-head register--std" aria-hidden="true">
            <span>Unknown</span>
            <span>Why it is not established</span>
            <span>Open since</span>
            <span>State</span>
          </div>
          {UNKNOWN_FACTS.map((u) => (
            <div className="register-row register--std" key={u.id}>
              <div className="register-cell register-cell--id">
                <div className="register-id">{u.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {u.what}
                </div>
              </div>
              <div className="register-cell" data-field="Why unknown">
                <div className="register-provenance" style={{ maxWidth: "54ch" }}>
                  {u.why}
                </div>
              </div>
              <div className="register-cell" data-field="Open since">
                <div className="register-date">{u.since}</div>
              </div>
              <div className="register-cell" data-field="State">
                <StateTag state="UNKNOWN" title={u.why} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
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
          <StateTag state={COMPANY.geography.state} title={COMPANY.geography.provenance} />
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
