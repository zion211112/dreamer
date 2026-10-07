"use client";

import { StateTag } from "@/components/site/StateTag";
import { PRODUCTS, COMPANY } from "@/lib/system";

export function BenBenPage() {
  const schoolConsole = PRODUCTS.find((p) => p.name === "School Console");

  return (
    <main className="benben-page">
      <header className="benben-hero">
        <h1>BenBen</h1>
        <p className="benben-kicker">
          Associated product track · School Console prototype
        </p>
        <p className="benben-boundary">
          <strong>School Console belongs to BenBen Builds.</strong> It must never visually or
          verbally imply that it is the flagship APT-LABS product.
        </p>
      </header>

      <section className="benben-section" aria-labelledby="console-heading">
        <h2 id="console-heading">School Console</h2>
        <p className="benben-section-desc">
          Management system prototype running on invented data. Nine modules. Built and
          openable from this site. No school runs it and none has bought it.
        </p>
        {schoolConsole && (
          <article className="benben-product">
            <div className="benben-product-head">
              <h3>
                {schoolConsole.href ? (
                  <a href={schoolConsole.href}>{schoolConsole.name}</a>
                ) : (
                  schoolConsole.name
                )}
              </h3>
              <StateTag state={schoolConsole.state} title={schoolConsole.provenance} />
            </div>
            <p className="benben-product-buyer">{schoolConsole.buyer}</p>
            <p className="benben-product-provenance">{schoolConsole.provenance}</p>
            <p className="benben-product-chain">{schoolConsole.chain}</p>
            {schoolConsole.href && (
              <a href={schoolConsole.href} className="benben-product-link">
                Open School Console →
              </a>
            )}
          </article>
        )}
      </section>

      <section className="benben-section" aria-labelledby="build-heading">
        <h2 id="build-heading">Build Studio</h2>
        <p className="benben-section-desc">
          The Build Studio track is designed. No studio is published and no build has
          been run in one. This is a PLANNED track.
        </p>
        <div className="benben-build">
          <p>
            Brief → register published → build → what it actually did.
          </p>
          <StateTag state="PLANNED" />
        </div>
      </section>

      <section className="benben-section" aria-labelledby="allocation-heading">
        <h2 id="allocation-heading">Allocation (BenBen track)</h2>
        <p className="benben-section-desc">
          Where a community decides what to fund, under rules it can read before it
          decides. Designed as a board where proposals are posted, needs are stated,
          and decisions are taken under published rules. No pool, no round, and no
          allocation has been run through it.
        </p>
        <p className="benben-allocation-state">
          State: <StateTag state="PLANNED" />
        </p>
      </section>

      <footer className="benben-footer">
        <p>
          <a href="/">← Home</a> ·
          <a href="/work">Work</a> ·
          <a href="/roll">The Roll</a> ·
          <a href="/contact">Contact</a>
        </p>
      </footer>
    </main>
  );
}