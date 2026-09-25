import Link from "next/link";
import DeployPreview from "../../components/DeployPreview";
import { COMPANY, FACES, INTAKE, OPERATING_LOOP } from "../../lib/company";
import "../globals.css";
import "../home.css";

export const metaMetadata = {
  title: { absolute: "APT-LABS — Institutional Infrastructure Systems" },
  description: "Locally owned institutional infrastructure systems. Terminal-grade aesthetic.",
};

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* System Strip */}
      <div className="system-strip">
        <div className="system-strip-inner">
          <span className="mono text-sig" style={{ fontSize: "11px", letterSpacing: "0.15em" }}>SYS: ONE ENTITY · FOUR FACES</span>
          <span className="mono text-dim">APT-LABS / {COMPANY.geography.text}</span>
          <span className="mono text-dim">OFFLINE → ONLINE → REPLICABLE</span>
        </div>
      </div>

      {/* Hero */}
      <section className="home-hero">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="mono text-sig" style={{ fontSize: "11px", letterSpacing: "0.15em", display: "block" }}>PROJECT / {COMPANY.geography.text.toUpperCase()} / INFRASTRUCTURE_SYSTEM</span>
            <h1 className="head" style={{ marginTop: "16px", letterSpacing: "-0.04em", lineHeight: "1.1" }}>
              Infrastructure that institutions can run, repair and reproduce locally.
            </h1>
            <span style={{ display: "block", marginTop: "16px", maxWidth: "42ch", fontSize: "15px", lineHeight: "1.5", color: "var(--dim)" }}>
              Software. Hardware. Creative-computing capacity. Documentation layer for local technical adoption.
            </span>
            <div className="hero-actions" style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link href="/console" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "36px", padding: "0 20px", fontSize: "12px", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: "2px", textDecoration: "none", border: "1px solid var(--sig)", color: "var(--sig)", background: "transparent" }}>
                CONSOLE.EXE
              </Link>
              <Link href="/evidence" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "36px", padding: "0 20px", fontSize: "12px", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: "2px", textDecoration: "none", border: "1px solid var(--rule)", color: "var(--dim)", background: "transparent" }}>
                EVIDENCE.MD
              </Link>
            </div>
          </div>
          <div className="hero-preview" style={{ display: "flex", flexDirection: "column" }}>
            <DeployPreview />
          </div>
        </div>
      </section>

      {/* Architecture Grid */}
      <section id="architecture">
        <div className="section-frame">
          <div className="section-head" style={{ margin: "40px 0 16px" }}>
            <span style={{ margin: "0", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sig)", display: "block" }}>ARCHITECTURE_GRID</span>
            <h2 style={{ margin: "8px 0 0", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15", color: "var(--text)", maxWidth: "20ch", textWrap: "balance" }}>
              One system. One evidence model.
            </h2>
          </div>
          <div className="arch-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)" }}>
            <div className="arch-item" style={{ background: "var(--panel)", padding: "20px 24px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>01_CAPABILITY</span>
              <h3 style={{ margin: "12px 0 8px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{INTAKE.name}</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)" }}>Local capability enters here, is verified, then can move into APT Deploy, Fab or Studio.</span>
            </div>
            <div className="arch-item" style={{ background: "var(--panel)", padding: "20px 24px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>02_APPLICATION</span>
              <h3 style={{ margin: "12px 0 8px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{FACES.deploy.name}</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)" }}>Offline-first institutional software for records, assessment and operations.</span>
            </div>
            <div className="arch-item" style={{ background: "var(--panel)", padding: "20px 24px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>03_PRODUCTION</span>
              <h3 style={{ margin: "12px 0 8px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{FACES.fab.name}</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)" }}>Documented, repairable hardware for local production and maintenance.</span>
            </div>
            <div className="arch-item" style={{ background: "var(--panel)", padding: "20px 24px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ marginBottom: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>04_RECORDING</span>
              <h3 style={{ margin: "12px 0 8px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{FACES.roll.name}</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)" }}>One ledger. Two registers. One SHA-256 sealing discipline.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Framework */}
      <section className="evidence">
        <div className="section-frame">
          <div className="section-head" style={{ margin: "40px 0 16px" }}>
            <span style={{ margin: "0", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sig)", display: "block" }}>EVIDENCE_FRAME</span>
            <h2 style={{ margin: "8px 0 0", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15", color: "var(--text)", maxWidth: "20ch", textWrap: "balance" }}>
              State before claim
            </h2>
          </div>
          <div className="evidence-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)" }}>
            <article className="evidence-card" style={{ background: "var(--panel)", padding: "18px 20px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ display: "inline-block", marginBottom: "12px", padding: "2px 8px", fontSize: "9px", fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tag-verified)", background: "var(--sig-soft)" }}>PROTOTYPE</span>
              <span style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "600", letterSpacing: "0.1em", color: "var(--rule)" }}>01</span>
              <h3 style={{ margin: "8px 0 6px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>What exists</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>Working software and an evidence model. The local console, SHA-256 record discipline and two empty local-first registers are inspectable.</span>
            </article>
            <article className="evidence-card" style={{ background: "var(--panel)", padding: "18px 20px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ display: "inline-block", marginBottom: "12px", padding: "2px 8px", fontSize: "9px", fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tag-planned)", background: "transparent" }}>PLANNED</span>
              <span style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "600", letterSpacing: "0.1em", color: "var(--rule)" }}>02</span>
              <h3 style={{ margin: "8px 0 6px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Bounded pilot</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>Cost, performance, adoption, repair and local production must be measured first.</span>
            </article>
            <article className="evidence-card" style={{ background: "var(--panel)", padding: "18px 20px", display: "flex", flexDirection: "column", minHeight: "0" }}>
              <span style={{ display: "inline-block", marginBottom: "12px", padding: "2px 8px", fontSize: "9px", fontWeight: "500", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tag-unknown)", background: "transparent" }}>UNKNOWN</span>
              <span style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "600", letterSpacing: "0.1em", color: "var(--rule)" }}>03</span>
              <h3 style={{ margin: "8px 0 6px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Field outcomes</h3>
              <span style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>No verified school deployment, beneficiary result, revenue figure or partner is published.</span>
            </article>
          </div>
        </div>
      </section>

      {/* Process Loop */}
      <section className="process">
        <div className="section-frame">
          <div className="section-head" style={{ margin: "40px 0 16px" }}>
            <span style={{ margin: "0", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sig)", display: "block" }}>PROCESS_ORDER</span>
            <h2 style={{ margin: "8px 0 0", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15", color: "var(--text)", maxWidth: "20ch", textWrap: "balance" }}>
              From prototype to replication
            </h2>
          </div>
          <div className="process-rail" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0", background: "var(--panel)", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
            {OPERATING_LOOP.map((step, index) => (
              <div key={step} className="process-step" style={{ display: "flex", flexDirection: "column", padding: "20px 8px", minHeight: "0", borderRight: "1px solid var(--rule)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "600", letterSpacing: "0.1em", color: "var(--sig)", marginBottom: "4px" }}>{String(index + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: "12px", lineHeight: "1.4", color: "var(--dim)" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="initiate">
        <div className="section-frame">
          <div className="initiate-content" style={{ padding: "48px 24px" }}>
            <span style={{ margin: "0", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sig)", display: "block" }}>INITIATE_SESSION</span>
            <h2 style={{ margin: "8px 0 12px", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15", color: "var(--text)", maxWidth: "20ch", textWrap: "balance" }}>
              Start with inspection.
            </h2>
            <span style={{ display: "block", marginBottom: "24px", fontSize: "14px", lineHeight: "1.5", color: "var(--dim)" }}>
              Open the local prototype, read the evidence boundary, or contact APT-LABS about a bounded institutional conversation.
            </span>
            <div className="hero-actions" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link href="/console" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "36px", padding: "0 20px", fontSize: "12px", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: "2px", textDecoration: "none", border: "1px solid var(--sig)", color: "var(--sig)", background: "transparent" }}>
                OPEN_CONSOLE.EXE
              </Link>
              <Link href="/contact" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "36px", padding: "0 20px", fontSize: "12px", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: "2px", textDecoration: "none", border: "1px solid var(--rule)", color: "var(--dim)", background: "transparent" }}>
                INITIATE_CONTACT
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

