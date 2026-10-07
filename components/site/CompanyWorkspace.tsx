"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { StateTag } from "@/components/site/StateTag";
import { COMPANY, type EvidenceState } from "@/lib/system";

type DirectoryItem = { label: string; href?: string; detail?: string; state?: EvidenceState };
type DirectoryGroup = { label: string; items: DirectoryItem[] };

const DIRECTORY: DirectoryGroup[] = [
  {
    label: "Company",
    items: [
      { label: "Home", href: "/", detail: "Problem → Capability → Proof → Contact" },
      { label: "Work", href: "/work", detail: "APT Fab · APT Studio · Selected work" },
      { label: "The Roll", href: "/roll", detail: "Public evidence methodology + records" },
      { label: "BenBen", href: "/benben", detail: "School Console prototype · Allocation track" },
    ],
  },
  {
    label: "Organization",
    items: [{ label: "Contact", href: "/contact", detail: "Demo, pilot and diligence" }],
  },
];

function routeLabel(pathname: string) {
  return DIRECTORY.flatMap((group) => group.items).find((item) => item.href === pathname)?.label;
}

export function CompanyWorkspace({ children, fallbackLabel = "Overview" }: { children: ReactNode; fallbackLabel?: string }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const activeLabel = routeLabel(pathname) ?? fallbackLabel;

  const groups = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return DIRECTORY;
    return DIRECTORY.map((group) => ({
      ...group,
      items: group.items.filter((item) => `${group.label} ${item.label} ${item.detail}`.toLowerCase().includes(search)),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (event.key === "/" && !editing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setProfileOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="company-workspace">
      <header className="workspace-topbar">
        <Link className="workspace-brand" href="/" aria-label="APT-LABS workspace home">
          <span className="workspace-brand-mark" aria-hidden="true">A</span>
          <span>APT-LABS</span>
        </Link>
        <div className="workspace-breadcrumb" aria-label="Current location">
          <span>WORKSPACE</span><span aria-hidden="true">/</span><strong>{activeLabel}</strong>
        </div>
        <div className="workspace-top-actions">
          <Link className="workspace-contact-link" href="/contact">Contact <span aria-hidden="true">↗</span></Link>
          <div className="workspace-profile" ref={profileRef}>
            <button
              type="button"
              className="workspace-profile-trigger"
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
              aria-label="Open APT-LABS organization profile"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="workspace-profile-mark" aria-hidden="true">AL</span>
              <span className="workspace-profile-label">Organization</span>
              <span aria-hidden="true">⌄</span>
            </button>
            {profileOpen ? (
              <section className="workspace-profile-menu" role="dialog" aria-label="APT-LABS organization profile">
                <div className="workspace-profile-heading">
                  <span className="workspace-profile-mark" aria-hidden="true">AL</span>
                  <div><strong>{COMPANY.name}</strong><span>{COMPANY.mantra}</span></div>
                </div>
                <p className="workspace-profile-thesis">{COMPANY.supporting}</p>
                <div className="workspace-profile-location">
                  <span>{COMPANY.geography.scope}</span>
                  <strong>{COMPANY.geography.value}</strong>
                  <StateTag state={COMPANY.geography.state} />
                </div>
                <div className="workspace-profile-principles">
                  <p>OPERATING PRINCIPLES</p>
                  <span><strong>Custody</strong> Records stay where written.</span>
                  <span><strong>Contribution</strong> Weight is earned by work.</span>
                  <span><strong>Allocation</strong> Rules come before decisions.</span>
                </div>
                <div className="workspace-profile-products">
                                  <p>PORTFOLIO / SECONDARY FILES</p>
                                  <Link href="/work" onClick={() => setProfileOpen(false)}>
                                    <span className="workspace-file-icon" aria-hidden="true" />
                                    <span>Work<small>APT Fab · APT Studio · Selected prototypes</small></span>
                                    <span className="workspace-file-open" aria-hidden="true">↗</span>
                                  </Link>
                                  <Link href="/benben" onClick={() => setProfileOpen(false)}>
                                    <span className="workspace-file-icon" aria-hidden="true" />
                                    <span>BenBen<small>School Console prototype · Allocation track</small></span>
                                    <span className="workspace-file-open" aria-hidden="true">↗</span>
                                  </Link>
                                  <Link href="/roll" onClick={() => setProfileOpen(false)}>
                                    <span className="workspace-file-icon" aria-hidden="true" />
                                    <span>The Roll<small>Public evidence methodology</small></span>
                                    <span className="workspace-file-open" aria-hidden="true">↗</span>
                                  </Link>
                                </div>
                <Link className="workspace-profile-email" href="/contact" onClick={() => setProfileOpen(false)}>
                  {COMPANY.contact.email}<span aria-hidden="true">↗</span>
                </Link>
              </section>
            ) : null}
          </div>
        </div>
      </header>

      <div className="workspace-frame">
        <aside className="workspace-sidebar" aria-label="APT-LABS files">
          <div className="workspace-sidebar-heading">
            <span>EXPLORER</span><span>⌘</span>
          </div>
          <label className="workspace-search">
            <span aria-hidden="true">⌕</span>
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a file" aria-label="Search site files" />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button> : <kbd>/</kbd>}
          </label>
          <nav className="workspace-tree" aria-label="Site sections">
            {groups.map((group, index) => (
              <div className="workspace-tree-group" key={group.label}>
                <p><span aria-hidden="true">⌄</span> {String(index + 1).padStart(2, "0")} / {group.label.toUpperCase()}</p>
                {group.items.map((item) => {
                  const current = item.href === pathname;
                  const content = (
                                      <>
                                        <span className="workspace-file-icon" aria-hidden="true" />
                                        <span>{item.label}</span>
                                        {item.state ? <StateTag state={item.state} /> : null}
                                      </>
                                    );
                  return item.href ? (
                    <Link className="workspace-tree-link" data-current={current || undefined} href={item.href} key={item.label} aria-current={current ? "page" : undefined} title={item.detail}>
                      {content}
                    </Link>
                  ) : (
                    <div className="workspace-tree-link workspace-tree-link--pending" key={item.label} title={item.detail}>
                      {content}
                    </div>
                  );
                })}
              </div>
            ))}
            {groups.length === 0 ? <p className="workspace-no-results">No matching files.</p> : null}
          </nav>
          <div className="workspace-sidebar-foot">
            <span>THE REGISTER IS THE SOURCE.</span>
            <span>Not every named file is a live product.</span>
          </div>
        </aside>

        <div className="workspace-document-area">
          <div className="workspace-pathbar">
            <span>APT-LABS</span><span aria-hidden="true">/</span><strong>{activeLabel}</strong>
            <span className="workspace-path-state"><i aria-hidden="true" /> SOURCE-BOUND</span>
          </div>
          <main className="company-main" id="main-content">{children}</main>
          <footer className="company-footer">
                      <Link href="/">APT-LABS</Link>
                      <div className="company-footer-contact">
                        <Link href="/contact">{COMPANY.contact.email}</Link>
                        <span>{COMPANY.contact.note}</span>
                      </div>
                      <span>{COMPANY.kind}</span>
                      <Link href="/roll">The Roll <span aria-hidden="true">↗</span></Link>
                    </footer>
        </div>
      </div>
    </div>
  );
}