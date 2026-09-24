import type { Metadata } from "next";
import GeoArt from "../../../components/GeoArt";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to APT-LABS. One reply, no queue.",
};

export default function Contact() {
  const email = "mailto:aptlabske@gmail.com?subject=Schools%20%2B%20partners";
  const whatsapp = "https://wa.me/254704260906?text=Greetings.";

  return (
    <main className="site-page contact-page">
      <section className="contact-classic site-frame">
        <GeoArt variant="corner" className="contact-art" />
        <div className="site-section-head"><span>Contact / APT-LABS</span><span>one reply · no queue</span></div>
        <div className="record-intro contact-intro">
          <p className="site-kicker">For schools, partners, and doers</p>
           <h1 className="contact-title">Write to us.</h1>
          <p className="contact-lead">A useful question, a school that needs capacity, or work that belongs on the roll.</p>
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

        <p className="contact-loc">Kirinyaga, Kenya · local-first record</p>
      </section>
    </main>
  );
}


