"use client";

import Link from "next/link";
import { useState } from "react";
import GeoArt from "../../components/GeoArt";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  Task,
  loadStored,
  shortHash
} from "../../lib/ledger";

// Dashboard: member-ID login, lives in this browser.
// Your record, your claimed tasks, your answers. Nothing else.
export default function Dashboard() {
  const [id, setId] = useState("");
  const [me, setMe] = useState<Member | null>(null);
  const [claimed, setClaimed] = useState<Task[]>([]);
  const [miss, setMiss] = useState(false);

  function login(e: React.FormEvent) {
    e.preventDefault();
    const key = id.trim().toUpperCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const all = [...customs, ...SEED_MEMBERS];
    const m = all.find((x) => x.id.toUpperCase() === key) || null;
    setMe(m);
    setMiss(!m);
    if (m) {
      try { window.localStorage.setItem(KEYS.myid, m.id); } catch { /* memory */ }
      const t = loadStored<Task>(KEYS.tasks);
      const base = t.length > 0 ? t : [];
      setClaimed(base.filter((x) => x.claimedBy.toUpperCase() === m.id.toUpperCase()));
    }
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-2xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">DASHBOARD</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Your page on the list.</h1>

          {!me && (
            <form onSubmit={login} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <label className="text-sm font-bold">Member ID</label>
              <div className="mt-2 flex gap-2">
                <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Open →</button>
              </div>
              {miss && <p className="mt-3 text-sm text-muted">No record for that ID. <Link href="/ledger#join" className="underline">Get on the list →</Link></p>}
              <p className="mt-3 text-xs text-muted">This login lives in this browser.</p>
            </form>
          )}

          {me && (
            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-panel border border-white/10 p-7">
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-bold">{me.id}</span>
                  <span className={me.verified ? "text-emerald-300 font-bold" : me.paid ? "text-gold font-bold" : "text-muted font-bold"}>
                    {me.verified ? "● SEALED" : me.paid ? "● PAID · UNSEALED" : "○ PLAYGROUND"}
                  </span>
                </div>
                <div className="mt-3 text-2xl font-extrabold">@{me.username || me.id}</div>
                <div className="mt-1 text-sm text-muted">{me.name} · {me.occupation} · {me.location}</div>
                <div className="mt-1 text-sm text-muted">{me.skills.join(" · ")}</div>
                <div className="mt-3 font-mono text-xs text-muted break-all">hash {shortHash(me.hash)}</div>
                {!me.verified && (
                  <Link href="/cert" className="mt-4 inline-block rounded-full bg-river px-6 py-2.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">
                    Get certified · 50 →
                  </Link>
                )}
                {me.verified && !me.hall && (
                  <Link href="/crucible" className="mt-4 inline-block rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold hover:border-gold transition">
                    Eye the halls · 100 exam →
                  </Link>
                )}
                {me.hall && (
                  <p className="mt-4 font-mono text-xs font-bold text-gold">{me.hall.toUpperCase()} · YOUR HALL</p>
                )}
              </div>

              {me.answers.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-panel p-7">
                  <div className="text-xs font-bold tracking-widest text-muted">YOUR ANSWERS · ON FILE</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {me.answers.map((a, i) => <p key={i} className="rounded-2xl bg-obsidian px-4 py-3 text-ivory/85">{i + 1}. {a}</p>)}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-panel p-7">
                <div className="text-xs font-bold tracking-widest text-muted">TASKS YOU CLAIMED ({claimed.length})</div>
                {claimed.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">None yet. <Link href="/work" className="underline">Zep-Tepi is waiting →</Link></p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm">
                    {claimed.map((t) => (
                      <div key={t.id} className="flex justify-between rounded-2xl bg-obsidian px-4 py-3">
                        <span className="font-semibold">{t.title}</span>
                        <span className="text-muted">{t.status.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => { setMe(null); setId(""); }} className="text-sm text-muted underline">Leave this browser →</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
