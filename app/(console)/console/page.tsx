  "use client";

// The console is a local demonstration surface, not an authenticated product.
  // There is no credential gate: anyone who opens the route can inspect the
  // prototype, and anything entered remains on that device until exported.

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
    const stored = loadConsoleSession();
    setSession(stored ?? null);
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
  "min-h-11 w-full border border-ink/10 bg-panel px-5 py-3 text-sm text-ink placeholder:text-ash outline-none transition-all duration-150 focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal/40";

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
    <main className="console-ui flex h-dvh flex-col bg-void font-sans text-ink">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ink/8 px-4 sm:px-[21px]">
        <div className="flex items-center gap-3 font-mono text-meta uppercase tracking-[0.14em] text-dust">
          <Diamond size={15} className="text-signal" />
          <span>APT-LABS · Console</span>
        </div>
        <Link
          href="/"
          className="font-mono text-label uppercase tracking-[0.15em] text-ash transition-colors hover:text-ink"
        >
          ← The ledger
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative overflow-hidden border border-ink/10 bg-panel p-5 sm:p-8 md:p-10">
          <div className="relative">
            <p className="font-mono text-label uppercase tracking-[0.35em] text-signal">Build capacity · Console</p>
            <h1 className="mt-4 font-serif text-4xl font-light tracking-tight">Who are you?</h1>
            <p className="mt-3 text-sm leading-6 text-dust">
              This is a local prototype surface, not an authentication system. No account or credential is required; anything you type stays in this browser unless you export it.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              {(Object.keys(ROLE_META) as ConsoleRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                    className={`border p-5 text-left transition ${
                    role === r ? "border-signal/70 bg-signal/10" : "border-ink/10 bg-ink/[0.04] hover:border-ink/25"
                  }`}
                >
                  <div className="text-sm font-bold text-ink">{ROLE_META[r].label}</div>
                  <div className="mt-1 text-meta leading-5 text-dust">{ROLE_META[r].desc}</div>
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
                className="min-h-11 border border-signal bg-signal px-6 py-3 text-sm font-semibold text-void transition duration-150 hover:bg-signalDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enter the {ROLE_META[role].label.toLowerCase()} console →
              </button>
              <p className="text-center font-mono text-micro uppercase tracking-[0.2em] text-ash">
                Local session · Stored on this device only · No account · No server sync
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
    <div className="console-ui flex h-dvh flex-col overflow-hidden bg-void font-sans text-ink">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ink/8 px-4 sm:px-[21px]">
        <div className="flex items-center gap-3 font-mono text-meta uppercase tracking-[0.14em] text-dust">
          <Diamond size={15} className="text-signal" />
          <span>APT-LABS · Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-ink/10 bg-ink/5 py-1.5 pl-3.5 pr-4 font-mono text-label text-dust sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            {session.name} · {session.role}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-11 rounded-full border border-ink/10 px-4 py-1.5 text-meta font-semibold text-dust transition-colors hover:border-ink/25 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            aria-label="Sign out of the console"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[58px] shrink-0 flex-col justify-between border-r border-ink/10 bg-gradient-to-b from-void via-panel to-edge lg:w-[220px]">
          <div>
            <div className="flex h-[89px] items-center justify-center gap-3 border-b border-ink/10 px-[13px] lg:justify-between lg:px-[21px]">
              <Diamond filled size={30} className="shrink-0 text-ink" />
              <div className="hidden flex-col lg:flex">
                <span className="font-serif text-base font-medium text-ink">APT-LABS</span>
                <span className="font-mono text-micro uppercase tracking-[0.2em] text-ink/45">Console</span>
              </div>
            </div>

            <nav aria-label="Console modules" className="flex flex-col gap-1 px-[10px] py-[13px] lg:px-[13px]">
              <button
                type="button"
                onClick={() => setMod("all")}
                aria-pressed={activeKey === "all"}
                className={`flex min-h-11 items-center justify-center gap-2.5 rounded-lg px-3 text-ui transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void lg:justify-start ${
                  activeKey === "all" ? "bg-ink/15 font-medium text-ink shadow-[inset_0_0_0_1px_rgba(245,240,230,0.08)]" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <ModuleGlyph module="all" size={15} className={activeKey === "all" ? "text-signal" : undefined} />
                <span className="hidden lg:inline">Console</span>
              </button>
              {CONSOLE_MODULES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMod(m)}
                  aria-pressed={activeKey === m}
                  title={m}
                  className={`flex min-h-11 items-center justify-center gap-2.5 rounded-lg px-3 text-ui transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void lg:justify-start ${
                    activeKey === m ? "bg-ink/15 font-medium text-ink shadow-[inset_0_0_0_1px_rgba(245,240,230,0.08)]" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <ModuleGlyph module={m} size={15} className={activeKey === m ? "text-signal" : undefined} />
                  <span className="hidden lg:inline">{m}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-1 border-t border-ink/10 p-[13px] font-mono text-micro uppercase tracking-[0.16em] text-ink/35 lg:px-[21px]">
            <p>Local session</p>
            <p>Local prototype · No account · No server sync</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-7 lg:p-[34px]">
          <div className="mb-[21px] flex flex-col gap-3 border-b border-ink/10 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-serif text-h1 font-light leading-tight sm:text-h1">
                {mod === "all" ? "The console" : mod}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/10 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.12em] text-signal">
                <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
                {visible.length} tools
              </span>
            </div>
            <p className="text-ui text-dust">
              {mod === "all"
                ? "Nine modules. The material first, the mark of it second, the week around them."
                : CONSOLE_MENU[mod].desc}
            </p>
            <p className="font-mono text-label uppercase tracking-[0.15em] text-ash">
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
              className="h-[46px] w-full rounded-full border border-ink/10 bg-panel px-6 text-ui text-ink outline-none transition-all duration-150 placeholder:text-ash focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal/40"
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
            <div className="rounded-[24px] border border-dashed border-ink/15 bg-panel/60 px-5 py-12 text-center" aria-live="polite">
              <p className="font-serif text-h2 text-ink">No tool matches that search.</p>
              <p className="mt-2 text-sm text-dust">Try another term, or switch back to the full console view.</p>
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
      className="group flex min-h-[150px] flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-ink/8 bg-panel p-5 text-left transition-all duration-150 hover:border-ink/25 hover:bg-edge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
    >
      <div className="flex items-start justify-between gap-3">
        <ModuleTile module={module} tint={menu.tint} />
        <span className="rounded-full border border-ink/10 bg-ink/5 px-3 py-1 font-mono text-micro uppercase tracking-[0.14em] text-dust transition-colors group-hover:border-ink/25 group-hover:text-ink">
          {tools.length} {tools.length === 1 ? "tool" : "tools"} →
        </span>
      </div>
      <div>
        <h3 className="font-serif text-h3 font-normal leading-tight text-ink">{module}</h3>
        <p className="mt-1.5 text-ui leading-relaxed text-dust">{menu.desc}</p>
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
      className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-ink/8 bg-panel p-5 transition-all duration-150 hover:border-ink/25 hover:bg-edge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void"
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
            className={`min-h-9 min-w-9 rounded-full border border-ink/8 p-1.5 transition-all md:opacity-0 md:group-hover:opacity-100 ${
              fav ? "border-signal/20 bg-signal/10 text-signal" : "border-ink/8 bg-panel text-ash hover:border-ink/20 hover:text-ink"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal`}
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
        <h3 className="font-serif text-h3 font-normal leading-tight text-ink">{tool.title}</h3>
        <p className="mt-1.5 text-ui leading-relaxed text-dust">{tool.desc}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-micro uppercase tracking-[0.18em] text-ash">
          {tool.id.padStart(2, "0")} · {tool.module}
        </span>
      </div>
    </Link>
  );
}
