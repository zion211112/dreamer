"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { readiness } from "../../../lib/school";
import { useSchoolData } from "../../../components/console/useSchoolData";
import { ModuleGlyph, ModuleTile } from "../../../components/console/bits";
import {
  CONSOLE_MENU,
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
  "min-h-11 w-full border border-ivory/10 bg-panel px-5 py-3 text-sm text-ivory placeholder:text-dim outline-none transition-all duration-150 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/40";

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
    <main className="console-ui flex h-dvh flex-col bg-void font-body text-ivory">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ivory/8 px-[21px]">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
          <Diamond size={15} className="text-amber" />
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
        <div className="relative overflow-hidden border border-ivory/10 bg-panel p-6 sm:p-8 md:p-10">
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-teal">Build capacity · Console</p>
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
                  aria-pressed={role === r}
                    className={`border p-5 text-left transition ${
                    role === r ? "border-amber/70 bg-amber/10" : "border-ivory/10 bg-ivory/[0.04] hover:border-ivory/25"
                  }`}
                >
                  <div className="text-sm font-bold text-ivory">{ROLE_META[r].label}</div>
                  <div className="mt-1 text-[12px] leading-5 text-muted">{ROLE_META[r].desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
              <label htmlFor="console-name" className="sr-only">Your name</label>
              <input
                id="console-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={60}
                className={loginInput}
              />
              <label htmlFor="console-school" className="sr-only">
                {role === "school" ? "School name" : "Your school"}
              </label>
              <input
                id="console-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder={role === "school" ? "School name" : "Your school"}
                maxLength={60}
                className={loginInput}
              />
              <button
                type="submit"
                disabled={!valid}
                className="min-h-11 border border-teal bg-teal px-6 py-3 text-sm font-semibold text-obsidian transition duration-150 hover:bg-signalDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enter the {ROLE_META[role].label.toLowerCase()} console →
              </button>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                Local session · Stored on this device only · Free · 0 credits
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- */
/* The workspace: gradient rail + module grid. Glyphs, tiles and       */
/* the module tint chips come from components/console/bits.tsx.       */
/* ---------------------------------------------------------------- */

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
      (mod === "all" || CONSOLE_MENU[mod].modules.includes(t.module)) &&
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
  // The module grid shows only at the top level with an empty search —
  // typing anywhere searches tools across the current module.
  const showModules = mod === "all" && q === "";

  return (
    <div className="console-ui flex h-dvh flex-col overflow-hidden bg-void font-body text-ivory">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ivory/8 px-[21px]">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
          <Diamond size={15} className="text-amber" />
          <span>APT-LABS · Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-ivory/10 bg-ivory/5 py-1.5 pl-3.5 pr-4 font-mono text-[11px] text-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            {session.name} · {session.role}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-11 rounded-full border border-ivory/10 px-4 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-ivory/25 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            aria-label="Sign out of the console"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[62px] shrink-0 flex-col justify-between border-r border-ivory/10 bg-gradient-to-b from-void via-panel to-edge lg:w-[220px]">
          <div>
            <div className="flex h-[89px] items-center justify-center gap-3 border-b border-ivory/10 px-[13px] lg:justify-between lg:px-[21px]">
              <Diamond filled size={30} className="shrink-0 text-ivory" />
              <div className="hidden flex-col lg:flex">
                <span className="font-display text-base font-medium text-ivory">APT-LABS</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/45">Console</span>
              </div>
            </div>

            <nav aria-label="Console modules" className="flex flex-col gap-1 px-[10px] py-[13px] lg:px-[13px]">
              <button
                type="button"
                onClick={() => setMod("all")}
                aria-pressed={activeKey === "all"}
                className={`flex h-[38px] items-center justify-center gap-2.5 rounded-lg px-3 text-[13px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void lg:justify-start ${
                  activeKey === "all" ? "bg-ivory/15 font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(245,240,230,0.08)]" : "text-ivory/50 hover:bg-ivory/5 hover:text-ivory"
                }`}
              >
                <ModuleGlyph module="all" size={15} className={activeKey === "all" ? "text-amber" : undefined} />
                <span className="hidden lg:inline">Console</span>
              </button>
              {CONSOLE_MODULES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMod(m)}
                  aria-pressed={activeKey === m}
                  title={m}
                  className={`flex h-[38px] items-center justify-center gap-2.5 rounded-lg px-3 text-[13px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void lg:justify-start ${
                    activeKey === m ? "bg-ivory/15 font-medium text-ivory shadow-[inset_0_0_0_1px_rgba(245,240,230,0.08)]" : "text-ivory/50 hover:bg-ivory/5 hover:text-ivory"
                  }`}
                >
                  <ModuleGlyph module={m} size={15} className={activeKey === m ? "text-amber" : undefined} />
                  <span className="hidden lg:inline">{m}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-1 border-t border-ivory/10 p-[13px] font-mono text-[10px] uppercase tracking-[0.16em] text-ivory/35 lg:px-[21px]">
            <p>Local session</p>
            <p>Free · 0 credits</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-[34px]">
          <div className="mb-[21px] flex flex-col gap-3 border-b border-ivory/10 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-[30px] font-light leading-tight sm:text-[34px]">
                {mod === "all" ? "The console" : mod}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-teal">
                <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                {visible.length} tools
              </span>
            </div>
            <p className="text-[13px] text-muted">
              {mod === "all"
                ? "Nine modules. The material first, the mark of it second, the week around them."
                : CONSOLE_MENU[mod].desc}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
              {readiness(school.students, school.assessments).next}
            </p>
          </div>

          <div className="mb-[21px]">
            <label htmlFor="console-search" className="sr-only">
              Search console tools
            </label>
            <input
              id="console-search"
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${mod === "all" ? "tools" : mod} — press / or ⌘K to focus…`}
              className="h-[46px] w-full rounded-full border border-ivory/10 bg-panel px-6 text-[13px] text-ivory outline-none transition-all duration-150 placeholder:text-dim focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/40"
              aria-label="Search tools within the console"
            />
          </div>

          {showModules ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {CONSOLE_MODULES.map((m) => (
                <ModuleCard key={m} module={m} onOpen={() => setMod(m)} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-ivory/15 bg-panel/60 px-5 py-12 text-center" aria-live="polite">
              <p className="font-display text-[24px] text-ivory">No tool matches that search.</p>
              <p className="mt-2 text-sm text-muted">Try another term, or switch back to the full console view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

function ModuleCard({ module, onOpen }: { module: string; onOpen: () => void }) {
  const menu = CONSOLE_MENU[module];
  const tools = CONSOLE_TOOLS.filter((t) => menu.modules.includes(t.module));
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[150px] flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-ivory/8 bg-panel p-5 text-left transition-all duration-150 hover:border-ivory/25 hover:bg-panelHi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
    >
      <div className="flex items-start justify-between gap-3">
        <ModuleTile module={module} tint={menu.tint} />
        <span className="rounded-full border border-ivory/10 bg-ivory/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:border-ivory/25 group-hover:text-ivory">
          {tools.length} {tools.length === 1 ? "tool" : "tools"} →
        </span>
      </div>
      <div>
        <h3 className="font-display text-[20px] font-normal leading-tight text-ivory">{module}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{menu.desc}</p>
      </div>
    </button>
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
  const menu = CONSOLE_MENU[tool.module];
  return (
    <Link
      href={`/console/${tool.id}`}
      aria-label={`Open ${tool.title}`}
      className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-ivory/8 bg-panel p-5 transition-all duration-150 hover:border-ivory/25 hover:bg-panelHi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <ModuleTile module={tool.module} tint={menu?.tint} size={40} />
          <button
            type="button"
            title={fav ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={fav}
            aria-label={fav ? `Remove ${tool.title} from favourites` : `Add ${tool.title} to favourites`}
            onClick={onFav}
            className={`min-h-9 min-w-9 rounded-full border border-ivory/8 p-1.5 transition-all md:opacity-0 md:group-hover:opacity-100 ${
              fav ? "border-amber/20 bg-amber/10 text-amber" : "border-ivory/8 bg-panel text-dim hover:border-ivory/20 hover:text-ivory"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal`}
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
        <h3 className="font-display text-[19px] font-normal leading-tight text-ivory">{tool.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{tool.desc}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
          {tool.id.padStart(2, "0")} · {tool.module}
        </span>
      </div>
    </Link>
  );
}
