"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHAIN_RETURN, PLANE, VALUE_CHAIN } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The node graph — the site as a canvas.
 *
 * The claim this component makes is structural, not illustrative: a
 * system that describes a loop should let you walk the loop. So every
 * node on the spine is a real route, and the edge between two nodes is
 * lit exactly when the flow is leaving the node you are standing on.
 * There are no decorative nodes anywhere in this file — a node that
 * resolves to nothing is not drawn at all, which is why the planned
 * builds live in a separate annex with no edges on them.
 *
 * Two densities, one object:
 *
 *   spine   the compact strip. Five cells, one line each, rendered on
 *           every route above the content so that the reader always
 *           knows where they are in the loop before reading a word.
 *   canvas  the full graph. Cards with a port, a role, a custody line
 *           and a state. Used once, on the homepage, where it is the
 *           argument rather than the orientation.
 */
export function NodeGraph({ variant = "spine" }: { variant?: "spine" | "canvas" }) {
  const pathname = usePathname();
  const current = PLANE.findIndex((n) =>
    n.href === "/"
      ? pathname === "/"
      : pathname === n.href || pathname.startsWith(`${n.href}/`)
  );

  /* The compact spine is orientation, and the homepage already carries
     the full canvas graph — running both would state the loop twice on
     one screen, which is how a spine stops being orientation and starts
     being wallpaper. */
  if (variant === "spine" && pathname === "/") return null;

  return variant === "spine" ? (
    <Spine current={current} />
  ) : (
    <Canvas current={current} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE SPINE — orientation, on every route
   ═══════════════════════════════════════════════════════════════ */
function Spine({ current }: { current: number }) {
  return (
    <nav className="graph-spine" aria-label="Position in the loop">
      <ol className="graph-spine-track">
        {PLANE.map((node, i) => (
          <li key={node.key}>
            <Link
              href={node.href}
              className="graph-spine-cell"
              aria-current={i === current ? "page" : undefined}
            >
              <span className="graph-spine-ord figure">{node.ord}</span>
              <span className="graph-spine-name">{node.name}</span>
              <span className="port" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE CANVAS — the argument, on the homepage
   ═══════════════════════════════════════════════════════════════ */
function Canvas({ current }: { current: number }) {
  return (
    <div className="graph">
      <ol className="graph-track">
        {PLANE.map((node, i) => (
          <li className="graph-cell" key={node.key}>
            {/* The edge is drawn by the node it arrives at, so it knows
                who it is coming from. `data-lit` is true when the flow
                is leaving the node before it. */}
            {i > 0 && (
              <span
                className="graph-edge"
                aria-hidden="true"
                data-lit={i - 1 === current || undefined}
              />
            )}

            <Link
              href={node.href}
              className="node"
              aria-current={i === current ? "page" : undefined}
            >
              <span className="node-port" aria-hidden="true" />
              <span className="node-ord figure">{node.ord}</span>
              <span className="node-name">{node.name}</span>
              <span className="node-role">{node.role}</span>
              <span className="node-custody">
                <span className="node-custody-key">Custody</span>
                {node.custody}
              </span>
              <span className="node-state">
                <StateTag state={node.state} />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* The return stroke. Five nodes in a row is a queue, not a loop;
          this is the line that makes it a loop, and it is the reason
          the last node's role is phrased as an action. */}
      <div className="graph-close">
        <span className="glyph" aria-hidden="true">↺</span>
        <span>{CHAIN_RETURN}</span>
        <span className="graph-close-mark" aria-hidden="true" />
      </div>

      <ValueChain embedded />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE CHAIN — the seven transformations, at one order finer
   ═══════════════════════════════════════════════════════════════ */

/**
 * The seven stages, exported on its own so the Control route can show
 * the chain without also rendering the graph that contains it. One
 * component, two placements — the alternative is two copies of the same
 * seven stages drifting apart, which is the failure this design system
 * exists to prevent.
 */
export function ValueChain({ embedded = false }: { embedded?: boolean }) {
  const hrefFor = (node?: string) => PLANE.find((n) => n.key === node)?.href;

  return (
    <section aria-labelledby="chain-heading" style={embedded ? { marginTop: "var(--s-6)" } : undefined}>
      {!embedded && (
        <div className="section-head">
          <h2 className="section-title" id="chain-heading">
            The value chain
          </h2>
          <p className="section-kicker">
            Transformation · {VALUE_CHAIN.length} stages
          </p>
        </div>
      )}

      <div className="chain">
<ol className="chain-track">
          {VALUE_CHAIN.map((stage) => {
            const href = hrefFor(stage.node);
            const inner = (
              <>
                <span className="chain-ord">{stage.ord}</span>
                <span className="chain-link" aria-hidden="true" />
                <span className="chain-name">{stage.name}</span>
                <span className="chain-what">{stage.what}</span>
                <span className="chain-owner">
                  Custody · {stage.owner}
                  {href && (
                    <>
                      {" "}
                      <span className="glyph" aria-hidden="true">
                        →
                      </span>
                      <span className="sr-only">, which resolves to a node on this site</span>
                    </>
                  )}
                </span>
              </>
            );

            return (
              <li className="chain-step" key={stage.ord}>
                {href ? (
                  <Link className="chain-step--link" href={href}>
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ol>

        {/* The return stroke, for the standalone placement. The embedded
            one already sits under the graph and carries it there. */}
        {!embedded && (
          <div className="chain-close">
            <span className="glyph" aria-hidden="true">↺</span>
            <span>{CHAIN_RETURN}</span>
            <span className="chain-close-mark" aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="sr-only">{VALUE_CHAIN.length} stages, in order.</p>
    </section>
  );
}