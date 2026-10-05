import Link from "next/link";
import { CHAIN_RETURN, PLANE, VALUE_CHAIN } from "@/lib/system";

export function ValueChain() {
  const hrefFor = (node?: string) => PLANE.find((entry) => entry.key === node)?.href;

  return (
    <section aria-labelledby="chain-heading">
      <div className="section-head">
        <h2 className="section-title" id="chain-heading">The value chain</h2>
        <p className="section-kicker">Transformation · {VALUE_CHAIN.length} stages</p>
      </div>

      <div className="chain">
        <ol className="chain-track">
          {VALUE_CHAIN.map((stage) => {
            const href = hrefFor(stage.node);
            const content = (
              <>
                <span className="chain-ord">{stage.ord}</span>
                <span className="chain-link" aria-hidden="true" />
                <span className="chain-name">{stage.name}</span>
                <span className="chain-what">{stage.what}</span>
                <span className="chain-owner">
                  Custody · {stage.owner}
                  {href ? <span className="sr-only">, opens the related system surface</span> : null}
                </span>
              </>
            );

            return (
              <li className="chain-step" key={stage.ord}>
                {href ? (
                  <Link className="chain-step--link" href={href}>
                    {content}
                  </Link>
                ) : content}
              </li>
            );
          })}
        </ol>

        <div className="chain-close">
          <span className="glyph" aria-hidden="true">↺</span>
          <span>{CHAIN_RETURN}</span>
          <span className="chain-close-mark" aria-hidden="true" />
        </div>
      </div>
      <p className="sr-only">{VALUE_CHAIN.length} stages, in order.</p>
    </section>
  );
}