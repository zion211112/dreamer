import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, FACES, REGISTERS } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import "../../identity.css";

export const metadata: Metadata = faceMetadata({
  title: FACES.roll.name,
  description: "The Roll is APT-LABS' single evidence model: one ledger with a public People Register and an institutional Asset Register.",
  path: "/roll",
});

export default function RollPage() {
  return (
    <main className="site-page identity-page">
      <header className="site-frame identity-hero">
        <div className="site-section-head">
          <span>One ledger · Two registers</span>
          <span className="identity-state">{FACES.roll.status}</span>
        </div>
        <p className="site-kicker">{FACES.roll.name}</p>
        <h1 className="page-title">Proof for capability and infrastructure.</h1>
        <p className="identity-lead">People and assets are recorded separately, but share the same SHA-256 sealing and rolling master-seal model.</p>
        <p className="identity-description">{FACES.roll.description}</p>
      </header>

      <div className="site-frame identity-register-grid">
        <section aria-labelledby="registers-title">
          <p className="site-kicker">The two registers</p>
          <h2 id="registers-title" className="identity-register-title">Different records. Same evidence discipline.</h2>
          <p className="identity-register-copy">A person’s skill and a physical asset’s installation state are not the same fact. The Roll keeps their records distinct while giving both a state, a seal and a verification method.</p>
          <div style={{ marginTop: 32 }}>
            {REGISTERS.map((register) => (
              <Link key={register.route} href={register.route} className="identity-register-link">
                <span>
                  <strong>{register.name}</strong><br />
                  <span className="identity-register-copy">{register.summary}</span>
                </span>
                <span>Open →</span>
              </Link>
            ))}
          </div>
        </section>

        <aside aria-labelledby="trust-title">
          <div className="site-section-head"><span>Trust model</span><span>{COMPANY.name}</span></div>
          <h2 id="trust-title" className="identity-register-title">The seal proves a record exists.</h2>
          <p className="identity-register-copy">A hash detects changes to a canonical record. It does not prove the truth of an unverified statement, and it does not reveal private identity.</p>
          <div className="identity-state-ledger">
            {REGISTERS.map((register) => (
              <div key={register.name}><span>{register.name}</span><strong>{register.status}</strong></div>
            ))}
            <div><span>Seal algorithm</span><strong>SHA-256</strong></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
