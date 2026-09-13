"use client";

import Link from "next/link";
import { useState } from "react";
import GeoArt from "../../components/GeoArt";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored
} from "../../lib/ledger";

const navItems = [
  { label: "Overview", active: true },
  { label: "Projects" },
  { label: "Skills" },
  { label: "Settings" }
];

export default function Dashboard() {
  const [id, setId] = useState("");
  const [me, setMe] = useState<Member | null>(null);
  const [miss, setMiss] = useState(false);

  function login(e: React.FormEvent) {
    e.preventDefault();
    const key = id.trim().toUpperCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const m = [...customs, ...SEED_MEMBERS].find((x) => x.id.toUpperCase() === key) || null;
    setMe(m);
    setMiss(!m);
    if (m) {
      try { window.localStorage.setItem(KEYS.myid, m.id); } catch { /* memory */ }
    }
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
          {!me && (
            <div className="mx-auto max-w-xl rounded-[26px] border border-white/10 bg-panel p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <p className="text-xs font-bold tracking-[0.28em] text-river">MY PROFILE</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Open your ledger card.</h1>
              <form onSubmit={login} className="mt-8">
                <label className="text-sm font-bold">Member ID</label>
                <div className="mt-2 flex gap-2">
                  <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                  <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Open →</button>
                </div>
                {miss && <p className="mt-3 text-sm text-muted">No record for that ID. <Link href="/ledger" className="underline">Join the ledger →</Link></p>}
                <p className="mt-3 text-xs text-muted">This browser keeps the profile locally.</p>
              </form>
            </div>
          )}

          {me && (
            <div className="flex min-h-[70vh] overflow-hidden rounded-[28px] border border-white/10 bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <aside className="hidden w-[260px] border-r border-white/10 bg-[#0d1117] md:block">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-ivory text-sm font-black text-black">{me.name.slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ivory">{me.name}</div>
                      <div className="truncate text-xs text-muted">@{me.username}</div>
                    </div>
                  </div>

                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${item.active ? "bg-white/5 text-ivory" : "text-muted hover:bg-white/5 hover:text-ivory"}`}
                        type="button"
                      >
                        <span>{item.label}</span>
                        {item.active && <span className="h-2 w-2 rounded-full bg-river" />}
                      </button>
                    ))}
                  </nav>

                  <div className="mt-auto space-y-3 border-t border-white/10 pt-5 text-xs text-muted">
                    <div className="flex items-center justify-between"><span>ID</span><span className="font-mono text-ivory">{me.id}</span></div>
                    <div className="flex items-center justify-between"><span>Locale</span><span>{me.location}</span></div>
                    <div className="flex items-center justify-between"><span>Role</span><span>{me.occupation}</span></div>
                  </div>
                </div>
              </aside>

              <section className="flex-1 p-5 md:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-river">PROFILE</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-ivory">@{me.username}</h2>
                  </div>
                  <button onClick={() => { setMe(null); setId(""); }} className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-muted hover:text-ivory transition">Close</button>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-obsidian p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold tracking-[0.2em] text-muted">ABOUT</div>
                      <span className="rounded-full border border-white/10 bg-panel px-2.5 py-1 text-[10px] font-semibold text-river">ACTIVE</span>
                    </div>
                    <div className="mt-4 text-xl font-semibold text-ivory">{me.name}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {me.occupation} from {me.location}. Contributor on the ledger with a live profile in the local member register.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-obsidian p-5">
                    <div className="text-xs font-bold tracking-[0.2em] text-muted">IDENTITY</div>
                    <div className="mt-4 space-y-3 text-sm text-ivory">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-muted">ID</span><span className="font-mono">{me.id}</span></div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-muted">Location</span><span>{me.location}</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted">Role</span><span>{me.occupation}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-obsidian p-5">
                  <div className="text-xs font-bold tracking-[0.2em] text-muted">SKILLS</div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-ivory">
                    {me.skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-white/10 bg-panel px-3 py-1.5">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/ledger" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-ivory hover:border-river transition">Ledger</Link>
                  <Link href="/search" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-ivory hover:border-river transition">Search</Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
