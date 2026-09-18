"use client";

import Link from "next/link";
import { useState } from "react";
import { KEYS, saveStored } from "../lib/ledger";

const DOORS: { label: string; href: string | null; note: string }[] = [
  { label: "Teacher", href: "/console?role=teacher", note: "Open the teacher console" },
  { label: "Public School", href: "/console?role=school", note: "Open the school console" },
  { label: "Private School", href: "/console?role=school", note: "Open the school console" },
  { label: "Government", href: null, note: "Your door opens next." }
];

// BUILD CAPACITY pops the choice. Four doors. Who are you?
export default function DoorsModal({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);

  function queue(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim() || !picked) return;
    try {
      const raw = window.localStorage.getItem(KEYS.queue);
      const arr: { door: string; contact: string; ts: number }[] = raw ? JSON.parse(raw) : [];
      arr.push({ door: picked, contact: contact.trim().slice(0, 60), ts: Date.now() });
      saveStored(KEYS.queue, arr.slice(-200));
    } catch { /* queue it in memory then */ }
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl bg-panel border border-white/10 p-7 md:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-river">BUILD CAPACITY</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-ivory">Who are you?</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory" aria-label="Close">✕</button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {DOORS.map((d) =>
            d.href ? (
              <Link key={d.label} href={d.href} className="rounded-2xl border border-white/10 bg-obsidian p-5 hover:border-river transition">
                <div className="font-bold text-ivory">{d.label} →</div>
                <div className="mt-1 text-[13px] text-muted">{d.note}</div>
              </Link>
            ) : (
              <button
                key={d.label}
                onClick={() => { setPicked(d.label); setDone(false); }}
                className={`rounded-2xl border p-5 text-left transition ${picked === d.label ? "border-river bg-river/10" : "border-white/10 bg-obsidian hover:border-ivory"}`}
              >
                <div className="font-bold text-ivory">{d.label}</div>
                <div className="mt-1 text-[13px] text-muted">{d.note}</div>
              </button>
            )
          )}
        </div>
        {picked && !done && (
          <form onSubmit={queue} className="mt-4 rounded-2xl bg-obsidian border border-white/10 p-5">
            <p className="text-sm text-ivory/85"><strong>{picked}</strong> — leave a contact. We open your door next. No spam, one call.</p>
            <div className="mt-3 flex gap-2">
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" maxLength={60} className="flex-1 rounded-2xl border border-white/15 bg-panel px-4 py-3 text-sm text-ivory outline-none focus:border-river" />
              <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Queue me</button>
            </div>
          </form>
        )}
        {done && (
          <p className="mt-4 rounded-2xl bg-river/15 border border-river/30 p-5 text-sm font-semibold text-emerald-300">
            Queued. When your door opens, you&apos;ll be the first to know.
          </p>
        )}
      </div>
    </div>
  );
}
