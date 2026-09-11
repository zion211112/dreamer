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
            <p className="mt-4 text-sm text-muted">0 on the list. You&apos;re next.</p>
          </div>

          {/* SNAPSHOT */}
          <div className="relative rounded-3xl border border-white/15 bg-panel p-6 overflow-hidden">
            <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 text-ivory opacity-[0.07]" />
            <div className="relative">
              <div className="text-xs font-bold tracking-widest text-muted">LEDGER SNAPSHOT · LIVE</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">0 schools</span>
                  <span className="text-[13px] text-muted">involved</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">0 students</span>
                  <span className="text-[13px] text-muted">under them</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">0 individuals</span>
                  <span className="text-[13px] text-muted">on the ledger</span>
                </div>
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold">KES 0</span>
                    <span className="text-[13px] text-muted">0% used</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="bar-fill h-full rounded-full bg-river" style={{ width: "0%" }} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">0 completed</span>
                  <span className="text-[13px] text-muted">projects</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold truncate">No active build</span>
                  <span className="shrink-0 text-[11px] font-mono text-gold">CURRENT BUILD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1 — TALENT / RECORD / PATIENT */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-14 md:py-20 space-y-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">01</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">Talent: present. Record: absent. Patient: stable.</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">02</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">Symptom: exhaustion. Cause: paperwork. Fix: available.</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">03</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">Time of discovery: this page. Time of loss: too early to say.</p>
          </div>
        </div>
      </section>

      {/* 2 — WHO IT'S FOR, revised */}
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

      {/* 2 — TEACHER: YOUR LIFE BACK */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-14 md:py-20 space-y-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">2</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">FOR THE TEACHER: YOUR LIFE BACK</p>
          </div>
          <div>
            <p className="mt-4 text-[15px] text-ivory/85 leading-relaxed">
              If you spent last weekend marking two hundred identical scripts wondering why you didn&apos;t become a charcoal burner instead, we see you.
            </p>
            <ul className="mt-4 space-y-1.5 text-[15px] text-ivory/85">
              <li>· 250 bob. You teach. The code marks.</li>
              <li>· Drop a test link. The machine marks it. You get the weakness map before the bell.</li>
              <li>· You teach. The code does the suffering.</li>
            </ul>
            <Link href="/build/teacher" className="mt-4 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">open the teacher door →</Link>
          </div>
        </div>
      </section>

      {/* 3 — SCHOOL: ABSOLUTE OPERATIONAL SOVEREIGNTY */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-14 md:py-20 space-y-12">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted">3</p>
            <p className="mt-2 font-display text-2xl md:text-3xl">FOR THE SCHOOL: ABSOLUTE OPERATIONAL SOVEREIGNTY</p>
          </div>
          <div>
            <p className="mt-4 text-[15px] text-ivory/85 leading-relaxed">
              Ministry audits, missing fees, teachers on the verge of mutiny, and a library ledger that looks like a crime scene.
            </p>
            <ul className="mt-4 space-y-1.5 text-[15px] text-ivory/85">
              <li>· Bring your campus. We bring the absolute operational spine.</li>
              <li>· One payment. The whole spine. Instant digital roster control, science-backed retention timetables, automated M-Pesa fee tracking, and one-click inspection modes that make auditors pack up and leave.</li>
            </ul>
            <button onClick={() => setDoors(true)} className="mt-4 inline-block text-sm font-bold text-emerald-300 hover:text-ivory transition">open your door →</button>
          </div>
        </div>
      </section>

      {/* 3 — ENTER, one line */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-12 text-center text-sm text-muted">
          <button onClick={() => setDoors(true)} className="hover:text-ivory transition">Build capacity</button>
          <span className="mx-3 text-dim">·</span>
          <JoinLink className="hover:text-ivory transition">Join the ledger</JoinLink>
          <span className="mx-3 text-dim">·</span>
          <Link href="/benben" className="hover:text-ivory transition">See the floor</Link>
        </div>
      </section>

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}