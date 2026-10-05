"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadConsoleSession, type ConsoleSession as LocalConsoleSession } from "../../lib/console";

/**
 * A local-session UX guard, not an authentication boundary.
 * The console has no server, accounts, credentials, or private server data;
 * it only keeps a device-local session so direct tool URLs return to /console.
 */
export default function ConsoleSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [session, setSession] = useState<LocalConsoleSession | null>(null);

  useEffect(() => {
    const stored = loadConsoleSession();
    if (stored) {
      setSession(stored);
      setOk(true);
    }
    else router.replace("/console");
  }, [router]);

  if (!ok) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-void">
        <span className="font-mono text-label uppercase tracking-caps text-ash">Opening local prototype…</span>
      </div>
    );
  }
  return (
    <>
      {session ? (
        <div className="console-session-profile">
          <span className="console-session-avatar" aria-hidden="true">{session.name.slice(0, 1).toUpperCase()}</span>
          <div className="console-session-person"><span>LOCAL PROFILE / THIS DEVICE</span><strong>{session.name}</strong></div>
          <span className="console-session-school">{session.role} / {session.school}</span>
          <Link href="/contact">Contact APT-LABS <span aria-hidden="true">↗</span></Link>
        </div>
      ) : null}
      {children}
    </>
  );
}
