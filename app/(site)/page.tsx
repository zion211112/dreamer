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
        <p>{COMPANY.name} — {COMPANY.mantra}</p>
        <p>
          <a href="/contact">Start a conversation</a> ·
          <a href="/work">See the work</a> ·
          <a href="/roll">View the evidence</a> ·
          <a href="/benben">BenBen track</a>
        </p>
      </footer>
    </main>
  );
}