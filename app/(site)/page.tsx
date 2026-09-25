import type { Metadata } from "next";
import Link from "next/link";
import DeployPreview from "../../components/DeployPreview";
import SystemMap from "../../components/SystemMap";
import GeoArt from "../../components/GeoArt";
import { COMPANY, INTAKE, OPERATING_LOOP, PROBLEM, RESPONSE } from "../../lib/company";
import "../home.css";

export const metadata: Metadata = {
  title: { absolute: "APT-LABS — Locally owned institutional infrastructure systems." },
  description: COMPANY.oneSentence,
};

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-system-strip">
        <div className="landing-frame landing-strip-inner">
          <span className="landing-status"><i aria-hidden="true" /> ONE COMPANY · FOUR FACES</span>
          <span>APT-LABS <b>/</b> INFRASTRUCTURE SYSTEMS</span>
          <span>OFFLINE-FIRST · LOCALLY OWNED · REPRODUCIBLE</span>
        </div>
      </div>
      <section className="landing-hero" aria-labelledby="landing-title">
        <GeoArt variant="cells" className="landing-hero-art" />
        <div className="landing-frame landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="lp-label">APT-LABS / {COMPANY.geography.text} / INSTITUTIONAL INFRASTRUCTURE</p>
            <h1 id="landing-title" className="page-title">Infrastructure that institutions can run, repair and reproduce locally.</h1>
            <p className="landing-lead">{RESPONSE}</p>
            <p className="landing-supporting">Software, hardware, creative-computing capacity and the documentation needed to operate, repair and improve institutional systems locally.</p>
            <div className="landing-actions">
              <Link href="/console" className="landing-button landing-button-primary">Open the local console</Link>
              <Link href="/evidence" className="landing-button">Read the evidence record</Link>
            </div>
            <a href="#architecture" className="landing-tertiary-link">View the architecture <span aria-hidden="true">↓</span></a>
            <p className="landing-hero-note">Current public record: local prototype. No verified school deployment is claimed.</p>
          </div>
          <DeployPreview />
        </div>
      </section>

      <section className="landing-problem" aria-labelledby="problem-title">
        <div className="landing-frame landing-problem-grid">
          <div>
            <p className="lp-label">The problem</p>
            <h2 id="problem-title">{PROBLEM}</h2>
          </div>
          <div className="landing-response">
            <span className="lp-label">The APT-LABS response</span>
            <p>{COMPANY.oneSentence}</p>
          </div>
        </div>
      </section>

      <section id="architecture" className="landing-architecture" aria-label="APT-LABS system architecture">
        <div className="landing-frame">
          <SystemMap />
          <p className="landing-architecture-note"><strong>Intake layer</strong> · {INTAKE.name} is where capability enters before it can move into APT Fab or APT Studio and be recorded in The Roll.</p>
        </div>
      </section>

      <section className="landing-evidence" aria-labelledby="evidence-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="evidence-title" className="lp-label">Evidence before scale</h2>
            <span>State before claim</span>
          </div>
          <div className="evidence-grid">
            <article className="evidence-panel evidence-panel--verified">
              <span>01 / What exists</span>
              <h3>Working software and an evidence model.</h3>
              <p>The local console, SHA-256 record discipline and two empty local-first registers are inspectable in this repository.</p>
              <strong>PROTOTYPE</strong>
            </article>
            <article className="evidence-panel evidence-panel--planned">
              <span>02 / What needs testing</span>
              <h3>A bounded institutional pilot.</h3>
              <p>Cost, performance, adoption, repair and local production must be measured before a replication claim is made.</p>
              <strong>PLANNED</strong>
            </article>
            <article className="evidence-panel evidence-panel--unknown">
              <span>03 / What is unknown</span>
              <h3>Field outcomes and unit economics.</h3>
              <p>No verified school deployment, beneficiary result, revenue figure, partner, procurement record or cost saving is published.</p>
              <strong>UNKNOWN</strong>
            </article>
            <article className="evidence-panel evidence-panel--reproduce">
              <span>04 / What can be reproduced</span>
              <h3>The architecture, not a success story.</h3>
              <p>Another team can inspect the system model and sealing machinery. A physical replication kit is not yet complete.</p>
              <Link href="/evidence">Inspect the record <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-loop" aria-labelledby="loop-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="loop-title" className="lp-label">From prototype to replication</h2>
            <span>Method, not completed result</span>
          </div>
          <ol className="loop-rail">
            {OPERATING_LOOP.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="landing-frame landing-cta-inner">
          <div>
            <p className="lp-label">Start with inspection</p>
            <h2 id="cta-title">See the system before scaling the story.</h2>
            <p>Open the local prototype, read the evidence boundary, or contact APT-LABS about a bounded institutional conversation.</p>
          </div>
          <div className="landing-actions">
            <Link href="/console" className="landing-button landing-button-primary">Open the local console</Link>
            <Link href="/contact" className="landing-button">Start a conversation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
