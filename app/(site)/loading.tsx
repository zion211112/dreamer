/**
 * Route-segment loading state.
 *
 * Loading is rendered as the ruled register the route is about to show
 * — five rows of the same hairlines, in the same rhythm — so the wait
 * is spent inside the system rather than in front of it. The pulse is
 * disabled by the global reduced-motion rule; the bars remain as static
 * placeholders, which is the honest fallback: structure while you wait.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">
        Loading surface — records are being read on this device.
      </span>

      <p className="label" aria-hidden="true">
        Loading · Reading records
      </p>

      <div className="load" aria-hidden="true" style={{ marginTop: 26 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="load-row" key={i}>
            <div className="load-bar load-bar--short" />
            <div className="load-bar" />
            <div className="load-bar load-bar--short" />
            <div className="load-bar load-bar--short" />
          </div>
        ))}
      </div>
    </div>
  );
}
