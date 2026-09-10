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

const PUBLIC_PATHS = ["/", "/contact"];
const PUBLIC_PREFIXES = ["/verify/"];

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
  return names;
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
        <p className="font-mono text-xs tracking-[0.2em] text-muted">APT-LABS · MEMBERS&apos; GATE</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">The list is behind glass.</h1>
        <p className="mt-3 text-muted">Visitors keep the porch and the contacts. Members get the machine. One code, one name, no passwords. Your number is checked at the door and never shown inside.</p>
        {!sent ? (
          <form onSubmit={send} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
            <label className="text-sm font-bold">Phone number</label>
            <div className="mt-2 flex gap-2">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 ___ ___ ___" inputMode="tel" className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
              <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-gold hover:text-black transition">Send →</button>
            </div>
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
          </form>
        ) : !confirmed ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
            <form onSubmit={confirm}>
              <p className="text-sm text-muted">Demo: SMS staged, so the code shows here. Production texts it.</p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.3em]">{sent}</p>
              <div className="mt-4 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-center text-ivory outline-none focus:border-gold" />
                <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Enter →</button>
              </div>
              {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            </form>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
            <form onSubmit={claim}>
              <label className="text-sm font-bold">Your username <span className="font-normal text-muted">— set it, or take the yard&apos;s suggestion</span></label>
              <div className="mt-2 flex gap-2">
                <input value={uname} onChange={(e) => setUname(e.target.value)} placeholder="e.g. Jirani_4821" maxLength={20} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-ivory outline-none focus:border-gold" />
                <button type="button" onClick={() => setUname(suggestUsername(takenUsernames()))} className="rounded-2xl border border-white/20 px-4 text-sm font-semibold hover:border-gold transition">Suggest</button>
              </div>
              <button className="mt-3 w-full rounded-full bg-ivory py-3.5 text-sm font-semibold text-black hover:bg-gold hover:text-black transition">Claim name →</button>
              {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
              <p className="mt-3 text-xs text-muted">Names are public. Numbers never are — nothing here can be scraped for contacts.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
