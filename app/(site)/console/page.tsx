import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: `${COMPANY.name} - Console`,
  description: "Access the APT-LABS institutional infrastructure console",
};

export default function ConsolePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              Institutional Infrastructure Console
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              The central nervous system for managing your organization&apos;s
              resources, workflows, and evidence. Built for locally owned
              institutions that demand sovereignty and excellence.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Resource Allocation
                </h2>
                <p className="text-neutral-300">
                  Optimize budget, personnel, and asset distribution with
                  constraint-based solvers and real-time tracking.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Workflow Orchestration
                </h2>
                <p className="text-neutral-300">
                  Design, execute, and monitor complex institutional workflows
                  with automated handoffs and audit trails.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Evidence Management
                </h2>
                <p className="text-neutral-300">
                  Track, verify, and graduate evidence for every institutional
                  claim with tamper-proof ledgers.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Identity & Access
                </h2>
                <p className="text-neutral-300">
                  Manage users, roles, and permissions with cryptographic
                  verification and privilege minimization.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Analytics & Reporting
                </h2>
                <p className="text-neutral-300">
                  Gain insights from institutional data with customizable
                  dashboards and exportable reports.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Settings & Configuration
                </h2>
                <p className="text-neutral-300">
                  Tailor the console to your institution&apos;s unique workflows,
                  policies, and compliance requirements.
                </p>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              <a
                href="/contact"
                className="btn-primary btn-lg"
              >
                Request Console Access
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}