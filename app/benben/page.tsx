"use client";

import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import MemberCard from "../../components/MemberCard";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SEED_MEMBERS,
  SEED_TASKS,
  Task,
  loadStored,
  saveStored
} from "../../lib/ledger";

type Thread = { id: string; title: string; text: string; ts: number; comments: { name: string; text: string }[] };

const SEED_THREADS: Thread[] = [
  { id: "B-01", title: "Nightly problem: the 47-pupil classroom", text: "30 desks. 47 pupils. Monday. Best seating wins — sharpest answer gets quoted on the ledger.", ts: 0, comments: [] },
  { id: "B-02", title: "Shadow board: what should Zep-Tepi build next?", text: "No budgets, no permission. Name the work worth doing and say why in two lines.", ts: 0, comments: [] },
  { id: "B-03", title: "Telemetry from the ground", text: "Mwea, Kagio, Kerugoya, Embu, Sagana, Mugumo — report what you see: prices, rains, blackouts, wins.", ts: 0, comments: [] }
];

// Ben-Ben: the yard. The campfire is free — read, post, comment.
// Voting and claiming live on Zep-Tepi, behind the seal.
export default function BenBen() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [open, setOpen] = useState<string | null>(null);
  const [ttitle, setTtitle] = useState("");
  const [ttext, setTtext] = useState("");
  const [cname, setCname] = useState("");
  const [ctext, setCtext] = useState("");
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [vaultId, setVaultId] = useState("");
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vocc, setVocc] = useState("All trades");
  const [vloc, setVloc] = useState("All towns");
  const [vq, setVq] = useState("");

  useEffect(() => {
    const t = loadStored<Task>(KEYS.tasks);
    if (t.length > 0) setTasks(t);
    const b = loadStored<Thread>(KEYS.benben);
    if (b.length > 0) {
      const customs = b.filter((x) => !SEED_THREADS.some((s) => s.id === x.id));
      const merged = [...customs, ...SEED_THREADS.map((s) => {
        const live = b.find((x) => x.id === s.id);
        return live ? { ...s, comments: live.comments } : s;
      })];
      setThreads(merged);
    }
    const m = loadStored<Member>(KEYS.members);
    if (m.length > 0) {
      const customs = m.filter((x) => !SEED_MEMBERS.some((s) => s.id === x.id));
      setMembers([...customs, ...SEED_MEMBERS]);
    }
  }, []);

  function persist(v: Thread[]) { setThreads(v); saveStored(KEYS.benben, v); }

  function postTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!ttitle.trim()) return;
    const id = "B-" + String(Math.floor(10 + Math.random() * 89));
    persist([{ id, title: ttitle.trim().slice(0, 80), text: ttext.trim().slice(0, 280), ts: Date.now(), comments: [] }, ...threads]);
    setTtitle(""); setTtext("");
  }

  function postComment(id: string, e: React.FormEvent) {
    e.preventDefault();
    if (!ctext.trim()) return;
    persist(threads.map((t) =>
      t.id === id
        ? { ...t, comments: [...t.comments, { name: (cname.trim() || "Anonymous").slice(0, 30), text: ctext.trim().slice(0, 280) }].slice(-30) }
        : t
    ));
    setCtext("");
  }

  const ticker = [...tasks].filter((t) => t.status === "open").sort((a, b) => b.votes - a.votes).slice(0, 3);
  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    const m = members.find((x) => x.id.toUpperCase() === vaultId.trim().toUpperCase());
    setVaultOpen(!!(m && m.paid && m.verified));
  }

  const vaultList = members.filter(
    (m) =>
      (vocc === "All trades" || m.occupation === vocc) &&
      (vloc === "All towns" || m.location === vloc) &&
      (vq.trim() === "" || (m.name + " " + m.id + " " + m.skills.join(" ")).toLowerCase().includes(vq.toLowerCase()))
  );

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">BEN-BEN · THE YARD</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Welcome to the yard. The campfire is free.</h1>
          <p className="mt-4 text-muted leading-relaxed">Read everything. Say anything useful. Voting and claiming happen on Zep-Tepi, behind the seal — here, the fire is enough.</p>

          {/* JOBS TICKER */}
          <div className="mt-8 rounded-3xl border border-gold/25 bg-gold/[0.06] p-6">
            <div className="text-xs font-bold tracking-widest text-gold">JOBS TICKER · LIVE FROM ZEP-TEPI</div>
            <div className="mt-3 space-y-2 text-sm">
              {ticker.map((t) => (
                <div key={t.id} className="flex justify-between gap-3">
                  <span className="font-semibold">{t.title}</span>
                  <span className="shrink-0 font-mono text-muted">▲{t.votes}{t.pay > 0 ? ` · ${t.pay.toLocaleString()}` : ""}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRUE LEDGER VAULT */}
          <div className="mt-6 rounded-3xl bg-panel border border-gold/25 p-6">
            <div className="text-xs font-bold tracking-widest text-gold">THE LEDGER 1.254 · SEALED EYES ONLY</div>
            {!vaultOpen ? (
              <form onSubmit={unlock} className="mt-3">
                <p className="text-sm text-muted">The true roll opens for registered, paid members only. Enter your sealed ID:</p>
                <div className="mt-3 flex gap-2">
                  <input value={vaultId} onChange={(e) => setVaultId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                  <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Open →</button>
                </div>
              </form>
            ) : (
              <div className="mt-4">
                <div className="grid sm:grid-cols-[1fr_1fr_1.618fr] gap-2">
                  <select value={vocc} onChange={(e) => setVocc(e.target.value)} className={`${field} font-semibold [&>option]:bg-obsidian`}>
                    <option>All trades</option>
                    {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={vloc} onChange={(e) => setVloc(e.target.value)} className={`${field} font-semibold [&>option]:bg-obsidian`}>
                    <option>All towns</option>
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <input value={vq} onChange={(e) => setVq(e.target.value)} placeholder="Search name, ID, skill…" className={field} />
                </div>
                <div className="mt-4 grid gap-3">
                  {vaultList.map((m) => <MemberCard key={m.id} m={m} />)}
                </div>
                {vaultList.length === 0 && <p className="mt-4 text-sm text-muted">Nobody matches that yet.</p>}
              </div>
            )}
          </div>

          {/* NEW TOPIC */}
          <form onSubmit={postTopic} className="mt-6 rounded-3xl border border-white/10 bg-panel p-6">
            <div className="font-bold">Start a fire.</div>
            <input value={ttitle} onChange={(e) => setTtitle(e.target.value)} placeholder="Topic (e.g. Who fixes the borehole?)" maxLength={80} className={`${field} mt-3 w-full`} />
            <textarea value={ttext} onChange={(e) => setTtext(e.target.value)} placeholder="Two lines of context…" rows={2} maxLength={280} className={`${field} mt-2 w-full`} />
            <button className="mt-3 rounded-full bg-ivory px-6 py-2.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Light it →</button>
          </form>

          {/* THREADS */}
          <div className="mt-6 space-y-3">
            {threads.map((t) => {
              const isOpen = open === t.id;
              return (
                <article key={t.id} className="rounded-3xl border border-white/10 bg-panel p-6">
                  <button onClick={() => setOpen(isOpen ? null : t.id)} className="w-full text-left">
                    <div className="font-mono text-xs text-muted">{t.id}</div>
                    <h2 className="mt-1 text-lg font-bold">{t.title}</h2>
                    <p className="mt-1 text-sm text-muted">{t.text}</p>
                    <div className="mt-2 text-xs text-muted underline">{t.comments.length} repl{t.comments.length === 1 ? "y" : "ies"} {isOpen ? "· close" : ""}</div>
                  </button>
                  {isOpen && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="space-y-2">
                        {t.comments.map((c, i) => (
                          <div key={i} className="rounded-2xl bg-obsidian px-4 py-2.5 text-sm">
                            <span className="font-bold">{c.name}</span> <span className="text-ivory/80">{c.text}</span>
                          </div>
                        ))}
                        {t.comments.length === 0 && <p className="text-sm text-muted">Silence. The fire waits.</p>}
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
        </div>
      </div>
    </main>
  );
}
