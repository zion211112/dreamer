"use client";

import { StateTag } from "@/components/site/StateTag";

export function HowWeWork() {
  const steps = [
    {
      label: "DISCOVER",
      description: "The institution brings a real operational problem. We do not invent targets.",
      state: "UNKNOWN" as const,
    },
    {
      label: "DIAGNOSE",
      description: "Map the workflow, the records, the constraints. What actually needs to change?",
      state: "PLANNED" as const,
    },
    {
      label: "PROVE",
      description: "Build it locally. Open it for inspection. The evidence register is published as we go.",
      state: "PROTOTYPE" as const,
    },
    {
      label: "RECORD",
      description: "Every decision, every contribution, every outcome enters the register. It stays with the institution.",
      state: "TARGET" as const,
    },
    {
      label: "REPEAT",
      description: "The next problem. Same method. The stack grows by solving, not by planning.",
      state: "PLANNED" as const,
    },
  ];

  return (
    <section className="how-we-work" aria-labelledby="how-heading">
      <div className="section-head">
        <h2 id="how-heading" className="section-title">
          How we work
        </h2>
        <p className="section-kicker">
          Five steps · DISCOVER → DIAGNOSE → PROVE → RECORD → REPEAT
        </p>
      </div>

      <ol className="how-steps">
        {steps.map((step, index) => (
          <li key={step.label} className="how-step">
            <div className="how-step-header">
              <span className="how-ord" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="how-step-title-row">
                <h3 className="how-step-label">{step.label}</h3>
                <StateTag state={step.state} />
              </div>
            </div>
            <p className="how-step-desc">{step.description}</p>
            <div className="how-step-connector" aria-hidden="true">
              {index < steps.length - 1 && "→"}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}