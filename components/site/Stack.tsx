import { STACK } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The stack — five layers, one built.
 *
 * The company's ontology as a section, and the register grammar applied
 * to it: each layer carries its own evidence state, and the row's left
 * edge is lit exactly when the layer has a surface. That single 2px bar
 * is the whole design argument, and it reads before a word of the copy
 * is read: one layer emits light, four are hairlines.
 *
 * Two densities, one object, on the same principle as the graph:
 *
 *   full      every field — holds, built, settles, provenance. Used on
 *             /stack, where the layer IS the subject.
 *   compact   ordinal, name, role, state, and the built line for the
 *             layer that has one. Used on the homepage, where the stack
 *             is the argument and the detail is one click away.
 *
 * A `dl` for the facts rather than paragraphs, for the same reason the
 * node record is one: they are four named facts, and a screen reader
 * should be able to ask for them one at a time.
 */
export function Stack({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <ol className="stack" data-variant={variant}>
      {STACK.map((layer) => {
        const built = layer.state === "PROTOTYPE";
        return (
          <li
            className="stack-layer"
            data-built={built}
            data-state={layer.state}
            key={layer.key}
          >
            <div className="stack-head">
              <span className="stack-ord figure" aria-hidden="true">
                {layer.ord}
              </span>
              <h3 className="stack-name">
                {layer.name}
                {layer.alias ? (
                  <span className="stack-alias">
                    <span aria-hidden="true"> · </span>
                    {layer.alias}
                  </span>
                ) : null}
              </h3>
              <StateTag state={layer.state} />
            </div>

            <p className="stack-role">{layer.role}</p>

            {variant === "full" ? (
              <dl className="stack-facts">
                <div className="stack-fact">
                  <dt>Holds</dt>
                  <dd>{layer.holds}</dd>
                </div>
                <div className="stack-fact">
                  <dt>Built today</dt>
                  <dd>{layer.built}</dd>
                </div>
                <div className="stack-fact">
                  <dt>Settles with</dt>
                  <dd>{layer.settles}</dd>
                </div>
                <div className="stack-fact">
                  <dt>Provenance</dt>
                  <dd>{layer.provenance}</dd>
                </div>
              </dl>
            ) : built ? (
              /* Only the built layer gets a note in the compact setting.
                 The unbuilt rows say what they are by being unlit — that
                 is the compact setting's job, and filling all five with
                 explanation would turn a diagram back into prose. */
              <p className="stack-built">{layer.built}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
