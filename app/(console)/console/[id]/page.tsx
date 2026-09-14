import Link from "next/link";
import { notFound } from "next/navigation";
import { CONSOLE_TOOLS, toolById } from "../../../../lib/console";

// A tool's landing page inside the console: where its workspace will live.
// The module is real, the seat is reserved — the workspace ships next.
export default function ConsoleToolPage({ params }: { params: { id: string } }) {
  const tool = toolById(params.id);
  if (!tool) notFound();

  const siblings = CONSOLE_TOOLS.filter((t) => t.module === tool.module && t.id !== tool.id);

  return (
    <main className="flex min-h-dvh flex-col bg-void font-body text-ivory">
      <header className="flex h-[55px] shrink-0 items-center justify-between border-b border-edge px-[21px]">
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

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          Console / {tool.module}
        </p>
        <h1 className="mt-4 font-display text-4xl font-light tracking-tight">{tool.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{tool.desc}</p>

        <div className="mt-10 rounded-[21px] border border-edge bg-panel p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">Workspace</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            This module&apos;s workspace ships in the next cut. The seat is held — it will open on
            this device when it does, with everything you build on it staying local.
          </p>
        </div>

        {siblings.length > 0 && (
          <div className="mt-10">
            <p className="border-b border-edge pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
              {tool.module === "Console" ? "Also on the console" : `More in ${tool.module}`}
            </p>
            <ul>
              {siblings.map((s) => (
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
            href="/"
            className="rounded-full border border-edge px-6 py-3 text-sm font-semibold text-ivory transition hover:border-edgeHi"
          >
            The ledger
          </Link>
        </div>
      </div>
    </main>
  );
}
