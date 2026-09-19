"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  const links: Array<[string, string]> = [
    ["/", "Home"],
    ["/ledger", "Ledger"],
    ["/benben", "Floor"],
    ["/console", "Teachers"],
    ["/contact", "Contact"]
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-nav sticky top-0 z-50 border-b border-ivory/10 bg-obsidian/95">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" className="site-nav__brand group flex min-h-11 items-center gap-3 text-ivory" aria-label="APT-LABS home">
          <span className="grid h-8 w-8 place-items-center border border-teal/60 text-[11px] font-bold text-teal transition-colors group-hover:bg-teal group-hover:text-obsidian">
            A
          </span>
          <span className="text-[13px] font-semibold tracking-[0.2em] text-ivory">APT-LABS</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {links.map(([href, label]) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`min-h-11 px-3 py-3 text-[12px] font-medium transition-colors ${active ? "text-teal" : "text-ivory/60 hover:text-ivory"}`}
            >
              {label}
            </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="site-nav__toggle min-h-11 min-w-11 border border-ivory/20 text-[12px] font-semibold uppercase tracking-[0.12em] text-ivory md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id={menuId}
        aria-label="Mobile navigation"
        hidden={!open}
        className="border-t border-ivory/10 bg-obsidian px-5 py-3 md:hidden"
      >
        {links.map(([href, label]) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center border-b border-ivory/10 text-sm transition-colors last:border-b-0 ${active ? "text-teal" : "text-ivory/75 hover:text-ivory"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
