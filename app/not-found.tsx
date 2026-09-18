"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../components/GeoArt";

// A 404 can be hit by anyone, paid or not, so this is a client component that
// reads the paywall flag and only surfaces the ledger entry point ("Open the
// roll") to visitors who have actually unlocked the app. Unpaid users just get
// a way back to the porch.
export default function NotFound() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(!!window.localStorage.getItem("apt_pilot_access"));
    } catch {
      /* memory */
    }
  }, []);

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative flex min-h-[60vh] items-center overflow-hidden">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-ivory opacity-[0.05]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-6 py-20 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-muted uppercase">404 · Not on the list</p>
          <h1 className="mt-8 font-display text-5xl md:text-6xl tracking-tight">No such page.</h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-sm leading-6 text-muted">
            The roll has no entry for that address. It will, when someone claims it.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold">
              Back to the porch →
            </Link>
            {unlocked && (
              <Link href="/ledger" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-gold">
                Open the roll
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
