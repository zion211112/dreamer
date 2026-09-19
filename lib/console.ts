// The Console. Where schools and teachers actually build on top of the
// ledger: nine modules, ten tools, one local session.
//
// Nine, not thirteen. The grid was cut to what carries a teacher's week:
// Content Studio leads — you build the material — Auto-Marking follows —
// you mark it — and the rest of the week hangs off those two.
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

// The nine modules, in display order. Content Studio leads, Auto-Marking
// follows — the material, then the mark of it. Roster and Timetable feed
// the day; Reports closes the loop.
export const CONSOLE_MODULES = [
  "Content Studio",
  "Auto-Marking",
  "My Day",
  "Timetable",
  "Roster",
  "Reports",
  "Fees",
  "Inspection",
  "Comms",
] as const;

// One menu entry per module. `tint` is the module's pastel-chip colour —
// the same chip language the site uses for live data, so a module card and
// a status pill read as one system across the app.
export const CONSOLE_MENU: Record<string, { modules: string[]; icon: string; desc: string; tint: string }> = {
  "Content Studio": { modules: ["Content Studio"], icon: "Content Studio", desc: "Lesson plans, semester outlines, video-note tests — built from your own notes.", tint: "border-violet-400/20 bg-violet-400/10 text-violet-300" },
  "Auto-Marking": { modules: ["Auto-Marking"], icon: "Auto-Marking", desc: "Upload a test paper. Get back a weakness map.", tint: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  "My Day": { modules: ["My Day"], icon: "My Day", desc: "Today on one timeline — lessons, attendance, grades, notes, and a small planner.", tint: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
  "Timetable": { modules: ["Timetable"], icon: "Timetable", desc: "Build the week, print it for the wall, approve it — Today reads from it.", tint: "border-sky-400/20 bg-sky-400/10 text-sky-300" },
  "Roster": { modules: ["Roster"], icon: "Roster", desc: "Bulk CSV paste. Classes and streams.", tint: "border-rose-400/20 bg-rose-400/10 text-rose-300" },
  "Reports": { modules: ["Reports"], icon: "Reports", desc: "One-click term reports and KCSE forecasts, per student.", tint: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300" },
  "Fees": { modules: ["Fees"], icon: "Fees", desc: "Invoices, M-Pesa reconciliation, balances.", tint: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300" },
  "Inspection": { modules: ["Inspection"], icon: "Inspection", desc: "Audit checklists, one-click exports.", tint: "border-teal-400/20 bg-teal-400/10 text-teal-300" },
  "Comms": { modules: ["Comms"], icon: "Comms", desc: "Bulk SMS and WhatsApp to parents.", tint: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300" },
};

// The ten tools behind the nine modules. Six are ready workspaces; three
// hold their seats and say so plainly; Content Studio is new and ready.
// The four cut seats (Library Ledger, Skill Ledger, Cooperative Register,
// Manage) are gone, not parked — a card we cannot keep is not a card.
export const CONSOLE_TOOLS: ConsoleTool[] = [
  { id: "18", title: "Content Studio", desc: "Lesson plans, semester outlines and video-note tests from your own notes.", module: "Content Studio", fav: true, status: "ready" },
  { id: "7", title: "Auto-Marking", desc: "Upload a test paper. Get back a weakness map.", module: "Auto-Marking", fav: true, status: "ready" },
  { id: "17", title: "My Day", desc: "Today on one timeline — lessons, attendance, grades, notes, and a small planner.", module: "My Day", fav: false, status: "ready" },
  { id: "6", title: "Timetable Solver", desc: "Build the week, print it for the wall, approve it — Today reads from it.", module: "Timetable", fav: false, status: "ready" },
  { id: "9", title: "Roster Import", desc: "Bulk CSV paste. Classes and streams.", module: "Roster", fav: false, status: "ready" },
  { id: "2", title: "Term Reports", desc: "One-click reports for every student.", module: "Reports", fav: false, status: "ready" },
  { id: "8", title: "Grade Forecast", desc: "KCSE projection per student.", module: "Reports", fav: false, status: "ready" },
  { id: "3", title: "Fee Tracking", desc: "M-Pesa reconciliation and default prediction.", module: "Fees", fav: false, status: "coming" },
  { id: "4", title: "Inspection Mode", desc: "One-click export for auditors.", module: "Inspection", fav: false, status: "coming" },
  { id: "12", title: "Communication", desc: "Bulk SMS and WhatsApp to parents.", module: "Comms", fav: false, status: "coming" },
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