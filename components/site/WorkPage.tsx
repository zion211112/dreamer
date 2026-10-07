"use client";

import { StateTag } from "@/components/site/StateTag";
import { PRODUCTS, STACK, COMPANY } from "@/lib/system";

export function WorkPage() {
  const managementSystems = PRODUCTS.filter((p) => p.kind === "management-system");
  const mvps = PRODUCTS.filter((p) => p.kind === "mvp");
  const studios = PRODUCTS.filter((p) => p.kind === "studio");

  return (
    <main className="work-page">
      <header className="work-hero">
        <h1>Work</h1>
        <p className="work-kicker">
          APT Fab · APT Studio · Selected work / prototypes · Explicit evidence states
        </p>
      </header>

      <section className="work-section" aria-labelledby="fab-heading">
        <h2 id="fab-heading">APT Fab</h2>
        <p className="work-section-desc">
          Commissioned MVPs — one named problem, scoped and priced per build. The track
          is designed. No commission has been taken and no scope has been agreed.
        </p>
        <div className="work-tracks">
          {mvps.map((product) => (
            <article key={product.name} className="work-track">
              <div className="work-track-head">
                <h3>{product.name}</h3>
                <StateTag state={product.state} title={product.provenance} />
              </div>
              <p className="work-track-buyer">{product.buyer}</p>
              <p className="work-track-provenance">{product.provenance}</p>
              <p className="work-track-chain">{product.chain}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section" aria-labelledby="studio-heading">
        <h2 id="studio-heading">APT Studio</h2>
        <p className="work-section-desc">
          Builds worked on with the register public from brief to result. The track is
          designed. No studio is published and no build has been run in one.
        </p>
        <div className="work-tracks">
          {studios.map((product) => (
            <article key={product.name} className="work-track">
              <div className="work-track-head">
                <h3>{product.name}</h3>
                <StateTag state={product.state} title={product.provenance} />
              </div>
              <p className="work-track-buyer">{product.buyer}</p>
              <p className="work-track-provenance">{product.provenance}</p>
              <p className="work-track-chain">{product.chain}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section" aria-labelledby="selected-heading">
        <h2 id="selected-heading">Selected work / prototypes</h2>
        <p className="work-section-desc">
          Management systems with a surface. The only product with a route is the
          School Console. It is a prototype running on invented data.
        </p>
        <div className="work-tracks">
          {managementSystems.map((product) => (
            <article key={product.name} className="work-track work-track--live">
              <div className="work-track-head">
                <h3>
                  {product.href ? (
                    <a href={product.href}>{product.name}</a>
                  ) : (
                    product.name
                  )}
                </h3>
                <StateTag state={product.state} title={product.provenance} />
              </div>
              <p className="work-track-buyer">{product.buyer}</p>
              <p className="work-track-provenance">{product.provenance}</p>
              <p className="work-track-chain">{product.chain}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section" aria-labelledby="stack-evidence-heading">
        <h2 id="stack-evidence-heading">Infrastructure stack evidence</h2>
        <p className="work-section-desc">
          Five layers. One is PROTOTYPE (Record). Four are PLANNED.
        </p>
        <ul className="work-stack-evidence">
          {STACK.map((layer) => (
            <li key={layer.key} className="work-stack-layer">
              <div className="work-stack-layer-head">
                <span className="work-stack-ord">{layer.ord}</span>
                <span className="work-stack-name">{layer.name}</span>
                <StateTag state={layer.state} />
              </div>
              <p className="work-stack-built">{layer.built}</p>
              <p className="work-stack-settles">{layer.settles}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="work-footer">
        <p>
          <a href="/">← Home</a> ·
          <a href="/roll">The Roll</a> ·
          <a href="/benben">BenBen</a> ·
          <a href="/contact">Contact</a>
        </p>
      </footer>
    </main>
  );
}