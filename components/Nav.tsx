"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS: [string, string][] = [
  ["/benben", "Ben-Ben"],
  ["/zep-tepi", "Zep Tepi"]
];

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
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-ivory transition">{label}</Link>
          ))}
          <Link href="/search" className="hover:text-ivory transition" aria-label="Search">⌕ Search</Link>
          <Link href="/dashboard" className="hover:text-ivory transition">My Profile</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-ivory" aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-obsidian px-6 py-4 flex flex-col gap-3 text-sm">
          {[...LINKS, ["/search", "Search ⌕"] as [string, string], ["/dashboard", "My Profile"] as [string, string]].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-1 text-ivory/80">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
