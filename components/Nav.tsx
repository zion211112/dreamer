"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Site chrome: one glassy obsidian rail above every page. The wordmark is the
// diamond in an amber tile — so the header is the first hint of the door it opens.
export function Nav() {
  const [open, setOpen] = useState(false);

  const links: Array<[string, string]> = [
    ["/", "Home"],
    ["/ledger", "Ledger"],
    ["/benben", "Floor"],
    ["/console", "Teachers"],
    ["/contact", "Contact"]
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ivory/10 bg-obsidian/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-ivory" aria-label="APT-LABS home">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-amber/40 bg-amber/10 text-[11px] font-bold text-amber">
            A
          </span>
          <span className="text-[14px] font-semibold tracking-[0.18em] text-ivory/90">APT-LABS</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[12px] font-medium text-ivory/55 md:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:text-ivory">
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-ivory/20 px-3.5 py-2 text-sm font-semibold text-ivory md:hidden"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-0.5 border-t border-ivory/10 bg-obsidian px-5 py-4 text-sm md:hidden">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="py-2.5 text-ivory/80 transition-colors hover:text-ivory">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
