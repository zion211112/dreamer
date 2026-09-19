import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

// The portal, as a quiet statement: a doctrine line, two doors, a seal.
// No paywall, no join-flow, no hero grid — every visitor gets the whole
// face on one column. The page owns its chrome (bar up top, seal at the
// bottom) the way /console does, so it renders in the bare root shell.
export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description:
    "Everyone who can actually do things. The open ledger, the floor, and the teachers' console — free, and built on this device."
};

export default function HomePage() {
  return (
    <main className="theme-portal bg-obsidian relative">
      <GeoArt
        variant="ring"
        className="pointer-events-none absolute inset-0 z-0 h-dvh w-full opacity-[0.06] text-ivory"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-[21px] md:px-[34px]">
        {/* 1 · BAR — the wordmark and the place, baseline-locked apart. */}
        <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="text-ivory">APT-LABS</span>
          <span className="text-dim">Kirinyaga, Kenya</span>
        </div>

        {/* 2 · DOCTRINE — one line, said once, in the light serif. */}
        <h1 className="my-[89px] font-display text-[34px] font-light leading-[1.08] tracking-[-0.015em] text-ivory md:my-[144px] md:text-[55px]">
          Everyone who can actually do things.
        </h1>

        {/* 3 · DOORS — the two places, ruled top and bottom, no icons. */}
        <ul>
          {[
            { name: "The Ledger", detail: "proof of skill", href: "/ledger" },
            { name: "The Floor", detail: "harambee!", href: "/benben" }
          ].map((d, i, arr) => (
            <li
              key={d.href}
              className={`border-t border-ivory/10 ${i === arr.length - 1 ? "border-b" : ""}`}
            >
              <Link
                href={d.href}
                className="group flex flex-col gap-2 py-[21px] transition-colors md:grid md:grid-cols-[1fr_auto] md:items-baseline md:gap-[21px] md:py-[34px]"
              >
                <span className="font-display text-[24px] font-normal tracking-[-0.01em] text-ivory transition-colors group-hover:text-amber md:text-[34px]">
                  {d.name}
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.1em] text-dim transition-colors group-hover:text-muted">
                  {d.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 4 · SEAL — the pulse, the count, the chain, and the way in for
            the people who run the school. */}
        <div className="mt-auto flex flex-col items-start gap-[13px] pt-[89px] md:flex-row md:items-center md:justify-between md:pt-[144px]">
          <span className="flex items-center gap-[13px] font-mono text-[11px] tracking-[0.1em] text-dim">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            <span>
              <span className="text-amber">1,419</span> sealed
              <span className="px-2 text-edge">·</span>
              Block <span className="text-amber">0008</span>
              <span className="px-2 text-edge">·</span>
              Polygon PoS
            </span>
          </span>
          <Link
            href="/console"
            className="font-mono text-[11px] tracking-[0.1em] text-dim transition-colors hover:text-amber"
          >
            Teachers →
          </Link>
        </div>
      </div>
    </main>
  );
}

