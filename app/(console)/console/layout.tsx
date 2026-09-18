import RunPilotGate from "../../../components/RunPilotGate";

// Every console route (/console, /console/[id], ...) sits behind the RUNPILOT
// name lock. No path reaches the console without it.
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <RunPilotGate>{children}</RunPilotGate>;
}
