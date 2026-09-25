import { faceMetadata } from "../../../lib/metadata";
import GeoArt from "../../../components/GeoArt";
import "./contact.css";

export const metadata = faceMetadata({
  title: "Contact",
  description: "Contact APT-LABS by email or WhatsApp. A direct project enquiry about infrastructure, prototypes, evidence or collaboration.",
  path: "/contact",
});

export default function Contact() {
  const email = "mailto:aptlabske@gmail.com?subject=APT-LABS%20enquiry";
  const whatsapp = "https://wa.me/254704260906?text=Greetings.";

  return (
    <main className="site-page contact-page">
      <section className="contact-classic site-frame">
        <GeoArt variant="corner" className="contact-art" />
        <div className="site-section-head"><span>Contact / APT-LABS</span><span>direct project contact</span></div>
        <div className="record-intro contact-intro">
          <p className="site-kicker">For institutions, builders, and local teams</p>
           <h1 className="contact-title">Write to us.</h1>
          <p className="contact-lead">A useful question about institutional infrastructure, a prototype, evidence, or local technical work.</p>
        </div>

        <dl className="contact-lines">
          <div className="contact-line">
            <dt className="contact-label">Email</dt>
            <dd className="contact-value">
              <a href={email} aria-label="Email aptlabske@gmail.com">aptlabske@gmail.com</a>
            </dd>
          </div>
          <div className="contact-line">
            <dt className="contact-label">WhatsApp</dt>
            <dd className="contact-value">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp +254 704 260 906"
              >
                +254 704 260 906
              </a>
            </dd>
          </div>
        </dl>

        <p className="contact-loc">Kirinyaga, Kenya · declared operating geography</p>
      </section>
    </main>
  );
}


