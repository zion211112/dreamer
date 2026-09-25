import Link from "next/link";
import type { ReactNode } from "react";
import { COMPANY } from "../lib/company";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="site-page">
      <div className="site-frame identity-frame">
        <header className="identity-header">
          <p className="site-kicker">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="identity-lead">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

export function StatusTag({ state }: { state: string }) {
  return <span className="status-tag" data-state={state.toLowerCase()}>{state}</span>;
}

export function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="identity-section" aria-labelledby={`section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
      <div className="site-section-head">
        <h2 id={`section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{label}</h2>
        <span>{title}</span>
      </div>
      <div className="identity-section-body">{children}</div>
    </section>
  );
}

export function EvidenceList({ items }: { items: ReadonlyArray<{ label: string; value: string; state: string }> }) {
  return (
    <dl className="evidence-list">
      {items.map((item) => (
        <div className="evidence-row" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <span>{item.value}</span>
            <StatusTag state={item.state} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function RouteLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="identity-link" href={href}>{children}</Link>;
}
