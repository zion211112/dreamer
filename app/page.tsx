import type { Metadata } from "next";
import Link from "next/link";
import "./home.css";

export const metadata: Metadata = {
  title: "APT-LABS — The ledger of useful work.",
  description:
    "A public record of work, skill, and trust. Built for places where the network is a suggestion, not a guarantee."
};

const surfaces = [
  {
    number: "01",
    name: "The Roll",
    description: "People, skills, and proof in one public record.",
    href: "/ledger",
    action: "Read the roll"
  },
  {
    number: "02",
    name: "The Floor",
    description: "Projects move from proposal to proof, in public.",
    href: "/benben",
    action: "Enter the floor"
  },
  {
    number: "03",
    name: "The Console",
    description: "Schools turn the work of a day into useful signals.",
    href: "/console",
    action: "Open the console"
  }
];

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-frame landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Kirinyaga, Kenya · public record</p>
            <h1 id="landing-title">The ledger of useful work.</h1>
            <p className="landing-lead">
              A living record of people, skills, and commitments, open to the people who make the place work.
            </p>
            <div className="landing-actions">
              <Link href="/ledger" className="landing-button landing-button-primary">
                Open the ledger
              </Link>
              <Link href="/benben" className="landing-button landing-button-secondary">
                Enter the floor
              </Link>
            </div>
          </div>

          <p className="landing-index-note">
            <span className="landing-note-rule" aria-hidden="true" />
            Built for places where the network is a suggestion, not a guarantee.
          </p>
        </div>
      </section>

      <section className="landing-surfaces" aria-labelledby="surfaces-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="surfaces-title">Three working surfaces</h2>
            <span>Choose where the work begins</span>
          </div>

          <ol className="landing-surface-grid">
            {surfaces.map((surface) => (
              <li key={surface.number} className="landing-surface">
                <span className="landing-surface-number" aria-hidden="true">{surface.number}</span>
                <div className="landing-surface-body">
                  <h3>{surface.name}</h3>
                  <p>{surface.description}</p>
                  <Link href={surface.href} className="landing-surface-link">
                    {surface.action}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-record" aria-label="Operating principle">
        <div className="landing-frame landing-record-inner">
          <p className="landing-kicker">The operating rule</p>
          <p className="landing-record-statement">Work first. Proof follows.</p>
          <p className="landing-record-copy">
            Counts are visible. Identity stays yours. The record grows from what people actually do.
          </p>
        </div>
      </section>
    </main>
  );
}
