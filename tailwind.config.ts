/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111310",
        muted: "#6B7280",
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
        // φ-scaled whitespace: 1, 1.618, 2.618
        phi: "1.618rem",
        philg: "2.618rem",
        phixl: "4.236rem"
      }
    }
  },
  plugins: []
};

export default config;
