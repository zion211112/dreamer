"use client";

import { useState } from "react";

export default function School({ searchParams }: { searchParams: { type?: string } }) {
  const type = searchParams.type === "private" ? "Private" : "Public";
  const [identity, setIdentity] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!identity.trim()) return;
    setSent(true);
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-24 md:py-32 text-center relative">
        <div className="rounded-[32px] border border-white/10 bg-panel p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <p className="font-mono text-xs tracking-[0.22em] text-emerald-300">{type.toUpperCase()} SCHOOL GATE</p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold leading-tight text-ivory">School access</h1>
          <p className="mt-3 text-sm text-muted">Use a direct phone number or school Gmail to enter the console.</p>

          <form onSubmit={submit} className="mt-8 text-left">
            <label className="block text-sm font-bold text-ivory">Phone or Gmail</label>
            <input
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="+254 ___ ___ ___ or school@gmail.com"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-emerald-400"
            />

            {sent && (
              <>
                <label className="mt-5 block text-sm font-bold text-ivory">Verification code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="4-digit code"
                  maxLength={4}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-ivory outline-none focus:border-emerald-400"
                />
              </>
            )}

            <button className="mt-5 w-full rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-black hover:bg-emerald-400 transition">
              {sent ? "Enter console →" : "Send code →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}