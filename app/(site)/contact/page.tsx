// Contact, the classic way: one centered column, two lines of information,
// one place. No artwork, no motion — the information, set quietly. Email is
// the first line, WhatsApp the second, both prefilled.
export default function Contact() {
  const email = "mailto:aptlabske@gmail.com?subject=Schools%20%2B%20partners";
  const whatsapp = "https://wa.me/254704260906?text=Greetings.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 py-16 text-ivory md:py-24">
      <section className="contact-classic">
        <h1 className="contact-title">Contact</h1>

        <p className="contact-lead">Write to us. One reply, no queue.</p>

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
                rel="noopener"
                aria-label="WhatsApp +254 704 260 906"
              >
                +254 704 260 906
              </a>
            </dd>
          </div>
        </dl>

        <p className="contact-loc">Kirinyaga, Kenya</p>
      </section>
    </main>
  );
}


