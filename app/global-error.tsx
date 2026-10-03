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
          background: "#04060a",
          color: "#edf1f6",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
          fontSize: 16,
          lineHeight: 1.5,
          colorScheme: "dark",
        }}
      >
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "'DM Mono', ui-monospace, Menlo, Consolas, monospace",
              fontSize: 11.31,
              fontWeight: 500,
              letterSpacing: "0.00433em",
              textTransform: "uppercase",
              color: "#8795a6",
            }}
          >
            Shell error · Layout not rendered
          </p>
          <h1
            style={{
              margin: "14px 0 0",
              fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
              fontSize: 45.25,
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: "-0.013em",
            }}
          >
            The shell failed to render.
          </h1>
          <p style={{ margin: "18px 0 0", maxWidth: "58ch", color: "#b4c1d0" }}>
            The failure is in the outermost frame, before any page could be
            built. Records on this device are stored in the browser and are not
            affected. Reloading restores the shell; if it fails again, the
            digest below is the reference to cite.
          </p>
          <p
            style={{
              margin: "26px 0 0",
              fontFamily: "'DM Mono', ui-monospace, Menlo, Consolas, monospace",
              fontSize: 11.31,
              color: "#7a8899",
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
              border: "1px solid #35d9a4",
              borderRadius: 2,
              background: "#35d9a4",
              color: "#04060a",
              font: "inherit",
              fontSize: 13.45,
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
