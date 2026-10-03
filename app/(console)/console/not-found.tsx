import Link from "next/link";

/**
 * Console-segment 404. Reached when /console/[id] is handed an id that
 * is not one of the ten seats. It keeps the console chrome instead of
 * dropping the operator onto the public 404 — and it states the same
 * fact the public one does: nothing was withheld, the seat does not
 * exist, and records on this device are untouched.
 */
export default function ConsoleNotFound() {
  return (
    <main
      id="main-content"
      className="console-ui flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-ink"
    >
      <p className="font-mono text-label uppercase tracking-caps text-ash">
        Console · Seat not found
      </p>
      <h1 className="mt-4 max-w-[22ch] text-center font-display text-4xl font-semibold tracking-tight">
        No workspace answers to this address.
      </h1>
      <p className="mt-4 max-w-[54ch] text-center text-sm leading-6 text-dust">
        The console has ten seats, numbered 2, 3, 4, 6, 7, 8, 9, 12, 17 and
        18. An id outside that set is not a hidden workspace — it does not
        exist. Nothing you entered on this device is affected.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/console"
          className="inline-flex min-h-11 items-center border border-signal bg-signal px-6 py-3 text-sm font-semibold text-void transition hover:bg-signalDim"
        >
          ← Back to the console
        </Link>
        <Link
          href="/control"
          className="inline-flex min-h-11 items-center border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
        >
          About this surface
        </Link>
      </div>
    </main>
  );
}
