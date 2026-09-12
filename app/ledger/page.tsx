"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ZionChamber from "../../components/ZionChamber";
import { myUsername } from "../../lib/benben";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SCHOOL_STATS,
  SEED_MEMBERS,
  loadStored,
  saveStored,
  seal,
  shortHash
} from "../../lib/ledger";

function useStoredList<T>(key: string, seeds: T[]): [T[], (v: T[]) => void] {
  const [list, setList] = useState<T[]>(seeds);
  useEffect(() => {
    const stored = loadStored<T>(key);
    if (stored.length > 0) setList(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [list, (v: T[]) => { setList(v); saveStored(key, v); }];
}

// The Eight keep fool titles. The trade is real; the title is the joke
// that tells the truth: every one of them can actually do things.
const FOOL: Record<string, string> = {
  "AL-0042": "Keeper of Lost Marks",
  "AL-0137": "Lantern Whisperer",
  "AL-0201": "Counter of Everything",
  "AL-0311": "Stacker of Stones",
  "AL-0420": "Drawer of Ideas",
  "AL-0488": "Mender of Uniforms",
  "AL-0513": "Asker of Hard Questions",
  "AL-0777": "Tamer of Wires"
};

function rough(n: number): string {
  return `~${(Math.round(n / 50) * 50).toLocaleString()}`;
}

export default function Ledger() {
  const [members, setMembers] = useStoredList<Member>(KEYS.members, SEED_MEMBERS);
  const [rootOpen, setRootOpen] = useState(false);
  const [me, setMe] = useState("");

  const [name, setName] = useState("");
  const [regOcc, setRegOcc] = useState(OCCUPATIONS[0]);
  const [regLoc, setRegLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMe(myUsername() || "");
  }, []);

  const all = useMemo(() => {
    const customs = members.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    return [...customs, ...SEED_MEMBERS];
  }, [members]);

  const mine = me ? all.find((m) => m.username.toLowerCase() === me.toLowerCase()) || null : null;
  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  function startDraft(e: React.FormEvent) {
    e.preventDefault();
    if (mine) { setNotice(`${mine.id} is already yours.`); return; }
    if (!name.trim()) { setNotice("Name first. The list needs to know who."); return; }
    let id = "";
    for (let i = 0; i < 20; i++) {
      const cand = "AL-" + Math.floor(1000 + Math.random() * 9000);
      if (!all.some((m) => m.id === cand)) { id = cand; break; }
    }
    if (!id) { setNotice("Try again in a moment."); return; }
    const base = { id, name: name.trim().slice(0, 40), occupation: regOcc, location: regLoc };
    const m: Member = {
      ...base,
      username: me || `Mgeni_${id.slice(3)}`,
      skills: skill.trim() ? [skill.trim().slice(0, 40)] : ["General support"],
      paid: false, verified: false, hallPaid: false, tier: null,
      testScore: null, testTs: 0, hall: null, certNo: null, answers: [], hash: seal(base)
    };
    setMembers([m, ...members]);
    try { window.localStorage.setItem(KEYS.myid, id); } catch { /* memory */ }
    setNotice(`${id} penciled in. Welcome to the floor.`);
    setName(""); setSkill("");
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <p className="text-center font-mono text-xs tracking-[0.2em] text-muted">LEDGER 1.001 · ENTRY POINT</p>

        {/* JOIN — one line if known, one form if new */}
        <div id="join" className="mt-10">
          <div className="text-center text-xs font-bold tracking-widest text-gold">JOIN THE LEDGER ·</div>
          {mine ? (
            <div className="mt-4 text-center">
              <p className="font-display text-2xl md:text-3xl">Welcome back, @{mine.username}.</p>
{!mine.paid ? (
                  <Link href="/zep-tepi/gate" className="mt-6 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">
                    Get certified →
                  </Link>
                ) : (
                <Link href="/dashboard" className="mt-6 inline-block rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold hover:border-gold transition">
                  Dashboard →
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={startDraft} className="mx-auto mt-6 max-w-md">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name or handle" maxLength={40} className={`${field} w-full text-center`} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select value={regOcc} onChange={(e) => setRegOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                  {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <select value={regLoc} onChange={(e) => setRegLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. THINKING AND PROCRASTINATING)" maxLength={40} className={`${field} mt-2 w-full text-center`} />
              <button className="mt-4 w-full rounded-full bg-ivory py-3.5 text-sm font-semibold text-black hover:bg-gold transition">Claim slot →</button>
            </form>
          )}
          {notice && <p className="mt-4 text-center text-sm text-muted">{notice}</p>}
        </div>

        {/* PILOT SCHOOLS — central snapshot */}
        <section className="mt-20 md:mt-28">
          <p className="text-center text-xs font-bold tracking-widest text-muted">ONE SCHOOL · PILOT</p>
          <div className="mt-6">
            {SCHOOL_STATS.slice(0, 1).map((s) => (
              <div key={s.name} className="flex items-baseline justify-between gap-4 border-b border-white/10 py-5">
                <span className="font-display text-xl md:text-2xl">{s.name}</span>
                <span className="shrink-0 font-mono text-sm text-muted">{rough(s.students)} students</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-5">
              <span className="font-mono text-xs tracking-widest text-muted">UNDER ONE ROOF</span>
              <span className="font-display text-2xl md:text-3xl text-gold">{rough(SCHOOL_STATS[0].students)}</span>
            </div>
          </div>
        </section>

        {/* THE EIGHT — admins of the roll */}
        <section className="mt-20 md:mt-28">
          <p className="text-center text-xs font-bold tracking-widest text-muted">FIRST NAME · THE ROLL BEGINS</p>
          <ol className="mt-6">
            {SEED_MEMBERS.slice(0, 1).map((m, i) => (
              <li key={m.id} className="flex items-baseline gap-4 border-b border-white/10 py-5 md:gap-6">
                <span className="shrink-0 font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xl md:text-2xl">@{m.username}</div>
                  <div className="mt-0.5 font-display italic text-base text-ivory/75">{FOOL[m.id] || m.occupation}</div>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] leading-relaxed text-muted">
                  <div>{m.occupation} · {m.location}</div>
                  <div className="text-dim">{shortHash(m.hash)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-16 text-center">
          <button onClick={() => setRootOpen(true)} className="font-mono text-xs text-muted/50 hover:text-muted transition">
            &gt;_ find the root hash
          </button>
        </div>
      </div>

      {rootOpen && <ZionChamber members={all} onClose={() => setRootOpen(false)} />}
    </main>
  );
}
