import { ASSET_STATES, type AssetState } from "./company";
import { sha256 } from "./hash";
import { masterHash } from "./ledger";

export { ASSET_STATES };
export type { AssetState };

export interface AssetRecord {
  id: string;
  name: string;
  state: AssetState;
  face: "deploy" | "fab" | "studio";
  summary: string;
  location: string;
  evidence: string;
  bom: string;
  updatedAt: string;
  hash: string;
}

/**
 * No historical asset is asserted until its evidence is recorded. An empty
 * register is the truthful initial state.
 */
export const ASSET_RECORDS: AssetRecord[] = [];

export function assetCanonical(
  asset: Pick<AssetRecord, "id" | "name" | "state" | "face" | "summary" | "location" | "evidence" | "bom" | "updatedAt">,
): string {
  return [
    asset.id,
    asset.name,
    asset.state,
    asset.face,
    asset.summary,
    asset.location,
    asset.evidence,
    asset.bom,
    asset.updatedAt,
  ].join("|");
}

export function assetSeal(asset: Omit<AssetRecord, "hash">): string {
  return sha256(assetCanonical(asset));
}

export function assetRegisterSeal(records: AssetRecord[]): string {
  return masterHash(records.map((record) => record.hash));
}
