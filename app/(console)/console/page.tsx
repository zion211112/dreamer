"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { readiness } from "../../../lib/school";
import { useSchoolData } from "../../../components/console/useSchoolData";
import {
  CONSOLE_MODULES,
  CONSOLE_TOOLS,
  ConsoleRole,
  ConsoleSession,
  ConsoleTool,
  clearConsoleSession,
  loadConsoleFavs,
  loadConsoleSession,
  saveConsoleFavs,
  saveConsoleSession,
} from "../../../lib/console";

/* ---------------------------------------------------------------- */
/* Entry: /console owns the full viewport. No site Nav, no footer.  */
/* ---------------------------------------------------------------- */

export default function ConsolePage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-void" />}>
      <ConsoleApp />
    </Suspense>
  );
}

function ConsoleApp() {
  const params = useSearchParams();
  const [session, setSession] = useState<ConsoleSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadConsoleSession());
    setReady(true);
  }, []);

  if (!ready) return <div className="h-dvh bg-void" />;

  if (!session) {
    return (
      <ConsoleLogin
        initialRole={params.get("role") === "school" ? "school" : "teacher"}
        onEnter={(s) => {
          saveConsoleSession(s);
          setSession(s);
        }}
      />
    );
  }

  return (
    <ConsoleWorkspace
      session={session}
      onSignOut={() => {
        clearConsoleSession();
        setSession(null);
      }}
    />
  );
}

function Diamond({
  className = "",
  filled = false,
  size = 21
}: {
  className?: string;
  filled?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <polygon points="12 2 2 12 12 22 22 12 12 2" />
    </svg>
  );
}
/* ---------------------------------------------------------------- */
/* The console login: the door you land on after BUILD CAPACITY.   */
/* It is a local session — nothing typed here leaves the device.   */
/* ---------------------------------------------------------------- */

const ROLE_META: Record<ConsoleRole, { label: string; desc: string }> = {
  teacher: { label: "Teacher", desc: "Lessons, assignments, marking — one screen." },
  school: { label: "School", desc: "Roster, fees, reports — the school's roll." }
};

const loginInput =
  "w-full rounded-full border border-edge bg-panel px-5 py-3 text-sm text-ivory placeholder:text-dim outline-none transition-colors focus:border-gold";

function ConsoleLogin({
  initialRole,
  onEnter
}: {
  initialRole: ConsoleRole;
  onEnter: (s: ConsoleSession) => void;
}) {
  const [role, setRole] = useState<ConsoleRole>(initialRole);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const valid = name.trim() !== "" && school.trim() !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onEnter({ role, name: name.trim().slice(0, 60), school: school.trim().slice(0, 60), ts: Date.now() });
  }

  return (
    <main className="flex h-dvh flex-col bg-void font-body text-ivory">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-edge px-[21px]">
        <div className="flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.1em] text-muted">
          <Diamond className="text-muted" />
          <span>APT-LABS · Console</span>
        </div>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-ivory"
        >
          ← The ledger
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center overflow-y-auto px-6 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold">Build capacity · Console</p>
        <h1 className="mt-4 font-display text-4xl font-light tracking-tight">Who are you?</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Pick your door. The console opens on this device — nothing you type leaves it.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {(Object.keys(ROLE_META) as ConsoleRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-[21px] border p-5 text-left transition ${
                role === r ? "border-gold bg-gold/5" : "border-edge bg-panel hover:border-edgeHi"
              }`}
            >
              <div className="text-sm font-bold text-ivory">{ROLE_META[r].label}</div>
              <div className="mt-1 text-[12px] leading-5 text-muted">{ROLE_META[r].desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className={loginInput}
          />
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder={role === "school" ? "School name" : "Your school"}
            maxLength={60}
            className={loginInput}
          />
          <button
            type="submit"
            disabled={!valid}
            className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter the {ROLE_META[role].label.toLowerCase()} console →
          </button>
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            Local session · Stored on this device only · Free · 0 credits
          </p>
        </form>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- */
/* The workspace: header + sidebar rail + module grid.             */
/* ---------------------------------------------------------------- */

const MODULE_ICONS: Record<string, JSX.Element> = {
  all: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  SMIS: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  Roster: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  ),
  Reports: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  Inspection: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Fees: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  Library: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  Timetable: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  Comms: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  Manage: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  )
};

function NavIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HeaderIcon({
  children,
  title,
  onClick
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center text-dim transition-colors hover:text-gold"
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function ConsoleWorkspace({ session, onSignOut }: { session: ConsoleSession; onSignOut: () => void }) {
  const [mod, setMod] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState<Set<string>>(() => loadConsoleFavs());
  const school = useSchoolData();
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" or ⌘K focuses the search — the Linear muscle memory.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const inField = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
      if ((e.key === "/" && !inField) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const visible = CONSOLE_TOOLS.filter(
    (t) =>
      (mod === "all" || t.module === mod) &&
      (q === "" || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
  );

  function toggleFav(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = new Set(favs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavs(next);
    saveConsoleFavs(next);
  }

  const activeKey = mod === "all" ? "all" : mod;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-void font-body text-ivory">
      {/* TOP HEADER */}
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-edge px-[21px]">
        <div className="flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.1em] text-muted">
          <Diamond className="text-muted" />
          <span>APT-LABS · Console</span>
        </div>
        <div className="flex items-center gap-[21px]">
          <HeaderIcon title={`Profile · ${session.name}`}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </HeaderIcon>
          <HeaderIcon title="Notifications">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </HeaderIcon>
          <HeaderIcon title="Sign out" onClick={onSignOut}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </HeaderIcon>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* SIDEBAR */}
        <aside className="flex w-[55px] shrink-0 flex-col justify-between border-r border-edge bg-panel lg:w-[240px]">
          <div>
            <div className="flex h-[89px] items-center justify-center gap-3 border-b border-edge px-[13px] lg:justify-between">
              <Diamond filled size={34} className="shrink-0 text-gold" />
              <div className="hidden flex-col lg:flex">
                <span className="font-display text-base font-medium">APT-LABS</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Console</span>
              </div>
            </div>

            <nav className="flex flex-col py-[13px]">
              <button
                onClick={() => setMod("all")}
                className={`flex h-[34px] items-center justify-center gap-2.5 border-l-2 px-[13px] lg:justify-start text-[13px] transition-all ${
                  activeKey === "all"
                    ? "border-l-gold bg-void font-medium text-ivory"
                    : "border-l-transparent text-muted hover:bg-panelHi hover:text-ivory"
                }`}
              >
                <NavIcon className={activeKey === "all" ? "text-gold" : "text-dim"}>{MODULE_ICONS.all}</NavIcon>
                <span className="hidden lg:inline">Console</span>
              </button>
              {CONSOLE_MODULES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMod(m)}
                  className={`flex h-[34px] items-center gap-2.5 border-l-2 px-[13px] text-[13px] transition-all ${
                    activeKey === m
                      ? "border-l-gold bg-void font-medium text-ivory"
                      : "border-l-transparent text-muted hover:bg-panelHi hover:text-ivory"
                  }`}
                >
                  <NavIcon className={activeKey === m ? "text-gold" : "text-dim"}>{MODULE_ICONS[m]}</NavIcon>
                  <span className="hidden lg:inline">{m}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex h-[55px] items-center overflow-hidden border-t border-edge px-[13px] font-mono text-[11px] text-dim">
            Free · 0 credits
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-[34px]">
          <div className="mb-[21px]">
            <h1 className="font-display text-[34px] font-light leading-tight">
              {mod === "all" ? "Console" : mod}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              {mod === "all" ? "Select a module from the list below" : `Tools in ${mod}`}
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
              {readiness(school.students, school.assessments).next}
            </p>
          </div>

          <div className="mb-[21px] flex flex-wrap gap-2">
            <button
              onClick={() => setMod("all")}
              className={`h-[34px] rounded-full border px-[21px] font-mono text-[11px] uppercase tracking-[0.08em] transition-all ${
                mod === "all" ? "border-gold text-gold" : "border-edge text-muted hover:border-edgeHi hover:text-ivory"
              }`}
            >
              All
            </button>
            {CONSOLE_MODULES.map((m) => (
              <button
                key={m}
                onClick={() => setMod(m)}
                className={`h-[34px] rounded-full border px-[21px] font-mono text-[11px] uppercase tracking-[0.08em] transition-all ${
                  mod === m ? "border-gold text-gold" : "border-edge text-muted hover:border-edgeHi hover:text-ivory"
                }`}
              >
                {m}
                {CONSOLE_TOOLS.some((t) => t.module === m && t.status === "ready") && (
                  <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />
                )}
              </button>
            ))}
          </div>

          <div className="mb-[34px]">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or type to search — press / or ⌘K to focus…"
              className="h-[55px] w-full rounded-full border border-edge bg-panel px-[21px] text-[13px] text-ivory outline-none transition-colors placeholder:text-dim focus:border-gold"
            />
          </div>

          {visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">Nothing in this module yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-[21px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((t) => (
                <ToolCard key={t.id} tool={t} fav={favs.has(t.id)} onFav={(e) => toggleFav(t.id, e)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  fav,
  onFav
}: {
  tool: ConsoleTool;
  fav: boolean;
  onFav: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/console/${tool.id}`}
      className="group flex min-h-[144px] flex-col justify-between rounded-[21px] border border-edge bg-panel p-[21px] transition-all duration-150 hover:border-edgeHi hover:bg-panelHi"
    >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <Diamond filled className="text-gold" />
          <div className="flex gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <button
              type="button"
              title={fav ? "Remove from favourites" : "Add to favourites"}
              onClick={onFav}
              className={fav ? "text-gold" : "text-dim transition-colors hover:text-ivory"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={fav ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
        </div>
        <h3 className="font-display text-[21px] font-normal leading-tight">{tool.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{tool.desc}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{tool.module}</span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
            tool.status === "ready" ? "text-gold" : "text-dim/60"
          }`}
        >
          {tool.status === "ready" ? "● Ready" : "Seat held"}
        </span>
      </div>
    </Link>
  );
}

