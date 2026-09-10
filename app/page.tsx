"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DoorsModal from "../components/DoorsModal";
import GeoArt from "../components/GeoArt";
import JoinLink from "../components/JoinLink";
import { KEYS, Member, SEED_MEMBERS, SEED_NEEDS, SEED_TASKS, ledgerVersion, loadStored } from "../lib/ledger";

// Landing: fool-plain on obsidian. Ledger line lives HERE only.
// Three entries: build, verify, join (gated).

export default function Home() {
  const [doors, setDoors] = useState(false);
  const [count, setCount] = useState(SEED_MEMBERS.length);

  useEffect(() => {
    const customs = loadStored<Member>(KEYS.members).filter(
      (m) => !SEED_MEMBERS.some((s) => s.id === m.id)
    );
    setCount(SEED_MEMBERS.length + customs.length);
  }, []);

  const verified = SEED_MEMBERS.filter((m) => m.verified).length;
  const openWork =
    SEED_TASKS.filter((t) => t.status !== "done").length + SEED_NEEDS.length;

  return (
    <main className="bg-obsidian text-ivory">
      {/* LEDGER LINE — landing only */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-2 text-center font-mono text-[11px] tracking-[0.2em] text-muted">
          APT-LABS · LEDGER {ledgerVersion(count)} · KIRINYAGA, KENYA
        </div>
      </div>

      {/* 1 — HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <GeoArt variant="ring" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] text-ivory opacity-[0.07]" />
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
              <Link href="/ledger#join" className="rounded-full bg-river px-7 py-3.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">
                VERIFY CAPABILITY
              </Link>
              <JoinLink className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-ivory hover:border-ivory transition">
                JOIN THE LEDGER
              </JoinLink>
            </div>
            <p className="mt-4 text-sm text-muted">{count} on the list. You&apos;re next.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-panel p-6">
            <div className="text-xs font-bold tracking-widest text-muted">THE LIST SO FAR</div>
            <div className="mt-4 space-y-3">
              {[
                [`${SEED_MEMBERS.length} registered`, "trade + town on file"],
                [`${verified} sealed`, "answered + paid"],
                [`${openWork} open jobs`, "tasks + institution needs"]
              ].map(([v, l]) => (
                <div key={l} className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="text-xl font-extrabold">{v}</span>
                  <span className="text-[13px] text-muted">{l}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">Demo figures. Real hashes.</p>
          </div>
        </div>
      </section>

      {/* 2 — HOW IT WORKS */}
      <section className="border-b border-white/10 bg-panel/40">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <GeoArt variant="band" className="h-10 w-full text-ivory opacity-[0.08]" />
          <h2 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight">Three steps. No speeches.</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["1. Answer hard", "Three questions no certificate asks. The gap test first — ambition, resources, proof."],
              ["2. Pay the Till", "KES 20/week. Code in, seal lands. Unpaid? Browse and comment — voting and jobs wait."],
              ["3. Work", "Kemet-OS opens the research. Zep-Tepi assigns the jobs. The list grows."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-3xl bg-panel border border-white/10 p-7">
                <div className="font-bold">{t}</div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — INSTITUTIONS */}
      <section className="relative overflow-hidden border-b border-white/10">
        <GeoArt variant="corner" className="pointer-events-none absolute -left-10 -bottom-10 h-[220px] w-[220px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-river">FOR INSTITUTIONS — PILOT SCHOOLS FIRST</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              Bring your school. We bring the paperwork done.
            </h2>
            <ul className="mt-6 space-y-3 text-[15px] text-ivory/85">
              <li>→ <strong>Teachers</strong> — assistant with animations, exams, planning. KES 500/month.</li>
              <li>→ <strong>Schools</strong> — classroom design, edtech tools, teacher management.</li>
              <li>→ <strong>Parents</strong> — free score checks where the school is subscribed.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-panel border border-white/10 p-8">
            <div className="text-sm text-muted">One receipt for everything</div>
            <div className="mt-2 text-2xl font-extrabold">Who came. What they did. What you paid.</div>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              You pay the youth directly via M-Pesa. We keep the receipt — obviously, we&apos;re a list.
            </p>
            <button onClick={() => setDoors(true)} className="mt-5 block w-full text-center rounded-full bg-river px-6 py-3.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">
              Open your door →
            </button>
          </div>
        </div>
      </section>

      {/* 4 — VERIFY */}
      <section className="border-b border-white/10 bg-panel/40">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-16 text-center">
          <p className="font-display italic text-3xl md:text-4xl">Lose your certificate? We kept the hash.</p>
          <p className="mt-3 text-muted">Enter any member ID on the ledger and watch the record prove itself.</p>
          <Link href="/ledger#verify" className="mt-6 inline-block rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">
            Verify a certificate →
          </Link>
        </div>
      </section>

      {/* 5 — ENTER */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-14 grid sm:grid-cols-3 gap-4">
          <button onClick={() => setDoors(true)} className="rounded-3xl border border-white/10 bg-panel p-8 text-left hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">INSTITUTIONS</div>
            <div className="mt-2 text-xl font-bold">Build capacity →</div>
            <p className="mt-1 text-sm text-muted">Eight doors. Yours is open.</p>
          </button>
          <Link href="/ledger#join" className="rounded-3xl border border-white/10 bg-panel p-8 hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">YOUTH</div>
            <div className="mt-2 text-xl font-bold">Verify capability →</div>
            <p className="mt-1 text-sm text-muted">Answer, pay, seal. Then work.</p>
          </Link>
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
