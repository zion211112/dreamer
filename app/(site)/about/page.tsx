import { COMPANY, FACES, INTAKE } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { EvidenceList, PageShell, RouteLink, Section } from "../../../components/IdentityPage";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "About APT-LABS",
  description: "What APT-LABS is, what exists today, who it serves by design, and which organisational details remain undocumented.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About APT-LABS"
      title="One company. One evidence model."
      description={COMPANY.description}
    >
      <Section label="Organisation" title="Current record">
        <EvidenceList items={[
          { label: "Operating geography", value: COMPANY.geography.text, state: COMPANY.geography.state },
          { label: "Legal registration", value: COMPANY.legalStatus.text, state: COMPANY.legalStatus.state },
          { label: "Founder / team record", value: "Not published", state: "UNKNOWN" },
          { label: "Pilot partner", value: "None documented", state: "UNKNOWN" },
          { label: "Verified school deployment", value: "None on record", state: "UNKNOWN" },
        ]} />
      </Section>

      <Section label="Purpose" title="Who the system is designed for">
        <p>
          APT-LABS is designed for schools, training centres, creative facilities and other
          institutions whose daily work cannot depend on constant connectivity, recurring
          subscriptions or a distant maintenance network. This describes the intended users;
          it is not a beneficiary count or a claim of completed deployment.
        </p>
        <div className="identity-actions">
          <RouteLink href="/deploy">See what exists in APT Deploy</RouteLink>
          <RouteLink href="/evidence">Inspect the evidence record</RouteLink>
        </div>
      </Section>

      <Section label="Architecture" title="Four faces, one operating loop">
        <EvidenceList items={Object.values(FACES).map((face) => ({
          label: face.name,
          value: face.oneLine,
          state: face.status,
        }))} />
        <p className="identity-notice">
          These are four operating faces of one infrastructure system, not four products or
          four companies. {INTAKE.name} is the intake layer: capability enters there, is
          verified, and can move into APT Fab or APT Studio before evidence is recorded in
          The Roll.
        </p>
      </Section>

      <Section label="Sustainability" title="Unknown until measured">
        <p>
          The intended model combines institution-owned software, maintainable equipment,
          local fabrication and documented reproduction. Current pricing, unit economics,
          recurring-cost comparisons, procurement records and deployment revenue are not
          documented, so none is presented as a result.
        </p>
        <EvidenceList items={[
          { label: "Unit economics", value: "Not yet measured", state: "UNKNOWN" },
          { label: "Recorded local procurement", value: "None on record", state: "UNKNOWN" },
          { label: "Recurring-cost comparison", value: "Not yet measured", state: "UNKNOWN" },
        ]} />
      </Section>

      <Section label="Contact" title="Direct project contact">
        <EvidenceList items={[
          { label: "Email", value: COMPANY.contact.email, state: "VERIFIED" },
          { label: "WhatsApp", value: COMPANY.contact.whatsapp, state: "VERIFIED" },
        ]} />
        <div className="identity-actions">
          <RouteLink href="/contact">Open the contact page</RouteLink>
        </div>
      </Section>
    </PageShell>
  );
}
