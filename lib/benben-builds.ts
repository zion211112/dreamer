// lib/benben-builds.ts — BENBEN BUILDS product track (separate from APT-LABS core)
//
// BenBen Builds is an associated product track. It is NOT APT-LABS core.
// The School Console is a BenBen Builds product.
//
// Constitutional boundary (§03):
//   "School Console = BenBen product. Do not turn into APT-LABS core.
//   Do not imply deployed unless repo proves it. Do not use as public hero."

import type { EvidenceState } from "./system";

/**
 * BenBen Builds — the associated product track
 */
export const BENBEN_BUILDS = {
  name: "BenBen Builds",
  tagline: "Associated product track — not APT-LABS core",
  description:
    "BenBen Builds is a separate track for products that use the BenBen protocol (SBTs, DIDs, evidence anchoring) as their enabling primitive. These products are not APT-LABS core infrastructure.",
  products: [
    {
      name: "School Console",
      kind: "management-system" as const,
      buyer: "A school. Head teacher or proprietor.",
      unit: "module",
      state: "PROTOTYPE" as EvidenceState,
      dataState: "DEMONSTRATION" as EvidenceState,
      href: "/console",
      oneLine:
        "The operating software a school runs its week on — the roll, the money, the marks, the timetable and the parents — running entirely on the school's own device.",
      localFirst:
        "Records written on a device like this stay on the device that wrote them until the school exports them. Nothing is transmitted.",
      commercial:
        "Sold per school, per term, to the school itself. The buyer is the head teacher or the proprietor rather than a ministry, because the record never leaves the device.",
      provenance:
        "Built and openable at /console. Nine modules. No school runs it: there is no deployment, no customer and no outcome record. The data inside it is invented and labelled DEMONSTRATION wherever it is described.",
      modules: [
        "Roll Call",
        "Fees",
        "Marks",
        "Timetable",
        "Roster",
        "Reports",
        "My Day",
        "Inspection",
        "Comms",
      ],
    },
  ],
  boundary:
    "BenBen Builds products use the BenBen protocol (SBTs, DIDs, ZK proofs, evidence anchoring, revocation) as their enabling primitive. They are separate from APT-LABS core (Fab / Studio / Roll).",
} as const;

/**
 * School Console — exported for /benben page consumption
 */
export const SCHOOL_CONSOLE = BENBEN_BUILDS.products[0];