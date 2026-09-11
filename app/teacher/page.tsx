"use client";

import { useState } from "react";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored
} from "../../lib/ledger";

const SHELVES: { cat: string; items: string[] }[] = [
  { cat: "Animations", items: ["Fractions in 60 seconds (Std 5)", "Photosynthesis, drawn live (Std 7)", "Matrices: the market table (F3)"] },
  { cat: "Planners & Exams", items: ["KCSE drill: Matrices + answers", "Weekly quiz: Kiswahili sarufi", "Mock: Std 8 Science term 2", "Term scheme: Std 7 Science", "Lesson plan: Fractions week 4", "Revision calendar: KCSE countdown"] },
  { cat: "Guides", items: ["Scheme of work in one sitting", "Marking schemes that mark themselves", "CBC strands to objectives map"] }
];

// Central teacher console: member-ID login, then the shelves.
// Animations, planners, guides — matched to whoever signs in.
export default function TeacherConsole() {
  const [id, setId] = useState("");
  const [me, setMe] = useState<Member | null>(null);
  const [miss, setMiss] = useState(false);
  const [q, setQ] = useState("");

  function login(e: React.FormEvent) {
    e.preventDefault();
    const key = id.trim().toUpperCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const m = [...customs, ...SEED_MEMBERS].find((x) => x.id.toUpperCase() === key) || null;
    setMe(m);
    setMiss(!m);
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  if (!me) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">TEACHER CONSOLE · SMIS ENDPOINT</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">Whose class is this?</h1>
          <form onSubmit={login} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <label className="text-sm font-bold">Member ID</label>
            <div className="mt-2 flex gap-2">
              <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
              <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Open →</button>
            </div>
            {miss && <p className="mt-3 text-sm text-muted">No record for that ID. Claim a slot on the ledger first.</p>}
          </form>
        </div>
      </main>
    );
  }

  const query = q.trim().toLowerCase();
  const shown = SHELVES.map((s) => ({
    ...s,
    items: query ? s.items.filter((i) => i.toLowerCase().includes(query)) : s.items
  })).filter((s) => s.items.length > 0);

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted">TEACHER CONSOLE · SMIS ENDPOINT</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Karibu, @{me.username}.</h1>
          </div>
          <button onClick={() => { setMe(null); setId(""); setQ(""); }} className="shrink-0 font-mono text-xs text-muted underline">Leave →</button>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter the shelves… e.g. matrices"
          className={`${field} mt-8 w-full`}
        />

        <div className="mt-6 grid gap-4">
          {shown.map((s) => (
            <section key={s.cat} className="rounded-3xl border border-white/10 bg-panel p-6 md:p-7">
              <h2 className="text-xs font-bold tracking-widest text-gold">{s.cat.toUpperCase()}</h2>
              <ul className="mt-3 space-y-2.5">
                {s.items.map((i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2.5 text-[15px]">
                    <span>→ {i}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {shown.length === 0 && (
            <p className="rounded-3xl border border-white/10 bg-panel p-8 text-center text-sm text-muted">
              Nothing on the shelves matches “{q.trim()}”. Try fewer words.
            </p>
          )}
        </div>

        <p className="mt-8 text-center font-mono text-xs text-dim">You teach. The console holds the paperwork.</p>
      </div>
    </main>
  );
}
