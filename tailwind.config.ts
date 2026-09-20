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
        //    --ink on --void: 16.8:1 (AAA). --dust on --void: 4.6:1 (AA/AAA).
        ink:    "#F2EFE9",
        dust:   "#8A8580",
        ash:    "#5C5854",

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
        dim:      "#5C5854",      // → ash
        teal:     "#14B8A6",      // → signal
        panelHi:  "#141416",      // → edge
        edgeHi:   "#1F1F22",      // → rule
      },
      fontFamily: {
        // System font stack — no network requests. Works offline.
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
        serif: [
          "Iowan Old Style", "Apple Garamond", "Baskerville",
          "Palatino Linotype", "Times New Roman", "Georgia", "serif"
        ],
        mono: [
          "ui-monospace", "SF Mono", "Cascadia Code", "Roboto Mono",
          "Menlo", "Consolas", "Liberation Mono", "monospace"
        ],
        // Legacy alias — console components predate this system.
        display: [
          "Iowan Old Style", "Apple Garamond", "Baskerville",
          "Palatino Linotype", "Times New Roman", "Georgia", "serif"
        ],
        body: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
      },
      // ── 8px grid. No Fibonacci. No 13px. Predictable.
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

