"use client";

import Link from "next/link";
import { useState } from "react";
import MyDay from "./MyDay";
import { ConsoleSession, loadConsoleSession } from "../../lib/console";

// Mounts My Day in the classic console tool slots (tool 17). The session is
// read from the console's local record; without one, My Day has nothing to
// ground itself to, so we say so instead of pretending.
export default function MyDayWorkspace() {
  const [session] = useState<ConsoleSession | null>(() => loadConsoleSession());

  if (!session) {
    return (
      <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Gate</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          My Day reads the console session on this device.{" "}
          <Link href="/console" className="text-gold hover:underline">
            Sign in to the console
          </Link>{" "}
          and come back.
        </p>
      </div>
    );
  }

  return <MyDay session={session} section="day" />;
}
