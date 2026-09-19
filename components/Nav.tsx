"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Site chrome: one glassy navy rail above every page. The wordmark is the
// diamond in a gradient tile — the same indigo→sky gradient the landing
// hero runs on — so the header is the first hint of the door it opens.
export function Nav() {
  const [open, setOpen] = useState(false);

  const links: Array<[string, string]> = [
    ["/benben", "BenBen"],
    ["/search", "Search"],
    ["/dashboard", "My Profile"],
    ["/ledger", "Ledger"],
    ["/contact", "Contact"]
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0d26]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 text-ivory" aria-label="APT-LABS home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 shadow-[0_4px_14px_-4px_rgba(79,110,247,0.55)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0d26" aria-hidden="true">
              <polygon points="12 2 22 12 12 22 2 12" />
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-tight">APT-LABS</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-white/55 md:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-ivory md:hidden"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-[#0a0d26] px-6 py-4 text-sm md:hidden">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-1.5 text-white/80 transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
