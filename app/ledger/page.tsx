"use client";

import { useEffect, useMemo, useState } from "react";
import RootAccess from "../../components/RootAccess";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
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

function MemberCard({ m }: { m: Member }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold">{m.id}</span>
        {m.verified ? (
          <span className="rounded-full bg-river/10 px-3 py-1 font-semibold text-river">● VERIFIED</span>
        ) : (
          <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-[#8a6d00]">○ PENDING</span>
        )}
      </div>
      <div className="mt-3 text-xl font-bold">{m.name}</div>
      <div className="mt-1 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full bg-cream border border-black/10 px-3 py-1 font-semibold">{m.occupation}</span>
        <span className="rounded-full bg-cream border border-black/10 px-3 py-1 text-muted">{m.location}</span>
      </div>
      <div className="mt-3 text-[13px] text-muted">{m.skills.join(" · ")}</div>
      <div className="mt-3 font-mono text-xs text-muted">hash {shortHash(m.hash)}</div>
    </div>
  );
}

export default function Ledger() {
  const [members, setMembers] = useStoredList<Member>(KEYS.members, SEED_MEMBERS);
  const [occ, setOcc] = useState("All trades");
  const [loc, setLoc] = useState("All towns");
  const [q, setQ] = useState("");
  const [rootOpen, setRootOpen] = useState(false);

  const [name, setName] = useState("");
  const [regOcc, setRegOcc] = useState(OCCUPATIONS[0]);
  const [regLoc, setRegLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [notice, setNotice] = useState("");

  const [vid, setVid] = useState("");
  const [vresult, setVresult] = useState<null | { ok: boolean; m: Member }>(null);

  const all = useMemo(() => {
    const customs = members.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    return [...customs, ...SEED_MEMBERS];
  }, [members]);

  const filtered = all.filter(
    (m) =>
      (occ === "All trades" || m.occupation === occ) &&
      (loc === "All towns" || m.location === loc) &&
      (q.trim() === "" ||
        (m.name + " " + m.id + " " + m.skills.join(" ")).toLowerCase().includes(q.toLowerCase()))
  );

  function onSearch(v: string) {
    if (v.trim().toLowerCase() === "root") {
      setQ("");
      setRootOpen(true);
      return;
    }
    setQ(v);
  }

  function register(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) { setNotice("Add your name first."); return; }
    let id = "";
    for (let i = 0; i < 20; i++) {
      const cand = "AL-" + Math.floor(1000 + Math.random() * 9000);
      if (!all.some((m) => m.id === cand)) { id = cand; break; }
    }
    if (!id) { setNotice("Try again in a moment."); return; }
    const base = { id, name: n, occupation: regOcc, location: regLoc };
    const m: Member = {
      ...base,
      skills: skill.trim() ? [skill.trim()] : ["General support"],
      verified: false,
      hash: seal(base)
    };
    setMembers([m, ...members]);
    setNotice(`${id} registered as PENDING. Verification next — then tasks.`);
    setName(""); setSkill("");
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    const id = vid.trim().toUpperCase();
    const m = all.find((x) => x.id.toUpperCase() === id);
    if (!m) { setVresult(null); setNotice(`No record for ${vid.trim() || "that ID"}. Check the ID and try again.`); return; }
    setNotice("");
    setVresult({ ok: seal(m) === m.hash, m });
  }

  const verifiedCount = all.filter((m) => m.verified).length;

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-xs font-bold tracking-widest text-river">THE LEDGER · THE ENTRY POINT</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Who can do what, where.</h1>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          {all.length} registered · {verifiedCount} verified · {OCCUPATIONS.length} trades.
          Claim your capability, get sealed — then tasks, schools and work open from here.
          Jobs are one piece. This is the door.
        </p>

        {/* SEARCH */}
        <div className="mt-8 grid sm:grid-cols-[1fr_1fr_1.618fr] gap-3">
          <select value={occ} onChange={(e) => setOcc(e.target.value)} className="rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm font-semibold outline-none focus:border-river">
            <option>All trades</option>
            {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm font-semibold outline-none focus:border-river">
            <option>All towns</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, ID, skill…" className="rounded-2xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-river" />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => <MemberCard key={m.id} m={m} />)}
        </div>
        {filtered.length === 0 && (
          <p className="mt-6 rounded-2xl bg-cream border border-black/10 p-6 text-sm text-muted">
            Nobody matches that yet. Register below — or post the work at <a href="/work#hire" className="underline">/work</a> and someone will.
          </p>
        )}

        {/* REGISTER */}
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <form onSubmit={register} className="rounded-3xl border border-black/10 bg-cream p-7">
            <div className="text-xs font-bold tracking-widest text-river">YOUTH · VERIFY YOUR CAPABILITY</div>
            <h2 className="mt-2 text-2xl font-bold">Register. Then work.</h2>
            <p className="mt-1 text-sm text-muted">Registration is a work commitment — registered members take tasks.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={40} className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select value={regOcc} onChange={(e) => setRegOcc(e.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river">
                {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select value={regLoc} onChange={(e) => setRegLoc(e.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river">
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. KCSE Physics)" maxLength={40} className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river" />
            <button className="mt-3 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-white hover:bg-river transition">Register →</button>
            {notice && <p className="mt-3 text-sm text-muted">{notice}</p>}
          </form>

          {/* VERIFY */}
          <div id="verify" className="rounded-3xl bg-ink text-white p-7">
            <div className="text-xs font-bold tracking-widest text-white/50">VERIFY · PROOF</div>
            <h2 className="mt-2 font-display italic text-2xl md:text-3xl">Lose your certificate? We kept the hash.</h2>
            <form onSubmit={verify} className="mt-5 flex gap-2">
              <input value={vid} onChange={(e) => setVid(e.target.value)} placeholder="Enter member ID (e.g. AL-0042)" className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-river" />
              <button className="rounded-2xl bg-river px-6 text-sm font-semibold hover:bg-white hover:text-ink transition">Check</button>
            </form>
            {vresult && (
              <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 p-5 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">{vresult.m.name} · {vresult.m.id}</span>
                  <span className={vresult.ok ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                    {vresult.ok ? "✓ MATCH" : "✗ MISMATCH"}
                  </span>
                </div>
                <div className="mt-1 text-white/60">{vresult.m.occupation} · {vresult.m.location}</div>
                <div className="mt-2 font-mono text-xs text-white/60 break-all">hash {vresult.m.hash}</div>
                <p className="mt-2 text-white/60 text-[13px]">
                  {vresult.ok ? "Record recomputed and identical. Intact." : "Record does not match its seal. Flagged."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 text-center">
          <button onClick={() => setRootOpen(true)} className="font-mono text-xs text-muted/50 hover:text-muted transition">
            &gt;_ find the root hash
          </button>
        </div>
      </div>

      {rootOpen && <RootAccess members={all} onClose={() => setRootOpen(false)} />}
    </main>
  );
}
