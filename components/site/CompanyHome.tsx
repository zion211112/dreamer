import Link from "next/link";
import { ValueChain } from "@/components/site/ValueChain";
import { StateTag } from "@/components/site/StateTag";
import {
  BUILT_LAYERS,
  COMPANY,
  CONSOLE,
  PRODUCTS,
  STACK,
  TENDER_SYSTEM,
} from "@/lib/system";

export function CompanyHome() {
  const buildTracks = PRODUCTS.filter((product) => !product.href);

  return (
    <div className="company-home">
      <section className="company-hero" aria-labelledby="company-title">
        <div className="company-hero-copy">
          <p className="company-eyebrow">APT-LABS / Sovereign infrastructure</p>
          <h1 id="company-title">{COMPANY.mantra}</h1>
          <p className="company-intro">
            Five layers join local records, earned identity, open builds,
            physical infrastructure and community allocation.
          </p>
          <div className="company-actions">
            <Link className="company-button" href="/stack">
              Inspect the five layers <span aria-hidden="true">↗</span>
            </Link>
            <Link className="company-text-link" href="#portfolio">
              Products and build tracks <span aria-hidden="true">↓</span>
            </Link>
          </div>
        </div>

        <figure className="company-diagram">
          <figcaption className="diagram-cap">
            <span>System / sovereignty stack</span>
            <span>{String(STACK.length).padStart(2, "0")} LAYERS</span>
          </figcaption>
          <ol className="diagram-layers">
            {STACK.map((layer, index) => (
              <li className="diagram-layer" data-live={layer.state === "PROTOTYPE"} key={layer.key}>
                <div className="diagram-layer-head">
                  <span className="diagram-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="diagram-name">{layer.name}</span>
                  {layer.alias ? <span className="diagram-alias">{layer.alias}</span> : null}
                  <StateTag state={layer.state} />
                </div>
                <p className="diagram-role">{layer.role}</p>
              </li>
            ))}
          </ol>
          <p className="diagram-note">
            Prototype surfaces: {BUILT_LAYERS.length} / {STACK.length}
          </p>
        </figure>
      </section>

      <section className="portfolio-section" id="portfolio" aria-labelledby="products-title">
        <div className="portfolio-heading">
          <div>
            <p className="company-eyebrow">Portfolio / applications and tracks</p>
            <h2 id="products-title">Products apply the stack. They are not the stack.</h2>
          </div>
          <p>
            Independent systems address different domains. This repository
            documents each at the level its evidence supports.
          </p>
        </div>

        <div className="portfolio-list">
          <article className="portfolio-row">
            <span className="portfolio-number">01</span>
            <div className="portfolio-main">
              <p className="portfolio-kind">Named system</p>
              <h3>{TENDER_SYSTEM.name}</h3>
              <p>{TENDER_SYSTEM.summary}</p>
            </div>
            <div className="portfolio-state">
              <StateTag state={TENDER_SYSTEM.state} />
              <span>Product identity is named; scope and implementation are not documented here.</span>
            </div>
            <a className="portfolio-link" href={`mailto:${COMPANY.contact.email}?subject=Tender%20System`}>
              Discuss this system <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="portfolio-row">
            <span className="portfolio-number">02</span>
            <div className="portfolio-main">
              <p className="portfolio-kind">Record-layer application · {CONSOLE.kind}</p>
              <h3>{CONSOLE.name}</h3>
              <p>{CONSOLE.oneLine}</p>
            </div>
            <div className="portfolio-state">
              <StateTag state={CONSOLE.state} />
              <span>Local prototype · invented demonstration data</span>
            </div>
            <Link className="portfolio-link" href="/product">
              Inspect the product <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </div>

        <section className="portfolio-tracks" aria-labelledby="tracks-title">
          <div className="portfolio-tracks-heading">
            <h3 id="tracks-title">Build tracks</h3>
            <span>Designed, not launched</span>
          </div>
          <ul>
            {buildTracks.map((track) => (
              <li key={track.name}>
                <span className="portfolio-track-name">{track.name}</span>
                <span className="portfolio-track-buyer">{track.buyer}</span>
                <StateTag state={track.state} />
              </li>
            ))}
          </ul>
        </section>

        <p className="portfolio-foot">
          The catalog is intentionally partial. Additional products are not
          inferred from the stack or from sectors APT-LABS has not documented.
        </p>
      </section>

      <ValueChain />

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="principles-index">
          <p className="company-eyebrow">Operating principles</p>
          <h2 id="principles-title">Authority stays visible.</h2>
          <p>{COMPANY.supporting}</p>
          <Link className="company-text-link" href="/evidence">
            Read the claim and state rules <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="principle-list">
          <div><span>01</span><strong>Custody</strong><p>Records stay where they are created.</p></div>
          <div><span>02</span><strong>Contribution</strong><p>Identity and weight derive from work, not purchase.</p></div>
          <div><span>03</span><strong>Allocation</strong><p>Rules are visible before decisions are made.</p></div>
        </div>
      </section>
    </div>
  );
}