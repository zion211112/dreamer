import type { Metadata } from "next";
import Link from "next/link";
import "../home.css";

export const metadata: Metadata = {
  title: { absolute: "APT-LABS — The ledger of useful work." },
  description:
    "A public record of work, skill, and trust in Kirinyaga, Kenya. Built for places where the network is a suggestion, not a guarantee.",
  openGraph: {
    title: "APT-LABS — The ledger of useful work.",
    description:
      "A public record of work, skill, and trust. Counts are visible. Identity stays yours.",
    url: "/",
    siteName: "APT-LABS",
    type: "website",
  },
};

const surfaces = [
  {
    number: "01",
    name: "The Roll",
    description: "Names, skills, and sealed proof of work, in one public record.",
    href: "/ledger",
    action: "Read the roll",
  },
  {
    number: "02",
    name: "The Floor",
    description: "Proposals move to proof, in public. Watch the work happen.",
    href: "/benben",
    action: "Enter the floor",
  },
  {
    number: "03",
    name: "The Console",
    description: "A school's day, marked into signals a principal can act on.",
    href: "/console",
    action: "Open the console",
  },
];

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-system-strip" role="status">
        <div className="landing-frame landing-strip-inner">
          <span className="landing-status"><i aria-hidden="true" /> LOCAL-FIRST RECORD</span>
          <span>APT-LABS <b>/</b> KIRINYAGA NODE</span>
          <span>PUBLIC PROOF · PRIVATE IDENTITY</span>
        </div>
      </div>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-frame landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="lp-label">Kirinyaga, Kenya · Public record</p>
            <h1 id="landing-title">The ledger of useful work.</h1>
            <p className="landing-lead">
              We're making a list of everyone in Kirinyaga who can actually do
              things — and the roll is public.
            </p>
            <div className="landing-actions">
              <Link href="/ledger" className="landing-button landing-button-primary">
                Open the ledger
              </Link>
              <Link href="/benben" className="landing-button">
                Enter the floor
              </Link>
            </div>
          </div>

          <aside className="landing-roll" aria-label="Record protocol">
            <div className="landing-panel-head">
              <p className="lp-label">Record protocol</p>
              <span className="landing-panel-code">OPEN</span>
            </div>
            <dl className="protocol-list">
              <div><dt>Source</dt><dd>people who do the work</dd></div>
              <div><dt>State</dt><dd>derived from proof</dd></div>
              <div><dt>Identity</dt><dd>kept private</dd></div>
              <div><dt>Region</dt><dd>Kirinyaga, Kenya</dd></div>
            </dl>
            <p className="roll-total">No imaginary money · no vanity metrics</p>
          </aside>
        </div>
      </section>

      <section className="landing-surfaces" aria-labelledby="surfaces-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="surfaces-title" className="lp-label">Three working surfaces</h2>
          </div>

          <ol className="surface-rows">
            {surfaces.map((surface) => (
              <li key={surface.number} className="surface-row">
                <span className="surface-number" aria-hidden="true">
                  {surface.number}
                </span>
                <div className="surface-text">
                  <h3>{surface.name}</h3>
                  <p>{surface.description}</p>
                </div>
                <Link href={surface.href} className="surface-link">
                  {surface.action}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="landing-frame landing-rule-line">
        <span className="lp-label">The operating rule</span>
        <span className="rule-text">Work first. Proof follows.</span>
        <span className="rule-sub">Counts visible · identity yours</span>
      </div>
    </main>
  );
}
