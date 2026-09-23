/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces — deepest to raised.
        //    Never use these for text. Text uses --ink / --dust.
        void:   "#060708",
        panel:  "#0C0D0F",
        edge:   "#141416",
        rule:   "#1F1F22",

        // ── Text — primary and secondary.
        //    --ink on --void: 17.6:1 · --dust: 5.52:1 · --ash: 5.10:1 — all AAA/AA.
        //    Measured via the contrast harness in DESIGN-AUDIT.md §10.
        ink:    "#F2EFE9",
        dust:   "#8A8580",
        ash:    "#857F7A",
        // ── Accent — ONE interactive color.
        //    Reserved strictly for high-intent triggers: primary buttons, links,
        //    focus rings, active nav. Not decorative. Not passive text.
        signal:      "#14B8A6",
        signalDim:   "#0D9488",
        signalStrong:"#0F766E",

        // ── Informational — never interactive.
        amber:  "#D97706",
        danger: "#EF4444",

        // ── Legacy aliases (console components predate this system).
        //    Each maps to its new-token value so existing class names keep
        //    rendering. Migrate components to the canonical names above.
        obsidian: "#060708",      // → void
        ivory:    "#F2EFE9",      // → ink
        muted:    "#8A8580",      // → dust
        dim:      "#857F7A",      // → ash
        teal:     "#14B8A6",      // → signal
        panelHi:  "#141416",      // → edge
        edgeHi:   "#1F1F22",      // → rule
      },
      fontFamily: {
        // Google Fonts with system fallbacks — Mirror.xyz editorial + Linear instrument.
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
        serif: [
          "Playfair Display", "Iowan Old Style", "Apple Garamond", "Baskerville",
          "Palatino Linotype", "Times New Roman", "Georgia", "serif"
        ],
        mono: [
          "JetBrains Mono", "ui-monospace", "SF Mono", "Cascadia Code", "Roboto Mono",
          "Menlo", "Consolas", "Liberation Mono", "monospace"
        ],
        display: [
          "Playfair Display", "Iowan Old Style", "Apple Garamond", "Baskerville",
          "Palatino Linotype", "Times New Roman", "Georgia", "serif"
        ],
        body: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
      },
      // ── Type scale. The only sizes that exist.
      //    Line heights ride along with each token so call sites cannot drift.
      //    micro/label/meta/ui carry the instrument register (mono, tracked);
      //    body carries prose. Nothing arbitrary, nothing between steps.
      fontSize: {
        micro: ["10px", { lineHeight: "1.5", letterSpacing: "0.08em" }],
        label: ["11px", { lineHeight: "1.5", letterSpacing: "0.18em" }],
        meta:  ["12px", { lineHeight: "1.5" }],
        ui:    ["13px", { lineHeight: "1.55" }],
        body:  ["15px", { lineHeight: "1.6" }],
        lead:  ["17px", { lineHeight: "1.6" }],
        h3:    ["20px", { lineHeight: "1.25" }],
        h2:    ["26px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h1:    ["34px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      // ── 8px grid. No Fibonacci. Predictable.
      spacing: {
        "4.5":  "18px",   // occasional micro-need
      },
      borderRadius: {
        "sm":  "4px",
        "md":  "6px",
        "lg":  "8px",
      },
    },
  },
  plugins: [],
};

export default config;

