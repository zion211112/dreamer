import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { PLANE } from "@/lib/system";

export const metadata: Metadata = {
  title: "Not found",
  description:
    "This route is not in the register. Every surface the system publishes is listed on the control plane.",
};

/**
 * The 404, written in the system's own grammar.
 *
 * A dead route is a record that does not exist, so it is rendered as an
 * empty register: named, explained, and pointed at what does exist.
 * "Page not found" would be a foreign sentence on a site whose whole
 * claim is that absence is stated precisely.
 */
export default function NotFound() {
  return (
    <main
      id="main-content"
      className="plane-main"
      style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 96px" }}
    >
      <Link href="/" className="plane-wordmark">
        APT-LABS
      </Link>

      <p className="label" style={{ marginTop: 44 }}>
        404 · Not registered
      </p>
      <h1 className="page-title">This route is not in the register.</h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          The system publishes five public nodes and no others. A URL that
          resolves to nothing is not a hidden surface — it is a surface that
          does not exist, and saying so plainly is the same rule the register
          applies to every other absence.
        </p>
      </div>

      <div style={{ marginTop: 32 }}>
        <EmptyState
          title="Nothing registered at this address"
          body="No surface, record or node answers to the address you opened. Nothing was withheld and nothing failed — the address simply is not part of this system."
          unit="route"
          why="The published routes are enumerated in lib/system.ts and rendered in the control plane rail; an address outside that set was never minted."
          unblocks="Opening one of the five node routes below. Each one is a live surface with its evidence state on it."
          state="UNKNOWN — not an error state. The route's non-existence is a fact about the system, not a failure of it."
        />
      </div>

      <nav aria-label="Published nodes" className="action-row" style={{ marginTop: 28 }}>
        {PLANE.map((node) => (
          <Link key={node.key} href={node.href} className="btn-ghost">
            {node.ord} · {node.name}
          </Link>
        ))}
      </nav>

      <div className="action-row" style={{ marginTop: 16 }}>
        <Link href="/evidence" className="link">
          Or read what the system does not yet know
        </Link>
      </div>
    </main>
  );
}
