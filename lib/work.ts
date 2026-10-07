// lib/work.ts — WORK page data (APT Fab + APT Studio + Selected Work)
//
// Constitutional truth (§02):
//   Three pillars: APT Fab (physical infra), APT Studio (productive compute), The Roll (evidence)
//   Operating model: BUILD → MEASURE → DOCUMENT → REPEAT
//   Strategic motion: DISCOVER → DIAGNOSE → PROVE → RECORD → REPEAT
//
// This page exists to show WHAT WE BUILD with evidence states.
// Do NOT create /fab or /studio unless enough real evidence/content for independent value (§02).

import type { EvidenceState } from "./system";
import { STACK } from "./system";

/**
 * Work page data — derived from STACK layers 3 (Build) and 4 (Infrastructure)
 * plus PRODUCTS that exercise those layers.
 */
export const WORK = {
  // APT Fab — Physical institutional infrastructure
  fab: {
    name: "APT Fab",
    alias: "The Fab",
    state: "PLANNED" as EvidenceState,
    description:
      "Physical institutional infrastructure: requirement → design → BOM → source → fabricate/assemble → install → maintain/repair. The layer software alone cannot reach.",
    role: "Power, water and connection at the node — the layer software alone cannot reach.",
    holds: "Deployments and their meters: what was built, what it produced, what it consumed and what it cost.",
    built: "Designed, not built. There is no site, no deployment and no meter record.",
    settles: "One site operating, with its output published as a register rather than as a press note.",
    provenance:
      "Held at PLANNED. This is the layer every infrastructure company describes in the future tense. No figure is carried because the rule that would give it meaning is not running.",
    stages: [
      "Requirement",
      "Design",
      "BOM (Bill of Materials)",
      "Source",
      "Fabricate / Assemble",
      "Install",
      "Maintain / Repair",
    ],
  },

  // APT Studio — Productive computing capacity
  studio: {
    name: "APT Studio",
    alias: "The Studio",
    state: "PLANNED" as EvidenceState,
    description:
      "Productive computing capacity: configure → test → create → render → output → handover. The layer where a build happens in the open, with its register published as it goes.",
    role: "The work happening in the open, with its register published while it happens.",
    holds: "Builds: the brief, the decisions taken, the records they produced, and what each build actually did.",
    built: "Designed as a track in the catalogue: builds worked on with the register public from brief to result. No build has been run in one.",
    settles: "One build carried from brief to result with its register public throughout.",
    provenance:
      "Held at PLANNED. A studio that has not published a build is a room — designed, and not yet a claim.",
    stages: [
      "Configure",
      "Test",
      "Create",
      "Render",
      "Output",
      "Handover",
    ],
  },

  // Selected work / prototypes — actual things built that exercise Fab/Studio layers
  prototypes: [
    {
      name: "School Console (Record Layer)",
      description:
        "The first implementation of the Record layer (Stack layer 01). Nine modules: Roll Call, Fees, Marks, Timetable, Roster, Reports, My Day, Inspection, Comms. Runs entirely on the school's own device. Data is invented (DEMONSTRATION).",
      state: "PROTOTYPE" as EvidenceState,
      dataState: "DEMONSTRATION" as EvidenceState,
      href: "/console",
      stackLayer: "record",
      provenance:
        "Built and openable. No school runs it: no deployment, no customer, no outcome record.",
    },
  ] as const,

  // Operating method — how we work
  operatingMethod: {
    build: "Build",
    measure: "Measure",
    document: "Document",
    repeat: "Repeat",
    description:
      "Every engagement follows BUILD → MEASURE → DOCUMENT → REPEAT. We do not ship architecture — we ship measured improvement.",
  },

  strategicMotion: {
    discover: "Discover",
    diagnose: "Diagnose",
    prove: "Prove",
    record: "Record",
    repeat: "Repeat",
    description:
      "APT-LABS begins with a real institutional problem. It does NOT begin by forcing a predetermined technology into an institution. The motion is DISCOVER → DIAGNOSE → PROVE → RECORD → REPEAT.",
  },
} as const;

/**
 * Helper to get STACK layers relevant to /work page
 */
export const WORK_STACK_LAYERS = STACK.filter(
  (layer) => layer.key === "build" || layer.key === "infrastructure"
);