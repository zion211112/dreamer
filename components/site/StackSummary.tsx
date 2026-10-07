"use client";

import { StateTag } from "@/components/site/StateTag";
import { STACK } from "@/lib/system";

export function StackSummary() {
  return (
    <section className="stack-summary" aria-labelledby="stack-heading">
      <div className="section-head">
        <h2 id="stack-heading" className="section-title">
          Infrastructure stack
        </h2>
        <p className="section-kicker">
          Five layers · Record → Identity → Build → Infrastructure → Allocation
        </p>
      </div>

      <div className="stack-visual">
        {STACK.map((layer, index) => (
          <article key={layer.key} className="stack-layer">
            <div className="stack-layer-connect" aria-hidden="true">
              {index < STACK.length - 1 && "↓"}
            </div>
            <div className="stack-layer-card">
              <div className="stack-layer-header">
                <span className="stack-layer-ord">{layer.ord}</span>
                <h3 className="stack-layer-name">{layer.name}</h3>
                <StateTag state={layer.state} />
              </div>
              <p className="stack-layer-role">{layer.role}</p>
              <p className="stack-layer-built">{layer.built}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="stack-note">
        <StateTag state="PROTOTYPE" /> = Built and inspectable ·
        <StateTag state="PLANNED" /> = Designed, not built ·
        <StateTag state="UNKNOWN" /> = Value not established
      </p>
    </section>
  );
}