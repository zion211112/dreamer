import type { Metadata } from "next";
import { RollDesk } from "@/components/site/roll/RollDesk";

export const metadata: Metadata = {
  title: "The roll",
  description:
    "Sign the roll on this device: one record, sealed with a hash computed in your own browser, and a tier derived from eight questions you answer yourself. Nothing is transmitted.",
};

/**
 * THE ROLL — the first surface on this site that does something back.
 *
 * Every other route states what the system holds and why its evidence is
 * in the state it is in. This one is the floor: a form that writes, a
 * questionnaire that scores, an export that writes a file, and a wipe that
 * takes all of it back out. Nothing else on the site can be *used*, so the
 * honesty rules this route inherits are stated here in the same block
 * rather than scattered as caveats — and then repeated at each point of
 * use, because a caveat at the top of a page does not survive the button
 * three scrolls down.
 *
 * The claims this route is allowed to make, and no further:
 *
 *   THE ROLL HAS NO ONE ON IT YET. lib/ledger.ts seeds it empty and there
 *   is no server to add anybody, so the only count on this page is the
 *   number of records this browser holds.
 *   A SEAL IS A HASH OF YOUR OWN RECORD, ON YOUR OWN DEVICE. It is not an
 *   identity, not a credential and not a token, and nothing is sent to
 *   make or check it.
 *   A TIER IS A READING OF HOW YOU ANSWERED, recomputed on this device.
 *   Nobody issued it, it confers nothing anywhere else, and it is not a
 *   certificate or a membership of anything.
 */
export default function RollPage() {
  return (
    <>
      <p className="label">Floor · The roll — sign here, on this device</p>
      <h1 className="page-title">
        One record, one seal, one reading of how you answered.
      </h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>
        The rest of this site describes a system. This route is the part you
        can act on: put a name on the roll, get a record sealed against your
        own edits, and take a tier derived from eight questions whose answers
        you already had. The register starts empty, so the first name on it is
        yours and the only number it can honestly print is how many records
        this browser holds.
      </p>

      <p className="local-note" style={{ marginTop: "var(--s-4)" }}>
        <strong>Before you type · </strong>
        nothing on this page is transmitted. There is no server behind it and
        no account to create. Your record is written to this browser&rsquo;s
        local storage and hashed in this tab; the seal is a fingerprint of your
        own record on your own device — not an identity, not a credential, not
        a token — and the tier is a reading of your own answers, recomputed
        here, worth nothing on any other surface. Clear the browser and the
        record is gone; export it first if you want to keep it.
      </p>

      <RollDesk />
    </>
  );
}