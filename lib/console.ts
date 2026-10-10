/**
 * APT-LABS Console Module — Local prototype data and configuration
 * This module is the SOLE source of truth for console vocabulary.
 * The public surface (lib/system.ts) MUST NOT copy these names — it imports them
 * only on the exempt /product route, enforced by scripts/check-lexicon.mjs.
 */

export const CONSOLE_MODULES = [
  "roll",
  "work",
  "evidence",
  "settings",
  "dashboard",
] as const;

export const CONSOLE_MENU = {
  "Roll": { href: "/roll", description: "Person & role registry" },
  "Work": { href: "/work", description: "Timetable & duty solver" },
  "Evidence": { href: "/evidence", description: "Graduated evidence ledger" },
  "Settings": { href: "/settings", description: "Organization configuration" },
  "Dashboard": { href: "/dashboard", description: "Operational overview" },
} as const;

export const CONSOLE_TOOLS = [
  { title: "QR Check-In", module: "roll" },
  { title: "Timetable Generator", module: "work" },
  { title: "Duty Roster", module: "work" },
  { title: "Room Assignments", module: "work" },
  { title: "Evidence Entry", module: "evidence" },
  { title: "Compliance Report", module: "evidence" },
  { title: "Org Settings", module: "settings" },
  { title: "User Management", module: "settings" },
] as const;

export const CONSOLE_DATA_STATE = "PROTOTYPE" as const;