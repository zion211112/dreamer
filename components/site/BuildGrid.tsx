import Link from "next/link";
import { BUILDS, BUILD_RULE, LIVE_BUILDS, PLANE, PLANNED_BUILDS } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The build annex — the grammar, instantiated, and reachable from a field.
 *
 * A build is not a sixth node. Each one hangs off the plane node that
 * carries its heaviest stage, and every card says which — so the six
 * builds are visibly instances of the five fields rather than a
 * parallel hierarchy competing with them.
 *
 * The School Console is not the product, it is *an example of the
 * product*. It is listed first because it is the only one with a
 * surface to open, not because it is the most important domain. The
 * other five are stated as architectures with no route, no figure, and
 * no date, which is the only honest way to publish them.
 *
 * The nodes are deliberately *not* connected by edges, even though the
 * console genuinely is wired to the loop. A node with an edge implies a
 * flow that is running; four fifths of these rows have nothing running
 * at all. The connection is stated once, in BUILD_RULE, instead of
 * being drawn five times in a way that would overclaim.
 */
export function BuildGrid() {
  const fieldOf = (key: string) => PLANE.find((n) => n.key === key);

  return (
    <>
      <ol className="builds">
        {BUILDS.map((build, i) => {
          const field = fieldOf(build.node);
          const inner = (
            <>
              <span className="node-port" aria-hidden="true" />
              <span className="node-ord figure">{String(i + 1).padStart(2, "0")}</span>
              <span className="node-name">{build.name}</span>
              <span className="build-domain">{build.domain}</span>
              <span className="build-chain">{build.chain}</span>
              {/* Which field this one exercises. Without this the six
                  read as a sixth hierarchy instead of as instances. */}
              {field && (
                <span className="build-prov">
                  <Link href={field.href} className="link">
                    Field {field.ord} · {field.name}
                  </Link>
                </span>
              )}
              <span className="build-prov">{build.provenance}</span>
              <span className="node-state">
                <StateTag state={build.state} />
              </span>
            </>
          );

          return (
            <li className="graph-cell" key={build.name}>
              {build.href ? (
                <Link className="node build-node" href={build.href}>
                  {inner}
                  <span className="build-open">
                    Open the surface <span className="glyph">→</span>
                  </span>
                </Link>
              ) : (
                <div className="node build-node">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="local-note" style={{ marginTop: "var(--s-4)" }}>
        <strong>{BUILD_RULE}</strong>
      </p>

      <p className="builds-caption">
        <span className="figure">{LIVE_BUILDS.length}</span> built ·{" "}
        <span className="figure">{PLANNED_BUILDS.length}</span> designed, not
        built. A planned build carries no figure anywhere on this site,
        because a design has none to carry — and the ones without a route
        are not links, because there is nothing behind them to open. To
        work on one rather than read about it, go to the{" "}
        <Link href="/builds" className="link">
          build floor
        </Link>
        .
      </p>
    </>
  );
}