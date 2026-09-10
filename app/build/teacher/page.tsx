"use client";

import { useState } from "react";
import GeoArt from "../../../components/GeoArt";
import { TEACHER_FEE, TILL, isMpesaCode } from "../../../lib/ledger";

const SHELF: { cat: string; items: string[] }[] = [
  { cat: "Animations", items: ["Fractions in 60 seconds (Std 5)", "Photosynthesis, drawn live (Std 7)", "Matrices: the market table (F3)"] },
  { cat: "Exams", items: ["KCSE drill: Matrices + answers", "Weekly quiz: Kiswahili sarufi", "Mock: Std 8 Science term 2"] },
  { cat: "Planning", items: ["Term scheme: Std 7 Science", "Lesson plan: Fractions week 4", "Revision calendar: KCSE countdown"] }
];

const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

// Teacher door: describe your class, take the shelf. KES 500/month.
export default function Teacher() {
  const [school, setSchool] = useState("");
  const [subjects, setSubjects] = useState("");
  const [size, setSize] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [msg, setMsg] = useState("");

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!school.trim() || !subjects.trim() || !size.trim()) { setMsg("School, subjects, class size — all three, then we start."); return; }
    if (!isMpesaCode(code)) { setMsg("That M-Pesa code doesn't look right (10 letters/numbers, e.g. QHX7K2M4P1)."); return; }
    try { window.localStorage.setItem("aptlabs-teacher-sub", JSON.stringify({ school, subjects, size, ts: Date.now() })); } catch { /* memory it is */ }
    setActive(true);
    setMsg(`${school.trim()} is on the assistant. Shelf open below.`);
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">TEACHER DOOR · {TEACHER_FEE}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Tell us your class. We do the paperwork.</h1>
          <p className="mt-4 text-muted leading-relaxed">You teach. The assistant brings animations, exams and planning from the Zep-Tepi shelf — made by the community, matched to your subjects.</p>

          <form onSubmit={subscribe} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School name" maxLength={60} className={`${field} w-full`} />
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Subjects (e.g. Maths, Science)" maxLength={60} className={field} />
              <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Class size (e.g. 45)" inputMode="numeric" maxLength={6} className={field} />
            </div>
            <p className="mt-4 text-sm text-muted">Send {TEACHER_FEE} to Till {TILL}, then enter the M-Pesa code:</p>
            <div className="mt-2 flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code (10 characters)" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
              <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Start →</button>
            </div>
            {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
          </form>

          <div className={`mt-6 grid gap-4 ${active ? "" : "opacity-40 pointer-events-none select-none"}`}>
            {!active && <p className="text-sm text-muted">The shelf unlocks when your subscription starts. No peeking.</p>}
            {SHELF.map((s) => (
              <div key={s.cat} className="rounded-3xl border border-white/10 bg-panel p-6">
                <div className="text-xs font-bold tracking-widest text-river">{s.cat.toUpperCase()}</div>
                <ul className="mt-2 space-y-1.5 text-[15px] text-ivory/85">
                  {s.items.map((i) => <li key={i}>→ {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
