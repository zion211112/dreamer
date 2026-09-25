"use client";

import { useState } from "react";

// Roll preview switch. Both registers are presented with honest empty
// states — the reference's seeded demo rows never ship on this site.
export function RollPreview() {
  const [tab, setTab] = useState<"assets" | "people">("assets");

  return (
    <>
      <div className="sb-roll-head">
        <div>
          <div className="sb-eyebrow">02 / The Roll</div>
          <h2 className="sb-section-title" data-reveal>
            Evidence before scale.
          </h2>
        </div>
        <div className="sb-switch" role="group" aria-label="Register">
          <button
            type="button"
            className={tab === "assets" ? "active" : ""}
            aria-pressed={tab === "assets"}
            onClick={() => setTab("assets")}
          >
            Assets
          </button>
          <button
            type="button"
            className={tab === "people" ? "active" : ""}
            aria-pressed={tab === "people"}
            onClick={() => setTab("people")}
          >
            People
          </button>
        </div>
      </div>
      <p className="sb-section-copy" style={{ maxWidth: 760, marginTop: 18 }} data-reveal>
        One evidence model, two registers: the people who contribute capability
        and the assets that carry the work forward.{" "}
        <a className="sb-section-link" href="/roll">
          Open the full Roll →
        </a>
      </p>

      {tab === "assets" ? (
        <div className="sb-shell" data-reveal>
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>State</th>
                <th>Evidence</th>
                <th>Seal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="sb-empty">
                <td colSpan={5}>
                  <strong>No assets on record.</strong>
                  The register starts empty. An asset without evidence is
                  marked accordingly or omitted — never back-filled.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sb-shell" data-reveal>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Capability</th>
                <th>Region</th>
                <th>State</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              <tr className="sb-empty">
                <td colSpan={5}>
                  <strong>No people published.</strong>
                  Capability records stay private until evidenced. No names are
                  listed here until the evidence record can stand behind them.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="sb-truth-note" data-reveal>
        <div className="sb-truth">
          <div className="label">Verified</div>
          <h4>Evidence exists.</h4>
          <p>Claims backed by an identifiable source.</p>
        </div>
        <div className="sb-truth">
          <div className="label">Prototype</div>
          <h4>Working model.</h4>
          <p>Implemented but not presented as field outcome.</p>
        </div>
        <div className="sb-truth">
          <div className="label">Planned</div>
          <h4>Defined next.</h4>
          <p>Specified work not yet completed.</p>
        </div>
        <div className="sb-truth">
          <div className="label">Unknown</div>
          <h4>Not claimed.</h4>
          <p>No inference is substituted for evidence.</p>
        </div>
      </div>
    </>
  );
}
