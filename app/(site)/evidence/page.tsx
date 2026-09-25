import Link from "next/link";
import { COMPANY, EVIDENCE_SNAPSHOT } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { EvidenceList, PageShell, Section, StatusTag } from "../../../components/IdentityPage";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "Evidence and replication",
  description: "The APT-LABS evidence record: current technical artefacts, explicit unknowns, verification states and the path to institutional reproduction.",
  path: "/evidence",
});

export default function EvidencePage() {
  return (
    <PageShell
      eyebrow="Evidence · APT-LABS"
      title="Evidence before scale."
      description="Another institution should be able to understand what was built, what it cost, why it worked or failed, and what would be required to reproduce it. Anything not yet documented remains visibly unknown."
    >
      <Section label="Evidence record" title="What exists in this repository">
        <EvidenceList items={EVIDENCE_SNAPSHOT} />
      </Section>

      <Section label="Evidence posture" title="Current, being tested, unknown">
        <div className="evidence-posture" role="list" aria-label="Evidence posture">
          <div className="evidence-posture-row" role="listitem" data-state="verified">
            <span>01</span>
            <strong>What exists</strong>
            <p>Code-native Deploy preview, SHA-256 sealing, local-first records and two register interfaces.</p>
            <b>VERIFIED / PROTOTYPE</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="planned">
            <span>02</span>
            <strong>What is being tested</strong>
            <p>A bounded institutional pilot across cost, performance, adoption, repair and local production.</p>
            <b>PLANNED</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="unknown">
            <span>03</span>
            <strong>What remains unknown</strong>
            <p>Field outcomes, unit economics, procurement, physical assets, partners and measured impact.</p>
            <b>UNKNOWN</b>
          </div>
          <div className="evidence-posture-row" role="listitem" data-state="reproduce">
            <span>04</span>
            <strong>What can be reproduced</strong>
            <p>The architecture and evidence model today; a complete hardware replication kit is not yet published.</p>
            <b>PROTOTYPE / PLANNED</b>
          </div>
        </div>
      </Section>

      <Section label="Method" title="From pilot to replication kit">
        <div className="identity-flow" aria-label="APT-LABS scale loop">
          {[
            ["01", "Bounded pilot"],
            ["02", "Measure cost, performance and adoption"],
            ["03", "Document local production"],
            ["04", "Publish a replication kit"],
          ].map(([number, label]) => (
            <div key={number}><span>{number}</span><strong>{label}</strong></div>
          ))}
        </div>
        <p className="identity-notice">
          The sequence is a method, not a record of completed stages. No pilot, measured
          adoption result, production record or replication kit has been published yet.
        </p>
      </Section>

      <Section label="Registers" title="People and assets">
        <div className="identity-register-links">
          <Link href="/ledger" className="identity-register-link">
            <span><strong>People Register</strong><span className="identity-register-copy">Skill, credential and seal records.</span></span>
            <span><StatusTag state="PROTOTYPE" /></span>
          </Link>
          <Link href="/roll/assets" className="identity-register-link">
            <span><strong>Asset Register</strong><span className="identity-register-copy">The current register is intentionally empty.</span></span>
            <span><StatusTag state="PROTOTYPE" /></span>
          </Link>
        </div>
      </Section>

      <Section label="Documentation" title="What another reviewer can inspect">
        <EvidenceList items={[
          { label: "Source repository", value: COMPANY.repository.value, state: COMPANY.repository.state },
          { label: "Published BOMs", value: "None yet", state: "PLANNED" },
          { label: "Field photographs", value: "None published", state: "UNKNOWN" },
          { label: "Unit economics", value: "Not yet measured", state: "UNKNOWN" },
          { label: "Procurement record", value: "None on record", state: "UNKNOWN" },
          { label: "Repository licence", value: "No licence file found; no open-source status claimed", state: "UNKNOWN" },
        ]} />
        <p>
          The repository can demonstrate the sealing, software and evidence architecture. It
          cannot yet substantiate field deployment, local production volume, cost savings or
          institutional outcomes. Those gaps are part of the current record, not claims to be
          filled with assumptions.
        </p>
      </Section>
    </PageShell>
  );
}
