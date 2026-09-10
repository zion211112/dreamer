"use client";

import Link from "next/link";
import { useState } from "react";
import JoinLink from "./JoinLink";

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ivory">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory text-black text-sm">◉</span>
          APT-LABS
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-muted">
          <Link href="/ledger" className="hover:text-ivory transition">Ledger</Link>
          <Link href="/work" className="hover:text-ivory transition">Zep-Tepi</Link>
          <Link href="/kemet" className="hover:text-ivory transition">Kemet-OS</Link>
          <Link href="/ledger" className="hover:text-ivory transition" aria-label="Search">Search ⌕</Link>
          <Link href="/dashboard" className="hover:text-ivory transition">Dashboard</Link>
          <JoinLink className="rounded-full bg-ivory px-4 py-2 text-black text-[13px] font-semibold hover:bg-river hover:text-white transition">
            Join
          </JoinLink>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-ivory" aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-obsidian px-6 py-4 flex flex-col gap-3 text-sm">
          {[
            ["/ledger", "Ledger"],
            ["/work", "Zep-Tepi (work)"],
            ["/kemet", "Kemet-OS (research)"],
            ["/dashboard", "Dashboard"],
            ["/build/teacher", "Teacher assistant"],
            ["/build/parent", "Parents"],
            ["/build/school", "Schools"]
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-1 text-ivory/80">
              {label}
            </Link>
          ))}
          <Link href="/work#hire" onClick={() => setOpen(false)} className="mt-1 rounded-full bg-ivory px-4 py-2.5 text-black text-center text-sm font-semibold">
            Post work
          </Link>
        </nav>
      )}
    </header>
  );
}
