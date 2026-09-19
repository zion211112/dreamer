import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description:
    "APT-LABS records the work, the skill, and the trust behind it — for schools, youth, builders, and institutions."
};

const pillars = [
  {
    title: "The Ledger",
    subtitle: "Proof of skill and capability.",
    summary: "A public record of what people can actually do.",
    href: "/ledger",
    tone: "amber"
  },
  {
    title: "The Floor",
    subtitle: "Shared projects and real work.",
    summary: "Builds, crews, and collaboration moving through public momentum.",
    href: "/benben",
    tone: "teal"
  },
  {
    title: "Teachers",
    subtitle: "School operations and classroom signals.",
    summary: "A working layer for leadership, tracking, and institutional action.",
    href: "/console",
    tone: "ivory"
  }
];

const stats = [
  { label: "sealed records", value: "1,419" },
  { label: "active builds", value: "84" },
  { label: "school nodes", value: "12" },
  { label: "verified skills", value: "27" }
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
              We make capability visible.
            </h1>

            <p className="mt-6 max-w-[560px] text-base leading-7 text-muted md:text-lg">
              APT-LABS records the work, the skill, and the trust behind it — for schools, youth, builders, and institutions.
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
                Explore the floor
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-dim">
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">Built for real work</span>
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">Verified by proof</span>
              <span className="rounded-full border border-ivory/10 px-2.5 py-1.5">Local-first</span>
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

            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-ivory/8 bg-void/60 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{stat.label}</div>
                  <div className="mt-2 font-display text-[30px] leading-none text-ivory">{stat.value}</div>
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
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber/80">
                {pillar.subtitle}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{pillar.summary}</p>

              <div className="mt-6 flex items-center justify-between border-t border-ivory/10 pt-4 text-[11px] uppercase tracking-[0.16em] text-ivory/70">
                <span>Step inside</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="border-t border-ivory/10 py-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[620px]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Institutional frame</div>
              <p className="mt-4 text-base leading-7 text-muted md:text-lg">
                We do not ask for pedigree. We ask for proof.
              </p>
              <p className="mt-3 text-base leading-7 text-muted">
                Skill is public. Trust compounds.
              </p>
              <p className="mt-3 text-base leading-7 text-muted">
                The system rewards work, not reputation theatre.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-full border border-ivory/10 bg-ivory/5 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ivory/70">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal" aria-hidden="true" />
              <span>Built for the real work</span>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-4">
          <div className="border-t border-ivory/10 pt-8">
            <p className="font-display text-[28px] leading-tight tracking-[-0.03em] text-ivory md:text-[40px]">
              Where work leaves proof, not just intention.
            </p>
            <div className="mt-5 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-dim md:flex-row md:items-center md:gap-6">
              <span>For schools</span>
              <span>For builders</span>
              <span>For institutions</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

