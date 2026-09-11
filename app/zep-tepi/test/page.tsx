"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { readIdentity } from "../../../components/AuthGate";
import { sha256 } from "../../../lib/hash";
import {
  GATE_QS,
  GATE_SECONDS,
  loadProfile,
  logAttempt,
  saveProfile,
  scoreGate
} from "../../../lib/zeptepi";

const SESSION_KEY = "aptlabs-zep-session-v1";
const GRACE = 30;

type Session = { token: string; startedAt: number; answers: number[] };

// One question at a time. No back. 180 seconds, auto-submit at zero.
// Local-first: the countdown runs here, labeled DEMO until server timers land.
export default function ZepTest() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [dead, setDead] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<number[]>(Array(GATE_QS.length).fill(-1));
  const [left, setLeft] = useState(GATE_SECONDS);
  const submitted = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) { setDead(true); return; }
      const s = JSON.parse(raw) as Session;
      if (!s || !s.token || !s.startedAt) { setDead(true); return; }
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      if (elapsed > GATE_SECONDS + GRACE) {
        window.localStorage.removeItem(SESSION_KEY);
        setDead(true);
        return;
      }
      setSession(s);
      if (Array.isArray(s.answers) && s.answers.length === GATE_QS.length) setPicks(s.answers);
    } catch {
      setDead(true);
    }
  }, []);

  useEffect(() => {
    if (!session || submitted.current) return;
    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      const remain = GATE_SECONDS - elapsed;
      setLeft(Math.max(0, remain));
      if (remain <= 0) {
        window.clearInterval(t);
        finish(picks);
      }
    }, 500);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function persistAnswers(next: number[]) {
    setPicks(next);
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Session;
        window.localStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, answers: next }));
      }
    } catch { /* the clock keeps its own time */ }
  }

  function finish(finalPicks: number[]) {
    if (submitted.current) return;
    submitted.current = true;
    const id = readIdentity();
    const { hd, es, pass } = scoreGate(finalPicks);
    const now = Date.now();
    logAttempt({
      phoneHash: id ? sha256(id.phone) : "anonymous",
      answers: finalPicks,
      hd,
      es,
      passed: pass,
      ts: now
    });
    const p = loadProfile();
    if (pass) {
      saveProfile({ ...p, passed: true, passedAt: now, retryAfter: 0, currentHall: 8 });
    } else {
      saveProfile({ ...p, passed: false, retryAfter: now + 7 * 86400000 });
    }
    try { window.localStorage.removeItem(SESSION_KEY); } catch { /* spent */ }
    try { window.sessionStorage.setItem("aptlabs-zep-result", JSON.stringify({ hd, es, pass, ts: now })); } catch { /* memory */ }
    router.push("/zep-tepi/test/result");
  }

  if (dead) {
    return (
      <main className="bg-[#06060f] text-[#e8e0d8]">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · EXPIRED</p>
          <h1 className="mt-4 text-3xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>That session is spent.</h1>
          <p className="mt-3 text-[#e8e0d8]/70">Single-use tokens. Three minutes, no more.</p>
          <button onClick={() => router.push("/zep-tepi/gate")} className="mt-8 rounded-full bg-[#c8763c] px-8 py-3.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
            Back to the gate →
          </button>
        </div>
      </main>
    );
  }

  if (!session) return <main className="bg-[#06060f] min-h-screen" />;

  const q = GATE_QS[idx];
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <main className="bg-[#06060f] text-[#e8e0d8]">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-white/40">{idx + 1} / {GATE_QS.length}</span>
          <span className={left <= 30 ? "text-red-400 font-bold" : "text-[#e0a040] font-bold"}>{mm}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#c8763c]" style={{ width: `${(left / GATE_SECONDS) * 100}%` }} />
        </div>

        <h1 className="mt-8 text-2xl md:text-3xl font-light leading-snug" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          {q.q}
        </h1>

        <div className="mt-6 grid gap-3">
          {q.options.map((op, j) => (
            <button
              key={j}
              onClick={() => {
                const next = picks.map((p, k) => (k === idx ? j : p));
                persistAnswers(next);
                if (idx < GATE_QS.length - 1) {
                  setIdx(idx + 1);
                } else {
                  finish(next);
                }
              }}
              className={`rounded-2xl border px-5 py-4 text-left transition ${
                picks[idx] === j
                  ? "border-[#c8763c] bg-[#c8763c]/10"
                  : "border-white/10 bg-white/[0.02] hover:border-[#e8e0d8]/40"
              }`}
            >
              <span className="mr-3 font-mono text-[#c8763c]">{String.fromCharCode(65 + j)}.</span>
              {op.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-white/30">No back. The moment doesn&apos;t repeat.</p>
      </div>
    </main>
  );
}
