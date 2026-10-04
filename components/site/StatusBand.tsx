import { COMPANY } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The status band — the always-held truths, declared above the content
 * of every route.
 *
 * It is three items because three claims must never be lost to a scroll,
 * and each has a counterpart that is frequently claimed without evidence:
 *
 *   Product   → built and openable is not sold. It says how many are built
 *   Data      → running on demonstration data is not running on a school's
 *   Custody   → nothing leaves the device. That one is a real constraint,
 *               not a slogan, and it is the reason a school can buy this
 *
 * The second item is new, and it is the most important thing on this band.
 * The console seeds itself — ten invented schools, roughly 7,650 learners,
 * a term of scores and fee records — so the previous band, which held only
 * "no deployment", left the single most misreadable fact on the site
 * unstated. A reader who opened the console and saw a full school saw ten
 * schools' worth of data and had no way to know it was invented.
 *
 * Geography moved out of this band entirely. It was rendered here as
 * "Kirinyaga, Kenya — UNKNOWN · Declared operating context; no field
 * presence is evidenced", which asserted an operating claim in the label
 * and then withdrew it in the note. It now lives on the product and
 * register routes, phrased as where the company builds from.
 */
export function StatusBand() {
  return (
    <div className="status-band">
      <div className="status-band-item">
        <div className="status-band-key">Built</div>
        <p className="status-band-val">
          One management system is built and openable here.{" "}
          <span className="figure">0 customers</span> — measured, not
          assumed.
        </p>
      </div>
      <div className="status-band-item">
        <div className="status-band-key">Data</div>
        <p className="status-band-val">
          Everything shown runs on invented records, labelled{" "}
          <StateTag state="DEMONSTRATION" />. No real person or institution
          is described anywhere on this site.
        </p>
      </div>
      <div className="status-band-item">
        <div className="status-band-key">Custody</div>
        <p className="status-band-val">
          Records stay on the device that wrote them. Nothing is transmitted,
          which is what makes the product something a school can own.
        </p>
      </div>
    </div>
  );
}