import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: `${COMPANY.name} - Work`,
  description: "Manage work allocation with the BenBen v2 constraint solver",
};

export default function WorkPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              Work Allocation & Scheduling
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              The BenBen v2 solver optimizes complex scheduling problems — timetables, duty rosters, room assignments — subject to institutional constraints.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Constraint-Based Solver
                </h2>
                <p className="text-neutral-300">
                  Define hard and soft constraints. The solver finds optimal solutions or the best feasible approximation.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Timetable Generation
                </h2>
                <p className="text-neutral-300">
                  Generate conflict-free class timetables, duty rosters, and room assignments in seconds.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Resource Optimization
                </h2>
                <p className="text-neutral-300">
                  Minimize overtime, maximize utilization, and balance workloads across staff and facilities.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  What-If Scenarios
                </h2>
                <p className="text-neutral-300">
                  Model the impact of changes — new staff, room closures, policy updates — before committing.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Audit Trail
                </h2>
                <p className="text-neutral-300">
                  Every solve run is logged with inputs, outputs, and solver statistics for transparency and compliance.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Export & Integration
                </h2>
                <p className="text-neutral-300">
                  Export results to CSV, iCal, or integrate with existing SIS/LMS platforms via API.
                </p>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              <a
                href="/console"
                className="btn-primary btn-lg"
              >
                Access the Console
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}