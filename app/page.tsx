"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DoorsModal from "../components/DoorsModal";
import GeoArt from "../components/GeoArt";
import JoinLink from "../components/JoinLink";
import {
  KEYS,
  Member,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SEED_TASKS,
  TREASURY,
  loadStored
} from "../lib/ledger";

// Landing: fool-plain on obsidian. Two entries: build, join.

export default function Home() {
  const [doors, setDoors] = useState(false);
  const [count, setCount] = useState(SEED_MEMBERS.length);

  useEffect(() => {
    const customs = loadStored<Member>(KEYS.members).filter(
      (m) => !SEED_MEMBERS.some((s) => s.id === m.id)
    );
    setCount(SEED_MEMBERS.length + customs.length);
  }, []);

  const students = SCHOOL_STATS.reduce((n, s) => n + s.students, 0);
  const done = SEED_TASKS.filter((t) => t.status === "done").length;
  const current = SEED_TASKS.find((t) => t.status === "in_progress") || SEED_TASKS[0];

  return (
    <main className="bg-obsidian text-ivory">
      {/* LEDGER LINE — landing only */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-2 text-center font-mono text-[11px] tracking-[0.2em] text-muted">
          LEDGER 1.254 · KENYA
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
            <p className="mt-4 text-sm text-muted">{count} on the list. You&apos;re next.</p>
          </div>

          {/* SNAPSHOT */}
          <div className="relative rounded-3xl border border-white/15 bg-panel p-6 overflow-hidden">
            <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 text-ivory opacity-[0.07]" />
            <div className="relative">
              <div className="text-xs font-bold tracking-widest text-muted">LEDGER SNAPSHOT · LIVE</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">{SCHOOL_STATS.length} schools</span>
                  <span className="text-[13px] text-muted">involved</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">{students.toLocaleString()} students</span>
                  <span className="text-[13px] text-muted">under them</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">{count} individuals</span>
                  <span className="text-[13px] text-muted">on the ledger</span>
                </div>
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold">KES {TREASURY.total.toLocaleString()}</span>
                    <span className="text-[13px] text-muted">{TREASURY.usedPct}% used</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="bar-fill h-full rounded-full bg-river" style={{ width: `${TREASURY.usedPct}%` }} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">{done} completed</span>
                  <span className="text-[13px] text-muted">projects</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold truncate">{current.title}</span>
                  <span className="shrink-0 text-[11px] font-mono text-gold">CURRENT BUILD</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">Schools + treasury demo. Individuals, builds live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — WHO IT'S FOR */}
      <section className="relative overflow-hidden border-b border-white/10">
        <GeoArt variant="band" className="mx-auto mt-10 h-10 max-w-5xl px-6 w-full text-ivory opacity-[0.08]" />
        <div className="relative mx-auto max-w-3xl px-6 py-14 md:py-20">
          <div>
            <p className="text-xs font-bold tracking-widest text-river">1 · FOR THE YOUTH: PROOF, NOT PROMISES</p>
            <ul className="mt-4 space-y-1.5 text-[15px] text-ivory/85">
              <li>· Playground&apos;s free: BenBen, builds, votes with certification.</li>
              <li>· 50 bob seals your name on a certificate. 100 + the test opens one hall.</li>
            </ul>
            <Link href="/ledger#join" className="mt-4 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">join now →</Link>
          </div>

          <div className="mt-12">
            <p className="text-xs font-bold tracking-widest text-river">2 · FOR THE TEACHER: YOUR LIFE BACK</p>
            <p className="mt-4 text-[15px] text-ivory/85 leading-relaxed">
              If you spent last weekend marking two hundred identical scripts wondering why you didn&apos;t become a charcoal burner instead, we see you.
            </p>
            <ul className="mt-4 space-y-1.5 text-[15px] text-ivory/85">
              <li>· Two hundred and fifty bob a month.</li>
              <li>· Link-drop your tests, let the machine auto-marking bleed for you, and map every student&apos;s hidden intellectual weakness before the holiday bell rings.</li>
              <li>· You teach. The code does the suffering.</li>
            </ul>
            <Link href="/build/teacher" className="mt-4 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">open the teacher door →</Link>
          </div>

          <div className="mt-12">
            <p className="text-xs font-bold tracking-widest text-river">3 · FOR THE SCHOOL: ABSOLUTE OPERATIONAL SOVEREIGNTY</p>
            <p className="mt-4 text-[15px] text-ivory/85 leading-relaxed">
              Ministry audits, missing fees, teachers on the verge of mutiny, and a library ledger that looks like a crime scene.
            </p>
            <ul className="mt-4 space-y-1.5 text-[15px] text-ivory/85">
              <li>· Bring your campus. We bring the absolute operational spine.</li>
              <li>· One annual anchor. Instant digital roster control, science-backed retention timetables, automated M-Pesa fee tracking, and one-click inspection modes that make auditors pack up and leave.</li>
            </ul>
            <button onClick={() => setDoors(true)} className="mt-4 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">open your door →</button>
          </div>

          <p className="mt-14 text-center font-display italic text-2xl md:text-3xl">The tower is groundless.<br />The ledger is immutable.</p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">INSTITUTIONS</div>
              <p className="mt-2 text-sm text-muted">Bring your school.</p>
              <Link href="/build/school" className="mt-4 block text-center rounded-full bg-ivory px-6 py-3 text-sm font-bold text-black hover:bg-river hover:text-white transition">Anchor Campus</Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">INDIVIDUALS</div>
              <p className="mt-2 text-sm text-muted">Hustling with a record. Hold YOUR hash.</p>
              <Link href="/ledger#join" className="mt-4 block text-center rounded-full bg-river px-6 py-3 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">Get On List</Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">SPECTATORS</div>
              <p className="mt-2 text-sm text-muted">Welcome to the yard. The campfire is free.</p>
              <Link href="/benben" className="mt-4 block text-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold hover:border-ivory transition">Enter BenBen</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — ENTER */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-14 grid sm:grid-cols-3 gap-4">
          <button onClick={() => setDoors(true)} className="rounded-3xl border border-white/10 bg-panel p-8 text-left hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">INSTITUTIONS</div>
            <div className="mt-2 text-xl font-bold">Build capacity →</div>
            <p className="mt-1 text-sm text-muted">Four doors. Who are you?</p>
          </button>
          <div className="rounded-3xl border border-white/10 bg-panel p-8">
            <div className="text-xs font-bold tracking-widest text-river">YOUTH</div>
            <JoinLink className="mt-2 block text-left text-xl font-bold hover:text-emerald-300 transition">Join the ledger →</JoinLink>
            <p className="mt-1 text-sm text-muted">Claim, test, seal. Then work.</p>
          </div>
          <Link href="/work" className="rounded-3xl border border-white/10 bg-panel p-8 hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">EVERYONE</div>
            <div className="mt-2 text-xl font-bold">See the work →</div>
            <p className="mt-1 text-sm text-muted">Comment freely. Vote sealed.</p>
          </Link>
        </div>
      </section>

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}
