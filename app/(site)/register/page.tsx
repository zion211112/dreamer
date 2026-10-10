import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: `${COMPANY.name} - Register`,
  description: "Register for access to the APT-LABS console",
};

export default function RegisterPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              Register for Console Access
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              Join our community of locally owned institutions using sovereign
              infrastructure to manage their operations with excellence.
            </p>
            <form className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6 space-y-4">
              <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                Create Your Account
              </h2>
              <div className="space-y-3">
                <label className="label" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input w-full"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="label" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="input w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="label" htmlFor="organization">
                  Organization / Institution
                </label>
                <input
                  type="text"
                  id="organization"
                  className="input w-full"
                  placeholder="Organization name"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="label" htmlFor="role">
                  Your Role
                </label>
                <select
                  id="role"
                  className="input w-full"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="administrator">Administrator</option>
                  <option value="educator">Educator / Teacher</option>
                  <option value="manager">Manager / Coordinator</option>
                  <option value="researcher">Researcher</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="label" htmlFor="use-case">
                  Primary Use Case
                </label>
                <select
                  id="use-case"
                  className="input w-full"
                  required
                >
                  <option value="">Select primary use case</option>
                  <option value="student-management">Student Management</option>
                  <option value="resource-allocation">Resource Allocation</option>
                  <option value="workflow-automation">Workflow Automation</option>
                  <option value="evidence-tracking">Evidence Tracking</option>
                  <option value="compliance-reporting">Compliance & Reporting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-6">
                <label className="label flex items-start space-y-2">
                  <span>I agree to the </span>
                  <a
                    href="/docs/terms"
                    className="text-accent-400 hover:text-accent-300 underline"
                  >
                    Terms of Service
                  </a>
                  <span> and </span>
                  <a
                    href="/docs/privacy"
                    className="text-accent-400 hover:text-accent-300 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-accent-600 border-neutral-600 focus:ring-accent-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Register for Access
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}