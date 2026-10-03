/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════
      // These must stay identical to the :root block in app/globals.css.
      // Tailwind and the stylesheets are one system with two entry
      // points; if these drift, the console and the public site become
      // different products. Ground is warm paper, not a cockpit.
      // ═══════════════════════════════════════════════════════════════
      colors: {
        // ── Surfaces — deepest to raised. Never use for text.
        void:   "#f6f6f4",
        panel:  "#ffffff",
        edge:   "#f0f0ed",
        rule:   "#e6e6e2",

        // ── Text — primary to tertiary.
        //    On --void #f6f6f4: ink 16.5:1 · dust 9.6:1 · ash 5.0:1 ·
        //    quiet 4.9:1 — every tier clears AA for its size, and the
        //    9-10px instrument tiers are held to 4.5:1, not 3:1.
        ink:    "#14181c",
        dust:   "#39414a",
        ash:    "#626b74",
        quiet:  "#646c77",

        // ── Accent — ONE interactive colour, matching --signal.
        //    Reserved for high-intent triggers: primary buttons, links,
        //    focus rings, active nav. Never decorative, never passive.
        signal:       "#0e8f5e",
        signalDim:    "#0a6e48",
        signalStrong: "#085537", // filled buttons: white ink clears 8.9:1

        // ── Informational — never interactive.
        amber:  "#9a6b12",
        danger: "#b23a2e",
      },
      fontFamily: {
        // Only the three self-hosted families in app/fonts.css. A serif and a
        // second mono were declared here for years and shipped as real files,
        // but no rule referenced them, so they were retired with the serif
        // register rather than left declared and unused.
        sans: [
          "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
        body: [
          "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "Noto Sans", "system-ui", "sans-serif"
        ],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: [
          "DM Mono", "ui-monospace", "SF Mono", "Cascadia Code", "Menlo",
          "Consolas", "Liberation Mono", "monospace"
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
        "4.5": "18px", // occasional micro-need
      },
      // One radius register. The public stylesheets use 2px everywhere;
      // a four-step scale is how a console ends up reading rounder than
      // the site that contains it. Circles are explicit: rounded-full.
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
    },
  },
  plugins: [],
};

export default config;