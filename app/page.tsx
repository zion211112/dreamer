import type { Metadata } from "next";
import Link from "next/link";
import "./home.css";

export const metadata: Metadata = {
  title: "APT-LABS — The ledger of useful work.",
  description:
    "A public record of work, skill, and trust. Built for places where the network is a suggestion, not a guarantee.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <p className="hero-kicker label">
            Kirinyaga, Kenya · Public record
          </p>

          <h1
            id="hero-title"
            className="hero-title"
          >
            The ledger of useful work.
          </h1>

          <p className="hero-lead">
            A living record of people, skills, and commitments.
            Open to the people who make the place work.
            Built for places where the network is a suggestion, not a guarantee.
          </p>

          <div className="hero-actions">
            <Link href="/ledger" className="btn btn-primary">
              Open the ledger
            </Link>
            <Link href="/benben" className="btn btn-secondary">
              See the floor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three surfaces ── */}
      <section className="surfaces page-section" aria-labelledby="surfaces-title">
        <div className="surfaces-inner">
          <h2
            id="surfaces-title"
            className="label label-signal"
          >
            Three working surfaces
          </h2>

          <ol className="surfaces-list">
            <li className="surface-card">
              <span className="surface-number label" aria-hidden="true">01</span>
              <div className="surface-body">
                <h3 className="surface-title">The Roll</h3>
                <p className="surface-desc">
                  Names, proof, and the shared record. Everyone who can do something
                  is on the roll — verified by work, not by paperwork.
                </p>
                <Link href="/ledger" className="surface-link">
                  Read the roll
                </Link>
              </div>
            </li>

            <li className="surface-card">
              <span className="surface-number label" aria-hidden="true">02</span>
              <div className="surface-body">
                <h3 className="surface-title">The Floor</h3>
                <p className="surface-desc">
                  Projects move from proposal to proof. Anyone posts a build.
                  The floor votes. A crew forms. The work is proved.
                </p>
                <Link href="/benben" className="surface-link">
                  Enter the floor
                </Link>
              </div>
            </li>

            <li className="surface-card">
              <span className="surface-number label" aria-hidden="true">03</span>
              <div className="surface-body">
                <h3 className="surface-title">The Console</h3>
                <p className="surface-desc">
                  Schools turn daily work into signals. One timeline, three actions
                  per lesson, one alert block. The day is declared — never invented.
                </p>
                <Link href="/console" className="surface-link">
                  Open the console
                </Link>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── Credibility strip ── */}
      <section className="cred-strip" aria-label="Current record">
        <div className="cred-inner">
          <dl className="cred-list">
            <div className="cred-row">
              <dt>
                <span className="label">People on the roll</span>
              </dt>
              <dd className="cred-value">342</dd>
            </div>
            <div className="cred-row">
              <dt>
                <span className="label">Active builds</span>
              </dt>
              <dd className="cred-value">18</dd>
            </div>
            <div className="cred-row">
              <dt>
                <span className="label">Sealed records</span>
              </dt>
              <dd className="cred-value">1,247</dd>
            </div>
            <div className="cred-row">
              <dt>
                <span className="label">Schools connected</span>
              </dt>
              <dd className="cred-value">3</dd>
            </div>
          </dl>

          <p className="cred-footer">
            <span className="label">Ledger version</span>
            <span className="cred-version">v2.342</span>
            <span className="cred-rule" aria-hidden="true" />
            <span className="label">Updated</span>
            <time className="cred-time" dateTime="2026-02-23T12:00:00Z">
              February 23, 2026 · 12:00 EAT
            </time>
          </p>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="principles page-section" aria-labelledby="principles-title">
        <div className="principles-inner">
          <h2
            id="principles-title"
            className="label label-signal"
          >
            How this is built
          </h2>

          <div className="principles-grid">
            <article className="principle">
              <h3 className="principle-title">Local first</h3>
              <p className="principle-body">
                The ledger lives in your browser. When the network drops — and it will —
                the record stays. Sync is honest: online, offline, or queued.
              </p>
            </article>

            <article className="principle">
              <h3 className="principle-title">Signals, not state</h3>
              <p className="principle-body">
                Votes, claims, and attestations are appended — never overwritten.
                The state is derived, not stored. The record is a log.
              </p>
            </article>

            <article className="principle">
              <h3 className="principle-title">Counts, not noise</h3>
              <p className="principle-body">
                The floor shows how many hands have raised — not what percentage.
                A count cannot be moved by not showing up.
              </p>
            </article>

            <article className="principle">
              <h3 className="principle-title">Enforced separation</h3>
              <p className="principle-body">
                The hand that built does not close the door. Attestation comes from a
                hand that did not build. Separation is not a trust exercise — it is a rule.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta page-section" aria-labelledby="cta-title">
        <div className="cta-inner">
          <h2 id="cta-title" className="cta-title">
            The roll is open.
          </h2>
          <p className="cta-body">
            Anyone can post a build. Anyone can verify a credential. Anyone can join the roll —
            a name, a skill, and a line of proof.
          </p>
          <div className="cta-actions">
            <Link href="/ledger" className="btn btn-primary">
              Open the ledger
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Write to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
