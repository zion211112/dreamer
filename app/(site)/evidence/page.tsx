import Link from "next/link";
import { COMPANY } from "../../../lib/company";
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
        <EvidenceList items={[
          { label: "Sealing and rolling hashes", value: "SHA-256 canonical records and master seals", state: "VERIFIED" },
          { label: "APT Deploy", value: "Nine modules and ten tools in a local prototype", state: "PROTOTYPE" },
          { label: "APT Fab", value: "Architecture defined; no fabrication record", state: "PLANNED" },
          { label: "APT Studio", value: "Architecture defined; no installation record", state: "PLANNED" },
          { label: "The Roll", value: "People and asset registers using the same trust model", state: "PROTOTYPE" },
        ]} />
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
