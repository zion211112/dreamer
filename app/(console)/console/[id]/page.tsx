import ConsoleSession from "../../../../components/console/ConsoleSession";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ComponentType } from "react";
import { CONSOLE_MENU, toolById } from "../../../../lib/console";
import { ModuleGlyph, ModuleTile } from "../../../../components/console/bits";
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

// The module rail — every workspace in one quiet tab strip. No step
// numbering, no "off the path" chip: the console is a toolkit, and the
// week is just the way most people happen to use it.
const RAIL: Array<[string, string]> = [
  ["9", "Roster"],
  ["6", "Timetable"],
  ["17", "My Day"],
  ["7", "Mark"],
  ["2", "Reports"],
  ["8", "Forecast"],
  ["3", "Fees"],
  ["4", "Inspection"],
  ["18", "Studio"],
  ["12", "Comms"]
];

export default function ConsoleToolPage({ params }: { params: { id: string } }) {
  const tool = toolById(params.id);
  if (!tool) notFound();

  const Workspace = WORKSPACES[tool.id];
  if (!Workspace) notFound();
  const menu = CONSOLE_MENU[tool.module];

  return (
    <main id="main-content" className="console-ui console-product-ui min-h-dvh bg-void font-sans text-ink print:bg-white print:text-black">
      <header className="console-product-topbar print:hidden">
        <div className="console-product-breadcrumb">
          <Link href="/">APT-LABS</Link><span>/</span><Link href="/stack">SYSTEM</Link><span>/</span><Link href="/console">RECORDS</Link><span>/</span><strong>{tool.title}</strong>
        </div>
        <Link href="/contact" className="console-contact-link">Contact APT-LABS <span aria-hidden="true">↗</span></Link>
      </header>

      <div className="console-product-workspace">
        <aside className="console-product-explorer print:hidden" aria-label="Operations files">
          <p className="console-product-folder">OPERATIONS / FILES</p>
          <Link className="console-product-all" href="/console"><span aria-hidden="true">⌂</span> All records</Link>
          <nav aria-label="Console tool files">
            {RAIL.map(([id, label]) => {
              const t = toolById(id);
              if (!t) return null;
              const isActive = tool.id === id;
              return (
                <Link
                  key={id}
                  href={`/console/${id}`}
                  aria-current={isActive ? "page" : undefined}
                  className="console-product-file"
                  data-current={isActive || undefined}
                  title={t.desc}
                >
                  <span className="console-file-glyph" aria-hidden="true" />
                  <span>{label}</span>
                  <ModuleGlyph module={t.module} size={13} className={isActive ? "text-signal" : "text-ash"} />
                </Link>
              );
            })}
          </nav>
          <div className="console-product-explorer-foot">LOCAL DATA<br />ON THIS DEVICE</div>
        </aside>

        <div className="console-product-document">
          <div className="console-product-pathbar"><span>RECORDS</span><span>/</span><span>{tool.module.toUpperCase()}</span><span>/</span><strong>{tool.id.padStart(2, "0")} · {tool.title}</strong></div>
          <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-[34px] sm:py-10 md:px-[34px] md:py-12 print:p-0">
          <div className="mb-8 flex min-w-0 flex-wrap items-start gap-4 border-b border-ink/10 pb-6 print:hidden">
            <ModuleTile module={tool.module} tint={menu?.tint} size={52} />
            <div>
              <p className="mb-2 font-mono text-label uppercase tracking-caps text-signal">
                {tool.module} / {tool.id.padStart(2, "0")} / LOCAL FILE
              </p>
              <h1 className="font-display text-h2 font-semibold leading-tight">{tool.title}</h1>
              <p className="mt-3 max-w-[60ch] text-sm leading-6 text-dust">{tool.desc}</p>
            </div>
          </div>
          <div>
            <ConsoleSession>
              <Workspace key={tool.id} />
            </ConsoleSession>
          </div>
          <div className="mt-14 print:hidden">
            <Link
              href="/console"
              className="inline-flex min-h-11 items-center border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal focus-visible:text-signal"
            >
              ← Back to the console
            </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
