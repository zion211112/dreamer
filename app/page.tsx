import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description:
    "The open skills ledger for Kirinyaga: a place where capability is visible, work is credited, and schools can run on trust."
};

const pillars = [
  {
    title: "The Ledger",
    summary: "A living record of skill, work, and proof.",
    href: "/ledger",
    tone: "amber"
  },
  {
    title: "The Floor",
    summary: "Projects, builds, and local momentum made visible.",
    href: "/benben",
    tone: "teal"
  },
  {
    title: "Teachers",
    summary: "The classroom command layer for school leadership.",
    href: "/console",
    tone: "ivory"
  }
];

const stats = [
  { label: "sealed", value: "1,419" },
  { label: "active builds", value: "84" },
  { label: "school nodes", value: "12" }
];

export default function HomePage() {
  return (
    <main className="theme-portal bg-obsidian relative overflow-hidden">
      <GeoArt
        variant="ring"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.08] text-ivory"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 md:px-8">
        <header className="flex items-center justify-between border-b border-ivory/10 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-amber/40 bg-amber/10 text-[11px] font-bold text-amber">
              A
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ivory/70">APT-LABS</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Kirinyaga, Kenya</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-[12px] font-medium text-ivory/60 md:flex">
            <Link href="/ledger" className="transition-colors hover:text-ivory">Ledger</Link>
            <Link href="/benben" className="transition-colors hover:text-ivory">Floor</Link>
            <Link href="/console" className="transition-colors hover:text-ivory">Teachers</Link>
            <Link href="/contact" className="transition-colors hover:text-ivory">Contact</Link>
          </nav>
        </header>

        <section className="grid flex-1 items-end gap-10 pb-12 pt-10 md:gap-14 md:pb-16 md:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
          <div>
            <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-amber">
              capability, visible
            </div>

            <h1 className="max-w-[680px] font-display text-[42px] leading-[0.96] tracking-[-0.04em] text-ivory md:text-[64px] lg:text-[78px]">
              We make the work visible before the excuses do.
            </h1>

            <p className="mt-6 max-w-[540px] text-base leading-7 text-muted md:text-lg">
              APT-LABS is a local-first skills ledger for schools, youth, and builders: proof of skill, public momentum, and a trusted operating layer for real institutions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ledger"
                className="inline-flex items-center justify-center rounded-full border border-amber/50 bg-amber px-5 py-3 text-sm font-semibold text-obsidian transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber/90"
              >
                Open the ledger
              </Link>
              <Link
                href="/benben"
                className="inline-flex items-center justify-center rounded-full border border-ivory/15 bg-ivory/5 px-5 py-3 text-sm font-semibold text-ivory transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/50 hover:bg-teal/10"
              >
                Enter the floor
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">Local-first</span>
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">No gatekeeping</span>
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">Built for schools</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-ivory/10 bg-[rgba(245,240,230,0.02)] p-4 shadow-[0_30px_80px_-50px_rgba(212,175,55,0.4)] backdrop-blur-sm md:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-ivory/10 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Live signal</span>
              <span className="inline-flex items-center gap-2 text-[11px] text-amber">
                <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
                online
              </span>
            </div>

            <div className="space-y-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-ivory/8 bg-void/60 px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{stat.label}</span>
                  <span className="font-display text-[28px] leading-none text-ivory">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-teal/20 bg-teal/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">Current block</div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-display text-[30px] text-ivory">0008</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Polygon PoS</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group rounded-[24px] border border-ivory/10 bg-[rgba(245,240,230,0.02)] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ivory/20 hover:bg-[rgba(245,240,230,0.04)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                  pillar.tone === "amber" ? "bg-amber" : pillar.tone === "teal" ? "bg-teal" : "bg-ivory"
                }`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Open</span>
              </div>

              <h2 className="font-display text-[30px] leading-tight tracking-[-0.03em] text-ivory">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{pillar.summary}</p>

              <div className="mt-6 flex items-center justify-between border-t border-ivory/10 pt-4 text-[11px] uppercase tracking-[0.16em] text-ivory/70">
                <span>Step inside</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-6 border-t border-ivory/10 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Institutional frame</div>
            <p className="mt-3 max-w-[540px] text-base leading-7 text-muted">
              A place where skills are not hidden behind CVs, promises, or gatekeepers. A place where capability earns visibility and trust compounds over time.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-full border border-ivory/10 bg-ivory/5 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ivory/70">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal" aria-hidden="true" />
            <span>Built for the real work</span>
          </div>
        </section>
      </div>
    </main>
  );
}

