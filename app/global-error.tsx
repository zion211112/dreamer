"use client";

/**
 * The last line of defence: a fault in the root layout itself, where
 * the design system's stylesheet may not have loaded. Styles are
 * therefore inline, but the grammar is unchanged — label, statement,
 * rule, and the state of the surface (UNKNOWN, because a shell failure
 * establishes nothing about the record).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f6f6f4",
          color: "#14181c",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "'DM Mono', ui-monospace, Menlo, Consolas, monospace",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#39414a",
            }}
          >
            Shell error · Layout not rendered
          </p>
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            The shell failed to render.
          </h1>
          <p style={{ margin: "18px 0 0", maxWidth: "58ch", color: "#39414a" }}>
            The failure is in the outermost frame, before any page could be
            built. Records on this device are stored in the browser and are not
            affected. Reloading restores the shell; if it fails again, the
            digest below is the reference to cite.
          </p>
          <p
            style={{
              margin: "26px 0 0",
              fontFamily: "'DM Mono', ui-monospace, Menlo, Consolas, monospace",
              fontSize: 11,
              color: "#646c77",
            }}
          >
            {error.digest
              ? `Error digest ${error.digest}`
              : "No digest issued — state UNKNOWN, not nothing."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              minHeight: 44,
              padding: "0 20px",
              border: "1px solid #0a7549",
              borderRadius: 2,
              background: "#0a7549",
              color: "#ffffff",
              font: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload the shell
          </button>
        </main>
      </body>
    </html>
  );
}
