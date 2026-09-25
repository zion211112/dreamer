import { faceMetadata } from "../../../lib/metadata";
import GeoArt from "../../../components/GeoArt";
import "./contact.css";

export const metadata = faceMetadata({
  title: "Contact",
  description: "Build with APT-LABS — for institutions, makers and technical partners, and funders.",
  path: "/contact",
});

const PATHS = [
  {
    title: "Institution",
    copy: "Infrastructure designed around your actual constraints — operation, repair and reproduction included.",
  },
  {
    title: "Maker / Technical Partner",
    copy: "Fabrication, engineering, repair or production — bring the capability you hold.",
  },
  {
    title: "Funder / Partner",
    copy: "Pilot, evidence, deployment or scale — against the record in /evidence and /roll.",
  },
];

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
           <h1 className="contact-title">Build with us.</h1>
          <p className="contact-lead">Three paths, one inbox. Write with the constraint you hold and the work you want done.</p>
        </div>

        <div className="contact-paths" role="list" aria-label="Three paths">
          {PATHS.map((path, i) => (
            <div key={path.title} className="contact-path" role="listitem">
              <span className="contact-path-num">0{i + 1}</span>
              <strong className="contact-path-title">{path.title}</strong>
              <p className="contact-path-copy">{path.copy}</p>
            </div>
          ))}
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

