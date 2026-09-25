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
        <div className="site-section-head"><h2 id="asset-state-title">Evidence states</h2><span>Lifecycle · no active record</span></div>
        <div className="asset-lifecycle" aria-label="Asset evidence lifecycle">
          {ASSET_STATES.map((state, index) => (
            <div key={state} className="asset-lifecycle-step" data-state={state}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{state}</strong>
              <small>NOT RECORDED</small>
            </div>
          ))}
        </div>
      </section>

      <section className="site-frame asset-anatomy" aria-labelledby="asset-anatomy-title">
        <div className="site-section-head">
          <h2 id="asset-anatomy-title">Record anatomy</h2>
          <span>Illustrative schema · not a published asset</span>
        </div>
        <div className="asset-record-template" aria-label="Illustrative asset record template">
          <div className="asset-record-header">
            <div>
              <span className="asset-record-kicker">TEMPLATE RECORD</span>
              <h3>ASSET-TEMPLATE</h3>
            </div>
            <span className="asset-record-state">PLANNED</span>
          </div>
          <dl className="asset-record-fields">
            <div><dt>Record ID</dt><dd>ASSET-TEMPLATE</dd></div>
            <div><dt>Name</dt><dd>Asset name</dd></div>
            <div><dt>Face</dt><dd>Deploy / Fab / Studio</dd></div>
            <div><dt>Current state</dt><dd>Planned until evidence exists</dd></div>
            <div><dt>Evidence</dt><dd>Required before state advances</dd></div>
            <div><dt>Bill of materials</dt><dd>Not recorded</dd></div>
            <div><dt>Location</dt><dd>Not recorded</dd></div>
            <div><dt>Review date</dt><dd>No date</dd></div>
            <div><dt>Seal</dt><dd>Computed when a record exists</dd></div>
          </dl>
          <div className="asset-record-footer">
            <span>Schema preview · no historical asset is asserted</span>
            <code>record → evidence → state → seal</code>
          </div>
        </div>
      </section>

      <section className="site-frame identity-empty" aria-labelledby="empty-title">
        <p className="site-kicker">Current register</p>
        <h2 id="empty-title">No verified assets are published.</h2>
        <p>The correct initial state is empty. A future entry must carry its evidence, date, location, bill-of-materials state and review status. The register will not be back-filled with demonstration assets.</p>
        {ASSET_RECORDS.length === 0 ? (
          <span className="identity-seal">EMPTY REGISTER · NO ASSET SEAL</span>
        ) : (
          <code className="identity-seal">Register seal {shortHash(registerSeal)}</code>
        )}
      </section>
    </main>
  );
}
