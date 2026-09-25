import { ASSET_RECORDS, ASSET_STATES, assetRegisterSeal } from "../../../../lib/assets";
import { shortHash } from "../../../../lib/ledger";
import { faceMetadata } from "../../../../lib/metadata";
import "../../../identity.css";

export const metadata = faceMetadata({
  title: "The Roll — Asset Register",
  description: "The institutional Asset Register records designed, purchased, fabricated, installed, repaired, trained, tested, accepted and verified work with an explicit state and seal.",
  path: "/roll/assets",
});

export default function AssetRegisterPage() {
  const registerSeal = assetRegisterSeal(ASSET_RECORDS);

  return (
    <main className="site-page identity-page">
      <header className="site-frame identity-hero">
        <div className="site-section-head">
          <span>The Roll · Register B</span>
          <span className="identity-state">PROTOTYPE</span>
        </div>
        <p className="site-kicker">Asset Register</p>
        <h1 className="page-title">What was designed, made, installed and proved.</h1>
        <p className="identity-lead">A transparent state for every institutional asset. No record advances on intention alone.</p>
        <p className="identity-description">Assets may be designed, purchased, fabricated, installed, repaired, trained, tested, accepted and documented. Every entry uses the same canonical hashing and rolling master-seal machinery as the People Register.</p>
      </header>

      <section className="site-frame identity-section" aria-labelledby="asset-state-title">
        <div className="site-section-head"><h2 id="asset-state-title">Evidence states</h2><span>Lifecycle</span></div>
        <div className="identity-state-ledger">
          {ASSET_STATES.map((state) => <div key={state}><span>{state}</span><strong>State</strong></div>)}
        </div>
      </section>

      <section className="site-frame identity-empty" aria-labelledby="empty-title">
        <p className="site-kicker">Current register</p>
        <h2 id="empty-title">No verified assets are published.</h2>
        <p>The correct initial state is empty. A future entry must carry its evidence, date, location, bill-of-materials state and review status. The register will not be back-filled with demonstration assets.</p>
        <code className="identity-seal">Register seal {shortHash(registerSeal)}</code>
      </section>
    </main>
  );
}
