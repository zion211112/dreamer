"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../lib/ledger";

const PUBLIC_PATHS = ["/", "/contact"];

// Visitors see the landing and contacts. Everything else needs one OTP.
export function Gate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_PATHS.some((p) => pathname === p)) return <>{children}</>;
  return <AuthGate>{children}</AuthGate>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sent, setSent] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEYS.identity);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.phone) setPhone(p.phone);
      }
    } catch { /* behind glass, then */ }
  }, []);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const digits = input.replace(/\D/g, "").replace(/^(254|0)/, "");
    if (digits.length !== 9) { setErr("Enter a Kenyan number: 07… or +254…"); return; }
    setErr("");
    // Demo OTP: SMS staged. The code shows on screen — production sends it.
    setSent(String(Math.floor(1000 + Math.random() * 9000)));
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() !== sent) { setErr("Wrong code. Check and try again."); return; }
    const full = "+254" + input.replace(/\D/g, "").replace(/^(254|0)/, "");
    try { window.localStorage.setItem(KEYS.identity, JSON.stringify({ phone: full, ts: Date.now() })); } catch { /* memory */ }
    setPhone(full);
  }

  if (phone) return <>{children}</>;

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted">APT-LABS · MEMBERS&apos; GATE</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">The list is behind glass.</h1>
        <p className="mt-3 text-muted">Visitors get the porch and the contacts. Members get the machine. One code, no passwords.</p>
        {!sent ? (
          <form onSubmit={send} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <label className="text-sm font-bold">Phone number</label>
            <div className="mt-2 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="+254 ___ ___ ___" inputMode="tel" className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river" />
              <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Send →</button>
            </div>
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
          </form>
        ) : (
          <form onSubmit={confirm} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <p className="text-sm text-muted">Demo: SMS staged, so the code shows here. Production texts it.</p>
            <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.3em]">{sent}</p>
            <div className="mt-4 flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-center text-ivory outline-none focus:border-river" />
              <button className="rounded-2xl bg-river px-6 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Enter →</button>
            </div>
            {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
            <button type="button" onClick={() => { setSent(""); setCode(""); }} className="mt-3 text-xs text-muted underline">Wrong number? Start over.</button>
          </form>
        )}
      </div>
    </main>
  );
}
