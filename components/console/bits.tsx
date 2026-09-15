"use client";

// Shared chrome for the console workspaces. Same language as the grid:
// obsidian, panel, gold, mono labels. The gate is the Notion move — a tool
// with no data yet tells you the one action that unblocks it, not "soon".

import Link from "next/link";

export const monoLabel = "font-mono text-[11px] uppercase tracking-[0.25em] text-dim";
export const panel = "rounded-[21px] border border-edge bg-panel p-[21px]";
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
