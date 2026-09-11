// Zep Tepi gate engine. Local-first fallback with explicit DEMO honesty:
// timers, cooldowns and passes live in this browser until the backend
// stage wires Supabase session tokens, server-side timers and RLS.
// Nothing here is presented as server-enforced.

export type GateOption = { label: string; hd: number; es: number };

export type GateQuestion = {
  q: string;
  options: GateOption[];
};

export const GATE_QS: GateQuestion[] = [
  {
    q: "The founders of Ancient Egypt were:",
    options: [
      { label: "Mesopotamian settlers", hd: 0, es: 3 },
      { label: "Indigenous Africans", hd: 3, es: 0 },
      { label: "Atlantean refugees", hd: 0, es: 1 },
      { label: "Unknown", hd: 0, es: 2 }
    ]
  },
  {
    q: "Why are Africans black?",
    options: [
      { label: "Adaptation to intense sun over 50,000 years", hd: 1, es: 2 },
      { label: "The original human phenotype", hd: 3, es: 0 },
      { label: "A curse", hd: 0, es: 3 },
      { label: "Random mutation", hd: 0, es: 1 }
    ]
  },
  {
    q: "The fall of Ancient Egypt was primarily caused by:",
    options: [
      { label: "Natural drought and internal decay", hd: 0, es: 3 },
      { label: "Sequential invasion — Assyrians, Persians, Greeks, Romans, Arabs", hd: 3, es: 0 },
      { label: "Civil war", hd: 1, es: 1 },
      { label: "Unknown", hd: 0, es: 2 }
    ]
  },
  {
    q: "Atlantis, in the Platonic account, was:",
    options: [
      { label: "European", hd: 0, es: 2 },
      { label: "West — beyond the Pillars of Hercules, Atlantic-adjacent", hd: 3, es: 0 },
      { label: "A myth with no basis", hd: 0, es: 2 },
      { label: "Southern — African interior", hd: 1, es: 1 }
    ]
  },
  {
    q: "Your primary loyalty belongs to:",
    options: [
      { label: "Yourself", hd: 0, es: 3 },
      { label: "Your immediate family", hd: 0, es: 2 },
      { label: "Your community", hd: 0, es: 0 },
      { label: "Your nation", hd: 0, es: 1 },
      { label: "Africa", hd: 0, es: 0 },
      { label: "Humanity", hd: 0, es: 1 }
    ]
  },
  {
    q: "Given KES 100,000 with no conditions, you would:",
    options: [
      { label: "Start a personal business", hd: 0, es: 3 },
      { label: "Fund a community project", hd: 0, es: 0 },
      { label: "Save it", hd: 0, es: 2 },
      { label: "Give it away", hd: 0, es: 0 }
    ]
  },
  {
    q: "Can Africa rise above China in every aspect?",
    options: [
      { label: "Yes, within 30 years", hd: 0, es: 0 },
      { label: "Yes, within 50 years", hd: 0, es: 0 },
      { label: "Yes, but not in our lifetime", hd: 0, es: 1 },
      { label: "No", hd: 0, es: 3 }
    ]
  },
  {
    q: "Your history was primarily written by:",
    options: [
      { label: "Africans", hd: 0, es: 3 },
      { label: "Europeans and Arabs", hd: 3, es: 0 },
      { label: "The victors", hd: 2, es: 1 },
      { label: "Historians", hd: 0, es: 2 }
    ]
  },
  {
    q: 'The word "tribe," applied to African peoples, is:',
    options: [
      { label: "Ancient and accurate", hd: 0, es: 3 },
      { label: "A colonial classification that homogenized distinct nations", hd: 3, es: 0 },
      { label: "Neutral", hd: 0, es: 2 },
      { label: "Useful", hd: 0, es: 2 }
    ]
  },
  {
    q: "The African Diaspora is:",
    options: [
      { label: "Lost to Africa", hd: 0, es: 2 },
      { label: "The same people, dispersed", hd: 3, es: 0 },
      { label: "Wealthy cousins", hd: 1, es: 1 },
      { label: "Unrelated", hd: 0, es: 3 }
    ]
  },
  {
    q: "The Berlin Conference of 1884–85 was:",
    options: [
      { label: "A peace treaty", hd: 0, es: 2 },
      { label: "The formal partition of Africa among European powers", hd: 3, es: 0 },
      { label: "A trade agreement", hd: 1, es: 2 },
      { label: "A humanitarian summit", hd: 0, es: 3 }
    ]
  },
  {
    q: "You are offered a contract at 3× market rate, contingent on breaking a promise to a smaller partner. You:",
    options: [
      { label: "Take it", hd: 0, es: 3 },
      { label: "Refuse", hd: 0, es: 0 },
      { label: "Negotiate", hd: 0, es: 1 },
      { label: "Depends on the partner", hd: 0, es: 2 }
    ]
  }
];

// Corrected maxima: HD 24 (not 36), ES 35 (not 36).
// Pass = HD ≥ 16 AND ES ≤ 14. Retry = 7 days.
export const GATE_PASS_HD = 16;
export const GATE_PASS_ES = 14;
export const GATE_RETRY_DAYS = 7;
export const GATE_SECONDS = 180;

export function scoreGate(picks: number[]): { hd: number; es: number; pass: boolean } {
  let hd = 0;
  let es = 0;
  picks.forEach((p, i) => {
    const opt = GATE_QS[i]?.options[p];
    if (opt) {
      hd += opt.hd;
      es += opt.es;
    }
  });
  return { hd, es, pass: hd >= GATE_PASS_HD && es <= GATE_PASS_ES };
}

export type ZepAttempt = {
  phoneHash: string;
  answers: number[];
  hd: number;
  es: number;
  passed: boolean;
  ts: number;
};

export type ZepProfile = {
  passed: boolean;
  passedAt: number;
  retryAfter: number;
  currentHall: number;
  claimsCompleted: number;
};

const ATTEMPTS_KEY = "aptlabs-zep-attempts-v1";
const PROFILE_KEY = "aptlabs-zep-profile-v1";

function read<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* the forest keeps what it can */ }
}

export function loadAttempts(): ZepAttempt[] {
  const v = read<unknown>(ATTEMPTS_KEY, []);
  return Array.isArray(v) ? (v as ZepAttempt[]) : [];
}

export function logAttempt(a: ZepAttempt): void {
  const all = loadAttempts();
  all.push(a);
  write(ATTEMPTS_KEY, all.slice(-50));
}

export function loadProfile(): ZepProfile {
  return read<ZepProfile>(PROFILE_KEY, {
    passed: false,
    passedAt: 0,
    retryAfter: 0,
    currentHall: 8,
    claimsCompleted: 0
  });
}

export function saveProfile(p: ZepProfile): void {
  write(PROFILE_KEY, p);
}

// ---- Hall 8 claims, commitments, crews ----

export type HallClaim = {
  id: string;
  by: string;
  title: string;
  body: string;
  needs: string;
  done: string;
  location: string;
  status: "active" | "passed" | "archived";
  votes: Record<string, number>;
  crew: string[];
  createdTs: number;
};

export type HallUpdate = {
  id: string;
  claimId: string;
  by: string;
  kind: "update" | "artifact" | "learning";
  text: string;
  ts: number;
};

const CLAIMS_KEY = "aptlabs-hall8-claims-v1";
const UPDATES_KEY = "aptlabs-hall8-updates-v1";

export function loadClaims(): HallClaim[] {
  const v = read<unknown>(CLAIMS_KEY, []);
  if (!Array.isArray(v)) return [];
  return (v as HallClaim[]).filter((c) => c && typeof c.id === "string" && typeof c.title === "string");
}

export function saveClaims(v: HallClaim[]): void {
  write(CLAIMS_KEY, v);
}

export function loadUpdates(): HallUpdate[] {
  const v = read<unknown>(UPDATES_KEY, []);
  return Array.isArray(v) ? (v as HallUpdate[]) : [];
}

export function saveUpdates(v: HallUpdate[]): void {
  write(UPDATES_KEY, v.slice(-300));
}
