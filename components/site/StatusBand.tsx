import { COMPANY } from "@/lib/system";

/**
 * The status band — the always-held truths, declared above the content
 * of every route.
 *
 * It is three items because three claims must never be lost to a
 * scroll, and each one has a counterpart that is frequently claimed
 * without evidence:
 *
 *   Local-first → nothing leaves the device without the institution's action
 *   Prototype   → a working surface is not a deployment
 *   Geography   → named product context, not a verified field presence
 *
 * The geography item is deliberately rendered at the state it actually
 * carries. "Kirinyaga, Kenya" with an UNKNOWN state underneath is the
 * honest form of the claim; the value alone would be marketing.
 */
export function StatusBand() {
  return (
    <div className="status-band">
      <div className="status-band-item">
        <div className="status-band-key">Local-first</div>
        <p className="status-band-val">
          Records live on the institution&rsquo;s own device. The system derives
          intelligence from a record the institution still holds.
        </p>
      </div>
      <div className="status-band-item">
        <div className="status-band-key">State of build</div>
        <p className="status-band-val">
          Working surfaces are <span className="figure">PROTOTYPE</span> — built and
          inspectable, not deployed to any institution.
        </p>
      </div>
      <div className="status-band-item">
        <div className="status-band-key">Geography</div>
        <p className="status-band-val">
          {COMPANY.geography.value} —{" "}
          <span className="figure">{COMPANY.geography.state}</span>. Declared
          operating context; no field presence is evidenced.
        </p>
      </div>
    </div>
  );
}