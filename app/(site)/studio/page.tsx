import { FACES } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { FacePage } from "../../../components/FacePage";
import "../../identity.css";

export const metadata = faceMetadata({
  title: FACES.studio.name,
  description: "APT Studio is APT-LABS' planned local creative-computing infrastructure for animation, digital production and technical skills development.",
  path: "/studio",
});

export default function StudioPage() {
  return (
    <FacePage
      face={FACES.studio}
      lead="Productive creative-computing capacity located with the people who use, maintain and improve it."
      sections={[
        {
          title: "The Studio module",
          body: "APT Studio brings together local rendering, animation, digital production, AI-assisted workflows where appropriate, and the technical skills needed to keep the infrastructure productive.",
        },
        {
          title: "Mwea Animation Box",
          body: "The Mwea Animation Box is positioned as a planned demonstration node inside APT Studio. It is not presented as an existing independent venture, operating facility or completed production unit.",
        },
        {
          title: "Productive infrastructure",
          body: "The intended unit is more than a workstation: it is equipment, maintainable power, local media workflows, technical training and a record of what the system can actually produce.",
        },
        {
          title: "Evidence status",
          body: "APT Studio is planned. No jobs, revenue, render counts, production volumes, installed equipment or completed training are claimed.",
        },
      ]}
    />
  );
}
