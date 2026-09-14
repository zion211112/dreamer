"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GeoArt from "../../components/GeoArt";
import ZionChamber from "../../components/ZionChamber";
import { myUsername } from "../../lib/benben";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SUBSCRIBED_SCHOOLS,
  TREASURY,
  ledgerVersion,
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
  const field = "w-full border-b border-white/15 bg-transparent px-1 py-2.5 text-sm text-ivory outline-none transition focus:border-gold";

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
      <div className="relative mx-auto max-w-[760px] overflow-hidden px-6 py-16 md:py-24">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute -top-20 right-[-90px] h-[300px] w-[300px] text-ivory opacity-[0.05]"
        />

        {/* masthead */}
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          <span>Apt-Labs · The Roll · v{ledgerVersion(all.length)}</span>
          <span className="tabular-nums">{all.length} names · sealed</span>
        </div>

        <h1 className="mt-12 font-display text-5xl md:text-6xl tracking-tight">The roll.</h1>
        <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-7 text-muted">
          Every name on the floor of Kirinyaga who can actually do things. Verified by the
          work, sealed by hash, read out loud at the door.
        </p>

        {/* entry desk */}
        <section className="mt-12 border border-white/10 bg-panel/60 p-6 md:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">Entry desk</p>
          {mine ? (
            <div className="mt-5">
              <div className="font-display text-2xl md:text-3xl">@{mine.username}</div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {mine.id} is already yours. The roll knows you, and the floor is open.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-ivory px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold"
                >
                  My profile →
                </Link>
                <Link
                  href="/benben"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-gold"
                >
                  Open BenBen
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={startDraft} className="mt-5 grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name or handle"
                maxLength={40}
                className={field}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={regOcc}
                  onChange={(e) => setRegOcc(e.target.value)}
                  className={`${field} [&>option]:bg-obsidian`}
                >
                  {OCCUPATIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <select
                  value={regLoc}
                  onChange={(e) => setRegLoc(e.target.value)}
                  className={`${field} [&>option]:bg-obsidian`}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Top skill — the trade, not the title"
                maxLength={40}
                className={field}
              />
              <button className="mt-2 w-fit rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold">
                Claim slot →
              </button>
            </form>
          )}
          {notice && <p className="mt-4 font-mono text-xs text-emerald-300">{notice}</p>}
        </section>

        {/* the roll */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-white/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-gold">The roll · first name to last</span>
            <span className="text-dim">{all.length} entries</span>
          </div>
          <ol>
            {all.map((m, i) => (
              <li key={m.id} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-white/10 py-5">
                <span className="font-mono text-[11px] text-dim tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-xl md:text-2xl">@{m.username}</div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    {m.occupation} · {m.location}
                  </div>
                  {FOOL[m.id] && <div className="mt-1 font-display italic text-sm text-dim">{FOOL[m.id]}</div>}
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-dim">{shortHash(m.hash)}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* under one roof */}
        <section className="mt-14">
          <p className="border-b border-white/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
            Under one roof · pilot
          </p>
          <dl>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-white/10 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                Pilot schools · {rough(SCHOOL_STATS.reduce((n, s) => n + s.students, 0))} students
              </dt>
              <dd className="text-right font-display text-base text-ivory md:text-lg">
                {SUBSCRIBED_SCHOOLS.join(" · ")}
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-white/10 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Build budget</dt>
              <dd className="text-right font-mono text-sm text-ivory tabular-nums">
                KES {TREASURY.total.toLocaleString()} · {TREASURY.usedPct}% spent
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Sealed records</dt>
              <dd className="text-right font-mono text-sm text-ivory tabular-nums">{all.length}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-16 text-center">
          <button
            onClick={() => setRootOpen(true)}
            className="font-mono text-xs text-muted/50 transition hover:text-muted"
          >
            &gt;_ find the root hash
          </button>
        </div>
      </div>

      {rootOpen && <ZionChamber members={all} onClose={() => setRootOpen(false)} />}
    </main>
  );
}
