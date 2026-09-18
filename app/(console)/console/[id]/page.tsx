import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { CONSOLE_TOOLS, toolById } from "../../../../lib/console";
import RosterImport from "../../../../components/console/RosterImport";
import StudentRecords from "../../../../components/console/StudentRecords";
import TermReports from "../../../../components/console/TermReports";
import AutoMarking from "../../../../components/console/AutoMarking";
import GradeForecast from "../../../../components/console/GradeForecast";
import ContentStudio from "../../../../components/console/ContentStudio";
import TeacherConsole from "../../../../components/console/TeacherConsole";
import ParentConsole from "../../../../components/console/ParentConsole";

// Working tools share the same inner-page shell.
const WORKSPACES: Record<string, ComponentType> = {
  "1": StudentRecords,
  "2": TermReports,
  "7": AutoMarking,
  "8": GradeForecast,
  "9": RosterImport,
  "10": TeacherConsole,
  "11": ParentConsole,
  "15": ContentStudio
};

export default function ConsoleToolPage({ params }: { params: { id: string } }) {
  const tool = toolById(params.id);
  if (!tool) notFound();

  const ready = CONSOLE_TOOLS.filter((t) => t.status === "ready" && t.id !== tool.id);
  const Workspace = tool.status === "ready" ? WORKSPACES[tool.id] : undefined;

  return (
    <main className="flex min-h-dvh flex-col bg-void font-body text-ivory print:bg-white print:text-black">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-edge px-[21px] print:hidden">
        <div className="flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.1em] text-muted">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <polygon points="12 2 2 12 12 22 22 12 12 2" />
          </svg>
          <span>APT-LABS · Console</span>
        </div>
        <Link href="/console" className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-ivory">
          ← Console
        </Link>
      </header>

      <nav aria-label="Console workspaces" className="flex flex-wrap gap-2 border-b border-edge bg-panel px-5 py-4 print:hidden">
        {[["10", "Teacher"], ["11", "Parent"], ["15", "Content Studio"], ["1", "Student Records"]].map(([id, label]) => (
          <Link key={id} href={`/console/${id}`} aria-current={tool.id === id ? "page" : undefined}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${tool.id === id ? "border-gold bg-gold/5 text-gold" : "border-edge text-muted hover:border-edgeHi hover:text-ivory"}`}>
            {label}
          </Link>
        ))}
      </nav>
      {Workspace ? (
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-[34px] md:py-12 print:p-0">
          <div className="mb-8 print:hidden">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Console / {tool.module} / {tool.id.padStart(2, "0")}</p>
            <h1 className="font-display text-4xl font-light tracking-tight md:text-5xl">{tool.title}</h1>
            <p className="mt-3 max-w-[60ch] text-sm leading-6 text-muted">{tool.desc}</p>
          </div>
          <div>
            <Workspace key={tool.id} />
          </div>
          <div className="mt-14 print:hidden">
            <Link
              href="/console"
              className="inline-block rounded-full border border-edge px-6 py-3 text-sm font-semibold text-ivory transition hover:border-edgeHi"
            >
              ← Back to the console
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
            Console / {tool.module}
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight">{tool.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{tool.desc}</p>

          <div className="mt-10 rounded-[21px] border border-edge bg-panel p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Seat reserved</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              This workspace is not built yet, and we will not pretend otherwise. It is next in
              line for this device, and what you build on it stays local until it ships.
            </p>
          </div>

          {ready.length > 0 && (
            <div className="mt-10">
              <p className="border-b border-edge pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
                Open now on this device
              </p>
              <ul>
                {ready.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/console/${s.id}`}
                      className="flex items-baseline justify-between gap-4 border-b border-edge py-3 text-sm text-ivory transition-colors hover:text-gold"
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
              className="rounded-full border border-edge px-6 py-3 text-sm font-semibold text-ivory transition hover:border-edgeHi"
            >
              Put it on the waitlist
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
