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
      <div className="rounded-[21px] border border-ivory/10 bg-panel p-[21px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber/90 ring-1 ring-inset ring-amber/25">
          <span className="h-1.5 w-1.5 rounded-full bg-amber/80" aria-hidden="true" />
          Waiting
        </span>
        <p className="mt-4 text-sm leading-6 text-muted">
          My Day reads the console session on this device.{" "}
          <Link href="/console" className="text-amber hover:underline">
            Sign in to the console
          </Link>{" "}
          and come back.
        </p>
      </div>
    );
  }

  return <MyDay session={session} section="day" />;
}
