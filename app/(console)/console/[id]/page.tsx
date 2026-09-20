import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ComponentType } from "react";
import { CONSOLE_MENU, toolById } from "../../../../lib/console";
import { ModuleTile } from "../../../../components/console/bits";
import RosterImport from "../../../../components/console/RosterImport";
import TermReports from "../../../../components/console/TermReports";
import AutoMarking from "../../../../components/console/AutoMarking";
import GradeForecast from "../../../../components/console/GradeForecast";
import TimetableSolver from "../../../../components/console/TimetableSolver";
import MyDayWorkspace from "../../../../components/console/MyDayWorkspace";
import ContentStudio from "../../../../components/console/ContentStudio";
import FeeTracking from "../../../../components/console/FeeTracking";
import Inspection from "../../../../components/console/Inspection";
import Comms from "../../../../components/console/Comms";

// Every tool opens a workspace — ten seats, ten workspaces. The teacher's
// week runs in order: Roster (9) → Timetable Solver (6, build + print +
// approve) → My Day (17, Today reads the approved week) → Auto-Marking (7,
// the weakness map) → Term Reports (2, the record of it).
const WORKSPACES: Record<string, ComponentType> = {
  "2": TermReports,
  "3": FeeTracking,
  "4": Inspection,
  "6": TimetableSolver,
  "7": AutoMarking,
  "8": GradeForecast,
  "9": RosterImport,
  "12": Comms,
  "17": MyDayWorkspace,
  "18": ContentStudio
};

// The teacher's path, in order. Numbered 01–05 in the shell; anything off
// it says so with an amber chip instead of a silent dead step.
const STEPS: Array<[string, string]> = [
  ["9", "Roster"],
  ["6", "Timetable"],
  ["17", "My Day"],
  ["7", "Mark"],
  ["2", "Reports"]
];

export default function ConsoleToolPage({ params }: { params: { id: string } }) {
  const tool = toolById(params.id);
  if (!tool) notFound();

  const Workspace = WORKSPACES[tool.id];
  if (!Workspace) notFound();
  const menu = CONSOLE_MENU[tool.module];

  return (
    <main className="flex min-h-dvh flex-col bg-void font-body text-ivory print:bg-white print:text-black">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-ivory/8 px-[21px] print:hidden">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 22 12 12 22 2 12" />
          </svg>
          <span>APT-LABS · Console</span>
        </div>
        <Link href="/console" className="min-h-11 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-ivory focus-visible:text-signal">
          ← Console
        </Link>
      </header>

      {/* The week, in order — a numbered stepper instead of a wall of chips. */}
      <nav aria-label="Console workspaces" className="flex items-center gap-4 overflow-x-auto border-b border-ivory/8 bg-panel px-5 py-4 print:hidden">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.28em] text-dim">The week, in order</span>
        {!STEPS.some(([s]) => s === tool.id) && (
          <span className="rounded-full bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber/90 ring-1 ring-inset ring-amber/25">
            Off the week path
          </span>
        )}
        {STEPS.map(([id, label], i) => (
          <Fragment key={id}>
            <Link
              href={`/console/${id}`}
              aria-current={tool.id === id ? "page" : undefined}
              className="group flex min-h-11 shrink-0 items-center gap-2.5"
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[11px] transition-colors ${
                  tool.id === id
                    ? "border-amber/60 bg-amber/10 text-amber"
                    : "border-ivory/10 bg-ivory/5 text-muted group-hover:border-ivory/30 group-hover:text-ivory"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`text-[13px] font-medium transition-colors ${tool.id === id ? "text-ivory" : "text-muted group-hover:text-ivory"}`}>
                {label}
              </span>
            </Link>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-ivory/15" />}
          </Fragment>
        ))}
      </nav>
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-[34px] md:py-12 print:p-0">
          <div className="mb-8 flex flex-wrap items-start gap-4 border-b border-ivory/10 pb-6 print:hidden">
            <ModuleTile module={tool.module} tint={menu?.tint} size={52} />
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
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
              className="inline-flex min-h-11 items-center border border-ivory/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-signal hover:text-signal focus-visible:text-signal"
            >
              ← Back to the console
            </Link>
          </div>
      </div>
    </main>
  );
}
