"use client";

import { useEffect, useState } from "react";
import {
  KEYS,
  LOCATIONS,
  Member,
  Need,
  OCCUPATIONS,
  SEED_MEMBERS,
  SEED_NEEDS,
  SEED_TASKS,
  Task,
  loadStored,
  saveStored
} from "../../lib/ledger";

function statusChip(s: Task["status"]) {
  if (s === "done") return <span className="rounded-full bg-river/10 px-3 py-1 text-xs font-semibold text-river">DONE</span>;
  if (s === "in_progress") return <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[#8a6d00]">IN PROGRESS</span>;
  return <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-muted">OPEN</span>;
}

export default function Work() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [needs, setNeeds] = useState<Need[]>(SEED_NEEDS);
  const [members] = useState<Member[]>(SEED_MEMBERS);

  const [myId, setMyId] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pTrade, setPTrade] = useState(OCCUPATIONS[0]);
  const [pLoc, setPLoc] = useState(LOCATIONS[0]);
  const [pPay, setPPay] = useState("");

  const [school, setSchool] = useState("");
  const [need, setNeed] = useState("");
  const [nOcc, setNOcc] = useState(OCCUPATIONS[0]);
  const [nLoc, setNLoc] = useState(LOCATIONS[0]);
  const [contact, setContact] = useState("");

  useEffect(() => {
    const t = loadStored<Task>(KEYS.tasks);
    if (t.length > 0) setTasks(t);
    const n = loadStored<Need>(KEYS.needs);
    if (n.length > 0) setNeeds(n);
    const savedId = window.localStorage.getItem("aptlabs-myid");
    if (savedId) setMyId(savedId);
  }, []);

  function persistTasks(v: Task[]) { setTasks(v); saveStored(KEYS.tasks, v); }
  function persistNeeds(v: Need[]) { setNeeds(v); saveStored(KEYS.needs, v); }

  function vote(id: string) {
    persistTasks(tasks.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t)));
  }

  function claim(id: string) {
    const mid = myId.trim().toUpperCase();
    if (!mid) return;
    window.localStorage.setItem("aptlabs-myid", mid);
    persistTasks(tasks.map((t) =>
      t.id === id && t.status === "open" ? { ...t, status: "in_progress", claimedBy: mid } : t
    ));
  }

  function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!pTitle.trim()) return;
    const id = "T-" + String(Math.floor(10 + Math.random() * 89));
    persistTasks([
      { id, title: pTitle.trim().slice(0, 80), trade: pTrade, location: pLoc, pay: Number(pPay) || 0, votes: 1, status: "open", claimedBy: "" },
      ...tasks
    ]);
    setPTitle(""); setPPay("");
  }

  function postNeed(e: React.FormEvent) {
    e.preventDefault();
    if (!school.trim() || !need.trim()) return;
    const id = "N-" + String(Math.floor(10 + Math.random() * 89));
    persistNeeds([
      { id, school: school.trim().slice(0, 60), need: need.trim().slice(0, 80), occupation: nOcc, location: nLoc, contact: contact.trim().slice(0, 30) },
      ...needs
    ]);
    setSchool(""); setNeed(""); setContact("");
  }

  function matches(n: Need): { exact: Member[]; tradeOnly: Member[] } {
    const exact = members.filter((m) => m.occupation === n.occupation && m.location === n.location && m.verified);
    const tradeOnly = members.filter((m) => m.occupation === n.occupation && m.location !== n.location && m.verified);
    return { exact, tradeOnly };
  }

  const ordered = [...tasks].sort((a, b) => b.votes - a.votes);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-xs font-bold tracking-widest text-river">WORK · TASKS + HIRING</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">The community votes. The youth build.</h1>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          Tasks are work the community collectively agreed on — highest votes first.
          Registered members claim them with a member ID. Schools skip the queue and post needs directly.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center rounded-2xl border border-black/10 bg-cream p-4">
          <label className="text-sm font-semibold whitespace-nowrap">My member ID</label>
          <input value={myId} onChange={(e) => setMyId(e.target.value)} placeholder="e.g. AL-0042 (from /ledger)" className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-river" />
          <span className="text-xs text-muted">Needed to claim tasks.</span>
        </div>

        {/* TASKS */}
        <div className="mt-8 space-y-3">
          {ordered.map((t) => (
            <article key={t.id} className="rounded-3xl border border-black/10 bg-white p-6 grid md:grid-cols-[64px_1fr_auto] gap-4 items-center">
              <button onClick={() => vote(t.id)} title="Vote this task up" className="rounded-2xl border border-black/10 bg-cream py-3 text-center hover:border-river transition">
                <div className="text-xl font-extrabold">▲</div>
                <div className="text-sm font-bold">{t.votes}</div>
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-mono font-bold text-ink">{t.id}</span>
                  {statusChip(t.status)}
                  <span>{t.trade} · {t.location}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
                <div className="mt-1 text-sm text-muted">
                  KES {t.pay.toLocaleString()} {t.claimedBy && <span>· claimed by <span className="font-mono">{t.claimedBy}</span></span>}
                </div>
              </div>
              <div>
                {t.status === "open" ? (
                  <button onClick={() => claim(t.id)} className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-river transition">
                    Claim
                  </button>
                ) : (
                  <span className="text-sm text-muted">{t.status === "done" ? "Closed." : "Taken."}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* PROPOSE */}
        <form onSubmit={propose} className="mt-6 rounded-3xl border border-black/10 bg-cream p-7">
          <h2 className="text-xl font-bold">Propose work worth doing.</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Task title (e.g. Paint Block C classrooms)" maxLength={80} className="sm:col-span-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river" />
            <select value={pTrade} onChange={(e) => setPTrade(e.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river">
              {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <select value={pLoc} onChange={(e) => setPLoc(e.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <input value={pPay} onChange={(e) => setPPay(e.target.value)} placeholder="Pay in KES (e.g. 5000)" inputMode="numeric" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river" />
            <button className="rounded-2xl bg-ink py-3 text-sm font-semibold text-white hover:bg-river transition">Propose task →</button>
          </div>
        </form>

        {/* HIRE */}
        <div id="hire" className="mt-14 grid md:grid-cols-2 gap-6 items-start">
          <form onSubmit={postNeed} className="rounded-3xl bg-ink text-white p-7">
            <div className="text-xs font-bold tracking-widest text-white/50">SCHOOLS · POST A NEED</div>
            <h2 className="mt-2 text-2xl font-bold">Hire in minutes.</h2>
            <p className="mt-1 text-sm text-white/60">Pilot term: free matching. You only pay the youth.</p>
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School name" maxLength={60} className="mt-4 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-river" />
            <input value={need} onChange={(e) => setNeed(e.target.value)} placeholder="What do you need? (e.g. Saturday revision)" maxLength={80} className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-river" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select value={nOcc} onChange={(e) => setNOcc(e.target.value)} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none focus:border-river [&>option]:text-black">
                {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select value={nLoc} onChange={(e) => setNLoc(e.target.value)} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none focus:border-river [&>option]:text-black">
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact (phone)" maxLength={30} className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-river" />
            <button className="mt-3 w-full rounded-full bg-river py-3.5 text-sm font-semibold hover:bg-white hover:text-ink transition">Post need →</button>
          </form>

          <div className="space-y-3">
            <h2 className="text-xl font-bold">Open needs ({needs.length})</h2>
            {needs.map((n) => {
              const m = matches(n);
              return (
                <div key={n.id} className="rounded-3xl border border-black/10 bg-white p-6">
                  <div className="text-xs text-muted font-mono">{n.id} · {n.school}</div>
                  <div className="mt-1 font-bold">{n.need}</div>
                  <div className="mt-1 text-sm text-muted">{n.occupation} · {n.location} · {n.contact}</div>
                  <div className="mt-3 rounded-2xl bg-cream border border-black/5 p-4 text-sm">
                    {m.exact.length > 0 ? (
                      <span><strong className="text-river">{m.exact.length} exact match{m.exact.length > 1 ? "es" : ""}:</strong> {m.exact.map((x) => `${x.name} (${x.id})`).join(", ")}</span>
                    ) : m.tradeOnly.length > 0 ? (
                      <span>No one in {n.location} yet — <strong>{m.tradeOnly.length} {n.occupation.toLowerCase()}{m.tradeOnly.length > 1 ? "s" : ""}</strong> nearby: {m.tradeOnly.map((x) => `${x.name} · ${x.location}`).join(", ")}</span>
                    ) : (
                      <span>No verified match yet. The need is on record — members incoming.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
