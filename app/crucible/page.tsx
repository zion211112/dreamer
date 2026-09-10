"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import {
  CRUCIBLE_QS,
  KEYS,
  Member,
  SEED_MEMBERS,
  TEST_FEE,
  TILL,
  isMpesaCode,
  loadStored,
  saveStored,
  tierFor
} from "../../lib/ledger";

function daysLeft(ts: number, waitDays: number): number {
  const due = ts + waitDays * 86400000;
  return Math.max(0, Math.ceil((due - Date.now()) / 86400000));
}

// The Crucible: pay 50 → 8 questions → scored. Pass enters the halls.
// Fail stays in the playground until the retry window opens.
export default function Crucible() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [id, setId] = useState("");
  const [me, setMe] = useState<Member | null>(null);
  const [code, setCode] = useState("");
  const [picks, setPicks] = useState<number[]>(Array(CRUCIBLE_QS.length).fill(-1));
  const [result, setResult] = useState<null | { score: number; tier: string; pass: boolean; retryDays: number }>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) {
      const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
      setMembers([...customs, ...SEED_MEMBERS]);
    }
  }, []);

  function persist(v: Member[]) { setMembers(v); saveStored(KEYS.members, v); }

  function find(e: React.FormEvent) {
    e.preventDefault();
    const m = members.find((x) => x.id.toUpperCase() === id.trim().toUpperCase()) || null;
    setMe(m);
    setResult(null);
    setMsg(m ? "" : "No slot with that ID. Claim one on the ledger first.");
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (!isMpesaCode(code)) { setMsg("Code should be 10 letters/numbers, like your M-Pesa SMS shows."); return; }
    persist(members.map((m) => (m.id === me.id ? { ...m, paid: true } : m)));
    setMe({ ...me, paid: true });
    setMsg("Paid. Eight questions. No memorizing — just friction.");
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
    setMsg("");
  }

  const blocked = me && me.testTs > 0 && me.testScore !== null && (() => {
    const t = tierFor(me.testScore);
    return !t.pass && daysLeft(me.testTs, t.retryDays) > 0;
  })();

  const waitInfo = me && me.testScore !== null && !tierFor(me.testScore).pass
    ? { days: daysLeft(me.testTs, tierFor(me.testScore).retryDays), tier: tierFor(me.testScore).tier }
    : null;

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-2xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">THE CRUCIBLE · {TEST_FEE} TO ENTER</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Eight questions. Zero memorization.</h1>
          <p className="mt-4 text-muted leading-relaxed">Pay {TEST_FEE}, answer eight, get scored. Pass (5+) enters the halls. Fail stays in the playground — Sand returns in 30 days, Clay in 14.</p>

          {!me && (
            <form onSubmit={find} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <label className="text-sm font-bold">Your ledger ID</label>
              <div className="mt-2 flex gap-2">
                <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Find me →</button>
              </div>
              {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
              <p className="mt-3 text-xs text-muted">No ID? <Link href="/ledger#join" className="underline">Claim a slot →</Link></p>
            </form>
          )}

          {me && !me.paid && (
            <form onSubmit={pay} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <p className="text-sm"><strong>{me.id}</strong> found, unpaid. Send {TEST_FEE} to Till {TILL}:</p>
              <div className="mt-3 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code (10 characters)" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-river px-6 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Confirm →</button>
              </div>
              {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
            </form>
          )}

          {me && me.paid && !me.verified && blocked && waitInfo && (
            <div className="mt-8 rounded-3xl border border-gold/30 bg-gold/10 p-7">
              <p className="font-bold text-lg">{me.id} — {waitInfo.tier}. Not yet.</p>
              <p className="mt-2 text-sm text-ivory/85">The crucible keeps its calendar. Return in <strong>{waitInfo.days} day{waitInfo.days === 1 ? "" : "s"}</strong>. The playground is open meanwhile — browse, comment, sharpen.</p>
            </div>
          )}

          {me && me.paid && !me.verified && !blocked && !result && (
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
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${picks[i] === j ? "border-river bg-river/15" : "border-white/10 bg-obsidian hover:border-ivory"}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {msg && <p className="text-sm text-muted">{msg}</p>}
              <button className="w-full rounded-full bg-river py-4 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">Score me →</button>
            </form>
          )}

          {me && result && (
            <div className={`mt-8 rounded-3xl border p-8 text-center ${result.pass ? "border-river/40 bg-river/10" : "border-gold/30 bg-gold/10"}`}>
              <div className="font-mono text-5xl font-extrabold">{result.score}/8</div>
              <div className="mt-2 text-2xl font-extrabold">{result.tier}</div>
              {result.pass ? (
                <>
                  <p className="mt-3 text-muted">Pass. The halls open.</p>
                  <Link href="/halls" className="mt-5 inline-block rounded-full bg-river px-8 py-3.5 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">Enter the halls →</Link>
                </>
              ) : (
                <p className="mt-3 text-muted">Fail. Back to the playground — {result.retryDays} days. {result.tier === "Sand" ? "Unformed is not an insult. It is a starting material." : "Moldable beats brittle. Come back sharper."}</p>
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

          {me && me.verified && !result && (
            <div className="mt-8 rounded-3xl border border-river/40 bg-river/10 p-7 text-center">
              <p className="font-bold text-lg text-emerald-300">{me.id} is sealed{me.tier ? ` · ${me.tier}` : ""}.</p>
              <div className="mt-4 flex justify-center gap-3 text-sm">
                <Link href="/halls" className="rounded-full bg-river px-6 py-2.5 font-semibold text-white hover:bg-ivory hover:text-black transition">Halls →</Link>
                <Link href="/work" className="rounded-full border border-white/25 px-6 py-2.5 font-semibold hover:border-ivory transition">Work →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
