import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description:
    "A public record of work, skill, and trust in Kirinyaga, Kenya."
};

export default function HomePage() {
  return (
    <main className="theme-portal relative overflow-hidden bg-[#101614]">
      <GeoArt
        variant="cells"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.14] text-moss"
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

        <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[#b4bcb4]">
          A public record of work, skill, and trust, rooted in Kirinyaga and open to the people who make it.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/ledger"
            className="min-h-11 rounded-full border border-copper/60 bg-copper px-6 py-3 text-sm font-semibold text-[#101614] transition-colors hover:bg-copper/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-[#101614] active:bg-copper/80"
          >
            Open the ledger
          </Link>
          <Link
            href="/benben"
            className="min-h-11 rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-copper/70 hover:text-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-[#101614] active:border-copper active:text-copper"
          >
            Open the floor
          </Link>
          <Link
            href="/console"
            className="min-h-11 rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-copper/70 hover:text-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-[#101614] active:border-copper active:text-copper"
          >
            Teachers
          </Link>
        </div>
      </div>
    </main>
  );
}

