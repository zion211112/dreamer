"use client";

import { StateTag } from "@/components/site/StateTag";
import { STACK, PRODUCTS, COMPANY } from "@/lib/system";

export function CurrentProof() {
  // What's real: School Console (PROTOTYPE), 0 customers
  const realProducts = PRODUCTS.filter((p) => p.state === "PROTOTYPE");
  const plannedProducts = PRODUCTS.filter((p) => p.state === "PLANNED");
  const prototypeLayers = STACK.filter((l) => l.state === "PROTOTYPE").length;
  const plannedLayers = STACK.filter((l) => l.state === "PLANNED").length;

  return (
    <section className="current-proof" aria-labelledby="proof-heading">
      <div className="section-head">
        <h2 id="proof-heading" className="section-title">
          Current proof
        </h2>
        <p className="section-kicker">
          What exists today · Evidence states are explicit
        </p>
      </div>

      <div className="proof-grid">
        {/* Product tracks */}
        <article className="proof-section">
          <h3>Product tracks</h3>
          <div className="proof-items">
            {realProducts.map((product) => (
              <div key={product.name} className="proof-item">
                <div className="proof-item-head">
                  <h4>{product.name}</h4>
                  <StateTag state={product.state} title={product.provenance} />
                </div>
                <p className="proof-item-desc">{product.buyer}</p>
                <p className="proof-item-note">
                  <StateTag state="PROTOTYPE" /> {product.provenance}
                </p>
              </div>
            ))}
            {plannedProducts.map((product) => (
              <div key={product.name} className="proof-item proof-item--planned">
                <div className="proof-item-head">
                  <h4>{product.name}</h4>
                  <StateTag state={product.state} />
                </div>
                <p className="proof-item-desc">{product.buyer}</p>
                <p className="proof-item-note">
                  <StateTag state="PLANNED" /> {product.provenance}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Stack layers */}
        <article className="proof-section">
          <h3>Infrastructure stack</h3>
          <div className="proof-summary">
            <div className="proof-summary-row">
              <span className="proof-summary-label">PROTOTYPE layers</span>
              <span className="proof-summary-value">
                <StateTag state="PROTOTYPE" />
                {prototypeLayers} of {STACK.length}
              </span>
            </div>
            <div className="proof-summary-row">
              <span className="proof-summary-label">PLANNED layers</span>
              <span className="proof-summary-value">
                <StateTag state="PLANNED" />
                {plannedLayers} of {STACK.length}
              </span>
            </div>
            <ul className="proof-layers">
              {STACK.map((layer) => (
                <li key={layer.key} className="proof-layer">
                  <span className="proof-layer-name">{layer.name}</span>
                  <StateTag state={layer.state} />
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Customers */}
        <article className="proof-section">
          <h3>Customers</h3>
          <div className="proof-items">
            {COMPANY.buyers.map((buyer) => (
              <div key={buyer.name} className="proof-item proof-item--buyer">
                <div className="proof-item-head">
                  <h4>{buyer.name}</h4>
                  <StateTag state={buyer.state} title={buyer.note} />
                </div>
                <p className="proof-item-desc">{buyer.what}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}