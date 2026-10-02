import Link from "next/link";
import { faceMetadata } from "../../../lib/metadata";
import { Reveal } from "../../../components/site/Reveal";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "About",
  description:
    "APT-LABS builds a protocol node — local-first civic infrastructure that connects contributions, collective decisions, allocation, physical execution and verifiable evidence. Opt-in, local-first, and built to be audited.",
  path: "/about",
});

/** The five closed-loop stages the node describes, in order. */
const LOOP = [
  { word: "Person", copy: "A person, identified by their own credential." },
  { word: "Contribution", copy: "What that person contributes — work, time, evidence." },
  { word: "Decision", copy: "A collective choice made under an explicit rule." },
  { word: "Allocation", copy: "Resources move where the decision says they should." },
  { word: "Evidence", copy: "What was built is recorded and inspectable." },
];

/** The invariants that make the loop auditable. */
const INVARIANTS = [
  {
    title: "Identity is separated from power.",
    copy: "A credential establishes who you are and what you have demonstrated. It does not, by itself, determine how much influence you carry. Influence is an explicit policy choice, not an inheritance.",
  },
  {
    title: "Resources move by rule, not discretion.",
    copy: "Allocation pools expose their matching source and formula, caps, eligibility, and release conditions. Reconciliation runs between decision and spend.",
  },
  {
    title: "Records survive the people who make them.",
    copy: "An independent observer should be able to reconstruct who was eligible, which rule applied, where resources went, what was built, and what evidence supports the outcome — without asking any of the participants.",
  },
];

export default function AboutPage() {
  return (
    <main className="site-page identity-page">
      <Reveal />
      <div className="site-frame">
        <p className="site-kicker" data-reveal>About · APT-LABS</p>
        <h1 className="page-title" data-reveal data-reveal-delay="1">
          A protocol node, not a platform.
        </h1>
        <p className="identity-lead" data-reveal data-reveal-delay="2">
          APT-LABS builds local-first civic infrastructure — a control plane
          where contributions are counted, collective decisions are made under
          explicit rules, resources are allocated by formula, physical work is
          executed, and evidence is recorded so it can be inspected.
        </p>
        <p className="identity-description" data-reveal data-reveal-delay="3">
          The node is opt-in. It supplements institutions rather than
          supplanting them; whether it interoperates with, or competes against,
          existing ones is a separate empirical and legal question the record
          leaves open.
        </p>
      </div>

      <div className="site-frame identity-sections">
        <section className="identity-section" aria-label="The closed loop" data-reveal>
          <div className="site-section-head">
            <span>The closed loop</span>
            <span>person → evidence</span>
          </div>
          <div className="identity-flow" role="list">
            {LOOP.map((step, i) => (
              <div key={step.word} role="listitem">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{step.word}</strong>
              </div>
            ))}
          </div>
          <p className="identity-section-body">
            Each stage adds a record that the next stage reads. The loop
            closes when evidence for what was built is appended to the roll —
            not when a button is pressed.
          </p>
        </section>

        <section className="identity-section" aria-label="The invariants" data-reveal>
          <div className="site-section-head">
            <span>The invariants</span>
            <span>three, held always</span>
          </div>
          <ul className="identity-list">
            {INVARIANTS.map((item) => (
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

        <section className="identity-section" aria-label="Where it stands today" data-reveal>
          <div className="site-section-head">
            <span>Where it stands today</span>
            <span>stated plainly</span>
          </div>
          <p className="identity-section-body">
            Prototype / development stage. The node, its registers, and the
            execution surfaces are all demonstrable in the browser, locally —
            nothing is seeded, nothing claims deployment. The company site
            states only what the evidence record can stand behind.
          </p>
          <div className="identity-actions">
            <Link className="site-action" href="/">
              Open the node <span aria-hidden="true">→</span>
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
