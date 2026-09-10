"use client";

import Link from "next/link";
import { useState } from "react";
import GeoArt from "../../../components/GeoArt";
import { SCHOOL_FEE, SUBSCRIBED_SCHOOLS, TILL, isMpesaCode } from "../../../lib/ledger";

const PRODUCTS = [
  { t: "Classroom design", d: "Desk layouts, wall charts, garden beds. Quoted per school, built by ledger youth." },
  { t: "Edtech tools", d: "Daily drills on WhatsApp, reports, quiz banks matched to your syllabus." },
  { t: "Teacher management", d: "Attendance, schemes, cover rosters. One screen the headteacher actually opens." }
];

// School door: public + private share the page, badge differs.
export default function School({ searchParams }: { searchParams: { type?: string } }) {
  const type = searchParams.type === "private" ? "Private" : "Public";
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setMsg("School name first."); return; }
    if (!isMpesaCode(code)) { setMsg("M-Pesa code should be 10 letters/numbers."); return; }
    try { window.localStorage.setItem("aptlabs-school-sub", JSON.stringify({ name, type, ts: Date.now() })); } catch { /* memory */ }
    setMsg(`${name.trim()} (${type}) subscribed. Post your first need below — youth are waiting.`);
    setName(""); setCode("");
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="band" className="mx-auto mt-8 h-10 max-w-3xl px-6 w-full text-ivory opacity-[0.08]" />
        <div className="relative mx-auto max-w-3xl px-6 py-10">
          <p className="text-xs font-bold tracking-widest text-river">{type.toUpperCase()} SCHOOL DOOR · {SCHOOL_FEE}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Post needs. Get members. One receipt.</h1>

          <div className="mt-8 grid gap-4">
            {PRODUCTS.map((p) => (
              <div key={p.t} className="rounded-3xl border border-white/10 bg-panel p-6">
                <div className="font-bold text-lg">{p.t}</div>
                <p className="mt-1 text-sm text-muted leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>

          <form onSubmit={subscribe} className="mt-6 rounded-3xl bg-panel border border-white/10 p-7">
            <div className="font-bold text-lg">Subscribe the school — {SCHOOL_FEE}</div>
            <p className="mt-1 text-sm text-muted">Send to Till {TILL}, enter school name + M-Pesa code.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="School name" maxLength={60} className={field} />
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code" maxLength={10} className={`${field} font-mono uppercase`} />
            </div>
            <button className="mt-3 w-full rounded-full bg-river py-3.5 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Subscribe →</button>
            {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
          </form>

          <div className="mt-6 rounded-3xl border border-white/10 p-6 text-sm">
            <span className="font-bold">On the list already: </span>
            <span className="text-muted">{SUBSCRIBED_SCHOOLS.join(" · ")}</span>
            <div className="mt-3">
              <Link href="/work#hire" className="font-semibold text-emerald-300 hover:text-ivory transition">Post a need →</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
