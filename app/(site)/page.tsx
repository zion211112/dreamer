import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { BuildGrid } from "@/components/site/BuildGrid";
import { StackStrata } from "@/components/site/StackStrata";
import { Stack } from "@/components/site/Stack";
import { StateTag } from "@/components/site/StateTag";
import {
  BUILT_LAYERS,
  COMPANY,
  CONSOLE,
  MEASURES,
  PLANE as PLANE_NODES,
  PRODUCTS,
  STACK,
  TARGETS,
  UNKNOWN_FACTS as UNKNOWN_ROWS,
} from "@/lib/system";

export const metadata = {
  title: "APT-LABS — the record layer, and the stack above it",
  description:
    "APT-LABS builds the record layer an institution owns outright, and the stack above it: identity, builds, infrastructure and allocation. One layer is built and openable; the rest are designs, held at the state they actually carry.",
};

/**
 * The homepage — what the company is, what it sells, and what is true.
 *
 * This page was previously organised around the five-node architecture,
 * opening with the mantra "Records, not assertions." at 181px and closing
 * with a section titled "What this system does not know" that published
 * three rows of absent research findings. Read as a whole it described an
 * organisation that publishes evidence about its own state rather than one
 * that sells software.
 *
 * The order here is the commercial one, and it is the order a reader
 * actually has questions in:
 *
 *   1. What is this?        the hero, in the words a buyer uses
 *   2. What do you sell?     the product catalogue, with a named product
 *   3. Is it real?           the measures, including the one that is zero
 *   4. Where is it going?    the targets, held at TARGET
 *   5. What is not yet true? the diligence register, phrased commercially
 *   6. How is it built?      the system, last, because it is the
 *                            differentiator rather than the pitch
 *
 * The architecture did not lose a section; it moved down. It was the first
 * thing on the page and it should not have been.
 */
export default function HomePage() {
  return (
    <>
      {/* ── 1. THE THESIS, stated at display size ─────────────────
          ASIANCODER.MD opens with six separations that the whole product
          exists to operationalise:

            fluency != truth   confidence != evidence   coherence != causality
            citation != verification   novelty != creativity   consensus != correctness

          A reader who does not understand this company by the end of the
          first viewport does not understand it at all, so it is rendered
          as the first thing on the page rather than as a principles
          section further down. It is the argument, and every screen below
          it is a demonstration. */}
      <p className="label">{COMPANY.kind}</p>

      <h1 className="hero">
        {COMPANY.mantraLines.map((line, i) => (
          <span className="hero-line" key={i}>
            {line}
          </span>
        ))}
      </h1>

      <p className="lede" style={{ marginTop: "var(--s-5)" }}>
        {COMPANY.primary}
      </p>

      <p className="lede lede--quiet" style={{ marginTop: "var(--s-3)" }}>
        {COMPANY.supporting}
      </p>

      <div className="action-row" style={{ marginTop: "var(--s-5)" }}>
        <Link href="/stack" className="btn">
          Read the stack <span className="glyph">→</span>
        </Link>
        <Link href={CONSOLE.href} className="btn-ghost">
          Open the built layer
        </Link>
      </div>

      {/* ── 2. THE STACK, drawn ───────────────────────────────────
          The stack is the argument, so it is drawn rather than listed.

          It was five rows of identical weight, which made the one thing on
          the page that is a PICTURE read like a table of contents — and it
          meant the whole document had no focal point, because every section
          was padding, a hairline, a mono label and two sentences.

          StackStrata cuts it as a section instead: one lit stratum, four
          designed ones, altitudes set by what each layer has to say. The
          honest sentence about its own completeness lives in the margin
          beside it rather than being asked of the diagram. */}
      <section className="section" aria-labelledby="stack-heading">
        <div className="section-head">
          <h2 className="section-title" id="stack-heading">
            The stack
          </h2>
          <p className="section-kicker">
            {BUILT_LAYERS.length} of {STACK.length} built
          </p>
        </div>

        <StackStrata />
      </section>

      {/* ── 3. What we sell ───────────────────────────────────── */}
      <section className="section" aria-labelledby="products-heading">
        <div className="section-head">
          <h2 className="section-title" id="products-heading">
            What we sell
          </h2>
          <p className="section-kicker">
            {PRODUCTS.length} products and tracks ·{" "}
            <span className="figure">1</span> built
          </p>
        </div>

        <p className="section-lede">
          One management system with a surface you can open today — the
          record layer&rsquo;s first implementation — and two tracks that are
          designed rather than built. The rows below say which is which, and
          every one of them names who it is for.
        </p>

        <BuildGrid />
      </section>

      {/* ── 4. The measures ─────────────────────────────────────
          The band renders MEASURES and carries its own explanatory row.
          It was previously followed by a caption claiming "every figure
          above is typed by hand — the measures this system publishes are
          the ones a reader can audit" while four of the five were derived
          automatically from arrays, and a fifth ("1 evidence path per
          claim") was a self-referential rule about the site's own grammar
          presented as a metric about the product.

          That last figure is the one worth naming: it was the only
          VERIFIED number in the first viewport, and it verified nothing
          about the product. It has been replaced by a count of customers,
          which is zero, which is true, and which is the number a reader
          was actually looking for. */}
      <section className="section" aria-labelledby="measures-heading">
        <h2 className="sr-only" id="measures-heading">
          Where the company stands
        </h2>

        <div className="measure-grid">
          {MEASURES.map((m) => (
            <div className="measure-cell" data-state={m.state} key={m.key}>
              <div className="measure-figure figure">{m.figure}</div>
              <div className="measure-key">{m.key}</div>
              <div className="measure-note">{m.note}</div>
              <div className="measure-state">
                <StateTag state={m.state} />
              </div>
            </div>
          ))}
        </div>

        {/* One plain sentence, because a band of five figures with no
            sentence is the layout a corporation uses to make four numbers
            look like a business, and that is the specific impression this
            site is not trying to make. */}
        <p className="measures-caption">
          <span className="figure">0 customers</span> is the shortest way to
          describe this company, and it is stated here rather than in a
          footnote because it is the first question a reader has. What
          follows is the part of the claim that survives it.
        </p>
      </section>

      <div style={{ marginTop: "var(--s-5)" }}>
        <StatusBand />
      </div>

      {/* ── 5. Where this is going ──────────────────────────────
          TARGET, used. The site defined this state, coloured it, gave it
          a rule, asserted its warmth in the contrast checker — and used
          it nowhere. A raise with no destination described on it is not a
          plan, it is an apology. Every row here is an intention, and each
          one names the evidence that would settle it. */}
      <section className="section" aria-labelledby="targets-heading">
        <div className="section-head">
          <h2 className="section-title" id="targets-heading">
            Where this is going
          </h2>
          <p className="section-kicker">
            <StateTag state="TARGET" /> · intentions, not results
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="targets-heading">
          {TARGETS.map((t) => (
            <div
              className="register-row"
              role="row"
              key={t.id}
              style={{ gridTemplateColumns: "minmax(0,1fr) 190px" }}
            >
              <div className="register-cell" role="cell">
                <div className="register-name">{t.what}</div>
                <p className="register-provenance" style={{ maxWidth: "62ch", marginTop: 8 }}>
                  Met when: {t.measure}
                </p>
              </div>
              <div className="register-cell" role="cell" data-field="By">
                <div className="register-date">{t.by}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. What is not yet true ─────────────────────────────
          The section that used to be called "What this system does not
          know" and published three rows about populations and
          performance. It is now the diligence register, in the reader's
          own vocabulary: no customer, no revenue, no outcome evidence, no
          contracts, no registration number.

          The register a company publishes about its own gaps is a normal
          and useful thing. The register a *research programme* publishes
          is what made the previous version of this page read as one. */}
      <section className="section" aria-labelledby="gaps-heading">
        <div className="section-head">
          <h2 className="section-title" id="gaps-heading">
            What is not established yet
          </h2>
          <p className="section-kicker">Open questions, not missing data</p>
        </div>

        <p className="section-lede">
          Stated plainly, because a gap that is named is a question and a
          gap that is omitted reads as a zero and gets quoted as one. None
          of these is a measurement and none is a result.
        </p>

        <div className="register" role="table" aria-labelledby="gaps-heading">
          {UNKNOWN_ROWS.map((u) => (
            <div
              className="register-row"
              role="row"
              key={u.id}
              style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}
            >
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-id">{u.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {u.what}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Why">
                <p style={{ margin: 0, maxWidth: "58ch" }}>{u.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. How it is built ──────────────────────────────────
          The five nodes, last, and briefly. This is the section the
          previous version opened with at 181px. It is the most genuinely
          interesting thing about this company and it is also the thing a
          buyer asks about last — and it is worth asking about at all,
          because it is the reason the register exists and therefore the
          reason a school can trust the records it holds. */}
      <section className="section" aria-labelledby="system-heading">
        <div className="section-head">
          <h2 className="section-title" id="system-heading">
            How it is built
          </h2>
          <p className="section-kicker">
            <Link href="/lattice">See it as a topology →</Link>
          </p>
        </div>

        <p className="section-lede">
          Every product above is the same five stages, run on the
          institution&rsquo;s own device: events are recorded, the records are
          structured, the structure is read for patterns, a decision is taken
          against a stated rule, and the decision becomes work. Each stage is
          published as its own route, at the state it actually holds — so a
          reader can check any claim here by opening the thing it describes.
        </p>

        <div className="node-strip">
          {PLANE_NODES.map((n) => (
            <Link className="node-strip-cell" href={n.href} key={n.key}>
              <span className="node-strip-ord figure">{n.ord}</span>
              <span className="node-strip-name">{n.name}</span>
              <StateTag state={n.state} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── The ask, and the one thing that is built ────────────
          The previous closing section was titled "Nowhere to go" and read
          "The loop has no exit. That is the design, not a gap." It
          described the absence of an action as a design principle, which
          is the single most expensive sentence the site carried: it told
          every reader who got this far that there was nothing to do next.

          There is something to do next, and it is the same thing on every
          page: open the product, or write to us. */}
      <section className="section closing" aria-labelledby="closing-heading">
        <div className="section-head">
          <h2 className="section-title" id="closing-heading">
            The ask
          </h2>
          <p className="section-kicker">What this is for</p>
        </div>

        <div className="prose">
          <p>
            APT-LABS has built one product and sold nothing. Both of those are
            above in plain numbers rather than in a footnote, because the
            honest version of this page is the one a reader can act on — and a
            company that publishes its gaps plainly is the reason anyone should
            believe the parts it claims.
          </p>
          <p>
            The thing being built here starts with software a school owns
            outright: it runs on the school&rsquo;s own device, the records
            never leave it, and every claim on this site can be opened and
            checked by anyone. That is{" "}
            <Link href="/stack">layer one of five</Link> — the layer the rest
            of the stack runs on.{" "}
            <StateTag state={CONSOLE.dataState} /> means the data you see is
            invented. <StateTag state={CONSOLE.state} /> means the product
            that holds it is real and you can open it now.
          </p>
        </div>

        <div className="action-row" style={{ marginTop: "var(--s-5)" }}>
          <Link href={CONSOLE.href} className="btn">
            Open {CONSOLE.name} <span className="glyph">→</span>
          </Link>
          <a href={`mailto:${COMPANY.contact.email}`} className="btn-ghost">
            {COMPANY.contact.email}
          </a>
        </div>
      </section>
    </>
  );
}