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
  seal
} from "../lib/ledger";

// JOIN THE LEDGER, one press: signup/signin pops asking for phone,
// then registers, then the test. Fail stays playground.
// Sealed members pass straight through to their dashboard.
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
  const [err, setErr] = useState("");
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState("");
  const [occ, setOcc] = useState(OCCUPATIONS[0]);
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [doneId, setDoneId] = useState("");

  function norm(p: string): string {
    return p.replace(/\D/g, "").replace(/^(254|0)/, "");
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
    try { window.localStorage.setItem(KEYS.identity, JSON.stringify({ phone: full, ts: Date.now() })); } catch { /* memory */ }
    setAuthed(true);
    setErr("");
  }

  function register(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Name first. The list needs to know who."); return; }
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
      skills: skill.trim() ? [skill.trim().slice(0, 40)] : ["General support"],
      paid: false, verified: false, tier: null, testScore: null, testTs: 0, answers: [], hash: seal(base)
    };
    const merged = [m, ...stored];
    saveStored(KEYS.members, merged);
    try { window.localStorage.setItem(KEYS.myid, id); } catch { /* memory */ }
    setDoneId(id);
  }

  function goTest() {
    setOpen(false);
    router.push("/crucible");
  }

  function goDash() {
    setOpen(false);
    router.push("/dashboard");
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <>
      <button
        onClick={() => {
          try {
            const raw = window.localStorage.getItem(KEYS.identity);
            if (raw && JSON.parse(raw).phone) {
              const myid = (window.localStorage.getItem(KEYS.myid) || "").toUpperCase();
              const stored = loadStored<Member>(KEYS.members);
              const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
              const me = myid ? [...customs, ...SEED_MEMBERS].find((m) => m.id.toUpperCase() === myid) : null;
              if (me && me.paid && me.verified) { router.push("/dashboard"); return; }
            }
          } catch { /* fall through to modal */ }
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-10 max-w-md rounded-3xl bg-panel border border-white/10 p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-river">JOIN THE LEDGER</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ivory">Phone first. Then proof.</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory" aria-label="Close">✕</button>
            </div>

            {!authed && !sent && (
              <form onSubmit={send} className="mt-5">
                <label className="text-sm font-bold text-ivory">Phone number</label>
                <div className="mt-2 flex gap-2">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 ___ ___ ___" inputMode="tel" className={`${field} flex-1`} />
                  <button className="rounded-2xl bg-ivory px-5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Send →</button>
                </div>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              </form>
            )}

            {!authed && sent && (
              <form onSubmit={confirm} className="mt-5">
                <p className="text-sm text-muted">Demo: SMS staged, code on screen.</p>
                <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.3em] text-ivory">{sent}</p>
                <div className="mt-3 flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4} className={`${field} flex-1 font-mono text-center`} />
                  <button className="rounded-2xl bg-river px-5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Enter →</button>
                </div>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              </form>
            )}

            {authed && !doneId && (
              <form onSubmit={register} className="mt-5">
                <p className="text-sm text-muted">Signed in. Now claim your slot on the list:</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. JUST A NOBODY" maxLength={40} className={`${field} mt-3 w-full`} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={occ} onChange={(e) => setOcc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={loc} onChange={(e) => setLoc(e.target.value)} className={`${field} [&>option]:bg-obsidian`}>
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Top skill (e.g. THINKING AND PROCRASTINATING)" maxLength={40} className={`${field} mt-2 w-full`} />
                <button className="mt-3 w-full rounded-full bg-ivory py-3.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Register →</button>
                {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              </form>
            )}

            {authed && doneId && (
              <div className="mt-5 rounded-2xl bg-river/15 border border-river/30 p-6 text-center">
                <p className="font-mono font-bold text-emerald-300">{doneId} penciled in.</p>
                <p className="mt-2 text-sm text-muted">Next: pay 50, pass 8, enter the halls.</p>
                <button onClick={goTest} className="mt-4 w-full rounded-full bg-river py-3.5 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">Go to the test →</button>
                <button onClick={goDash} className="mt-2 text-sm text-muted underline">or see my page →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
