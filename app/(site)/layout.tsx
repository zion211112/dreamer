import { NodeIndex } from "@/components/site/NodeIndex";
import { NodeRecord } from "@/components/site/NodeRecord";
import { NodeGraph } from "@/components/site/Graph";

/**
 * The workspace — the shell shared by every public route.
 *
 * Two columns, and the split is arithmetic rather than taste:
 *
 *   THE RAIL    the node index (every node published here, grouped by
 *               kind) above the node record (what the selected node is,
 *               holds, and why its state). Both are statements *about*
 *               the system; they share a rail because they are the same
 *               kind of thing, and because the plane needs the width.
 *   THE PLANE   the route, above a compact spine that says where in the
 *               loop the reader has arrived.
 *
 * This is the one structural bet of the design: a system whose whole
 * claim is inspectability should be laid out the way an inspection tool
 * is laid out, with the thing you selected always visible rather than
 * scrolled away. Everything else on the page is secondary to that.
 *
 * The compact spine hides itself on the homepage, where the full canvas
 * graph renders instead — one statement per screen, never two.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="plane">
      <div className="plane-rail">
        <NodeIndex />
        <NodeRecord />
      </div>

      <main className="plane-main canvas" id="main-content">
        <NodeGraph variant="spine" />
        {children}
      </main>
    </div>
  );
}