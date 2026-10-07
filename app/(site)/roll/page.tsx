import { RollPage } from "@/components/site/RollPage";

export const metadata = {
  title: "The Roll — APT-LABS",
  description:
    "Public evidence methodology and actual public records. The Roll is an evidence system, not a decorative dashboard. If no real public records exist, this page renders an honest empty state.",
};

export default function RollRoute() {
  return <RollPage />;
}