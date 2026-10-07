import type { Config } from "tailwindcss";
import { tokens } from "./lib/design-tokens";

/**
 * Tailwind config extending design tokens — Masterpiece Commercial Surface
 * All custom values reference the token system in lib/design-tokens.ts
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ───────────────── COLORS ───────────────── */
      colors: {
        neutral: tokens.color.neutral,
        accent: tokens.color.accent,
        evidence: {
          VERIFIED: tokens.color.evidence.VERIFIED,
          PROTOTYPE: tokens.color.evidence.PROTOTYPE,
          TARGET: tokens.color.evidence.TARGET,
          PLANNED: tokens.color.evidence.PLANNED,
          UNKNOWN: tokens.color.evidence.UNKNOWN,
        },
        surface: tokens.color.surface,
        semantic: tokens.color.semantic,
      },

      /* ───────────────── FONTS ───────────────── */
      fontFamily: {
        display: tokens.typography.display.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
        ui: tokens.typography.ui.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
        mono: tokens.typography.mono.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
      },

      fontSize: {
        xs: [tokens.typography.scale.xs, { lineHeight: tokens.typography.ui.lineHeight.normal, letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        sm: [tokens.typography.scale.sm, { lineHeight: tokens.typography.ui.lineHeight.normal, letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        base: [tokens.typography.scale.base, { lineHeight: tokens.typography.ui.lineHeight.normal, letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        lg: [tokens.typography.scale.lg, { lineHeight: tokens.typography.ui.lineHeight.relaxed, letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        xl: [tokens.typography.scale.xl, { lineHeight: tokens.typography.ui.lineHeight.relaxed, letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        "2xl": [tokens.typography.scale["2xl"], { lineHeight: tokens.typography.display.lineHeight.snug, letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "3xl": [tokens.typography.scale["3xl"], { lineHeight: tokens.typography.display.lineHeight.snug, letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "4xl": [tokens.typography.scale["4xl"], { lineHeight: tokens.typography.display.lineHeight.tight, letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "5xl": [tokens.typography.scale["5xl"], { lineHeight: tokens.typography.display.lineHeight.tight, letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "6xl": [tokens.typography.scale["6xl"], { lineHeight: tokens.typography.display.lineHeight.tight, letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "7xl": [tokens.typography.scale["7xl"], { lineHeight: tokens.typography.display.lineHeight.tight, letterSpacing: tokens.typography.display.letterSpacing.tight }],
      },

      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      lineHeight: {
        tight: tokens.typography.display.lineHeight.tight,
        snug: tokens.typography.display.lineHeight.snug,
        normal: tokens.typography.ui.lineHeight.normal,
        relaxed: tokens.typography.ui.lineHeight.relaxed,
        mono: tokens.typography.mono.lineHeight,
      },

      letterSpacing: {
        tight: tokens.typography.display.letterSpacing.tight,
        normal: tokens.typography.ui.letterSpacing.normal,
        wide: tokens.typography.ui.letterSpacing.wide,
        mono: tokens.typography.mono.letterSpacing,
      },

      /* ───────────────── SPACING ───────────────── */
      spacing: tokens.spacing,

      /* ───────────────── SIZING ───────────────── */
      maxWidth: {
        container: tokens.sizing.container.xl,
        "container-2xl": tokens.sizing.container["2xl"],
        prose: tokens.sizing.prose,
        narrow: tokens.sizing.narrow,
      },

      /* ───────────────── BORDER RADIUS ───────────────── */
      borderRadius: tokens.radius,

      /* ───────────────── SHADOWS ───────────────── */
      boxShadow: tokens.shadow,

      /* ───────────────── TRANSITIONS ───────────────── */
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      /* ───────────────── Z-INDEX ───────────────── */
      zIndex: tokens.zIndex,

      /* ───────────────── BREAKPOINTS ───────────────── */
      screens: {
        sm: tokens.breakpoint.sm,
        md: tokens.breakpoint.md,
        lg: tokens.breakpoint.lg,
        xl: tokens.breakpoint.xl,
        "2xl": tokens.breakpoint["2xl"],
      },

      /* ───────────────── CUSTOM UTILITIES ───────────────── */
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        grain: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      },
    },
  },
  plugins: [],
};

export default config;