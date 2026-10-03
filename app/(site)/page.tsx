import type { Metadata } from "next";
import Link from "next/link";
import { BuildGrid } from "@/components/site/BuildGrid";
import { NodeGraph } from "@/components/site/Graph";
import { StatusBand } from "@/components/site/StatusBand";
import { Tally } from "@/components/site/Tally";
import { EmptyState } from "@/components/site/EmptyState";
import { StateTag } from "@/components/site/StateTag";
import {
  BUILDS,
  COMPANY,
  CONSOLE,
  MEASURES,
  REGISTERS,
  SIGNALS,
  UNKNOWN_FACTS,
} from "@/lib/system";

export const metadata: Metadata = {
  title: "APT-LABS",
  description: COMPANY.supporting,
};

export default function FieldPage() {
  return (
    <>
      {/* ── THE FIRST VIEWPORT ────────────────────────────────
          The contract asks six things of this screen, in this
          order: reality is observed, records are evidence-bound,
          intelligence is derived, decisions are traceable, the
          built surface is openable, and unknown remains unknown.

          The hierarchy is three tiers and no more. The mantra is the
          only display type on the site and reaches 181px; the full
          product sentence sits directly beneath it at lead size, so
          the compression never replaces the claim it compresses; the
          contract itself is prose. The measure block then carries
          the last two requirements by putting a state under every
          number, including the number that is not known. */}
      <section className="plate" aria-labelledby="claim">
        <div className="plate-index">
          <span className="plate-index-lit">Node 01</span>
          <span>Field</span>
          <span>Reality before interpretation</span>
          <span className="plate-index-rule" aria-hidden="true" />
          <span>Local-first · Prototype · Not deployed</span>
        </div>

        <h1 className="hero" id="claim" style={{ marginTop: "var(--s-4)" }}>
          {/* Two designed lines, not one string left to wrap. The break
              is part of the lockup; `mantra` stays available as the
              single string for anything that needs the phrase whole. */}
          {COMPANY.mantraLines.map((line) => (
            <span className="hero-line" key={line}>
              {line}
            </span>
          ))}
        </h1>

        <p className="lede" style={{ marginTop: "var(--s-4)" }}>
          {COMPANY.primary} {COMPANY.supporting}
        </p>

        <div className="prose" style={{ marginTop: "var(--s-3)" }}>
          <p>
            Every material claim carries an identifier, a timestamp, a source
            and an evidence state — and where the system cannot establish a
            fact, it preserves the uncertainty instead of resolving it in its
            own favour.
          </p>
        </div>

        {/* Ordered by the contract, not by size. The register and the unknowns
            come before the built surface because they are the claims; the
            surface is the least representative thing on the site and the
            one most likely to be mistaken for a product demonstration. */}
        <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
          <Link href="/register" className="btn">
            Read the register
          </Link>
          <Link href="/evidence" className="btn-ghost">
            What is not yet known
          </Link>
          <Link href={CONSOLE.href} className="btn-ghost">
            Open the built surface
          </Link>
        </div>
      </section>

      <div style={{ marginTop: "var(--s-6)" }}>
        <div className="measure-grid">
          {MEASURES.map((m) => (
            <div className="measure-cell" data-state={m.state} key={m.key}>
              <div className="measure-figure">{m.figure}</div>
              <div className="measure-key">{m.key}</div>
              <p className="measure-note">{m.note}</p>
              <div style={{ marginTop: 10 }}>
                <StateTag state={m.state} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "var(--s-5)" }}>
        <StatusBand />
      </div>

      {/* ── THE GRAPH ─────────────────────────────────────────
          The centre of the argument. Five nodes, five routes, and
          the flow drawn between them: a system that says "the loop
          closes" should let you walk it rather than describe it.

          The spine is the site's navigation and its thesis at the
          same time. Every node on it resolves; nothing on it is an
          illustration. The seven-stage chain underneath is the same
          transformation one order finer, and it is what the
          inspector on the right is describing when it names a
          custody. */}
      <section className="section" aria-labelledby="graph-heading">
        <div className="section-head">
          <h2 className="section-title" id="graph-heading">
            The control plane
          </h2>
          <p className="section-kicker">
            Five nodes · five routes · the loop closes
          </p>
        </div>

        <NodeGraph variant="canvas" />

        <div className="prose" style={{ marginTop: "var(--s-4)" }}>
          <p>
            These are not features. They are the five states every piece of
            operational reality passes through, and each one is a route you can
            open and inspect. Action at the fourth stage generates the evidence
            that becomes the first stage of the next cycle — which is why the
            graph is drawn with a return stroke rather than as a queue.
          </p>
        </div>
      </section>

      {/* ── THE BUILDS ────────────────────────────────────────
          The reframe: one grammar, six domains, one built. The one
          build with a surface is an example of what this system is,
          not the system itself — so it is listed first because it is
          the only row that resolves, and never because it is the
          product. Its domain is stated as field operations rather
          than as a school's, because an example that names a sector
          makes the reader infer the product is that sector's system. */}
      <section className="section" aria-labelledby="builds-heading">
        <div className="section-head">
          <h2 className="section-title" id="builds-heading">
            One grammar, six domains
          </h2>
          <p className="section-kicker">
            The built surface is an example · not the product
          </p>
        </div>

        <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
          <p>
            A build is the same seven stages running over one domain&rsquo;s own
            records. Extending the system changes the domain and nothing else —
            the chain, the custody boundary and the five evidence states are
            identical in every row below. One of them is built and openable.
            The other five are stated as designs, so they are shown here with
            no route and no figure.
          </p>
        </div>

        <BuildGrid />
      </section>

      {/* ── WHERE THE REST OF IT IS WRITTEN ───────────────────
          This page is the argument. These three registers are the
          evidence for it, and each one was previously rendered here in
          full — the record classes as a table plus an inspection tally,
          the derived readings as a table plus a second tally, the
          published unknowns as a third table. Six hundred words of
          register repeated three times on the route that exists to
          summarise them, and every reader who wanted a row had to
          scroll past two copies of the others to reach it.

          So each is one row here: what it holds, how many, and a link
          to where it is maintained. The detail is not behind a toggle
          and is not summarised badly — it is on the route that owns it,
          which is the only place it can stay current without this page
          becoming a second source of truth that nothing keeps in step. */}
      <section className="section" aria-labelledby="registers-heading">
        <div className="section-head">
          <h2 className="section-title" id="registers-heading">
            The registers behind this
          </h2>
          <p className="section-kicker">Each on the node that owns it</p>
        </div>

        <div className="register" role="table" aria-labelledby="registers-heading">
          {[
            {
              ord: "02",
              name: "Register",
              href: "/register",
              holds: "The record classes the chain requires, and the empty sets where an institution would write them.",
              count: REGISTERS.length,
              unit: "record classes",
            },
            {
              ord: "03",
              name: "Intelligence",
              href: "/intelligence",
              holds: "The readings derived from those records, each naming the method that produced it and the records it rests on.",
              count: SIGNALS.length,
              unit: "readings",
            },
            {
              ord: "05",
              name: "Evidence",
              href: "/evidence",
              holds: "What each evidence state permits and forbids, and the questions this system has not answered.",
              count: UNKNOWN_FACTS.length,
              unit: "published unknowns",
            },
          ].map((row) => (
            <div className="register-row register--std" role="row" key={row.href}>
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-id">{row.ord}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  <Link href={row.href} className="link">
                    {row.name}
                  </Link>
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Holds">
                <div className="register-provenance">{row.holds}</div>
              </div>
              <div className="register-cell" role="cell" data-field="Count">
                <div className="register-figure figure">{row.count}</div>
                <div className="register-provenance">{row.unit}</div>
              </div>
              <div className="register-cell" role="cell" data-field="State">
                <StateTag state="PROTOTYPE" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── UNKNOWN REMAINS UNKNOWN ───────────────────────────
          The contract's sixth requirement for the first viewport,
          given its own surface. This panel is the system's most
          distinctive claim: it publishes what it has not observed,
          in the same register language as what it has.

          A site that shows this before it shows its achievements is
          making a structural argument, not a decorative one — the
          absence of evidence is rendered as carefully as the
          evidence.

          The five rows behind it used to be repeated here in full. They
          are on /evidence, which is the node whose subject they are, and
          they are linked rather than re-rendered: this page stating them
          a second time is a second copy with no way to notice the first
          going stale. */}
      <section className="section" aria-labelledby="unknown-heading">
        <div className="section-head">
          <h2 className="section-title" id="unknown-heading">
            What this system does not know
          </h2>
          <p className="section-kicker">
            <span className="figure">{UNKNOWN_FACTS.length}</span> published
            unknowns
          </p>
        </div>

        <EmptyState
          title="Nothing registered yet — and that is correct"
          body="No institution has run this system, so there is no deployment record, no adoption figure, no outcome measurement and no partner register. Rather than fill this space with projection, the system states the absence and names what would legitimately appear here."
          unit="deployment"
          why="A deployment record requires a named institution, a start date and an operator signature. None is documented."
          unblocks="One institution running one build for a full term, exporting its registers on its own device."
          state="UNKNOWN — not zero. The count is unestablished, not measured as none."
        />

        <div className="action-row">
          <Link href="/evidence" className="btn">
            Read all {UNKNOWN_FACTS.length} open questions
          </Link>
          <span className="register-provenance">
            Each names what is missing and what would establish it.
          </span>
        </div>
      </section>

      {/* ── WHERE THE BUILDS END ─────────────────────────────
          Closing on the count rather than the achievement: one build
          exists out of six, and the other five are named as designs.
          The built surface is the last thing this page mentions on purpose —
          it is the most impressive thing here and the least
          representative of it. */}
      <section className="section" aria-labelledby="state-heading">
        <div className="section-head">
          <h2 className="section-title" id="state-heading">
            Where this stands
          </h2>
          <p className="section-kicker">
            <span className="figure">{BUILDS.length}</span> builds ·{" "}
            <span className="figure">1</span> built
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="state-heading">
          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-id">01</div>
              <div className="register-name" style={{ marginTop: 4 }}>
                {CONSOLE.name}
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Records">
              <div>{CONSOLE.oneLine}</div>
              <div className="register-provenance" style={{ marginTop: 8 }}>
                {CONSOLE.provenance}
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Runs">
              <div className="register-date">On device</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state={CONSOLE.state} />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-id">02</div>
              <div className="register-name" style={{ marginTop: 4 }}>
                Every other build
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Records">
              <div className="register-provenance" style={{ maxWidth: "62ch" }}>
                Designed against the same chain and the same custody boundary,
                and not built. No code, no schema and no data for any of them
                exists in this repository, so no figure appears beside their
                names anywhere on this site.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Runs">
              <div className="register-date">Nowhere</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PLANNED" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "var(--s-4)" }}>
          <Tally records={BUILDS} caption="builds" />
        </div>
      </section>
    </>
  );
}