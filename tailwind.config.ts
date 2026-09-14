/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#08080A",
        void: "#0a0a0a",
        panel: "#141414",
        edge: "#262626",
        panelHi: "#1a1a1a",
        edgeHi: "#404040",
        ink: "#111310",
        ivory: "#F5F0E6",
        cream: "#F5F0E6",
        muted: "#A8A29E",
        dim: "#57534E",
        paper: "#FFFFFF",
        river: "#0E7C5B",
        forest: "#1a3c2a",
        earth: "#8b3a2f",
        royal: "#6B4226",
        gold: "#d4af37"
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
