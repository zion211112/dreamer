/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // ── The four-colour system. Everything on the site resolves to one of
        // these. Neutrals are ivory at opacity — never a separate hue.
        obsidian: "#08080A",
        void: "#050506",
        panel: "#0E0E10",
        edge: "#1A1A1C",
        panelHi: "#141416",
        edgeHi: "#2A2A2E",

        ivory: "#F5F0E6",
        // ivory at reading-distance dimming — neutrals, never a new hue.
        muted: "#A8A29E",
        dim: "#57534E",

        // The two accents. Teal is the living accent (focus, active, passage,
        // growth). Amber is the warm accent (attention, highlight, secondary
        // marks, the older-world warmth of the ledger).
        teal: "#2dd4bf",
        amber: "#d4af37",
        copper: "#b8785d",
        moss: "#91a58f"
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"]
      },
      spacing: {
        phi: "1.618rem",
        philg: "2.618rem",
        phixl: "4.236rem",
        fb1: "8px",
        fb2: "13px",
        fb3: "21px",
        fb4: "34px",
        fb5: "55px",
        fb6: "89px"
      }
    }
  },
  plugins: []
};

export default config;
