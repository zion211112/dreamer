"use client";

// Shared chrome for the console workspaces. Same language as the grid:
// obsidian, panel, gold, mono labels. The gate is the Notion move — a tool
// with no data yet tells you the one action that unblocks it, not "soon".

import Link from "next/link";

export const monoLabel = "font-mono text-label uppercase tracking-[0.25em] text-ash";
export const panel = "min-w-0 border border-ink/10 bg-panel p-[21px]";
export const moduleField = "mt-2 block min-h-11 w-full min-w-0 border border-ink/10 bg-void px-3 py-2.5 text-sm leading-6 text-ink outline-none focus:border-signal";
export const quietAction = "min-h-11 px-3 py-2 text-sm text-dust transition-colors hover:bg-edge hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-40";
export const btn =
  "min-h-11 border border-signal bg-signal px-6 py-3 text-sm font-semibold text-void transition hover:bg-signalDim disabled:cursor-not-allowed disabled:opacity-40";
export const btnGhost =
  "min-h-11 border border-ink/10 px-6 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal";
export const field =
  "min-h-11 w-full border border-ink/10 bg-panel px-5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ash focus:border-signal";
export const cellInput =
  "min-h-11 w-16 border border-ink/10 bg-panel px-2 py-1.5 text-right font-mono text-meta text-ink outline-none transition-colors focus:border-signal";

export function Loading() {
  return <p className={`${monoLabel} py-16 text-center`}>Reading the roll…</p>;
}

export function Gate({
  title,
  body,
  href = "/console/9",
  cta = "Import the roster"
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className={`${panel} flex min-h-[220px] flex-col justify-between`}>
      <div>
        <span className="inline-flex items-center gap-1.5 border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-micro uppercase tracking-[0.14em] text-signal">
          <span className="h-1.5 w-1.5 rounded-full bg-signal/80" aria-hidden="true" />
          Waiting
        </span>
        <h2 className="mt-4 font-serif text-2xl font-light">{title}</h2>
        <p className="mt-2 max-w-[52ch] text-sm leading-6 text-dust">{body}</p>
      </div>
      <div>
        <Link href={href} className={btn}>
          {cta} →
        </Link>
      </div>
    </div>
  );
}

export function PrintButton({ label = "Print", onClick }: { label?: string; onClick?: () => void }) {
  // The small print path. Deliberately quiet: a mono pill that lights gold
  // on hover, hidden in print like every other piece of screen chrome.
  return (
    <button
      type="button"
      onClick={onClick ?? (() => window.print())}
      title="Print this sheet — or save it as PDF"
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 font-mono text-label uppercase tracking-wider text-dust transition-colors hover:border-signal hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal print:hidden"
    >
      ⎙ {label}
    </button>
  );
}

export function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" }) {
  // Two distinct tones. Warnings used to render identically to success because
  // a stylesheet remapped every amber class onto --signal.
  return (
    <p
      role={tone === "warn" ? "alert" : "status"}
      className={`mt-4 font-mono text-meta leading-5 ${tone === "ok" ? "text-signal" : "text-danger"}`}
    >
      {children}
    </p>
  );
}

export function HeadRow({
  label,
  right
}: {
  label: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-[21px] flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
      <span className={monoLabel}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">{right}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Module glyph system. One stroke icon per module, one pastel tile,  */
/* one status chip. The console grid and the tool shell both render  */
/* through these, so a module looks the same everywhere it appears.  */
/* ---------------------------------------------------------------- */

export const MODULE_ICONS: Record<string, JSX.Element> = {
  all: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  "Content Studio": (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  "Auto-Marking": (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  "My Day": (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 12" />
    </>
  ),
  Timetable: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  Roster: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  Reports: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  Fees: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  Inspection: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 11.5 11.5 14 15 9.5" />
    </>
  ),
  Comms: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};

export function ModuleGlyph({
  module,
  size = 15,
  className = ""
}: {
  module: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      {MODULE_ICONS[module] ?? MODULE_ICONS.all}
    </svg>
  );
}

// The pastel tile: a bordered, tinted rounded square holding the module
// glyph. Tint comes from CONSOLE_MENU — one chip colour per module.
export function ModuleTile({
  module,
  tint,
  size = 44
}: {
  module: string;
  tint?: string;
  size?: number;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl border ${tint ?? "border-ink/10 bg-ink/5 text-dust"}`}
      style={{ width: size, height: size }}
    >
      <ModuleGlyph module={module} size={Math.round(size * 0.44)} />
    </span>
  );
}

export function Diamond({
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
