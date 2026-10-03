"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loadConsoleSession } from "../../lib/console";

/**
 * A local-session UX guard, not an authentication boundary.
 * The console has no server, accounts, credentials, or private server data;
 * it only keeps a device-local session so direct tool URLs return to /console.
 */
export default function ConsoleSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const session = loadConsoleSession();
    if (session) setOk(true);
    else router.replace("/console");
  }, [router]);

  if (!ok) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-void">
        <span className="font-mono text-label uppercase tracking-[0.2em] text-ash">Opening local prototype…</span>
      </div>
    );
  }
  return <>{children}</>;
}
