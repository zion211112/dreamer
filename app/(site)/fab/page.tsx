import { FACES } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { FacePage } from "../../../components/FacePage";
import "../../identity.css";

export const metadata = faceMetadata({
  title: FACES.fab.name,
  description: "APT Fab is APT-LABS' planned pathway for documented, repairable institutional hardware designed for local production and maintenance.",
  path: "/fab",
});

export default function FabPage() {
  return (
    <FacePage
      face={FACES.fab}
      lead="Physical infrastructure designed so another local team can understand it, source it, repair it and reproduce it."
      sections={[
        {
          title: "The production record",
          body: "Every proposed asset must move through the same documented chain. A later state is never assumed from an earlier one.",
          items: ["Design", "Bill of materials", "Sourcing", "Fabrication", "Installation", "Repair", "Documentation"],
        },
        {
          title: "Sourcing discipline",
          body: "Local where practical. Import where necessary. Document the difference. The aim is not artificial localism; it is deliberate, visible and maintainable technical capacity.",
        },
        {
          title: "Repair before replacement",
          body: "A useful design exposes its service points, documents common failures and leaves room for local technical work. Replacement is one outcome of maintenance, not the definition of it.",
        },
        {
          title: "Evidence status",
          body: "APT Fab is planned. No fabrication, installation or field-service record is published yet, so no asset has been entered into The Roll as completed.",
        },
      ]}
    />
  );
}
