import type { Metadata } from "next";
import Link from "next/link";
import { CompanyWorkspace } from "@/components/site/CompanyWorkspace";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = {
  title: "Not found",
  description:
    "This route is not in the register. The system layers and their evidence remain available in the APT-LABS workspace.",
};

/**
 * The 404, written in the system's own grammar.
 *
 * An unknown address is rendered as an empty register: named, explained,
 * and pointed at the system surfaces that do exist.
 * "Page not found" would be a foreign sentence on a site whose whole
 * claim is that absence is stated precisely.
 */
export default function NotFound() {
  return (
    <CompanyWorkspace fallbackLabel="Unregistered file">
    <div className="sheet">
      <Link href="/" className="plane-wordmark">
        <span className="plane-mark" aria-hidden="true" />
        APT-LABS
      </Link>

      <p className="label" style={{ marginTop: "var(--s-5)" }}>
        404 · Not registered
      </p>
      <h1 className="page-title">This route is not in the register.</h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          APT-LABS is organized around five dependent layers. This address is
          not one of their records or routes; nothing is hidden behind it.
          The system map and evidence remain open to inspect.
        </p>
      </div>

      <div style={{ marginTop: 32 }}>
        <EmptyState
          title="Nothing registered at this address"
          body="No surface, record or node answers to the address you opened. Nothing was withheld and nothing failed — the address simply is not part of this system."
          unit="route"
          why="The system publishes only surfaces that resolve to a declared record; an address outside that set was never minted."
          unblocks="Returning to the overview, reading the five-layer stack, or opening the evidence ledger."
          state="UNKNOWN — not an error state. The route's non-existence is a fact about the system, not a failure of it."
        />
      </div>

      <nav aria-label="System routes" className="action-row" style={{ marginTop: 28 }}>
        <Link href="/" className="btn-ghost">APT-LABS overview</Link>
        <Link href="/stack" className="btn-ghost">Five-layer system</Link>
        <Link href="/evidence" className="btn-ghost">Evidence ledger</Link>
      </nav>

      <div className="action-row" style={{ marginTop: 16 }}>
        <Link href="/evidence" className="link">
          Read what the system does not yet know
        </Link>
        <Link href="/contact" className="link">Contact APT-LABS</Link>
      </div>
    </div>
    </CompanyWorkspace>
  );
}
