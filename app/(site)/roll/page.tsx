import Link from "next/link";
import { FACES, REGISTERS } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import "../../identity.css";
import "./roll.css";

export const metadata = faceMetadata({
  title: "The Roll",
  description:
    "The record behind the work — what was built, who built it, what was tested. People and assets, separately recorded.",
  path: "/roll",
});

const LIFECYCLE = ["Designed", "Sourced", "Built", "Installed", "Tested", "Documented"];

export default function RollPage() {
  return (
    <main className="site-page identity-page roll-page">
      <div className="site-frame">
        <p className="site-kicker">The Roll · Evidence / provenance</p>
        <h1 className="page-title">The Roll</h1>
        <p className="identity-lead">The record behind the work.</p>
        <p className="identity-description">
          {FACES.roll.description} Most companies say they build innovative
          solutions. Here is the stronger claim: what was built, who built it,
          what it cost, what was tested — each line carrying its state.
        </p>
        <div className="identity-actions">
          <Link className="site-action" href="/evidence">
            Inspect the evidence boundary <span aria-hidden="true">→</span>
          </Link>
          <Link className="site-action-secondary" href="/work">
            See the work
          </Link>
        </div>
      </div>

      <div className="site-frame roll-grid">
        {REGISTERS.map((register) => (
          <section key={register.name} className="roll-register" aria-label={register.name}>
            <div className="site-section-head">
              <span>{register.name}</span>
              <span>Status: {register.status}</span>
            </div>
            <p className="roll-register-copy">{register.summary}</p>
            {register.name === "People Register" ? (
              <ul className="roll-list">
                <li>Makers</li>
                <li>Builders</li>
                <li>Creators</li>
                <li>Contributors</li>
              </ul>
            ) : (
              <ul className="roll-list">
                <li>Designs</li>
                <li>BOMs</li>
                <li>Builds</li>
                <li>Installations</li>
                <li>Repairs</li>
                <li>Tests</li>
                <li>Evidence</li>
              </ul>
            )}
            <p className="identity-provenance">
              <strong>{register.status}</strong> — presented here as record
              structure. No shared server-backed register is published; runtime
              counts are readings from this device, never reach.
            </p>
          </section>
        ))}
      </div>

      <div className="site-frame">
        <section className="roll-lifecycle" aria-label="Asset lifecycle">
          <div className="site-section-head">
            <span>Asset lifecycle</span>
            <span>only actual states shown</span>
          </div>
          <ol className="roll-chain">
            {LIFECYCLE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <div className="identity-notice" role="note">
          A hash detects changes to a record; it does not manufacture truth or
          shared storage. The registers start empty — an asset without evidence
          is marked accordingly or omitted. See{" "}
          <Link href="/evidence">the evidence boundary</Link>.
        </div>
      </div>
    </main>
  );
}
