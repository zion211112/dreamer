"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GeoArt from "../../components/GeoArt";
import ZionChamber from "../../components/ZionChamber";
import { myUsername } from "../../lib/benben";
import {
  CERT_FEE,
  HALL_FEE,
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SEED_MEMBERS,
  loadStored,
  saveStored,
  seal
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

export default function Ledger() {
  const [members, setMembers] = useStoredList<Member>(KEYS.members, SEED_MEMBERS);
  const [rootOpen, setRootOpen] = useState(false);
  const [me, setMe] = useState("");

  const [name, setName] = useState("");
  const [regOcc, setRegOcc] = useState(OCCUPATIONS[0]);
  const [regLoc, setRegLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [notice, setNotice] = useState("");

  const [vid, setVid] = useState("");
  const [vresult, setVresult] = useState<null | { ok: boolean; m: Member }>(null);

  useEffect(() => {
    setMe(myUsername() || "");
  }, []);

  const all = useMemo(() => {
    const customs = members.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    return [...customs, ...SEED_MEMBERS];
  }, [members]);

  const mine = me ? all.find((m) => m.username.toLowerCase() === me.toLowerCase()) || null : null;

  function startDraft(e: React.FormEvent) {
    e.preventDefault();
    if (mine) { setNotice(`${mine.id} is already yours. The crucible or the certificate decides the rest.`); return; }
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
    setNotice(`${id} penciled in — playground for now. Certification is ${CERT_FEE}, halls are ${HALL_FEE} plus the test.`);
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

  const sealedCount = all.filter((m) => m.verified).length;
  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">LEDGER 1.254 · ENTRY POINT</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Who can do what, where.</h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            {all.length} on the list · {sealedCount} certified. Playground is free: browse, post, comment.
            Certification ({CERT_FEE}) seals your name and unlocks voting. Halls ({HALL_FEE} + test) unlock work and funds.
          </p>

          {/* JOIN */}
          <div id="join" className="mt-10 rounded-3xl border border-white/10 bg-panel p-7 md:p-9">
            <div className="text-xs font-bold tracking-widest text-gold">JOIN THE LEDGER · FREE TO ENTER</div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold tracking-tight">
              {mine ? `Welcome back, @${mine.username}.` : "Claim a slot. The floor is free."}
            </h2>

            {!mine && (
              <form onSubmit={startDraft} className="mt-5">
                <div className="text-sm font-bold">Signing in as <span className="font-mono text-gold">@{me || "…"}</span> — this slot carries that name.</div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name or handle" maxLength={40} className={`${field} mt-3 w-full`} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={regOcc} onChange={(e) => setRegOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={regLoc} onChange={(e) => setRegLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. THINKING AND PROCRASTINATING)" maxLength={40} className={`${field} mt-2 w-full`} />
                <button className="mt-3 rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-black hover:bg-gold transition">Claim slot →</button>
              </form>
            )}

            {mine && !mine.paid && (
              <div className="mt-5 rounded-2xl bg-obsidian border border-white/10 p-6">
                <div className="text-sm font-bold">Next: certification ({mine.id})</div>
                <p className="mt-1 text-sm text-muted">{CERT_FEE}, no test. Seal your name, unlock voting, download the certificate.</p>
                <Link href="/cert" className="mt-4 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">
                  Get certified →
                </Link>
              </div>
            )}

            {mine && mine.paid && !mine.hall && (
              <div className="mt-5 rounded-2xl bg-obsidian border border-white/10 p-6">
                <div className="text-sm font-bold">Next: the halls ({mine.id})</div>
                <p className="mt-1 text-sm text-muted">{HALL_FEE} + eight questions. Pass enters one hall — and the bank-facing weight that comes with it.</p>
                <Link href="/crucible" className="mt-4 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">
                  Face the examination →
                </Link>
              </div>
            )}

            {mine && mine.hall && (
              <div className="mt-5 rounded-2xl bg-gold/10 border border-gold/30 p-6 text-sm font-semibold text-gold">
                {mine.id} · {mine.hall}. <a href="/benben/jobs" className="underline">Take work →</a> · <a href="/dashboard" className="underline">Dashboard →</a>
              </div>
            )}

            {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}
          </div>

          {/* VERIFY */}
          <div className="mt-6 rounded-3xl bg-panel border border-white/10 p-7 md:p-9">
            <div className="text-xs font-bold tracking-widest text-muted">VERIFY ·</div>
            <h2 className="mt-2 font-display italic text-2xl md:text-3xl">Lose your certificate? We kept the hash.</h2>
            <form onSubmit={verify} className="mt-5 flex gap-2">
              <input value={vid} onChange={(e) => setVid(e.target.value)} placeholder="Enter member ID (e.g. AL-0042)" className={`${field} flex-1`} />
              <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Check</button>
            </form>
            {vresult && (
              <div className="mt-4 rounded-2xl bg-obsidian border border-white/10 p-5 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">{vresult.m.name} · {vresult.m.id}</span>
                  <span className={vresult.ok ? "text-emerald-300 font-bold" : "text-red-400 font-bold"}>
                    {vresult.ok ? "✓ MATCH" : "✗ MISMATCH"}
                  </span>
                </div>
                <div className="mt-1 text-muted">{vresult.m.occupation} · {vresult.m.location}</div>
                <div className="mt-2 font-mono text-xs text-muted break-all">hash {vresult.m.hash}</div>
                <p className="mt-2 text-muted text-[13px]">
                  {vresult.ok ? "Record recomputed and identical. Intact." : "Record does not match its seal. Flagged."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <button onClick={() => setRootOpen(true)} className="font-mono text-xs text-muted/50 hover:text-muted transition">
              &gt;_ find the root hash
            </button>
          </div>
        </div>
      </div>

      {rootOpen && <ZionChamber members={all} onClose={() => setRootOpen(false)} />}
    </main>
  );
}
