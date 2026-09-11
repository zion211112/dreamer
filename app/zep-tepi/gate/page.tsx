"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readIdentity } from "../../../components/AuthGate";
import { loadProfile } from "../../../lib/zeptepi";

const SESSION_KEY = "aptlabs-zep-session-v1";

function daysLeft(ts: number): number {
  return Math.max(0, Math.ceil((ts - Date.now()) / 86400000));
}

// The gate. OTP identity required (enforced by the global Gate too).
// Local-first: single-use session + cooldown live in this browser,
// labeled DEMO until the backend stage wires server tokens and RLS.
export default function ZepGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [passed, setPassed] = useState(false);
  const [retryIn, setRetryIn] = useState(0);

  useEffect(() => {
    const p = loadProfile();
    setPassed(p.passed);
    setRetryIn(p.retryAfter > Date.now() ? daysLeft(p.retryAfter) : 0);
    setReady(true);
  }, []);

  function begin() {
    if (!readIdentity()) {
      router.push("/");
      return;
    }
    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ token: Math.random().toString(36).slice(2), startedAt: Date.now(), answers: [] })
      );
    } catch { /* the door sticks */ }
    router.push("/zep-tepi/test");
  }

  if (!ready) return <main className="bg-[#06060f] min-h-screen" />;

  return (
    <main className="bg-[#06060f] text-[#e8e0d8]">
      <div className="mx-auto max-w-xl px-6 py-20">
        <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · THE GATE</p>
        <h1 className="mt-6 text-4xl md:text-5xl font-light tracking-wide" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          Zep Tepi is not a community.
        </h1>
        <p className="mt-4 text-xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>It is a test.</p>

        <div className="mt-8 space-y-2 text-[16px] leading-relaxed text-[#e8e0d8]/85">
          <p>Twelve questions. Three minutes.</p>
          <p>No notes. No search. No second chances in the moment.</p>
          <p className="pt-2">The test scores two things:</p>
          <p>1. Depth of African history — factual.</p>
          <p>2. Degree of mental enslavement — behavioral.</p>
          <p className="pt-2">You pass if:</p>
          <p className="font-mono text-sm">History ≥ 16 / 24</p>
          <p className="font-mono text-sm">Enslavement ≤ 14 / 35</p>
          <p className="pt-2">Pass: you enter the Forest.</p>
          <p>Fail: you may retry in 7 days.</p>
        </div>

        {passed ? (
          <Link href="/zep-tepi" className="mt-10 inline-block rounded-full bg-[#c8763c] px-8 py-3.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
            Enter the Forest →
          </Link>
        ) : retryIn > 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <p className="font-bold">The gate keeps its calendar.</p>
            <p className="mt-2 text-[#e8e0d8]/70">Return in <strong>{retryIn} day{retryIn === 1 ? "" : "s"}</strong>. The floor is open meanwhile.</p>
            <Link href="/benben" className="mt-4 inline-block underline">Back to BenBen →</Link>
          </div>
        ) : (
          <button onClick={begin} className="mt-10 rounded-full bg-[#c8763c] px-8 py-3.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
            Begin — 3:00 on the clock
          </button>
        )}

        <p className="mt-8 font-mono text-[11px] text-white/30">DEMO GATE · timer + cooldown enforced in this browser. Production moves them server-side.</p>
        <p className="mt-6">
          <Link href="/benben" className="font-mono text-sm text-white/40 hover:text-white">← the floor</Link>
        </p>
      </div>
    </main>
  );
}
