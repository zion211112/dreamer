import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ComponentType } from "react";
import { CONSOLE_MENU, CONSOLE_TOOLS, toolById } from "../../../../lib/console";
import { ModuleTile } from "../../../../components/console/bits";
import RosterImport from "../../../../components/console/RosterImport";
import TermReports from "../../../../components/console/TermReports";
import AutoMarking from "../../../../components/console/AutoMarking";
import GradeForecast from "../../../../components/console/GradeForecast";
import TimetableSolver from "../../../../components/console/TimetableSolver";
import MyDayWorkspace from "../../../../components/console/MyDayWorkspace";
import ContentStudio from "../../../../components/console/ContentStudio";

// Working tools share the same inner-page shell.
// Content Studio builds the material; Auto-Marking marks it; the teacher's
// week runs Roster (9) → Timetable Solver (6, build + print + approve)
// → My Day (17, Today reads the approved week) → Term Reports (2).
const WORKSPACES: Record<string, ComponentType> = {
  "2": TermReports,
  "6": TimetableSolver,
  "7": AutoMarking,
  "8": GradeForecast,
  "9": RosterImport,
  "17": MyDayWorkspace,
  "18": ContentStudio
};

// The teacher's path, in order. Numbered 01–04 in the shell.
const STEPS: Array<[string, string]> = [
  ["9", "Roster"],
  ["6", "Timetable"],
  ["17", "My Day"],
  ["2", "Reports"]
];

export default function ConsoleToolPage({ params }: { params: { id: string } }) {
  const tool = toolById(params.id);
  if (!tool) notFound();

  const ready = CONSOLE_TOOLS.filter((t) => t.status === "ready" && t.id !== tool.id);
  const Workspace = tool.status === "ready" ? WORKSPACES[tool.id] : undefined;
  const menu = CONSOLE_MENU[tool.module];

  return (
    <main className="flex min-h-dvh flex-col bg-void font-body text-ivory print:bg-white print:text-black">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-white/8 px-[21px] print:hidden">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#d4af37" aria-hidden="true">
            <polygon points="12 2 22 12 12 22 2 12" />
          </svg>
          <span>APT-LABS · Console</span>
        </div>
        <Link href="/console" className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-ivory">
          ← Console
        </Link>
      </header>

      {/* The week, in order — a numbered stepper instead of a wall of chips. */}
      <nav aria-label="Console workspaces" className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-white/8 bg-panel px-5 py-4 print:hidden">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">The week, in order</span>
        {STEPS.map(([id, label], i) => (
          <Fragment key={id}>
            <Link
              href={`/console/${id}`}
              aria-current={tool.id === id ? "page" : undefined}
              className="group flex items-center gap-2.5"
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] transition-colors ${
                  tool.id === id
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/5 text-muted group-hover:border-white/30 group-hover:text-ivory"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`text-[13px] font-medium transition-colors ${tool.id === id ? "text-ivory" : "text-muted group-hover:text-ivory"}`}>
                {label}
              </span>
            </Link>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-white/15" />}
          </Fragment>
        ))}
      </nav>
      {Workspace ? (
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-[34px] md:py-12 print:p-0">
          <div className="mb-8 flex flex-wrap items-start gap-4 print:hidden">
            <ModuleTile module={tool.module} tint={menu?.tint} size={52} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                Console / {tool.module} / {tool.id.padStart(2, "0")}
              </p>
              <h1 className="font-display text-4xl font-light tracking-tight md:text-5xl">{tool.title}</h1>
              <p className="mt-3 max-w-[60ch] text-sm leading-6 text-muted">{tool.desc}</p>
            </div>
          </div>
          <div>
            <Workspace key={tool.id} />
          </div>
          <div className="mt-14 print:hidden">
            <Link
              href="/console"
              className="inline-block rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-white/35"
            >
              ← Back to the console
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
          <div className="flex flex-wrap items-start gap-4">
            <ModuleTile module={tool.module} tint={menu?.tint} size={52} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
                Console / {tool.module}
              </p>
              <h1 className="mt-4 font-display text-4xl font-light tracking-tight">{tool.title}</h1>
              <p className="mt-3 text-sm leading-6 text-muted">{tool.desc}</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-panel p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Seat reserved</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              This workspace is not built yet, and we will not pretend otherwise. It is next in
              line for this device, and what you build on it stays local until it ships.
            </p>
          </div>

          {ready.length > 0 && (
            <div className="mt-10">
              <p className="border-b border-white/10 pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
                Open now on this device
              </p>
              <ul>
                {ready.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/console/${s.id}`}
                      className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 text-sm text-ivory transition-colors hover:text-gold"
                    >
                      <span>{s.title}</span>
                      <span className="text-[12px] text-dim">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/console"
              className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold"
            >
              Back to the console
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-white/35"
            >
              Put it on the waitlist
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
