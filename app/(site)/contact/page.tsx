import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/system";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact APT-LABS about demo access, pilot enquiries, or investor diligence.",
};

const ENQUIRIES = [
  {
    label: "Demo access",
    detail: "Open the current product and inspect the prototype for yourself.",
    subject: "Demo access",
  },
  {
    label: "Pilot enquiry",
    detail: "Discuss a possible first use, with scope and evidence kept explicit.",
    subject: "Pilot enquiry",
  },
  {
    label: "Investor diligence",
    detail: "Ask about the company, product state, commercial shape, or open questions.",
    subject: "Investor diligence",
  },
] as const;

function mailto(subject: string) {
  return `mailto:${COMPANY.contact.email}?subject=${encodeURIComponent(subject)}`;
}

export default function ContactPage() {
  return (
    <div className="contact-directory">
      <div className="contact-directory-head">
        <div>
          <p className="label">Company files / Contact</p>
          <h1 className="page-title">A real person is at the other end.</h1>
        </div>
        <p className="contact-intro">No intake maze. Choose the reason that brought you here and your email app will open with the subject already set.</p>
      </div>

      <div className="contact-address-row">
        <span className="contact-file-icon" aria-hidden="true" />
        <div><span>ORGANIZATION CONTACT</span><a href={mailto("APT-LABS enquiry")}>{COMPANY.contact.email}</a></div>
        <span className="contact-address-state">{COMPANY.contact.note}</span>
      </div>

      <section className="contact-enquiries" aria-labelledby="contact-enquiries-title">
        <div className="contact-enquiries-head">
          <h2 id="contact-enquiries-title">Choose a thread</h2>
          <span>3 CONTACT ROUTES</span>
        </div>
        <ul>
          {ENQUIRIES.map((enquiry, index) => (
            <li key={enquiry.subject}>
              <span className="contact-row-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="contact-row-copy">
                <h3>{enquiry.label}</h3>
                <p>{enquiry.detail}</p>
              </div>
              <a href={mailto(enquiry.subject)} aria-label={`Email APT-LABS about ${enquiry.label}`}>
                Compose <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <aside className="contact-footnote">
        <span className="contact-file-icon" aria-hidden="true" />
        <p>{COMPANY.contact.provenance}</p>
        <Link href="/evidence">How claims are held <span aria-hidden="true">↗</span></Link>
      </aside>
    </div>
  );
}