"use client";

import Link from "next/link";
import { useState } from "react";
import BenBenLink from "./BenBenLink";

const LINKS: [string, string][] = [];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ivory">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory text-black text-sm">◉</span>
          APT-LABS
        </Link>

        <nav className="hidden md:flex items-center gap-3 text-sm text-muted">
          <Link href="/search" className="hover:text-ivory transition" aria-label="Search">⌕ Search</Link>
          <Link href="/ledger" className="hover:text-ivory transition">Join the ledger</Link>
          <BenBenLink className="inline-flex items-center justify-center rounded-lg border border-emerald-400/50 bg-panel px-3 py-2 text-[10px] font-black tracking-[0.28em] text-ivory hover:border-emerald-300 hover:text-emerald-200 transition">
            <span className="relative flex h-7 w-24 items-center justify-center overflow-hidden rounded-md border border-emerald-300/50 bg-obsidian">
              <span className="absolute inset-y-0 left-0 w-1/2 bg-emerald-500/80" />
              <span className="relative z-10 tracking-[0.22em] text-ivory">BEN</span>
              <span className="relative z-10 ml-1 tracking-[0.22em] text-ivory">BEN</span>
            </span>
          </BenBenLink>
          <Link href="/zep-tepi" className="rounded-full border border-white/15 px-3 py-2 font-semibold text-ivory hover:border-gold hover:text-gold transition">ZEPTEPI</Link>
          <Link href="/dashboard" className="hover:text-ivory transition">My Profile</Link>
        </nav>

        <button onClick={() => setOpen(!open)} className="md:hidden rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-ivory" aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-obsidian px-6 py-4 flex flex-col gap-3 text-sm">
          {([
            ["/search", "Search ⌕"] as [string, string],
            ["/ledger", "Join the ledger"] as [string, string],
            ["/dashboard", "My Profile"] as [string, string],
            ["/zep-tepi", "ZepTepi"] as [string, string]
          ]).map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-1 text-ivory/80">
              {label}
            </Link>
          ))}
          <BenBenLink className="mt-2 inline-flex items-center justify-center rounded-lg border border-emerald-400/50 bg-panel px-3 py-2 text-[10px] font-black tracking-[0.28em] text-ivory hover:border-emerald-300 hover:text-emerald-200 transition">
            <span className="relative flex h-7 w-24 items-center justify-center overflow-hidden rounded-md border border-emerald-300/50 bg-obsidian">
              <span className="absolute inset-y-0 left-0 w-1/2 bg-emerald-500/80" />
              <span className="relative z-10 tracking-[0.22em] text-ivory">BEN</span>
              <span className="relative z-10 ml-1 tracking-[0.22em] text-ivory">BEN</span>
            </span>
          </BenBenLink>
        </nav>
      )}
    </header>
  );
}
