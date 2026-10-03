import Link from "next/link";
import { BUILDS, LIVE_BUILDS, PLANNED_BUILDS } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The build annex — the grammar, instantiated.
 *
 * This is the component that stops the site from being a marketing page
 * for one school console. Six builds run the same seven-stage chain;
 * exactly one of them is built, and it is not first because it is the
 * most important domain — it is first because it is the only one with a
 * surface to open. The other five are stated as architectures with no
 * route, no figure, and no date, which is the only honest way to
 * publish them.
 *
 * The nodes are deliberately *not* connected by edges, even though the
 * console genuinely is wired to the loop. A node with an edge implies a
 * flow that is running; four fifths of these rows have nothing running
 * at all. The connection is stated once, in the caption, instead of
 * being drawn five times in a way that would overclaim.
 */
export function BuildGrid() {
  return (
    <>
      <ol className="builds">
        {BUILDS.map((build, i) => {
          const inner = (
            <>
              <span className="node-port" aria-hidden="true" />
              <span className="node-ord figure">{String(i + 1).padStart(2, "0")}</span>
              <span className="node-name">{build.name}</span>
              <span className="build-domain">{build.domain}</span>
              {/* Not the mono register: the chain string is joined by
                  U+2192, which DM Mono does not carry. */}
              <span className="build-chain">{build.chain}</span>
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

      <p className="builds-caption">
        <span className="figure">{LIVE_BUILDS.length}</span> built ·{" "}
        <span className="figure">{PLANNED_BUILDS.length}</span> designed, not
        built. A planned build carries no figure anywhere on this site,
        because a design has none to carry — and the ones without a route
        are not links, because there is nothing behind them to open.
      </p>
    </>
  );
}