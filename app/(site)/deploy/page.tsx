import { CONSOLE_MODULES, CONSOLE_TOOLS } from "../../../lib/console";
import { FACES } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { FacePage } from "../../../components/FacePage";
import "../../identity.css";

export const metadata = faceMetadata({
  title: FACES.deploy.name,
  description: "A public overview of APT Deploy, APT-LABS' offline-capable institutional software prototype for records, assessment and operations.",
  path: "/deploy",
});

export default function DeployPage() {
  return (
    <FacePage
      face={FACES.deploy}
      lead="Institutional software that can run on institution-owned devices without depending on a constant network or recurring subscription."
      primaryAction={{ href: "/console", label: "Open the local console" }}
      sections={[
        {
          title: "What exists today",
          body: `The working prototype contains ${CONSOLE_MODULES.length} modules and ${CONSOLE_TOOLS.length} tools covering the administrative week: planning, marking, attendance, records, reporting, fees, inspection and communication.`,
          items: [
            "Local sessions, favourites and records held on the device",
            "CSV roster import and export, plus a one-file school backup",
            "Content checks for traceability, cognitive demand, hooks, marking keys and budgets",
            "An explicit Online / Offline line and a live count of today’s records",
          ],
        },
        {
          title: "Offline resilience",
          body: "The current build is local-first. Work entered in the console remains in the browser on that device; the site makes no claim of cloud synchronization, institutional authentication or field deployment.",
        },
        {
          title: "Institutional workflows",
          body: "The modules are designed around a school’s working cycle rather than a generic dashboard: build material, mark it, maintain the roster and timetable, then report, reconcile and inspect.",
        },
        {
          title: "Evidence status",
          body: "The software is a local prototype. A verified school deployment is not yet recorded. The console entry screen is explicitly a demonstration door, not an authentication system or a partner credential.",
        },
      ]}
    />
  );
}
