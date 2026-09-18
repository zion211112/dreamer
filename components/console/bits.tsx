"use client";

// Shared chrome for the console workspaces. Same language as the grid:
// obsidian, panel, gold, mono labels. The gate is the Notion move — a tool
// with no data yet tells you the one action that unblocks it, not "soon".

import Link from "next/link";

export const monoLabel = "font-mono text-[11px] uppercase tracking-[0.25em] text-dim";
export const panel = "min-w-0 rounded-[21px] border border-edge bg-panel p-[21px]";
export const moduleField = "mt-2 block w-full min-w-0 rounded-xl border border-edge bg-void px-3 py-2.5 text-sm leading-6 text-ivory outline-none focus:border-gold";
export const quietAction = "rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-panelHi hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-40";
export const btn =
  "rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40";
export const btnGhost =
  "rounded-full border border-edge px-6 py-3 text-sm font-semibold text-ivory transition hover:border-edgeHi";
export const field =
  "w-full rounded-full border border-edge bg-panel px-5 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-dim focus:border-gold";
export const cellInput =
  "w-16 rounded-lg border border-edge bg-panel px-2 py-1.5 text-right font-mono text-[12px] text-ivory outline-none transition-colors focus:border-gold";

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
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Waiting</p>
        <h2 className="mt-3 font-display text-2xl font-light">{title}</h2>
        <p className="mt-2 max-w-[52ch] text-sm leading-6 text-muted">{body}</p>
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
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold print:hidden"
    >
      ⎙ {label}
    </button>
  );
}

export function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" }) {
  return (
    <p
      className={`mt-4 font-mono text-[12px] leading-5 ${tone === "ok" ? "text-emerald-400" : "text-gold"}`}
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
    <div className="mb-[21px] flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-3">
      <span className={monoLabel}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">{right}</div>
    </div>
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

export function ToolCard({
  tool,
  fav,
  onFav
}: {
  tool: { id: string; title: string; desc: string; module: string; status: "ready" | "coming" };
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
