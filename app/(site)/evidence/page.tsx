import Link from "next/link";
import { faceMetadata } from "../../../lib/metadata";
import { Reveal } from "../../../components/site/Reveal";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "Evidence",
  description:
    "Evidence before claim: what the protocol node can reconstruct today, what is being tested, and what stays unknown — named plainly.",
  path: "/evidence",
});

export default function EvidencePage() {
  return (
    <main className="site-page identity-page">
      <Reveal />
      <div className="site-frame">
        <p className="site-kicker" data-reveal>Evidence · APT-LABS</p>
        <h1 className="page-title" data-reveal data-reveal-delay="1">Evidence before claim.</h1>
        <p className="identity-lead" data-reveal data-reveal-delay="2">
          The node&rsquo;s falsifier: an independent observer should be able to
          reconstruct who was eligible, which rule applied, where resources
          went, what was built, and what evidence supports the outcome. What we
          can stand behind today, what we are testing, and what stays unknown —
          named plainly, without filling gaps with assumptions.
        </p>

        <div className="evidence-posture" role="list" aria-label="Evidence posture">
          <div className="evidence-posture-row" role="listitem" data-state="verified" data-reveal>
            <span>01</span>
            <strong>What exists</strong>
            <p>A local-first protocol node — a device-first control plane connecting contributions, decisions, allocation, execution and evidence.</p>
            <b>PROTOTYPE</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="planned" data-reveal data-reveal-delay="1">
            <span>02</span>
            <strong>What is being tested</strong>
            <p>A bounded pilot: cost, performance, adoption, repair, and whether the node&rsquo;s evidence actually survives handover.</p>
            <b>PLANNED</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="unknown" data-reveal data-reveal-delay="2">
            <span>03</span>
            <strong>What stays unknown</strong>
            <p>Field outcomes, unit economics and measured impact. Unknown until measured — not claimed.</p>
            <b>UNKNOWN</b>
          </div>
        </div>

        <div className="identity-actions" data-reveal data-reveal-delay="3">
          <Link className="site-action" href="/roll">
            Inspect the Roll <span aria-hidden="true">→</span>
          </Link>
          <Link className="site-action-secondary" href="/">
            Open the node
          </Link>
        </div>
      </div>
    </main>
  );
}
