/**
 * lib/epistemic/memory.ts -- MEMORY THAT KNOWS IT MIGHT BE WRONG.
 *
 * ASIANCODER.MD: "Memory should NOT simply mean conversation history."
 * Eight kinds, not one. "Every memory item has provenance and decay/
 * revalidation rules." "A stale fact should be visually stale."
 *
 * Three properties of this file are load-bearing and each is a decision
 * rather than a convenience:
 *
 *   1. STALENESS IS COMPUTED, NEVER ASSERTED. `isStale` derives the answer
 *      from a clock the caller injects and the kind's own TTL. It does not
 *      read `item.stale`. A flag is a claim about a past computation; a
 *      reading is a claim about now. Only the reading belongs on screen,
 *      because a flag nobody recomputes is a decoration that looks like a
 *      fact.
 *
 *   2. THE NON-DECAYING KINDS NEVER GO STALE. FAILED_IDEA, OPEN_QUESTION
 *      and UNRESOLVED_CONTRADICTION have no TTL at all, and this is the
 *      single most important line in the file. A failed idea that quietly
 *      expired is a system that forgot it was wrong, which is the precise
 *      opposite of what memory is for. Six years after the fact, the
 *      refutation is still a refutation.
 *
 *   3. NOTHING IS EVER DELETED. `contaminate` marks and explains. Removing
 *      a contaminated item would remove the evidence of the contamination,
 *      and "delete contradictions" is on ASIANCODER.MD's NO HIDDEN AUTHORITY
 *      list of things an agent must not be able to do silently. There is
 *      no `forgetMemory` in this file and there is not going to be one.
 *
 * ── ON THE IDEMPOTENCY RULE IN `writeMemory` ─────────────────────────
 * Re-running a pipeline must not be a way to manufacture agreement. If the
 * same text arriving from two runs became two memory items, every downstream
 * count - corroboration, provenance entries, "how many agents said this" -
 * would rise for no epistemic reason whatsoever. That is CONSENSUS
 * AMPLIFICATION performed by the memory layer against itself. So a repeat
 * write MERGES: the existing item is kept, and the new arrival's provenance
 * is appended to it. The item still records that two things saw this, and it
 * still records one thing, which is what actually happened.
 *
 * ── WHY THIS FILE HAS NO RUNTIME IMPORTS ─────────────────────────────
 * Every sibling in lib/epistemic/ imports its neighbours extensionlessly,
 * because that is what tsc and the bundler expect. This one does not, and
 * that is deliberate. memory.ts is the file an auditor should be able to
 * run on its own:
 *
 *   node --experimental-transform-types --no-warnings \
 *     -e "import('./lib/epistemic/memory.ts').then(...)"
 *
 * Node's ESM resolver does not resolve extensionless relative specifiers, so
 * a single sibling import would make that command die on resolution before a
 * single line of memory logic ran. The project works around this for its own
 * check scripts with scripts/ts-resolve.mjs, which is the right answer for
 * tests - but a memory store that can only be inspected through a launcher
 * adds an indirection between a reader and the only question that matters
 * here, which is whether this thing forgets what it was wrong about.
 *
 * So the imports below are TYPE imports, erased at compile time and
 * invisible at runtime, and the decay table is declared locally. That is a
 * second copy of a closed vocabulary, which is against this codebase's
 * principles, so the cost is bounded rather than waved away: the two proofs
 * at the bottom of this file pin the local declarations to taxonomy.ts at
 * COMPILE time. Add a ninth memory kind there and this file stops building.
 *
 * The limit of those proofs is stated rather than hidden: they check the
 * SHAPE of the table (every kind present, fields correct, order preserved)
 * and not the VALUES, because taxonomy.ts annotates its table with
 * `Record<MemoryKind, ...>`, which erases the literal types the values would
 * need to be compared at compile time. If a TTL in taxonomy.ts is edited,
 * nothing here will notice. That is a real gap and it is one line in
 * taxonomy.ts away from being closed.
 */

import type {
  GuardRecord,
  MemoryId,
  MemoryItem,
  Provenance,
  ProvenanceEntry,
  StatementId,
} from "./model";
import type {
  MEMORY_KIND_RULES,
  MEMORY_KINDS,
  MemoryKind,
} from "./taxonomy";

/** One day in milliseconds. The contract's unit. Stated once. */
const DAY_MS = 86400000;

/* ═══════════════════════════════════════════════════════════════════
   THE DECAY TABLE (mirrored - see the module note on why)
   ═══════════════════════════════════════════════════════════════════ */

/**
 * How long each kind stays current.
 *
 * Typed as `typeof MEMORY_KIND_RULES`, which is taxonomy's own type for the
 * declaration it holds. That annotation is the compile-time proof that this
 * mirror has every kind taxonomy has, with the fields taxonomy declares. It
 * is not proof that the numbers agree, and the module note says so out loud
 * rather than letting the annotation imply more than it does.
 */
export const MEMORY_DECAY_RULES: typeof MEMORY_KIND_RULES = {
  FACT: {
    decays: true,
    revalidateAfterDays: 30,
    why: "The world moves and a stored fact does not move with it.",
  },
  TASK: {
    decays: true,
    revalidateAfterDays: 14,
    why: "A task's shape depends on constraints that expire.",
  },
  PREFERENCE: {
    decays: true,
    revalidateAfterDays: 180,
    why: "Human preferences drift slowly but they do drift.",
  },
  HYPOTHESIS: {
    decays: true,
    revalidateAfterDays: 30,
    why: "An untested hypothesis past its window is not pending, it is abandoned.",
  },
  FAILED_IDEA: {
    decays: false,
    revalidateAfterDays: null,
    why: "Never forget what was wrong. Staleness does not apply to a refutation.",
  },
  OPEN_QUESTION: {
    decays: false,
    revalidateAfterDays: null,
    why: "An unanswered question stays a question however long it waits.",
  },
  VERIFIED_KNOWLEDGE: {
    decays: true,
    revalidateAfterDays: 90,
    why: "Verification is a timestamp, and old verification is weaker verification.",
  },
  UNRESOLVED_CONTRADICTION: {
    decays: false,
    revalidateAfterDays: null,
    why: "A live contradiction is the most important thing not to lose.",
  },
};

/**
 * Display order, pinned to taxonomy's own tuple type.
 *
 * Unlike the decay table this proof IS total: `typeof MEMORY_KINDS` is a
 * tuple, so a kind added, removed, renamed or reordered in taxonomy.ts is a
 * compile error here rather than a quietly misplaced section heading.
 */
export const MEMORY_KIND_ORDER: typeof MEMORY_KINDS = [
  "FACT",
  "TASK",
  "PREFERENCE",
  "HYPOTHESIS",
  "FAILED_IDEA",
  "OPEN_QUESTION",
  "VERIFIED_KNOWLEDGE",
  "UNRESOLVED_CONTRADICTION",
];

/* ═══════════════════════════════════════════════════════════════════
   READING STALENESS
   ═══════════════════════════════════════════════════════════════════ */

export interface StaleReading {
  itemId: string;
  kind: MemoryKind;
  /**
   * COMPUTED from the injected clock and the kind's TTL.
   *
   * Never read from `item.stale`. See the module note.
   */
  stale: boolean;
  /**
   * The item's stored flag: a record that something marked this item, never
   * the answer to whether it is stale. Surfaced separately so a reader can
   * tell "the clock says so" from "something is wrong with this one's
   * origin", and those are different problems with different fixes.
   */
  flagged: boolean;
  /** Whole and fractional days since the last revalidation, or since creation. */
  ageDays: number;
  revalidateAfterDays: number | null;
  /** The instant it would expire under the rule. Null when it never does. */
  expiresAt: string | null;
  /** The sentence the UI shows. Never a bare boolean. */
  why: string;
}

/**
 * How stale is this memory, according to the clock and the rule.
 *
 * Pure. `now` is injected because a function that reads the clock cannot be
 * tested, and the one property this system most needs to be able to test is
 * that six-year-old refutations do not expire.
 *
 * The anchor is `lastRevalidatedAt ?? createdAt`: memory that has never been
 * rechecked is measured from the moment it was written, not from an
 * unrecorded moment of checking.
 */
export function isStale(item: MemoryItem, now: Date): StaleReading {
  const rule = MEMORY_DECAY_RULES[item.kind];
  const anchorMs = new Date(item.lastRevalidatedAt ?? item.createdAt).getTime();
  const nowMs = now.getTime();

  /* An unparseable timestamp is not a licence to believe the item. If the
     date cannot be read there is no evidence it is fresh, so the age is
     treated as unbounded rather than as zero. A memory that cannot state
     when it was checked is the oldest kind of memory there is. */
  const ageMs = Number.isNaN(anchorMs) || Number.isNaN(nowMs)
    ? Number.POSITIVE_INFINITY
    : Math.max(0, nowMs - anchorMs);
  const ageDays = ageMs / DAY_MS;

  if (!rule.decays || rule.revalidateAfterDays === null) {
    return {
      itemId: item.id,
      kind: item.kind,
      stale: false,
      flagged: item.stale,
      ageDays,
      revalidateAfterDays: null,
      expiresAt: null,
      why: `${rule.why} ${item.kind} has no revalidation window, so ${formatDays(ageDays)} old is still held rather than stale.`,
    };
  }

  const ttl = rule.revalidateAfterDays;
  const stale = ageMs > ttl * DAY_MS;
  const expiresAtMs = anchorMs + ttl * DAY_MS;

  return {
    itemId: item.id,
    kind: item.kind,
    stale,
    flagged: item.stale,
    ageDays,
    revalidateAfterDays: ttl,
    expiresAt: Number.isNaN(expiresAtMs) ? null : new Date(expiresAtMs).toISOString(),
    why: stale
      ? `${formatDays(ageDays)} since the last revalidation against a ${ttl}-day ${item.kind} window, so it is ${formatDays(ageDays - ttl)} past it. ${rule.why}`
      : `${formatDays(ageDays)} into a ${ttl}-day ${item.kind} window. ${rule.why}`,
  };
}

/**
 * Record that this memory was rechecked.
 *
 * Appends a timestamp and clears the decay flag. It does NOT append a
 * provenance entry, and the omission is deliberate: `deriveProvenanceKind`
 * counts HUMAN entries against the total, so a SYSTEM attestation stamped
 * onto a human-authored item would reclassify it from HUMAN_GENERATED to
 * JOINT. That would hand co-authorship to a machine for the act of checking
 * the work, which is exactly the ownership blur ASIANCODER.MD forbids.
 *
 * It also does not clear `conflictWith`, because a revalidation says the
 * content was re-read; it says nothing about whether the other side of a
 * contradiction has changed.
 *
 * Contamination precedence is NOT enforced here. This function is the
 * honest, minimal primitive, and the orchestration that must not let a
 * revalidation launder a contaminated item lives with the caller (see
 * `contaminate` and the store's recheck action, which always re-derives
 * contamination afterwards).
 */
export function revalidate(item: MemoryItem, at: string | Date): MemoryItem {
  return {
    ...item,
    lastRevalidatedAt: toInstant(at),
    stale: false,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   WRITING
   ═══════════════════════════════════════════════════════════════════ */

export interface MemoryDraft {
  kind: MemoryKind;
  text: string;
  provenance: Provenance;
  /**
   * Required, not defaulted.
   *
   * `writeMemory` reads no clock - it is a pure function and purity is what
   * makes the idempotency rule testable - so the writing time has to arrive
   * with the draft. A memory item with no time is not a memory item.
   */
  createdAt: string | Date;
  lastRevalidatedAt?: string | Date;
  /** Where it came from. Memory without an origin is a rumour. */
  originStatementId?: StatementId;
  conflictWith?: StatementId[];
}

export interface MemoryWrite {
  memory: MemoryItem[];
  /** The item that now represents this memory: the new one, or the existing. */
  item: MemoryItem;
  /** True when the text already existed and only its provenance grew. */
  merged: boolean;
  /** The id of the item that already held this text, when merged. */
  matchedId: string | null;
}

/**
 * Write one memory, merging when the same memory already exists.
 *
 * The identity of a memory is (kind, normalised text). Not the id, not the
 * origin, not the run: two runs arriving at the same sentence have found the
 * same thing, and recording it twice would let a repeated run inflate the
 * appearance of agreement. See the module note for why that matters.
 *
 * The merge is additive in exactly one direction. The existing item's text,
 * kind, id and creation time are untouched - those are the record of what
 * was found first, and overwriting them would be the evidence rewriting that
 * NO HIDDEN AUTHORITY forbids. What grows is provenance, plus the union of
 * the contradictory sides, because a second sighting can add a side to a
 * contradiction without erasing the first.
 */
export function writeMemory(
  existing: readonly MemoryItem[],
  draft: MemoryDraft
): MemoryWrite {
  const key = memoryKey(draft.kind, draft.text);
  const match = existing.find((item) => memoryKey(item.kind, item.text) === key);

  if (match) {
    const merged: MemoryItem = {
      ...match,
      provenance: {
        entries: mergeProvenance(match.provenance, draft.provenance),
      },
      originStatementId: match.originStatementId ?? draft.originStatementId,
      conflictWith: unionIds(match.conflictWith, draft.conflictWith ?? []),
    };

    return {
      memory: existing.map((item) => (item.id === match.id ? merged : item)),
      item: merged,
      merged: true,
      matchedId: match.id,
    };
  }

  /* Constructed rather than parsed, which is a deliberate departure from
     the rest of this codebase. `MemoryItem.parse` is the runtime validator
     at a trust boundary and it needs the schema as a VALUE, which this file
     deliberately does not import (module note). Here the draft is a
     constructor argument, already narrowed to `MemoryDraft` by the type
     system, so there is nothing untrusted to re-check: the boundary
     validation belongs on the payload that became the draft. Calling a zod
     parser on an argument TypeScript has already proved well-formed would be
     theatre, and this project is trying to avoid the habit of calling
     theatre validation. */
  const created: MemoryItem = {
    id: contentAddressedId(key),
    kind: draft.kind,
    text: draft.text,
    provenance: draft.provenance,
    createdAt: toInstant(draft.createdAt),
    ...(draft.lastRevalidatedAt === undefined
      ? {}
      : { lastRevalidatedAt: toInstant(draft.lastRevalidatedAt) }),
    stale: false,
    ...(draft.originStatementId === undefined
      ? {}
      : { originStatementId: draft.originStatementId }),
    conflictWith: draft.conflictWith ?? [],
  };

  return {
    memory: [...existing, created],
    item: created,
    merged: false,
    matchedId: null,
  };
}

/**
 * Normalisation for the idempotency rule.
 *
 * Case-folded, every run of non-alphanumerics collapsed to one space,
 * trimmed. That is the most aggressive normalisation that cannot merge two
 * different claims: anything that changes a word or a digit survives it,
 * which is the property that has to hold, because a rule that folded
 * numbers together would silently erase the difference between "fell 18%"
 * and "fell 8%" - and in a FACT memory that difference is the entire
 * content.
 */
export function normaliseMemoryText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function memoryKey(kind: MemoryKind, text: string): string {
  return `${kind}|${normaliseMemoryText(text)}`;
}

/**
 * A content-addressed id, derived rather than minted from a counter.
 *
 * Two reasons. It keeps `writeMemory` pure - no module-level sequence, no
 * clock, so the same draft always yields the same id and the function is
 * testable without resetting anything. And it makes the identity of a memory
 * legible in its own address: the same sentence in the same kind is
 * literally the same address, which is the idempotency rule made visible.
 *
 * A changed sentence is therefore a different memory with a different id,
 * which is right: the earlier claim was a separate claim and this store does
 * not rewrite history.
 */
function contentAddressedId(key: string): MemoryId {
  /* FNV-1a, 32-bit. Chosen for being three lines and obviously correct
     rather than for being a good hash - this is an address, not a security
     boundary, and a collision would merge two unrelated memories, which is
     a visible mistake rather than a dangerous one. */
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `mem-${hash.toString(16).padStart(8, "0")}` as MemoryId;
}

function mergeProvenance(existing: Provenance, incoming: Provenance): ProvenanceEntry[] {
  /* Signature-deduplicated. A re-run that regenerates an identical entry
     would otherwise append a second copy of the same sighting, and the
     provenance list is supposed to be a count of distinct acts. */
  const signature = (e: ProvenanceEntry): string =>
    `${e.at}|${e.actor.type}|${e.action}|${
      e.actor.type === "HUMAN"
        ? e.actor.actorId
        : e.actor.type === "TOOL"
          ? e.actor.toolId
          : e.actor.type === "MODEL"
            ? e.actor.capability
            : e.actor.component
    }`;

  const seen = new Set(existing.entries.map(signature));
  const additions = incoming.entries.filter((e) => !seen.has(signature(e)));
  return [...existing.entries, ...additions];
}

function unionIds(a: readonly StatementId[], b: readonly StatementId[]): StatementId[] {
  return [...new Set<string>([...a, ...b])] as StatementId[];
}

/* ═══════════════════════════════════════════════════════════════════
   CONTAMINATION
   ═══════════════════════════════════════════════════════════════════ */

export interface ContaminationFinding {
  itemId: string;
  originStatementId: string;
  /** The CRITICAL guards responsible. Named, so the item can be traced. */
  guards: GuardRecord[];
  why: string;
}

export interface ContaminationResult {
  memory: MemoryItem[];
  /** Only the items that were marked. An empty list is a good outcome. */
  contaminated: ContaminationFinding[];
}

/**
 * Mark memory whose origin is under a CRITICAL guard.
 *
 * The contamination vector is a claim that reached memory without passing
 * the guard, so this asks a narrow question: is the statement this memory
 * came from currently carrying an unacknowledged-by-nobody CRITICAL finding?
 *
 * Note carefully what it does NOT do, because each omission is a rule:
 *
 *   · IT DOES NOT DELETE. Deleting is on ASIANCODER.MD's forbidden-authority
 *     list, and a store that removes its own contaminated memory removes the
 *     only record that contamination happened.
 *   · IT DOES NOT CLEAR `conflictWith`. The field is typed as StatementId[],
 *     the two SIDES of a contradiction. Widening it to hold guard ids would
 *     be a schema change to make a display convenient, and the guard is
 *     already reachable through `originStatementId`, so nothing is lost.
 *   · IT DOES NOT UN-STALE ONCE SET. The flag below is one-way, because a
 *     mark that a later pass can quietly clear is a mark nobody has to
 *     answer for. The caller's recheck flow re-applies contamination every
 *     time precisely so that a revalidation cannot launder it.
 */
export function contaminate(
  memory: readonly MemoryItem[],
  guards: readonly GuardRecord[]
): ContaminationResult {
  /* Unattributed guards are dropped rather than collected under
     `undefined`: a guard with no statement cannot contaminate a specific
     memory, and letting it match every item that lacks an origin would
     flag the entire store on one project-level finding. */
  const criticalByStatement = new Map<string, GuardRecord[]>();
  for (const g of guards) {
    if (g.severity !== "CRITICAL") continue;
    if (g.statementId === undefined) continue;
    const list = criticalByStatement.get(g.statementId) ?? [];
    list.push(g);
    criticalByStatement.set(g.statementId, list);
  }

  const contaminated: ContaminationFinding[] = [];
  const marked = memory.map((item) => {
    if (item.originStatementId === undefined) return item;

    const hits = criticalByStatement.get(item.originStatementId);
    if (hits === undefined || hits.length === 0) return item;

    contaminated.push({
      itemId: item.id,
      originStatementId: item.originStatementId,
      guards: hits,
      why: `This memory came from statement ${item.originStatementId}, which carries ${hits.length} CRITICAL guard(s): ${hits
        .map((g) => g.event)
        .join(", ")}. The memory is held, marked, and no longer usable as support. ${describeConflicts(item)}`,
    });

    return {
      ...item,
      stale: true,
      /* Copied, never shared, so a caller mutating the returned array cannot
         reach back into the store's copy. */
      conflictWith: [...item.conflictWith],
    };
  });

  return { memory: marked, contaminated };
}

function describeConflicts(item: MemoryItem): string {
  if (item.conflictWith.length === 0) return "No contradictory side is recorded.";
  return `The contradiction against ${item.conflictWith.join(", ")} is preserved, not resolved.`;
}

/* ═══════════════════════════════════════════════════════════════════
   THE SURFACE
   ═══════════════════════════════════════════════════════════════════ */

export interface MemorySurfaceItem {
  item: MemoryItem;
  /** Computed decay staleness, exactly as `isStale` returned it. */
  stale: boolean;
  ageDays: number;
  revalidateAfterDays: number | null;
  /** True when the item is stale and did NOT get there by ageing. */
  contaminated: boolean;
  why: string;
}

export interface MemorySurfaceGroup {
  kind: MemoryKind;
  /** Whether this kind has a window at all. Drives the section's framing. */
  decays: boolean;
  items: MemorySurfaceItem[];
  staleCount: number;
  /** The kind's own rationale, quoted from the rule. */
  groupWhy: string;
}

export interface MemorySurface {
  groups: MemorySurfaceGroup[];
  totals: {
    total: number;
    stale: number;
    contaminated: number;
    /** Items whose kind can never expire. The ones a forgetting store loses. */
    neverExpires: number;
  };
  /** The single sentence a header should show. */
  finding: string;
}

/**
 * Group memory for display, with the staleness of every item recomputed.
 *
 * Grouped in taxonomy's declared order rather than by arrival, because the
 * order of that tuple is meaningful: FACT and TASK are the two kinds a
 * reader is most likely to act on, and they lead. A memory list in
 * insertion order would bury a stale fact under whatever ran last.
 *
 * Every item carries a `why`. A stale item with no sentence explaining the
 * staleness is a badge, and badges teach people to ignore badges.
 */
export function memorySurface(
  memory: readonly MemoryItem[],
  now: Date
): MemorySurface {
  const byKind = new Map<MemoryKind, MemorySurfaceItem[]>();
  for (const kind of MEMORY_KIND_ORDER) byKind.set(kind, []);

  for (const item of memory) {
    const reading = isStale(item, now);
    /* Flagged but not aged = something other than the clock marked this.
       That distinction is the whole reason the stored flag is carried
       separately from the computed reading. */
    const contaminated = item.stale && !reading.stale;

    const entry: MemorySurfaceItem = {
      item,
      stale: reading.stale || item.stale,
      ageDays: reading.ageDays,
      revalidateAfterDays: reading.revalidateAfterDays,
      contaminated,
      why: contaminated
        ? `Marked, not expired: ${reading.why} It also carries a flag the clock did not set, which means its origin is under a CRITICAL guard.`
        : reading.why,
    };

    byKind.get(item.kind)?.push(entry);
  }

  const groups: MemorySurfaceGroup[] = MEMORY_KIND_ORDER.map((kind) => {
    const items = byKind.get(kind) ?? [];
    const rule = MEMORY_DECAY_RULES[kind];
    return {
      kind,
      decays: rule.decays,
      items,
      staleCount: items.filter((i) => i.stale).length,
      groupWhy: rule.decays
        ? `${rule.why} Window: ${rule.revalidateAfterDays} days from the last revalidation.`
        : rule.why,
    };
  }).filter((g) => g.items.length > 0);

  const all = [...byKind.values()].flat();
  const totals = {
    total: all.length,
    stale: all.filter((i) => i.stale).length,
    contaminated: all.filter((i) => i.contaminated).length,
    neverExpires: all.filter((i) => i.revalidateAfterDays === null).length,
  };

  return { groups, totals, finding: surfaceFinding(totals) };
}

function surfaceFinding(totals: MemorySurface["totals"]): string {
  if (totals.total === 0) {
    return "Memory is empty. Nothing here has been learned and nothing has been forgotten.";
  }
  if (totals.contaminated > 0) {
    return `${totals.contaminated} item(s) are contaminated and held, not deleted. ${totals.neverExpires} item(s) can never expire and are still here after whatever age they are.`;
  }
  if (totals.stale > 0) {
    return `${totals.stale} of ${totals.total} item(s) are past their revalidation window. ${totals.neverExpires} item(s) have no window and are not among them.`;
  }
  return `All ${totals.total} item(s) are inside their windows, including ${totals.neverExpires} that have no window to be inside.`;
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED
   ═══════════════════════════════════════════════════════════════════ */

function toInstant(at: string | Date): string {
  return at instanceof Date ? at.toISOString() : new Date(at).toISOString();
}

/**
 * One decimal place, always.
 *
 * Staleness is the kind of number a reader will hold in their head and
 * compare against a stated TTL, so it is rendered in the same unit as the
 * TTL it is being compared with. Rounding to whole days here would make a
 * 14-day TASK window look expired on day 14 and not on day 14.4.
 */
function formatDays(days: number): string {
  if (!Number.isFinite(days)) return "an unreadable";
  return `${days.toFixed(1)} days`;
}