"use client";

import { useState } from "react";
import GeoArt from "../../../components/GeoArt";

// The index. A beautiful bar that searches nothing —
// the archive answers in its own time.
export default function Search() {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState(false);

  function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setAsked(true);
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 text-ivory opacity-[0.05]" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-muted">THE INDEX</p>
          <form onSubmit={ask} className="mt-8 w-full">
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-panel/80 py-2 pl-7 pr-2 backdrop-blur transition focus-within:border-gold">
              <span className="text-xl text-muted" aria-hidden>⌕</span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setAsked(false); }}
                placeholder="Ask the list anything…"
                maxLength={80}
                className="w-full bg-transparent py-3 font-display text-xl italic text-ivory outline-none placeholder:text-dim"
                aria-label="Search the index"
              />
              <button className="shrink-0 rounded-full bg-ivory px-7 py-3 text-sm font-semibold text-black hover:bg-gold transition">
                Ask →
              </button>
            </div>
          </form>
          <div className="mt-6 h-6">
            {asked && (
              <p className="font-mono text-sm text-muted">“{q.trim().slice(0, 60)}” — noted. The index is still being written.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
