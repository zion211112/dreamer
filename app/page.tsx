import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description:
    "A list of everyone in Kirinyaga who can actually do things. Open, free, and built on this device."
};

export default function HomePage() {
  return (
    <main className="theme-portal bg-obsidian relative overflow-hidden">
      <GeoArt
        variant="ring"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.06] text-ivory"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col items-center justify-center px-6 pb-12 pt-12 text-center">
        <div className="mb-6 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
          <span className="h-px w-8 bg-ivory/15" />
          Kirinyaga, Kenya
          <span className="h-px w-8 bg-ivory/15" />
        </div>

        <h1 className="font-display text-4xl tracking-[-0.05em] text-ivory md:text-6xl">
          The ledger
        </h1>

        <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-muted">
          A list of everyone in Kirinyaga who can actually do things. Open, free, and built on this device.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/ledger"
            className="rounded-full border border-amber/50 bg-amber px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-amber/90"
          >
            Open the ledger
          </Link>
          <Link
            href="/benben"
            className="rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-amber/60 hover:text-amber"
          >
            Open the floor
          </Link>
          <Link
            href="/console"
            className="rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-amber/60 hover:text-amber"
          >
            Teachers
          </Link>
        </div>
      </div>
    </main>
  );
}

