import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: `${COMPANY.name} - Contact`,
  description: "Get in touch with APT-LABS",
};

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)]">
        <section className="section">
          <div className="container">
            <h1 className="text-hero font-display font-bold text-white mb-8">
              Start a Conversation
            </h1>
            <p className="text-xl text-neutral-300 mb-12 max-w-2xl">
              We&apos;re locally owned and operated. Reach out to discuss how our
              institutional infrastructure can serve your organization&apos;s unique
              needs.
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                  <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                    General Inquiries
                  </h2>
                  <p className="text-neutral-300">
                    Questions about our approach, capabilities, or institutional
                    infrastructure philosophy.
                  </p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                  <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                    Partnership Opportunities
                  </h2>
                  <p className="text-neutral-300">
                    Collaborate with us on research, development, or
                    institutional projects that advance shared goals.
                  </p>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                  <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                    Support & Service
                  </h2>
                  <p className="text-neutral-300">
                    Technical assistance, feature requests, or service
                    inquiries for existing implementations.
                  </p>
                </div>
              </div>
              <form className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6 space-y-4">
                <h2 className="text-h2 font-display font-semibold text-accent-400 mb-4">
                  Send a Message
                </h2>
                <div className="space-y-3">
                  <label className="label" htmlFor="name">
                    Name
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
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    className="input w-full"
                    placeholder="Organization or institution name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input w-full"
                    placeholder="How can we help?"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}