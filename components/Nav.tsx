"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/deploy", label: "Deploy" },
  { href: "/fab", label: "Fab" },
  { href: "/studio", label: "Studio" },
  { href: "/roll", label: "Roll" },
  { href: "/benben", label: "Floor" },
  { href: "/evidence", label: "Evidence" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : href === "/roll"
        ? pathname.startsWith("/roll") || pathname.startsWith("/ledger")
        : pathname.startsWith(href);

  return (
    <header className="site-nav" role="banner">
      <div className="nav-inner">
        <Link
          href="/"
          className="nav-brand"
          aria-label="APT-LABS — locally owned institutional infrastructure systems"
        >
          <span className="nav-brand-mark" aria-hidden="true">A</span>
          <span className="nav-brand-text">APT-LABS</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="nav-links"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "nav-link",
                  active ? "nav-link--active" : "",
                ].filter(Boolean).join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className="nav-toggle-icon" aria-hidden="true">
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </span>
          <span className="nav-toggle-text">
            {mobileOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      <nav
        id={menuId}
        aria-label="Mobile navigation"
        className={["nav-mobile", mobileOpen ? "nav-mobile--open" : ""].filter(Boolean).join(" ")}
        hidden={!mobileOpen}
      >
        <div className="nav-mobile-inner">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "nav-mobile-link",
                  active ? "nav-mobile-link--active" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
