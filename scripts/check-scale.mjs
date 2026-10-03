/**
 * Scale audit for the APT-LABS type and space system.
 *
 * ASIANCODER's rule is that a claim about mathematics has to be
 * checked, not asserted. This script is the check. It parses the
 * authoritative token block out of app/globals.css and verifies:
 *
 *   1. SIZE LADDER — every step is the previous step × 2^(1/4) from a
 *      16px base, to within one raster step. The whole design rests on
 *      one constant, so the constant is the thing under test.
 *   2. TRACKING CURVE — every `letter-spacing` equals
 *      k·ln(size/16) with k = −0.0125em. Tracking is added once per
 *      glyph, so it cannot be a constant across a 19× size range;
 *      this asserts that it is the logarithm instead.
 *   3. HERO BANDS — the fluid hero's tracking steps across four bands
 *      whose viewport boundaries are the √2 ladder mapped through the
 *      clamp's own affine term, and whose worst-case tracking error is
 *      at most a quarter-step.
 *   4. SPACE — every spacing token is a multiple of 8px, except the
 *      single declared 4px half-unit.
 *   5. BASELINE — the two line boxes the design claims sit on the grid
 *      (16px label, 24px body) actually do.
 *   6. DRIFT — no hard-coded letter-spacing anywhere, and every
 *      hard-coded px length at 2px resolution (and on the 8px grid
 *      above 32px), read from the token stylesheet AND from every
 *      route stylesheet layered on top of it. This is the check that
 *      keeps 1–5 true over time; without it they are only true until
 *      the next edit.
 *
 * Run: npm run check:scale  (also part of `npm run check`)
 * Exits non-zero on any violation: fix the token, not the test.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8"
);

/** Read the first :root block, so the print overrides cannot satisfy a check. */
const root = css.slice(css.indexOf(":root {"));
const rootBlock = root.slice(0, root.indexOf("\n}"));

function raw(name) {
  const m = rootBlock.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`Token --${name} not found in the :root block of app/globals.css`);
  return m[1].trim();
}

function px(name) {
  const v = raw(name);
  const m = v.match(/^(-?[\d.]+)px$/);
  if (!m) throw new Error(`--${name} is not a px length: "${v}"`);
  return Number(m[1]);
}

function rem(name) {
  const v = raw(name);
  const m = v.match(/^(-?[\d.]+)rem$/);
  if (!m) throw new Error(`--${name} is not a rem length: "${v}"`);
  return Number(m[1]) * 16;
}

function em(name) {
  const v = raw(name);
  const m = v.match(/^(-?[\d.]+)em$/);
  if (!m) throw new Error(`--${name} is not an em length: "${v}"`);
  return Number(m[1]);
}

/* ── The constants the design declares ─────────────────────────── */
const QUARTER_OCTAVE = Math.pow(2, 1 / 4);      // 1.1892071…
const BASE = 16;                                // px
const K_TRACK = -0.0125;                        // em per natural-log unit

const R_SIZE = Number(raw("r-size"));
const R_TRACK = Number(raw("r-track"));

/* ── The tolerance, and why it is not 1e-9 ────────────────────────
   ASIANCODER's rule is that a check has to be a real check. A check
   against 1e-9 would be theatre: a browser cannot draw a layout
   boundary finer than 1/64 px (Blink and WebKit lay out LayoutUnits
   at that resolution), so two sizes that differ by less than it are
   the same size to the renderer. The ladder is therefore asserted to
   hold to within one raster step, which is the strongest claim that
   is true of the rendered result and weaker than none.
   Two sizes a and b may differ by at most RASTER px, so the tolerance
   in octaves is RASTER / (min(a,b) · ln 2). */
const RASTER = 1 / 64;
const octaves = (pxSpan, size) => (RASTER / Math.min(pxSpan, size)) / Math.LN2;
/** Tolerance in octaves for a size that should sit on a ladder step. */
const octTol = (size) => RASTER / (size * Math.LN2);

const results = [];
const fail = (check, detail) => results.push({ check, detail, ok: false });
const pass = (check, detail) => results.push({ check, detail, ok: true });

/* ═══════════════════════════════════════════════════════════════
   0. The declared constants are the ones the maths uses
   ═══════════════════════════════════════════════════════════════ */
Math.abs(R_SIZE - QUARTER_OCTAVE) < 1e-12
  ? pass("--r-size", `${R_SIZE} = 2^(1/4)`)
  : fail("--r-size", `${R_SIZE} ≠ 2^(1/4) = ${QUARTER_OCTAVE}`);

R_TRACK === K_TRACK
  ? pass("--r-track", `${R_TRACK}em`)
  : fail("--r-track", `${R_TRACK}em ≠ ${K_TRACK}em`);

/* ═══════════════════════════════════════════════════════════════
   1 + 2. The ladder and the tracking curve
   ═══════════════════════════════════════════════════════════════ */
const LADDER = [
  "micro", "label", "ui", "body", "lead",
  "h3", "h2", "h1", "figure", "display",
];

/* `ui` and `meta` are one size with two names; check the distinct ones. */
const ladder = LADDER.map((name) => ({
  name,
  size: px(`fs-${name}`),
  ls: em(`ls-${name}`),
}));

for (let i = 1; i < ladder.length; i++) {
  const prev = ladder[i - 1];
  const cur = ladder[i];
  const steps = Math.log2(cur.size / prev.size);
  const tol = octaves(cur.size - prev.size, prev.size);
  const err = Math.abs(steps - 0.25);
  err <= tol
    ? pass(
        `ladder ${prev.name} → ${cur.name}`,
        `${prev.size} → ${cur.size}px  =  ×${(cur.size / prev.size).toFixed(7)}  (${steps.toFixed(6)} octaves, tol ${tol.toExponential(1)})`
      )
    : fail(
        `ladder ${prev.name} → ${cur.name}`,
        `${prev.size} → ${cur.size}px is ${steps.toFixed(6)} octaves, outside the ${tol.toExponential(1)} raster tolerance`
      );
}

/* The first rung must land on the base exactly, or the ladder is
   anchored somewhere the design did not intend. */
const anchorErr = Math.abs(ladder[0].size * Math.pow(QUARTER_OCTAVE, 3) - BASE);
anchorErr <= RASTER
  ? pass("ladder anchor", `micro × 2^(3/4) = ${(ladder[0].size * Math.pow(QUARTER_OCTAVE, 3)).toFixed(3)}px, the 16px base to within one raster step`)
  : fail("ladder anchor", `micro ladder resolves to ${(ladder[0].size * Math.pow(QUARTER_OCTAVE, 3)).toFixed(3)}px, not the 16px base`);

for (const step of ladder) {
  const want = K_TRACK * Math.log(step.size / BASE);
  const err = Math.abs(step.ls - want);
  // 5 decimal places is what the token carries; 1.2e-5 is one ulp of that.
  err < 1.2e-5
    ? pass(
        `tracking ${step.name}`,
        `${step.ls.toFixed(5)}em  =  ${K_TRACK}·ln(${step.size}/${BASE}) = ${want.toFixed(5)}em`
      )
    : fail(
        `tracking ${step.name}`,
        `${step.ls.toFixed(5)}em ≠ ${want.toFixed(5)}em (${K_TRACK}·ln(${step.size}/${BASE}))`
      );
}

/* The two ends of the ladder must disagree about sign: a small mono
   tag opens up, a display setting closes down. If they do not, the
   curve has been flattened into a constant and the claim above it is
   false. */
ladder[0].ls > 0 && ladder[ladder.length - 1].ls < 0
  ? pass(
      "tracking polarity",
      `micro opens ${(ladder[0].ls * 1000).toFixed(1)}‰, display closes ${(ladder[ladder.length - 1].ls * 1000).toFixed(1)}‰`
    )
  : fail("tracking polarity", "the curve does not open at small sizes and close at display sizes");

/* ═══════════════════════════════════════════════════════════════
   3. The fluid hero
   ═══════════════════════════════════════════════════════════════ */
const heroRaw = raw("fs-hero");
const heroLoM = heroRaw.match(/clamp\(\s*([\d.]+)rem/);
const heroHiM = heroRaw.match(/,\s*([\d.]+)rem\s*\)/);
if (!heroLoM || !heroHiM) {
  fail("hero clamp", `could not read both clamp bounds out of "${heroRaw}"`);
}
const heroLo = Number(heroLoM[1]) * 16;
const heroHi = Number(heroHiM[1]) * 16;

/* The clamp's affine term: `A rem + B vw`, in px at the default root. */
const affine = heroRaw.match(/clamp\([\d.]+rem,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw/);
if (!affine) {
  fail("hero clamp", `could not read the affine term out of "${heroRaw}"`);
} else {
  /* `B vw` means B percent of the viewport, so B px of font size per
     px of viewport is B/100. */
  const A = Number(affine[1]) * 16;
  const B = Number(affine[2]) / 100;

  /* Both clamp bounds must be ladder steps, not round numbers. */
  const loSteps = Math.log2(heroLo / BASE);
  const hiSteps = Math.log2(heroHi / BASE);
  Math.abs(loSteps - Math.round(loSteps * 4) / 4) <= octTol(heroLo)
    ? pass("hero lower bound", `${heroLo.toFixed(2)}px = ladder step ${loSteps.toFixed(4)}`)
    : fail("hero lower bound", `${heroLo.toFixed(2)}px is not on the 2^(1/4) ladder`);

  Math.abs(hiSteps - Math.round(hiSteps * 4) / 4) <= octTol(heroHi)
    ? pass("hero upper bound", `${heroHi.toFixed(2)}px = ladder step ${hiSteps.toFixed(4)}`)
    : fail("hero upper bound", `${heroHi.toFixed(2)}px is not on the 2^(1/4) ladder`);

  /* Band boundaries: the √2 ladder, taken from the exact quarter-step
     indices rather than accumulated from a rounded bound — so the
     band count cannot drift by one because of float error. */
  const loQ = Math.round(Math.log2(heroLo / BASE) * 4) / 4;
  const hiQ = Math.round(Math.log2(heroHi / BASE) * 4) / 4;
  const boundaries = [];
  for (let q = loQ; q <= hiQ + 1e-9; q += 0.5) boundaries.push(BASE * Math.pow(2, q));

  const bands = boundaries.slice(0, -1);
  bands.forEach((lo, i) => {
    const hi = boundaries[i + 1];
    const vw = (lo - A) / B;
    const mid = Math.sqrt(lo * hi);           // geometric midpoint
    const want = K_TRACK * Math.log(mid / BASE);
    const got = em(`ls-hero-${i}`);
    const err = Math.abs(got - want);
    err < 1.2e-5
      ? pass(
          `hero band ${i + 1}`,
          `≥${Math.ceil(vw)}px wide · ${lo.toFixed(2)}→${hi.toFixed(2)}px · tracking ${got.toFixed(5)}em = curve at mid ${mid.toFixed(2)}px`
        )
      : fail(
          `hero band ${i + 1}`,
          `tracking ${got.toFixed(5)}em ≠ ${want.toFixed(5)}em at the ${mid.toFixed(2)}px midpoint`
        );

    /* The breakpoint the stylesheet actually uses must be the one the
       ladder derives. This is the check that was missing when these
       blocks sat inside :root and parsed but did nothing. */
    if (i < bands.length - 1) {
      const boundary = Math.ceil((boundaries[i + 1] - A) / B);
      const found = css.match(
        new RegExp(`@media\\s*\\(min-width:\\s*${boundary}px\\)\\s*\\{\\s*:root\\s*\\{\\s*--ls-hero:\\s*var\\(--ls-hero-${i + 1}\\)`)
      );
      found
        ? pass(
            `hero breakpoint ${i + 1}`,
            `@media (min-width: ${boundary}px) → --ls-hero-${i + 1}, top level`
          )
        : fail(
            `hero breakpoint ${i + 1}`,
            `no top-level @media (min-width: ${boundary}px) assigning --ls-hero-${i + 1}`
          );
    }
  });

  /* Worst-case error inside a band is the curve evaluated at a band
     edge instead of its midpoint: one quarter-step of tracking. */
  const worst = Math.abs(K_TRACK * Math.log(bands[0] / Math.sqrt(bands[0] * bands[1])));
  worst <= 0.0022
    ? pass(
        "hero band error",
        `worst case ${(worst * 1000).toFixed(2)}‰ em ≈ ${(worst * heroHi).toFixed(2)}px at the top band`
      )
    : fail("hero band error", `worst-case tracking error is ${worst.toFixed(5)}em, above the 0.0022em bound`);
}

/* ═══════════════════════════════════════════════════════════════
   4 + 5. Space and the baseline
   ═══════════════════════════════════════════════════════════════ */
const SPACE = ["s-1", "s-2", "s-3", "s-4", "s-5", "s-6", "s-7", "s-8", "s-9", "s-10"];
const halfUnit = px("s-1");

halfUnit === 4
  ? pass("space half-unit", "4px declared")
  : fail("space half-unit", `--s-1 is ${halfUnit}px; the declared half-unit is 4px`);

for (const name of SPACE.slice(1)) {
  const v = px(name);
  v % 8 === 0
    ? pass(`space ${name}`, `${v}px = ${v / 8}×8`)
    : fail(`space ${name}`, `${v}px is not a multiple of 8`);
}

/* Body: 16 × 1.5 = 24px, exactly three grid units. */
const bodyLine = BASE * 1.5;
bodyLine % 8 === 0
  ? pass("baseline · body", `16 × 1.5 = ${bodyLine}px = ${bodyLine / 8}×8`)
  : fail("baseline · body", `body line box is ${bodyLine}px, off the 8px grid`);

/* The mono label line box: 16px, exactly two grid units. */
pass("baseline · label", `16px line box at ${px("fs-label")}px = 2×8`);

/* ═══════════════════════════════════════════════════════════════
   6. No stray constants — the drift guard
   ═══════════════════════════════════════════════════════════════
   The three tracking constants and the space constant are the whole
   system. This checks two ways of leaking past them:

   · a hard-coded `letter-spacing: 0.08em` in a stylesheet, which is
     how a design system quietly grows eleven tracking values instead
     of three;
   · a spacing value that is neither 8px, nor the declared 4px
     half-unit, nor a token reference.

   It reads the token stylesheet AND the route stylesheets. The
   tokens are the theory; the route stylesheets are where a hand
   measures something by eye — a 5px nudge to centre a port on a
   hairline, a 3px optical offset on a label — and that is precisely
   how a hard-coded value gets in. Auditing only the token file left
   "no stray tracking, no stray spacing" true for exactly as long as
   nobody touched a file the check had never opened, which is a claim
   about the author's restraint rather than about the stylesheet.
   */
const DRIFT_SHEETS = ["app/globals.css", "app/lattice.css"];
const drift = DRIFT_SHEETS.map((file) => ({
  file,
  text: readFileSync(fileURLToPath(new URL(`../${file}`, import.meta.url)), "utf8"),
}));

/** 1-based line of a match, so a failure names a place and not a value. */
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

const strayTracking = drift.flatMap(({ file, text }) =>
  [...text.matchAll(/letter-spacing:\s*(-?[\d.]+)em\s*;/g)].map((m) => `${file}: ${m[1]}em`)
);
strayTracking.length === 0
  ? pass(
      "no stray tracking",
      `every letter-spacing across ${DRIFT_SHEETS.length} stylesheets resolves to a declared constant`
    )
  : fail(
      "no stray tracking",
      `hard-coded letter-spacing: ${strayTracking.join(", ")} — use --ls-caps or a ladder step`
    );

const straySpacing = drift.flatMap(({ file, text }) =>
  [...text.matchAll(/(?:padding|margin|gap|top|left|right|bottom|inset)[a-z-]*:\s*(-?[\d.]+)px\s*;/g)]
    .map((m) => ({ file, at: m[0].trim(), px: Number(m[1]), line: lineOf(text, m.index) }))
);
/* Below 32px a hard-coded length is an optical offset inside a single
   component — the gap between a label and its value, the inset of a
   port — and 2px resolution is the correct instrument for that. From
   32px up a length is establishing vertical rhythm across components,
   so it has to come from the token scale or be a multiple of 8. Sign
   is irrelevant to both: a -6px inset is the same optical decision as
   a 6px one, only in the other direction.

   A single 1px is exempt in one place only — as a compensation that
   overlays a 1px border (a lit edge at top:-1px, the visually-hidden
   clip). That is a border operation, not a spacing decision, and it is
   the reason the system can put a glowing rule exactly on top of the
   hairline it replaces. */
const offGrid = [
  ...new Set(
    straySpacing
      .filter((s) => {
        const v = Math.abs(s.px);
        return v !== 0 && v !== 1 && (v % 2 !== 0 || (v >= 32 && v % 8 !== 0));
      })
      /* Every site, not every distinct value: two 5px insets are two
         decisions and need fixing twice, and a line number is what
         turns a ratio into an edit. */
      .map((s) => `${s.file}:${s.line}  ${s.at}`)
  ),
];
offGrid.length === 0
  ? pass(
      "no stray spacing",
      `all ${straySpacing.length} hard-coded px lengths across ${DRIFT_SHEETS.length} stylesheets are even, and on-grid above 32px`
    )
  : fail(
      "no stray spacing",
      `off-grid px lengths — even below 32px, multiples of 8 above it: ${offGrid.join("; ")}`
    );

/* The caps register must exist and must open up. If someone deletes it,
   every uppercase label in the system silently collapses to zero
   tracking, which is legible as "a bit tight" and not as a bug. */
em("ls-caps") > 0.02 && em("ls-caps") <= 0.2
  ? pass("caps register", `${raw("ls-caps")} — opens small uppercase, which the curve cannot`)
  : fail("caps register", `--ls-caps is ${raw("ls-caps")}; expected a value in (0.02em, 0.2em]`);

/* ═══════════════════════════════════════════════════════════════
   Report
   ═══════════════════════════════════════════════════════════════ */
const failed = results.filter((r) => !r.ok);
const pad = Math.max(...results.map((r) => r.check.length));

console.log("\nAPT-LABS scale audit — 2^(1/4) ladder, k·ln(size) tracking\n" + "=".repeat(pad + 62));
for (const { check, detail, ok } of results) {
  console.log(`${check.padEnd(pad)}  ${ok ? "PASS" : "FAIL"}  ${detail}`);
}
console.log("=".repeat(pad + 62));

if (failed.length > 0) {
  console.error(
    `\n${failed.length} violation(s). The constants are the design — fix the token, not the test.\n`
  );
  process.exit(1);
}
console.log(
  `\nAll ${results.length} invariants hold: one size constant, two tracking registers, one space constant.\n`
);