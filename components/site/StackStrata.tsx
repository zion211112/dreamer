import Link from "next/link";
import { BUILT_LAYERS, STACK } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The stack, drawn as a section through a node.
 *
 * This replaces five rows of the same visual weight. That was the most
 * expensive thing on the page: every section was padding, a hairline, a
 * mono label and two sentences, so the eye had no reason to land anywhere
 * and the stack — the actual argument — read like a table of contents.
 *
 * A stack is a physical idea. It has a floor, layers above one another, and
 * each layer bears the weight of the ones on top of it. So it is drawn the
 * way a section is drawn: five strata, cut from the same rock, one of them
 * lit because it is the one that exists.
 *
 * The vertical axis is REAL. Each stratum's height is set by the number of
 * lines of role text it carries, so the diagram is not decoration — a layer
 * with more to say is physically taller. That is why the altitudes differ
 * and it is the reason to look at the thing rather than past it.
 */
export function StackStrata() {
  return (
    <div className="strata">
      <ol className="strata-col">
        {STACK.map((layer) => {
          const built = layer.state === "PROTOTYPE";
          return (
            <li className="stratum" key={layer.key} data-built={built ? "true" : "false"}>
              <div className="stratum-ord figure">{layer.ord}</div>

              <div className="stratum-body">
                <div className="stratum-head">
                  <h3 className="stratum-name">{layer.name}</h3>
                  {layer.alias ? (
                    <span className="stratum-alias">{layer.alias}</span>
                  ) : null}
                  <StateTag state={layer.state} />
                </div>

                <p className="stratum-role">{layer.role}</p>

                {/* What it settles. Rendered on the same plane as the role
                    because "what it settles" is the commercial half of the
                    same sentence — a layer nobody needs is not a roadmap
                    item, it is a diagram. */}
                <p className="stratum-settles">
                  <span className="stratum-key">Settles</span> {layer.settles}
                </p>
              </div>

              {/* The edge carries the weight. A lit layer has a lit rule
                  down its left; a designed one has a hairline and nothing
                  behind it. That difference is the whole read, and it costs
                  one border. */}
              <div className="stratum-edge" aria-hidden="true" />
            </li>
          );
        })}
      </ol>

      <aside className="strata-margin">
        <p className="strata-count">
          <span className="figure">{BUILT_LAYERS.length}</span> of{" "}
          <span className="figure">{STACK.length}</span>
        </p>
        <p className="strata-caption">
          One layer has a surface. The four above it are published designs,
          and a design is not a capability.
        </p>
        <Link href="/stack" className="strata-link">
          Read the stack <span className="glyph">→</span>
        </Link>
      </aside>
    </div>
  );
}