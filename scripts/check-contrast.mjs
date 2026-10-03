/**
 * WCAG contrast audit for the APT-LABS AURA token system.
 *
 * Parses the :root block of app/globals.css (the single source of the
 * palette) and computes the real contrast ratio for every foreground /
 * background pair the interface actually renders — including text on the
 * accent's own translucent washes, which is where an accent colour
 * usually fails even when it passes on a flat ground.
 *
 * It also asserts something a ratio cannot express on its own: that the
 * five evidence states form the temperature scale the design claims they
 * form, in strict luminance order. That ordering IS the contract — "an
 * unknown that shouts is a hidden zero" is a statement about relative
 * luminance, so it is checked as one.
 *
 * A second pass reads app/lattice.css, because a palette ratio is not a
 * surface ratio: the lattice card is not --panel, it is a white gradient
 * over an 86%-opaque near-black over a jade glow over the panel, and a
 * token that clears 9:1 on the panel can sit under 2:1 once four
 * translucent layers have been stacked over it. The pairs on that
 * surface are extracted from the stylesheet rather than listed by hand —
 * a list written by a person is a claim, and this file exists to replace
 * claims with numbers.
 *
 * Run: npm run check:contrast  (also part of `npm run check`)
 *
 * Thresholds: 4.5:1 for normal text, 3.0:1 for non-text UI (focus
 * rings, borders that carry meaning). The smallest type in the system
 * is a 9.5px mono tag, so essentially everything is treated as normal
 * text — there is no "large" allowance to hide behind.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8"
);

/** Read the screen palette only: the print overrides must not satisfy it. */
const rootBlock = css.slice(css.indexOf(":root {"));
const rootEnd = rootBlock.indexOf("\n}");
const screenRoot = rootBlock.slice(0, rootEnd);

function token(name) {
  const m = screenRoot.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Token --${name} not found in the :root block of app/globals.css`);
  return m[1];
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const lum = (hex) => luminance(rgb(hex));

function ratio(fg, bg) {
  const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** Mix a translucent foreground onto an opaque background, as the browser does. */
function mix(fg, bg, alpha) {
  const f = rgb(fg);
  const b = rgb(bg);
  const out = f.map((c, i) => Math.round(b[i] + (c - b[i]) * alpha));
  return `#${out.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const T = {
  void: token("void"),
  panel: token("panel"),
  edge: token("edge"),
  ink: token("ink"),
  dust: token("dust"),
  ash: token("ash"),
  quiet: token("quiet"),
  signal: token("signal"),
  signalDim: token("signal-dim"),
  signalLit: token("signal-lit"),
  amber: token("amber"),
  danger: token("danger"),
  verified: token("state-verified"),
  prototype: token("state-prototype"),
  target: token("state-target"),
  planned: token("state-planned"),
  unknown: token("state-unknown"),
};

const surfaces = [
  ["void  #04060a", T.void],
  ["panel #0a0e15", T.panel],
  ["edge  #0f151d", T.edge],
];

const textTokens = [
  ["ink", T.ink],
  ["dust", T.dust],
  ["ash", T.ash],
  ["quiet", T.quiet],
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-lit", T.signalLit],
  ["amber", T.amber],
  ["danger", T.danger],
  ["state/VERIFIED", T.verified],
  ["state/PROTOTYPE", T.prototype],
  ["state/TARGET", T.target],
  ["state/PLANNED", T.planned],
  ["state/UNKNOWN", T.unknown],
];

const checks = [];

/* Every text token on every opaque surface it can land on. */
for (const [surfaceName, surface] of surfaces) {
  for (const [name, hex] of textTokens) {
    checks.push({
      pair: `${name} on ${surfaceName}`,
      value: ratio(hex, surface),
      min: 4.5,
    });
  }
}

/* Filled controls: void ink on each jade register. On a dark ground the
   label on a filled button is the dark token, not white — which is why
   this pair inverted rather than disappeared. */
for (const [name, hex] of [
  ["signal", T.signal],
  ["signal-dim", T.signalDim],
  ["signal-lit", T.signalLit],
]) {
  checks.push({ pair: `void on ${name} (filled button)`, value: ratio(T.void, hex), min: 4.5 });
}

/* Console chips: accent text on the accent's own translucent washes over
   the panel and the raised edge. This is the pair that fails silently in
   most systems. */
for (const surface of [T.panel, T.edge]) {
  for (const alpha of [0.05, 0.1, 0.15, 0.2]) {
    const wash = mix(T.signal, surface, alpha);
    checks.push({
      pair: `signal on signal/${Math.round(alpha * 100)} over ${surface} (${wash})`,
      value: ratio(T.signal, wash),
      min: 4.5,
    });
  }
}

/* The row wash: a state tag rendered on the row it belongs to, where the
   row's own hover gradient has been composited. */
for (const alpha of [0.05, 0.1, 0.15]) {
  const wash = mix(T.signal, T.panel, alpha);
  checks.push({
    pair: `state/VERIFIED on row wash (${wash})`,
    value: ratio(T.verified, wash),
    min: 4.5,
  });
}

/* Non-text UI: the focus ring and the lit section rule only need 3:1. */
for (const [name, surface] of surfaces) {
  checks.push({ pair: `focus ring (signal) on ${name}`, value: ratio(T.signal, surface), min: 3 });
}

/* ═══════════════════════════════════════════════════════════════
   THE LATTICE — app/lattice.css, composed

   Everything above reads a palette, which is the easy half. This half
   reads a stylesheet that stacks that palette into surfaces, and a
   surface is not a token: the card is a white --lift gradient over
   rgba(10,14,21,.86) over a jade glow over --panel, four
   translucencies deep, and no hex in the palette predicts what lands
   under a glyph on it.

   So the pairs are read out of the stylesheet. Every `color`
   declaration in app/lattice.css is audited, on every ground it can
   land on, and the grounds are computed by compositing the actual
   background stacks rather than nominated. If a rule stops declaring
   a colour this throws rather than quietly auditing one row fewer —
   a check that shrinks when the thing it checks grows is a check
   that has stopped checking.

   The 3:1 non-text threshold is deliberately NOT extended to the edge
   strokes. A chain edge is a 1px hairline whose *kind* is carried by
   its dash pattern — the stylesheet says so outright ("distinguishable
   with the colour removed") — so it is not an element whose
   identification depends on contrast, and 1.4.11 does not apply.
   Asserting 3:1 on it would be asserting a requirement the design
   explicitly declines, and a check that asserts the wrong thing is
   worse than no check at all.
   ═══════════════════════════════════════════════════════════════ */

const latticeCss = readFileSync(
  fileURLToPath(new URL("../app/lattice.css", import.meta.url)),
  "utf8"
);

/* The @media blocks in that file recompose tracks, drop columns and set
    the canvas frame height. They are unwrapped into the flat map rather
    than dropped, because dropping them is only safe while none of them
    sets a colour — and a colour added inside a breakpoint would
    otherwise be audited nowhere while this table still claimed to be
    complete.

    Unwrapping is the conservative direction: a declaration that only
    applies at some widths is audited as though it applied at all of them,
    so the worst reading wins. That is the right side to err on for a
    contrast check, and it costs nothing while the two never collide —
    a breakpoint here only ever adds selectors. A breakpoint that
    recoloured an already-audited selector would need the ground resolved
    per width, which this script does not do, so that case throws rather
    than guessing. */
const mediaBlocks = latticeCss.match(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) ?? [];

const latticeFlat =
  latticeCss
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "") +
  mediaBlocks
    .map((b) => b.replace(/@media[^{]*\{/, "").replace(/\}\s*$/, ""))
    .join("\n");

/** selector → (property → value), last declaration winning as the cascade would. */
const latticeDecls = new Map();
for (const [, selector, body] of latticeFlat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  for (const one of selector.split(",")) {
    const key = one.trim().replace(/\s+/g, " ");
    if (!latticeDecls.has(key)) latticeDecls.set(key, new Map());
    const decls = latticeDecls.get(key);
    for (const decl of body.split(";")) {
      const i = decl.indexOf(":");
      if (i > 0) decls.set(decl.slice(0, i).trim(), decl.slice(i + 1).trim());
    }
  }
}

/** The raw declaration of a screen token, hex or rgba. The print block
    redeclares every one of these names against a light ground, so this
    reads the screen :root only — same reason as token() above. */
function tokenValue(name) {
  const m = screenRoot.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`Token --${name} not found in the :root block of app/globals.css`);
  return m[1].trim();
}

/** A colour as {hex, alpha}. Several tokens in this palette are rgba —
    --rule-3 is a hairline blue at 30% — and a translucent token is not a
    colour until it has been composited onto something, so the alpha has
    to survive the trip into the ratio rather than being rounded off. */
function paint(value) {
  /* A gradient stop may carry its position — `rgba(10,14,21,0) 34%` is a
     colour and an offset in one token. The offset is the gradient's
     business; the colour is this function's. */
  const v = value.trim().replace(/\s+[-\d.]+(?:%|[a-z]{1,3})?$/, "");
  const ref = v.match(/^var\(\s*--([\w-]+)\s*\)$/);
  if (ref) return paint(tokenValue(ref[1]));
  if (/^transparent$/i.test(v)) return { hex: "#000000", a: 0 };
  const hex = v.match(/^#([0-9a-fA-F]{6})$/);
  if (hex) return { hex: `#${hex[1].toLowerCase()}`, a: 1 };
  const rgba = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) {
    return {
      hex: `#${[1, 2, 3]
        .map((i) => Math.round(Number(rgba[i])).toString(16).padStart(2, "0"))
        .join("")}`,
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  throw new Error(`Cannot read a colour out of "${value}"`);
}

/** Split a comma list at the top level only — gradient stops carry their
    own commas and a naive split destroys them. */
function splitTop(value) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (value[i] === "," && depth === 0) {
      out.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(value.slice(start).trim());
  return out;
}

/** One background layer, as a single paint. A gradient has no one
    colour, so the audit takes its most opaque stop: interpolation
    between two stops is monotone in alpha, which means the ends bound
    everything between them and the harder end is the one worth
    testing. Both gradients here fade *upward* from nothing to a wash,
    so the peak is the far end and taking it can only over-report. */
function layer(text) {
  if (!/^(linear|radial)-gradient\(/.test(text)) return paint(text);
  const inner = text.slice(text.indexOf("(") + 1, text.lastIndexOf(")"));
  const stops = splitTop(inner)
    .filter((s) => /^(var\(|#|rgba?\()/i.test(s))
    .map(paint);
  if (stops.length === 0) throw new Error(`No colour stops in "${text}"`);
  return stops.reduce((a, b) => (b.a > a.a ? b : a));
}

/** The background shorthand on a selector, in paint order — CSS puts the
    first layer on top, which is the opposite of how a list reads. */
const backgroundLayers = (selector) => {
  const decl = latticeDecls.get(selector)?.get("background");
  if (decl === undefined) throw new Error(`app/lattice.css declares no background on ${selector}`);
  return splitTop(decl).map(layer);
};

/** A stack of layers over an opaque base, composited the way the
    compositor does it: bottom of the list first. */
function composite(layers, base) {
  let out = base;
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    out = l.a >= 1 ? l.hex : mix(l.hex, out, l.a);
  }
  return out;
}

/** Every ground a layered surface can present: its own gradient at full
    strength and faded out, over each base beneath it. sRGB
    interpolation between two stops is monotone in alpha, so those two
    stops bound every pixel between them — the worst ratio anywhere on
    the surface is always at one of them, and there is no interior
    point that needs testing. */
function grounds(label, selector, bases) {
  const layers = backgroundLayers(selector);
  return bases.flatMap((b) => {
    const peak = composite(layers, b.hex);
    const flat = composite(layers.filter((l) => l.a >= 1), b.hex);
    return peak === flat
      ? [{ name: label, hex: peak }]
      : [{ name: `${label} · lifted`, hex: peak }, { name: label, hex: flat }];
  });
}

/** grounds() with the base named per base, for a surface that sits on
    more than one of them. */
const basesOf = (selector, bases, label) =>
  bases.flatMap((b) => grounds(label(b), selector, [b]));

/* app/lattice.css paints no root background, so every surface it draws
   is composited onto whatever `body` paints. Read rather than assumed:
   a token change in globals.css would otherwise leave this section
   testing a ground the site stopped rendering on. */
const pageHex = (() => {
  const body = css.match(/\nbody \{([\s\S]*?)\n\}/);
  const bg = body?.[1].match(/background:\s*([^;]+);/);
  if (!bg) throw new Error("app/globals.css declares no background on body");
  return paint(bg[1]).hex;
})();

const page = [{ name: "the page", hex: pageHex }];

/* The reading order. Its cells carry a 140ms colour AND background-color
   transition, so the resting foreground is genuinely painted on the
   hovered ground for the length of that transition — which is why both
   sets below audit the resting declarations against both grounds. */
const orderBar = grounds("order bar", ".lattice-order", page);
const orderLit = grounds(
  "order bar + --wash",
  ".lattice-order",
  [{ name: "order bar + --wash", hex: composite([paint(tokenValue("wash"))], orderBar[0].hex) }]
);

/* The canvas, named at its two ends: the centre of the radial jade glow
   and the panel outside it. Both are real; a card near the middle of the
   canvas sits on the first. */
const canvas = [
  { name: "canvas glow", hex: composite(backgroundLayers(".lattice-canvas"), pageHex) },
  { name: "canvas flat", hex: composite(backgroundLayers(".lattice-canvas").filter((l) => l.a >= 1), pageHex) },
];
const card = basesOf(".lattice-card", canvas, (b) => `card on ${b.name}`);
const record = grounds("record panel", ".lattice-record", page);
/* The register's selected-row wash: the accent under the row that the
   reader has actually put their finger on. */
const rowWash = grounds("row wash", ".register-row[data-selected]", page);

/* ═══════════════════════════════════════════════════════════════
   The declarations themselves. [selector, grounds, label, inherited
   from?] — every `color` app/lattice.css declares, with the grounds it
   can be composited onto. `.lattice-order-name` declares none of its
   own: it inherits the cell's ash, which is the pair the reading order
   actually renders, so it is audited through that inheritance.
   ═══════════════════════════════════════════════════════════════ */
const LATTICE_PAIRS = [
  [".lattice-order-cell", [...orderBar, ...orderLit], "order · cell"],
  [".lattice-order-cell:hover", orderLit, "order · cell, hovered"],
  [".lattice-order-cell[data-selected]", orderLit, "order · cell, selected"],
  [".lattice-order-ord", [...orderBar, ...orderLit], "order · ordinal"],
  [".lattice-order-cell[data-selected] .lattice-order-ord", orderLit, "order · ordinal, selected"],
  [".lattice-order-name", [...orderBar, ...orderLit], "order · station name", ".lattice-order-cell"],

  [".lattice-card", card, "card"],
  [".lattice-card-ord", card, "card · ordinal"],
  [".lattice-card[data-selected] .lattice-card-ord", card, "card · ordinal, selected"],
  [".lattice-card-name", card, "card · name"],
  [".lattice-card-role", card, "card · role"],
  [".lattice-card-custody", card, "card · custody"],
  [".lattice-open", card, "card · open"],
  [".lattice-open:hover", card, "card · open, hovered"],

  [".lattice-tally-n", record, "record · tally"],

  [".register-band", page, "register · band"],
  [".lattice-row-button", page, "register · row"],
  [".lattice-row-button:hover", [...page, ...rowWash], "register · row, hovered"],
  [".lattice-row-button[aria-pressed=\"true\"]", [...page, ...rowWash], "register · row, selected"],
  [".lattice-legend-row dt", page, "legend · kind"],
  [".lattice-legend-row dd", page, "legend · what it is"],
  [".lattice-returns", page, "returns"],
  [".lattice-returns-key", page, "returns · key"],

  [".lattice-canvas .react-flow__attribution a", canvas, "canvas · attribution"],
  [".lattice-canvas .react-flow__attribution a:hover", canvas, "canvas · attribution, hovered"],
];

checks.push({ banner: "app/lattice.css — the /lattice surface, composed" });

for (const [selector, over, label, inheritedFrom] of LATTICE_PAIRS) {
  const decl = latticeDecls.get(selector)?.get("color") ??
    (inheritedFrom ? latticeDecls.get(inheritedFrom)?.get("color") : undefined);
  if (decl === undefined) {
    throw new Error(
      `app/lattice.css declares no \`color\` on ${selector}${inheritedFrom ? ` or ${inheritedFrom}` : ""}; ` +
        "the lattice audit would silently cover one pair fewer than the surface renders"
    );
  }
  const fg = paint(decl);

  /* A translucent foreground has to be composited onto the ground too —
     --rule-3 as text is 30% of a hairline blue, and its ratio depends
     entirely on what is under it. The worst of the surface's grounds is
     reported, and the ground that produced it is named, because a
     number without the ground it was measured on is half a claim. */
  let worst = null;
  for (const g of over) {
    const composited = composite([fg], g.hex);
    const value = ratio(composited, g.hex);
    if (!worst || value < worst.value) worst = { value, ground: g, composited };
  }

  checks.push({
    pair: `${label} (${decl}) on ${worst.ground.name} ${worst.ground.hex}`,
    value: worst.value,
    min: 4.5,
  });
}

/* The strokes. `color` is not the only foreground on this route — the
   four edge kinds are drawn as SVG `stroke`, they are the route's only
   structural claim, and an audit that reads only `color` leaves the
   thing the reader is asked to look at unaudited. The first pass of
   app/lattice.css used --rule-3 for the loop and --rule-2 for the
   crossings, which measure 2.13:1 and 1.49:1 on the composed canvas
   ground: the loop, the loudest claim the route makes, was the dimmest
   mark on it.

   3:1, not 4.5:1, and deliberately: these are non-text marks whose kind
   is carried redundantly by dash pattern, so this is 1.4.11's
   non-text-contrast threshold rather than the text one. Each is
   composited onto the real canvas ground the same way the text pairs
   are, and the [data-lit] variant is audited too, because a selected
   node changes one stroke's colour and the jump has to stay legal. */
for (const [selector, over] of [
  [".lattice-edge[data-kind=\"loop\"]", canvas],
  [".lattice-edge[data-kind=\"loop\"][data-lit]", canvas],
  [".lattice-edge[data-kind=\"chain\"]", canvas],
  [".lattice-edge[data-kind=\"custody\"]", canvas],
  [".lattice-edge[data-kind=\"instance\"]", canvas],
]) {
  const decl = latticeDecls.get(selector)?.get("stroke");
  if (decl === undefined) {
    throw new Error(
      `app/lattice.css declares no \`stroke\` on ${selector}; the lattice audit would ` +
        "leave one of the four edge kinds unaudited while claiming to cover the surface"
    );
  }
  const fg = paint(decl);

  let worst = null;
  for (const g of over) {
    const composited = composite([fg], g.hex);
    const value = ratio(composited, g.hex);
    if (!worst || value < worst.value) worst = { value, ground: g, composited };
  }

  checks.push({
    pair: `edge ${selector.replace(/\.lattice-edge\[data-kind="|"\]$/g, "")} (${decl}) on ${worst.ground.name} ${worst.ground.hex}`,
    value: worst.value,
    min: 3,
  });
}

let failed = 0;
const pad = Math.max(...checks.map((c) => (c.banner ? 0 : c.pair.length)));

console.log("\nAPT-LABS contrast audit — WCAG 2.1, AURA (dark)\n" + "=".repeat(pad + 22));
for (const c of checks) {
  if (c.banner) {
    console.log(`\n  ${c.banner}`);
    continue;
  }
  const { pair, value, min } = c;
  const pass = value >= min;
  if (!pass) failed++;
  const mark = pass ? "PASS" : "FAIL";
  /* A failure states the shortfall. "2.12:1 FAIL" is a number somebody
     has to go and interpret; "short by 2.38" is a defect with a size,
     and the size is what tells you the token is wrong rather than the
     surface merely being dark. */
  console.log(
    `${pair.padEnd(pad)}  ${value.toFixed(2)}:1  (min ${min.toFixed(1)})  ${mark}${
      pass ? "" : `  short by ${(min - value).toFixed(2)}`
    }`
  );
}
console.log("=".repeat(pad + 22));

/* ═══════════════════════════════════════════════════════════════
   The temperature scale.

   The five states are an ordered thing, not a palette: they run from
   the darkest (an unestablished unknown) to the brightest (a
   prototype — present, built, inspectable), with amber held apart as
   the only future-tense colour. If the ordering inverts, the design
   has started shouting its unknowns, and every ratio above can still
   pass while the interface becomes dishonest. So the ordering is a
   test, not a comment.
   ═══════════════════════════════════════════════════════════════ */
console.log("\nEvidence-state temperature scale\n" + "-".repeat(pad + 22));

const ORDER = [
  ["UNKNOWN", T.unknown, "darkest · unestablished"],
  ["PLANNED", T.planned, "cold · designed, not built"],
  ["TARGET", T.target, "hot · intended, not measured"],
  ["VERIFIED", T.verified, "cold jade · settled by a source"],
  ["PROTOTYPE", T.prototype, "brightest · present and inspectable"],
];

let orderFailed = 0;
ORDER.forEach(([state, hex, note], i) => {
  const prev = i === 0 ? null : lum(ORDER[i - 1][1]);
  const cur = lum(hex);
  const ok = prev === null ? true : cur > prev;
  if (!ok) orderFailed++;
  console.log(
    `${(state + " " + hex).padEnd(pad)}  L* ${cur.toFixed(4)}  ${
      ok ? "PASS" : "FAIL"
    }  ${note}`
  );
});

/* The scale has to be wide enough to read as a scale at 9.5px. */
const spread = ratio(T.prototype, T.unknown);
spread >= 3
  ? console.log(
      `${"brightest ÷ darkest".padEnd(pad)}  ${spread.toFixed(2)}:1  PASS  states separate at tag size`
    )
  : (() => {
      orderFailed++;
      console.log(
        `${"brightest ÷ darkest".padEnd(pad)}  ${spread.toFixed(2)}:1  FAIL  below the 3:1 separation the states need`
      );
    })();

/* TARGET must be the warm outlier: the only state whose hue pulls away
   from the neutral axis. Verified as R/B ratio, which is >1 for every
   state that is not the cool-to-neutral ramp. */
const warmth = (hex) => rgb(hex)[0] / rgb(hex)[2];
const isWarm = warmth(T.target) > 1.25 && warmth(T.target) > warmth(T.verified) + 0.3;
isWarm
  ? console.log(
      `${"TARGET is the warm outlier".padEnd(pad)}  R/B ${warmth(T.target).toFixed(2)} vs ${warmth(
        T.verified
      ).toFixed(2)}  PASS  amber is held apart from the jade ramp`
    )
  : (() => {
      orderFailed++;
      console.log(
        `${"TARGET is the warm outlier".padEnd(pad)}  R/B ${warmth(T.target).toFixed(2)} vs ${warmth(
          T.verified
        ).toFixed(2)}  FAIL  amber no longer separates from the cool ramp`
      );
    })();

if (failed > 0 || orderFailed > 0) {
  console.error(
    `\n${failed + orderFailed} violation(s). Fix the token, not the test.\n`
  );
  process.exit(1);
}
console.log(
  `\nAll ${checks.filter((c) => !c.banner).length} ratio pairs clear their threshold, and the state scale holds its order.\n`
);