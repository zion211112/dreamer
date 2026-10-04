import Link from "next/link";
import { LIVE_BUILDS, PLANNED_BUILDS, PRODUCTS } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The product grid — what the company sells.
 *
 * This was "the build annex", and its docstring said its purpose was "to
 * stop the site from being a marketing page for one school console". That
 * framing is the category error the grid was built to encode: it treated
 * the one real product as something to be explained away, and it labelled
 * the page "One grammar, six domains" above a list of six things, five of
 * which were invented sectors with no relationship to the company.
 *
 * It is now the product catalogue, and the order of its rows says what the
 * company is:
 *
 *   School Console      a management system, built, with a surface to open
 *   Commissioned MVP    a track, designed, no commission taken
 *   Build Studio        a track, designed, no studio published
 *
 * Each row names its buyer. That single column is the correction that
 * matters: the previous grid named a "domain" per row, which told a reader
 * what category of problem existed while never telling them who was paying
 * for the work. A grid of products that does not say who buys them is a
 * list of interests.
 *
 * The rows are deliberately NOT connected by edges. Four fifths of the
 * original grid had nothing running at all, and an edge implies a flow
 * that is running. The connection is stated once in the caption instead.
 */
export function BuildGrid() {
  return (
    <>
      <ol className="builds">
        {PRODUCTS.map((product, i) => {
          const inner = (
            <>
              <span className="node-port" aria-hidden="true" />
              <span className="node-ord figure">{String(i + 1).padStart(2, "0")}</span>
              <span className="node-name">{product.name}</span>
              {/* The kind, as a commercial shape rather than as a sector.
                  It reads on its own: a reader can tell a recurring
                  product from a per-build service without knowing what a
                  "management system" is. */}
              <span className="build-kind" data-kind={product.kind}>
                {KIND_LABEL[product.kind]}
              </span>
              {/* Not the mono register: the chain string is joined by
                  U+2192, which DM Mono does not carry. */}
              <span className="build-chain">{product.chain}</span>
              {/* The buyer. This line did not exist on any row before,
                  and it is the one a reader needs most. */}
              <span className="build-buyer">
                <span className="build-buyer-key">For</span> {product.buyer}
              </span>
              <span className="build-prov">{product.provenance}</span>
              <span className="node-state">
                <StateTag state={product.state} />
              </span>
            </>
          );

          return (
            <li className="graph-cell" key={product.name}>
              {product.href ? (
                <Link className="node build-node" href={product.href}>
                  {inner}
                  <span className="build-open">
                    Open the product <span className="glyph">→</span>
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
        <span className="figure">{LIVE_BUILDS.length}</span> product with a
        surface · <span className="figure">{PLANNED_BUILDS.length}</span>{" "}
        tracks designed, not built. A designed track carries no figure
        anywhere on this site, because it has none to carry — and the rows
        without a route are not links, because there is nothing behind them
        to open.
      </p>
    </>
  );
}

/** The three commercial shapes, in the words a buyer would use. Declared
    once so a row cannot spell a kind one way and the caption another. */
const KIND_LABEL: Record<(typeof PRODUCTS)[number]["kind"], string> = {
  "management-system": "Management system",
  mvp: "Commissioned build",
  studio: "Studio",
};