"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import {
  CRUCIBLE_QS,
  HALL_FEE,
  KEYS,
  Member,
  SEED_MEMBERS,
  isMpesaCode,
  loadStored,
  saveStored,
  tierFor
} from "../../lib/ledger";
import { allMembers, memberByUsername, myUsername } from "../../lib/benben";

function daysLeft(ts: number, waitDays: number): number {
  const due = ts + waitDays * 86400000;
  return Math.max(0, Math.ceil((due - Date.now()) / 86400000));
}

// The hall examination: KES 100 per sitting, 8 questions, scored.
// Pass (5+) enters ONE hall. Sand and Clay return to the floor —
// 30 and 14 days. No paid doors anywhere past this point.
export default function Crucible() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [me, setMe] = useState<Member | null>(null);
  const [code, setCode] = useState("");
  const [sitting, setSitting] = useState(false);
  const [picks, setPicks] = useState<number[]>(Array(CRUCIBLE_QS.length).fill(-1));
  const [result, setResult] = useState<null | { score: number; tier: string; pass: boolean; retryDays: number }>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const all = allMembers();
    setMembers(all);
    const u = myUsername();
    if (u) setMe(memberByUsername(all, u));
  }, []);

  function persist(v: Member[]) {
    setMembers(v);
    saveStored(KEYS.members, v);
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (!isMpesaCode(code)) { setMsg("Code should be 10 letters/numbers, like your M-Pesa SMS shows."); return; }
    persist(members.map((m) => (m.id === me.id ? { ...m, hallPaid: true } : m)));
    setMe({ ...me, hallPaid: true });
    setSitting(true);
    setMsg("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (picks.some((p) => p < 0)) { setMsg("Answer all eight. Guessing is allowed; skipping is not."); return; }
    let score = 0;
    CRUCIBLE_QS.forEach((qs, i) => { if (picks[i] === qs.answer) score++; });
    const t = tierFor(score);
    const now = Date.now();
    persist(members.map((m) =>
      m.id === me.id
        ? { ...m, testScore: score, testTs: now, tier: t.tier, verified: t.pass ? true : m.verified }
        : m
    ));
    setMe({ ...me, testScore: score, testTs: now, tier: t.tier, verified: t.pass ? true : me.verified });
    setResult({ score, ...t });
    setSitting(false);
    setMsg("");
  }

  const blocked = me && me.testTs > 0 && me.testScore !== null && (() => {
    const t = tierFor(me.testScore);
    return !t.pass && daysLeft(me.testTs, t.retryDays) > 0;
  })();

  const waitInfo = me && me.testScore !== null && !tierFor(me.testScore).pass
    ? { days: daysLeft(me.testTs, tierFor(me.testScore).retryDays), tier: tierFor(me.testScore).tier }
    : null;

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-2xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-gold">THE HALL EXAMINATION · {HALL_FEE} PER SITTING</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Eight questions. Zero memorization.</h1>
          <p className="mt-4 text-muted leading-relaxed">
            Signed in as <span className="font-mono text-gold">@{myUsername() || "…"}</span>.
            Pass (5+) enters one hall. Sand returns in 30 days, Clay in 14 — each sitting costs {HALL_FEE} again.
          </p>

          {me && !(me.paid && me.verified) && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-center">
              <p className="text-muted">The examination is for certified members. Seal your name first — 50 bob, no test.</p>
              <Link href="/zep-tepi/gate" className="mt-4 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-ivory transition">Get certified →</Link>
            </div>
          )}

          {me && me.paid && me.verified && !sitting && !result && !(blocked) && (
            <form onSubmit={pay} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <p className="text-sm">Sitting fee {HALL_FEE}. Enter the M-Pesa code:</p>
              <div className="mt-3 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code (10 characters)" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Begin →</button>
              </div>
              {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
            </form>
          )}

          {me && blocked && waitInfo && (
            <div className="mt-8 rounded-3xl border border-gold/30 bg-gold/10 p-7">
              <p className="font-bold text-lg">@{me.username} — {waitInfo.tier}. Not yet.</p>
              <p className="mt-2 text-sm text-ivory/85">The crucible keeps its calendar. Return in <strong>{waitInfo.days} day{waitInfo.days === 1 ? "" : "s"}</strong> with another {HALL_FEE}. The floor is open meanwhile.</p>
            </div>
          )}

          {sitting && (
            <form onSubmit={submit} className="mt-8 space-y-4">
              {CRUCIBLE_QS.map((qs, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-panel p-6">
                  <p className="font-bold">{i + 1}. {qs.q}</p>
                  <div className="mt-3 grid gap-2">
                    {qs.options.map((op, j) => (
                      <button
                        type="button"
                        key={j}
                        onClick={() => setPicks(picks.map((p, k) => (k === i ? j : p)))}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${picks[i] === j ? "border-gold bg-gold/15" : "border-white/10 bg-obsidian hover:border-ivory"}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {msg && <p className="text-sm text-red-400">{msg}</p>}
              <button className="w-full rounded-full bg-gold py-4 text-sm font-bold text-black hover:bg-ivory transition" style={{ height: 55 }}>Score me →</button>
            </form>
          )}

          {me && result && (
            <div className={`mt-8 rounded-3xl border p-8 text-center ${result.pass ? "border-gold/40 bg-gold/10" : "border-white/10 bg-panel"}`}>
              <div className="font-mono text-5xl font-extrabold">{result.score}/8</div>
              <div className="mt-2 font-display text-2xl font-semibold">{result.tier}</div>
              {result.pass ? (
                <>
                  <p className="mt-3 text-muted">Pass. One hall opens — choose it well, it keeps you.</p>
                  <Link href="/halls" className="mt-5 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Choose your hall →</Link>
                </>
              ) : (
                <p className="mt-3 text-muted">Fail. Back to the floor — {result.retryDays} days. {result.tier === "Sand" ? "Unformed is not an insult. It is a starting material." : "Moldable beats brittle. Come back sharper."}</p>
              )}
              <button onClick={() => setShowWhy(!showWhy)} className="mt-4 text-sm text-muted underline">
                {showWhy ? "Hide the workings" : "Show the workings"}
              </button>
              {showWhy && (
                <div className="mt-4 space-y-2 text-left text-sm">
                  {CRUCIBLE_QS.map((qs, i) => (
                    <div key={i} className={`rounded-2xl px-4 py-3 ${picks[i] === qs.answer ? "bg-obsidian" : "bg-red-950/40"}`}>
                      <span className="font-bold">{i + 1}. {picks[i] === qs.answer ? "✓" : "✗"}</span>{" "}
                      <span className="text-ivory/80">{qs.why}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
