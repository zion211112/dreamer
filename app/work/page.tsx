"use client";

import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import {
  KEYS,
  LOCATIONS,
  Comment,
  Member,
  Need,
  OCCUPATIONS,
  SEED_MEMBERS,
  SEED_NEEDS,
  SEED_TASKS,
  Task,
  WILD_NOTES,
  loadStored,
  saveStored
} from "../../lib/ledger";

function statusChip(s: Task["status"]) {
  if (s === "done") return <span className="rounded-full bg-river/15 px-3 py-1 text-xs font-semibold text-emerald-300">DONE</span>;
  if (s === "in_progress") return <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">IN PROGRESS</span>;
  return <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted">OPEN</span>;
}

function sealedId(members: Member[], id: string): Member | null {
  const m = members.find((x) => x.id.toUpperCase() === id.trim().toUpperCase());
  return m && m.paid && m.verified ? m : null;
}

// Zep-Tepi designs, assigns, manages. Sealed members vote and claim.
// Playground: browse everything, comment anywhere.
export default function Work() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [needs, setNeeds] = useState<Need[]>(SEED_NEEDS);
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const [myId, setMyId] = useState("");
  const [gate, setGate] = useState("");
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [cname, setCname] = useState("");
  const [ctext, setCtext] = useState("");

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
    const m = loadStored<Member>(KEYS.members);
    if (m.length > 0) {
      const customs = m.filter((x) => !SEED_MEMBERS.some((s) => s.id === x.id));
      setMembers([...customs, ...SEED_MEMBERS]);
    }
    const c = loadStored<{ task: string; list: Comment[] }>(KEYS.comments);
    const map: Record<string, Comment[]> = {};
    c.forEach((e) => { map[e.task] = e.list; });
    setComments(map);
    const savedId = window.localStorage.getItem(KEYS.myid);
    if (savedId) setMyId(savedId);
  }, []);

  function persistTasks(v: Task[]) { setTasks(v); saveStored(KEYS.tasks, v); }
  function persistNeeds(v: Need[]) { setNeeds(v); saveStored(KEYS.needs, v); }
  function persistComments(v: Record<string, Comment[]>) {
    setComments(v);
    saveStored(KEYS.comments, Object.entries(v).map(([task, list]) => ({ task, list: list.slice(-30) })));
  }

  function requireSeal(): Member | null {
    const m = sealedId(members, myId);
    if (!m) {
      setGate("That needs a seal. Enter your sealed member ID above — playground can browse and comment, not vote or claim.");
      return null;
    }
    setGate("");
    window.localStorage.setItem(KEYS.myid, m.id);
    return m;
  }

  function vote(id: string) {
    if (!requireSeal()) return;
    persistTasks(tasks.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t)));
  }

  function claim(id: string) {
    const m = requireSeal();
    if (!m) return;
    persistTasks(tasks.map((t) =>
      t.id === id && t.status === "open" ? { ...t, status: "in_progress", claimedBy: m.id } : t
    ));
  }

  function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!requireSeal() || !pTitle.trim()) return;
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

  function postComment(taskId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!ctext.trim()) return;
    const entry: Comment = { name: (cname.trim() || "Anonymous").slice(0, 30), text: ctext.trim().slice(0, 280), ts: Date.now() };
    persistComments({ ...comments, [taskId]: [...(comments[taskId] || []), entry].slice(-30) });
    setCtext("");
  }

  function matches(n: Need): { exact: Member[]; tradeOnly: Member[] } {
    const exact = members.filter((m) => m.occupation === n.occupation && m.location === n.location && m.verified);
    const tradeOnly = members.filter((m) => m.occupation === n.occupation && m.location !== n.location && m.verified);
    return { exact, tradeOnly };
  }

  const ordered = [...tasks].sort((a, b) => b.votes - a.votes);
  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">ZEP-TEPI · JOBS + PROJECTS</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Zep-Tepi designs, assigns, manages.</h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            Community-voted tasks, school needs, lecturer-directed builds, agribusiness crews —
            even the tractor goes where the votes say. Sealed members vote and claim.
            Playground browses and comments.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center rounded-2xl border border-white/10 bg-panel p-4">
            <label className="text-sm font-semibold whitespace-nowrap">My sealed ID</label>
            <input value={myId} onChange={(e) => setMyId(e.target.value)} placeholder="e.g. AL-0042" className={`${field} flex-1 font-mono uppercase`} />
            <span className="text-xs text-muted">Voting + claiming need a seal. <a href="/ledger#join" className="underline">Get sealed →</a></span>
          </div>
          {gate && <p className="mt-3 rounded-2xl bg-gold/10 border border-gold/30 p-4 text-sm text-ivory/85">{gate}</p>}

          {/* TASKS */}
          <div className="mt-8 space-y-3">
            {ordered.map((t) => {
              const thread = comments[t.id] || [];
              const open = openThread === t.id;
              return (
                <article key={t.id} className="rounded-3xl border border-white/10 bg-panel p-6">
                  <div className="grid md:grid-cols-[64px_1fr_auto] gap-4 items-center">
                    <button onClick={() => vote(t.id)} title="Sealed members vote" className="rounded-2xl border border-white/10 bg-obsidian py-3 text-center hover:border-river transition">
                      <div className="text-xl font-extrabold">▲</div>
                      <div className="text-sm font-bold">{t.votes}</div>
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="font-mono font-bold text-ivory">{t.id}</span>
                        {statusChip(t.status)}
                        <span>{t.trade} · {t.location}</span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
                      <div className="mt-1 text-sm text-muted">
                        {t.pay > 0 ? `KES ${t.pay.toLocaleString()}` : "Deployment vote — pay set on award"}{t.claimedBy && <span> · claimed by <span className="font-mono">{t.claimedBy}</span></span>}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      {t.status === "open" ? (
                        <button onClick={() => claim(t.id)} className="rounded-full bg-ivory px-6 py-2.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">
                          Claim
                        </button>
                      ) : (
                        <span className="text-sm text-muted">{t.status === "done" ? "Closed." : "Taken."}</span>
                      )}
                      <button onClick={() => setOpenThread(open ? null : t.id)} className="text-sm text-muted underline">
                        Discuss ({thread.length})
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="space-y-2">
                        {thread.map((c, i) => (
                          <div key={i} className="rounded-2xl bg-obsidian px-4 py-2.5 text-sm">
                            <span className="font-bold">{c.name}</span>{" "}
                            <span className="text-ivory/80">{c.text}</span>
                          </div>
                        ))}
                        {thread.length === 0 && <p className="text-sm text-muted">No comments yet. Playground — this is your part.</p>}
                      </div>
                      <form onSubmit={(e) => postComment(t.id, e)} className="mt-3 flex gap-2">
                        <input value={cname} onChange={(e) => setCname(e.target.value)} placeholder="Name" maxLength={30} className={`${field} w-28 px-3 py-2.5`} />
                        <input value={ctext} onChange={(e) => setCtext(e.target.value)} placeholder="Say something useful…" maxLength={280} className={`${field} flex-1`} />
                        <button className="rounded-2xl border border-white/20 px-5 text-sm font-semibold hover:border-ivory transition">Post</button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* WILD SHELF */}
          <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-6">
            <div className="text-xs font-bold tracking-widest text-muted">LONG-RANGE NOTEBOOKS — OPEN, NOT PROMISES</div>
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              {WILD_NOTES.map((w) => (
                <div key={w.title} className="rounded-2xl bg-panel p-5">
                  <div className="font-bold text-sm">{w.title}</div>
                  <p className="mt-1 text-[13px] text-muted">{w.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PROPOSE */}
          <form onSubmit={propose} className="mt-6 rounded-3xl border border-white/10 bg-panel p-7">
            <h2 className="text-xl font-bold">Propose work worth doing. <span className="text-sm font-normal text-muted">(sealed only)</span></h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Task title (e.g. Till Block C shamba)" maxLength={80} className={`${field} sm:col-span-2`} />
              <select value={pTrade} onChange={(e) => setPTrade(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select value={pLoc} onChange={(e) => setPLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <input value={pPay} onChange={(e) => setPPay(e.target.value)} placeholder="Pay in KES (e.g. 5000)" inputMode="numeric" className={field} />
              <button className="rounded-2xl bg-ivory py-3 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Propose task →</button>
            </div>
          </form>

          {/* HIRE */}
          <div id="hire" className="mt-14 grid md:grid-cols-2 gap-6 items-start">
            <form onSubmit={postNeed} className="rounded-3xl bg-panel border border-white/10 p-7">
              <div className="text-xs font-bold tracking-widest text-muted">SCHOOLS · POST A NEED</div>
              <h2 className="mt-2 text-2xl font-bold">Hire from the list.</h2>
              <p className="mt-1 text-sm text-muted">Agribusiness grads: manage a farm remotely, hire the crew here. Lecturers: direct a funded build, Zep-Tepi staffs it.</p>
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School / farm / org name" maxLength={60} className={`${field} mt-4 w-full`} />
              <input value={need} onChange={(e) => setNeed(e.target.value)} placeholder="What do you need?" maxLength={80} className={`${field} mt-2 w-full`} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select value={nOcc} onChange={(e) => setNOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                  {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <select value={nLoc} onChange={(e) => setNLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact (phone)" maxLength={30} className={`${field} mt-2 w-full`} />
              <button className="mt-3 w-full rounded-full bg-river py-3.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Post need →</button>
            </form>

            <div className="space-y-3">
              <h2 className="text-xl font-bold">Open needs ({needs.length})</h2>
              {needs.map((n) => {
                const m = matches(n);
                return (
                  <div key={n.id} className="rounded-3xl border border-white/10 bg-panel p-6">
                    <div className="text-xs text-muted font-mono">{n.id} · {n.school}</div>
                    <div className="mt-1 font-bold">{n.need}</div>
                    <div className="mt-1 text-sm text-muted">{n.occupation} · {n.location} · {n.contact}</div>
                    <div className="mt-3 rounded-2xl bg-obsidian border border-white/10 p-4 text-sm">
                      {m.exact.length > 0 ? (
                        <span><strong className="text-emerald-300">{m.exact.length} exact match{m.exact.length > 1 ? "es" : ""}:</strong> {m.exact.map((x) => `${x.name} (${x.id})`).join(", ")}</span>
                      ) : m.tradeOnly.length > 0 ? (
                        <span className="text-ivory/85">No one in {n.location} yet — <strong>{m.tradeOnly.length} {n.occupation.toLowerCase()}{m.tradeOnly.length > 1 ? "s" : ""}</strong> nearby: {m.tradeOnly.map((x) => `${x.name} · ${x.location}`).join(", ")}</span>
                      ) : (
                        <span className="text-muted">No sealed match yet. The need is on record — members incoming.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
