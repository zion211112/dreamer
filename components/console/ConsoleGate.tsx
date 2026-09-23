"use client";

// Client-side gate for the tool routes (/console/[id]). Those pages are
// server components with no session of their own, so without this guard a
// visitor who types a tool URL straight would skip the login door. On mount
// we check the local session against the knock code; anything that is not
// RUNPILOT at PILOTRUN is sent back to the console.
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { gateOpen, loadConsoleSession } from "../../lib/console";

export default function ConsoleGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const s = loadConsoleSession();
    if (s && gateOpen(s.name, s.school)) setOk(true);
    else router.replace("/console");
  }, [router]);

  if (!ok) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-void">
        <span className="font-mono text-label uppercase tracking-[0.2em] text-ash">Opening…</span>
      </div>
    );
  }
  return <>{children}</>;
}