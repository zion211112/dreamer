import Link from "next/link";
import { LIVE_BUILDS, PRODUCTS, type Product } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The product catalogue.
 *
 * This was three cards of equal width in a three-column grid, each with a
 * category chip, a buyer line, a provenance paragraph and a link. That is
 * the single most recognisable piece of AI-generated interface on the
 * page: equal-weight cards in a row, differentiated only by their contents,
 * implying a comparison the reader is not making and could not make — the
 * three products have nothing to compare on. One has a route and two do
 * not, and that difference deserves the layout, not a chip.
 *
 * So it is a ledger. The built one is given the full row and a route; the
 * two tracks are set beneath it at a smaller measure, visibly subordinate,
 * with the reason they have no surface. The asymmetry is the information.
 *
 * Rows, not cards, because a catalogue is a list and a card grid is a
 * device for making a list look like a marketplace.
 */

const KIND_LABEL: Record<Product["kind"], string> = {
  "management-system": "Management system",
  mvp: "Commissioned build",
  studio: "Studio",
};

export function BuildGrid() {
  const built = PRODUCTS.filter((p) => p.href);
  const designed = PRODUCTS.filter((p) => !p.href);

  return (
    <>
      {/* ── The one that runs ──────────────────────────────────────── */}
      {built.map((product) => (
        <article className="catalogue-lead" key={product.name}>
          <div className="catalogue-lead-head">
            <div>
              <p className="catalogue-kind">{KIND_LABEL[product.kind]}</p>
              <h3 className="catalogue-name">{product.name}</h3>
            </div>
            <StateTag state={product.state} />
          </div>

          <p className="catalogue-for">
            <span className="catalogue-key">For</span> {product.buyer}
          </p>

          <p className="catalogue-prov">{product.provenance}</p>

          <Link className="catalogue-open" href={product.href as string}>
            Open it — it runs here, now
            <span className="glyph">→</span>
          </Link>
        </article>
      ))}

      {/* ── The two that are designs ─────────────────────────────────
          Set beneath and to the right, not beside. A track with no surface
          is not a smaller product, it is a different kind of thing, and
          putting it in the same row as the one that runs would say
          otherwise. */}
      {designed.length > 0 ? (
        <div className="catalogue-tracks">
          <p className="catalogue-tracks-key">
            Designed · {designed.length} tracks, no surfaces
          </p>
          <ul>
            {designed.map((product) => (
              <li className="catalogue-track" key={product.name}>
                <div className="catalogue-track-head">
                  <span className="catalogue-track-name">{product.name}</span>
                  <span className="catalogue-track-kind">
                    {KIND_LABEL[product.kind]}
                  </span>
                  <StateTag state={product.state} />
                </div>
                <p className="catalogue-track-for">
                  <span className="catalogue-key">For</span> {product.buyer}
                </p>
                <p className="catalogue-track-prov">{product.provenance}</p>
              </li>
            ))}
          </ul>
          <p className="catalogue-tracks-foot">
            A designed track carries no figure anywhere on this site, because it
            has none to carry. These rows are not links: there is nothing behind
            them to open.
          </p>
        </div>
      ) : null}

      <p className="builds-caption">
        <span className="figure">{LIVE_BUILDS.length}</span> product with a
        surface · <span className="figure">{designed.length}</span> designed.
      </p>
    </>
  );
}