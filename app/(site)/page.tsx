import Link from "next/link";
import { COMPANY } from "../../lib/company";
import "../globals.css";
import "../home.css";

export const metadata: { title: string; description: string } = {
  title: "Systems your institutions can own",
  description:
    "APT-LABS builds locally owned systems that run without a network, a subscription, or us — and stay in the hands of the people they serve.",
};

export default function HomePage() {
  return (
    <main className="sublime">
      <div className="sublime-glow" aria-hidden="true" />

      <section className="sublime-hero">
        <div className="site-frame sublime-hero-grid">
          <div>
            <p className="sublime-eyebrow">
              <span className="sublime-eyebrow-dot" aria-hidden="true" />
              {COMPANY.name} · {COMPANY.geography.text}
            </p>
            <h1 className="page-title sublime-title">
              Systems your institutions can own.
            </h1>
            <p className="sublime-lede">
              Built to run without a network, without a subscription, without us
              — and kept in the hands of the people they serve.
            </p>
            <div className="sublime-actions">
              <Link href="/console" className="site-action">
                Enter the console <span aria-hidden="true">→</span>
              </Link>
              <Link href="/benben" className="site-action-secondary">
                Enter the Floor
              </Link>
            </div>
          </div>

          {/* Visual slot — reference images carry photography here; evidence
              pack §16 forbids field photos, so the evidence-state rail stands
              in: same compositional weight, honest content. */}
          <aside className="sublime-panel" aria-label="Prototype state">
            <div className="sublime-panel-head">
              <span>Prototype state</span>
              <span>Local-first</span>
            </div>
            <div className="sublime-panel-grid">
              <div>
                <span>Console</span>
                <strong>Prototype</strong>
              </div>
              <div>
                <span>Floor</span>
                <strong>Prototype</strong>
              </div>
              <div>
                <span>Deployments</span>
                <strong>None on record</strong>
              </div>
              <div>
                <span>Shared DB</span>
                <strong>None</strong>
              </div>
            </div>
            <p className="sublime-panel-note">
              A quiet prototype. Most of it is still being built.{" "}
              <Link href="/evidence">What exists today →</Link>
            </p>
          </aside>
        </div>
      </section>

      {/* Trio — the reference SaaS three-card row (BloomFi / Enblox / Miraculum),
          rendered as intake → product → proof. No partners, no metrics. */}
      <section className="sublime-trio" aria-label="Where to go">
        <div className="site-frame">
          <div className="site-section-head">
            <span>Start here</span>
            <span>three doors · one system</span>
          </div>
          <div className="sublime-trio-grid">
            <Link href="/benben" className="sublime-card">
              <span className="sublime-card-kicker">01 · Intake</span>
              <strong>The Floor</strong>
              <p>Capability enters here. Starts empty, stays in this browser.</p>
              <span className="sublime-card-go">Enter →</span>
            </Link>
            <Link href="/console" className="sublime-card">
              <span className="sublime-card-kicker">02 · Product</span>
              <strong>The Console</strong>
              <p>The working surface for the institutional week. Local-first.</p>
              <span className="sublime-card-go">Open →</span>
            </Link>
            <Link href="/evidence" className="sublime-card">
              <span className="sublime-card-kicker">03 · Proof</span>
              <strong>Evidence</strong>
              <p>What exists, what is tested, what stays unknown — named plainly.</p>
              <span className="sublime-card-go">Inspect →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="sublime-whisper">
        <div className="site-frame">
          <div className="sublime-whisper-row" role="list" aria-label="How we build">
            <span role="listitem">Local</span>
            <span role="listitem">Offline</span>
            <span role="listitem">Reproducible</span>
          </div>
          <p className="sublime-whisper-note">
            A quiet prototype. Most of it is still being built.
          </p>
        </div>
      </section>
    </main>
  );
}
