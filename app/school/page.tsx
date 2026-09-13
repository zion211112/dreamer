"use client";

import Link from "next/link";
import { useState } from "react";
import { SCHOOL_STATS, SUBSCRIBED_SCHOOLS } from "../../lib/ledger";

const PRODUCTS = [
  { t: "Classroom design", d: "Desk layouts, wall charts, garden beds. Quoted per school, built by ledger youth." },
  { t: "Edtech tools", d: "Daily drills on WhatsApp, reports, quiz banks matched to your syllabus." },
  { t: "Teacher management", d: "Attendance, schemes, cover rosters. One screen the headteacher actually opens." }
];

type Sub = { name: string; type: string; ts: number };

// Central school console: name login, then status, roster counts, products.
// A school is in if it subscribed here or sits on the pilot list.
export default function SchoolConsole() {
  const [name, setName] = useState("");
  const [school, setSchool] = useState<string | null>(null);
  const [miss, setMiss] = useState(false);

  function login(e: React.FormEvent) {
    e.preventDefault();
    const key = name.trim().toLowerCase();
    if (!key) return;
    let stored: Sub | null = null;
    try {
      const raw = window.localStorage.getItem("aptlabs-school-sub");
      if (raw) stored = JSON.parse(raw) as Sub;
    } catch { /* memory */ }
    const match =
      (stored && stored.name.trim().toLowerCase() === key ? stored.name : null) ||
      SUBSCRIBED_SCHOOLS.find((s) => s.toLowerCase() === key) ||
      null;
    setSchool(match);
    setMiss(!match);
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";
  const stat = school ? SCHOOL_STATS.find((s) => s.name.toLowerCase() === school.toLowerCase()) : null;

  if (!school) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">SCHOOL CONSOLE · SMIS ENDPOINT</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">Which school is this?</h1>
          <form onSubmit={login} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ngurubani Primary" maxLength={60} className={`${field} flex-1`} />
              <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Open →</button>
            </div>
            {miss && <p className="mt-3 text-sm text-muted">Not on the list. <Link href="/build/school" className="underline">Subscribe first →</Link></p>}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted">SCHOOL CONSOLE · SMIS ENDPOINT</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{school}.</h1>
          </div>
          <button onClick={() => { setSchool(null); setName(""); }} className="shrink-0 font-mono text-xs text-muted underline">Leave →</button>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-panel p-5">
            <div className="font-mono text-[11px] tracking-widest text-muted">STATUS</div>
            <div className="mt-1 font-bold text-emerald-300">Subscribed</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-panel p-5">
            <div className="font-mono text-[11px] tracking-widest text-muted">STUDENTS</div>
            <div className="mt-1 font-bold">{stat ? `~${stat.students}` : "—"}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-panel p-5">
            <div className="font-mono text-[11px] tracking-widest text-muted">RECEIPTS</div>
            <div className="mt-1 font-bold">On record</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {PRODUCTS.map((p) => (
            <section key={p.t} className="rounded-3xl border border-white/10 bg-panel p-6 md:p-7">
              <h2 className="text-xs font-bold tracking-widest text-gold">{p.t.toUpperCase()}</h2>
              <p className="mt-2 text-[15px] text-ivory/85 leading-relaxed">{p.d}</p>
            </section>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="rounded-full border border-white/20 px-6 py-2.5 font-semibold hover:border-gold transition">See the floor →</Link>
          <Link href="/teacher" className="rounded-full border border-white/20 px-6 py-2.5 font-semibold hover:border-gold transition">Teacher console →</Link>
        </div>
      </div>
    </main>
  );
}
