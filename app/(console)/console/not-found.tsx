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
    <main id="main-content" className="console-ui console-product-ui min-h-dvh bg-void text-ink">
      <header className="console-product-topbar">
        <div className="console-product-breadcrumb"><Link href="/">APT-LABS</Link><span>/</span><Link href="/console">RECORDS</Link><span>/</span><strong>Unregistered file</strong></div>
        <Link href="/contact" className="console-contact-link">Contact <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="console-product-document">
        <div className="console-product-pathbar"><span>LOCAL RECORDS</span><span>/</span><strong>NO FILE AT THIS ADDRESS</strong></div>
        <section className="sheet" aria-labelledby="console-missing-title">
          <p className="font-mono text-label uppercase tracking-caps text-ash">Console file · not registered</p>
          <h1 id="console-missing-title" className="mt-4 max-w-[22ch] font-display text-h1 font-semibold leading-tight">No workspace answers to this address.</h1>
          <p className="mt-4 max-w-[54ch] text-sm leading-6 text-dust">
            This workspace has ten registered files. An address outside that set is not hidden; it does not exist. Nothing you entered on this device is affected.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/console"
          className="inline-flex min-h-11 items-center border border-signal bg-signal px-6 py-3 text-sm font-semibold text-void transition hover:bg-signalDim"
        >
          ← All records
        </Link>
        <Link
          href="/control"
          className="inline-flex min-h-11 items-center border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
        >
          APT-LABS system
        </Link>
      </div>
        </section>
      </div>
    </main>
  );
}
