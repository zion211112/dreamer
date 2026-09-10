"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import { BENBEN_NOMS_KEY, Nomination } from "../../lib/benben";
import { HALLS } from "../../lib/halls";
import { KEYS, Member, loadStored, saveStored } from "../../lib/ledger";
import { allMembers, memberByUsername, myUsername } from "../../lib/benben";

// The halls room. Entry: pass the hall examination.
// One hall per member — choose it well, it keeps you.
// Higher halls carry bank-facing weight: dossiers, guarantees, pipelines.
export default function Halls() {
  const [members, setMembers] = useState<Member[]>([]);
  const [me, setMe] = useState<Member | null>(null);
  const [noms, setNoms] = useState<Nomination[]>([]);

  useEffect(() => {
    const all = allMembers();
    setMembers(all);
    const u = myUsername();
    if (u) setMe(memberByUsername(all, u));
    try {
      const raw = window.localStorage.getItem(BENBEN_NOMS_KEY);
      if (raw) setNoms(JSON.parse(raw));
    } catch { /* the queue is quiet */ }
  }, []);

  function persist(v: Member[]) {
    setMembers(v);
    saveStored(KEYS.members, v);
  }

  function choose(hall: string) {
    if (!me || me.hall) return;
    persist(members.map((m) => (m.id === me.id ? { ...m, hall } : m)));
    setMe({ ...me, hall });
  }

  function voteYes(postId: string, hall: string) {
    if (!me) return;
    const next = noms.map((n) =>
      n.postId === postId && n.hall === hall && !n.yes.includes(me.username)
        ? { ...n, yes: [...n.yes, me.username] }
        : n
    );
    setNoms(next);
    try { window.localStorage.setItem(BENBEN_NOMS_KEY, JSON.stringify(next)); } catch { /* unheard */ }
  }

  const pass = !!(me && me.hallPaid && me.verified && me.tier && me.testScore !== null && me.testScore >= 5);

  if (!me) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">THE HALLS · SEALED ONLY</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">No name on the roll, no stairs down.</h1>
          <Link href="/ledger#join" className="mt-8 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Get on the list →</Link>
        </div>
      </main>
    );
  }

  if (!pass) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">THE HALLS · SEALED ONLY</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">No seal, no stairs down.</h1>
          <p className="mt-3 text-muted">Pass the hall examination and one hall opens. Fail and no price opens them — there is no paid door here.</p>
          <Link href="/crucible" className="mt-8 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Face the examination →</Link>
        </div>
      </main>
    );
  }

  const myQueue = noms.filter((n) => n.hall === me.hall);

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -left-24 -top-24 h-[340px] w-[340px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-gold">THE 8 HALLS · ROSTAU{me.tier ? ` · ENTERING AS ${me.tier.toUpperCase()}` : ""}</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
            {me.hall ? `You belong to ${me.hall}.` : "You passed. Choose one hall."}
          </h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            One hall per member — choose it well, it keeps you. Higher halls carry bank-facing weight:
            sealed dossiers, guarantees, grant pipelines. That weight is earned here, floor by floor.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {HALLS.map((h) => {
              const mine = me.hall === h.name;
              const locked = me.hall && !mine;
              return (
                <div key={h.n} className={`rounded-3xl border p-7 ${mine ? "border-gold/50 bg-gold/[0.06]" : "border-white/10 bg-panel"} ${locked ? "opacity-45" : ""}`}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display italic text-2xl text-gold">{h.n}</span>
                    <span className="font-mono text-xs text-muted">{h.admin}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{h.name}</h2>
                  <div className="text-sm text-muted">{h.discipline}</div>
                  <p className="mt-3 text-sm text-ivory/85">{h.gate}</p>
                  <p className="mt-2 font-mono text-xs text-gold/80">◈ {h.funds}</p>
                  {!me.hall && (
                    <button onClick={() => choose(h.name)} className="mt-4 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-black hover:bg-ivory transition">
                      Enter this hall →
                    </button>
                  )}
                  {mine && <p className="mt-4 font-mono text-xs font-bold text-gold">YOUR HALL</p>}
                </div>
              );
            })}
          </div>

          {me.hall && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">REVIEW QUEUE · {me.hall.toUpperCase()} · 3 YES TO INVITE</div>
              {myQueue.length === 0 && <p className="mt-3 text-sm text-muted">The queue is quiet. Nominated floor builds land here, silently.</p>}
              <div className="mt-3 space-y-3">
                {myQueue.map((n, i) => (
                  <div key={i} className="rounded-2xl bg-obsidian border border-white/10 p-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/benben/post/${n.postId}`} className="font-bold hover:text-gold transition">{n.postId}</Link>
                        <p className="mt-1 text-muted">“{n.reason}” — @{n.by}</p>
                        <p className="mt-1 font-mono text-xs text-muted">{n.yes.length}/3 yes{n.yes.length >= 3 ? " — INVITED. The poster gets the word." : ""}</p>
                      </div>
                      {n.yes.length < 3 && !n.yes.includes(me.username) && (
                        <button onClick={() => voteYes(n.postId, n.hall)} className="shrink-0 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-black transition">Yes</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-6 text-sm text-muted">
            The Agora: halls meet weekly. The Paw: three sealed Diamonds, rotating, anonymous — appoints keepers, audits diamonds, settles disputes. Seats stay empty until the first Diamonds exist. That is honest.
          </div>
        </div>
      </div>
    </main>
  );
}
