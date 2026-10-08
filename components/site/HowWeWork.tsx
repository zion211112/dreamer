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
    <section className="how-we-work section py-20" aria-labelledby="how-heading">
      <div className="container">
        <div className="section-head text-center mb-16">
          <h2 id="how-heading" className="section-title text-3xl md:text-4xl font-display fw-display-bold mb-4">
            How we work
          </h2>
          <p className="section-kicker text-muted max-w-2xl mx-auto">
            Five steps &mdash; DISCOVER &rarr; DIAGNOSE &rarr; PROVE &rarr; RECORD &rarr; REPEAT
          </p>
        </div>

        <ol className="how-steps grid gap-12 md:grid-cols-2 lg:grid-cols-1">
          {steps.map((step, index) => (
            <li key={step.label} className="how-step flex flex-col items-start gap-6">
              <div className="how-step-header flex w-full items-start gap-4">
                <span className="how-ord flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent fw-display-medium">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="how-step-title-row flex flex-col gap-2">
                  <h3 className="how-step-label text-xl font-display fw-display-semibold">
                    {step.label}
                  </h3>
                  <div className="flex items-start">
                    <StateTag state={step.state} />
                  </div>
                </div>
              </div>
              <p className="how-step-desc text-muted max-w-xl">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="how-step-connector w-0.5 bg-accent/20 self-stretch" aria-hidden="true">
                  &nbsp;
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}