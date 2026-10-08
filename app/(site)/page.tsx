import { HomeHero } from "@/components/site/HomeHero";
import { HowWeWork } from "@/components/site/HowWeWork";
import { CurrentProof } from "@/components/site/CurrentProof";
import { StackSummary } from "@/components/site/StackSummary";
import { COMPANY } from "@/lib/system";

export const metadata = {
  title: "APT-LABS — Locally owned institutional infrastructure systems",
  description:
    "APT-LABS builds locally owned institutional infrastructure systems. Lower recurring operational cost, reduced downtime, easier repair and maintenance, better operational visibility, improved institutional workflows, locally maintainable capability, documented technical knowledge, measurable performance, repeatable infrastructure.",
};

export default function HomePage() {
  return (
    <main className="home-page">
      <HomeHero />
      <HowWeWork />
      <CurrentProof />
      <StackSummary />
      <footer className="home-footer">
        <div className="container">
          <p className="text-muted">
            {COMPANY.name} — {COMPANY.mantra}
          </p>
          <div className="space-y-4 text-center md:text-left">
            <a href="/contact" className="text-accent hover:text-accent/80 transition-colors">
              Start a conversation
            </a>
            <span className="mx-2 text-muted">·</span>
            <a href="/work" className="text-accent hover:text-accent/80 transition-colors">
              See the work
            </a>
            <span className="mx-2 text-muted">·</span>
            <a href="/roll" className="text-accent hover:text-accent/80 transition-colors">
              View the evidence
            </a>
            <span className="mx-2 text-muted">·</span>
            <a href="/benben" className="text-accent hover:text-accent/80 transition-colors">
              BenBen track
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}