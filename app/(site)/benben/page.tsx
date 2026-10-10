import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";
import Link from "next/link";

export const metadata = {
  title: `${COMPANY.name} - BenBen`,
  description: "BenBen Builds product track — School Console prototype and allocation board",
};

export default function BenBenPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              BenBen Builds
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              BenBen Builds is an associated product track from APT-LABS. The
              School Console prototype runs on demonstration data. The allocation
              board is a planned capability.
            </p>

            {/* Boundary Message */}
            <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6 mb-12">
              <p className="text-neutral-300">
                <strong className="text-white">Boundary:</strong> This is a BenBen Builds product,
                not the APT-LABS flagship. APT-LABS builds locally owned
                institutional infrastructure systems; the School Console is the
                Record layer&apos;s first implementation.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* School Console */}
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-h2 font-display font-semibold text-accent-400">
                    School Console Prototype
                  </h2>
                  <span className="badge badge-prototype">PROTOTYPE</span>
                </div>
                <p className="text-neutral-300 mb-4">
                  Offline-first school operations console with fees, timetable,
                  attendance, marking, learners, grades, and discipline modules.
                  Runs on <strong className="text-white">demonstration data</strong> only —
                  no real institutional records.
                </p>
                <ul className="space-y-2 text-neutral-400 text-sm mb-6">
                  <li>• 5 modules, all PROTOTYPE state</li>
                  <li>• Device-local, no server dependency</li>
                  <li>• Data = DEMONSTRATION (invented)</li>
                </ul>
                <Link
                  href="/console"
                  className="btn-primary btn-sm"
                >
                  Open Console Prototype
                </Link>
              </div>

              {/* Allocation Board */}
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-h2 font-display font-semibold text-accent-400">
                    Allocation Board
                  </h2>
                  <span className="badge badge-planned">PLANNED</span>
                </div>
                <p className="text-neutral-300 mb-4">
                  Rule-governed resource allocation for institutions. Budget
                  tracking, vote-head management, capitation flows, and
                  procurement workflows with evidence-gated approvals.
                </p>
                <ul className="space-y-2 text-neutral-400 text-sm mb-6">
                  <li>• Budget Tracker — PLANNED</li>
                  <li>• Vote Head Management — PLANNED</li>
                  <li>• Capitation Flows — PLANNED</li>
                  <li>• Procurement Workflows — PLANNED</li>
                </ul>
                <a
                  href="/contact"
                  className="btn-secondary btn-sm"
                >
                  Request Early Access
                </a>
              </div>
            </div>

            {/* Evidence States Reference */}
            <section className="section mt-16">
              <h2 className="text-h2 font-display font-semibold text-white mb-8">
                Evidence States
              </h2>
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { state: "UNKNOWN", desc: "Value not established", color: "bg-evidence-UNKNOWN-bg" },
                  { state: "PLANNED", desc: "Designed, not built", color: "bg-evidence-PLANNED-bg" },
                  { state: "TARGET", desc: "Intended outcome", color: "bg-evidence-TARGET-bg" },
                  { state: "VERIFIED", desc: "Citable evidence path", color: "bg-evidence-VERIFIED-bg" },
                  { state: "PROTOTYPE", desc: "Built, inspectable, not deployed", color: "bg-evidence-PROTOTYPE-bg" },
                ].map((s) => (
                  <div key={s.state} className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${s.color}`}></span>
                      <span className="text-white font-medium">{s.state}</span>
                    </div>
                    <p className="text-neutral-400 text-sm">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}