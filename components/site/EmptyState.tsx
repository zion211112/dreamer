/**
 * The meaningful empty state — the FIELD STATION grammar's most
 * load-bearing component.
 *
 * An empty register is not an error and not a placeholder. It tells the
 * operator what the system has not observed, what would legitimately
 * appear here, and why the absence is currently correct. "NOTHING
 * REGISTERED YET" without those three sentences is a bug: it reads as
 * broken software and trains the reader to distrust honest empties.
 */
export function EmptyState({
  title = "Nothing registered yet",
  body,
  /** What one row in this register would be. */
  unit,
  /** Why it is legitimately empty right now. */
  why,
  /** What would have to happen for a row to appear. */
  unblocks,
  state,
}: {
  title?: string;
  body: string;
  unit: string;
  why: string;
  unblocks: string;
  state?: string;
}) {
  const meta: [string, string][] = [
    ["Unit", `One row per ${unit}.`],
    ["State", state ?? "UNKNOWN — not yet established."],
    ["Why empty", why],
    ["What fills it", unblocks],
  ];

  return (
    <div className="empty" role="note">
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
      <div className="empty-meta">
        {meta.map(([key, val]) => (
          <div className="empty-meta-row" key={key}>
            <span className="empty-meta-key">{key}</span>
            <span className="empty-meta-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}