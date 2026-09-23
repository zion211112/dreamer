import type { Metadata } from "next";
import Image from "next/image";
import "./brief.css";

export const metadata: Metadata = {
  title: "Brief",
  description:
    "APT-LABS in one page — the ledger, the ask, and how to verify a record.",
};

// Public base URL the QR points at. Falls back to the Vercel URL when the
// env var is unset so the handout still scans to a live ledger.
const base =
  process.env.NEXT_PUBLIC_BASE_URL || "https://apt-labs.vercel.app";
const ledgerUrl = `${base.replace(/\/$/, "")}/ledger`;
const qrSrc =
  "https://api.qrserver.com/v1/create-qr-code/?" +
  new URLSearchParams({ size: "240x240", margin: "8", data: ledgerUrl }).toString();

export default function BriefPage() {
  return (
    <main className="brief-page">
      <div className="brief-frame">
        <header className="brief-head">
          <p className="brief-kicker">APT-LABS · KIRINYAGA NODE</p>
          <h1 className="brief-title">The ledger of useful work.</h1>
          <p className="brief-lead">
            We&apos;re making a list of everyone in Kirinyaga who can actually
            do things — and the roll is public.
          </p>
        </header>

        <section className="brief-surfaces" aria-label="What the ledger does">
          <div className="brief-surfaces-head"><span>Three working surfaces</span></div>
          <ol className="brief-list">
            <li><b>The Roll</b> — names, skills, sealed proof of work. Open it, verify any record.</li>
            <li><b>The Floor</b> — proposals move to proof, in public.</li>
            <li><b>The Console</b> — a school&apos;s day, marked into a signal a principal can act on.</li>
          </ol>
        </section>

        <section className="brief-ask" aria-label="The ask">
          <div className="brief-ask-head"><span>The ask</span></div>
          <p className="brief-ask-text">
            Ninety days, one school, one signal. We mark two terms for a single
            school and hand the principal a signal they can act on. Entry is
            <span className="brief-term"> KES 100 / hall seat</span>; a school&apos;s day
            runs <span className="brief-term">KES 3,000 / month</span>. The county pays
            for capacity, not for software.
          </p>
          <p className="brief-proof">
            Proof is sealed, not asserted: every entry on the roll is hash-linked.
            Open the ledger and verify one.
          </p>
        </section>

        <section className="brief-scan" aria-label="Scan">
          <div className="brief-scan-grid">
            <Image
              className="brief-qr"
              src={qrSrc}
              width={132}
              height={132}
              alt="QR code linking to the APT-LABS ledger"
            />
            <div className="brief-scan-meta">
              <p className="brief-kicker">Scan · or open</p>
              <a
                className="brief-url"
                href={ledgerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ledgerUrl}
              </a>
              <p className="brief-print-hint">Print this page (A4) — it&apos;s built to print.</p>
            </div>
          </div>
        </section>

        <footer className="brief-foot">
          <span>APT-LABS · Kirinyaga, Kenya</span>
          <span>local-first record · counts visible · identity yours</span>
        </footer>
      </div>
    </main>
  );
}
