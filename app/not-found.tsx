"use client";

import Link from "next/link";
import GeoArt from "../components/GeoArt";

// A 404 is just a missing page. No gate decides who gets in here.
export default function NotFound() {
  return (
    <main className="bg-void text-ink">
      <div className="relative flex min-h-[60vh] items-center overflow-hidden">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-ink opacity-[0.05]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-6 py-20 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-dust uppercase">404 · Not on the list</p>
          <h1 className="mt-8 font-serif text-5xl md:text-6xl tracking-tight">No such page.</h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-sm leading-6 text-dust">
            The roll has no entry for that address. It will, when someone claims it.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded bg-signal px-6 py-3 text-sm font-semibold text-void transition hover:bg-signal-dim">
              Back to the porch →
            </Link>
            <Link href="/ledger" className="rounded border border-rule px-6 py-3 text-sm font-semibold transition hover:border-signal-dim hover:text-signal">
              Open the roll
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

