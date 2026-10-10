import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: `${COMPANY.name} - Roll`,
  description: "Manage the institutional roll with the BenBen v1 registry",
};

export default function RollPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              Institutional Roll Registry
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              The BenBen v1 registry provides an offline-first, cryptographically
              secure system for managing your institution&apos;s roll — people, roles,
              and relationships.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Offline-First
                </h2>
                <p className="text-neutral-300">
                  Full functionality without network connectivity. Syncs
                  automatically when back online with conflict resolution.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  QR Check-In
                </h2>
                <p className="text-neutral-300">
                  Fast, touchless check-in using personalized QR codes.
                  Role-based access control enforced at the point of entry.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Role Assignment
                </h2>
                <p className="text-neutral-300">
                  Dynamically assign and manage roles, duties, and
                  responsibilities with inheritance and override capabilities.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Conflict-Free Sync
                </h2>
                <p className="text-neutral-300">
                  Mathematically guaranteed convergence. No data loss, no
                  manual merge conflicts — even in challenging network conditions.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Cryptographic Proof
                </h2>
                <p className="text-neutral-300">
                  Every change is signed and verifiable. Provides audit-ready
                  evidence of who did what and when.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Export & Reporting
                </h2>
                <p className="text-neutral-300">
                  Generate roll calls, attendance reports, and compliance
                  documentation in multiple formats.
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