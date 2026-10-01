import Link from "next/link";
import { FACES, BENBEN_BUILDS } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { Reveal } from "../../../components/site/Reveal";
import "../register.css";
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

/** Evidence states are stored uppercase; the register speaks title case. */
const stateWord = (state: string) => state.charAt(0) + state.slice(1).toLowerCase();
const stateKey = (state: string) => state.toLowerCase();

/** The three build surfaces. The registry and the hero aside both read this. */
const SURFACES = [
  {
    key: "fab",
    index: "01",
    role: "Core",
    type: "Physical infrastructure",
    name: FACES.fab.name,
    status: FACES.fab.status,
    copy: "Requirement → design → BOM → source → fabricate → install → repair.",
    href: "#fab",
  },
  {
    key: "studio",
    index: "02",
    role: "Core",
    type: "Creative computing",
    name: FACES.studio.name,
    status: FACES.studio.status,
    copy: "Compute → create → render → output, alongside the skills that keep it running.",
    href: "#studio",
  },
  {
    key: "benben",
    index: "03",
    role: "Track",
    type: "Build / product track",
    name: BENBEN_BUILDS.name,
    status: BENBEN_BUILDS.status,
    copy: `Practical ideas become products. Current product: ${product.name}.`,
    href: "#benben",
  },
];

/** The map nodes. Fab and Studio are core; BenBen is the product track. */
const MAP_NODES = [
  {
    code: "01 / APT FAB",
    kind: "core",
    status: FACES.fab.status,
    title: "Physical infrastructure.",
    copy: "Institutional equipment designed around local operating reality, maintainability and documented build paths.",
  },
  {
    code: "02 / APT STUDIO",
    kind: "core",
    status: FACES.studio.status,
    title: "Productive computing.",
    copy: "Compute, media production and technical capability located closer to the people using it.",
  },
  {
    code: "03 / BENBEN BUILDS",
    kind: "product",
    status: BENBEN_BUILDS.status,
    title: "Product development track.",
    copy: "Practical ideas become working products — separate from the APT-LABS core.",
  },
];

export default function WorkPage() {
  return (
    <main className="rg-page work-page">
      <Reveal />

      {/* ── Hero ── */}
      <section className="rg-hero">
        <div className="rg-frame rg-hero-grid">
          <div>
            <p className="rg-eyebrow">Work · APT-LABS</p>
            <h1 className="rg-title">
              What we <em>build.</em>
            </h1>
            <p className="rg-lead">
              Physical infrastructure, creative-computing capacity, and the
              products of a separate build track — each named with its actual
              state.
            </p>
          </div>

          <aside className="rg-aside">
            {SURFACES.map((surface) => (
              <div className="rg-aside-row" key={surface.key}>
                <span>
                  {surface.index} / {surface.role}
                </span>
                <strong>{surface.name}</strong>
              </div>
            ))}
            <div className="rg-aside-row">
              <span>Record</span>
              <strong>{FACES.roll.name}</strong>
            </div>
          </aside>
        </div>

        <div className="rg-frame rg-base">
          <span>Kirinyaga · Kenya</span>
          <span>Three build surfaces · one evidence layer</span>
        </div>
      </section>

      {/* ── Operating strip ── */}
      <div className="rg-frame">
        <div className="rg-strip" data-reveal>
          <div className="rg-cell">
            <span className="rg-cell-label">Operating model</span>
            <span className="rg-cell-value">Build → Measure → Document → Repeat</span>
          </div>
          {SURFACES.map((surface) => (
            <div className="rg-cell" key={surface.key}>
              <span className="rg-cell-label">{surface.name}</span>
              <span className="rg-cell-value">{stateWord(surface.status)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── System map ── */}
      <section className="rg-section">
        <div className="rg-frame">
          <div className="rg-head" data-reveal>
            <p className="rg-mark">01 / System</p>
            <div>
              <h2 className="rg-h2">Distinct build surfaces. One coherent system.</h2>
              <p className="rg-copy">
                APT-LABS builds physical infrastructure and productive computing
                capacity. BenBen Builds is a separate track for developing
                practical products. The Roll records what the system can
                substantiate.
              </p>
            </div>
          </div>

          <div className="rg-panel" data-reveal>
            <div className="rg-panel-head">
              <span>APT-LABS / System map / 01</span>
              <span>State is part of the interface</span>
            </div>

            <div className="wk-system-body">
              <div className="wk-column wk-column-left">
                {MAP_NODES.map((node) => (
                  <article className="wk-node" data-kind={node.kind} key={node.code}>
                    <div className="wk-node-top">
                      <span className="wk-node-code">{node.code}</span>
                      <span className="rg-chip" data-state={stateKey(node.status)}>
                        {stateWord(node.status)}
                      </span>
                    </div>
                    <h3>{node.title}</h3>
                    <p>{node.copy}</p>
                  </article>
                ))}
              </div>

              <div className="wk-core-cell" aria-hidden="true">
                <div className="wk-core">
                  <span className="wk-core-text">
                    APT-LABS
                    <br />
                    System
                  </span>
                </div>
              </div>

              <div className="wk-column wk-column-right">
                <article className="wk-node" data-kind="record">
                  <div className="wk-node-top">
                    <span className="wk-node-code">{FACES.roll.name}</span>
                    <span className="rg-chip">Evidence layer</span>
                  </div>
                  <h3>The record behind the work.</h3>
                  <p>
                    Assets, people, costs, technical documents, milestones,
                    acceptance and provenance.
                  </p>
                </article>
                <p className="wk-quiet">
                  The record does not upgrade a state. Evidence does.
                </p>
              </div>
            </div>

            <div className="rg-panel-foot">
              <span>Planned ≠ prototype ≠ deployed ≠ verified</span>
              <span>Evidence remains inspectable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Registry ── */}
      <section className="rg-section" style={{ paddingTop: 0 }}>
        <div className="rg-frame">
          <div className="rg-head" data-reveal>
            <p className="rg-mark">02 / Registry</p>
            <div>
              <h2 className="rg-h2">The work, at a glance.</h2>
              <p className="rg-copy">
                A compact operating view. No inflated portfolio language, and no
                state claims beyond what the system currently supports.
              </p>
            </div>
          </div>

          <div className="wk-registry" data-reveal>
            {SURFACES.map((surface) => (
              <div className="wk-row" key={surface.key}>
                <span className="wk-index">{surface.index}</span>
                <div className="wk-row-name">
                  <div className="wk-row-title">{surface.name}</div>
                  <div className="wk-row-type">{surface.type}</div>
                </div>
                <p className="wk-row-copy">{surface.copy}</p>
                <span className="wk-row-state">
                  <span className="rg-chip" data-state={stateKey(surface.status)}>
                    {stateWord(surface.status)}
                  </span>
                </span>
                <Link
                  className="wk-open"
                  href={surface.href}
                  aria-label={`Open ${surface.name} detail`}
                >
                  ↘
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Build logic — the two core capabilities ── */}
      <section className="rg-section" style={{ paddingTop: 0 }}>
        <div className="rg-frame">
          <div className="rg-head" data-reveal>
            <p className="rg-mark">03 / Build logic</p>
            <div>
              <h2 className="rg-h2">Capability is built in sequences.</h2>
              <p className="rg-copy">
                The sequence creates the handoff: requirement to build, build to
                operation, operation to evidence.
              </p>
            </div>
          </div>

          <div className="wk-details">
            <article className="wk-detail" id="fab" data-reveal>
              <div className="wk-detail-head">
                <span className="wk-detail-code">01 / {FACES.fab.name}</span>
                <span className="rg-chip" data-state={stateKey(FACES.fab.status)}>
                  {stateWord(FACES.fab.status)}
                </span>
              </div>
              <h3>Physical infrastructure, built for local life.</h3>
              <p>{FACES.fab.description}</p>
              <div className="rg-pipeline">
                {FAB_CHAIN.map((step, i) => (
                  <div className="rg-step" key={step}>
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
              <p className="rg-note">
                <strong>{stateWord(FACES.fab.status)}</strong> — architecture
                defined; no fabrication record is published yet.
              </p>
            </article>

            <article className="wk-detail" id="studio" data-reveal>
              <div className="wk-detail-head">
                <span className="wk-detail-code">02 / {FACES.studio.name}</span>
                <span className="rg-chip" data-state={stateKey(FACES.studio.status)}>
                  {stateWord(FACES.studio.status)}
                </span>
              </div>
              <h3>Productive computing, closer to the people using it.</h3>
              <p>{FACES.studio.description}</p>
              <div className="rg-pipeline" data-steps="4">
                {STUDIO_CHAIN.map((step, i) => (
                  <div className="rg-step" key={step}>
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
              <p className="rg-note">
                <strong>{stateWord(FACES.studio.status)}</strong> — architecture
                defined; no installation record is published yet.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── BenBen Builds — the product track, visibly separate ── */}
      <section className="rg-section" style={{ paddingTop: 0 }}>
        <div className="rg-frame">
          <article className="wk-product" id="benben" data-reveal>
            <div className="wk-product-head">
              <span className="wk-product-tag">
                <b>03 / {BENBEN_BUILDS.name}</b>
                <span>{"// separate build / product track"}</span>
              </span>
              <span className="rg-chip" data-state={stateKey(BENBEN_BUILDS.status)}>
                {stateWord(BENBEN_BUILDS.status)}
              </span>
            </div>

            <div className="wk-product-body">
              <div>
                <p className="rg-eyebrow">Featured current prototype</p>
                <h3>{product.name}</h3>
                <p className="wk-product-copy">{product.oneLine}</p>
                <p className="wk-product-note">
                  {stateWord(product.status)} — local prototype. {product.boundary}.
                </p>
                <div className="wk-actions">
                  <Link className="site-action" href={product.route}>
                    Open {product.name} <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="site-action-secondary" href={product.floorRoute}>
                    Open the Floor intake
                  </Link>
                </div>
              </div>

              <div className="wk-console" aria-label={`${product.name} state`}>
                <div className="wk-console-left">
                  <div>
                    <p className="rg-eyebrow">Product state</p>
                    <div className="wk-console-mark" aria-hidden="true">
                      <span>SC</span>
                    </div>
                  </div>
                  <span className="rg-chip" data-state={stateKey(product.status)}>
                    {stateWord(product.status)}
                  </span>
                </div>

                <div className="wk-console-right">
                  <div className="wk-spec">
                    <span>Product</span>
                    <b>{product.name}</b>
                  </div>
                  <div className="wk-spec">
                    <span>Purpose</span>
                    <b>Teacher + school operations</b>
                  </div>
                  <div className="wk-spec">
                    <span>Architecture</span>
                    <b>Offline-first / device-local</b>
                  </div>
                  <div className="wk-spec">
                    <span>State</span>
                    <b>{stateWord(product.status)}</b>
                  </div>
                  <div className="wk-spec">
                    <span>Deployment</span>
                    <b>{product.boundary}</b>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Closing — the record, the floor, the door ── */}
      <section className="rg-end">
        <div className="rg-frame">
          <div className="rg-end-grid" data-reveal>
            <div>
              <p className="rg-eyebrow">The record behind the work</p>
              <h2>
                What is built should leave <span>evidence behind.</span>
              </h2>
            </div>

            <div>
              <p className="rg-end-copy">
                The Roll carries project records, asset states, technical
                documents, provenance and the distinction between planned,
                prototype, installed and verified.
              </p>

              <div className="rg-tiles">
                <Link className="rg-tile" href="/roll">
                  <small>Evidence</small>
                  <strong>Inspect The Roll ↗</strong>
                </Link>
                <Link className="rg-tile" href={product.floorRoute}>
                  <small>Intake</small>
                  <strong>Open The Floor ↗</strong>
                </Link>
                <Link className="rg-tile" href="/contact">
                  <small>Engagement</small>
                  <strong>Start a project →</strong>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}





