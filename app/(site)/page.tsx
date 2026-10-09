import { HomeHero } from "@/components/site/HomeHero";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY, STACK, MEASURES } from "@/lib/system";
import Link from "next/link";

export const metadata = {
  title: `${COMPANY.name} - Locally Owned Institutional Infrastructure`,
  description: COMPANY.supporting,
};

export default function SitePage() {
  return (
    <>
      <Navigation />
      <main>
        <HomeHero />
        <section className="section">
          <div className="container">
            <h2 className="text-h2 font-display font-bold text-white mb-12">
              Our Infrastructure Stack
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {STACK.map((layer) => (
                <div
                  key={layer.layer}
                  className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6 backdrop-blur-sm transition-all hover:bg-neutral-800/50 hover:border-neutral-600"
                >
                  <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                    {layer.layer}
                  </h3>
                  <ul className="space-y-2 text-neutral-300">
                    {layer.items.map((item) => {
                      const i = item as { state: string; name: string };
                      return (
                        <li key={i.name} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            i.state === "PROTOTYPE"
                              ? "bg-evidence-PROTOTYPE-bg"
                            : i.state === "PLANNED"
                              ? "bg-evidence-PLANNED-bg"
                            : i.state === "TARGET"
                              ? "bg-evidence-TARGET-bg"
                            : i.state === "VERIFIED"
                              ? "bg-evidence-VERIFIED-bg"
                            : "bg-evidence-UNKNOWN-bg"
                          }`}></span>
                          <span>{i.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="text-h2 font-display font-bold text-white mb-12">
              Key Measures
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {MEASURES.map((measure) => (
                <div
                  key={measure.key}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-4xl md:text-5xl font-display font-bold text-white">
                    {measure.figure}
                  </span>
                  <span className="text-sm text-neutral-400 max-w-xs">
                    {measure.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-neutral-900/50">
          <div className="container">
            <h2 className="text-h2 font-display font-bold text-white mb-12">
              How It Works
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Record
                </h3>
                <p className="text-neutral-300">
                  Maintain canonical registries with offline-first sync and cryptographic proof-of-presence.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Allocate
                </h3>
                <p className="text-neutral-300">
                  Schedule duties, manage budgets, and track resources with constraint-based optimization.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Coordinate
                </h3>
                <p className="text-neutral-300">
                  Communicate through structured threads, announcements, and acknowledgments.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Measure
                </h3>
                <p className="text-neutral-300">
                  Track evidence states and operational metrics with graduated verification.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Govern
                </h3>
                <p className="text-neutral-300">
                  Enforce policies, run inspections, and ensure compliance with evidence-gated workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="text-h2 font-display font-bold text-white mb-12">
              Live Builds
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* We'll hardcode a few for now; could fetch from LIVE_BUILDS */}
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  BenBen v1 — Roll Registry
                </h3>
                <p className="text-neutral-300">
                  Offline-first person registry with QR check-in, role assignment, and conflict-free sync.
                </p>
                <Link href="/roll" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300">
                  View Demo
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  BenBen v2 — Work Allocation
                </h3>
                <p className="text-neutral-300">
                  Constraint solver for teacher timetables, duty rosters, and room assignments.
                </p>
                <Link href="/work" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300">
                  View Demo
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h3 className="text-h3 font-semibold text-accent-400 mb-4">
                  Evidence Ledger
                </h3>
                <p className="text-neutral-300">
                  Graduated evidence tracking for every institutional claim.
                </p>
                <Link href="/register" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300">
                  View Demo
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}