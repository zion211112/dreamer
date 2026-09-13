"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_NAMES,
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored,
  suggestUsername,
  validUsername
} from "../lib/ledger";
import { RESERVED_HANDLES } from "../lib/halls";

const PUBLIC_PATHS = ["/", "/contact"];
const PUBLIC_PREFIXES: string[] = [];

export type Identity = { phone: string; username: string; ts: number };

export function readIdentity(): Identity | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEYS.identity);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.phone && p.username) return p as Identity;
    return null;
  } catch {
    return null;
  }
}

// Visitors see the landing and contacts. Everything else needs one OTP
// plus a username. Phones are checked at the door and never shown inside.
export function Gate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_PATHS.some((p) => pathname === p)) return <>{children}</>;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return <>{children}</>;
  return <AuthGate>{children}</AuthGate>;
}

function takenUsernames(): string[] {
  const names = SEED_MEMBERS.map((m) => m.username);
  try {
    const stored = loadStored<Member>(KEYS.members);
    stored.forEach((m) => { if (m.username) names.push(m.username); });
    const raw = window.localStorage.getItem(KEYS.identity);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.username) names.push(p.username);
    }
  } catch { /* the yard is quiet */ }
  return [...names, ...RESERVED_HANDLES];
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState("");
  const [code, setCode] = useState("");
  const [uname, setUname] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setMe(readIdentity());
    setReady(true);
  }, []);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^(254|0)/, "");
    if (digits.length !== 9) { setErr("Enter a Kenyan number: 07… or +254…"); return; }
    setErr("");
    setSent(String(Math.floor(1000 + Math.random() * 9000)));
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() !== sent) { setErr("Wrong code. Check and try again."); return; }
    const full = "+254" + phone.replace(/\D/g, "").replace(/^(254|0)/, "");
    try { window.localStorage.setItem(KEYS.identity, JSON.stringify({ phone: full, username: "", ts: Date.now() })); } catch { /* memory */ }
    setUname(suggestUsername(takenUsernames()));
    setConfirmed(true);
    setErr("");
  }

  function claim(e: React.FormEvent) {
    e.preventDefault();
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEYS.identity) : null;
    if (!raw) { setErr("Start over — the code expired."); setSent(""); return; }
    const bad = validUsername(uname, takenUsernames());
    if (bad) { setErr(bad); return; }
    const clean = uname.trim().replace(/^@/, "");
    try {
      const p = JSON.parse(raw);
      const id: Identity = { phone: p.phone, username: clean, ts: Date.now() };
      window.localStorage.setItem(KEYS.identity, JSON.stringify(id));
      setMe(id);
    } catch { setErr("Start over — the code expired."); setSent(""); }
  }

  if (!ready) return <main className="bg-obsidian min-h-screen" />;
  if (me) return <>{children}</>;

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-300">APT-LABS · ZEPTEPI</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ivory">Member access</h1>
        <p className="mt-3 text-sm text-muted">Phone number or Gmail. One code, one profile, no passwords.</p>

        {!sent ? (
          <form onSubmit={send} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <label className="text-sm font-bold text-ivory">Phone or Gmail</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 ___ ___ ___ or name@gmail.com" inputMode="email" className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-emerald-400" />
            <button className="mt-4 w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition">Send code →</button>
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
          </form>
        ) : !confirmed ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
            <form onSubmit={confirm}>
              <p className="text-sm text-muted">We sent a verification code.</p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.3em] text-ivory">{sent}</p>
              <div className="mt-4 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-center text-ivory outline-none focus:border-emerald-400" />
                <button className="rounded-2xl bg-emerald-500 px-6 text-sm font-bold text-black hover:bg-emerald-400 transition">Enter →</button>
              </div>
              {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            </form>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
            <form onSubmit={claim}>
              <label className="text-sm font-bold text-ivory">Your username</label>
              <div className="mt-2 flex gap-2">
                <input value={uname} onChange={(e) => setUname(e.target.value)} placeholder="e.g. Jirani_4821" maxLength={20} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-ivory outline-none focus:border-emerald-400" />
                <button type="button" onClick={() => setUname(suggestUsername(takenUsernames()))} className="rounded-2xl border border-white/20 px-4 text-sm font-semibold hover:border-emerald-400 transition">Suggest</button>
              </div>
              <button className="mt-3 w-full rounded-full bg-ivory py-3.5 text-sm font-semibold text-black hover:bg-emerald-400 transition">Claim name →</button>
              {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
