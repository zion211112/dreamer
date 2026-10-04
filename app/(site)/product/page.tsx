import type { Metadata } from "next";
import Link from "next/link";
import { CONSOLE_MODULES, CONSOLE_TOOLS } from "@/lib/console";
import { CONSOLE, COMPANY, TARGETS } from "@/lib/system";
import { StateTag } from "@/components/site/StateTag";

/**
 * The product page — the School Console.
 *
 * This route is the one the previous version of the site did not have. Its
 * absence was the most consequential structural gap: there was a working
 * product in the repository and no page anywhere that named what it did,
 * who it was for, or what it cost. A pitch prototype that makes the reader
 * find that out by opening a demo and clicking around has already lost the
 * reader.
 *
 * It is also the one route EXEMPT from the console vocabulary ban
 * (CONSOLE_VOCABULARY_SCOPED in lib/system.ts). Everywhere else, naming
 * "fees" or "timetable" would smuggle an operating claim into the
 * architecture's register; here, those are the product's features and
 * refusing to list them would be the category error rather than the
 * protection.
 *
 * Two claims on this page carry a state that is not PROTOTYPE, and both
 * matter:
 *
 *   · The product is PROTOTYPE — built, openable, unsold.
 *   · Its DATA is DEMONSTRATION — the console invents ten schools and
 *     roughly 7,650 learners on first load. Stating that next to a list of
 *     features is the whole job of this page: a reader who sees "KCSE
 *     grade projection" next to "these are not real students" learns both
 *     things at once. The previous site put the first claim on /control and
 *     the second on /register, ninety seconds apart, and they contradicted
 *     each other.
 */

export const metadata: Metadata = {
  title: "School Console",
  description:
    "APT-LABS' management system for schools: the operating week in one local-first product. Built and openable, unsold, running on demonstration data.",
};

export default function ProductPage() {
  return (
    <>
      <p className="label">Product · {CONSOLE.kind}</p>
      <h1 className="page-title">{CONSOLE.name}</h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>{CONSOLE.oneLine}</p>

      {/* Where the product sits. Without this line the page is a product
          sheet for one school system, which is a smaller and less
          accurate thing than what the company is: this product is layer
          one of five, and the layers above it are why a school would buy
          it from someone who is still building them. */}
      <p className="lede lede--quiet" style={{ marginTop: "var(--s-3)" }}>
        This is the first layer of the stack — the record, held by the
        institution itself.{" "}
        <Link href="/stack">
          What sits above it{" "}
          <span className="glyph" aria-hidden="true">
            →
          </span>
          <span className="sr-only">The stack</span>
        </Link>
      </p>

      {/* The two states, side by side, above the fold.
          This pairing is the page's central design decision. A product page
          that shows capability without provenance is advertising; one that
          shows provenance without capability is a disclaimer. They are
          rendered as one register row so the reader cannot take the first
          without the second. */}
      <section className="section" aria-labelledby="product-state">
        <div className="section-head">
          <h2 className="section-title" id="product-state">
            What is built, and what is in it
          </h2>
          <p className="section-kicker">Two separate claims</p>
        </div>

        <div className="register" role="table" aria-labelledby="product-state">
          <div className="register-head register--claim" role="row">
            <span role="columnheader">Claim</span>
            <span role="columnheader">State</span>
            <span role="columnheader">Basis</span>
          </div>

          <div className="register-row register--claim" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">The product runs</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state={CONSOLE.state} />
            </div>
            <div className="register-cell" role="cell" data-field="Basis">
              <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                {CONSOLE.provenance}
              </div>
            </div>
          </div>

          <div className="register-row register--claim" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">The data is real</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state={CONSOLE.dataState} />
            </div>
            <div className="register-cell" role="cell" data-field="Basis">
              <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                {CONSOLE.dataNote}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The modules, read from lib/console.ts rather than copied here.
          This is the only file on the site permitted to import the
          console's own source of truth, and the reason is that a
          hand-copied module list is how this repository ended up with
          seven copies of a module count that only the first of which was
          right. */}
      <section className="section" aria-labelledby="modules-heading">
        <div className="section-head">
          <h2 className="section-title" id="modules-heading">
            What the nine modules do
          </h2>
          <p className="section-kicker">
            {CONSOLE_MODULES.length} modules · {CONSOLE_TOOLS.length} tools ·{" "}
            <StateTag state={CONSOLE.dataState} />
          </p>
        </div>

        <ol className="modules">
          {CONSOLE_MODULES.map((module, i) => {
            const tools = CONSOLE_TOOLS.filter((t) => t.module === module);
            return (
              <li className="module" key={module}>
                <div className="module-head">
                  <span className="node-ord figure">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="module-name">{module}</span>
                  <span className="module-count figure">{tools.length}</span>
                </div>
                <ul className="module-tools">
                  {tools.map((tool) => (
                    <li className="module-tool" key={tool.id}>
                      <span className="module-tool-title">{tool.title}</span>
                      <span className="module-tool-desc">{tool.desc}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        {/* Every tool above opens and works. The only thing that is not real
            is the data behind it, and the state tag above says so — which
            means a reader can safely click all ten and find a working
            product rather than a screenshot of one. */}
        <p className="module-foot">
          All {CONSOLE_TOOLS.length} tools open and run. The data behind them is{" "}
          <StateTag state={CONSOLE.dataState} />: real structure, invented
          content.
        </p>
      </section>

      {/* The commercial facts, in the buyer's vocabulary. Price shape,
         who decides, what custody means for them. No figure, because none
         is set — and the sentence says so rather than leaving a reader to
         wonder whether the omission is an oversight. */}
      <section className="section" aria-labelledby="commercial-heading">
        <div className="section-head">
          <h2 className="section-title" id="commercial-heading">
            How it is sold
          </h2>
          <p className="section-kicker">Commercial shape</p>
        </div>

        <div className="register" role="table" aria-labelledby="commercial-heading">
          <div className="register-row register--pair" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Who buys it</div>
            </div>
            <div className="register-cell" role="cell" data-field="Detail">
              <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                {CONSOLE.commercial}
              </div>
            </div>
          </div>
          <div className="register-row register--pair" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Price</div>
            </div>
            <div className="register-cell" role="cell" data-field="Detail">
              {/* The absent figure, said aloud. The site renders a dash for
                  unestablished values everywhere else; here it says why,
                  because "no price" on a commercial page is a thing a buyer
                  will assume is an oversight. */}
              <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                <span className="figure">—</span> Not set. The shape is per
                school per term; no amount has been set and no invoice has
                been issued. Enquire and it will be quoted.
              </div>
            </div>
          </div>
          <div className="register-row register--pair" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Where the data goes</div>
            </div>
            <div className="register-cell" role="cell" data-field="Detail">
              <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                {CONSOLE.localFirst}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What this product is trying to become. TARGET, declared — because
          the previous site defined the state, coloured it and never used
          it, which left the pitch with no destination to describe. */}
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

      <section className="section">
        <div className="action-row">
          {/* The one thing a reader can do that is not reading. */}
          <a href={CONSOLE.href} className="btn">
            Open {CONSOLE.name} <span className="glyph">→</span>
          </a>
          <a href={`mailto:${COMPANY.contact.email}`} className="btn-ghost">
            Ask for a walkthrough
          </a>
          <Link href="/control" className="btn-ghost">
            How it fits the system
          </Link>
        </div>
      </section>
    </>
  );
}