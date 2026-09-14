import RunPilotGate from "../../../components/RunPilotGate";

// /ledger sits behind the same RUNPILOT name lock as the console.
export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return <RunPilotGate>{children}</RunPilotGate>;
}
