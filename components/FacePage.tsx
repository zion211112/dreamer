import Link from "next/link";
import type { Face } from "../lib/company";

export interface FaceSection {
  title: string;
  body: string;
  items?: string[];
}

export interface FacePageProps {
  face: Face;
  lead: string;
  sections: FaceSection[];
  primaryAction?: { href: string; label: string };
}

/** The shared public presentation for one face of the APT-LABS system. */
export function FacePage({ face, lead, sections, primaryAction }: FacePageProps) {
  return (
    <main className="site-page identity-page">
      <header className="site-frame identity-hero">
        <div className="site-section-head">
          <span>One system · Four faces</span>
          <span className="identity-state">{face.status}</span>
        </div>
        <p className="site-kicker">{face.name}</p>
        <h1 className="page-title">{face.oneLine}</h1>
        <p className="identity-lead">{lead}</p>
        <p className="identity-description">{face.description}</p>
        <div className="identity-actions">
          {primaryAction ? (
            <Link href={primaryAction.href} className="site-action">
              {primaryAction.label}
            </Link>
          ) : null}
          <Link href="/evidence" className="site-action-secondary">
            Inspect the evidence
          </Link>
        </div>
        <p className="identity-provenance">
          State: <strong>{face.status}</strong> · Evidence: {face.evidenceRefs.join(" · ")}
        </p>
      </header>

      <div className="site-frame identity-sections">
        {sections.map((section, index) => (
          <section key={section.title} className="identity-section" aria-labelledby={`section-${index}`}>
            <div className="site-section-head">
              <h2 id={`section-${index}`}>{section.title}</h2>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <p className="identity-section-body">{section.body}</p>
            {section.items ? (
              <ul className="identity-list">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
