import type { Metadata } from "next";
import Link from "next/link";
import { Stack } from "@/components/site/Stack";
import { StateTag } from "@/components/site/StateTag";
import { BUILT_LAYERS, COMPANY, CONSOLE, CONTRIBUTION, STACK, TARGETS } from "@/lib/system";

export const metadata: Metadata = {
  title: "The stack",
  description:
    "What APT-LABS is building, layer by layer: a record layer an institution owns, and identity, builds, infrastructure and allocation above it — each held at the state it actually carries.",
};

/**
 * The stack — the company's ontology, published in its own register.
 *
 * This route exists because its absence made the site answer the wrong
 * question. Every other page here describes the record layer — how a row
 * is entered, sealed, read for patterns, decided on and returned to the
 * field — and a reader who finished those five routes knew everything
 * about the floor and nothing about the building. The company's subject
 * is a stack: the record layer an institution holds outright, and the
 * four layers above it that turn a school's register into a community's
 * identity, work, infrastructure and allocation.
 *
 * The page is written the way the rest of the site is written, and that
 * is the argument: an ontology published with the discipline of an audit.
 * Each layer carries a state, `built` says exactly what exists, `settles`
 * names the evidence that would move it up the scale, and nothing unbuilt
 * gets a figure or a date anywhere on this page.
 *
 * The contribution rules are on this route rather than in a whitepaper
 * for one reason: they are the part of the design that decides whether
 * the whole thing is worth building. A mechanism for minting governance
 * weight out of work is either constrained hard enough to be trusted, or
 * it is a new patronage machine with better marketing — so the rules are
 * published as rules, and the one number that would make them concrete is
 * deliberately missing, with the reason said out loud.
 */
export default function StackPage() {
  const unbuilt = STACK.length - BUILT_LAYERS.length;

  return (
    <>
      <p className="label">
        The stack · {STACK.length} layers · {BUILT_LAYERS.length} built
      </p>
      <h1 className="page-title">What the record is the first layer of.</h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>
        One stack, ordered by dependency rather than ambition: a register an
        institution holds outright, then identity, builds, infrastructure and
        allocation above it. Each layer runs on the record the layer below it
        holds. Each is rendered here at the state it actually carries —{" "}
        {BUILT_LAYERS.length} is built, {unbuilt} are designs, and the
        difference between those two words is the whole discipline of this
        company.
      </p>

      {/* ── The five layers ─────────────────────────────────────── */}
      <section className="section" aria-labelledby="stack-heading">
        <div className="section-head">
          <h2 className="section-title" id="stack-heading">
            The layers
          </h2>
          <p className="section-kicker">
            Ordered by dependency · states are structural
          </p>
        </div>

        <p className="section-lede">
          Read the left edge first. A lit jade bar marks the one layer with a
          surface — the layer a reader can open today. A hairline marks the
          four that are designed and not built. Every fact under a layer is
          the same four fields: what it holds, what exists today, what
          evidence would move it up the scale, and why it sits where it sits.
        </p>

        <Stack variant="full" />

        <p className="measures-caption">
          <span className="figure">
            {BUILT_LAYERS.length} of {STACK.length}
          </span>{" "}
          layers has a surface: the record layer, implemented as{" "}
          <Link href="/product">{CONSOLE.name}</Link>. The other {unbuilt} are
          designs — described here, with the evidence each one needs named,
          and with no figures and no dates attached to them anywhere on this
          site.
        </p>
      </section>

      {/* ── Contribution ─────────────────────────────────────────
          The mechanism behind the identity layer. Four constraints, each
          with the thing it forbids — because an allocation rule is only
          as trustworthy as what it refuses. */}
      <section className="section" aria-labelledby="contribution-heading">
        <div className="section-head">
          <h2 className="section-title" id="contribution-heading">
            Contribution, and why weight is not for sale
          </h2>
          <p className="section-kicker">
            Layer 02 · <StateTag state="PLANNED" /> · the design constraints
          </p>
        </div>

        <div className="prose">
          <p>
            Identity is the load-bearing layer of the whole stack, and the
            design question inside it is a single question: where does
            governance weight come from? The answer this company builds
            toward is that weight is minted by work — physical work on a
            site, digital work on a build, institutional work attested by
            records — and that it seals to the person who did it and does
            not move. No purchase, no trade, no accumulation, no exit.
          </p>
          <p>
            The rules below are the constraints that design has to satisfy.
            They are published as rules rather than as features because the
            failure mode of this whole category is well documented: a
            mechanism that looks participatory while control concentrates in
            whoever acquired the most, fastest. So each rule is written with
            the thing it forbids, and the fourth rule is the one that keeps
            the other three honest.
          </p>
        </div>

        <ol className="contribution" style={{ marginTop: "var(--s-4)" }}>
          {CONTRIBUTION.map((rule) => (
            <li className="contribution-rule" key={rule.id}>
              <div className="contribution-head">
                <span className="contribution-rule-id figure" aria-hidden="true">
                  {rule.id}
                </span>
                <h3 className="contribution-rule-name">{rule.rule}</h3>
              </div>
              <p className="contribution-means">{rule.means}</p>
              <p className="contribution-never">{rule.never}</p>
            </li>
          ))}
        </ol>

        <p className="measures-caption">
          Why the concentration threshold is not printed: a number only means
          something once the rule behind it runs, and nothing here runs yet.
          A threshold published beside a system that has never been used
          would be decoration — and this is the exact place where decoration
          would do the most damage, because it is the number a reader would
          most want to trust.
        </p>
      </section>

      {/* ── The boundary ─────────────────────────────────────────
          What the page refuses to claim. Stated as a section rather than
          as a footnote, because the refusal is the product here: it is
          the only reason the rest of the page is believable. */}
      <section className="section closing" aria-labelledby="stack-hold-heading">
        <div className="section-head">
          <h2 className="section-title" id="stack-hold-heading">
            What this page does not claim
          </h2>
          <p className="section-kicker">The boundary, in a reader&rsquo;s terms</p>
        </div>

        <div className="prose">
          <p>
            No site is powered. No group is on the roll. No build has been
            run in the open, no pool has been allocated, and no rule above
            has ever fired because it has never had anything to act on. The
            four unbuilt layers carry no figure and no date on this page
            because they have neither — a date would be a target wearing a
            deadline&rsquo;s clothes, and the targets live on their own
            register, at <StateTag state="TARGET" />, where they can be read
            as intentions.
          </p>
          <p>
            What is real is smaller and checkable: one layer built, one
            product openable, nine modules working on invented data, and{" "}
            <span className="figure">0 customers</span> — a measured zero,
            published as one. The same evidence contract governs this page as
            governs every other route here; if a sentence on this page
            overreaches,{" "}
            <Link href="/evidence">the contract it breaks is published</Link>.
          </p>
        </div>

        <div className="action-row" style={{ marginTop: "var(--s-5)" }}>
          <Link href="/product" className="btn">
            Open {CONSOLE.name} <span className="glyph">→</span>
          </Link>
          <Link href="/control" className="btn-ghost">
            What is sold
          </Link>
          <a href={`mailto:${COMPANY.contact.email}`} className="btn-ghost">
            {COMPANY.contact.email}
          </a>
        </div>

        <p className="measures-caption">
          The one dated intention that concerns this page:{" "}
          {TARGETS.find((t) => t.id === "TGT-03")?.what} By{" "}
          {TARGETS.find((t) => t.id === "TGT-03")?.by},{" "}
          <StateTag state="TARGET" />.
        </p>
      </section>
    </>
  );
}
