"use client";

import Link from "next/link";
import { useState } from "react";
import DoorsModal from "../components/DoorsModal";
import GeoArt from "../components/GeoArt";
import JoinLink from "../components/JoinLink";

// Landing: fool-plain on obsidian. Two entries: build, join.

export default function Home() {
  const [doors, setDoors] = useState(false);

  return (
    <main className="bg-obsidian text-ivory">
      {/* LEDGER LINE — landing only */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-2 text-center font-mono text-[11px] tracking-[0.2em] text-muted">
          LEDGER 1.001 · KENYA
        </div>
      </div>

      {/* 1 — HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <GeoArt variant="ring" className="spin-slow pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] text-ivory opacity-[0.08]" />
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.04]" />
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 grid md:grid-cols-[1.618fr_1fr] gap-10 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.0]">
              We&apos;re making a list.
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed max-w-xl">
              Of everyone in Kirinyaga who can actually do things.
              That&apos;s the whole company.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setDoors(true)} className="rounded-full bg-ivory px-7 py-3.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">
                BUILD CAPACITY
              </button>
              <JoinLink className="rounded-full bg-river px-7 py-3.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">
                JOIN THE LEDGER
              </JoinLink>
            </div>
            <p className="mt-4 text-sm text-muted">1 on the list. You&apos;re next.</p>
          </div>

          {/* SNAPSHOT */}
          <div className="relative rounded-3xl border border-white/15 bg-panel p-6 overflow-hidden">
            <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 text-ivory opacity-[0.07]" />
            <div className="relative">
              <div className="text-xs font-bold tracking-widest text-muted">LEDGER SNAPSHOT · LIVE</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">1 school</span>
                  <span className="text-[13px] text-muted">Kagio Secondary</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">1 student</span>
                  <span className="text-[13px] text-muted">@Shemsu_Node</span>
                </div>
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold">KES 50</span>
                    <span className="text-[13px] text-muted">one seal · certificate</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="bar-fill h-full rounded-full bg-river" style={{ width: "100%" }} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold truncate">1 post on the floor</span>
                  <span className="shrink-0 text-[11px] font-mono text-emerald-400">CURRENT BUILD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — WHO IT'S FOR, distilled */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-14 md:py-20 space-y-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">JOIN</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">Build capacity → Four doors. Who are you?</p>
            <Link href="/ledger#join" className="mt-3 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">join now →</Link>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">YOUTH</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">Join the ledger → Claim, test, seal. Then work.</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">EVERYONE</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">See the floor → Builds, votes, forks.</p>
          </div>
        </div>
      </section>

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}