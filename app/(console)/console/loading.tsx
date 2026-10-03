/**
 * Console loading state. The session is read from this device before
 * anything can render, so the wait is one local read — but it still
 * gets an honest surface rather than a blank flash: the console's own
 * header, the state it is in, and nothing invented to fill the space.
 */
export default function ConsoleLoading() {
  return (
    <div
      id="main-content"
      className="console-ui flex h-dvh flex-col bg-void font-sans text-ink"
    >
      <p role="status" aria-live="polite" className="sr-only">
        Reading the local console session.
      </p>
      <div
        aria-hidden="true"
        className="flex h-[55px] shrink-0 items-center gap-3 border-b border-ink/10 px-4 font-mono text-meta uppercase tracking-[0.14em] text-dust sm:px-[21px]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
        <span>APT-LABS · Console</span>
      </div>
      <div className="flex flex-1 items-center justify-center" aria-hidden="true">
        <p className="font-mono text-micro uppercase tracking-[0.2em] text-ash">
          Reading local session · Nothing leaves this device
        </p>
      </div>
    </div>
  );
}
