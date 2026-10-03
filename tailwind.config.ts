import type { Config } from "tailwindcss";

// APT-LABS — AURA. One design system, two surfaces.
//
// Every value below is a `var()` reference into the :root block of
// app/globals.css. That file is the single source of truth; this one
// decides nothing. If a number needs to change it changes there, once,
// and both the console and the public site move together — which is the
// whole point, because a console that drifts from the site containing it
// reads as a different company.
//
// The contract assigns four grammars on one dark ground:
//   CONTROL PLANE — navigation (the site skeleton)
//   REGISTER      — evidence (ruled rows, provenance, ids)
//   FIELD STATION — uncertainty (status bands, tallies, empty states)
//   VALUE CHAIN   — transformation (the OBSERVE→MEASURE primitive)
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════
      // THE GROUND IS DARK, and light is what a claim has to earn.
      //
      // Surfaces are near-black and slightly blue, so they read as
      // depth rather than as an off state. Never use a surface for
      // text.
      // ═══════════════════════════════════════════════════════════
      colors: {
        // ── Surfaces — deepest to raised.
        void: "var(--void)", // #04060a
        panel: "var(--panel)", // #0a0e15
        edge: "var(--edge)", // #0f151d

        // ── Text — primary to tertiary.
        //    Measured on --void: ink 17.9 · dust 11.1 · ash 6.6
        //    quiet 5.6. Every tier clears AA at its own size, so a
        //    9.5px mono tag can carry --quiet without a caveat.
        //    Ratios: scripts/check-contrast.mjs.
        ink: "var(--ink)",
        dust: "var(--dust)",
        ash: "var(--ash)",
        quiet: "var(--quiet)",

        // ── Accent — ONE interactive colour, matching --signal.
        //    Reserved for high-intent triggers and evidence states
        //    that have earned it. Never decorative, never passive.
        signal: "var(--signal)",
        signalDim: "var(--signal-dim)",
        signalLit: "var(--signal-lit)",

        // ── Informational — never interactive. Amber is the warm end
        //    of the temperature scale and carries TARGET only.
        amber: "var(--amber)",
        danger: "var(--danger)",

        // ── Hairline — the only material on this surface.
        rule: "var(--rule)",
      },
      fontFamily: {
        // Only the three self-hosted families in app/fonts.css.
        sans: [
          "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif",
        ],
        body: [
          "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif",
        ],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: [
          "DM Mono", "ui-monospace", "SF Mono", "Cascadia Code", "Menlo",
          "Consolas", "Liberation Mono", "monospace",
        ],
      },
      // ═══════════════════════════════════════════════════════════
      // THE SIZE LADDER — one constant, checked by a script.
      //
      // Every step is the previous step × 2^(1/4) from a 16px base.
      // Sizes and tracking are both read from :root, so the ladder
      // cannot be edited here into something that contradicts
      // app/globals.css or scripts/check-scale.mjs.
      //
      // Tracking is not a stylistic preference per step: it is
      // k·ln(size/16) with k = −0.0125em, because tracking is added
      // once per glyph and a constant em value cannot hold across a
      // 19× size range. micro/label/ui therefore carry positive
      // tracking and display carries negative tracking, from one rule.
      //
      // Line heights are set optically per step, not derived — leading
      // is a function of a size's ascender/descender relationship, not
      // of its distance from the next step. The two that must land on
      // the grid do: 16 × 1.5 = 24px body, and the 16px label line
      // box. Everything else is allowed to sit between grid lines,
      // which is what keeps a heading from opening a hole in the
      // rhythm it sits in.
      // ═══════════════════════════════════════════════════════════
      fontSize: {
        micro: ["var(--fs-micro)", { lineHeight: "16px", letterSpacing: "var(--ls-micro)" }],
        label: ["var(--fs-label)", { lineHeight: "16px", letterSpacing: "var(--ls-label)" }],
        ui: ["var(--fs-ui)", { lineHeight: "21px", letterSpacing: "var(--ls-ui)" }],
        meta: ["var(--fs-ui)", { lineHeight: "21px", letterSpacing: "var(--ls-ui)" }],
        body: ["var(--fs-body)", { lineHeight: "1.5", letterSpacing: "var(--ls-body)" }],
        lead: ["var(--fs-lead)", { lineHeight: "1.55", letterSpacing: "var(--ls-lead)" }],
        h3: ["var(--fs-h3)", { lineHeight: "1.2", letterSpacing: "var(--ls-h3)" }],
        h2: ["var(--fs-h2)", { lineHeight: "1.2", letterSpacing: "var(--ls-h2)" }],
        h1: ["var(--fs-h1)", { lineHeight: "1.15", letterSpacing: "var(--ls-h1)" }],
        figure: ["var(--fs-figure)", { lineHeight: "1.1", letterSpacing: "var(--ls-figure)" }],
        display: ["var(--fs-display)", { lineHeight: "1.02", letterSpacing: "var(--ls-display)" }],
        hero: ["var(--fs-hero)", { lineHeight: "0.92", letterSpacing: "var(--ls-hero)" }],
      },
      // Two tracking registers, because one curve cannot do both jobs.
      //
      // `caps` is the small-uppercase register: capitals have no
      // ascenders or descenders to interleave, so they need tracking
      // opened regardless of size — a job no value of k·ln(size) can
      // do. The console had accumulated its own hand-picked tracking
      // values for this single job, spread across ~90 class attributes
      // between 0.1em and 0.35em, which is that many ways for the two
      // surfaces to stop agreeing. They now share this one value; the
      // exact former count is not recorded because it cannot be
      // recovered from the tree afterwards, and a number written down
      // here would be an unverifiable claim.
      //
      // scripts/check-scale.mjs fails the build if a hard-coded
      // letter-spacing re-enters app/globals.css.
      letterSpacing: {
        caps: "var(--ls-caps)",
        micro: "var(--ls-micro)",
        label: "var(--ls-label)",
        ui: "var(--ls-ui)",
        body: "var(--ls-body)",
      },
      // ── Space: 8px, plus one declared half-unit of 4px for hairline
      //    adjacency. Verified by scripts/check-scale.mjs.
      spacing: {
        "4.5": "18px", // occasional micro-need
        13: "52px",
        18: "72px",
        22: "88px",
        30: "120px",
        38: "152px",
      },
      // One radius register. 2px everywhere; a four-step scale is how a
      // console ends up reading rounder than the site containing it.
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px",
      },
      boxShadow: {
        // Two shadows exist in this system and both are light, not
        // dark: the lit top edge of a raised surface, and the bloom
        // under a light source.
        lift: "inset 0 1px 0 var(--lift)",
        bloom: "0 56px 130px -80px rgba(53, 217, 164, 0.42)",
        "bloom-sm": "0 10px 34px -14px rgba(53, 217, 164, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;