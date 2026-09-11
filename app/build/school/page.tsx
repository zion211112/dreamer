"use client";

import Link from "next/link";
import { useState } from "react";
import { SCHOOL_FEE, SUBSCRIBED_SCHOOLS, isMpesaCode } from "../../../lib/ledger";

export default function School({ searchParams }: { searchParams: { type?: string } }) {
  const type = searchParams.type === "private" ? "Private" : "Public";
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setMsg("School name first."); return; }
    if (!isMpesaCode(code)) { setMsg("M-Pesa code should be 10 letters/numbers."); return; }
    try { window.localStorage.setItem("aptlabs-school-sub", JSON.stringify({ name: name.trim(), type, ts: Date.now() })); } catch { /* memory */ }
    setMsg(`${name.trim()} (${type}) subscribed. The console is open.`);
    setName(""); setCode("");
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:ring-emerald-500 transition";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-24 md:py-32 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-400">{type.toUpperCase()} SCHOOL DOOR ·</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold leading-tight">Access the collective.</h1>
        <form onSubmit={subscribe} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-left">
          <div className="font-bold">Subscribe the school — {SCHOOL_FEE}</div>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="School name" maxLength={60} className={field} />
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code" maxLength={10} className={`${field} font-mono uppercase`} />
          </div>
          <button className="mt-3 w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-black hover:bg-ivory transition">Subscribe →</button>
          {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        </form>
        <Link href="/school" className="mt-6 inline-block rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold hover:ring-emerald-500 transition">
          Enter the console →
        </Link>
        <p className="mt-6 text-xs text-muted">On the list: {SUBSCRIBED_SCHOOLS.join(" · ")}</p>
      </div>
    </main>
  );
}