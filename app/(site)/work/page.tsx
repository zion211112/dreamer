import Link from "next/link";
import { FACES, BENBEN_BUILDS } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import "../../identity.css";
import "./work.css";

export const metadata = faceMetadata({
  title: "Work",
  description:
    "APT Fab, APT Studio, and the BenBen Builds track — what APT-LABS builds, and where products get built.",
  path: "/work",
});

const product = BENBEN_BUILDS.products[0];

const FAB_CHAIN = ["Requirement", "Design", "BOM", "Source", "Fabricate", "Install", "Repair"];
const STUDIO_CHAIN = ["Compute", "Create", "Render", "Output"];

export default function WorkPage() {
  return (
    <main className="site-page identity-page work-page">
      <div className="site-frame">
        <p className="site-kicker">Work · APT-LABS</p>
        <h1 className="page-title">What we build.</h1>
        <p className="identity-lead">
          Physical infrastructure, creative-computing capacity, and the products
          of a separate build track — each named with its actual state.
        </p>
      </div>

      <div className="site-frame work-sections">
        {/* 01 — APT FAB */}
        <section className="work-section" aria-labelledby="fab">
          <div className="site-section-head">
            <span>01 · {FACES.fab.name}</span>
            <span>Status: {FACES.fab.status}</span>
          </div>
          <h2 id="fab" className="work-title">Physical infrastructure, built for local life.</h2>
          <p className="work-copy">{FACES.fab.description}</p>
          <ol className="work-chain" aria-label="Fabrication chain">
            {FAB_CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="identity-provenance">
            <strong>{FACES.fab.status}</strong> — architecture defined; no fabrication record is published yet.
          </p>
        </section>

        {/* 02 — APT STUDIO */}
        <section className="work-section" aria-labelledby="studio">
          <div className="site-section-head">
            <span>02 · {FACES.studio.name}</span>
            <span>Status: {FACES.studio.status}</span>
          </div>
          <h2 id="studio" className="work-title">Productive computing, closer to the people using it.</h2>
          <p className="work-copy">{FACES.studio.description}</p>
          <ol className="work-chain" aria-label="Production chain">
            {STUDIO_CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="identity-provenance">
            <strong>{FACES.studio.status}</strong> — architecture defined; no installation record is published yet.
          </p>
        </section>

        {/* 03 — BENBEN BUILDS: visually distinct, not a pillar */}
        <section className="work-builds" aria-labelledby="benben-builds">
          <div className="site-section-head">
            <span>03 · {BENBEN_BUILDS.name} · {BENBEN_BUILDS.role}</span>
            <span>Status: {BENBEN_BUILDS.status}</span>
          </div>
          <h2 id="benben-builds" className="work-title">A build track for turning practical ideas into working products.</h2>
          <p className="work-copy">{BENBEN_BUILDS.summary}</p>

          <article className="work-product">
            <div className="work-product-head">
              <span>{BENBEN_BUILDS.name} · Product</span>
              <span>Current status: {product.status}</span>
            </div>
            <h3 className="work-product-name">{product.name}</h3>
            <p className="work-product-line">{product.oneLine}</p>
            <p className="work-product-boundary">
              {product.status} local prototype — {product.boundary.toLowerCase()}.
            </p>
            <div className="identity-actions">
              <Link href={product.route} className="site-action">
                Open the {product.name} <span aria-hidden="true">→</span>
              </Link>
              <Link href={product.floorRoute} className="site-action-secondary">
                Open the Floor intake
              </Link>
            </div>
          </article>
        </section>

        <div className="identity-actions work-close">
          <Link className="site-action-secondary" href="/roll">
            Inspect the record behind the work
          </Link>
          <Link className="site-action" href="/contact">
            Start a project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
