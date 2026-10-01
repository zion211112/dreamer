import Link from "next/link";
import { faceMetadata } from "../../../lib/metadata";
import { Reveal } from "../../../components/site/Reveal";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "Evidence",
  description:
    "Evidence before claim: what exists today, what is being tested, and what stays unknown — named plainly.",
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
          We only say what we can stand behind. What exists, what is being tested,
          and what stays unknown — named plainly, without filling gaps with
          assumptions.
        </p>

        <div className="evidence-posture" role="list" aria-label="Evidence posture">
          <div className="evidence-posture-row" role="listitem" data-state="verified" data-reveal>
            <span>01</span>
            <strong>What exists</strong>
            <p>A working local prototype: a device-first surface and the way records are sealed on the device.</p>
            <b>PROTOTYPE</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="planned" data-reveal data-reveal-delay="1">
            <span>02</span>
            <strong>What is being tested</strong>
            <p>A bounded pilot across cost, performance, adoption, repair and local production.</p>
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
          <Link className="site-action-secondary" href="/work">
            See the work
          </Link>
        </div>
      </div>
    </main>
  );
}
