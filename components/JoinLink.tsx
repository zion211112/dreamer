"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SEED_MEMBERS,
  loadStored,
  saveStored,
  seal,
  suggestUsername,
  validUsername
} from "../lib/ledger";

// JOIN THE LEDGER, one press: phone → username → slot → playground.
// No test at the door. Certification (50) and halls (100) come later,
// when the yard has shown you why they're worth it.
export default function JoinLink({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState("");
  const [code, setCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [uname, setUname] = useState("");
  const [name, setName] = useState("");
  const [occ, setOcc] = useState(OCCUPATIONS[0]);
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState("");

  function norm(p: string): string {
    return p.replace(/\D/g, "").replace(/^(254|0)/, "");
  }

  function taken(): string[] {
    const names = SEED_MEMBERS.map((m) => m.username);
    try {
      loadStored<Member>(KEYS.members).forEach((m) => { if (m.username) names.push(m.username); });
      const raw = window.localStorage.getItem(KEYS.identity);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.username) names.push(p.username);
      }
    } catch { /* quiet yard */ }
    return names;
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (norm(phone).length !== 9) { setErr("Enter a Kenyan number: 07… or +254…"); return; }
    setErr("");
    setSent(String(Math.floor(1000 + Math.random() * 9000)));
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() !== sent) { setErr("Wrong code. Check and try again."); return; }
    const full = "+254" + norm(phone);
    try { window.localStorage.setItem(KEYS.identity, JSON.stringify({ phone: full, username: "", ts: Date.now() })); } catch { /* memory */ }
    setUname(suggestUsername(taken()));
    setConfirmed(true);
    setErr("");
  }

  function register(e: React.FormEvent) {
    e.preventDefault();
    const bad = validUsername(uname, taken());
    if (bad) { setErr(bad); return; }
    if (!name.trim()) { setErr("Name first. The list needs to know who."); return; }
    const clean = uname.trim().replace(/^@/, "");
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const all = [...customs, ...SEED_MEMBERS];
    let id = "";
    for (let i = 0; i < 20; i++) {
      const cand = "AL-" + Math.floor(1000 + Math.random() * 9000);
      if (!all.some((m) => m.id === cand)) { id = cand; break; }
    }
    if (!id) { setErr("Try again in a moment."); return; }
    const base = { id, name: name.trim().slice(0, 40), occupation: occ, location: loc };
    const m: Member = {
      ...base,
      username: clean,
      skills: skill.trim() ? [skill.trim().slice(0, 40)] : ["General support"],
      paid: false, verified: false, hallPaid: false, tier: null,
      testScore: null, testTs: 0, hall: null, certNo: null, answers: [], hash: seal(base)
    };
    saveStored(KEYS.members, [m, ...stored]);
    try {
      window.localStorage.setItem(KEYS.myid, id);
      const raw = window.localStorage.getItem(KEYS.identity);
      if (raw) {
        const p = JSON.parse(raw);
        window.localStorage.setItem(KEYS.identity, JSON.stringify({ ...p, username: clean }));
      }
    } catch { /* memory */ }
    setDoneId(id);
  }

  function goFloor() {
    setOpen(false);
    router.push("/benben");
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-10 max-w-md rounded-3xl bg-panel border border-white/10 p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-gold">JOIN THE LEDGER</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ivory">Phone. Name. Floor.</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory" aria-label="Close">✕</button>
            </div>

            {!sent && (
              <form onSubmit={send} className="mt-5">
                <label className="text-sm font-bold text-ivory">Phone number</label>
                <div className="mt-2 flex gap-2">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 ___ ___ ___" inputMode="tel" className={`${field} flex-1`} />
                  <button className="rounded-2xl bg-ivory px-5 text-sm font-semibold text-black hover:bg-gold transition">Send →</button>
                </div>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
                <p className="mt-3 text-xs text-muted">Checked at the door, never shown inside. Nothing here can be scraped for contacts.</p>
              </form>
            )}

            {sent && !confirmed && (
              <form onSubmit={confirm} className="mt-5">
                <p className="text-sm text-muted">Demo: SMS staged, code on screen.</p>
                <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.3em] text-ivory">{sent}</p>
                <div className="mt-3 flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4} className={`${field} flex-1 font-mono text-center`} />
                  <button className="rounded-2xl bg-gold px-5 text-sm font-bold text-black hover:bg-ivory transition">Enter →</button>
                </div>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              </form>
            )}

            {confirmed && !doneId && (
              <form onSubmit={register} className="mt-5">
                <label className="text-sm font-bold text-ivory">Username <span className="font-normal text-muted">— yours, or the yard&apos;s</span></label>
                <div className="mt-2 flex gap-2">
                  <input value={uname} onChange={(e) => setUname(e.target.value)} placeholder="e.g. Jirani_4821" maxLength={20} className={`${field} flex-1 font-mono`} />
                  <button type="button" onClick={() => setUname(suggestUsername(taken()))} className="rounded-2xl border border-white/20 px-4 text-sm font-semibold hover:border-gold transition">Suggest</button>
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name or handle" maxLength={40} className={`${field} mt-2 w-full`} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={occ} onChange={(e) => setOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={loc} onChange={(e) => setLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. THINKING AND PROCRASTINATING)" maxLength={40} className={`${field} mt-2 w-full`} />
                <button className="mt-3 w-full rounded-full bg-gold py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Enter the playground →</button>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              </form>
            )}

            {confirmed && doneId && (
              <div className="mt-5 rounded-2xl bg-gold/10 border border-gold/30 p-6 text-center">
                <p className="font-mono font-bold text-gold">{doneId} — you&apos;re on the floor.</p>
                <p className="mt-2 text-sm text-muted">Playground&apos;s open: read, post, comment. Certification (50) and halls (100) when you&apos;re ready.</p>
                <button onClick={goFloor} className="mt-4 w-full rounded-full bg-gold py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Enter BenBen →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
