import Link from "next/link";
import { COMPANY } from "../../lib/company";
import "../globals.css";
import "../home.css";

export const metadata: { title: string; description: string } = {
  title: "Systems your institutions can own",
  description:
    "APT-LABS builds locally owned systems that run without a network, a subscription, or us — and stay in the hands of the people they serve.",
};

export default function HomePage() {
  return (
    <main className="sublime">
      <div className="sublime-glow" aria-hidden="true" />

      <section className="sublime-hero">
        <div className="site-frame">
          <p className="sublime-eyebrow">
            <span className="sublime-eyebrow-dot" aria-hidden="true" />
            {COMPANY.name} · {COMPANY.geography.text}
          </p>
          <h1 className="page-title sublime-title">
            Systems your institutions can own.
          </h1>
          <p className="sublime-lede">
            Built to run without a network, without a subscription, without us
            — and kept in the hands of the people they serve.
          </p>
          <div className="sublime-actions">
            <Link href="/console" className="site-action">
              Enter the console <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact" className="site-action-secondary">
              Say hello
            </Link>
          </div>
        </div>
      </section>

      <section className="sublime-whisper">
        <div className="site-frame">
          <div className="sublime-whisper-row" role="list" aria-label="How we build">
            <span role="listitem">Local</span>
            <span role="listitem">Offline</span>
            <span role="listitem">Reproducible</span>
          </div>
          <p className="sublime-whisper-note">
            A quiet prototype. Most of it is still being built.
          </p>
        </div>
      </section>
    </main>
  );
}
