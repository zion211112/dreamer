import Link from "next/link";
import { faceMetadata } from "../../../lib/metadata";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "About",
  description:
    "APT-LABS builds institutional infrastructure around a simple principle: technology is more durable when the people who depend on it can understand, maintain and reproduce it.",
  path: "/about",
});

const FOCUS = [
  {
    title: "Physical infrastructure",
    copy: "Fabrication, repairability and local technical production.",
  },
  {
    title: "Creative infrastructure",
    copy: "Computing capacity and digital production environments.",
  },
  {
    title: "Evidence infrastructure",
    copy: "Documentation, provenance, cost records and replication.",
  },
];

const METHOD = ["Build", "Measure", "Document", "Repeat"];

export default function AboutPage() {
  return (
    <main className="site-page identity-page">
      <div className="site-frame">
        <p className="site-kicker">About · APT-LABS</p>
        <h1 className="page-title">APT-LABS</h1>
        <p className="identity-lead">Build locally. Keep capability local.</p>
        <p className="identity-description">
          APT-LABS builds institutional infrastructure around a simple
          principle: technology is more durable when the people who depend on
          it can understand, maintain and reproduce it.
        </p>
      </div>

      <div className="site-frame identity-sections">
        <section className="identity-section" aria-label="What we work on">
          <div className="site-section-head">
            <span>What we work on</span>
            <span>three pillars</span>
          </div>
          <ul className="identity-list">
            {FOCUS.map((item) => (
              <li key={item.title}>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{item.title}</strong>
                  <br />
                  {item.copy}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="identity-section" aria-label="How we work">
          <div className="site-section-head">
            <span>How we work</span>
            <span>the loop</span>
          </div>
          <div className="identity-flow" role="list">
            {METHOD.map((step, i) => (
              <div key={step} role="listitem">
                <span>0{i + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="identity-section" aria-label="Current stage">
          <div className="site-section-head">
            <span>Current stage</span>
            <span>stated plainly</span>
          </div>
          <p className="identity-section-body">
            Prototype / development stage. Products mature on the BenBen Builds
            track; the company site claims only what the evidence record can
            stand behind.
          </p>
          <div className="identity-actions">
            <Link className="site-action" href="/work">
              See the work <span aria-hidden="true">→</span>
            </Link>
            <Link className="site-action-secondary" href="/contact">
              Work with APT-LABS
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
