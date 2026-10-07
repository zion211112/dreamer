"use client";

import Link from "next/link";
import { StateTag } from "@/components/site/StateTag";
import { COMPANY, STACK } from "@/lib/system";

export function HomeHero() {
  const prototypeCount = STACK.filter((layer) => layer.state === "PROTOTYPE").length;
  const plannedCount = STACK.filter((layer) => layer.state === "PLANNED").length;

  return (
    <section className="home-hero" aria-labelledby="hero-heading">
      {/* PROBLEM */}
      <header className="home-hero-problem">
        <h1 id="hero-heading" className="hero-headline">
          {COMPANY.primary}
        </h1>
        <p className="hero-subtext">
          {COMPANY.supporting}
        </p>
      </header>

      {/* CAPABILITY */}
      <div className="home-hero-capability">
        <h2 className="hero-section-title">How we work</h2>
        <ol className="hero-method">
          <li><strong>DISCOVER</strong> — the operational problem</li>
          <li><strong>DIAGNOSE</strong> — what the institution actually needs</li>
          <li><strong>PROVE</strong> — build it locally, show it works</li>
          <li><strong>RECORD</strong> — the evidence register stays with you</li>
          <li><strong>REPEAT</strong> — the next problem, same method</li>
        </ol>
      </div>

      {/* PROOF */}
      <div className="home-hero-proof">
        <h2 className="hero-section-title">What is real today</h2>
        <div className="hero-proof-grid">
          <article className="hero-proof-item">
            <h3>School Console</h3>
            <p>Management system prototype running on invented data.</p>
            <div className="hero-proof-state">
              <StateTag state="PROTOTYPE" />
              <span>Built, openable, inspectable — not deployed</span>
            </div>
          </article>
          <article className="hero-proof-item">
            <h3>Infrastructure Stack</h3>
            <p>Five layers designed: Record, Identity, Build, Infrastructure, Allocation.</p>
            <div className="hero-proof-state">
              <StateTag state="PLANNED" />
              <span>1 PROTOTYPE layer / 4 PLANNED layers</span>
            </div>
          </article>
          <article className="hero-proof-item">
            <h3>Build Tracks</h3>
            <p>APT Fab, APT Studio, Commissioned MVP, Build Studio — all planned.</p>
            <div className="hero-proof-state">
              <StateTag state="PLANNED" />
              <span>Designed, not built</span>
            </div>
          </article>
        </div>
      </div>

      {/* CTA */}
      <div className="home-hero-cta">
        <Link href="/contact" className="hero-cta-primary">
          Start a conversation
          <span aria-hidden="true">→</span>
        </Link>
        <p className="hero-cta-note">
          Demo access · Pilot enquiry · Investor diligence
        </p>
      </div>
    </section>
  );
}