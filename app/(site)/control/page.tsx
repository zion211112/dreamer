import type { Metadata } from "next";
import { ControlSurface } from "@/components/epistem/ControlSurface";
import Link from "next/link";
import { BuildGrid } from "@/components/site/BuildGrid";
import { StatusBand } from "@/components/site/StatusBand";
import { EmptyState } from "@/components/site/EmptyState";
import { StateTag } from "@/components/site/StateTag";
import { ValueChain } from "@/components/site/ValueChain";
import { CONSOLE, LIVE_BUILDS, PRODUCTS, VALUE_CHAIN } from "@/lib/system";

export const metadata: Metadata = {
  title: "Control",
  description:
    "Knowledge becomes action: the School Console, built and openable, sold to no one yet.",
};

export default function ControlPage() {
  const execution = VALUE_CHAIN.filter((s) => s.node === "control");

  return (
    <>
      <p className="label">Node 04 · Control — knowledge becomes action</p>
      <h1 className="page-title">
        Where the decision is made, and where {CONSOLE.name} sits.
      </h1>

      {/* "Real" is not one of the six states, and on an h1 it read as a
          promotion from PROTOTYPE to VERIFIED by other means — which is the
          thing STATE_RULES.PROTOTYPE.forbids. The previous version of this
          heading was "A surface that runs this architecture. Openable, and
          deployed to no one." The first clause overclaimed (the console does
          not run the whole chain — Execute and Measure are specified and not
          implemented) and the second was doing the work of a state tag that
          was already on the page. */}
      <p className="lede" style={{ marginTop: "var(--s-4)" }}>Control is where intelligence becomes work: a decision taken
          against a derived reading, under an explicit rule, by an institution
          that keeps its own record. {CONSOLE.name} is where two of the three
          products on this list exercise that stage, and it runs on the device
          it is opened from.</p>

      <div style={{ marginTop: "var(--s-4)" }}>
        <StatusBand />
      </div>

      {/* The console, presented as what it is: a product, in the same
          register as everything else, with the state tag beside the entry
          link so nobody can reach the capability without the state. */}
      <section className="section" aria-labelledby="console-heading">
        <div className="section-head">
          <h2 className="section-title" id="console-heading">
            {CONSOLE.name}
          </h2>
          <StateTag state={CONSOLE.state} />
        </div>

        <div className="prose">
          <p>{CONSOLE.oneLine}</p>
          <p>{CONSOLE.localFirst}</p>
          {/* The commercial fact, on the route where the product is
              introduced. The previous version of this page had no price
              shape, no buyer and no sales sentence anywhere — the product
              was introduced as "the built surface", which is what you call
              a thing when you would rather not say what it is. */}
          <p>{CONSOLE.commercial}</p>
        </div>

        {/* The module list is deliberately absent. This table used to
            enumerate the console's nine modules under a column headed
            "What it records", which re-imported three of this system's own
            register classes by the back door and gave the reader less
            information than opening the console does. A console's modules
            are the console's business; the architecture's record classes
            are on /register. What this route owes the reader is the state,
            which the two prose lines and the entry link below carry. */}
        <div className="register" role="table" aria-labelledby="console-heading" style={{ marginTop: 20 }}>
          <div className="register-head register--std" role="row">
            <span role="columnheader">Build</span>
            <span role="columnheader">Chain</span>
            <span role="columnheader">Runs</span>
            <span role="columnheader">State</span>
          </div>
          {LIVE_BUILDS.map((build) => (
            <div className="register-row register--std" role="row" key={build.name}>
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-name">{build.name}</div>
              </div>
              <div className="register-cell" role="cell" data-field="Chain">
                <div className="register-provenance" style={{ maxWidth: "54ch" }}>
                  {build.chain}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Runs">
                <div className="register-date">On device</div>
              </div>
              <div className="register-cell" role="cell" data-field="State">
                <StateTag state={build.state} />
              </div>
            </div>
          ))}
        </div>

        <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
          <Link href={CONSOLE.href} className="btn">
            Open the built surface
          </Link>
          <span className="register-provenance" style={{ maxWidth: "54ch" }}>
            {CONSOLE.provenance}
          </span>
        </div>
      </section>

      {/* The control stages of the chain, isolated so the reader can
          see where custody sits: the institution decides and executes;
          the local record interprets and measures. */}
      <section className="section" aria-labelledby="stages-heading">
        <div className="section-head">
          <h2 className="section-title" id="stages-heading">
            Decide. Execute.
          </h2>
          <p className="section-kicker">
            Stages {execution.map((s) => s.ord).join(" · ")}
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="stages-heading">
          {execution.map((stage) => (
            <div
              className="register-row" role="row"
              key={stage.ord}
              style={{ gridTemplateColumns: "72px minmax(0,1fr) 190px" }}
            >
              <div className="register-cell" role="cell">
                <div className="register-id">{stage.ord}</div>
              </div>
              <div className="register-cell" role="cell" data-field="Stage">
                <div className="register-name">{stage.name}</div>
                <p style={{ margin: "6px 0 0", maxWidth: "58ch" }}>{stage.what}</p>
              </div>
              <div className="register-cell" role="cell" data-field="Custody">
                <div className="register-provenance">{stage.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section">
        <ValueChain />
      </div>

      {/* ── WHAT IS SOLD ──────────────────────────────────────
          This node is not one product. It is the point in a chain at
          which a decision is taken and executed, and every product
          below reaches that point with its own records and its own
          institution holding custody. The comment that used to sit here
          said the console "appears here first because it is the only one
          with a surface — which is the whole reason the site leads with
          the grammar rather than with the demo". That was a defence of
          the previous page's category error, written in a comment where
          nobody would read it: the site led with the grammar because the
          grammar was the only thing it had a name for. */}
      <section className="section" aria-labelledby="builds-heading">
        <div className="section-head">
          <h2 className="section-title" id="builds-heading">
            What is sold
          </h2>
          <p className="section-kicker">
            {PRODUCTS.length} products and tracks ·{" "}
            <span className="figure">{LIVE_BUILDS.length}</span> built
          </p>
        </div>

        <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
          <p>
            Decide and execute is the same two stages whatever the buyer.
            What changes between these rows is the record arriving at them,
            the institution holding custody of it, and what the buyer pays
            for — nothing about the chain, and nothing about the evidence
            state that governs the row.
          </p>
        </div>

        <BuildGrid />
      </section>

      {/* The decision record is empty, and that is the honest state of
          a system that has not governed anything yet. */}
      <section className="section" aria-labelledby="decisions-heading">
        <div className="section-head">
          <h2 className="section-title" id="decisions-heading">
            Decisions taken through this system
          </h2>
          <p className="section-kicker">Decision record</p>
        </div>

        <EmptyState
          title="No decisions recorded through this product"
          body="No decision has been taken, recorded or executed through this system by any customer. The decision record is empty because no customer is running the product, and the two facts are the same fact."
          unit="decision"
          why="A decision record requires a named decision body, the rule it was taken under, and the records that were in front of it. No school has run the product long enough to produce one."
          unblocks="One decision taken by a named body, recorded with the records it relied on, and readable afterwards by someone who was not in the room."
          state="UNKNOWN — not zero. The absence of decision records is unestablished, not measured."
        />

        <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
          <Link href="/evidence" className="btn">
            Next — the loop closes
          </Link>
          <Link href="/console" className="btn-ghost">
            Open the console
          </Link>
        </div>
      </section>

      {/* ── THE INSTRUMENT ─────────────────────────────────────────────
          Everything above is the register AS PUBLISHED. What follows is
          the register AS INSTRUMENTED: the live firewall, the guards
          raised against these very claims, the confidence ledger behind
          every figure, and the derived health vector.

          Both halves belong on one page, because AfricanCoder's standard
          is a reader who cannot inspect the evidence at the moment of
          judgement. A separate page for the apparatus is a separate
          moment, and by then the reader has already believed something. */}
      <section className="section closing" aria-labelledby="control-instrument">
        <div className="section-head">
          <h2 className="section-title" id="control-instrument">
            The instrument
          </h2>
          <p className="section-kicker">live · derived from current state</p>
        </div>
        <ControlSurface />
      </section>
    </>
  );
}
