"use client";

import Link from "next/link";
import GeoArt from "../../components/GeoArt";

// Portal: the indigo→sky gradient landing. No paywall, no paybill, no
// join-flow gate. Every visitor sees the four doors.
export default function HomePage() {
  return (
    <main className="theme-portal bg-obsidian">
      <header className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          <span className="h-px w-6 bg-ivory/20" />
          Kirinyaga, Kenya
          <span className="h-px w-6 bg-ivory/20" />
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight text-ivory">
          The ledger
        </h1>
        <p className="mx-auto mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted">
          A list of everyone in Kirinyaga who can actually do things. Open, free, and
          built on this device.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/ledger" className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-obsidian transition hover:bg-amber">
            Open the ledger
          </Link>
          <Link href="/benben" className="rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-amber">
            Open the floor
          </Link>
          <Link href="/console" className="rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-amber">
            Open the console
          </Link>
        </div>
      </header>
      <GeoArt
        variant="ring"
        className="pointer-events-none absolute inset-0 z-0 h-dvh w-full opacity-[0.06] text-ivory"
        aria-hidden="true"
      />
    </main>
  );
}
