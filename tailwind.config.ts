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
        panel: "#141417",
        ink: "#111310",
        ivory: "#F2EDE0",
        muted: "#9CA3AF",
        paper: "#FFFFFF",
        cream: "#FAF7F0",
        river: "#0E7C5B",
        gold: "#D4A017"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      spacing: {
        phi: "1.618rem",
        philg: "2.618rem",
        phixl: "4.236rem"
      }
    }
  },
  plugins: []
};

export default config;
