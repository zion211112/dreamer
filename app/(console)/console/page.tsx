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
import { PRODUCTS, TENDER_SYSTEM } from "../../../lib/system";
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
    <main id="main-content" className="console-ui flex h-dvh flex-col bg-void font-sans text-ink">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ink/10 px-4 sm:px-[21px]">
        <div className="flex items-center gap-3 font-mono text-meta uppercase tracking-caps text-dust">
          <Diamond size={15} className="text-signal" />
          <span>APT-LABS / LOCAL RECORDS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/contact" className="console-contact-link">Contact</Link>
          <Link href="/" className="font-mono text-label uppercase tracking-caps text-ash transition-colors hover:text-ink">APT-LABS ↗</Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative overflow-hidden border border-ink/10 bg-panel p-5 sm:p-8 md:p-10">
          <div className="relative">
            <p className="font-mono text-label uppercase tracking-caps text-signal">Build capacity · Console</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Who are you?</h1>
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
              <p className="text-center font-mono text-micro uppercase tracking-caps text-ash">
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
  const [profileOpen, setProfileOpen] = useState(false);
  const school = useSchoolData();
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // "/" or ⌘K focuses the search — the Linear muscle memory.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const inField = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
      if (e.key === "Escape") setProfileOpen(false);
      if ((e.key === "/" && !inField) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
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
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ink/10 px-4 sm:px-[21px]">
        <div className="flex min-w-0 items-center gap-3 font-mono text-meta uppercase tracking-caps text-dust">
          <Diamond size={15} className="text-signal" />
          <Link href="/" className="shrink-0 text-dust transition-colors hover:text-ink">APT-LABS</Link>
          <span className="text-quiet">/ RECORDS /</span>
          <span className="truncate text-ink">Local workspace</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/contact" className="console-contact-link">Contact</Link>
          <div className="console-profile" ref={profileRef}>
            <button type="button" className="console-profile-trigger" aria-expanded={profileOpen} aria-haspopup="dialog" onClick={() => setProfileOpen((open) => !open)}>
              <span className="console-profile-mark" aria-hidden="true">{session.name.slice(0, 1).toUpperCase()}</span>
              <span className="console-profile-name">{session.name}</span>
              <span aria-hidden="true">⌄</span>
            </button>
            {profileOpen ? (
              <section className="console-profile-menu" role="dialog" aria-label="Local profile and product workspaces">
                <div className="console-profile-person">
                  <span className="console-profile-mark" aria-hidden="true">{session.name.slice(0, 1).toUpperCase()}</span>
                  <div><strong>{session.name}</strong><span>{session.role} / {session.school}</span></div>
                </div>
                <p className="console-profile-local"><i aria-hidden="true" /> LOCAL SESSION · THIS DEVICE ONLY</p>
                <div className="console-profile-context">
                  <span>WORKING RECORDSPACE</span>
                  <strong>{session.school}</strong>
                  <small>{session.role} · demonstration data, not an institutional record</small>
                </div>
                <div className="console-profile-system">
                  <p>THE SYSTEM THIS WORK SITS IN</p>
                  <Link href="/stack" onClick={() => setProfileOpen(false)}>Record → identity → build → infrastructure → allocation <span aria-hidden="true">↗</span></Link>
                </div>
                <div className="console-profile-products">
                  <p>OTHER APT-LABS WORK / NOT OPEN HERE</p>
                  <div className="console-profile-pending">
                    <span className="console-file-glyph" aria-hidden="true" />
                    <span>{TENDER_SYSTEM.name}<small>Not available in this workspace</small></span>
                    <span className="console-profile-state">UNKNOWN</span>
                  </div>
                  {PRODUCTS.filter((product) => !product.href).map((product) => (
                    <div className="console-profile-pending" key={product.name}>
                      <span className="console-file-glyph" aria-hidden="true" />
                      <span>{product.name}<small>Build track · not a live product</small></span>
                      <span className="console-profile-state">PLANNED</span>
                    </div>
                  ))}
                </div>
                <div className="console-profile-actions">
                  <Link href="/" onClick={() => setProfileOpen(false)}>APT-LABS overview <span aria-hidden="true">↗</span></Link>
                  <button type="button" onClick={onSignOut}>End local session</button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[58px] shrink-0 flex-col justify-between border-r border-ink/10 bg-panel lg:w-[220px]">
          <div>
            <div className="flex h-[72px] items-center justify-center gap-3 border-b border-ink/10 px-[13px] lg:justify-between lg:px-[21px]">
              <Diamond filled size={25} className="shrink-0 text-signal" />
              <div className="hidden flex-col lg:flex">
                <span className="font-display text-base font-medium text-ink">School Console</span>
                <span className="font-mono text-micro uppercase tracking-caps text-ash">Operations</span>
              </div>
            </div>

            <nav aria-label="Console files" className="console-file-tree flex flex-col gap-1 px-[10px] py-[13px] lg:px-[13px]">
              <p className="hidden px-3 pb-2 font-mono text-micro uppercase tracking-caps text-quiet lg:block">OPERATIONS / FILES</p>
              <button
                type="button"
                onClick={() => setMod("all")}
                aria-pressed={activeKey === "all"}
                aria-label="All modules"
                title="All files"
                className={`flex min-h-11 items-center justify-center gap-2.5 px-3 text-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal lg:justify-start ${activeKey === "all" ? "bg-ink/10 font-medium text-ink" : "text-ash hover:bg-ink/5 hover:text-ink"}`}
              >
                <ModuleGlyph module="all" size={15} className={activeKey === "all" ? "text-signal" : undefined} />
                <span className="hidden lg:inline">All files</span>
              </button>
              {CONSOLE_MODULES.map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => setMod(module)}
                  aria-pressed={activeKey === module}
                  title={module}
                  className={`flex min-h-11 items-center justify-center gap-2.5 px-3 text-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal lg:justify-start ${activeKey === module ? "bg-ink/10 font-medium text-ink" : "text-ash hover:bg-ink/5 hover:text-ink"}`}
                >
                  <ModuleGlyph module={module} size={15} className={activeKey === module ? "text-signal" : undefined} />
                  <span className="hidden lg:inline">{module}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-1 border-t border-ink/10 p-[13px] font-mono text-micro uppercase tracking-caps text-quiet lg:px-[21px]">
            <p>Local session</p>
            <p>Stored on this device</p>
          </div>
        </aside>

        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-7 lg:p-[34px]">
          <div className="mb-[21px] flex flex-col gap-3 border-b border-ink/10 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-h1 font-semibold leading-tight">
                {mod === "all" ? "School operations" : mod}
              </h1>
              <span className="font-mono text-micro uppercase tracking-caps text-signal">
                {visible.length} {visible.length === 1 ? "tool" : "tools"}
              </span>
            </div>
            <p className="text-ui text-dust">
              {mod === "all" ? "The school’s working day, managed in one local system." : CONSOLE_MENU[mod].desc}
            </p>
            <p className="font-mono text-label uppercase tracking-caps text-ash">
              {readiness(school.students, school.assessments).next}
            </p>
          </div>

          <div className="mb-[21px]">
            <label htmlFor="console-search" className="sr-only">Search console tools</label>
            <input
              id="console-search"
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Find ${mod === "all" ? "a file" : `${mod} tools`}...`}
              className="h-11 w-full border border-ink/10 bg-panel px-4 text-ui text-ink outline-none transition-colors placeholder:text-ash focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal/40"
              aria-label="Search tools within the console"
            />
          </div>

          {showModules ? (
            <div className="console-directory" aria-label="Product modules">
              <div className="console-directory-head"><span>Name</span><span>Contents</span><span>Type</span></div>
              {CONSOLE_MODULES.map((module) => (
                <ModuleCard key={module} module={module} onOpen={() => setMod(module)} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="border border-dashed border-ink/15 bg-panel/60 px-5 py-12 text-center" aria-live="polite">
              <p className="font-display text-h2 text-ink">No matching tools</p>
              <p className="mt-2 text-sm text-dust">Try another search or choose a different module.</p>
            </div>
          ) : (
            <div className="console-tool-directory" aria-label={`${mod} product files`}>
              <div className="console-directory-head"><span>Name</span><span>Module</span><span>Action</span></div>
              {visible.map((tool) => (
                <ToolCard key={tool.id} tool={tool} fav={favs.has(tool.id)} onFav={(event) => toggleFav(tool.id, event)} />
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
      className="console-directory-row group"
    >
      <div className="console-directory-name">
        <ModuleTile module={module} tint={menu.tint} size={34} />
        <div><h3>{module}</h3><p>{menu.desc}</p></div>
      </div>
      <span className="console-directory-count">{tools.length} {tools.length === 1 ? "file" : "files"}</span>
      <span className="console-directory-kind">DIRECTORY <span aria-hidden="true">↗</span></span>
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
    <div className="console-tool-row group">
      <Link href={`/console/${tool.id}`} aria-label={`Open ${tool.title}`} className="console-tool-open">
        <span className="console-file-glyph" aria-hidden="true" />
        <span className="console-tool-title"><strong>{tool.title}</strong><small>{tool.desc}</small></span>
        <span className="console-directory-kind">{tool.id.padStart(2, "0")}</span>
      </Link>
      <span className="console-tool-module">{tool.module}</span>
      <div className="console-tool-actions">
        <button
            type="button"
            title={fav ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={fav}
            aria-label={fav ? `Remove ${tool.title} from favourites` : `Add ${tool.title} to favourites`}
            onClick={onFav}
            className={`console-favorite ${
              fav ? "border-signal/20 bg-signal/10 text-signal" : "border-ink/10 bg-panel text-ash hover:border-ink/20 hover:text-ink"
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
    </div>
  );
}
