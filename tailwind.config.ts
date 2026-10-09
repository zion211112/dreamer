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
        accentGlow: tokens.color.accentGlow,
        evidence: {
          VERIFIED: tokens.color.evidence.VERIFIED,
          PROTOTYPE: tokens.color.evidence.PROTOTYPE,
          TARGET: tokens.color.evidence.TARGET,
          PLANNED: tokens.color.evidence.PLANNED,
          UNKNOWN: tokens.color.evidence.UNKNOWN,
        },
        evidenceText: tokens.color.evidenceText,
        semantic: tokens.color.semantic,
        surface: tokens.color.surface,
        signal: tokens.color.signal,
        gradient: tokens.color.gradient,
      },

      /* ───────────────── FONTS ───────────────── */
      fontFamily: {
        display: tokens.typography.display.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
        ui: tokens.typography.ui.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
        mono: tokens.typography.mono.fontFamily.split(", ").map(f => f.replace(/"/g, "")),
      },

      fontSize: {
        xs: [tokens.typography.scale.xs, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        sm: [tokens.typography.scale.sm, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        base: [tokens.typography.scale.base, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        lg: [tokens.typography.scale.lg, { lineHeight: String(tokens.typography.ui.lineHeight.relaxed), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        xl: [tokens.typography.scale.xl, { lineHeight: String(tokens.typography.ui.lineHeight.relaxed), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        "2xl": [tokens.typography.scale["2xl"], { lineHeight: String(tokens.typography.display.lineHeight.snug), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "3xl": [tokens.typography.scale["3xl"], { lineHeight: String(tokens.typography.display.lineHeight.snug), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "4xl": [tokens.typography.scale["4xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "5xl": [tokens.typography.scale["5xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "6xl": [tokens.typography.scale["6xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "7xl": [tokens.typography.scale["7xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "8xl": [tokens.typography.scale["8xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        "9xl": [tokens.typography.scale["9xl"], { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        // Semantic sizes
        hero: [tokens.typography.sizes.hero, { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        h1: [tokens.typography.sizes.h1, { lineHeight: String(tokens.typography.display.lineHeight.tight), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        h2: [tokens.typography.sizes.h2, { lineHeight: String(tokens.typography.display.lineHeight.snug), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        h3: [tokens.typography.sizes.h3, { lineHeight: String(tokens.typography.display.lineHeight.snug), letterSpacing: tokens.typography.display.letterSpacing.tight }],
        h4: [tokens.typography.sizes.h4, { lineHeight: String(tokens.typography.display.lineHeight.snug), letterSpacing: tokens.typography.display.letterSpacing.normal }],
        body: [tokens.typography.sizes.body, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        bodyLg: [tokens.typography.sizes.bodyLg, { lineHeight: String(tokens.typography.ui.lineHeight.relaxed), letterSpacing: tokens.typography.ui.letterSpacing.normal }],
        button: [tokens.typography.sizes.button, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.wide }],
        label: [tokens.typography.sizes.label, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.wide }],
        caption: [tokens.typography.sizes.caption, { lineHeight: String(tokens.typography.ui.lineHeight.normal), letterSpacing: tokens.typography.ui.letterSpacing.wide }],
        mono: [tokens.typography.sizes.mono, { lineHeight: String(tokens.typography.mono.lineHeight), letterSpacing: tokens.typography.mono.letterSpacing }],
        monoSm: [tokens.typography.sizes.monoSm, { lineHeight: String(tokens.typography.mono.lineHeight), letterSpacing: tokens.typography.mono.letterSpacing }],
      },

      lineHeight: {
        tight: String(tokens.typography.display.lineHeight.tight),
        snug: String(tokens.typography.display.lineHeight.snug),
        normal: String(tokens.typography.ui.lineHeight.normal),
        relaxed: String(tokens.typography.ui.lineHeight.relaxed),
        mono: String(tokens.typography.mono.lineHeight),
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
        "container-3xl": tokens.sizing.container["3xl"],
        prose: tokens.sizing.prose,
        narrow: tokens.sizing.narrow,
        wide: tokens.sizing.wide,
      },

      /* ───────────────── BORDER RADIUS ───────────────── */
      borderRadius: Object.fromEntries(
        Object.entries(tokens.radius).map(([key, value]) => [key, `${value}`])
      ),

      /* ───────────────── SHADOWS ───────────────── */
      boxShadow: Object.fromEntries(
        Object.entries(tokens.shadow).map(([key, value]) => [key, `${value}`])
      ),

      /* ───────────────── TRANSITIONS ───────────────── */
      transitionDuration: {
        instant: tokens.transition.instant,
        fast: tokens.transition.fast,
        base: tokens.transition.base,
        slow: tokens.transition.slow,
        slower: tokens.transition.slower,
        spring: tokens.transition.spring,
        reduced: tokens.transition.reduced,
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ───────────────── Z-INDEX ───────────────── */
      zIndex: Object.fromEntries(
        Object.entries(tokens.zIndex).map(([key, value]) => [key, `${value}`])
      ),

      /* ───────────────── BREAKPOINTS ───────────────── */
      screens: {
        xs: tokens.breakpoint.xs,
        sm: tokens.breakpoint.sm,
        md: tokens.breakpoint.md,
        lg: tokens.breakpoint.lg,
        xl: tokens.breakpoint.xl,
        "2xl": tokens.breakpoint["2xl"],
        "3xl": tokens.breakpoint["3xl"],
      },

      /* ───────────────── OPACITY ───────────────── */
      opacity: tokens.opacity,

      /* ───────────────── BLUR ───────────────── */
      backdropBlur: tokens.blur,
      blur: tokens.blur,

      /* ───────────────── BACKGROUND IMAGES ───────────────── */
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-mesh": tokens.color.gradient.heroMesh,
        "card-hover": tokens.color.gradient.cardHover,
        "btn-primary": tokens.color.gradient.btnPrimary,
        "btn-secondary": tokens.color.gradient.btnSecondary,
        "text-brand": tokens.color.gradient.textBrand,
        "text-muted": tokens.color.gradient.textMuted,
        grain: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      },

      /* ───────────────── ANIMATION ───────────────── */
      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-out": "fadeOut 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-down": "slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-left": "slideLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-right": "slideRight 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-out": "scaleOut 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "spin-slow": "spin 3s linear infinite",
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeOut: { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideLeft: { "0%": { opacity: "0", transform: "translateX(10px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideRight: { "0%": { opacity: "0", transform: "translateX(-10px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        scaleOut: { "0%": { opacity: "1", transform: "scale(1)" }, "100%": { opacity: "0", transform: "scale(0.95)" } },
        bounceSubtle: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        gradientShift: { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
      },
    },
  },
  plugins: [],
};

export default config;