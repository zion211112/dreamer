import Link from "next/link";
import { CHAIN_RETURN, PLANE, VALUE_CHAIN } from "@/lib/system";

/**
 * The Value Chain — the contract's new primary navigation primitive.
 *
 *   OBSERVE → RECORD → STRUCTURE → INTERPRET → DECIDE → EXECUTE → MEASURE ↺
 *
 * It is functional, not illustrative. Each stage answers the five
 * questions the contract asks of it: where am I (the ordinal), what
 * transformation is happening (the name), what happens next (the
 * connector), what evidence supports it (the linked node), and who
 * controls the transition (the custodian line).
 *
 * "Who controls the transition" is the load-bearing line. It is what
 * separates this from a process diagram: the chain is local-first, and
 * each stage names the party that holds custody of the record at that
 * point — never an intermediary that can take it away.
 */
export function ValueChain() {
  const hrefFor = (node?: string) => PLANE.find((n) => n.key === node)?.href;

  return (
    <section aria-labelledby="chain-heading">
      <div className="section-head">
        <h2 className="section-title" id="chain-heading">
          The value chain
        </h2>
        <p className="label">Transformation · 07 stages</p>
      </div>

      <div className="chain">
        <div className="chain-track">
          {VALUE_CHAIN.map((stage) => {
            const href = hrefFor(stage.node);
            const inner = (
              <>
                <div className="chain-ord">{stage.ord}</div>
                <div className="chain-link" aria-hidden="true" />
                <div className="chain-name">{stage.name}</div>
                <p className="chain-what">{stage.what}</p>
                <div className="chain-owner">
                  Custody · {stage.owner}
                  {href ? " →" : ""}
                </div>
              </>
            );

            return href ? (
              <Link className="chain-step" href={href} key={stage.ord}>
                {inner}
              </Link>
            ) : (
              <div className="chain-step" key={stage.ord}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* The return stroke. The loop is the product: measurement is
            the next observation, not a report about the last one. */}
        <div className="chain-close">
          <span aria-hidden="true">↺</span>
          <span>{CHAIN_RETURN}</span>
          <span className="chain-close-mark" aria-hidden="true" />
          <span aria-hidden="true">↺</span>
        </div>
      </div>
      <p className="sr-only">{VALUE_CHAIN.length} stages, in order.</p>
    </section>
  );
}