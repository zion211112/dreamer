// The Console. Where schools and teachers actually build on top of the
// ledger: nine modules, sixteen tools, one local session.
//
// Local-first, like the rest of the app: the "login" is a session on this
// device (localStorage), and favourites persist here too. Nothing leaves
// the browser.

export type ConsoleRole = "teacher" | "school";

export interface ConsoleSession {
  role: ConsoleRole;
  name: string;
  school: string;
  ts: number;
}

export interface ConsoleTool {
  id: string;
  title: string;
  desc: string;
  module: string;
  fav: boolean;
  // ready = a real workspace is behind this card. coming = the seat is
  // reserved and the page says so plainly. The grid never overpromises.
  status: "ready" | "coming";
}

export const CONSOLE_MODULES = [
  "SMIS",
  "Roster",
  "Reports",
  "Inspection",
  "Fees",
  "Library",
  "Timetable",
  "Comms",
  "Manage",
] as const;

// Six workspaces are real (status: "ready") — roster import, records,
// term reports, auto-marking, grade forecast, content studio. The other
// ten hold seats.
export const CONSOLE_TOOLS: ConsoleTool[] = [
  { id: "1", title: "Student Records", desc: "Full roster, streams, departments, admissions.", module: "SMIS", fav: false, status: "ready" },
  { id: "2", title: "Term Reports", desc: "One-click PDF reports for every student.", module: "Reports", fav: true, status: "ready" },
  { id: "3", title: "Fee Tracking", desc: "M-Pesa reconciliation and default prediction.", module: "Fees", fav: false, status: "coming" },
  { id: "4", title: "Inspection Mode", desc: "One-click export for auditors.", module: "Inspection", fav: false, status: "coming" },
  { id: "5", title: "Library Ledger", desc: "Borrowing, returns, inventory linked to student IDs.", module: "Library", fav: false, status: "coming" },
  { id: "6", title: "Timetable Solver", desc: "Master timetable in 60 seconds.", module: "Timetable", fav: false, status: "coming" },
  { id: "7", title: "Auto-Marking", desc: "Upload a test. Get a weakness map.", module: "Console", fav: true, status: "ready" },
  { id: "8", title: "Grade Forecast", desc: "KCSE projection per student.", module: "Reports", fav: false, status: "ready" },
  { id: "9", title: "Roster Import", desc: "Bulk CSV paste. Classes and streams.", module: "Roster", fav: false, status: "ready" },
  { id: "10", title: "Teacher Console", desc: "Lessons, assignments, marking — one screen.", module: "Console", fav: false, status: "coming" },
  { id: "11", title: "Parent Digest", desc: "Weekly WhatsApp summary per student.", module: "Comms", fav: false, status: "coming" },
  { id: "12", title: "Communication", desc: "Bulk SMS and WhatsApp to parents.", module: "Comms", fav: false, status: "coming" },
  { id: "13", title: "Skill Ledger", desc: "Verified capabilities per student.", module: "Reports", fav: false, status: "coming" },
  { id: "14", title: "Cooperative Register", desc: "Members, contributions, shares.", module: "Fees", fav: false, status: "coming" },
  { id: "15", title: "Content Studio", desc: "The atelier — CBC-aligned exam, lesson, media and classroom design, structurally audited on the device before print.", module: "Library", fav: false, status: "ready" },
  { id: "16", title: "Manage", desc: "Settings, billing, integrations.", module: "Manage", fav: false, status: "coming" },
];

export function toolById(id: string): ConsoleTool | undefined {
  return CONSOLE_TOOLS.find((t) => t.id === id);
}

const SESSION_KEY = "aptlabs.console.session";
const FAVS_KEY = "aptlabs.console.favs";

export function loadConsoleSession(): ConsoleSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ConsoleSession) : null;
  } catch {
    return null;
  }
}

export function saveConsoleSession(s: ConsoleSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* memory-only */
  }
}

export function clearConsoleSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* memory-only */
  }
}

// Favourites: the seeded defaults (fav: true in CONSOLE_TOOLS) merged with
// anything the user has starred on this device.
export function loadConsoleFavs(): Set<string> {
  const base = new Set(CONSOLE_TOOLS.filter((t) => t.fav).map((t) => t.id));
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(FAVS_KEY);
    if (!raw) return base;
    return new Set<string>(JSON.parse(raw));
  } catch {
    return base;
  }
}

export function saveConsoleFavs(favs: Set<string>): void {
  try {
    window.localStorage.setItem(FAVS_KEY, JSON.stringify(Array.from(favs)));
  } catch {
    /* memory-only */
  }
}