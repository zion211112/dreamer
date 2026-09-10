"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GeoArt from "../../components/GeoArt";
import ZionChamber from "../../components/ZionChamber";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SEED_MEMBERS,
  TEST_FEE,
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
    <div className="rounded-3xl border border-white/10 bg-panel p-6">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-ivory">{m.id}</span>
        {m.verified ? (
          <span className="rounded-full bg-river/15 px-3 py-1 font-semibold text-emerald-300">● SEALED{m.tier ? ` · ${m.tier.toUpperCase()}` : ""}</span>
        ) : m.paid ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold">● PAID · UNSEALED</span>
        ) : (
          <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-muted">○ PLAYGROUND</span>
        )}
      </div>
      <div className="mt-3 text-xl font-bold text-ivory">{m.name}</div>
      <div className="mt-1 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full bg-obsidian border border-white/10 px-3 py-1 font-semibold text-ivory">{m.occupation}</span>
        <span className="rounded-full bg-obsidian border border-white/10 px-3 py-1 text-muted">{m.location}</span>
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
  const [draftId, setDraftId] = useState("");
  const [notice, setNotice] = useState("");

  const [vid, setVid] = useState("");
  const [vresult, setVresult] = useState<null | { ok: boolean; m: Member }>(null);

  const all = useMemo(() => {
    const customs = members.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    return [...customs, ...SEED_MEMBERS];
  }, [members]);

  const draft = all.find((m) => m.id === draftId) || null;

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

  function startDraft(e: React.FormEvent) {
    e.preventDefault();
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
      skills: skill.trim() ? [skill.trim().slice(0, 40)] : ["General support"],
      paid: false, verified: false, tier: null, testScore: null, testTs: 0, answers: [], hash: seal(base)
    };
    setMembers([m, ...members]);
    setDraftId(id);
    setNotice(`${id} penciled in — playground for now. The crucible decides the rest.`);
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
  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">THE LEDGER · THE ENTRY POINT</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Who can do what, where.</h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            {all.length} on the list · {sealedCount} sealed.
            Unpaid? The playground: browse everything, comment anywhere — no seal, no vote, no jobs.
            Only paid, verified names join the ledger proper.
          </p>

          {/* SEARCH */}
          <div className="mt-8 grid sm:grid-cols-[1fr_1fr_1.618fr] gap-3">
            <select value={occ} onChange={(e) => setOcc(e.target.value)} className={`${field} font-semibold [&>option]:bg-obsidian`}>
              <option>All trades</option>
              {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <select value={loc} onChange={(e) => setLoc(e.target.value)} className={`${field} font-semibold [&>option]:bg-obsidian`}>
              <option>All towns</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, ID, skill…" className={field} />
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => <MemberCard key={m.id} m={m} />)}
          </div>
          {filtered.length === 0 && (
            <p className="mt-6 rounded-2xl bg-panel border border-white/10 p-6 text-sm text-muted">
              Nobody matches that yet. Get on the list below — or post the work at <a href="/work#hire" className="underline">/work</a> and someone will.
            </p>
          )}

          {/* JOIN */}
          <div id="join" className="mt-14 rounded-3xl border border-white/10 bg-panel p-7 md:p-9">
            <div className="text-xs font-bold tracking-widest text-river">JOIN THE LEDGER · {TEST_FEE} TEST FEE</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Claim a slot. Face the crucible.</h2>

            {!draft && (
              <form onSubmit={startDraft} className="mt-5">
                <div className="text-sm font-bold">Step 1 — claim your slot</div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name or handle" maxLength={40} className={`${field} mt-2 w-full`} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={regOcc} onChange={(e) => setRegOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={regLoc} onChange={(e) => setRegLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. KCSE Physics)" maxLength={40} className={`${field} mt-2 w-full`} />
                <button className="mt-3 rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Claim slot →</button>
              </form>
            )}

            {draft && !draft.verified && (
              <div className="mt-5 rounded-2xl bg-obsidian border border-white/10 p-6">
                <div className="text-sm font-bold">Step 2 — the crucible ({draft.id})</div>
                <p className="mt-1 text-sm text-muted">Pay {TEST_FEE}, answer eight questions, get scored. Pass enters the halls. Fail stays in the playground. There is no other door.</p>
                <Link href="/crucible" className="mt-4 inline-block rounded-full bg-river px-8 py-3.5 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">
                  Face the crucible →
                </Link>
              </div>
            )}

            {draft && draft.verified && (
              <div className="mt-5 rounded-2xl bg-river/15 border border-river/30 p-6 text-sm font-semibold text-emerald-300">
                {draft.id} sealed{draft.tier ? ` · ${draft.tier}` : ""}. <a href="/halls" className="underline">Enter the halls →</a> · <a href="/work" className="underline">Take work →</a> · <a href="/dashboard" className="underline">Dashboard →</a>
              </div>
            )}

            {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}
          </div>

          {/* CERTIFICATE CHECK */}
          <div id="verify" className="mt-6 rounded-3xl bg-panel border border-white/10 p-7 md:p-9">
            <div className="text-xs font-bold tracking-widest text-muted">VERIFY · PROOF</div>
            <h2 className="mt-2 font-display italic text-2xl md:text-3xl">Lose your certificate? We kept the hash.</h2>
            <form onSubmit={verify} className="mt-5 flex gap-2">
              <input value={vid} onChange={(e) => setVid(e.target.value)} placeholder="Enter member ID (e.g. AL-0042)" className={`${field} flex-1`} />
              <button className="rounded-2xl bg-river px-6 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Check</button>
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
