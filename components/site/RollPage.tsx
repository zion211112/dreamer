"use client";

import { StateTag } from "@/components/site/StateTag";
import { STACK, PRODUCTS, COMPANY } from "@/lib/system";

export function RollPage() {
  // The Roll is an evidence system. If no real public records exist,
  // render an honest empty state. Never generate fake ledger activity.
  const hasRealRecords = false; // No real public records exist yet

  return (
    <main className="roll-page">
      <header className="roll-hero">
        <h1>The Roll</h1>
        <p className="roll-kicker">
          Public evidence methodology + any actual public records
        </p>
      </header>

      <section className="roll-section" aria-labelledby="methodology-heading">
        <h2 id="methodology-heading">Evidence methodology</h2>
        <p className="roll-section-desc">
          The Roll answers seven questions for every entry. If an entry cannot answer
          all seven, it is not in the Roll.
        </p>
        <ol className="roll-questions">
          <li><strong>WHAT</strong> happened?</li>
          <li><strong>WHO</strong> contributed?</li>
          <li><strong>WHAT asset/work</strong> was involved?</li>
          <li><strong>WHAT did it cost?</strong></li>
          <li><strong>WHAT was tested?</strong></li>
          <li><strong>WHAT was accepted?</strong></li>
          <li><strong>WHAT remains unknown?</strong></li>
        </ol>
        <p className="roll-methodology-note">
          Each entry carries an evidence state: <StateTag state="VERIFIED" /> settled by a
          source, <StateTag state="PROTOTYPE" /> present and inspectable, <StateTag state="TARGET" />
          intended but not measured, <StateTag state="PLANNED" /> designed but not built,
          <StateTag state="UNKNOWN" /> value not established.
        </p>
      </section>

      <section className="roll-section" aria-labelledby="records-heading">
        <h2 id="records-heading">Public records</h2>
        {hasRealRecords ? (
          <div className="roll-records">
            <p>No real public records exist yet. This section will populate when they do.</p>
          </div>
        ) : (
          <div className="roll-empty-state">
            <div className="roll-empty-icon" aria-hidden="true">📋</div>
            <h3>No public records yet</h3>
            <p>
              The Roll is an evidence system, not a decorative dashboard. We do not
              generate fake ledger activity. When real public records exist — a
              deployment, a funded proposal, a sealed contribution, a tested build —
              they will appear here with their full evidence chain.
            </p>
            <p className="roll-empty-hint">
              This is the honest empty state. It means the system is working as
              designed: nothing is claimed that has not happened.
            </p>
          </div>
        )}
      </section>

      <section className="roll-section" aria-labelledby="state-heading">
        <h2 id="state-heading">Current evidence state of the stack</h2>
        <p className="roll-section-desc">
          The Roll also tracks the evidence state of the infrastructure layers themselves.
        </p>
        <ul className="roll-stack-state">
          {STACK.map((layer) => (
            <li key={layer.key} className="roll-stack-item">
              <div className="roll-stack-head">
                <span className="roll-stack-ord">{layer.ord}</span>
                <span className="roll-stack-name">{layer.name}</span>
                <StateTag state={layer.state} title={layer.provenance} />
              </div>
              <p className="roll-stack-provenance">{layer.provenance}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="roll-section" aria-labelledby="products-heading">
        <h2 id="products-heading">Product evidence state</h2>
        <p className="roll-section-desc">
          Each product track carries its own evidence state and provenance.
        </p>
        <ul className="roll-products">
          {PRODUCTS.map((product) => (
            <li key={product.name} className="roll-product">
              <div className="roll-product-head">
                <span className="roll-product-name">{product.name}</span>
                <StateTag state={product.state} title={product.provenance} />
              </div>
              <p className="roll-product-provenance">{product.provenance}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="roll-footer">
        <p>
          <a href="/">← Home</a> ·
          <a href="/work">Work</a> ·
          <a href="/benben">BenBen</a> ·
          <a href="/contact">Contact</a>
        </p>
      </footer>
    </main>
  );
}