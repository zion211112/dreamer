// lib/identity.ts — the reader's own session on this device.
//
// There is no server, no account and no credential anywhere in this
// project, so this file must not pretend otherwise. What it is instead is
// a real session with a real persistence layer, scoped to one browser, and
// it is the same local-first claim the product is sold on — made concrete
// in the one place a reader can check it.
//
// Why it exists at all: a pitch prototype with no identity has nowhere for
// a reader to put their own name, and "nowhere to act" was the single most
// expensive thing about the previous version of this site. But the failure
// mode is obvious too — a sign-in that accepts any password, or one that
// silently reports a logged-in user, is a lie dressed as a feature, and it
// would be the most damaging lie on the site precisely because it sits in
// the corner where a product's trust usually lives.
//
// So the design rule is: it does exactly what it says and nothing more.
//
//   · No password. There is nothing to authenticate against, so asking for
//     one would be theatre.
//   · No email, no verification, no "account created".
//   · No server call. localStorage, like the console's own session
//     (lib/console.ts) and for the same reason.
//   · The stored object says plainly that it is device-local.
//   · Signing out removes it. There is no server-side session to leave.
//
// The stored record carries a `custody` field set to the device, so a
// reader who opens devtools sees the claim in the data rather than only in
// the prose.

const IDENTITY_KEY = "aptlabs.site.identity";

/**
 * Who is using this device.
 *
 * `role` is a free-ish label rather than an enum with three hard-coded
 * options. An institution buying a management system has a head teacher and
 * a proprietor and abursars; hard-coding a short list would be the site
 * inventing a customer's org chart, which is the same category error as
 * inventing a vertical market.
 */
export interface SiteIdentity {
  /** What they call themselves. Never transmitted. */
  name: string;
  /** Free text: head teacher, proprietor, investor, student. Optional. */
  role?: string;
  /** The organisation they are looking on behalf of. Optional. */
  org?: string;
  /** Always "this device". Carried in the data, not only in the copy. */
  custody: "this device";
  /** When the session started, as an ISO string. */
  since: string;
}

/** localStorage is absent in SSR and can throw in private modes. Every
    access goes through these three helpers rather than touching the API
    directly, so a browser that refuses storage degrades to "no session"
    instead of taking the page down with it. */
function read(): SiteIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SiteIdentity>;
    /* Re-validate rather than trust the parse. localStorage is
       user-writable and survives across deploys, so a shape from an older
       version of this file can still be sitting there. */
    if (typeof parsed.name !== "string" || parsed.name.trim() === "") return null;
    return {
      name: parsed.name,
      role: typeof parsed.role === "string" ? parsed.role : undefined,
      org: typeof parsed.org === "string" ? parsed.org : undefined,
      custody: "this device",
      since: typeof parsed.since === "string" ? parsed.since : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function write(identity: SiteIdentity): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
    return true;
  } catch {
    /* Storage refused. The session is memory-only for this page view, and
       `persisted` below reports that honestly rather than claiming a
       session that will not survive a reload. */
    return false;
  }
}

export function loadIdentity(): SiteIdentity | null {
  return read();
}

export function saveIdentity(input: {
  name: string;
  role?: string;
  org?: string;
}): { identity: SiteIdentity; persisted: boolean } {
  const identity: SiteIdentity = {
    name: input.name.trim(),
    role: input.role?.trim() || undefined,
    org: input.org?.trim() || undefined,
    custody: "this device",
    since: new Date().toISOString(),
  };
  return { identity, persisted: write(identity) };
}

export function clearIdentity(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(IDENTITY_KEY);
  } catch {
    /* Nothing to do: there is no server session to end. */
  }
}

/**
 * The initials shown in the corner mark.
 *
 * Derived from the name rather than stored, so it cannot drift from it, and
 * capped at two glyphs because a corner mark is 28px wide and a longer
 * lockup would push the panel it opens off the edge of the viewport.
 *
 * A single-word name takes its first letter. Two words take one from each.
 * Anything that yields nothing (a name of only punctuation, say) falls
 * back to a diamond, which is the same mark the wordmark uses.
 */
export function initialsOf(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) return "◆";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}