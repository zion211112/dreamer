import Link from "next/link";
import { COMPANY, BENBEN_BUILDS } from "../../lib/company";
import { Reveal } from "../../components/site/Reveal";
import { RollPreview } from "../../components/site/RollPreview";

export const metadata: { title: string; description: string } = {
  title: "Infrastructure institutions can own",
  description:
    "APT-LABS builds physical and digital infrastructure designed for local operation, repair and reproduction.",
};

const product = BENBEN_BUILDS.products[0];

export default function HomePage() {
  return (
    <main className="sb">
      <div className="sb-noise" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <filter id="sb-noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sb-noise-filter)" />
        </svg>
      </div>
      <Reveal />

      {/* ── Hero ── */}
      <section className="sb-hero">
        <div className="sb-grid-bg" aria-hidden="true" />
        <div className="sb-hero-orb" aria-hidden="true" />
        <div className="sb-container sb-hero-layout">
          <div>
            <div className="sb-eyebrow" data-reveal>
              {COMPANY.name} / {COMPANY.geography.text} / Institutional infrastructure
            </div>
            <h1 className="sb-title" data-reveal>
              Infrastructure <em>institutions can own.</em>
            </h1>
            <p className="sb-lead" data-reveal>
              APT-LABS builds physical infrastructure, productive computing
              capacity, and the evidence systems that make local technical
              capability easier to operate, repair, and reproduce.
            </p>
            <div className="sb-actions" data-reveal>
              <Link className="sb-btn sb-btn-primary" href="/work">
                Explore Capabilities
              </Link>
              <Link className="sb-btn sb-btn-ghost" href="/roll">
                Inspect The Roll
              </Link>
            </div>
            <div className="sb-meta" data-reveal>
              <span className="sb-pill">
                <span className="sb-dot" aria-hidden="true" /> Local-first
              </span>
              <span className="sb-pill">
                <span className="sb-dot brass" aria-hidden="true" /> Repair-aware
              </span>
              <span className="sb-pill">
                <span className="sb-dot brass" aria-hidden="true" /> Evidence-led
              </span>
            </div>
          </div>

          <div className="sb-stage" data-reveal>
            <div className="sb-product" role="img" aria-label="APT-LABS system surface: physical systems, productive compute, public evidence">
              <div className="sb-product-top">
                <span className="name">APT-LABS / SYSTEM SURFACE</span>
                <span className="state">● PROTOTYPE RECORD</span>
              </div>
              <div className="sb-product-main">
                <div className="sb-product-side" aria-hidden="true">
                  <p className="sb-product-side-title">Core view</p>
                  <div className="sb-product-side-item active">Overview</div>
                  <div className="sb-product-side-item">Builds</div>
                  <div className="sb-product-side-item">Compute</div>
                  <div className="sb-product-side-item">Evidence</div>
                </div>
                <div className="sb-product-content">
                  <div className="sb-product-heading">
                    <div>
                      <h2>Infrastructure Stack</h2>
                      <p>Physical systems · productive compute · public evidence</p>
                    </div>
                    <span className="sb-pill">
                      <span className="sb-dot" aria-hidden="true" /> Local
                    </span>
                  </div>
                  <div className="sb-signal-bar" aria-hidden="true">
                    <span className="live" />
                    <span className="live" />
                    <span className="brass" />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="sb-metrics">
                    <div className="sb-metric">
                      <small>APT Fab</small>
                      <strong className="brass">DESIGN → BUILD</strong>
                    </div>
                    <div className="sb-metric">
                      <small>APT Studio</small>
                      <strong className="green">COMPUTE → OUTPUT</strong>
                    </div>
                    <div className="sb-metric">
                      <small>The Roll</small>
                      <strong>RECORD → VERIFY</strong>
                    </div>
                    <div className="sb-metric">
                      <small>BenBen Builds</small>
                      <strong>PRODUCT TRACK</strong>
                    </div>
                  </div>
                  <div className="sb-product-footer">
                    <span>Demonstration surface</span>
                    <span>Not a deployment claim</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statement ── */}
      <section className="sb-statement">
        <div className="sb-container sb-statement-row">
          <h2>
            Build locally. <span>Keep capability local.</span>
          </h2>
          <span className="sb-micro">System / 01</span>
        </div>
      </section>

      {/* ── Work ── */}
      <section id="work" className="sb-section">
        <div className="sb-container">
          <div className="sb-section-header">
            <div>
              <div className="sb-eyebrow">01 / Work</div>
              <h2 className="sb-section-title" data-reveal>
                Three operating pillars.
              </h2>
            </div>
            <div>
              <p className="sb-section-copy" data-reveal>
                APT-LABS focuses on the physical systems, productive computing
                capacity, and evidence infrastructure that surround durable
                institutional technology.
              </p>
              <Link className="sb-section-link" href="/work" data-reveal>
                Open the full work record →
              </Link>
            </div>
          </div>

          <div className="sb-work-grid">
            <article className="sb-work-card large" data-reveal>
              <div className="sb-work-num">01 / APT FAB</div>
              <h3>Physical infrastructure.</h3>
              <div className="sb-work-tag">Design · sourcing · fabrication · repair</div>
              <p>
                Institutional requirements become documented physical systems:
                clear requirements, sensible parts, traceable sourcing,
                fabrication, installation, and a repair path.
              </p>
              <div className="sb-process">
                <div className="sb-process-label">Lifecycle</div>
                <div className="sb-process-track">
                  <span className="sb-process-step">Requirement</span>
                  <span className="sb-process-step">Design</span>
                  <span className="sb-process-step">BOM</span>
                  <span className="sb-process-step">Fabricate</span>
                  <span className="sb-process-step">Repair</span>
                </div>
              </div>
            </article>

            <article className="sb-work-card" data-reveal>
              <div className="sb-work-num">02 / APT STUDIO</div>
              <h3>Productive computing.</h3>
              <div className="sb-work-tag">Compute · create · render · output</div>
              <p>
                Local creative-computing environments for rendering, digital
                production, and technical skill development.
              </p>
              <div className="sb-process">
                <div className="sb-process-label">Pipeline</div>
                <div className="sb-process-track">
                  <span className="sb-process-step">Compute</span>
                  <span className="sb-process-step">Create</span>
                  <span className="sb-process-step">Render</span>
                  <span className="sb-process-step">Output</span>
                </div>
              </div>
            </article>
          </div>

          <div className="sb-studio-layout" data-reveal>
            <div className="sb-studio-canvas">
              <div className="sb-micro" style={{ marginBottom: 12 }}>
                Creative compute / Visualized
              </div>
              <div className="sb-frame-grid" aria-hidden="true">
                <div className="sb-frame"><span>FRAME 01</span></div>
                <div className="sb-frame"><span>FRAME 02</span></div>
                <div className="sb-frame"><span>FRAME 03</span></div>
                <div className="sb-frame"><span>FRAME 04</span></div>
              </div>
            </div>
            <div className="sb-studio-specs">
              <div className="sb-spec-row"><span>Compute</span><span>Local GPU</span></div>
              <div className="sb-spec-row"><span>Workflow</span><span>Open tooling</span></div>
              <div className="sb-spec-row"><span>Purpose</span><span>Production</span></div>
              <div className="sb-spec-row"><span>State</span><span>Development</span></div>
            </div>
          </div>

          <div className="sb-work-grid" style={{ marginTop: 54 }}>
            <article className="sb-work-card" data-reveal>
              <div className="sb-work-num">03 / THE ROLL</div>
              <h3>The evidence layer.</h3>
              <div className="sb-work-tag">Record · verify · audit · reproduce</div>
              <p>
                The Roll records the work behind the work: designs, assets,
                costs, contributors, maintenance, tests, and the evidence
                needed to reproduce useful systems.
              </p>
              <div className="sb-process">
                <div className="sb-process-label">Evidence lifecycle</div>
                <div className="sb-process-track">
                  <span className="sb-process-step">Record</span>
                  <span className="sb-process-step">Verify</span>
                  <span className="sb-process-step">Audit</span>
                  <span className="sb-process-step">Reproduce</span>
                </div>
              </div>
            </article>
            <div className="sb-boundary" data-reveal>
              <div className="sb-boundary-layout">
                <div>
                  <small>BenBen Builds · Product track</small>
                  <h4>BenBen Builds</h4>
                  <p>
                    Products begin with field problems. {product.name} turns
                    practical opportunities into standalone tools — a local
                    prototype with {product.boundary.toLowerCase()}.
                  </p>
                </div>
                <Link className="sb-btn sb-btn-ghost" href={product.route}>
                  Open Console →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roll preview ── */}
      <section id="roll" className="sb-section sb-section-rule">
        <div className="sb-container">
          <RollPreview />
        </div>
      </section>

      {/* ── About teaser ── */}
      <section id="about" className="sb-section">
        <div className="sb-container">
          <div className="sb-section-header">
            <div>
              <div className="sb-eyebrow">03 / About</div>
              <h2 className="sb-section-title" data-reveal>
                Build locally. Keep capability local.
              </h2>
            </div>
            <div>
              <p className="sb-section-copy" data-reveal>
                APT-LABS treats infrastructure as more than the thing an
                institution buys. It includes the ability to understand it,
                maintain it, repair it, document it, and reproduce useful
                parts of it.
              </p>
              <Link className="sb-section-link" href="/about" data-reveal>
                Read the full posture →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section id="contact" className="sb-closing sb-section-rule">
        <div className="sb-container">
          <div className="sb-eyebrow">APT-LABS / Contact</div>
          <h2 data-reveal>
            Build something <span>worth keeping.</span>
          </h2>
          <p data-reveal>
            Institutions, technical partners, makers, creators and funders can
            begin with the system, the constraints, and the evidence.
          </p>
          <div className="sb-closing-actions" data-reveal>
            <a
              href={`mailto:${COMPANY.contact.email}?subject=APT-LABS%20enquiry`}
              className="sb-btn sb-btn-primary"
            >
              Build With Us
            </a>
            <a
              href={COMPANY.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sb-btn sb-btn-ghost"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <footer className="sb-container sb-footer">
        <span>APT-LABS / Kirinyaga</span>
        <span>Physical · Compute · Evidence · Local capability</span>
      </footer>
    </main>
  );
}
